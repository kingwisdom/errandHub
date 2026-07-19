<?php

namespace App\Http\Controllers\Api\AI;

use App\Exceptions\AIProviderException;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\AiMessageResource;
use App\Services\AI\AiMessageService;
use App\Models\AiConversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends BaseApiController
{
    public function __construct(
        protected AiMessageService $messageService
    ) {}

    public function index(Request $request, string $conversationId): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $conversation = AiConversation::where('id', $conversationId)
            ->where('guest_uuid', $guestUuid)
            ->first();

        if (!$conversation) {
            return $this->errorResponse('Conversation not found', 404);
        }

        $messages = $this->messageService->getByConversationId($conversationId);

        return $this->successResponse(AiMessageResource::collection($messages));
    }

    public function store(SendMessageRequest $request, string $conversationId): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        try {
            $result = $this->messageService->send(
                $conversationId,
                $guestUuid,
                $request->validated('content'),
                $request->validated('system_prompt')
            );

            return $this->successResponse([
                'user_message' => new AiMessageResource($result['user_message']),
                'assistant_message' => new AiMessageResource($result['assistant_message']),
                'ai_metadata' => $result['ai_metadata'],
            ], 'Message sent');
        } catch (AIProviderException $e) {
            return $this->errorResponse(
                'AI service error: ' . $e->getMessage(),
                $e->getStatusCode()
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to send message', 500);
        }
    }
}
