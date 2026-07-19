<?php

namespace App\Repositories;

use App\Models\AiConversation;
use Illuminate\Pagination\LengthAwarePaginator;

class AiConversationRepository
{
    public function getByGuestUuid(string $guestUuid, int $perPage = 20): LengthAwarePaginator
    {
        return AiConversation::where('guest_uuid', $guestUuid)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }

    public function getByIdAndGuestUuid(string $id, string $guestUuid): ?AiConversation
    {
        return AiConversation::where('id', $id)
            ->where('guest_uuid', $guestUuid)
            ->first();
    }

    public function create(array $data): AiConversation
    {
        return AiConversation::create($data);
    }

    public function deleteByIdAndGuestUuid(string $id, string $guestUuid): bool
    {
        $conversation = $this->getByIdAndGuestUuid($id, $guestUuid);

        if (!$conversation) {
            return false;
        }

        $conversation->delete();
        return true;
    }
}
