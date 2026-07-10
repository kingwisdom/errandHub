<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('agent');
    }

    public function rules(): array
    {
        return [
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price_type' => 'sometimes|in:fixed,hourly,negotiable',
            'starting_price' => 'nullable|numeric|min:0',
            'is_negotiable' => 'boolean',
            'location' => 'nullable|string|max:500',
            'coverage_radius' => 'nullable|integer|min:0',
            'availability' => 'nullable|array',
            'tags' => 'nullable|array',
            'experience_years' => 'nullable|integer|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
        ];
    }
}
