<?php

namespace App\Http\Middleware\Api;

use App\Models\CourseSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentEnrolledInSessionCourse
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $student = $user?->student;

        if (! $student) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $session = $request->route('session');

        if (! $session instanceof CourseSession) {
            $session = CourseSession::find($session);
        }

        if (! $session) {
            return response()->json([
                'message' => 'Pertemuan tidak ditemukan',
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

        return $next($request);
    }
}
