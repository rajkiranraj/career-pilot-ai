<?php

namespace App\Services;

use App\Models\IndustryInsight;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardService
{
    protected NvidiaService $nvidia;
    protected ?string $lastErrorMessage = null;

    public function __construct(NvidiaService $nvidia)
    {
        $this->nvidia = $nvidia;
    }

    public function generateAIInsights(string $industry)
    {
        $prompt = "
                    Analyze the current state of the {$industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
                        \"salary_ranges\": [
              { \"role\": \"string\", \"min\": number, \"max\": number, \"median\": number, \"location\": \"string\" }
            ],
                        \"growth_rate\": number,
                        \"demand_level\": \"High\" | \"Medium\" | \"Low\",
                        \"top_skills\": [\"skill1\", \"skill2\"],
                        \"market_outlook\": \"Positive\" | \"Neutral\" | \"Negative\",
                        \"key_trends\": [\"trend1\", \"trend2\"],
                        \"recommended_skills\": [\"skill1\", \"skill2\"]
          }

          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
                    Use the exact snake_case keys shown above.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        ";

        return $this->nvidia->generateJson($prompt);
    }

    public function getIndustryInsights(User $user)
    {
        $this->lastErrorMessage = null;

        if (!$user->industry) {
            $this->lastErrorMessage = 'Please complete onboarding by selecting an industry.';
            return null;
        }

        $insight = IndustryInsight::where('industry', $user->industry)->first();

        // If no insights exist OR insights are older than 7 days, generate them
        if (!$insight || ($insight->next_update && $insight->next_update->isPast())) {
            try {
                $insightsData = $this->normalizeInsightsData(
                    $this->generateAIInsights($user->industry)
                );

                if ($insight) {
                    $insight->update([
                        ...$insightsData,
                        'next_update' => Carbon::now()->addDays(7),
                    ]);
                } else {
                    $insight = IndustryInsight::create([
                        'industry' => $user->industry,
                        ...$insightsData,
                        'next_update' => Carbon::now()->addDays(7),
                    ]);
                }
            } catch (\Exception $e) {
                $this->lastErrorMessage = $e->getMessage();

                // If update fails and we have old data, keep it for now
                if (!$insight) {
                    Log::warning('Industry insights generation failed without cached data.', [
                        'industry' => $user->industry,
                        'error' => $e->getMessage(),
                    ]);

                    return null;
                }
            }
        }

        return $insight;
    }

    public function getLastErrorMessage(): ?string
    {
        return $this->lastErrorMessage;
    }

    protected function normalizeInsightsData(array $insightsData): array
    {
        $normalized = [
            'salary_ranges' => $insightsData['salary_ranges'] ?? $insightsData['salaryRanges'] ?? null,
            'growth_rate' => $insightsData['growth_rate'] ?? $insightsData['growthRate'] ?? null,
            'demand_level' => $insightsData['demand_level'] ?? $insightsData['demandLevel'] ?? null,
            'top_skills' => $insightsData['top_skills'] ?? $insightsData['topSkills'] ?? null,
            'market_outlook' => $insightsData['market_outlook'] ?? $insightsData['marketOutlook'] ?? null,
            'key_trends' => $insightsData['key_trends'] ?? $insightsData['keyTrends'] ?? null,
            'recommended_skills' => $insightsData['recommended_skills'] ?? $insightsData['recommendedSkills'] ?? null,
        ];

        $arrayFields = ['salary_ranges', 'top_skills', 'key_trends', 'recommended_skills'];

        foreach ($arrayFields as $field) {
            if (!is_array($normalized[$field])) {
                if (is_string($normalized[$field])) {
                    $decoded = json_decode($normalized[$field], true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $normalized[$field] = $decoded;
                    } else {
                        $normalized[$field] = array_values(
                            array_filter(
                                array_map('trim', explode(',', $normalized[$field]))
                            )
                        );
                    }
                } elseif ($normalized[$field] === null) {
                    $normalized[$field] = [];
                } else {
                    $normalized[$field] = (array) $normalized[$field];
                }
            }
        }

        if ($normalized['growth_rate'] === null || $normalized['growth_rate'] === '') {
            $normalized['growth_rate'] = 0;
        }
        $normalized['growth_rate'] = (float) $normalized['growth_rate'];

        $requiredStringFields = ['demand_level', 'market_outlook'];
        foreach ($requiredStringFields as $field) {
            if (!is_string($normalized[$field]) || trim($normalized[$field]) === '') {
                throw new \Exception("AI response missing required field: {$field}");
            }
            $normalized[$field] = trim($normalized[$field]);
        }

        if (empty($normalized['salary_ranges'])) {
            throw new \Exception('AI response missing required field: salary_ranges');
        }

        return $normalized;
    }
}
