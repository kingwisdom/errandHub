<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\ServiceListing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class NearbySearchService
{
    public function __construct(
        protected GooglePlacesService $googlePlaces,
        protected QueryParserService $queryParser,
    ) {}

    public function search(array $params): array
    {
        $query = $params['query'] ?? '';
        $latitude = $params['latitude'] ?? null;
        $longitude = $params['longitude'] ?? null;
        $radius = $params['radius'] ?? 5000;

        $parsed = $this->queryParser->parse($query);

        $internalResults = $this->searchInternal($parsed, $latitude, $longitude, $radius);
        $externalResult = $this->searchExternal($parsed, $latitude, $longitude, $radius);

        return [
            'parsed_query' => $parsed,
            'internal_results' => $internalResults,
            'external_results' => $externalResult['results'] ?? [],
            'external_error' => $externalResult['error'] ?? null,
            'meta' => [
                'total_internal' => $internalResults->count(),
                'total_external' => count($externalResult['results'] ?? []),
                'search_radius_km' => round($radius / 1000, 1),
            ],
        ];
    }

    private function searchInternal(array $parsed, ?float $lat, ?float $lng, int $radius): Collection
    {
        $searchTerm = $parsed['search_term'];
        $minRating = $parsed['min_rating'];

        $agentQuery = AgentProfile::with('user')
            ->whereHas('user', fn(Builder $q) => $q->where('role', 'agent'));

        if (!empty($searchTerm)) {
            $agentQuery->where(function (Builder $q) use ($searchTerm) {
                $q->where('bio', 'like', '%' . $searchTerm . '%')
                  ->orWhere('coverage_area', 'like', '%' . $searchTerm . '%')
                  ->orWhereJsonContains('skills', $searchTerm);
            });
        }

        if ($lat !== null && $lng !== null) {
            $agentQuery->selectRaw('*, (
                6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitude))
                )
            ) AS distance_km', [$lat, $lng, $lat])
            ->havingRaw('distance_km <= ?', [$radius / 1000])
            ->orderByRaw('distance_km ASC');
        }

        $agents = $agentQuery->limit(10)->get();

        $serviceQuery = ServiceListing::with(['category', 'agent.user'])
            ->where('status', 'active');

        if (!empty($searchTerm)) {
            $serviceQuery->where(function (Builder $q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('location', 'like', '%' . $searchTerm . '%')
                  ->orWhereJsonContains('tags', $searchTerm);
            });
        }

        if ($lat !== null && $lng !== null) {
            $serviceQuery->selectRaw('*, (
                6371 * acos(
                    cos(radians(?)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitude))
                )
            ) AS distance_km', [$lat, $lng, $lat])
            ->havingRaw('distance_km <= ?', [$radius / 1000])
            ->orderByRaw('distance_km ASC');
        }

        $services = $serviceQuery->limit(10)->get();

        $results = collect();

        foreach ($agents as $agent) {
            $results->push([
                'type' => 'agent',
                'id' => $agent->id,
                'name' => $agent->user->name,
                'avatar' => $agent->user->avatar,
                'rating' => $agent->avg_overall_rating,
                'reviews_count' => $agent->total_reviews_count,
                'skills' => $agent->skill_names ?? [],
                'bio' => $agent->bio,
                'experience_years' => $agent->experience_years,
                'completed_jobs_count' => $agent->completed_jobs_count,
                'distance_km' => $agent->distance_km ?? null,
                'is_verified' => $agent->user->is_verified,
                'profile_url' => "/agents/{$agent->id}",
            ]);
        }

        foreach ($services as $service) {
            $results->push([
                'type' => 'service',
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,
                'price_type' => $service->price_type,
                'starting_price' => $service->starting_price,
                'category' => $service->category?->name,
                'agent_name' => $service->agent?->user?->name,
                'agent_avatar' => $service->agent?->user?->avatar,
                'location' => $service->location,
                'distance_km' => $service->distance_km ?? null,
                'photos' => $service->photos,
                'service_url' => "/services/{$service->id}",
            ]);
        }

        return $results;
    }

    private function searchExternal(array $parsed, ?float $lat, ?float $lng, int $radius): array
    {
        if (!$this->googlePlaces->isConfigured()) {
            return ['results' => [], 'error' => 'Google Maps API key not configured. Add GOOGLE_MAPS_API_KEY to .env'];
        }

        $searchParams = [
            'query' => $parsed['search_term'],
            'latitude' => $lat,
            'longitude' => $lng,
            'radius' => $radius,
            'type' => $parsed['google_type'],
            'open_now' => $parsed['open_now'],
        ];

        $result = $this->googlePlaces->textSearch($searchParams);

        if (!empty($result['error_message'])) {
            return ['results' => [], 'error' => $result['error_message']];
        }

        return ['results' => $result['results'] ?? [], 'error' => null];
    }
}
