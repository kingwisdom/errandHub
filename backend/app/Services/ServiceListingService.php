<?php

namespace App\Services;

use App\Models\ServiceListing;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ServiceListingService
{
    private const ALLOWED_SORT_FIELDS = [
        'newest', 'price_asc', 'price_desc', 'experience',
    ];

    public function listForAgent(int $agentId, array $filters): LengthAwarePaginator
    {
        $query = ServiceListing::with(['category', 'agent'])
            ->where('agent_id', $agentId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $this->applySort($query, $filters['sort'] ?? 'newest')
            ->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function findById(string $id): Model
    {
        return ServiceListing::with(['agent', 'agent.agentProfile', 'category'])->findOrFail($id);
    }

    public function create(int $agentId, array $data): ServiceListing
    {
        $data['agent_id'] = $agentId;

        return ServiceListing::create($data)->load(['agent', 'category']);
    }

    public function update(int $userId, string $id, array $data): ServiceListing
    {
        $listing = ServiceListing::findOrFail($id);

        if ($listing->agent_id !== $userId) {
            abort(403, 'Only the owner can update this service listing.');
        }

        $listing->update($data);

        return $listing->load(['agent', 'category']);
    }

    public function delete(int $userId, string $id): void
    {
        $listing = ServiceListing::findOrFail($id);

        if ($listing->agent_id !== $userId) {
            abort(403, 'Only the owner can delete this service listing.');
        }

        $listing->delete();
    }

    public function browse(array $filters): LengthAwarePaginator
    {
        $query = ServiceListing::with(['agent', 'agent.agentProfile', 'category'])
            ->where('status', 'active');

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['price_type'])) {
            $query->where('price_type', $filters['price_type']);
        }

        if (!empty($filters['min_price'])) {
            $query->where('starting_price', '>=', (float) $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('starting_price', '<=', (float) $filters['max_price']);
        }

        if (!empty($filters['is_negotiable'])) {
            $query->where('is_negotiable', filter_var($filters['is_negotiable'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['experience_years'])) {
            $query->where('experience_years', '>=', (int) $filters['experience_years']);
        }

        if (!empty($filters['tags'])) {
            $tags = is_array($filters['tags']) ? $filters['tags'] : explode(',', $filters['tags']);
            foreach ($tags as $tag) {
                $query->whereJsonContains('tags', trim($tag));
            }
        }

        if (!empty($filters['verified_agent'])) {
            $query->whereHas('agent', fn(Builder $q) => $q->where('is_verified', true));
        }

        if (!empty($filters['search'])) {
            $query->where(function (Builder $q) use ($filters) {
                $search = $filters['search'];
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('location', 'like', '%' . $search . '%')
                  ->orWhereJsonContains('tags', $search);
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

    public function uploadPhotos(int $userId, string $id, array $photos): ServiceListing
    {
        $listing = ServiceListing::findOrFail($id);

        if ($listing->agent_id !== $userId) {
            abort(403, 'Only the owner can update photos.');
        }

        $existing = $listing->photos ?? [];
        $paths = [];

        foreach ($photos as $photo) {
            $paths[] = $photo->store('services', 'public');
        }

        $listing->update([
            'photos' => array_merge($existing, $paths),
        ]);

        return $listing->load(['agent', 'category']);
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'price_asc'   => $query->orderBy('starting_price', 'asc'),
            'price_desc'  => $query->orderBy('starting_price', 'desc'),
            'experience'  => $query->orderBy('experience_years', 'desc'),
            default       => $query->latest(),
        };
    }
}
