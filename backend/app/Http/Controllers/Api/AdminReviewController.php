<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    public function index(): JsonResponse
    {
        return ReviewResource::collection($this->reviewService->listAll())->response();
    }

    public function flagged(): JsonResponse
    {
        return ReviewResource::collection($this->reviewService->listFlagged())->response();
    }

    public function hide(Request $request, $id): JsonResponse
    {
        $review = $this->reviewService->hideReview($id, $request->user()->id);

        return ReviewResource::make($review)->response();
    }

    public function show(Request $request, $id): JsonResponse
    {
        $review = $this->reviewService->showReview($id, $request->user()->id);

        return ReviewResource::make($review)->response();
    }
}
