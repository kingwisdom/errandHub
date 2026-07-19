<?php

namespace App\AI\Providers;

use App\AI\Contracts\AIProviderInterface;
use App\AI\DTOs\AIRequest;
use App\AI\DTOs\AIResponse;
use App\Exceptions\AIProviderException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiProvider implements AIProviderInterface
{
    private string $apiKey;
    private string $model;
    private int $maxContextTokens;
    private bool $webSearch;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
        $this->model = config('services.gemini.model', 'gemini-2.0-flash');
        $this->maxContextTokens = config('services.gemini.max_context_tokens', 6144);
        $this->webSearch = config('services.gemini.web_search', true);

        if (empty($this->apiKey)) {
            throw new AIProviderException(
                message: 'Gemini API key is not configured. Set GEMINI_API_KEY in .env.',
                statusCode: 0,
            );
        }
    }

    public function chat(AIRequest $request): AIResponse
    {
        $startTime = microtime(true);

        $contents = $this->buildContents($request);
        $payload = $this->buildPayload($request, $contents);

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::timeout(90)->post($url, $payload);

        $duration = (microtime(true) - $startTime) * 1000;

        if ($response->failed()) {
            $this->handleError($response->status(), $response->body());
        }

        $data = $response->json();

        if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            Log::error('Gemini API unexpected response structure', ['data' => $data]);
            throw new AIProviderException(
                message: 'AI provider returned an unexpected response format.',
                statusCode: 500,
            );
        }

        $content = $data['candidates'][0]['content']['parts'][0]['text'];
        $tokens = $data['usageMetadata']['totalTokenCount'] ?? 0;

        return new AIResponse(
            content: $content,
            tokens: $tokens,
            model: $this->model,
            provider: $this->getProviderName(),
            duration: $duration,
        );
    }

    public function getProviderName(): string
    {
        return 'gemini';
    }

    public function getModelName(): string
    {
        return $this->model;
    }

    private function buildContents(AIRequest $request): array
    {
        $contents = [];

        $context = $this->truncateContext($request->context);
        foreach ($context as $message) {
            $role = $message['role'] === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $message['content']]],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $request->prompt]],
        ];

        return $contents;
    }

    private function buildPayload(AIRequest $request, array $contents): array
    {
        $payload = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => $request->temperature,
                'maxOutputTokens' => $request->maxTokens,
            ],
        ];

        if ($request->systemPrompt) {
            $payload['systemInstruction'] = [
                'parts' => [['text' => $request->systemPrompt]],
            ];
        }

        if ($this->webSearch) {
            $payload['tools'] = [
                ['googleSearch' => (object) []],
            ];
        }

        return $payload;
    }

    private function truncateContext(array $context): array
    {
        if (empty($context)) {
            return [];
        }

        $totalTokens = 0;
        $truncated = [];

        for ($i = count($context) - 1; $i >= 0; $i--) {
            $text = $context[$i]['content'] ?? '';
            $estimatedTokens = (int) ceil(strlen($text) / 4);

            if ($totalTokens + $estimatedTokens > $this->maxContextTokens) {
                break;
            }

            $totalTokens += $estimatedTokens;
            array_unshift($truncated, $context[$i]);
        }

        return $truncated;
    }

    private function handleError(int $statusCode, string $body): void
    {
        Log::error('Gemini API error', [
            'status_code' => $statusCode,
            'response_body' => $body,
        ]);

        $message = match (true) {
            $statusCode === 429 => 'Rate limit exceeded. Please try again later.',
            $statusCode === 401 || $statusCode === 403 => 'Invalid API key configuration.',
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
