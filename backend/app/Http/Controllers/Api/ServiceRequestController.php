<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequestRequest;
use App\Http\Requests\UpdateServiceRequestRequest;
use App\Http\Resources\ServiceRequestResource;
use App\Services\ServiceRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function __construct(
        protected ServiceRequestService $serviceRequestService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return ServiceRequestResource::collection(
            $this->serviceRequestService->listForUser(
                $user->id,
                $user->role,
                $request->only(['status', 'category_id'])
            )
        );
    }

    public function store(StoreServiceRequestRequest $request): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->create(
            $request->user()->id,
            $request->validated()
        );

        return ServiceRequestResource::make($serviceRequest)->response()->setStatusCode(201);
    }

    public function show($id): JsonResponse
    {
        return ServiceRequestResource::make($this->serviceRequestService->findById($id))->response();
    }

    public function update(UpdateServiceRequestRequest $request, $id): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->update(
            $request->user()->id,
            $id,
            $request->validated()
        );

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function accept(Request $request, $id): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->accept($request->user()->id, $id);

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function confirm(Request $request, $id): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->confirm($request->user()->id, $id);

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function startTravelling(Request $request, $id): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->startTravelling($request->user()->id, $id);

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function markWaiting(Request $request, $id): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->markWaiting($request->user()->id, $id);

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function start(Request $request, $id): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->startWork($request->user()->id, $id);

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function complete(Request $request, $id): JsonResponse
    {
        $serviceRequest = $this->serviceRequestService->complete($request->user()->id, $id);

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function cancel(Request $request, $id): JsonResponse
    {
        $request->validate(['reason' => 'nullable|string|max:1000']);

        $serviceRequest = $this->serviceRequestService->cancel(
            $request->user()->id,
            $id,
            $request->input('reason')
        );

        return ServiceRequestResource::make($serviceRequest)->response();
    }

    public function browsePublished(Request $request): JsonResponse
    {
        return ServiceRequestResource::collection(
            $this->serviceRequestService->browsePublished(
                $request->only([
                    'category_id', 'priority', 'search', 'budget_min', 'budget_max',
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

        $serviceRequest = $this->serviceRequestService->uploadPhotos(
            $request->user()->id,
            $id,
            $request->file('photos', [])
        );

        return ServiceRequestResource::make($serviceRequest)->response();
    }
}
