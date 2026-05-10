<?php

namespace App\Http\Controllers\Web\Lecturer;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class PermissionProofController extends Controller
{
    public function download(Request $request, Attendance $attendance)
    {
        $user = $request->user();

        if (!$user->lecturer || $attendance->courseSession->course->lecturer_id !== $user->lecturer->id) {
            abort(403, 'Anda tidak memiliki akses ke file ini.');
        }

        if (!$attendance->permission_proof) {
            abort(404, 'File tidak ditemukan.');
        }

        $filePath = storage_path('app/public/' . $attendance->permission_proof);

        if (!file_exists($filePath)) {
            abort(404, 'File tidak ditemukan di server.');
        }

        return response()->file($filePath);
    }

    public function show(Request $request, Attendance $attendance)
    {
        $user = $request->user();

        if (!$user->lecturer || $attendance->courseSession->course->lecturer_id !== $user->lecturer->id) {
            abort(403, 'Anda tidak memiliki akses ke file ini.');
        }

        if (!$attendance->permission_proof) {
            abort(404, 'File tidak ditemukan.');
        }

        $filePath = storage_path('app/public/' . $attendance->permission_proof);

        if (!file_exists($filePath)) {
            abort(404, 'File tidak ditemukan di server.');
        }

        // Detect MIME type
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . basename($filePath) . '"',
        ]);
    }
}
