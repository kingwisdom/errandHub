<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreErrandApplicationRequest;
use App\Http\Resources\ErrandApplicationResource;
use App\Services\ErrandApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ErrandApplicationController extends Controller
{
    public function __construct(
        protected ErrandApplicationService $errandApplicationService
    ) {}

    public function store(StoreErrandApplicationRequest $request): JsonResponse
    {
        $application = $this->errandApplicationService->apply(
            $request->user()->id,
            $request->input('service_request_id'),
            $request->validated()
        );

        return ErrandApplicationResource::make($application)->response()->setStatusCode(201);
    }

    public function withdraw(Request $request, $id): JsonResponse
    {
        $application = $this->errandApplicationService->withdraw($request->user()->id, $id);

        return ErrandApplicationResource::make($application)->response();
    }

    public function accept(Request $request, $id): JsonResponse
    {
        $serviceRequest = $this->errandApplicationService->accept($request->user()->id, $id);

        return response()->json(['data' => $serviceRequest]);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $application = $this->errandApplicationService->reject($request->user()->id, $id);

        return ErrandApplicationResource::make($application)->response();
    }

    public function forRequest(Request $request, $requestId): JsonResponse
    {
        return ErrandApplicationResource::collection(
            $this->errandApplicationService->listForRequest($requestId, $request->user()->id)
        )->response();
    }

    public function myApplications(Request $request): JsonResponse
    {
        return ErrandApplicationResource::collection(
            $this->errandApplicationService->listForAgent(
                $request->user()->id,
                $request->only(['status', 'per_page'])
            )
        )->response();
    }
}
