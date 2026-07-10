<?php

namespace App\Services;

use App\Models\ErrandApplication;
use App\Models\ServiceRequest;
use App\Models\ServiceRequestStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ErrandApplicationService
{
    public function apply(string $agentId, string $requestId, array $data): ErrandApplication
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->status !== 'published') {
            abort(422, 'This errand is no longer available.');
        }

        if ($request->client_id === $agentId) {
            abort(422, 'You cannot apply to your own errand.');
        }

        if ($request->agent_id !== null) {
            abort(422, 'This errand already has an assigned agent.');
        }

        $existing = ErrandApplication::where('service_request_id', $requestId)
            ->where('agent_id', $agentId)
            ->first();

        if ($existing) {
            abort(422, 'You have already applied to this errand.');
        }

        return ErrandApplication::create([
            'service_request_id' => $requestId,
            'agent_id' => $agentId,
            'cover_letter' => $data['cover_letter'] ?? null,
            'proposed_budget' => $data['proposed_budget'] ?? null,
            'status' => 'pending',
        ])->load('agent', 'serviceRequest');
    }

    public function withdraw(string $agentId, string $applicationId): ErrandApplication
    {
        $application = ErrandApplication::findOrFail($applicationId);

        if ($application->agent_id !== $agentId) {
            abort(403, 'You can only withdraw your own applications.');
        }

        if ($application->status !== 'pending') {
            abort(422, 'You can only withdraw pending applications.');
        }

        $application->update(['status' => 'withdrawn']);

        return $application->load('agent', 'serviceRequest');
    }

    public function accept(string $clientId, string $applicationId): ServiceRequest
    {
        $application = ErrandApplication::with('serviceRequest')->findOrFail($applicationId);

        if ($application->serviceRequest->client_id !== $clientId) {
            abort(403, 'Only the errand owner can accept applications.');
        }

        if ($application->status !== 'pending') {
            abort(422, 'This application is no longer pending.');
        }

        $request = $application->serviceRequest;

        if ($request->status !== 'published' || $request->agent_id !== null) {
            abort(422, 'This errand is no longer available.');
        }

        DB::transaction(function () use ($application, $request, $clientId) {
            $application->update(['status' => 'accepted']);

            ErrandApplication::where('service_request_id', $request->id)
                ->where('id', '!=', $application->id)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);

            $request->update([
                'agent_id' => $application->agent_id,
                'status' => 'accepted',
            ]);

            ServiceRequestStatus::create([
                'service_request_id' => $request->id,
                'from_status' => 'published',
                'to_status' => 'accepted',
                'user_id' => $clientId,
            ]);
        });

        return $request->load(['client', 'agent', 'category', 'statuses']);
    }

    public function reject(string $clientId, string $applicationId): ErrandApplication
    {
        $application = ErrandApplication::with('serviceRequest')->findOrFail($applicationId);

        if ($application->serviceRequest->client_id !== $clientId) {
            abort(403, 'Only the errand owner can reject applications.');
        }

        if ($application->status !== 'pending') {
            abort(422, 'This application is no longer pending.');
        }

        $application->update(['status' => 'rejected']);

        return $application->load('agent', 'serviceRequest');
    }

    public function listForRequest(string $requestId, string $userId): LengthAwarePaginator
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->client_id !== $userId) {
            abort(403, 'You can only view applications for your own errands.');
        }

        return ErrandApplication::with(['agent', 'agent.agentProfile'])
            ->where('service_request_id', $requestId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    public function listForAgent(string $agentId, array $filters): LengthAwarePaginator
    {
        $query = ErrandApplication::with(['serviceRequest', 'serviceRequest.client', 'serviceRequest.category'])
            ->where('agent_id', $agentId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate((int) ($filters['per_page'] ?? 20));
    }
}
