<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'with_study_programs' => 'nullable|boolean',
        ]);

        $withStudyPrograms = $request->boolean('with_study_programs');

        $facultiesQuery = Faculty::query()->orderBy('name', 'asc');

        if ($withStudyPrograms) {
            $facultiesQuery->with([
                'studyPrograms' => fn($query) => $query->orderBy('name')->select(['id', 'name', 'faculty_id']),
            ]);
        }

        return response()->json([
            'message' => 'Berhasil mengambil data fakultas.',
            'faculties' => $facultiesQuery->get(['id', 'name']),
        ]);
    }
}
