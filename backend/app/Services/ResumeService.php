<?php

namespace App\Services;

use App\Models\Resume;
use App\Models\User;

class ResumeService
{
    protected NvidiaService $nvidia;

    public function __construct(NvidiaService $nvidia)
    {
        $this->nvidia = $nvidia;
    }

    public function saveResume(User $user, string $content)
    {
        return Resume::updateOrCreate(
            ['user_id' => $user->id],
            ['content' => $content]
        );
    }

    public function getResume(User $user)
    {
        return $user->resume;
    }

    public function improveWithAI(User $user, string $current, string $type)
    {
        $prompt = "
          As an expert resume writer, improve the following {$type} description for a {$user->industry} professional.
          Make it more impactful, quantifiable, and aligned with industry standards.
          Current content: \"{$current}\"

          Requirements:
          1. Use action verbs
          2. Include metrics and results where possible
          3. Highlight relevant technical skills
          4. Keep it concise but detailed
          5. Focus on achievements over responsibilities
          6. Use industry-specific keywords

          Format the response as a single paragraph without any additional text or explanations.
        ";

        return $this->nvidia->generateContent($prompt);
    }
}
