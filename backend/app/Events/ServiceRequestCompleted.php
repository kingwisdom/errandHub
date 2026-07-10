<?php

namespace App\Events;

use App\Models\ServiceRequest;
use Illuminate\Foundation\Events\Dispatchable;

class ServiceRequestCompleted
{
    use Dispatchable;

    public function __construct(
        public ServiceRequest $serviceRequest,
    ) {}
}
