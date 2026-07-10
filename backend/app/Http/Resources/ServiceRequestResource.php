<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client' => UserResource::make($this->whenLoaded('client')),
            'agent' => UserResource::make($this->whenLoaded('agent')),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'location' => $this->location,
            'deadline' => $this->deadline,
            'budget_range' => $this->budget_range,
            'instructions' => $this->instructions,
            'photos' => $this->photos,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_by_id' => $this->cancelled_by_id,
            'expires_at' => $this->expires_at,
            'applications_count' => $this->whenCounted('applications'),
            'has_agent_assigned' => $this->agent_id !== null,
            'statuses' => ServiceRequestStatusResource::collection($this->whenLoaded('statuses')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
