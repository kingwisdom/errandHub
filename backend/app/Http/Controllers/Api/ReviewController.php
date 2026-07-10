<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    public function index(Request $request, $userId = null): JsonResponse
    {
        return ReviewResource::collection(
            $this->reviewService->listForUser($userId)
        );
    }

    public function store(StoreReviewRequest $request, $requestId): JsonResponse
    {
        $review = $this->reviewService->create(
            $request->user()->id,
            $requestId,
            $request->validated()
        );

        return ReviewResource::make($review)->response()->setStatusCode(201);
    }
}
