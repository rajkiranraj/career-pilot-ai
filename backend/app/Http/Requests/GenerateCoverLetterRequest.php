<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateCoverLetterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'jobTitle' => 'required|string|max:255',
            'companyName' => 'required|string|max:255',
            'jobDescription' => 'required|string|max:2000',
        ];
    }
}
