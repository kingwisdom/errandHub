<?php

namespace App\Services\AI;

use App\Repositories\AiConversationRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\AiConversation;

class AiConversationService
{
    public function __construct(
        protected AiConversationRepository $conversationRepository
    ) {}

    public function listByGuestUuid(string $guestUuid, int $perPage = 20): LengthAwarePaginator
    {
        return $this->conversationRepository->getByGuestUuid($guestUuid, $perPage);
    }

    public function getByIdAndGuestUuid(string $id, string $guestUuid): ?AiConversation
    {
        return $this->conversationRepository->getByIdAndGuestUuid($id, $guestUuid);
    }

    public function create(string $guestUuid, ?string $title = null, string $module = 'chat'): AiConversation
    {
        return $this->conversationRepository->create([
            'guest_uuid' => $guestUuid,
            'title' => $title,
            'module' => $module,
        ]);
    }

    public function delete(string $id, string $guestUuid): bool
    {
        return $this->conversationRepository->deleteByIdAndGuestUuid($id, $guestUuid);
    }
}
