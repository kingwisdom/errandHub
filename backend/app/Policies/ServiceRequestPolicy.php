<?php

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;

class ServiceRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ServiceRequest $request): bool
    {
        return $user->id === $request->client_id
            || $user->id === $request->agent_id
            || $request->status === 'published';
    }

    public function create(User $user): bool
    {
        return $user->hasRole('client');
    }

    public function update(User $user, ServiceRequest $request): bool
    {
        return $user->id === $request->client_id
            && in_array($request->status, ['draft', 'published']);
    }

    public function accept(User $user, ServiceRequest $request): bool
    {
        return $user->hasRole('agent')
            && $request->status === 'published';
    }

    public function confirm(User $user, ServiceRequest $request): bool
    {
        return $user->id === $request->client_id
            && $request->status === 'accepted';
    }
}
