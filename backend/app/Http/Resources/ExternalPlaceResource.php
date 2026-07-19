<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExternalPlaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'place_id' => $this->place_id,
            'name' => $this->name,
            'rating' => $this->rating,
            'reviews_count' => $this->reviews_count,
            'address' => $this->address,
            'phone' => $this->phone,
            'website' => $this->website,
            'google_url' => $this->google_url,
            'opening_hours' => $this->opening_hours,
            'price_level' => $this->price_level,
            'price_level_text' => $this->price_level_text,
            'photo_url' => $this->photo_url,
            'location' => $this->location,
            'distance_km' => $this->distance_km,
            'types' => $this->types,
            'directions_url' => $this->directions_url,
        ];
    }
}
