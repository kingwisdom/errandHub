<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'service_request_id' => $this->service_request_id,
            'sender' => UserResource::make($this->whenLoaded('sender')),
            'content' => $this->content,
            'type' => $this->type,
            'metadata' => $this->metadata,
            'file_url' => $this->file_url,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}
