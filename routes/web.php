<?php

use App\Http\Controllers\Web\Admin\AdminController;
use App\Http\Controllers\Web\Admin\CourseController;
use App\Http\Controllers\Web\Lecturer\CourseController as LecturerCourseController;
use App\Http\Controllers\Web\Admin\FacultyController;
use App\Http\Controllers\Web\Admin\LecturerController;
use App\Http\Controllers\Web\Admin\RoleController;
use App\Http\Controllers\Web\Admin\StudentController;
use App\Http\Controllers\Web\Admin\StudyProgramController;
use App\Http\Controllers\Web\Student\ClassEnrollmentController;
use App\Http\Controllers\Web\Student\DashboardController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\LecturerMiddleware;
use App\Http\Middleware\StudentMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified', StudentMiddleware::class])->prefix('student')->name('student.')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('matakuliah', function () {
        return Inertia::render('student/matakuliah');
    })->name('matakuliah');

    Route::get('classes', [ClassEnrollmentController::class, 'index'])->name('classes.index');
    Route::get('classes/{course}', [ClassEnrollmentController::class, 'show'])->name('classes.show');
    Route::get('all-classes', [ClassEnrollmentController::class, 'allClasses'])->name('all-classes.index');
    Route::post('all-classes/{course}/enroll', [ClassEnrollmentController::class, 'enroll'])->name('all-classes.enroll');
});

Route::middleware(['auth', LecturerMiddleware::class])->prefix('lecturer')->name('lecturer.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('lecturer/dashboard');
    })->name('dashboard');

    Route::get('classes', [LecturerCourseController::class, 'index'])->name('classes');
    Route::get('classes/{id}', [LecturerCourseController::class, 'show'])->name('classes.show');
});

Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');

    Route::resource('/roles', RoleController::class)->middleware('can:manage_roles')->except(['show']);
    Route::resource('/courses', CourseController::class)->middleware('can:manage_classes')->except(['show']);
    Route::resource('/students', StudentController::class)->middleware('can:manage_students')->except(['show']);
    Route::resource('/lecturers', LecturerController::class)->middleware('can:manage_lecturers')->except(['show']);
    Route::resource('/admins', AdminController::class)->middleware('can:manage_admins')->except(['show']);
    Route::resource('/faculties', FacultyController::class)->middleware('can:manage_faculties')->except(['show']);
    Route::resource('/study-programs', StudyProgramController::class)->middleware('can:manage_study_programs')->except(['show']);
});

require __DIR__ . '/settings.php';
