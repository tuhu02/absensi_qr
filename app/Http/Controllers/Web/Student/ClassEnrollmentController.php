<?php

namespace App\Http\Controllers\Web\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceLog;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ClassEnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        $student = $request->user()?->student;
        abort_unless($student, 403);

        $courses = $student->courses()
            ->with(['lecturer.user:id,name', 'semester:id,name', 'studyProgram:id,name', 'classroom.location:id,name'])
            ->orderBy('courses.id')
            ->cursorPaginate(9)
            ->withQueryString();

        return Inertia::render('student/courses/index', [
            'courses' => $courses,
        ]);
    }

    public function allClasses(Request $request): Response
    {
        $request->validate([
            'q' => 'nullable|string|max:100',
        ]);

        $student = $request->user()?->student;
        abort_unless($student, 403);
        $query = trim((string) $request->input('q', ''));

        $enrolledCourseIds = $student->courses()->pluck('courses.id')->all();

        $coursesQuery = Course::query()
            ->with([
                'lecturer.user:id,name',
                'semester:id,name',
                'studyProgram:id,name',
                'classroom:id,name,building_id',
                'classroom.location:id,name',
            ])
            ->orderBy('id')->where('study_program_id', $student->study_program_id);

        if ($query !== '') {
            $coursesQuery->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('room', 'like', "%{$query}%")
                    ->orWhereHas('classroom', function ($q2) use ($query) {
                        $q2->where('name', 'like', "%{$query}%")
                            ->orWhereHas('location', function ($q3) use ($query) {
                                $q3->where('name', 'like', "%{$query}%");
                            });
                    })
                    ->orWhereHas('lecturer.user', function ($q2) use ($query) {
                        $q2->where('name', 'like', "%{$query}%");
                    });
            });
        }

        $courses = $coursesQuery
            ->cursorPaginate(9)
            ->withQueryString();

        return Inertia::render('student/all-courses/index', [
            'courses' => $courses,
            'q' => $query,
            'enrolledCourseIds' => $enrolledCourseIds,
        ]);
    }

    public function show(Request $request, Course $course): Response
    {
        $student = $request->user()?->student;

        $isEnrolled = $student->courses()
            ->where('courses.id', $course->id)
            ->exists();

        abort_unless($isEnrolled, 404);

        $course->load([
            'lecturer.user:id,name',
            'semester:id,name',
            'studyProgram:id,name',
            'classroom.location:id,name',
        ]);

        $meetings = $course->attendances()
            ->with(['logs' => function ($query) use ($student) {
                $query->where('student_id', $student->id);
            }])
            ->orderBy('date')
            ->get()
            ->map(function ($attendance) {
                $log = $attendance->logs->first();
                return [
                    'id' => $attendance->id,
                    'name' => $attendance->name,
                    'date' => $attendance->date,
                    'status' => $log?->status,
                    'logged_at' => $log?->updated_at,
                ];
            });

        return Inertia::render('student/courses/show', [
            'course' => $course,
            'meetings' => $meetings,
        ]);
    }

    public function enroll(Request $request, Course $course): RedirectResponse
    {
        $student = $request->user()?->student;

        $alreadyEnrolled = $student->courses()
            ->where('courses.id', $course->id)
            ->exists();

        if ($alreadyEnrolled) {
            return back()->with('error', 'Kamu sudah terdaftar di kelas ini.');
        }

        $hasConflict = $student->courses()
            ->where('day', $course->day)
            ->where(function ($query) use ($course) {
                $query->where('start_time', '<', $course->end_time)
                    ->where('end_time', '>', $course->start_time);
            })
            ->exists();

        if ($hasConflict) {
            return back()->with('error', 'Jadwal kelas bentrok dengan kelas lain yang sudah didaftarkan.');
        }

        $student->courses()->syncWithoutDetaching([$course->id]);

        return back()->with('success', 'Kelas berhasil didaftarkan.');
    }
}
