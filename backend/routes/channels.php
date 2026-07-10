<?php

use App\Models\ServiceRequest;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{requestId}', function ($user, $requestId) {
    $request = ServiceRequest::find($requestId);

    if (!$request) {
        return false;
    }

    return $user->id === $request->client_id || $user->id === $request->agent_id
        ? ['id' => $user->id, 'name' => $user->name]
        : false;
});
