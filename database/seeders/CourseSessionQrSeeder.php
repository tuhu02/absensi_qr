<?php

namespace Database\Seeders;

use App\Models\CourseSession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CourseSessionQrSeeder extends Seeder
{
    public function run(): void
    {
        CourseSession::query()
            ->where('qr_token', '=', null)
            ->get()
            ->each(function (CourseSession $session): void {
                $session->forceFill([
                    'qr_token' => (string) Str::random(8),
                ])->save();
            });
    }
}