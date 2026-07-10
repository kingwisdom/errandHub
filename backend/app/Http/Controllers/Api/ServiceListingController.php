<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceListingRequest;
use App\Http\Requests\UpdateServiceListingRequest;
use App\Http\Resources\ServiceListingResource;
use App\Services\ServiceListingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceListingController extends Controller
{
    public function __construct(
        protected ServiceListingService $serviceListingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return ServiceListingResource::collection(
            $this->serviceListingService->listForAgent(
                $request->user()->id,
                $request->only(['status'])
            )
        )->response();
    }

    public function store(StoreServiceListingRequest $request): JsonResponse
    {
        $listing = $this->serviceListingService->create(
            $request->user()->id,
            $request->validated()
        );

        return ServiceListingResource::make($listing)->response()->setStatusCode(201);
    }

    public function show($id): JsonResponse
    {
        return ServiceListingResource::make($this->serviceListingService->findById($id))->response();
    }

    public function update(UpdateServiceListingRequest $request, $id): JsonResponse
    {
        $listing = $this->serviceListingService->update(
            $request->user()->id,
            $id,
            $request->validated()
        );

        return ServiceListingResource::make($listing)->response();
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $this->serviceListingService->delete($request->user()->id, $id);

        return response()->json(null, 204);
    }

    public function browsePublished(Request $request): JsonResponse
    {
        return ServiceListingResource::collection(
            $this->serviceListingService->browse(
                $request->only([
                    'category_id', 'price_type', 'min_price', 'max_price',
                    'is_negotiable', 'experience_years', 'tags', 'verified_agent',
                    'search', 'latitude', 'longitude', 'distance_km',
                    'sort', 'per_page',
                ])
            )
        )->response();
    }

    public function uploadPhotos(Request $request, $id): JsonResponse
    {
        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'required|image|max:5120',
        ]);

        $listing = $this->serviceListingService->uploadPhotos(
            $request->user()->id,
            $id,
            $request->file('photos', [])
        );

        return ServiceListingResource::make($listing)->response();
    }
}
