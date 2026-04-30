<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\StudyProgram;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'name' => 'Andi Pratama',
                'email' => 'andi.student@example.com',
                'address' => 'Jl. Cendana No. 11, Bandung',
                'nim' => '2022001001',
                'study_program' => 'Teknik Informatika',
                'gender' => 'male',
                'date_of_birth' => '2003-01-15',
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.student@example.com',
                'address' => 'Jl. Melati No. 19, Jakarta',
                'nim' => '2022001002',
                'study_program' => 'Teknik Informatika',
                'gender' => 'female',
                'date_of_birth' => '2003-06-27',
            ],
            [
                'name' => 'Rizky Maulana',
                'email' => 'rizky.student@example.com',
                'address' => 'Jl. Kenanga No. 5, Surabaya',
                'nim' => '2022001003',
                'study_program' => 'Manajemen',
                'gender' => 'male',
                'date_of_birth' => '2002-11-03',
            ],
            [
                'name' => 'Sinta Kusuma',
                'email' => 'sinta.student@example.com',
                'address' => 'Jl. Bunga No. 7, Yogyakarta',
                'nim' => '2022001004',
                'study_program' => 'Ilmu Hukum',
                'gender' => 'female',
                'date_of_birth' => '2003-03-22',
            ],
            [
                'name' => 'Budi Hartono',
                'email' => 'budi.student@example.com',
                'address' => 'Jl. Raya No. 42, Medan',
                'nim' => '2022001005',
                'study_program' => 'Agroteknologi',
                'gender' => 'male',
                'date_of_birth' => '2002-08-11',
            ],
            [
                'name' => 'Intan Sari',
                'email' => 'intan.student@example.com',
                'address' => 'Jl. Puspa No. 33, Bandung',
                'nim' => '2022001006',
                'study_program' => 'Ilmu Komunikasi',
                'gender' => 'female',
                'date_of_birth' => '2003-02-14',
            ],
            [
                'name' => 'Rendi Gunawan',
                'email' => 'rendi.student@example.com',
                'address' => 'Jl. Mawar No. 8, Jakarta',
                'nim' => '2022001007',
                'study_program' => 'PGSD',
                'gender' => 'male',
                'date_of_birth' => '2003-05-09',
            ],
            [
                'name' => 'Nita Permata',
                'email' => 'nita.student@example.com',
                'address' => 'Jl. Anggrek No. 16, Surabaya',
                'nim' => '2022001008',
                'study_program' => 'Hukum Bisnis Syariah',
                'gender' => 'female',
                'date_of_birth' => '2003-07-20',
            ],
        ];

        foreach ($students as $data) {
            $studyProgram = StudyProgram::query()
                ->where('name', $data['study_program'])
                ->first();

            if (! $studyProgram) {
                throw new RuntimeException("Study program '{$data['study_program']}' not found. Run StudyProgramSeeder first.");
            }

            $user = User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'type' => 'student',
                    'address' => $data['address'],
                    'password' => 'password123',
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole('student')) {
                $user->assignRole('student');
            }

            Student::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'study_program_id' => $studyProgram->id,
                    'nim' => $data['nim'],
                    'gender' => $data['gender'],
                    'date_of_birth' => $data['date_of_birth'],
                ]
            );
        }
    }
}
