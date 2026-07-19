<?php

namespace App\AI\DTOs;

class AIRequest
{
    public function __construct(
        public readonly string $prompt,
        public readonly ?string $systemPrompt = null,
        public readonly array $context = [],
        public readonly float $temperature = 0.7,
        public readonly int $maxTokens = 1024,
        public readonly ?string $moduleId = null,
        public readonly ?string $guestUuid = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            prompt: $data['prompt'],
            systemPrompt: $data['system_prompt'] ?? null,
            context: $data['context'] ?? [],
            temperature: $data['temperature'] ?? 0.7,
            maxTokens: $data['max_tokens'] ?? 1024,
            moduleId: $data['module_id'] ?? null,
            guestUuid: $data['guest_uuid'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'prompt' => $this->prompt,
            'system_prompt' => $this->systemPrompt,
            'context' => $this->context,
            'temperature' => $this->temperature,
            'max_tokens' => $this->maxTokens,
            'module_id' => $this->moduleId,
            'guest_uuid' => $this->guestUuid,
        ];
    }
}
