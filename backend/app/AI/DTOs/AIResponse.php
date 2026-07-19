<?php

namespace App\AI\DTOs;

class AIResponse
{
    public function __construct(
        public readonly string $content,
        public readonly int $tokens,
        public readonly string $model,
        public readonly string $provider,
        public readonly float $duration,
    ) {}

    public function toArray(): array
    {
        return [
            'content' => $this->content,
            'tokens' => $this->tokens,
            'model' => $this->model,
            'provider' => $this->provider,
            'duration' => $this->duration,
        ];
    }
}
