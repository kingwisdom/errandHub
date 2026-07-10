<?php

namespace App\Broadcasting;

use App\Models\Message;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;

class NewMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public Message $message,
    ) {
        $this->message->loadMissing('sender:id,name,role');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->service_request_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'content' => $this->message->content,
            'type' => $this->message->type,
            'metadata' => $this->message->metadata,
            'sender_id' => $this->message->sender_id,
            'sender' => $this->message->sender,
            'service_request_id' => $this->message->service_request_id,
            'created_at' => $this->message->created_at->toISOString(),
            'read_at' => $this->message->read_at?->toISOString(),
        ];
    }
}
