<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $package = $this->route('package');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('packages', 'slug')->ignore($package)],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'level' => ['sometimes', 'required', 'string', 'in:Beginner,Intermediate,Advanced'],
            'duration_hours' => ['sometimes', 'required', 'integer', 'min:1', 'max:1000'],
            'rating' => ['sometimes', 'required', 'numeric', 'min:0', 'max:5'],
            'students_count' => ['sometimes', 'required', 'integer', 'min:0'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'outcomes' => ['sometimes', 'nullable', 'array', 'max:8'],
            'outcomes.*' => ['string', 'max:255'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99'],
        ];
    }
}
