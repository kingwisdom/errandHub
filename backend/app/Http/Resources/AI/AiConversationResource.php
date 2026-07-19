<?php

namespace App\Http\Resources\AI;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AiConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'guest_uuid' => $this->guest_uuid,
            'title' => $this->title,
            'module' => $this->module,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'messages_count' => $this->whenCounted('messages'),
        ];
    }
}
