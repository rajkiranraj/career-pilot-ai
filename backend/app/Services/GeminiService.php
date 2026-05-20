<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key') ?? '';
        $this->model = config('services.gemini.model', 'gemini-3-flash-preview');
    }

    public function generateContent(string $prompt)
    {
        if (empty($this->apiKey)) {
            Log::error('Gemini API key is missing. Please set GEMINI_API_KEY in .env');
            throw new \Exception('AI service configuration missing. Please contact administrator.');
        }

        if (empty($this->model)) {
            throw new \Exception('Gemini model is not configured. Please set GEMINI_MODEL in .env.');
        }

        try {
            $response = Http::timeout(30)->post($this->baseUrl . $this->model . ':generateContent?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->failed()) {
                $error = $response->json('error.message') ?? $response->body();
                Log::error('Gemini API Error', [
                    'model' => $this->model,
                    'error' => $error,
                ]);
                throw new \Exception('Failed to generate content: ' . ($response->json('error.message') ?? 'Unknown error'));
            }

            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

            // Robust JSON cleaning
            $text = trim($text);
            if (preg_match('/^```(?:json)?\s*([\s\S]*?)\s*```$/i', $text, $matches)) {
                $text = $matches[1];
            }

            return trim($text);
        } catch (\Exception $e) {
            Log::error('Gemini Service Error', [
                'model' => $this->model,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function generateJson(string $prompt)
    {
        $text = $this->generateContent($prompt);
        $decoded = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Failed to decode Gemini JSON: ' . json_last_error_msg() . ' | Raw text: ' . $text);
            throw new \Exception('The AI returned an invalid data format. Please try again.');
        }

        return $decoded;
    }
}
