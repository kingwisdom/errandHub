<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgentProfileRequest;
use App\Http\Requests\UpdateAgentProfileRequest;
use App\Http\Resources\AgentProfileResource;
use App\Services\AgentProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentProfileController extends Controller
{
    public function __construct(
        protected AgentProfileService $profileService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return AgentProfileResource::collection(
            $this->profileService->search($request->only([
                'category_id', 'search', 'verified', 'min_experience', 'max_experience',
                'min_rating', 'include_offline', 'latitude', 'longitude', 'distance_km',
                'sort', 'per_page',
            ]))
        );
    }

    public function show($id): JsonResponse
    {
        return AgentProfileResource::make($this->profileService->findById($id))->response();
    }

    public function store(StoreAgentProfileRequest $request): JsonResponse
    {
        $profile = $this->profileService->upsert(
            $request->user()->id,
            $request->validated()
        );

        return AgentProfileResource::make($profile)->response()->setStatusCode(201);
    }

    public function update(UpdateAgentProfileRequest $request, $id): JsonResponse
    {
        $profile = $this->profileService->update(
            $request->user()->id,
            $id,
            $request->validated()
        );

        return AgentProfileResource::make($profile)->response();
    }

    public function myProfile(Request $request): JsonResponse
    {
        return AgentProfileResource::make(
            $this->profileService->findByUser($request->user()->id)
        )->response();
    }
}
