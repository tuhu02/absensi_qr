<?php

namespace App\Http\Controllers\Web\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\CourseSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CourseSessionController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => [
                'required',
                'date',
                Rule::unique('course_sessions', 'date')
                    ->where(fn($query) => $query->where('course_id', $course->id)),
            ],
        ], [
            'name.required' => 'Nama pertemuan wajib diisi.',
            'date.required' => 'Tanggal pertemuan wajib diisi.',
            'date.unique' => 'Pertemuan pada tanggal ini sudah ada.',
        ]);

        CourseSession::create([
            'course_id' => $course->id,
            'name' => $validated['name'],
            'date' => $validated['date'],
            'qr_token' => $this->generateUniqueQrToken(),
        ]);

        return back()->with('success', 'Pertemuan berhasil ditambahkan.');
    }

    public function show(Request $request, CourseSession $session)
    {
        $lecturer = $request->user()->lecturer;

        if (! $lecturer) {
            abort(403);
        }

        $session->load([
            'course.classroom.location',
            'course.studyProgram',
            'course.lecturer.user',
            'course.semester',
            'course.students.user',
            'attendances.student.user',
        ]);

        if ($session->course->lecturer_id !== $lecturer->id) {
            abort(403);
        }

        $students = $session->course->students;
        $attendances = $session->attendances->keyBy('student_id');

        $studentsAttendance = $students
            ->map(function ($student) use ($attendances) {
                $attendance = $attendances->get($student->id);

                $fileExtension = null;
                if ($attendance?->permission_proof) {
                    $fileExtension = pathinfo($attendance->permission_proof, PATHINFO_EXTENSION);
                }

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
                    'permission_proof' => $attendance?->permission_proof ? $attendance->permission_proof : null,
                    'permission_proof_status' => $attendance?->permission_proof_status,
                    'permission_proof_extension' => $fileExtension,
                ];
            })
            ->values();

        return Inertia::render('lecturer/session-detail', [
            'session' => [
                'id' => $session->id,
                'name' => $session->name,
                'date' => $session->date,
                'qr_token' => $session->qr_token,
                'qr_url' => $session->qr_token
                    ? url('/api/student/scan/' . $session->qr_token)
                    : null,
                'course' => $session->course,
                'students_attendance' => $studentsAttendance,
                'present_count' => $studentsAttendance->where('status', 'hadir')->count(),
                'permission_count' => $studentsAttendance->where('status', 'izin')->count(),
                'absent_count' => $studentsAttendance->where('status', 'alpha')->count(),
            ],
        ]);
    }

    private function generateUniqueQrToken(): string
    {
        do {
            $token = Str::random(40);
        } while (CourseSession::where('qr_token', $token)->exists());

        return $token;
    }

    public function manualAttendance(Request $request, CourseSession $session)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'status' => ['required', 'in:hadir,izin,alpha'],
        ]);

        $attendance = Attendance::firstOrCreate(
            [
                'student_id' => $validated['student_id'],
                'course_session_id' => $session->id,
            ],
            [
                'status' => $validated['status'],
                'scanned_at' => $validated['status'] === 'alpha' ? null : now(),
            ]
        );

        $attendance->update([
            'status' => $validated['status'],
            'scanned_at' => $validated['status'] === 'alpha' ? null : ($attendance->scanned_at ?? now()),
        ]);

        return back()->with('success', 'Status kehadiran berhasil diubah.');
    }

    public function approveProof(Request $request, Attendance $attendance)
    {
        $attendance->update([
            'permission_proof_status' => 'accepted',
            'status' => 'izin',
            'scanned_at' => null,
        ]);

        return back()->with('success', 'Bukti izin diterima.');
    }

    public function rejectProof(Request $request, Attendance $attendance)
    {
        $attendance->update([
            'permission_proof_status' => 'rejected',
            'status' => 'alpha',
            'scanned_at' => null,
        ]);

        return back()->with('success', 'Bukti izin ditolak.');
    }
}
