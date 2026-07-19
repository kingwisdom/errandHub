<?php

namespace App\Services\AI;

use App\AI\DTOs\AIRequest;
use App\AI\Providers\AIManager;
use App\Models\UserWorkflow;

class ShoppingAnalysisService
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
            moduleId: 'shopping',
            guestUuid: $userWorkflow->guest_uuid,
        );

        $response = $this->aiManager->chat($aiRequest);

        $this->logService->log($response, $userWorkflow->guest_uuid);

        return json_decode($response->content, true) ?? ['raw' => $response->content];
    }

    protected function buildPrompt(array $data): string
    {
        return "Analyze the following shopping request and provide recommendations:\n\n" .
            json_encode($data, JSON_PRETTY_PRINT);
    }

    protected function getSystemPrompt(): string
    {
        return "You are a shopping advisor. Analyze the user's request and provide:
        1. Product summary
        2. Top picks with prices
        3. Vendor comparison
        4. Price analysis
        5. Recommendations
        Return the response as a JSON object with these keys: product_summary, top_picks, vendor_comparison, price_analysis, recommendations.";
    }
}
