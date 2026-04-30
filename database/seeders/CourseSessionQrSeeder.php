<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseSession;
use Illuminate\Support\Str;

class CourseSessionQrSeeder extends Seeder
{
    public function run(): void
    {
        CourseSession::whereNull('qr_token')->each(function ($session) {
            $session->forceFill([
                'qr_token' => (string) Str::uuid(),
            ])->save();
        });
    }
}
