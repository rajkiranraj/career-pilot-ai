<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    public function success($data = null, string $message = 'Operation successful', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => null,
        ], $code);
    }

    public function error(string $message = 'Operation failed', $errors = null, int $code = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors,
        ], $code);
    }
}
