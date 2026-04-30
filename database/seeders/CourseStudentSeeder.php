<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Student;
use Illuminate\Database\Seeder;

class CourseStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = Student::query()
            ->whereNotNull('study_program_id')
            ->orderBy('id')
            ->get();

        // Assign each student to 2 random courses in their study program (as before)
        foreach ($students as $student) {
            $classIds = Course::query()
                ->where('study_program_id', $student->study_program_id)
                ->inRandomOrder()
                ->limit(2)
                ->pluck('id')
                ->all();

            if ($classIds === []) {
                continue;
            }

            $student->courses()->syncWithoutDetaching($classIds);
        }

        // Ensure every course has at least 10 students
        $courses = Course::all();
        foreach ($courses as $course) {
            $currentStudentIds = $course->students()->pluck('student_id')->all();
            $needed = 10 - count($currentStudentIds);
            if ($needed > 0) {
                $eligible = Student::query()
                    ->where('study_program_id', $course->study_program_id)
                    ->whereNotIn('id', $currentStudentIds)
                    ->inRandomOrder()
                    ->limit($needed)
                    ->pluck('id')
                    ->all();
                if (!empty($eligible)) {
                    $course->students()->syncWithoutDetaching($eligible);
                }
            }
        }
    }
}
