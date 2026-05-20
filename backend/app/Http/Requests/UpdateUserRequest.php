<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'industry' => 'required|string|max:255',
            'subIndustry' => 'nullable|string|max:255',
            'experience' => 'required|integer|min:0|max:50',
            'bio' => 'nullable|string|max:500',
            'skills' => 'nullable|array',
            'location' => 'nullable|string|max:255',
        ];
    }
}
