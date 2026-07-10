<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Booking $booking,
        protected string $status,
    ) {}

    public function via(object $notifiable): array
    {
        $prefs = $notifiable->notificationPreferences;
        $channels = ['broadcast'];

        if (!$prefs || $prefs->database_notifications) {
            $channels[] = 'database';
        }
        if ((!$prefs || $prefs->email_notifications) && $notifiable->email) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'booking_status',
            'booking_id' => $this->booking->id,
            'status' => $this->status,
            'message' => "Booking has been {$this->status}.",
        ];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = match ($this->status) {
            'accepted' => 'Booking accepted!',
            'declined' => 'Booking declined',
            'cancelled' => 'Booking cancelled',
            'completed' => 'Booking completed!',
            'rescheduled' => 'Booking rescheduled',
            default => 'Booking update',
        };

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name}!")
            ->line($this->toDatabase($notifiable)['message'])
            ->action('View Booking', url("/bookings"))
            ->line('Thank you for using ErrandHub!');
    }
}
