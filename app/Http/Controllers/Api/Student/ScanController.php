<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class ScanController extends Controller
{
    public function scan(Request $request)
    {
        $session = $request->attributes->get('course_session');
        $student = $request->user()->student;

        $hasAlreadyAttended = Attendance::query()
            ->where('course_session_id', $session->id)
            ->where('student_id', $student->id)
            ->exists();

        if ($hasAlreadyAttended) {
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