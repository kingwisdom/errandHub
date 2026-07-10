<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ErrandApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'service_request' => ServiceRequestResource::make($this->whenLoaded('serviceRequest')),
            'agent' => UserResource::make($this->whenLoaded('agent')),
            'cover_letter' => $this->cover_letter,
            'proposed_budget' => $this->proposed_budget,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
