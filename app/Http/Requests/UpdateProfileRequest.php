<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:120'],
            'avatar' => ['nullable', 'url', 'max:2048'],
            'target_band' => ['nullable', 'string', 'max:16'],
            'bio' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập họ tên.',
            'avatar.url' => 'Ảnh đại diện phải là một URL hợp lệ.',
            'bio.max' => 'Giới thiệu tối đa 500 ký tự.',
        ];
    }
}
