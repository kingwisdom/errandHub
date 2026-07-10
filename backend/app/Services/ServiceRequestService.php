<?php

namespace App\Services;

use App\Events\ServiceRequestAccepted;
use App\Events\ServiceRequestCancelled;
use App\Events\ServiceRequestCompleted;
use App\Models\ServiceRequest;
use App\Models\ServiceRequestStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ServiceRequestService
{
    public function listForUser(string $userId, string $role, array $filters): LengthAwarePaginator
    {
        $query = ServiceRequest::with(['client', 'agent', 'category', 'statuses']);

        if ($role === 'client') {
            $query->where('client_id', $userId);
        } elseif ($role === 'agent') {
            $query->where(function (Builder $q) use ($userId) {
                $q->where('agent_id', $userId)
                  ->orWhere('status', 'published');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        return $this->applySort($query, $filters['sort'] ?? 'newest')
            ->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function findById(string $id): Model
    {
        return ServiceRequest::with(['client', 'agent', 'category', 'statuses.user'])
            ->withCount('applications')
            ->findOrFail($id);
    }

    public function create(string $clientId, array $data): ServiceRequest
    {
        $data['client_id'] = $clientId;
        $data['status'] = 'published';

        $request = ServiceRequest::create($data);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => null,
            'to_status' => 'published',
            'user_id' => $clientId,
        ]);

        return $request->load(['client', 'category']);
    }

    public function update(string $userId, string $requestId, array $data): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $userId) {
            abort(403, 'Only the client can update this request.');
        }

        if (!in_array($request->status, ['draft', 'published'])) {
            abort(422, 'Cannot update request in current status.');
        }

        $request->update($data);

        return $request->load(['client', 'category']);
    }

    public function accept(string $agentId, string $requestId): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->status !== 'published') {
            abort(422, 'Request is not available for acceptance.');
        }

        $request->update([
            'agent_id' => $agentId,
            'status' => 'accepted',
        ]);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => 'published',
            'to_status' => 'accepted',
            'user_id' => $agentId,
        ]);

        ServiceRequestAccepted::dispatch($request->fresh(), $request->agent);
    }

    public function confirm(string $clientId, string $requestId): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $clientId) {
            abort(403, 'Only the client can confirm an agent.');
        }

        if ($request->status !== 'accepted') {
            abort(422, 'Request must be accepted before confirmation.');
        }

        $request->update(['status' => 'client_confirmed']);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => 'accepted',
            'to_status' => 'client_confirmed',
            'user_id' => $clientId,
        ]);

        return $request;
    }

    public function startTravelling(string $agentId, string $requestId): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->agent_id !== $agentId) {
            abort(403, 'Only the assigned agent can update status.');
        }

        if (!in_array($request->status, ['accepted', 'client_confirmed'])) {
            abort(422, 'Cannot start travelling in current status.');
        }

        $fromStatus = $request->status;
        $request->update(['status' => 'travelling']);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => $fromStatus,
            'to_status' => 'travelling',
            'user_id' => $agentId,
        ]);

        return $request;
    }

    public function markWaiting(string $agentId, string $requestId): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->agent_id !== $agentId) {
            abort(403, 'Only the assigned agent can update status.');
        }

        if ($request->status !== 'travelling') {
            abort(422, 'Must be travelling before marking waiting.');
        }

        $request->update(['status' => 'waiting']);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => 'travelling',
            'to_status' => 'waiting',
            'user_id' => $agentId,
        ]);

        return $request;
    }

    public function startWork(string $agentId, string $requestId): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->agent_id !== $agentId) {
            abort(403, 'Only the assigned agent can start work.');
        }

        if (!in_array($request->status, ['client_confirmed', 'travelling', 'waiting'])) {
            abort(422, 'Cannot start work in current status.');
        }

        $fromStatus = $request->status;
        $request->update(['status' => 'in_progress']);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => $fromStatus,
            'to_status' => 'in_progress',
            'user_id' => $agentId,
        ]);

        return $request;
    }

    public function complete(string $agentId, string $requestId): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->agent_id !== $agentId) {
            abort(403, 'Only the assigned agent can complete this request.');
        }

        if ($request->status !== 'in_progress') {
            abort(422, 'Request must be in progress before completing.');
        }

        $request->update(['status' => 'completed']);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => 'in_progress',
            'to_status' => 'completed',
            'user_id' => $agentId,
        ]);

        ServiceRequestCompleted::dispatch($request->fresh());
    }

    public function cancel(string $userId, string $requestId, ?string $reason = null): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $userId && $request->agent_id !== $userId) {
            abort(403, 'Only the client or assigned agent can cancel.');
        }

        if (in_array($request->status, ['completed', 'cancelled', 'expired'])) {
            abort(422, 'Cannot cancel request in current status.');
        }

        $request->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_by_id' => $userId,
        ]);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => $request->getOriginal('status'),
            'to_status' => 'cancelled',
            'user_id' => $userId,
            'note' => $reason,
        ]);

        ServiceRequestCancelled::dispatch(
            $request->fresh(),
            $request->cancelledBy,
            $reason
        );

        return $request;
    }

    public function markExpired(string $requestId): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->status !== 'published') {
            abort(422, 'Only published requests can expire.');
        }

        $request->update(['status' => 'expired']);

        ServiceRequestStatus::create([
            'service_request_id' => $request->id,
            'from_status' => 'published',
            'to_status' => 'expired',
            'user_id' => $request->client_id,
        ]);

        return $request;
    }

    public function uploadPhotos(string $userId, string $requestId, array $photos): ServiceRequest
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $userId) {
            abort(403, 'Only the client can update photos.');
        }

        $existing = $request->photos ?? [];
        $paths = [];

        foreach ($photos as $photo) {
            $paths[] = $photo->store('requests', 'public');
        }

        $request->update([
            'photos' => array_merge($existing, $paths),
        ]);

        return $request->load(['client', 'category']);
    }

    public function browsePublished(array $filters): LengthAwarePaginator
    {
        $query = ServiceRequest::with(['client', 'category'])
            ->withCount('applications')
            ->where('status', 'published');

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['budget_min'])) {
            $budgetMin = (float) $filters['budget_min'];
            $query->where(function (Builder $q) use ($budgetMin) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(budget_range, '$[0]')) >= ?", [$budgetMin])
                  ->orWhereNull('budget_range');
            });
        }

        if (!empty($filters['budget_max'])) {
            $budgetMax = (float) $filters['budget_max'];
            $query->where(function (Builder $q) use ($budgetMax) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(budget_range, '$[1]')) <= ?", [$budgetMax])
                  ->orWhereNull('budget_range');
            });
        }

        if (!empty($filters['search'])) {
            $query->where(function (Builder $q) use ($filters) {
                $search = $filters['search'];
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('location', 'like', '%' . $search . '%');
            });
        }

        if (!empty($filters['latitude']) && !empty($filters['longitude'])) {
            $lat = (float) $filters['latitude'];
            $lng = (float) $filters['longitude'];
            $radius = (int) ($filters['distance_km'] ?? 50);
            $query->whereRaw("6371 * acos(cos(radians(?)) * cos(radians(location_lat)) * cos(radians(location_lng) - radians(?)) + sin(radians(?)) * sin(radians(location_lat))) <= ?", [$lat, $lng, $lat, $radius]);
        }

        return $this->applySort($query, $filters['sort'] ?? 'newest')
            ->paginate((int) ($filters['per_page'] ?? 20));
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'deadline'    => $query->orderBy('deadline', 'asc'),
            'budget_asc'  => $query->orderByRaw("CAST(JSON_UNQUOTE(JSON_EXTRACT(budget_range, '$[0]')) AS DECIMAL(10,2)) ASC"),
            'budget_desc' => $query->orderByRaw("CAST(JSON_UNQUOTE(JSON_EXTRACT(budget_range, '$[1]')) AS DECIMAL(10,2)) DESC"),
            default       => $query->latest(),
        };
    }
}
