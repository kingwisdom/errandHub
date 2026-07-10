<?php

namespace App\Services;

use App\Events\BookingStatusChanged;
use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class BookingService
{
    public function listForUser(string $userId, string $role): LengthAwarePaginator
    {
        $query = Booking::with(['client', 'provider', 'serviceRequest', 'serviceListing']);

        if ($role === 'client') {
            $query->where('client_id', $userId);
        } elseif ($role === 'agent') {
            $query->where('provider_id', $userId);
        }

        return $query->latest()->paginate(20);
    }

    public function findById(string $id): Model
    {
        return Booking::with(['client', 'provider', 'serviceRequest', 'serviceListing'])->findOrFail($id);
    }

    public function book(string $clientId, string $providerId, array $data): Booking
    {
        $data['client_id'] = $clientId;
        $data['provider_id'] = $providerId;
        $data['status'] = 'pending';

        $booking = Booking::create($data);

        return $booking->load(['client', 'provider', 'serviceRequest', 'serviceListing']);
    }

    public function accept(string $userId, string $bookingId): Booking
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->provider_id !== $userId) {
            abort(403, 'Only the provider can accept a booking.');
        }

        if ($booking->status !== 'pending') {
            abort(422, 'Booking must be pending to accept.');
        }

        $oldStatus = $booking->status;
        $booking->update(['status' => 'accepted']);
        BookingStatusChanged::dispatch($booking->fresh(), $oldStatus, 'accepted');

        return $booking->load(['client', 'provider', 'serviceRequest', 'serviceListing']);
    }

    public function decline(string $userId, string $bookingId, ?string $reason = null): Booking
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->provider_id !== $userId) {
            abort(403, 'Only the provider can decline a booking.');
        }

        if ($booking->status !== 'pending') {
            abort(422, 'Booking must be pending to decline.');
        }

        $oldStatus = $booking->status;
        $booking->update([
            'status' => 'declined',
            'notes' => $reason ? ($booking->notes ? $booking->notes . "\nDeclined: " . $reason : 'Declined: ' . $reason) : $booking->notes,
        ]);
        BookingStatusChanged::dispatch($booking->fresh(), $oldStatus, 'declined');

        return $booking->load(['client', 'provider', 'serviceRequest', 'serviceListing']);
    }

    public function reschedule(string $userId, string $bookingId, string $newDate): Booking
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->client_id !== $userId && $booking->provider_id !== $userId) {
            abort(403, 'Only the client or provider can reschedule.');
        }

        if (!in_array($booking->status, ['pending', 'accepted'])) {
            abort(422, 'Can only reschedule pending or accepted bookings.');
        }

        $oldStatus = $booking->status;
        $booking->update([
            'scheduled_at' => $newDate,
            'status' => 'rescheduled',
        ]);
        BookingStatusChanged::dispatch($booking->fresh(), $oldStatus, 'rescheduled');

        return $booking->load(['client', 'provider', 'serviceRequest', 'serviceListing']);
    }

    public function cancel(string $userId, string $bookingId): Booking
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->client_id !== $userId && $booking->provider_id !== $userId) {
            abort(403, 'Only the client or provider can cancel.');
        }

        if (in_array($booking->status, ['completed', 'cancelled'])) {
            abort(422, 'Cannot cancel a completed or already cancelled booking.');
        }

        $oldStatus = $booking->status;
        $booking->update(['status' => 'cancelled']);
        BookingStatusChanged::dispatch($booking->fresh(), $oldStatus, 'cancelled');

        return $booking->load(['client', 'provider', 'serviceRequest', 'serviceListing']);
    }

    public function complete(string $providerId, string $bookingId): Booking
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->provider_id !== $providerId) {
            abort(403, 'Only the provider can mark as complete.');
        }

        if ($booking->status !== 'accepted') {
            abort(422, 'Booking must be accepted before completing.');
        }

        $oldStatus = $booking->status;
        $booking->update(['status' => 'completed']);
        BookingStatusChanged::dispatch($booking->fresh(), $oldStatus, 'completed');

        return $booking->load(['client', 'provider', 'serviceRequest', 'serviceListing']);
    }
}
