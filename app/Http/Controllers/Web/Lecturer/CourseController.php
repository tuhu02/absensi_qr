<?php

namespace App\Http\Controllers\Web\Lecturer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $lecturer = $request->user()->lecturer;

        $classes = $lecturer
            ? $lecturer->classes()->with(['classroom.location', 'studyProgram'])->get()
            : [];

        return Inertia::render('lecturer/classes', [
            'classes' => $classes,
        ]);
    }

    public function show($id, Request $request)
    {
        $lecturer = $request->user()->lecturer;

        if (!$lecturer) {
            abort(403);
        }

        $class = $lecturer->classes()
            ->with([
                'classroom.location',
                'studyProgram',
                'lecturer.user',
                'semester'
            ])
            ->findOrFail($id);


        $meetings = $class->sessions()
            ->with(['attendances.logs.student.user'])
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($session) {
                $excusedLogs = $session->attendances->flatMap->logs->where('status', 'izin')->filter->proof_file;
                return [
                    'id' => $session->id,
                    'name' => $session->name,
                    'date' => $session->date,
                    'status' => $session->status ?? null,
                    'logged_at' => $session->logged_at ?? null,
                    'qr_token' => $session->qr_token,
                    'excused_count' => $excusedLogs->count(),
                    'excused_students' => $excusedLogs->map(function ($log) {
                        return [
                            'name' => $log->student->user->name,
                            'proof_file' => $log->proof_file,
                        ];
                    }),
                ];
            });

        return Inertia::render('lecturer/class-detail', [
            'class' => $class,
            'meetings' => $meetings,
        ]);
    }
}
