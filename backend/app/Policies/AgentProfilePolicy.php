<?php

namespace App\Policies;

use App\Models\User;

class AgentProfilePolicy
{
    public function create(User $user): bool
    {
        return $user->hasRole('agent');
    }

    public function update(User $user, int $profileUserId): bool
    {
        return $user->id === $profileUserId;
    }

    public function viewOwn(User $user): bool
    {
        return $user->hasRole('agent');
    }
}
