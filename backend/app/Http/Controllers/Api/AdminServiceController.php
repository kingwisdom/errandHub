<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceListingResource;
use App\Models\ServiceListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ServiceListing::with(['agent', 'category']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $services = $query->latest()->paginate($request->get('per_page', 20));

        return ServiceListingResource::collection($services)->response();
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,inactive,paused',
        ]);

        $service = ServiceListing::findOrFail($id);
        $service->update(['status' => $request->status]);

        return ServiceListingResource::make($service->load(['agent', 'category']))->response();
    }
}
