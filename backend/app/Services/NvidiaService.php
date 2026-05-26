<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NvidiaService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;
    protected string $fallbackModel;
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
        $this->fallbackModel = (string) config('services.nvidia.fallback_model', 'meta/llama-3.1-8b-instruct');
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
        $this->maxTokens = (int) config('services.nvidia.max_tokens', 4096);
        $this->temperature = (float) config('services.nvidia.temperature', 0.15);
        $this->topP = (float) config('services.nvidia.top_p', 0.70);
        $this->frequencyPenalty = (float) config('services.nvidia.frequency_penalty', 0.0);
        $this->presencePenalty = (float) config('services.nvidia.presence_penalty', 0.0);
    }

    public function generateContent(string $prompt, array $options = []): string
    {
        return $this->request($prompt, $this->systemPrompt, $options);
    }

    public function generateJson(string $prompt, array $options = []): array
    {
        $text = $this->request($prompt, $this->jsonSystemPrompt, $options);
        return $this->decodeJson($text);
    }

    protected function request(string $prompt, string $systemPrompt, array $options = []): string
    {
        if (empty($this->apiKey)) {
            Log::error('NVIDIA API key is missing. Please set NVIDIA_API_KEY in .env');
            throw new \Exception('AI service configuration missing. Please contact administrator.');
        }

        if (empty($this->model)) {
            throw new \Exception('NVIDIA model is not configured. Please set NVIDIA_MODEL in .env.');
        }


        if (!app()->runningInConsole()) {
            set_time_limit(240);
        }

        $maxTokens = $options['max_tokens'] ?? $this->maxTokens;
        $temperature = $options['temperature'] ?? $this->temperature;

        $attempts = 3;
        $timeout = 45;
        $connectTimeout = 10;
        $currentModel = $this->model;
        $response = null;

        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            try {

                if ($attempt > 1 && !empty($this->fallbackModel)) {
                    $currentModel = $this->fallbackModel;
                    Log::warning("NVIDIA API attempt {$attempt}: Falling back to model {$currentModel}");
                }

                $response = Http::timeout($timeout)
                    ->connectTimeout($connectTimeout)
                    ->withHeaders([
                        'Authorization' => 'Bearer ' . $this->apiKey,
                        'Accept' => 'application/json',
                    ])->post($this->baseUrl, [
                        'model' => $currentModel,
                        'messages' => [
                            ['role' => 'system', 'content' => $systemPrompt],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'max_tokens' => $maxTokens,
                        'temperature' => $temperature,
                        'top_p' => $this->topP,
                        'frequency_penalty' => $this->frequencyPenalty,
                        'presence_penalty' => $this->presencePenalty,
                        'stream' => false,
                    ]);

                if ($response->successful()) {
                    break;
                }

                $error = $response->json('error.message') ?? $response->json('error') ?? $response->body();
                Log::warning("NVIDIA API attempt {$attempt} failed with status {$response->status()}: " . json_encode($error));

                if ($attempt === $attempts) {
                    throw new \Exception('Failed to generate content: ' . (is_string($error) ? $error : 'Unknown error'));
                }

            } catch (\Exception $e) {
                Log::warning("NVIDIA API attempt {$attempt} encountered exception: " . $e->getMessage());

                if ($attempt === $attempts) {
                    throw new \Exception('Failed to generate content due to connection/timeout error: ' . $e->getMessage(), 0, $e);
                }
            }


            usleep(1000000);
        }

        $data = $response->json();
        $text = data_get($data, 'choices.0.message.content', '');

        // Check if the response was truncated due to token limit
        $finishReason = data_get($data, 'choices.0.finish_reason', '');
        if ($finishReason === 'length') {
            Log::warning('NVIDIA response truncated (finish_reason=length)', [
                'max_tokens' => $maxTokens,
                'text_length' => strlen($text ?? ''),
            ]);
        }

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

        // Attempt to repair truncated JSON (incomplete array/object)
        $repaired = $this->repairTruncatedJson($cleaned);
        if ($repaired !== null) {
            $decoded = json_decode($repaired, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                Log::info('Successfully repaired truncated NVIDIA JSON');
                return $decoded;
            }
        }

        Log::error('Failed to decode NVIDIA JSON: ' . json_last_error_msg() . ' | Raw text: ' . $cleaned);
        throw new \Exception('The AI returned an invalid data format. Please try again.');
    }

    /**
     * Attempt to repair JSON that was truncated mid-generation.
     * Closes unclosed arrays and objects.
     */
    protected function repairTruncatedJson(string $json): ?string
    {
        // Find the last complete object in an array context
        // Look for the last complete "}" that ends a quiz question object
        $lastCompleteObj = strrpos($json, '}');
        if ($lastCompleteObj === false) {
            return null;
        }

        // Take everything up to the last complete closing brace
        $partial = substr($json, 0, $lastCompleteObj + 1);

        // Remove any trailing comma after the last object
        $partial = preg_replace('/,\s*$/', '', $partial);

        // Count unclosed brackets and braces
        $openBrackets = substr_count($partial, '[') - substr_count($partial, ']');
        $openBraces = substr_count($partial, '{') - substr_count($partial, '}');

        // Close them in reverse order
        $partial .= str_repeat(']', max(0, $openBrackets));
        $partial .= str_repeat('}', max(0, $openBraces));

        return $partial;
    }
}
