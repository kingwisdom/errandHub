<?php

namespace App\Http\Controllers\Api\AI;

use App\Models\AiConversation;
use App\Http\Resources\AiConversationResource;
use App\Services\AI\AiConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends BaseApiController
{
    public function __construct(
        protected AiConversationService $conversationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $conversations = $this->conversationService->listByGuestUuid($guestUuid);

        return $this->paginatedResponse($conversations);
    }

    public function store(Request $request): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'module' => 'nullable|string|max:50',
        ]);

        $conversation = $this->conversationService->create(
            $guestUuid,
            $validated['title'] ?? null,
            $validated['module'] ?? 'chat'
        );

        return $this->successResponse(new AiConversationResource($conversation), 'Conversation created', 201);
    }

    public function show(string $id): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $conversation = $this->conversationService->getByIdAndGuestUuid($id, $guestUuid);

        if (!$conversation) {
            return $this->errorResponse('Conversation not found', 404);
        }

        return $this->successResponse(new AiConversationResource($conversation));
    }

    public function destroy(string $id): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $deleted = $this->conversationService->delete($id, $guestUuid);

        if (!$deleted) {
            return $this->errorResponse('Conversation not found', 404);
        }

        return $this->successResponse(null, 'Conversation deleted');
    }
}
