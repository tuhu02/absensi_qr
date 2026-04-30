<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\CourseSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class CourseSessionSeeder extends Seeder
{
    public function run(): void
    {
        $courses = Course::all();
        $pertemuan = 14;
        $startDate = Carbon::now()->startOfWeek(Carbon::MONDAY)->addWeek();

        foreach ($courses as $course) {
            for ($i = 1; $i <= $pertemuan; $i++) {
                $date = (clone $startDate)->addWeeks($i - 1)->format('Y-m-d');

                CourseSession::firstOrCreate(
                    [
                        'course_id' => $course->id,
                        'name' => 'Pertemuan ' . $i,
                        'date' => $date,
                    ],
                    [
                        'qr_token' => (string) Str::uuid(),
                    ]
                );
            }
        }
    }
}
