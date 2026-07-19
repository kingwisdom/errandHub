<?php

namespace App\Http\Controllers\Api\AI;

use Illuminate\Http\JsonResponse;

class HealthController extends BaseApiController
{
    public function __invoke(): JsonResponse
    {
        return $this->successResponse([
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
        ]);
    }
}
