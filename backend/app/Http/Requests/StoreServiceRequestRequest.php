<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('client');
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'location' => 'nullable|string|max:500',
            'deadline' => 'nullable|date',
            'budget_range' => 'nullable|array',
            'instructions' => 'nullable|string',
        ];
    }
}
