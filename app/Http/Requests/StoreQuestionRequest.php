<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_id' => ['required', 'integer', 'exists:exams,id'],
            'question_text' => ['required', 'string', 'max:5000'],
            'type' => ['sometimes', 'string', 'in:single_choice,multiple_choice'],
            'points' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'options' => ['required', 'array', 'min:2'],
            'options.*.option_text' => ['required', 'string', 'max:1000'],
            'options.*.is_correct' => ['required', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $options = $this->input('options', []);
                $hasCorrect = collect($options)->contains(fn ($opt) => ! empty($opt['is_correct']));
                if (! $hasCorrect) {
                    $validator->errors()->add('options', 'At least one option must be marked as correct.');
                }
            },
        ];
    }
}
