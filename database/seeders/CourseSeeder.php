<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Lecturer;
use App\Models\Room;
use App\Models\Semester;
use App\Models\StudyProgram;
use Illuminate\Database\Seeder;
use RuntimeException;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $semester = Semester::query()->where('name', 'Gasal 2024/2025')->first();

        if (! $semester) {
            throw new RuntimeException("Semester 'Gasal 2024/2025' not found. Run SemesterSeeder first.");
        }

        $studyPrograms = StudyProgram::query()->orderBy('id')->get();
        $lecturers = Lecturer::query()->orderBy('id')->get();
        $rooms = Room::query()->with('location')->orderBy('id')->get();

        if ($studyPrograms->isEmpty()) {
            throw new RuntimeException('No study programs found. Run StudyProgramSeeder first.');
        }

        if ($lecturers->isEmpty()) {
            throw new RuntimeException('No lecturers found. Run LecturerSeeder first.');
        }

        if ($rooms->isEmpty()) {
            throw new RuntimeException('No rooms found. Run RoomSeeder first.');
        }

        $subjectPool = [
            'Algoritma & Struktur Data',
            'Basis Data',
            'Jaringan Komputer',
            'Rekayasa Perangkat Lunak',
            'Kecerdasan Buatan',
            'Matematika Diskrit',
            'Statistika',
            'Sistem Operasi',
            'Manajemen Proyek',
            'Metodologi Penelitian',
            'Kewirausahaan',
            'Etika Profesi',
        ];

        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        $timeSlots = [
            ['start' => '08:00', 'end' => '09:40'],
            ['start' => '10:00', 'end' => '11:40'],
            ['start' => '13:00', 'end' => '14:40'],
            ['start' => '15:00', 'end' => '16:40'],
        ];

        $letters = range('A', 'Z');
        $subjectCount = count($subjectPool);
        foreach ($studyPrograms as $studyProgram) {
            for ($subjectIdx = 0; $subjectIdx < $subjectCount; $subjectIdx++) {
                $subjectName = $subjectPool[$subjectIdx];
                for ($classIdx = 0; $classIdx < 3; $classIdx++) { // 3 kelas per subject
                    $classLetter = $letters[$classIdx];
                    $courseName = sprintf('%s %s', $subjectName, $classLetter);
                    $lecturer = $lecturers[($subjectIdx * 3 + $classIdx) % $lecturers->count()];
                    $room = $rooms[($subjectIdx * 3 + $classIdx) % $rooms->count()];
                    $slot = $timeSlots[($subjectIdx * 3 + $classIdx) % count($timeSlots)];
                    $day = $days[($subjectIdx * 3 + $classIdx) % count($days)];
                    $roomLabel = trim(
                        ($room->location?->name ? $room->location->name . ' - ' : '') . $room->name
                    );
                    Course::query()->updateOrCreate(
                        ['name' => $courseName],
                        [
                            'study_program_id' => $studyProgram->id,
                            'semester_id' => $semester->id,
                            'lecturer_id' => $lecturer->id,
                            'room_id' => $room->id,
                            'room' => $roomLabel,
                            'day' => $day,
                            'start_time' => $slot['start'],
                            'end_time' => $slot['end'],
                        ]
                    );
                }
            }
        }
    }
}
