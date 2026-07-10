<?php

namespace App\Services;

use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class VerificationService
{
    public function submit(string $userId, string $type, array $documents): VerificationRequest
    {
        return VerificationRequest::create([
            'user_id' => $userId,
            'type' => $type,
            'documents' => $documents,
            'status' => 'pending',
        ]);
    }

    public function listPending(): LengthAwarePaginator
    {
        return VerificationRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);
    }

    public function listAll(?string $status = null): LengthAwarePaginator
    {
        $query = VerificationRequest::with(['user', 'reviewer']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest()->paginate(20);
    }

    public function listForUser(string $userId): LengthAwarePaginator
    {
        return VerificationRequest::where('user_id', $userId)
            ->latest()
            ->paginate(20);
    }

    public function approve(string $id, string $adminId, ?string $note = null): VerificationRequest
    {
        $request = VerificationRequest::findOrFail($id);
        $request->update([
            'status' => 'approved',
            'admin_note' => $note,
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
        ]);

        User::where('id', $request->user_id)->update(['is_verified' => true]);

        return $request;
    }

    public function reject(string $id, string $adminId, string $note): VerificationRequest
    {
        $request = VerificationRequest::findOrFail($id);
        $request->update([
            'status' => 'rejected',
            'admin_note' => $note,
            'reviewed_by' => $adminId,
            'reviewed_at' => now(),
        ]);

        return $request;
    }
}
