<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'nvidia' => [
        'key' => env('NVIDIA_API_KEY'),
        'model' => env('NVIDIA_MODEL', 'google/gemma-3n-e2b-it'),
        'fallback_model' => env('NVIDIA_FALLBACK_MODEL', 'meta/llama-3.1-8b-instruct'),
        'base_url' => env('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1/chat/completions'),
        'system_prompt' => env('NVIDIA_SYSTEM_PROMPT', 'You are a helpful assistant.'),
        'json_system_prompt' => env('NVIDIA_JSON_SYSTEM_PROMPT', 'You are a strict JSON generator. Return only valid JSON.'),
        'max_tokens' => env('NVIDIA_MAX_TOKENS', 1024),
        'temperature' => env('NVIDIA_TEMPERATURE', 0.15),
        'top_p' => env('NVIDIA_TOP_P', 0.70),
        'frequency_penalty' => env('NVIDIA_FREQUENCY_PENALTY', 0.0),
        'presence_penalty' => env('NVIDIA_PRESENCE_PENALTY', 0.0),
    ],

];
