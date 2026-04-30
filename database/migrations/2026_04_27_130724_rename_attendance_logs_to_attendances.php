<?php 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('attendance_logs', 'attendances');
    }

    public function down(): void
    {
        Schema::rename('attendances', 'attendance_logs');
    }
};