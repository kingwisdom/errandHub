<?php

namespace App\Services\AI;

use App\AI\DTOs\AIRequest;
use App\AI\Providers\AIManager;
use App\Models\UserWorkflow;

class FinanceAnalysisService
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
            moduleId: 'finance',
            guestUuid: $userWorkflow->guest_uuid,
        );

        $response = $this->aiManager->chat($aiRequest);

        $this->logService->log($response, $userWorkflow->guest_uuid);

        return json_decode($response->content, true) ?? ['raw' => $response->content];
    }

    protected function buildPrompt(array $data): string
    {
        return "Analyze the following financial data and provide a comprehensive financial analysis:\n\n" .
            json_encode($data, JSON_PRETTY_PRINT);
    }

    protected function getSystemPrompt(): string
    {
        return "You are a financial advisor. Analyze the user's financial data and provide:
        1. Income summary
        2. Expense breakdown
        3. Budget comparison
        4. Savings plan
        5. Actionable insights and recommendations
        Return the response as a JSON object with these keys: income_summary, expense_breakdown, budget_comparison, savings_plan, recommendations.";
    }
}
