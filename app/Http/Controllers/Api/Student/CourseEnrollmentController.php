<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseEnrollmentController extends Controller
{
    public function enroll(Request $request, Course $course): JsonResponse
    {
        $student = $request->attributes->get('validated_student');

        $student->courses()->syncWithoutDetaching([$course->id]);

        return response()->json([
            'message' => 'Kelas berhasil didaftarkan.',
            'data' => [
                'course_id' => $course->id,
                'student_id' => $student->id,
            ],
        ]);
    }
}
