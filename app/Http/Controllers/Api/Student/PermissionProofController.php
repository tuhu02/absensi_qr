<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\CourseSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PermissionProofController extends Controller
{
    public function store(Request $request, CourseSession $session)
    {
        $user = $request->user();
        $student = $user->student;

        $validated = $request->validate([
            'permission_proof' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf,webp',
                'max:2048',
            ],
        ], [
            'permission_proof.required' => 'Bukti izin wajib diupload.',
            'permission_proof.file' => 'Bukti izin harus berupa file.',
            'permission_proof.mimes' => 'Format file tidak didukung. Gunakan: jpg, jpeg, png, pdf, atau webp.',
            'permission_proof.max' => 'Ukuran file maksimal 2MB.',
        ]);

        $attendance = Attendance::where('course_session_id', $session->id)
            ->where('student_id', $student->id)
            ->first();

        if ($attendance && $attendance->status === 'hadir') {
            return response()->json([
                'message' => 'Kamu sudah absen hadir, tidak bisa mengajukan izin.',
            ], 400);
        }

        if ($attendance && $attendance->permission_proof) {
            Storage::disk('public')->delete($attendance->permission_proof);
        }

        $path = $request->file('permission_proof')
            ->store('permission-proofs', 'public');

        $attendance = Attendance::updateOrCreate(
            [
                'course_session_id' => $session->id,
                'student_id' => $student->id,
            ],
            [
                'permission_proof' => $path,
                'permission_proof_status' => 'pending',
                'status' => 'izin',
                'check_in' => null,
            ]
        );

        return response()->json([
            'message' => 'Bukti izin berhasil diupload dan menunggu persetujuan dosen.',
            'data' => [
                'attendance' => $attendance,
                'permission_proof' => asset('storage/' . $path),
            ],
        ]);
    }
}