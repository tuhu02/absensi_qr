<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\CourseSession;
use Illuminate\Http\Request;

class PermissionProofController extends Controller
{
    public function store(Request $request, CourseSession $session)
    {
        $user = $request->user();
        $student = $user->student;

        $request->validate([
            'permission_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:2048'],
        ]);

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
                'scanned_at' => null,
                'status' => 'alpha',
            ],
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