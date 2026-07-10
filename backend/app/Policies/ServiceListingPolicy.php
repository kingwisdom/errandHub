<?php

namespace App\Policies;

use App\Models\ServiceListing;
use App\Models\User;

class ServiceListingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ServiceListing $listing): bool
    {
        return $user->id === $listing->agent_id || $listing->status === 'active';
    }

    public function create(User $user): bool
    {
        return $user->hasRole('agent');
    }

    public function update(User $user, ServiceListing $listing): bool
    {
        return $user->id === $listing->agent_id;
    }

    public function delete(User $user, ServiceListing $listing): bool
    {
        return $user->id === $listing->agent_id;
    }
}
