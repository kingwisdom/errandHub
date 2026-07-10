<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\PortfolioItem;
use App\Models\ServiceRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class PortfolioService
{
    public function listForAgent(string $userId): Collection
    {
        return PortfolioItem::where('agent_id', $userId)
            ->with(['category', 'serviceRequest'])
            ->latest()
            ->get();
    }

    public function listPublic(string $agentId): Collection
    {
        $profile = AgentProfile::find($agentId);
        $userId = $profile ? $profile->user_id : $agentId;

        return PortfolioItem::where('agent_id', $userId)
            ->with(['category', 'serviceRequest'])
            ->latest()
            ->get();
    }

    public function findById(string $id): PortfolioItem
    {
        return PortfolioItem::with(['category', 'serviceRequest'])->findOrFail($id);
    }

    public function create(string $agentId, array $data): PortfolioItem
    {
        if (!empty($data['service_request_id'])) {
            $this->validateServiceRequest($agentId, $data['service_request_id']);
        }

        $paths = [];
        foreach ($data['images'] as $image) {
            $paths[] = $image->store('portfolio', 'public');
        }

        $data['agent_id'] = $agentId;
        $data['images'] = $paths;

        return PortfolioItem::create($data);
    }

    public function update(string $agentId, string $id, array $data): PortfolioItem
    {
        $item = PortfolioItem::where('agent_id', $agentId)->findOrFail($id);

        if (isset($data['service_request_id']) && $data['service_request_id'] !== null) {
            $this->validateServiceRequest($agentId, $data['service_request_id']);
        }

        if (isset($data['images'])) {
            foreach ($item->images as $oldPath) {
                Storage::disk('public')->delete($oldPath);
            }

            $paths = [];
            foreach ($data['images'] as $image) {
                $paths[] = $image->store('portfolio', 'public');
            }
            $data['images'] = $paths;
        }

        $item->update($data);

        return $item->load(['category', 'serviceRequest']);
    }

    public function delete(string $agentId, string $id): void
    {
        $item = PortfolioItem::where('agent_id', $agentId)->findOrFail($id);

        foreach ($item->images as $path) {
            Storage::disk('public')->delete($path);
        }

        $item->delete();
    }

    public function getCompletedRequests(string $agentId): Collection
    {
        return ServiceRequest::where('agent_id', $agentId)
            ->where('status', 'completed')
            ->select('id', 'title', 'status', 'updated_at')
            ->latest()
            ->get();
    }

    private function validateServiceRequest(string $agentId, string $requestId): void
    {
        $request = ServiceRequest::where('id', $requestId)
            ->where('agent_id', $agentId)
            ->where('status', 'completed')
            ->first();

        if (!$request) {
            abort(422, 'The selected service request must be a completed task assigned to you.');
        }
    }
}
