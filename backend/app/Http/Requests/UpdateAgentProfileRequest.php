<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('agent');
    }

    public function rules(): array
    {
        return [
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|array',
            'skills.*' => 'integer|exists:categories,id',
            'languages' => 'nullable|array',
            'languages.*' => 'string|max:50',
            'coverage_area' => 'nullable|string|max:500',
            'vehicle' => 'nullable|string|max:100',
            'available_hours' => 'nullable|array',
            'experience_years' => 'nullable|integer|min:0|max:50',
            'is_online' => 'nullable|boolean',
        ];
    }
}
