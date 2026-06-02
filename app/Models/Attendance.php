<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'student_id',
        'course_session_id',
        'status',
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
