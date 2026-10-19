<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'duration_minutes' => ['sometimes', 'required', 'integer', 'min:1', 'max:480'],
            'passing_score' => ['sometimes', 'required', 'integer', 'min:0', 'max:100'],
        ];
    }
}
