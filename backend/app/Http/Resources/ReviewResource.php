<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'service_request_id' => $this->service_request_id,
            'reviewer' => UserResource::make($this->whenLoaded('reviewer')),
            'reviewee' => UserResource::make($this->whenLoaded('reviewee')),
            'rating' => $this->rating,
            'communication_rating' => $this->communication_rating,
            'professionalism_rating' => $this->professionalism_rating,
            'timeliness_rating' => $this->timeliness_rating,
            'quality_rating' => $this->quality_rating,
            'comment' => $this->comment,
            'is_visible' => $this->is_visible,
            'created_at' => $this->created_at,
        ];
    }
}
