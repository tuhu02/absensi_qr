<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StudentCourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $student = $request->user()?->student;

        if (! $student) {
            return response()->json([
                'message' => 'Student tidak ditemukan.',
            ], 403);
        }

        $courses = $student->courses()
            ->with(['lecturer', 'studyProgram'])
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        $courseData = $courses->map(fn(Course $course) => [
            'id' => $course->id,
            'name' => $course->name,
            'room' => trim((($course->classroom?->location?->name) ? $course->classroom->location->name . ' - ' : '') . ($course->classroom?->name ?? '')) ?: $course->room,
            'start_time' => $course->start_time,
            'end_time' => $course->end_time,
            'study_program' => $course->studyProgram?->name,
            'semester' => $course->semester?->name,
            'lecturer_name' => $course->lecturer?->user?->name,
        ])->values();


        return response()->json([
            'message' => 'Daftar kelas berhasil diambil.',
            'data' => $courseData,
        ]);
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        $student = $request->user()?->student;

        if (! $student) {
            return response()->json([
                'message' => 'Student tidak ditemukan.',
            ], 403);
        }

        $isEnrolled = $student->courses()
            ->where('courses.id', $course->id)
            ->exists();

        if (! $isEnrolled) {
            return response()->json([
                'message' => 'Kelas tidak ditemukan.',
            ], 404);
        }

        $course->load([
            'lecturer.user:id,name',
            'semester:id,name',
            'studyProgram:id,name',
            'classroom.location:id,name',
        ]);

        $meetings = collect();


        if (Schema::hasTable('course_sessions')) {
            $hasAttendances = Schema::hasTable('attendances');

            $query = DB::table('course_sessions as sessions')
                ->where('sessions.course_id', $course->id)
                ->orderBy('sessions.date');

            if ($hasAttendances) {
                $query->leftJoin('attendances as logs', function ($join) use ($student) {
                    $join->on('logs.course_session_id', '=', 'sessions.id')
                        ->where('logs.student_id', '=', $student->id);
                });
            }

            $selects = [
                'sessions.id',
                'sessions.name',
                'sessions.date',
            ];

            if ($hasAttendances) {
                $selects[] = 'logs.status as status';
                $selects[] = 'logs.updated_at as logged_at';
            }

            $meetings = $query
                ->select($selects)
                ->get()
                ->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'date' => $item->date,
                    'status' => $item->status ?? null,
                    'logged_at' => $item->logged_at ?? null,
                ])
                ->values();
        }


        return response()->json([
            'message' => 'Detail kelas berhasil diambil.',
            'data' => [
                'course' => $course,
                'meetings' => $meetings,
            ],
        ]);
    }
}
