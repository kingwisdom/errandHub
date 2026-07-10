<?php

namespace App\Services;

use App\Models\Review;
use App\Models\ServiceRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReviewService
{
    public function listForUser(?string $revieweeId): LengthAwarePaginator
    {
        $query = Review::with(['reviewer', 'serviceRequest'])->where('is_visible', true);

        if ($revieweeId) {
            $query->where('reviewee_id', $revieweeId);
        }

        return $query->latest()->paginate(20);
    }

    public function listAll(): LengthAwarePaginator
    {
        return Review::with(['reviewer', 'reviewee', 'serviceRequest', 'moderatedBy'])
            ->latest()
            ->paginate(20);
    }

    public function listFlagged(): LengthAwarePaginator
    {
        return Review::with(['reviewer', 'reviewee', 'serviceRequest'])
            ->where('is_visible', false)
            ->latest()
            ->paginate(20);
    }

    public function create(string $userId, string $requestId, array $data): Review
    {
        $request = ServiceRequest::findOrFail($requestId);

        if ($request->status !== 'completed') {
            abort(422, 'Request must be completed before reviewing.');
        }

        $isClient = $request->client_id === $userId;
        $isAgent = $request->agent_id === $userId;

        if (!$isClient && !$isAgent) {
            abort(403);
        }

        $data['service_request_id'] = $requestId;
        $data['reviewer_id'] = $userId;
        $data['reviewee_id'] = $isClient ? $request->agent_id : $request->client_id;

        $review = Review::create($data);

        $allReviewed = Review::where('service_request_id', $requestId)->count() >= 2;
        if ($allReviewed) {
            $request->update(['status' => 'reviewed']);
        }

        $this->recalculateUserRating($review->reviewee_id);

        return $review->load('reviewer');
    }

    public function toggleVisibility(string $reviewId, string $moderatorId, bool $visible): Review
    {
        $review = Review::findOrFail($reviewId);
        $review->update([
            'is_visible' => $visible,
            'moderated_by_id' => $moderatorId,
            'moderated_at' => now(),
        ]);

        if ($review->reviewee_id) {
            $this->recalculateUserRating($review->reviewee_id);
        }

        return $review->load(['reviewer', 'reviewee']);
    }

    public function hideReview(string $reviewId, string $moderatorId): Review
    {
        return $this->toggleVisibility($reviewId, $moderatorId, false);
    }

    public function showReview(string $reviewId, string $moderatorId): Review
    {
        return $this->toggleVisibility($reviewId, $moderatorId, true);
    }

    protected function recalculateUserRating(string $userId): void
    {
        $avgs = Review::where('reviewee_id', $userId)
            ->where('is_visible', true)
            ->selectRaw('
                AVG(rating) as avg_overall,
                AVG(communication_rating) as avg_communication,
                AVG(professionalism_rating) as avg_professionalism,
                AVG(timeliness_rating) as avg_timeliness,
                AVG(quality_rating) as avg_quality
            ')
            ->first();

        $user = \App\Models\User::find($userId);
        if ($user && $user->agentProfile) {
            $profile = $user->agentProfile;
            $profile->avg_overall_rating = round($avgs->avg_overall ?? 0, 2);
            $profile->avg_communication_rating = round($avgs->avg_communication ?? 0, 2);
            $profile->avg_professionalism_rating = round($avgs->avg_professionalism ?? 0, 2);
            $profile->avg_timeliness_rating = round($avgs->avg_timeliness ?? 0, 2);
            $profile->avg_quality_rating = round($avgs->avg_quality ?? 0, 2);
            $profile->save();
        }
    }
}
