<?php

namespace App\Http\Middleware\Api;

use App\Models\CourseSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentEnrolledByQrToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $student = $user?->student;

        if (! $student) {
            return response()->json([
                'message' => 'Student tidak ditemukan',
            ], 404);
        }

        $token = $request->route('token');

        if (! is_string($token) || strlen($token) !== 8) {
            return response()->json([
                'message' => 'Format QR token tidak valid',
            ], 400);
        }

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

        $request->attributes->set('course_session', $session);

        return $next($request);
    }
}