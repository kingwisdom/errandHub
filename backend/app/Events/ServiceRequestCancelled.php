<?php

namespace App\Events;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class ServiceRequestCancelled
{
    use Dispatchable;

    public function __construct(
        public ServiceRequest $serviceRequest,
        public User $cancelledBy,
        public ?string $reason,
    ) {}
}
