<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePortfolioItemRequest;
use App\Http\Requests\UpdatePortfolioItemRequest;
use App\Http\Resources\PortfolioResource;
use App\Services\PortfolioService;
use Illuminate\Http\JsonResponse;

class PortfolioController extends Controller
{
    public function __construct(
        protected PortfolioService $portfolioService
    ) {}

    public function index(): JsonResponse
    {
        return PortfolioResource::collection(
            $this->portfolioService->listForAgent(request()->user()->id)
        );
    }

    public function showAgent($agentId): JsonResponse
    {
        return PortfolioResource::collection(
            $this->portfolioService->listPublic($agentId)
        );
    }

    public function store(StorePortfolioItemRequest $request): JsonResponse
    {
        $item = $this->portfolioService->create(
            $request->user()->id,
            $request->validated()
        );

        return PortfolioResource::make($item)->response()->setStatusCode(201);
    }

    public function show($id): JsonResponse
    {
        return PortfolioResource::make($this->portfolioService->findById($id))->response();
    }

    public function update(UpdatePortfolioItemRequest $request, $id): JsonResponse
    {
        $item = $this->portfolioService->update(
            $request->user()->id,
            $id,
            $request->validated()
        );

        return PortfolioResource::make($item)->response();
    }

    public function destroy($id): JsonResponse
    {
        $this->portfolioService->delete(request()->user()->id, $id);

        return response()->json(['message' => 'Portfolio item deleted']);
    }
}
