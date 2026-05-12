<?php

namespace App\Http\Controllers\Web\Student;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use App\Models\Course;
use Inertia\Inertia;

class DashboardController extends Controller
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
            ->with([
                'lecturer.user:id,name',
                'semester:id,name',
                'studyProgram:id,name',
                'classroom:id,name,building_id',
                'classroom.location:id,name',
            ])
            ->orderBy('start_time')
            ->get();

        $tomorrowCourses = Course::query()->where('day', $tomorrow)
            ->whereHas('students', function ($query) use ($studentId) {
                $query->where('students.id', $studentId);
            })
            ->with([
                'lecturer.user:id,name',
                'semester:id,name',
                'studyProgram:id,name',
                'classroom:id,name,building_id',
                'classroom.location:id,name',
            ])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('student/dashboard', [
            'todayCourses' => $todayCourses,
            'tomorrowCourses' => $tomorrowCourses,
            'today' => $today,
            'tomorrow' => $tomorrow,
        ]);
    }
}
