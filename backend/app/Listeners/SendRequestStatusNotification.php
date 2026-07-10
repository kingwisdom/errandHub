<?php

namespace App\Listeners;

use App\Events\ServiceRequestAccepted;
use App\Events\ServiceRequestCancelled;
use App\Events\ServiceRequestCompleted;
use App\Notifications\RequestStatusNotification;
use Illuminate\Support\Facades\Notification;

class SendRequestStatusNotification
{
    public function handle(ServiceRequestAccepted|ServiceRequestCancelled|ServiceRequestCompleted $event): void
    {
        $request = $event->serviceRequest;
        $recipients = [];

        if ($event instanceof ServiceRequestAccepted) {
            $recipients[] = $request->client;
            $label = 'accepted';
        } elseif ($event instanceof ServiceRequestCompleted) {
            $recipients[] = $request->client;
            $label = 'completed';
        } elseif ($event instanceof ServiceRequestCancelled) {
            $recipients[] = $request->agent ?? $request->client;
            $label = 'cancelled';
        }

        if (!empty($recipients)) {
            Notification::send($recipients, new RequestStatusNotification($request, $label));
        }
    }
}
