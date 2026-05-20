<?php

use App\Http\Controllers\Api\CoverLetterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user/me', [UserController::class, 'me']);
    Route::patch('/user/update', [UserController::class, 'update']);
    Route::get('/user/onboarding-status', [UserController::class, 'onboardingStatus']);

    // Dashboard routes
    Route::get('/dashboard/insights', [DashboardController::class, 'insights']);

    // Interview routes
    Route::get('/interview/quiz', [InterviewController::class, 'generateQuiz']);
    Route::post('/interview/save-result', [InterviewController::class, 'saveResult']);
    Route::get('/interview/assessments', [InterviewController::class, 'assessments']);

    // Resume routes
    Route::get('/resume', [ResumeController::class, 'show']);
    Route::post('/resume/save', [ResumeController::class, 'save']);
    Route::post('/resume/improve', [ResumeController::class, 'improve']);

    // Cover Letter routes
    Route::get('/cover-letter', [CoverLetterController::class, 'index']);
    Route::post('/cover-letter/generate', [CoverLetterController::class, 'generate']);
    Route::get('/cover-letter/{id}', [CoverLetterController::class, 'show']);
    Route::delete('/cover-letter/{id}', [CoverLetterController::class, 'destroy']);
});
