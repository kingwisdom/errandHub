<?php

namespace App\Repositories;

use App\Models\AiMessage;
use Illuminate\Database\Eloquent\Collection;

class AiMessageRepository
{
    public function getByConversationId(string $conversationId): Collection
    {
        return AiMessage::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function create(array $data): AiMessage
    {
        return AiMessage::create($data);
    }
}
