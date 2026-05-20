<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function insights()
    {
        $user = Auth::user();
        $insights = $this->dashboardService->getIndustryInsights($user);

        if (!$insights) {
            $lastError = $this->dashboardService->getLastErrorMessage();

            return $this->error(
                $lastError
                    ? "Insights are unavailable right now: {$lastError}"
                    : 'Insights are unavailable right now. Complete onboarding and ensure NVIDIA_API_KEY and NVIDIA_MODEL are configured in backend/.env.',
                null,
                503
            );
        }

        return $this->success($insights);
    }
}
