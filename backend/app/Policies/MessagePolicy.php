<?php

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;

class MessagePolicy
{
    public function viewAny(User $user, ServiceRequest $request): bool
    {
        return $user->id === $request->client_id
            || $user->id === $request->agent_id;
    }

    public function create(User $user, ServiceRequest $request): bool
    {
        return $user->id === $request->client_id
            || $user->id === $request->agent_id;
    }
}
