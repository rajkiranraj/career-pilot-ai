<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NvidiaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AIToolsController extends Controller
{
    use ApiResponseTrait;

    protected NvidiaService $nvidia;

    public function __construct(NvidiaService $nvidia)
    {
        $this->nvidia = $nvidia;
    }

    /**
     * POST /api/roadmap/generate
     * Generate a career transition roadmap.
     */
    public function generateRoadmap(Request $request)
    {
        $request->validate([
            'currentRole' => 'nullable|string|max:500',
            'currentSkills' => 'nullable|string|max:2000',
            'targetRole' => 'required|string|max:500',
            'timelineMonths' => 'nullable|integer|min:1|max:36',
            'jobDescription' => 'nullable|string|max:5000',
        ]);

        try {
            $currentRole = $request->currentRole ?? 'Not specified';
            $currentSkills = $request->currentSkills ?? 'Not specified';
            $targetRole = $request->targetRole;
            $timeline = $request->timelineMonths ?? 6;
            $jd = $request->jobDescription ?? '';

            $jdSection = $jd ? "\n\nTarget Job Description:\n\"\"\"\n{$jd}\n\"\"\"" : '';

            $prompt = "Create a detailed career transition roadmap for someone moving from \"{$currentRole}\" to \"{$targetRole}\".

Current Skills: {$currentSkills}
Timeline: {$timeline} months{$jdSection}

Return a JSON object with this exact structure:
{
  \"targetRole\": \"the target role\",
  \"timelineMonths\": {$timeline},
  \"phases\": [
    {
      \"title\": \"Phase title\",
      \"duration\": \"e.g. Month 1-2\",
      \"goals\": [\"goal 1\", \"goal 2\"],
      \"skills\": [\"skill 1\", \"skill 2\"],
      \"resources\": [
        {\"title\": \"Resource name\", \"type\": \"course/book/project/tutorial\", \"url\": \"\"}
      ],
      \"milestones\": [\"milestone 1\", \"milestone 2\"]
    }
  ],
  \"keySkillsToLearn\": [\"skill 1\", \"skill 2\"],
  \"estimatedReadiness\": \"A sentence about when they will be ready\"
}

Make the roadmap practical, detailed, and actionable. Include 3-5 phases. Each phase should have specific, concrete goals and real resources.";

            $result = $this->nvidia->generateJson($prompt, [
                'max_tokens' => 8192,
                'temperature' => 0.3,
            ]);

            return $this->success(['result' => $result]);

        } catch (\Exception $e) {
            return $this->error('Failed to generate roadmap: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * POST /api/enhance-text
     * Enhance resume text using AI.
     */
    public function enhanceText(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'type' => 'required|string|in:summary,experience,project,skills,achievement,coursework,honors,ats_fix,general',
        ]);

        try {
            $text = $request->text;
            $type = $request->type;

            if ($type === 'ats_fix') {
                return $this->handleAtsFix($text);
            }

            $prompts = [
                'summary' => "Rewrite this professional summary to be more impactful, concise, and ATS-friendly. Use strong action words and quantifiable achievements. Return ONLY the improved text, nothing else:\n\n",
                'experience' => "Rewrite this work experience description to be more impactful. Use strong action verbs, quantify results, and highlight achievements. Return ONLY the improved text:\n\n",
                'project' => "Rewrite this project description to be more compelling. Emphasize technical complexity, impact, and technologies used. Return ONLY the improved text:\n\n",
                'skills' => "Optimize this skills section for ATS compatibility. Ensure proper formatting and industry-standard terminology. Return ONLY the improved text:\n\n",
                'achievement' => "Rewrite this achievement to be more impactful and quantifiable. Return ONLY the improved text:\n\n",
                'coursework' => "Rewrite this coursework description to be more relevant and impressive. Return ONLY the improved text:\n\n",
                'honors' => "Rewrite this honors/awards description to be more impactful. Return ONLY the improved text:\n\n",
                'general' => "Improve this text to be more professional, clear, and impactful. Return ONLY the improved text:\n\n",
            ];

            $promptPrefix = $prompts[$type] ?? $prompts['general'];
            $improved = $this->nvidia->generateContent($promptPrefix . $text, [
                'max_tokens' => 2048,
                'temperature' => 0.3,
            ]);

            return $this->success(['improved' => trim($improved)]);

        } catch (\Exception $e) {
            return $this->error('Failed to enhance text: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Handle ATS fix requests — returns structured JSON improvements.
     */
    private function handleAtsFix(string $text)
    {
        $prompt = "Analyze this resume content and ATS issues, then provide specific fixes.

{$text}

Return a JSON object with this structure:
{
  \"summary\": \"improved summary text or null if fine\",
  \"skills\": {
    \"languages\": \"improved languages or null\",
    \"frameworks\": \"improved frameworks or null\",
    \"databases\": \"improved databases or null\"
  },
  \"experiences\": [
    {\"index\": 0, \"responsibilities\": \"improved text\"}
  ],
  \"projects\": [
    {\"index\": 0, \"description\": \"improved text\"}
  ]
}

Only include fields that need improvement. Use null for fields that are already good.";

        $result = $this->nvidia->generateJson($prompt, [
            'max_tokens' => 4096,
            'temperature' => 0.2,
        ]);

        return $this->success(['ats_fix' => $result]);
    }

    /**
     * POST /api/ats-analyze
     * Analyze resume against a job description.
     */
    public function atsAnalyze(Request $request)
    {
        $request->validate([
            'resumeText' => 'required|string',
            'jobDescription' => 'required|string',
        ]);

        try {
            $prompt = "Compare this resume against the job description and provide a detailed ATS compatibility analysis.

RESUME:
\"\"\"
{$request->resumeText}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{$request->jobDescription}
\"\"\"

Return a JSON object with:
{
  \"score\": 75,
  \"matchedKeywords\": [\"keyword1\", \"keyword2\"],
  \"missingKeywords\": [\"keyword3\", \"keyword4\"],
  \"suggestions\": [
    {\"category\": \"Skills\", \"message\": \"Add X skill\", \"priority\": \"high\"},
    {\"category\": \"Experience\", \"message\": \"Quantify Y\", \"priority\": \"medium\"}
  ],
  \"strengths\": [\"Good use of action verbs\", \"Relevant experience\"],
  \"weaknesses\": [\"Missing key skills\", \"No quantified achievements\"]
}

Be thorough and specific. Score from 0-100.";

            $result = $this->nvidia->generateJson($prompt, [
                'max_tokens' => 4096,
                'temperature' => 0.1,
            ]);

            return $this->success(['result' => $result]);

        } catch (\Exception $e) {
            return $this->error('Failed to analyze ATS: ' . $e->getMessage(), null, 500);
        }
    }
}
