<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\CourseSession;
use Illuminate\Http\Request;

class ScanController extends Controller
{
    public function scan(Request $request, CourseSession $session)
    {
        $user = $request->user();
        $student = $user->student;
        $token = $request->input('token');

        // Validate QR token
        if ($session->qr_token !== $token) {
            return response()->json([
                'message' => 'QR tidak valid',
            ], 404);
        }

        // Enrollment check sudah di middleware       

        $already = Attendance::query()->where('course_session_id', $session->id)
            ->where('student_id', $student->id)
            ->exists();

        if ($already) {
            return response()->json([
                'message' => 'Kamu sudah absen',
            ], 400);
        }

        $attendance = Attendance::create([
            'course_session_id' => $session->id,
            'student_id' => $student->id,
            'status' => 'hadir',
            'check_in' => now(),
        ]);

        return response()->json([
            'message' => 'Absensi berhasil',
            'data' => [
                'attendance' => $attendance,
                'session' => [
                    'id' => $session->id,
                    'name' => $session->name,
                    'date' => $session->date,
                    'course_id' => $session->course_id,
                ],
            ],
        ]);
    }
}
