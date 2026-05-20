<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    use ApiResponseTrait;

    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function update(UpdateUserRequest $request)
    {
        $user = Auth::user();
        $updatedUser = $this->userService->updateUser($user, $request->validated());
        return $this->success($updatedUser, 'Profile updated successfully');
    }

    public function onboardingStatus()
    {
        $user = Auth::user();
        $status = $this->userService->getOnboardingStatus($user);
        return $this->success($status);
    }

    public function me()
    {
        return $this->success(Auth::user());
    }
}
