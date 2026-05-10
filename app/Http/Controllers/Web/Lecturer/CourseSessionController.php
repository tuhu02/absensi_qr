<?php

namespace App\Http\Controllers\Web\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\CourseSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
        ]);

        return back()->with('success', 'Bukti izin diterima.');
    }

    public function rejectProof(Request $request, Attendance $attendance)
    {
        $attendance->update([
            'permission_proof_status' => 'rejected',
        ]);

        return back()->with('success', 'Bukti izin ditolak.');
    }
}
