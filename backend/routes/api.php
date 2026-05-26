<?php

use App\Http\Controllers\Api\AIToolsController;
use App\Http\Controllers\Api\CoverLetterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RemoteJobsController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user/me', [UserController::class, 'me']);
    Route::patch('/user/update', [UserController::class, 'update']);
    Route::get('/user/onboarding-status', [UserController::class, 'onboardingStatus']);


    Route::get('/dashboard/insights', [DashboardController::class, 'insights']);


    Route::get('/interview/quiz', [InterviewController::class, 'generateQuiz']);
    Route::post('/interview/save-result', [InterviewController::class, 'saveResult']);
    Route::get('/interview/assessments', [InterviewController::class, 'assessments']);


    Route::get('/resume', [ResumeController::class, 'show']);
    Route::post('/resume/save', [ResumeController::class, 'save']);
    Route::post('/resume/improve', [ResumeController::class, 'improve']);
    Route::post('/resume/parse', [ResumeController::class, 'parseText']);


    Route::get('/cover-letter', [CoverLetterController::class, 'index']);
    Route::post('/cover-letter/generate', [CoverLetterController::class, 'generate']);
    Route::get('/cover-letter/{id}', [CoverLetterController::class, 'show']);
    Route::patch('/cover-letter/{id}', [CoverLetterController::class, 'update']);
    Route::delete('/cover-letter/{id}', [CoverLetterController::class, 'destroy']);


    Route::get('/remote-jobs', [RemoteJobsController::class, 'index']);
    Route::get('/remote-jobs/saved', [RemoteJobsController::class, 'savedJobs']);
    Route::post('/remote-jobs/save', [RemoteJobsController::class, 'save']);
    Route::delete('/remote-jobs/saved/{remotiveJobId}', [RemoteJobsController::class, 'unsave']);


    Route::post('/roadmap/generate', [AIToolsController::class, 'generateRoadmap']);
    Route::post('/enhance-text', [AIToolsController::class, 'enhanceText']);
    Route::post('/ats-analyze', [AIToolsController::class, 'atsAnalyze']);


    Route::post('/payment/create-order', [PaymentController::class, 'createOrder']);
    Route::post('/payment/verify', [PaymentController::class, 'verifyPayment']);
});

