<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'package_ids' => ['required', 'array', 'min:1'],
            'package_ids.*' => ['integer', 'exists:packages,id'],
            'coupon' => ['nullable', 'string', 'max:32'],
            'payment_method' => ['nullable', 'string', 'in:demo,card'],
        ];
    }

    public function messages(): array
    {
        return [
            'package_ids.required' => 'Giỏ hàng đang trống.',
            'package_ids.min' => 'Vui lòng chọn ít nhất một khóa học.',
        ];
    }
}
