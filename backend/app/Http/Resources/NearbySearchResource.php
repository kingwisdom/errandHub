<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NearbySearchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->resource;

        return [
            'parsed_query' => $data['parsed_query'] ?? null,
            'internal_results' => $data['internal_results'] ?? [],
            'external_results' => ExternalPlaceResource::collection($data['external_results'] ?? []),
            'external_error' => $data['external_error'] ?? null,
            'meta' => $data['meta'] ?? [],
        ];
    }
}
