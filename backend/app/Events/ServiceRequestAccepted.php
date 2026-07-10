<?php

namespace App\Events;

use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class ServiceRequestAccepted
{
    use Dispatchable;

    public function __construct(
        public ServiceRequest $serviceRequest,
        public User $agent,
    ) {}
}
