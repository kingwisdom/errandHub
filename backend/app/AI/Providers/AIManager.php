<?php

namespace App\AI\Providers;

use App\AI\Contracts\AIProviderInterface;
use App\AI\DTOs\AIRequest;
use App\AI\DTOs\AIResponse;
use App\Exceptions\AIProviderException;
use App\Services\AI\AiLogService;
use Illuminate\Support\Facades\Log;

class AIManager
{
    protected AIProviderInterface $provider;
    protected ?AIProviderInterface $fallbackProvider;
    protected AiLogService $aiLogService;

    public function __construct(AIProviderInterface $provider, AiLogService $aiLogService, ?AIProviderInterface $fallbackProvider = null)
    {
        $this->provider = $provider;
        $this->fallbackProvider = $fallbackProvider;
        $this->aiLogService = $aiLogService;
    }

    public function chat(AIRequest $request): AIResponse
    {
        try {
            $response = $this->provider->chat($request);

            if ($request->guestUuid) {
                $this->aiLogService->log($response, $request->guestUuid);
            }

            return $response;
        } catch (AIProviderException $e) {
            if ($e->getStatusCode() === 429 && $this->fallbackProvider) {
                Log::warning('Primary AI provider rate limited, falling back', [
                    'primary' => $this->provider->getProviderName(),
                    'fallback' => $this->fallbackProvider->getProviderName(),
                ]);

                try {
                    $response = $this->fallbackProvider->chat($request);

                    if ($request->guestUuid) {
                        $this->aiLogService->log($response, $request->guestUuid);
                    }

                    return $response;
                } catch (\Exception $fallbackException) {
                    Log::error('Fallback AI provider also failed', [
                        'error' => $fallbackException->getMessage(),
                    ]);
                }
            }

            throw $e;
        }
    }

    public function getProviderName(): string
    {
        return $this->provider->getProviderName();
    }
}
