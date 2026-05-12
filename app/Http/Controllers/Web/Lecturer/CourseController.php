<?php

namespace App\Http\Controllers\Web\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $lecturer = $request->user()->lecturer;

        $classes = $lecturer

            ? $lecturer->classes()
            ->with([
                'classroom.location',
                'studyProgram',
                'lecturer.user',
            ])
            ->get()
            : [];

        return Inertia::render('lecturer/classes', [
            'classes' => $classes,
        ]);
    }

    public function show(int $id, Request $request)
    {
        $lecturer = $request->user()->lecturer;

        if (! $lecturer) {
            abort(403);
        }

        $class = $lecturer->classes()
            ->with([
                'classroom.location',
                'studyProgram',
                'lecturer.user',
                'semester',
                'students.user',
            ])
            ->findOrFail($id);

        $students = $class->students;

        $meetings = $class->sessions()
            ->with([
                'attendances.student.user',
            ])
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($session) use ($students) {
                $attendances = $session->attendances->keyBy('student_id');

                $studentsAttendance = $students
                    ->map(function ($student) use ($attendances) {
                        $attendance = $attendances->get($student->id);

                        return [
                            'student_id' => $student->id,
                            'nim' => $student->nim
                                ?? $student->student_number
                                ?? $student->npm
                                ?? '-',
                            'name' => $student->user?->name ?? '-',
                            'email' => $student->user?->email ?? '-',
                            'status' => $attendance?->status ?? 'alpha',
                            'scanned_at' => $attendance?->scanned_at,
                            'attendance_id' => $attendance?->id,
                            'permission_proof' => $attendance?->permission_proof
                                ? asset('storage/' . $attendance->permission_proof)
                                : null,
                            'permission_proof_status' => $attendance?->permission_proof_status,
                        ];
                    })
                    ->values();

                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'date' => $session->date,
                    'status' => $session->status ?? null,
                    'logged_at' => $session->logged_at ?? null,
                    'qr_token' => $session->qr_token
                        ? url('/api/student/scan/' . $session->qr_token)
                        : null,

                    'students_attendance' => $studentsAttendance,
                    'present_count' => $studentsAttendance
                        ->where('status', 'hadir')
                        ->count(),
                    'permission_count' => $studentsAttendance
                        ->where('status', 'izin')
                        ->count(),
                    'absent_count' => $studentsAttendance
                        ->where('status', 'alpha')
                        ->count(),
                ];
            })
            ->values();

        return Inertia::render('lecturer/class-detail', [
            'class' => $class,
            'meetings' => $meetings,
        ]);
    }
}
