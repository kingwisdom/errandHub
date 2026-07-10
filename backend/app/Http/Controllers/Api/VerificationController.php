<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VerificationResource;
use App\Services\VerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function __construct(
        protected VerificationService $verificationService
    ) {}

    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:government_id,address,business',
            'documents' => 'required|array',
            'documents.*' => 'file|mimes:jpeg,png,jpg,pdf|max:10240',
        ]);

        $paths = [];
        foreach ($request->file('documents') as $doc) {
            $paths[] = $doc->store('verifications', 'public');
        }

        $item = $this->verificationService->submit(
            $request->user()->id,
            $request->type,
            $paths
        );

        return VerificationResource::make($item)->response()->setStatusCode(201);
    }

    public function myRequests(Request $request): JsonResponse
    {
        return VerificationResource::collection(
            $this->verificationService->listForUser($request->user()->id)
        )->response();
    }

    public function pending(): JsonResponse
    {
        return VerificationResource::collection(
            $this->verificationService->listPending()
        )->response();
    }

    public function all(Request $request): JsonResponse
    {
        return VerificationResource::collection(
            $this->verificationService->listAll($request->get('status'))
        )->response();
    }

    public function approve(Request $request, $id): JsonResponse
    {
        $request->validate(['note' => 'nullable|string']);

        $item = $this->verificationService->approve($id, $request->user()->id, $request->note);

        return VerificationResource::make($item)->response();
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate(['note' => 'required|string']);

        $item = $this->verificationService->reject($id, $request->user()->id, $request->note);

        return VerificationResource::make($item)->response();
    }
}
