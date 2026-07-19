<?php

namespace App\Services\AI;

use App\Models\PromptTemplate;

class AiPromptTemplateService
{
    public function getSystemPrompt(string $module): ?string
    {
        $template = PromptTemplate::where('module', $module)
            ->orderBy('version', 'desc')
            ->first();

        return $template?->system_prompt;
    }

    public function getByName(string $name): ?PromptTemplate
    {
        return PromptTemplate::where('name', $name)->first();
    }

    public function create(array $data): PromptTemplate
    {
        return PromptTemplate::create($data);
    }
}
