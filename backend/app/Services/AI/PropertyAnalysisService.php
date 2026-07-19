<?php

namespace App\Services\AI;

use App\AI\DTOs\AIRequest;
use App\AI\Providers\AIManager;
use App\Models\UserWorkflow;

class PropertyAnalysisService
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
            moduleId: 'property',
            guestUuid: $userWorkflow->guest_uuid,
        );

        $response = $this->aiManager->chat($aiRequest);

        $this->logService->log($response, $userWorkflow->guest_uuid);

        return json_decode($response->content, true) ?? ['raw' => $response->content];
    }

    protected function buildPrompt(array $data): string
    {
        return "Analyze the following property details and provide assessment:\n\n" .
            json_encode($data, JSON_PRETTY_PRINT);
    }

    protected function getSystemPrompt(): string
    {
        return "You are a property advisor. Analyze the property details and provide:
        1. Property summary
        2. Risk assessment
        3. Affordability check
        4. Mortgage options
        5. Area insights
        6. Recommendation
        Return the response as a JSON object with these keys: property_summary, risk_assessment, affordability_check, mortgage_options, area_insights, recommendation.";
    }
}
