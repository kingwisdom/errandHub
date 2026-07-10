<?php

namespace App\Listeners;

use App\Events\BookingStatusChanged;
use App\Notifications\BookingStatusNotification;
use Illuminate\Support\Facades\Notification;

class SendBookingStatusNotification
{
    public function handle(BookingStatusChanged $event): void
    {
        $booking = $event->booking;
        $recipients = [];

        if ($event->newStatus === 'accepted' || $event->newStatus === 'declined') {
            $recipients[] = $booking->client;
        } elseif ($event->newStatus === 'cancelled') {
            $recipients[] = $booking->provider;
        } elseif ($event->newStatus === 'completed') {
            $recipients[] = $booking->client;
        } elseif ($event->newStatus === 'rescheduled') {
            $recipients[] = $booking->client_id === auth()->id() ? $booking->provider : $booking->client;
        }

        if (!empty($recipients)) {
            Notification::send($recipients, new BookingStatusNotification($booking, $event->newStatus));
        }
    }
}
