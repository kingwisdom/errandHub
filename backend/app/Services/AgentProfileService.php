<?php

namespace App\Services;

use App\Models\AgentProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class AgentProfileService
{
    private const ALLOWED_SORT_FIELDS = [
        'newest', 'experience', 'jobs', 'rating',
    ];

    public function search(array $filters): LengthAwarePaginator
    {
        $query = AgentProfile::with('user')
            ->whereHas('user', fn(Builder $q) => $q->where('role', 'agent'));

        if (!isset($filters['include_offline']) || !filter_var($filters['include_offline'], FILTER_VALIDATE_BOOLEAN)) {
            $query->where('is_online', true);
        }

        if (!empty($filters['category_id'])) {
            $query->where(function (Builder $q) use ($filters) {
                $q->whereJsonContains('skills', (int) $filters['category_id'])
                  ->orWhereJsonContains('skills', (string) $filters['category_id']);
            });
        }

        if (!empty($filters['verified'])) {
            $query->whereHas('user', fn(Builder $q) => $q->where('is_verified', true));
        }

        if (!empty($filters['min_experience'])) {
            $query->where('experience_years', '>=', (int) $filters['min_experience']);
        }

        if (!empty($filters['max_experience'])) {
            $query->where('experience_years', '<=', (int) $filters['max_experience']);
        }

        if (!empty($filters['min_rating'])) {
            $rating = (float) $filters['min_rating'];
            $query->whereHas('user.reviewsReceived', function (Builder $q) use ($rating) {
                $q->selectRaw('avg(rating)')->havingRaw('avg(rating) >= ?', [$rating]);
            });
        }

        if (!empty($filters['search'])) {
            $query->where(function (Builder $q) use ($filters) {
                $search = $filters['search'];
                $q->where('bio', 'like', '%' . $search . '%')
                  ->orWhere('coverage_area', 'like', '%' . $search . '%')
                  ->orWhereJsonContains('skills', $search);
            });
        }

        if (!empty($filters['latitude']) && !empty($filters['longitude'])) {
            $lat = (float) $filters['latitude'];
            $lng = (float) $filters['longitude'];
            $radius = (int) ($filters['distance_km'] ?? 50);

            $haversine = "(6371 * acos(cos(radians($lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(latitude))))";

            $query->whereRaw("$haversine <= ?", [$radius])
                  ->whereNotNull('latitude')
                  ->whereNotNull('longitude');
        }

        return $this->applySort($query, $filters['sort'] ?? 'newest')
            ->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function findById(string $id): Model
    {
        $profile = AgentProfile::with('user')
            ->whereHas('user', fn(Builder $q) => $q->where('role', 'agent'))
            ->find($id);

        if (!$profile) {
            $profile = AgentProfile::with('user')
                ->whereHas('user', fn(Builder $q) => $q->where('role', 'agent'))
                ->where('user_id', $id)
                ->firstOrFail();
        }

        return $profile;
    }

    public function findByUser(string $userId): Model
    {
        return AgentProfile::with('user')
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function upsert(string $userId, array $data): AgentProfile
    {
        $data['user_id'] = $userId;

        $profile = AgentProfile::updateOrCreate(
            ['user_id' => $userId],
            $data
        );

        $profile->calculateCompletionScore();
        $profile->save();

        return $profile;
    }

    public function update(string $userId, string $profileId, array $data): AgentProfile
    {
        $profile = AgentProfile::where('user_id', $userId)->findOrFail($profileId);
        $profile->update($data);
        $profile->calculateCompletionScore();
        $profile->save();

        return $profile;
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'experience'  => $query->orderBy('experience_years', 'desc'),
            'jobs'        => $query->orderBy('completed_jobs_count', 'desc'),
            'rating'      => $query->withAvg(['user.reviewsReceived as avg_rating'], 'rating')
                                ->orderBy('avg_rating', 'desc'),
            default       => $query->latest(),
        };
    }
}
