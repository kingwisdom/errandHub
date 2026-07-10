<?php

namespace App\Services;

use App\Broadcasting\NewMessageSent;
use App\Models\Message;
use App\Models\ServiceRequest;
use Illuminate\Database\Eloquent\Collection;

class MessageService
{
    public function listForRequest(string $userId, string $requestId): Collection
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $userId && $request->agent_id !== $userId) {
            abort(403);
        }

        return Message::with('sender')
            ->where('service_request_id', $requestId)
            ->orderBy('created_at')
            ->get();
    }

    public function send(string $userId, string $requestId, array $data): Message
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $userId && $request->agent_id !== $userId) {
            abort(403);
        }

        $data['service_request_id'] = $requestId;
        $data['sender_id'] = $userId;

        if (isset($data['file']) && $data['file'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['file']->store('chat-files', 'public');
            $data['file_url'] = $path;
            $data['content'] = $data['file']->getClientOriginalName();
            unset($data['file']);
        }

        if (isset($data['metadata']) && is_string($data['metadata'])) {
            $data['metadata'] = json_decode($data['metadata'], true);
        }

        $message = Message::create($data)->load('sender:id,name');

        broadcast(new NewMessageSent($message))->toOthers();

        return $message;
    }

    public function markAsRead(string $userId, string $requestId): int
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $userId && $request->agent_id !== $userId) {
            abort(403);
        }

        return Message::where('service_request_id', $requestId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
