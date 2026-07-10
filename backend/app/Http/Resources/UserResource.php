<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'is_verified' => $this->is_verified,
            'agent_profile' => AgentProfileResource::make($this->whenLoaded('agentProfile')),
            'created_at' => $this->created_at,
        ];

        if ($request->user()) {
            $data['email'] = $this->email;
            $data['phone'] = $this->phone;
            $data['email_verified_at'] = $this->email_verified_at;
            $data['phone_verified_at'] = $this->phone_verified_at;
        }

        return $data;
    }
}
