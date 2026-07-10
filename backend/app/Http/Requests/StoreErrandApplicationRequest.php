<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreErrandApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('agent') ?? false;
    }

    public function rules(): array
    {
        return [
            'service_request_id' => 'required|exists:service_requests,id',
            'cover_letter' => 'nullable|string|max:2000',
            'proposed_budget' => 'nullable|numeric|min:0',
        ];
    }
}
