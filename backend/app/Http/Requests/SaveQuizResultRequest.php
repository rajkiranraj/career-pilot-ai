<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveQuizResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'questions' => 'required|array',
            'answers' => 'required|array',
            'score' => 'required|numeric|min:0',
        ];
    }
}
