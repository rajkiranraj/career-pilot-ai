<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveResumeRequest;
use App\Http\Requests\ImproveResumeRequest;
use App\Services\ResumeService;
use Illuminate\Support\Facades\Auth;

class ResumeController extends Controller
{
    use ApiResponseTrait;

    protected ResumeService $resumeService;

    public function __construct(ResumeService $resumeService)
    {
        $this->resumeService = $resumeService;
    }

    public function save(SaveResumeRequest $request)
    {
        $user = Auth::user();
        $resume = $this->resumeService->saveResume($user, $request->content);
        return $this->success($resume, 'Resume saved successfully');
    }

    public function show()
    {
        $user = Auth::user();
        $resume = $this->resumeService->getResume($user);
        return $this->success($resume);
    }

    public function improve(ImproveResumeRequest $request)
    {
        $user = Auth::user();
        $improvedContent = $this->resumeService->improveWithAI(
            $user,
            $request->current,
            $request->type
        );
        return $this->success($improvedContent);
    }
}
