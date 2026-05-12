<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    protected $fillable = [
        'student_id',
        'course_session_id',
        'status',
        'scanned_at',
        'permission_proof',
        'permission_proof_status',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function courseSession()
    {
        return $this->belongsTo(CourseSession::class);
    }
}
