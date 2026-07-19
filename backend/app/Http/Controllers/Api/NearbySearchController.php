<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NearbySearchResource;
use App\Services\NearbySearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NearbySearchController extends Controller
{
    public function __construct(
        protected NearbySearchService $searchService
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|max:200',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:500|max:50000',
        ]);

        $results = $this->searchService->search($request->only([
            'query', 'latitude', 'longitude', 'radius',
        ]));

        return NearbySearchResource::make($results)->response();
    }
}
