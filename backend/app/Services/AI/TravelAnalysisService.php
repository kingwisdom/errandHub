<?php

namespace App\Services\AI;

use App\AI\DTOs\AIRequest;
use App\AI\Providers\AIManager;
use App\Models\UserWorkflow;

class TravelAnalysisService
{
    public function __construct(
        protected AIManager $aiManager,
        protected AiLogService $logService
    ) {}

    public function analyze(UserWorkflow $userWorkflow): array
    {
        $data = $userWorkflow->data ?? [];

        $prompt = $this->buildPrompt($data);

        $aiRequest = new AIRequest(
            prompt: $prompt,
            systemPrompt: $this->getSystemPrompt(),
            moduleId: 'travel',
            guestUuid: $userWorkflow->guest_uuid,
        );

        $response = $this->aiManager->chat($aiRequest);

        $this->logService->log($response, $userWorkflow->guest_uuid);

        return json_decode($response->content, true) ?? ['raw' => $response->content];
    }

    protected function buildPrompt(array $data): string
    {
        return "Create a travel plan based on the following details:\n\n" .
            json_encode($data, JSON_PRETTY_PRINT);
    }

    protected function getSystemPrompt(): string
    {
        return "You are a travel advisor. Create a comprehensive travel plan including:
        1. Trip summary
        2. Daily itinerary
        3. Cost breakdown
        4. Nearby attractions
        5. Packing tips
        6. Recommendations
        Return the response as a JSON object with these keys: trip_summary, daily_itinerary, cost_breakdown, nearby_attractions, packing_tips, recommendations.";
    }
}
