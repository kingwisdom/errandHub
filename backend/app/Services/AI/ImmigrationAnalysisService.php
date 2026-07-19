<?php

namespace App\Services\AI;

use App\AI\DTOs\AIRequest;
use App\AI\Providers\AIManager;
use App\Models\UserWorkflow;

class ImmigrationAnalysisService
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
            moduleId: 'immigration',
            guestUuid: $userWorkflow->guest_uuid,
        );

        $response = $this->aiManager->chat($aiRequest);

        $this->logService->log($response, $userWorkflow->guest_uuid);

        return json_decode($response->content, true) ?? ['raw' => $response->content];
    }

    protected function buildPrompt(array $data): string
    {
        return "Analyze the following immigration profile and provide eligibility assessment:\n\n" .
            json_encode($data, JSON_PRETTY_PRINT);
    }

    protected function getSystemPrompt(): string
    {
        return "You are an immigration advisor. Analyze the user's profile and provide:
        1. Eligibility score
        2. Visa recommendations
        3. Requirements checklist
        4. Timeline estimate
        5. Action items with priorities
        Return the response as a JSON object with these keys: eligibility_score, visa_recommendations, requirements_checklist, timeline, action_items.";
    }
}
