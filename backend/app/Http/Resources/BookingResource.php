<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client' => UserResource::make($this->whenLoaded('client')),
            'provider' => UserResource::make($this->whenLoaded('provider')),
            'service_request' => ServiceRequestResource::make($this->whenLoaded('serviceRequest')),
            'service_listing' => ServiceListingResource::make($this->whenLoaded('serviceListing')),
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
