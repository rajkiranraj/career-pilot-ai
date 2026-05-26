<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class RemoteJobsService
{
    private const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs';
    private const CACHE_TTL_MINUTES = 30;

    /**
     * Fetch remote jobs from Remotive API with caching.
     */
    public function fetchJobs(array $params = []): ?array
    {
        $cacheKey = 'remotive_jobs_' . md5(json_encode($params));

        return Cache::remember($cacheKey, self::CACHE_TTL_MINUTES * 60, function () use ($params) {
            $queryParams = [];

            if (!empty($params['category'])) {
                $queryParams['category'] = $params['category'];
            }
            if (!empty($params['search'])) {
                $queryParams['search'] = $params['search'];
            }
            if (!empty($params['limit'])) {
                $queryParams['limit'] = (int) $params['limit'];
            }

            $response = Http::timeout(15)
                ->get(self::REMOTIVE_API_URL, $queryParams);

            if ($response->failed()) {
                return null;
            }

            return $response->json();
        });
    }
}
