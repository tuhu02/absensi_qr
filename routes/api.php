<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Student\ScheduleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\Student\CourseEnrollmentController;
use App\Http\Controllers\Api\Student\ProfileController;
use App\Http\Controllers\Api\Student\ScanController;
use App\Http\Controllers\Api\StudyProgramController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\Student\StudentCourseController;
use App\Http\Controllers\Api\Auth\PendingEmailVerificationController;
use App\Http\Controllers\Api\Student\PermissionProofController;
use App\Models\CourseSession;

Route::bind('session', function ($value) {
    return CourseSession::query()
        ->where('qr_token', $value)
        ->first()
        ?: (is_numeric($value) ? CourseSession::query()->find($value) : null);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'student.api'])->prefix('student')->group(function () {
    Route::get('/classes', [StudentCourseController::class, 'index']);
    Route::get('/classes/{course}', [StudentCourseController::class, 'show']);
    Route::get('/schedule', [ScheduleController::class, 'index']);
    Route::post('/all-classes/{course}/enroll', [CourseEnrollmentController::class, 'enroll'])
        ->middleware('validate.course.enrollment');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::post('/scan/{token}', [ScanController::class, 'scan'])
        ->middleware('student.enrolled.qr');
        
    Route::post('/sessions/{session}/permission-proof', [PermissionProofController::class, 'store'])
        ->middleware('student.enrolled.session');
});

Route::get('/study-program', [StudyProgramController::class, 'index']);
Route::get('/faculties', [FacultyController::class, 'index']);

Route::post('/register', RegisterController::class);
Route::post('/login', LoginController::class);
Route::post('/logout', LogoutController::class)->middleware('auth:sanctum');

Route::post('/email/verify-otp', [EmailVerificationController::class, 'verifyEmail'])
    ->name('api.verification.verify')
    ->middleware('auth:sanctum');

Route::post('/email/resend-otp', [EmailVerificationController::class, 'resendOtp'])
    ->middleware(['throttle:6,1', 'auth:sanctum'])
    ->name('api.verification.resend');

Route::post('/email/verify-pending-otp', [PendingEmailVerificationController::class, 'verify'])
    ->middleware('auth:sanctum');

Route::post('/reset-password', [PasswordResetController::class, 'sendOtp']);
Route::post('/otp-check', [PasswordResetController::class, 'checkOtp'])->middleware('throttle:6,1');
Route::post('/new-password', [PasswordResetController::class, 'resetPassword']);

Route::get('/search', [SearchController::class, 'index'])->middleware('auth:sanctum');
