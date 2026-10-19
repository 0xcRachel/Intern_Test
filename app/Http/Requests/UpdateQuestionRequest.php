<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_text' => ['sometimes', 'required', 'string', 'max:5000'],
            'type' => ['sometimes', 'string', 'in:single_choice,multiple_choice'],
            'points' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'options' => ['sometimes', 'array', 'min:2'],
            'options.*.option_text' => ['required_with:options', 'string', 'max:1000'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->has('options')) {
                    $options = $this->input('options', []);
                    $hasCorrect = collect($options)->contains(fn ($opt) => ! empty($opt['is_correct']));
                    if (! $hasCorrect) {
                        $validator->errors()->add('options', 'At least one option must be marked as correct.');
                    }
                }
            },
        ];
    }
}
