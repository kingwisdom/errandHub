<?php

namespace App\Services\AI;

use App\AI\DTOs\AIRequest;
use App\AI\Providers\AIManager;
use App\Models\AiConversation;
use App\Repositories\AiMessageRepository;
use App\Repositories\AiConversationRepository;
use Illuminate\Database\Eloquent\Collection;

class AiMessageService
{
    public function __construct(
        protected AiMessageRepository $messageRepository,
        protected AiConversationRepository $conversationRepository,
        protected AIManager $aiManager,
        protected AiPromptTemplateService $promptTemplateService
    ) {}

    public function getByConversationId(string $conversationId): Collection
    {
        return $this->messageRepository->getByConversationId($conversationId);
    }

    public function send(
        string $conversationId,
        string $guestUuid,
        string $content,
        ?string $systemPrompt = null
    ): array {
        $conversation = $this->conversationRepository->getByIdAndGuestUuid($conversationId, $guestUuid);

        if (!$conversation) {
            throw new \Exception('Conversation not found');
        }

        $userMessage = $this->messageRepository->create([
            'conversation_id' => $conversationId,
            'role' => 'user',
            'content' => $content,
        ]);

        $context = $this->buildContext($conversationId);

        $resolvedSystemPrompt = $systemPrompt ?? $this->promptTemplateService->getSystemPrompt(
            $conversation->module
        );

        $aiRequest = new AIRequest(
            prompt: $content,
            systemPrompt: $resolvedSystemPrompt,
            context: $context,
            moduleId: $conversation->module,
            guestUuid: $guestUuid,
        );

        $aiResponse = $this->aiManager->chat($aiRequest);

        $assistantMessage = $this->messageRepository->create([
            'conversation_id' => $conversationId,
            'role' => 'assistant',
            'content' => $aiResponse->content,
            'tokens' => $aiResponse->tokens,
        ]);

        if (empty($conversation->title) && $conversation->messages()->count() <= 2) {
            $conversation->update([
                'title' => substr($content, 0, 100),
            ]);
        }

        return [
            'user_message' => $userMessage,
            'assistant_message' => $assistantMessage,
            'ai_metadata' => $aiResponse->toArray(),
        ];
    }

    protected function buildContext(string $conversationId): array
    {
        $messages = $this->messageRepository->getByConversationId($conversationId);

        return $messages->map(fn ($msg) => [
            'role' => $msg->role,
            'content' => $msg->content,
        ])->toArray();
    }
}
