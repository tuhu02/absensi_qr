<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleHasPermission::class,
            FacultySeeder::class,
            StudyProgramSeeder::class,
            SemesterSeeder::class,
            LecturerSeeder::class,
            LocationSeeder::class,
            RoomSeeder::class,
            CourseSeeder::class,
            AttendanceSeeder::class,
            StudentSeeder::class,
            CourseStudentSeeder::class,
            CourseSessionQrSeeder::class,
        ]);
    }
}
