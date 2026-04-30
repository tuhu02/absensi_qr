<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\Student\CourseEnrollmentController;
use App\Http\Controllers\Api\Student\ProfileController;
use App\Http\Controllers\Api\Student\ScanController;
use App\Http\Controllers\Api\StudyProgramController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\Student\StudentCourseController;
use App\Http\Controllers\Api\Auth\PendingEmailVerificationController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->prefix('student')->group(function () {
    Route::get('/classes', [StudentCourseController::class, 'index']);
    Route::get('/classes/{course}', [StudentCourseController::class, 'show']);
    Route::get('/schedule', [ScheduleController::class, 'index']);
    Route::post('/all-classes/{course}/enroll', [CourseEnrollmentController::class, 'enroll']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/scan/{token}', [ScanController::class, 'scan']);
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
