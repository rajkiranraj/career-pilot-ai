<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserService
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function updateUser(User $user, array $data)
    {
        return DB::transaction(function () use ($user, $data) {
            $payload = [
                'industry' => $data['industry'],
                'experience' => $data['experience'],
                'bio' => $data['bio'] ?? null,
                'skills' => $data['skills'] ?? null,
            ];

            if (array_key_exists('location', $data)) {
                $payload['location'] = $data['location'];
            }

            $user->update($payload);

            $user->refresh();

            // Ensure industry insights exist for the updated industry.
            $this->dashboardService->getIndustryInsights($user);

            return $user;
        });
    }

    public function getOnboardingStatus(User $user)
    {
        return [
            'isOnboarded' => !empty($user->industry),
        ];
    }
}
