<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateCoverLetterRequest;
use App\Services\CoverLetterService;
use Illuminate\Support\Facades\Auth;

class CoverLetterController extends Controller
{
    use ApiResponseTrait;

    protected CoverLetterService $coverLetterService;

    public function __construct(CoverLetterService $coverLetterService)
    {
        $this->coverLetterService = $coverLetterService;
    }

    public function generate(GenerateCoverLetterRequest $request)
    {
        $user = Auth::user();
        $coverLetter = $this->coverLetterService->generateCoverLetter($user, $request->validated());
        return $this->success($coverLetter, 'Cover letter generated successfully');
    }

    public function index()
    {
        $user = Auth::user();
        $coverLetters = $this->coverLetterService->getCoverLetters($user);
        return $this->success($coverLetters);
    }

    public function show($id)
    {
        $user = Auth::user();
        $coverLetter = $this->coverLetterService->getCoverLetter($user, $id);
        return $this->success($coverLetter);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $this->coverLetterService->deleteCoverLetter($user, $id);
        return $this->success(null, 'Cover letter deleted successfully');
    }
}
