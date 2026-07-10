<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(
        protected MessageService $messageService
    ) {}

    public function index(Request $request, $requestId): JsonResponse
    {
        return MessageResource::collection(
            $this->messageService->listForRequest($request->user()->id, $requestId)
        )->response();
    }

    public function store(StoreMessageRequest $request, $requestId): JsonResponse
    {
        $message = $this->messageService->send(
            $request->user()->id,
            $requestId,
            $request->validated()
        );

        return MessageResource::make($message)->response()->setStatusCode(201);
    }

    public function markAsRead(Request $request, $requestId): JsonResponse
    {
        $count = $this->messageService->markAsRead($request->user()->id, $requestId);

        return response()->json(['marked_read' => $count]);
    }
}
