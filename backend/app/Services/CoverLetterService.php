<?php

namespace App\Services;

use App\Models\CoverLetter;
use App\Models\User;

class CoverLetterService
{
    protected NvidiaService $nvidia;

    public function __construct(NvidiaService $nvidia)
    {
        $this->nvidia = $nvidia;
    }

    public function generateCoverLetter(User $user, array $data)
    {
        $skillsText = !empty($user->skills) ? implode(", ", $user->skills) : "N/A";
        
        $prompt = "
          Write a professional cover letter for a {$data['jobTitle']} position at {$data['companyName']}.
          
          About the candidate:
          - Industry: {$user->industry}
          - Years of Experience: {$user->experience}
          - Skills: {$skillsText}
          - Professional Background: {$user->bio}
          
          Job Description:
          {$data['jobDescription']}
          
          Requirements:
          1. Use a professional, enthusiastic tone
          2. Highlight relevant skills and experience
          3. Show understanding of the company's needs
          4. Keep it concise (max 400 words)
          5. Use proper business letter formatting in markdown
          6. Include specific examples of achievements
          7. Relate candidate's background to job requirements
          
          Format the letter in markdown.
        ";

        $content = $this->nvidia->generateContent($prompt);

        return CoverLetter::create([
            'user_id' => $user->id,
            'content' => $content,
            'job_description' => $data['jobDescription'],
            'company_name' => $data['companyName'],
            'job_title' => $data['jobTitle'],
            'status' => 'completed',
        ]);
    }

    public function getCoverLetters(User $user)
    {
        return $user->coverLetters()->orderBy('created_at', 'desc')->get();
    }

    public function getCoverLetter(User $user, $id)
    {
        return $user->coverLetters()->findOrFail($id);
    }

    public function deleteCoverLetter(User $user, $id)
    {
        $coverLetter = $user->coverLetters()->findOrFail($id);
        return $coverLetter->delete();
    }
}
