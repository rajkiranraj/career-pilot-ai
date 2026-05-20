<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NvidiaService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;
    protected string $systemPrompt;
    protected string $jsonSystemPrompt;
    protected int $maxTokens;
    protected float $temperature;
    protected float $topP;
    protected float $frequencyPenalty;
    protected float $presencePenalty;

    public function __construct()
    {
        $this->apiKey = (string) config('services.nvidia.key', '');
        $this->model = (string) config('services.nvidia.model', 'google/gemma-3n-e2b-it');
        $this->baseUrl = (string) config(
            'services.nvidia.base_url',
            'https://integrate.api.nvidia.com/v1/chat/completions'
        );
        $this->systemPrompt = (string) config(
            'services.nvidia.system_prompt',
            'You are a helpful assistant.'
        );
        $this->jsonSystemPrompt = (string) config(
            'services.nvidia.json_system_prompt',
            'You are a strict JSON generator. Return only valid JSON.'
        );
        $this->maxTokens = (int) config('services.nvidia.max_tokens', 1024);
        $this->temperature = (float) config('services.nvidia.temperature', 0.15);
        $this->topP = (float) config('services.nvidia.top_p', 0.70);
        $this->frequencyPenalty = (float) config('services.nvidia.frequency_penalty', 0.0);
        $this->presencePenalty = (float) config('services.nvidia.presence_penalty', 0.0);
    }

    public function generateContent(string $prompt): string
    {
        return $this->request($prompt, $this->systemPrompt);
    }

    public function generateJson(string $prompt): array
    {
        $text = $this->request($prompt, $this->jsonSystemPrompt);
        return $this->decodeJson($text);
    }

    protected function request(string $prompt, string $systemPrompt): string
    {
        if (empty($this->apiKey)) {
            Log::error('NVIDIA API key is missing. Please set NVIDIA_API_KEY in .env');
            throw new \Exception('AI service configuration missing. Please contact administrator.');
        }

        if (empty($this->model)) {
            throw new \Exception('NVIDIA model is not configured. Please set NVIDIA_MODEL in .env.');
        }

        $response = Http::timeout(30)->withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->post($this->baseUrl, [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => $this->maxTokens,
            'temperature' => $this->temperature,
            'top_p' => $this->topP,
            'frequency_penalty' => $this->frequencyPenalty,
            'presence_penalty' => $this->presencePenalty,
            'stream' => false,
        ]);

        if ($response->failed()) {
            $error = $response->json('error.message') ?? $response->json('error') ?? $response->body();
            Log::error('NVIDIA API Error', [
                'model' => $this->model,
                'status' => $response->status(),
                'error' => $error,
            ]);
            throw new \Exception('Failed to generate content: ' . (is_string($error) ? $error : 'Unknown error'));
        }

        $data = $response->json();
        $text = data_get($data, 'choices.0.message.content', '');

        if (!is_string($text) || trim($text) === '') {
            throw new \Exception('NVIDIA API returned an empty response');
        }

        return trim($text);
    }

    protected function decodeJson(string $text): array
    {
        $cleaned = trim($text);

        if (preg_match('/^```(?:json)?\s*([\s\S]*?)\s*```$/i', $cleaned, $matches)) {
            $cleaned = trim($matches[1]);
        }

        $first = strpos($cleaned, '{');
        $last = strrpos($cleaned, '}');
        if ($first !== false && $last !== false && $last > $first) {
            $cleaned = substr($cleaned, $first, $last - $first + 1);
        }

        $decoded = json_decode($cleaned, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        $repaired = preg_replace('/,\s*([}\]])/', '$1', $cleaned);
        $decoded = json_decode($repaired, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        Log::error('Failed to decode NVIDIA JSON: ' . json_last_error_msg() . ' | Raw text: ' . $cleaned);
        throw new \Exception('The AI returned an invalid data format. Please try again.');
    }
}
