<?php

namespace App\Http\Controllers\Web\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseSession;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->format('Y-m-d');
        $tomorow = Carbon::tomorrow()->locale('id')->dayName;
        $lecturerId = request()->user()?->lecturer?->id;

        $todaySchedule = CourseSession::query()->with('course')->where('date', $today)->whereHas('course', function($query) use ($lecturerId){
            $query->where('lecturer_id', $lecturerId);
        })->get()->map(function($session){
            return [
                'id' => $session->id,
                'course_name' => $session->course->name,
            ];
        });

        

        return Inertia::render('lecturer/dashboard',[
            'todaySchedule' => $todaySchedule,
        ]);
    }
}
