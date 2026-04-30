<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index()
    {
        $today = Carbon::now()->locale('id')->dayName;
        $tomorrow = Carbon::tomorrow()->locale('id')->dayName;
        $studentId = request()->user()?->student?->id;


        $todayCourses = Course::where('day', $today)
            ->whereHas('students', function ($query) use ($studentId) {
                $query->where('students.id', $studentId);
            })
            ->orderBy('start_time')
            ->get();

        $tomorrowCourses = Course::where('day', $tomorrow)
            ->whereHas('students', function ($query) use ($studentId) {
                $query->where('students.id', $studentId);
            })
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'todayCourses' => $todayCourses,
            'tomorrowCourses' => $tomorrowCourses,
            'today' => $today,
            'tomorrow' => $tomorrow,
        ]);
    }
}
