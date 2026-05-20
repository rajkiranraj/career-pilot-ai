<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImproveResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current' => 'required|string',
            'type' => 'required|string',
        ];
    }
}
