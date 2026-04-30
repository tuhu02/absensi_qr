<?php

namespace Database\Seeders;

use App\Models\Course;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dayMap = [
            'Senin' => CarbonImmutable::MONDAY,
            'Selasa' => CarbonImmutable::TUESDAY,
            'Rabu' => CarbonImmutable::WEDNESDAY,
            'Kamis' => CarbonImmutable::THURSDAY,
            'Jumat' => CarbonImmutable::FRIDAY,
            'Sabtu' => CarbonImmutable::SATURDAY,
            'Minggu' => CarbonImmutable::SUNDAY,
        ];

        // Default awal semester gasal agar tanggal pertemuan konsisten.
        $semesterStart = CarbonImmutable::parse('2024-09-02');

        $courses = Course::query()->orderBy('id')->get(['id', 'day']);

        foreach ($courses as $course) {
            $targetWeekday = $dayMap[$course->day] ?? CarbonImmutable::MONDAY;
            $firstMeetingDate = $semesterStart->dayOfWeek === $targetWeekday
                ? $semesterStart
                : $semesterStart->next($targetWeekday);

            for ($meeting = 1; $meeting <= 16; $meeting++) {
                $meetingDate = $firstMeetingDate->addWeeks($meeting - 1)->toDateString();

                DB::table('course_sessions')->updateOrInsert(
                    [
                        'course_id' => $course->id,
                        'date' => $meetingDate,
                    ],
                    [
                        'name' => 'Pertemuan ' . $meeting,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
