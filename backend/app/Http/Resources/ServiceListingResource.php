<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'agent' => UserResource::make($this->whenLoaded('agent')),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'title' => $this->title,
            'description' => $this->description,
            'price_type' => $this->price_type,
            'starting_price' => $this->starting_price,
            'is_negotiable' => $this->is_negotiable,
            'location' => $this->location,
            'coverage_radius' => $this->coverage_radius,
            'photos' => $this->photos,
            'availability' => $this->availability,
            'tags' => $this->tags,
            'experience_years' => $this->experience_years,
            'estimated_duration' => $this->estimated_duration,
            'status' => $this->status,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
