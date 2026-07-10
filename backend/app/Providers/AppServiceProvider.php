<?php

namespace App\Providers;

use App\Events\BookingStatusChanged;
use App\Events\ServiceRequestAccepted;
use App\Events\ServiceRequestCancelled;
use App\Events\ServiceRequestCompleted;
use App\Listeners\SendBookingStatusNotification;
use App\Listeners\SendRequestStatusNotification;
use App\Models\ServiceRequest;
use App\Policies\ServiceRequestPolicy;
use App\Services\ServiceRequestService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ServiceRequestService::class);
    }

    public function boot(): void
    {
        Gate::policy(ServiceRequest::class, ServiceRequestPolicy::class);

        Event::listen(
            ServiceRequestAccepted::class,
            SendRequestStatusNotification::class,
        );
        Event::listen(
            ServiceRequestCompleted::class,
            SendRequestStatusNotification::class,
        );
        Event::listen(
            ServiceRequestCancelled::class,
            SendRequestStatusNotification::class,
        );
        Event::listen(
            BookingStatusChanged::class,
            SendBookingStatusNotification::class,
        );
    }
}
