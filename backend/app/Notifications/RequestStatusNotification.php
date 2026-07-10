<?php

namespace App\Notifications;

use App\Models\ServiceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RequestStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected ServiceRequest $request,
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
            'type' => 'request_status',
            'service_request_id' => $this->request->id,
            'title' => $this->request->title,
            'status' => $this->status,
            'message' => "Request \"{$this->request->title}\" has been {$this->status}.",
        ];
    }

    public function toBroadcast(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = match ($this->status) {
            'accepted' => 'Your request has been accepted!',
            'completed' => 'Request completed!',
            'cancelled' => 'Request cancelled',
            default => 'Request update',
        };

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name}!")
            ->line($this->toDatabase($notifiable)['message'])
            ->action('View Request', url("/requests/{$this->request->id}"))
            ->line('Thank you for using ErrandHub!');
    }
}
