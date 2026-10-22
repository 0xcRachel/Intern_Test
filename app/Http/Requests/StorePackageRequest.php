<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:packages,slug'],
            'description' => ['nullable', 'string', 'max:5000'],
            'level' => ['required', 'string', 'in:Beginner,Intermediate,Advanced'],
            'duration_hours' => ['required', 'integer', 'min:1', 'max:1000'],
            'rating' => ['required', 'numeric', 'min:0', 'max:5'],
            'students_count' => ['required', 'integer', 'min:0'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'outcomes' => ['nullable', 'array', 'max:8'],
            'outcomes.*' => ['string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'create_starter_content' => ['sometimes', 'boolean'],
        ];
    }
}
