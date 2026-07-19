<?php

namespace App\Providers;

use App\AI\Contracts\AIProviderInterface;
use App\AI\Providers\AIManager;
use App\AI\Providers\GeminiProvider;
use App\AI\Providers\GroqProvider;
use App\Events\BookingStatusChanged;
use App\Events\ServiceRequestAccepted;
use App\Events\ServiceRequestCancelled;
use App\Events\ServiceRequestCompleted;
use App\Listeners\SendBookingStatusNotification;
use App\Listeners\SendRequestStatusNotification;
use App\Models\ServiceRequest;
use App\Policies\ServiceRequestPolicy;
use App\Services\ServiceRequestService;
use App\Services\AI\AiLogService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ServiceRequestService::class);

        $this->app->bind('ai.gemini', fn () => new GeminiProvider());
        $this->app->bind('ai.groq', fn () => new GroqProvider());

        $this->app->bind(AIProviderInterface::class, function ($app) {
            $driver = config('ai.driver', 'gemini');
            return $driver === 'groq' ? $app->make('ai.groq') : $app->make('ai.gemini');
        });

        $this->app->singleton(AiLogService::class);

        $this->app->bind(AIManager::class, function ($app) {
            $driver = config('ai.driver', 'gemini');
            $primary = $app->make(AIProviderInterface::class);
            $fallback = $driver === 'gemini' ? $app->make('ai.groq') : null;

            return new AIManager($primary, $app->make(AiLogService::class), $fallback);
        });
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
