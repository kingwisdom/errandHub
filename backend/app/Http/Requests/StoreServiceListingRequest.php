<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('agent');
    }

    public function rules(): array
    {
        return [
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price_type' => 'required|in:fixed,hourly,negotiable',
            'starting_price' => 'nullable|numeric|min:0',
            'is_negotiable' => 'boolean',
            'location' => 'nullable|string|max:500',
            'coverage_radius' => 'nullable|integer|min:0',
            'photos' => 'nullable|array',
            'photos.*' => 'image|max:5120',
            'availability' => 'nullable|array',
            'tags' => 'nullable|array',
            'experience_years' => 'nullable|integer|min:0',
            'estimated_duration' => 'nullable|integer|min:0',
        ];
    }
}
