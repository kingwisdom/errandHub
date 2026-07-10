<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('client');
    }

    public function rules(): array
    {
        return [
            'request_id' => 'nullable|exists:service_requests,id',
            'service_listing_id' => 'nullable|exists:service_listings,id',
            'provider_id' => 'required|exists:users,id',
            'scheduled_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
