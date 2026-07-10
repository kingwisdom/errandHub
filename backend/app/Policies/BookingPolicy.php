<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Booking $booking): bool
    {
        return $user->id === $booking->client_id
            || $user->id === $booking->provider_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('client');
    }

    public function accept(User $user, Booking $booking): bool
    {
        return $user->id === $booking->provider_id
            && $booking->status === 'pending';
    }

    public function cancel(User $user, Booking $booking): bool
    {
        return ($user->id === $booking->client_id || $user->id === $booking->provider_id)
            && !in_array($booking->status, ['completed', 'cancelled']);
    }
}
