<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedJob;
use App\Services\RemoteJobsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RemoteJobsController extends Controller
{
    use ApiResponseTrait;

    protected RemoteJobsService $remoteJobsService;

    public function __construct(RemoteJobsService $remoteJobsService)
    {
        $this->remoteJobsService = $remoteJobsService;
    }

    /**
     * GET /api/remote-jobs
     * Proxy to Remotive API with server-side caching.
     */
    public function index(Request $request)
    {
        $params = $request->only(['category', 'search', 'limit']);

        $data = $this->remoteJobsService->fetchJobs($params);

        if ($data === null) {
            return $this->error('Unable to fetch remote jobs right now. Please try again later.', null, 503);
        }

        return $this->success($data);
    }

    /**
     * GET /api/remote-jobs/saved
     * Get user's saved jobs.
     */
    public function savedJobs()
    {
        $userId = Auth::id();

        $savedJobs = SavedJob::where('user_id', $userId)
            ->orderBy('saved_at', 'desc')
            ->get();

        return $this->success($savedJobs);
    }

    /**
     * POST /api/remote-jobs/save
     * Save a job.
     */
    public function save(Request $request)
    {
        $request->validate([
            'remotive_job_id' => 'required|integer',
            'title' => 'required|string|max:500',
            'company_name' => 'required|string|max:255',
            'company_logo' => 'nullable|string|max:1000',
            'job_url' => 'required|string|max:1000',
            'salary' => 'nullable|string|max:255',
            'job_type' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
        ]);

        $userId = Auth::id();

        // Prevent duplicates
        $existing = SavedJob::where('user_id', $userId)
            ->where('remotive_job_id', $request->remotive_job_id)
            ->first();

        if ($existing) {
            return $this->success($existing, 'Job already saved.');
        }

        $savedJob = SavedJob::create([
            'user_id' => $userId,
            'remotive_job_id' => $request->remotive_job_id,
            'title' => $request->title,
            'company_name' => $request->company_name,
            'company_logo' => $request->company_logo,
            'job_url' => $request->job_url,
            'salary' => $request->salary,
            'job_type' => $request->job_type,
            'location' => $request->location,
            'category' => $request->category,
            'saved_at' => now(),
        ]);

        return $this->success($savedJob, 'Job saved successfully.', 201);
    }

    /**
     * DELETE /api/remote-jobs/saved/{remotiveJobId}
     * Unsave a job.
     */
    public function unsave(int $remotiveJobId)
    {
        $userId = Auth::id();

        $deleted = SavedJob::where('user_id', $userId)
            ->where('remotive_job_id', $remotiveJobId)
            ->delete();

        if (!$deleted) {
            return $this->error('Saved job not found.', null, 404);
        }

        return $this->success(null, 'Job unsaved successfully.');
    }
}
