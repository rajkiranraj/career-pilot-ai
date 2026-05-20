<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveQuizResultRequest;
use App\Services\InterviewService;
use Illuminate\Support\Facades\Auth;

class InterviewController extends Controller
{
    use ApiResponseTrait;

    protected InterviewService $interviewService;

    public function __construct(InterviewService $interviewService)
    {
        $this->interviewService = $interviewService;
    }

    public function generateQuiz()
    {
        $user = Auth::user();
        $questions = $this->interviewService->generateQuiz($user);
        return $this->success($questions);
    }

    public function saveResult(SaveQuizResultRequest $request)
    {
        $user = Auth::user();
        $assessment = $this->interviewService->saveQuizResult(
            $user,
            $request->questions,
            $request->answers,
            $request->score
        );
        return $this->success($assessment, 'Quiz result saved successfully');
    }

    public function assessments()
    {
        $user = Auth::user();
        $assessments = $this->interviewService->getAssessments($user);
        return $this->success($assessments);
    }
}
