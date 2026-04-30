<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\CourseSession;
use Illuminate\Http\Request;

class ScanController extends Controller
{
    public function scan(Request $request, string $token)
    {
        $user = $request->user();

        if (! $user || ! $user->student) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $student = $user->student;

        $session = CourseSession::where('qr_token', $token)->first();

        if (! $session) {
            return response()->json([
                'message' => 'QR tidak valid',
            ], 404);
        }

        $isEnrolled = $student->courses()
            ->where('courses.id', $session->course_id)
            ->exists();

        if (! $isEnrolled) {
            return response()->json([
                'message' => 'Kamu tidak terdaftar di kelas ini',
            ], 403);
        }

        $already = Attendance::where('course_session_id', $session->id)
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
