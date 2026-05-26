<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\User;

class InterviewService
{
    protected NvidiaService $nvidia;

    public function __construct(NvidiaService $nvidia)
    {
        $this->nvidia = $nvidia;
    }

    public function generateQuiz(User $user)
    {
        $skillsText = !empty($user->skills) ? " with expertise in " . implode(", ", $user->skills) : "";
        
        $prompt = "
          Generate 10 technical interview questions for a {$user->industry} professional{$skillsText}.
          
          Each question should be multiple choice with 4 options.
          Keep explanations brief (1 sentence max).
          
          Return the response in this JSON format only, no additional text:
          {
            \"questions\": [
              {
                \"question\": \"string\",
                \"options\": [\"string\", \"string\", \"string\", \"string\"],
                \"correctAnswer\": \"string\",
                \"explanation\": \"string\"
              }
            ]
          }
        ";

        $data = $this->nvidia->generateJson($prompt, [
            'max_tokens' => 4096,
            'temperature' => 0.1,
        ]);
        return $data['questions'] ?? [];
    }

    public function saveQuizResult(User $user, array $questions, array $answers, float $score)
    {
        $questionResults = [];
        $wrongAnswers = [];

        foreach ($questions as $index => $q) {
            $isCorrect = $q['correctAnswer'] === $answers[$index];
            $result = [
                'question' => $q['question'],
                'answer' => $q['correctAnswer'],
                'userAnswer' => $answers[$index],
                'isCorrect' => $isCorrect,
                'explanation' => $q['explanation'],
            ];
            $questionResults[] = $result;
            
            if (!$isCorrect) {
                $wrongAnswers[] = $result;
            }
        }

        $improvementTip = null;
        if (!empty($wrongAnswers)) {
            $wrongQuestionsText = "";
            foreach ($wrongAnswers as $q) {
                $wrongQuestionsText .= "Question: \"{$q['question']}\"\nCorrect Answer: \"{$q['answer']}\"\nUser Answer: \"{$q['userAnswer']}\"\n\n";
            }

            $improvementPrompt = "
              The user got the following {$user->industry} technical interview questions wrong:

              {$wrongQuestionsText}

              Based on these mistakes, provide a concise, specific improvement tip.
              Focus on the knowledge gaps revealed by these wrong answers.
              Keep the response under 2 sentences and make it encouraging.
              Don't explicitly mention the mistakes, instead focus on what to learn/practice.
            ";

            $improvementTip = $this->nvidia->generateContent($improvementPrompt);
        }

        return Assessment::create([
            'user_id' => $user->id,
            'quiz_score' => $score,
            'questions' => $questionResults,
            'category' => 'Technical',
            'improvement_tip' => $improvementTip,
        ]);
    }

    public function getAssessments(User $user)
    {
        return $user->assessments()->orderBy('created_at', 'asc')->get();
    }
}
