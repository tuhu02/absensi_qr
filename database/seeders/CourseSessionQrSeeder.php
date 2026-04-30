<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseSession;
use Illuminate\Support\Str;

class CourseSessionQrSeeder extends Seeder
{
    public function run(): void
    {
        $sessions = CourseSession::all();

        foreach ($sessions as $session) {
            // Skip kalau sudah ada QR
            if ($session->qr_token) {
                continue;
            }

            $session->update([
                'qr_token' => Str::uuid(),
            ]);
        }
    }
}
