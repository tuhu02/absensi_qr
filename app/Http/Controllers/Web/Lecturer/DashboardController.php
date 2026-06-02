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

        $todaySchedule = CourseSession::query()->where('date', $today)->get();

        dd($todaySchedule);

        return Inertia::render('lecturer/dashboard');
    }
}
