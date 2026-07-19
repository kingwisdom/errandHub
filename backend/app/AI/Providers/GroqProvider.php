<?php

namespace App\AI\Providers;

use App\AI\Contracts\AIProviderInterface;
use App\AI\DTOs\AIRequest;
use App\AI\DTOs\AIResponse;
use App\Exceptions\AIProviderException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqProvider implements AIProviderInterface
{
    private string $apiKey;
    private string $model;
    private int $maxContextTokens;

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key');
        $this->model = config('services.groq.model', 'llama-3.1-8b-instant');
        $this->maxContextTokens = config('services.groq.max_context_tokens', 6144);

        if (empty($this->apiKey)) {
            throw new AIProviderException(
                message: 'Groq API key is not configured. Set GROQ_API_KEY in .env.',
                statusCode: 0,
            );
        }
    }

    public function chat(AIRequest $request): AIResponse
    {
        $startTime = microtime(true);

        $messages = $this->buildMessages($request);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(60)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => $this->model,
            'messages' => $messages,
            'temperature' => $request->temperature,
            'max_tokens' => $request->maxTokens,
        ]);

        $duration = (microtime(true) - $startTime) * 1000;

        if ($response->failed()) {
            $this->handleError($response->status(), $response->body());
        }

        $data = $response->json();

        if (!isset($data['choices'][0]['message']['content'])) {
            Log::error('Groq API unexpected response structure', ['data' => $data]);
            throw new AIProviderException(
                message: 'AI provider returned an unexpected response format.',
                statusCode: 500,
            );
        }

        return new AIResponse(
            content: $data['choices'][0]['message']['content'],
            tokens: $data['usage']['total_tokens'] ?? 0,
            model: $this->model,
            provider: $this->getProviderName(),
            duration: $duration,
        );
    }

    public function getProviderName(): string
    {
        return 'groq';
    }

    public function getModelName(): string
    {
        return $this->model;
    }

    private function buildMessages(AIRequest $request): array
    {
        $messages = [];

        if ($request->systemPrompt) {
            $messages[] = [
                'role' => 'system',
                'content' => $request->systemPrompt,
            ];
        }

        $context = $this->truncateContext($request->context);
        foreach ($context as $message) {
            $messages[] = $message;
        }

        $messages[] = [
            'role' => 'user',
            'content' => $request->prompt,
        ];

        return $messages;
    }

    private function truncateContext(array $context): array
    {
        if (empty($context)) {
            return [];
        }

        $totalChars = 0;
        $truncated = [];

        for ($i = count($context) - 1; $i >= 0; $i--) {
            $messageChars = strlen($context[$i]['content'] ?? '');
            $estimatedTokens = (int) ceil($messageChars / 4);

            if ($totalChars + $estimatedTokens > $this->maxContextTokens) {
                break;
            }

            $totalChars += $estimatedTokens;
            array_unshift($truncated, $context[$i]);
        }

        return $truncated;
    }

    private function handleError(int $statusCode, string $body): void
    {
        Log::error('Groq API error', [
            'status_code' => $statusCode,
            'response_body' => $body,
        ]);

        $message = match (true) {
            $statusCode === 429 => 'Rate limit exceeded. Please try again later.',
            $statusCode === 401 => 'Invalid API key configuration.',
            $statusCode === 400 => 'Invalid request parameters.',
            $statusCode >= 500 => 'AI provider service temporarily unavailable.',
            default => 'AI request failed with status: ' . $statusCode,
        };

        throw new AIProviderException(
            message: $message,
            statusCode: $statusCode,
        );
    }
}
