<?php

namespace App\Services\AI;

use App\Models\AiLog;
use App\AI\DTOs\AIResponse;

class AiLogService
{
    public function log(AIResponse $response, string $guestUuid): void
    {
        AiLog::create([
            'provider' => $response->provider,
            'model' => $response->model,
            'tokens' => $response->tokens,
            'duration' => $response->duration,
            'guest_uuid' => $guestUuid,
        ]);
    }
}
