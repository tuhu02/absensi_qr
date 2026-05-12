<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index()
    {
        $today = Carbon::now()->locale('id')->dayName;
        $tomorrow = Carbon::tomorrow()->locale('id')->dayName;
        $studentId = request()->user()?->student?->id;


        $todayCourses = Course::query()->where('day', $today)
            ->whereHas('students', function ($query) use ($studentId) {
                $query->where('students.id', $studentId);
            })
            ->orderBy('start_time')
            ->get();

        $tomorrowCourses = Course::query()->where('day', $tomorrow)
            ->whereHas('students', function ($query) use ($studentId) {
                $query->where('students.id', $studentId);
            })
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'todayCourses' => CourseResource::collection($todayCourses),
            'tomorrowCourses' => CourseResource::collection($tomorrowCourses),
            'today' => $today,
            'tomorrow' => $tomorrow,
        ]);
    }
}
