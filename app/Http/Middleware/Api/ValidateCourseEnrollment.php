<?php

namespace App\Http\Middleware\Api;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateCourseEnrollment
{
    public function handle(Request $request, Closure $next): Response
    {
        $course = $request->route('course');
        $student = $request->user()?->student;

        if (!$student) {
            return response()->json([
                'message' => 'Student tidak ditemukan.',
            ], 403);
        }

        if ($course->study_program_id !== $student->study_program_id) {
            return response()->json([
                'message' => 'Kelas tidak tersedia untuk program studi kamu.',
            ], 404);
        }

        if ($student->courses()->where('courses.id', $course->id)->exists()) {
            return response()->json([
                'message' => 'Kamu sudah terdaftar di kelas ini.',
            ], 409);
        }

        if ($course->day && $course->start_time && $course->end_time) {
            $hasConflict = $student->courses()
                ->whereNotNull('day')
                ->where('day', $course->day)
                ->where(function ($query) use ($course) {
                    $query->where('start_time', '<', $course->end_time)
                        ->where('end_time', '>', $course->start_time);
                })
                ->exists();

            if ($hasConflict) {
                return response()->json([
                    'message' => 'Jadwal kelas bentrok dengan kelas lain yang sudah didaftarkan.',
                ], 409);
            }
        }

        $request->merge([
            'validated_student' => $student,
        ]);

        return $next($request);
    }
}
