<?php

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;

class ReviewPolicy
{
    public function create(User $user, int $requestId): bool
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->status !== 'completed') {
            return false;
        }

        return $user->id === $request->client_id
            || $user->id === $request->agent_id;
    }
}
