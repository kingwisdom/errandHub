<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GooglePlacesService
{
    private string $apiKey;
    private string $baseUrl = 'https://maps.googleapis.com/maps/api/place';

    public function __construct()
    {
        $this->apiKey = config('services.google_maps.api_key', '');
    }

    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    public function textSearch(array $params): array
    {
        $query = $params['query'] ?? '';
        $lat = $params['latitude'] ?? null;
        $lng = $params['longitude'] ?? null;
        $radius = $params['radius'] ?? 5000;
        $type = $params['type'] ?? null;
        $openNow = $params['open_now'] ?? false;

        $cacheKey = $this->buildCacheKey('text_search', $params);

        return Cache::remember($cacheKey, 3600, function () use ($query, $lat, $lng, $radius, $type, $openNow) {
            $requestParams = [
                'key' => $this->apiKey,
                'query' => $query,
            ];
            if ($lat !== null && $lng !== null) {
                $requestParams['location'] = "{$lat},{$lng}";
                $requestParams['radius'] = $radius;
            }
            if ($type) {
                $requestParams['type'] = $type;
            }
            if ($openNow) {
                $requestParams['opennow'] = 'true';
            }

            try {
                $response = Http::timeout(10)
                    ->get("{$this->baseUrl}/textsearch/json", $requestParams);

                if ($response->failed()) {
                    Log::error('Google Places Text Search HTTP failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                    return ['results' => [], 'next_page_token' => null, 'status' => 'error', 'error_message' => 'HTTP request failed'];
                }

                $data = $response->json();
                $status = $data['status'] ?? 'UNKNOWN_ERROR';
                $errorMsg = $data['error_message'] ?? null;

                if ($status !== 'OK' && $status !== 'ZERO_RESULTS') {
                    Log::warning('Google Places Text Search non-OK', [
                        'status' => $status,
                        'error_message' => $errorMsg,
                    ]);
                    return [
                        'results' => [],
                        'next_page_token' => null,
                        'status' => $status,
                        'error_message' => $errorMsg,
                    ];
                }

                return [
                    'results' => collect($data['results'] ?? [])->map(fn($place) => $this->mapPlace($place, $lat, $lng))->toArray(),
                    'next_page_token' => $data['next_page_token'] ?? null,
                    'status' => $status,
                    'error_message' => null,
                ];
            } catch (\Exception $e) {
                Log::error('Google Places Text Search exception', ['message' => $e->getMessage()]);
                return ['results' => [], 'next_page_token' => null, 'status' => 'error', 'error_message' => $e->getMessage()];
            }
        });
    }

    public function nearbySearch(array $params): array
    {
        $lat = $params['latitude'];
        $lng = $params['longitude'];
        $radius = $params['radius'] ?? 5000;
        $type = $params['type'] ?? null;
        $keyword = $params['keyword'] ?? null;
        $openNow = $params['open_now'] ?? false;

        $cacheKey = $this->buildCacheKey('nearby_search', $params);

        return Cache::remember($cacheKey, 3600, function () use ($lat, $lng, $radius, $type, $keyword, $openNow) {
            $requestParams = [
                'key' => $this->apiKey,
                'location' => "{$lat},{$lng}",
                'radius' => $radius,
            ];
            if ($type) {
                $requestParams['type'] = $type;
            }
            if ($keyword) {
                $requestParams['keyword'] = $keyword;
            }
            if ($openNow) {
                $requestParams['opennow'] = 'true';
            }

            try {
                $response = Http::timeout(10)
                    ->get("{$this->baseUrl}/nearbysearch/json", $requestParams);

                if ($response->failed()) {
                    Log::error('Google Places Nearby Search HTTP failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                    return ['results' => [], 'next_page_token' => null, 'status' => 'error', 'error_message' => 'HTTP request failed'];
                }

                $data = $response->json();
                $status = $data['status'] ?? 'UNKNOWN_ERROR';
                $errorMsg = $data['error_message'] ?? null;

                if ($status !== 'OK' && $status !== 'ZERO_RESULTS') {
                    Log::warning('Google Places Nearby Search non-OK', [
                        'status' => $status,
                        'error_message' => $errorMsg,
                    ]);
                    return [
                        'results' => [],
                        'next_page_token' => null,
                        'status' => $status,
                        'error_message' => $errorMsg,
                    ];
                }

                return [
                    'results' => collect($data['results'] ?? [])->map(fn($place) => $this->mapPlace($place, $lat, $lng))->toArray(),
                    'next_page_token' => $data['next_page_token'] ?? null,
                    'status' => $status,
                    'error_message' => null,
                ];
            } catch (\Exception $e) {
                Log::error('Google Places Nearby Search exception', ['message' => $e->getMessage()]);
                return ['results' => [], 'next_page_token' => null, 'status' => 'error', 'error_message' => $e->getMessage()];
            }
        });
    }

    public function getPlaceDetails(string $placeId): ?array
    {
        $cacheKey = "place_details:{$placeId}";

        return Cache::remember($cacheKey, 7200, function () use ($placeId) {
            $requestParams = [
                'place_id' => $placeId,
                'key' => $this->apiKey,
            ];

            try {
                $response = Http::timeout(10)
                    ->get("{$this->baseUrl}/details/json", $requestParams);

                if ($response->failed()) {
                    return null;
                }

                $data = $response->json();

                if (($data['status'] ?? '') !== 'OK') {
                    return null;
                }

                return $this->mapPlace($data['result'] ?? []);
            } catch (\Exception $e) {
                Log::error('Google Places Details exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    public function getPhotoUrl(string $photoReference, int $maxWidth = 400): string
    {
        return "{$this->baseUrl}/photo?maxwidth={$maxWidth}&photo_reference={$photoReference}&key={$this->apiKey}";
    }

    private function mapPlace(array $place, ?float $originLat = null, ?float $originLng = null): array
    {
        $lat = $place['geometry']['location']['lat'] ?? null;
        $lng = $place['geometry']['location']['lng'] ?? null;

        $photoReference = null;
        if (!empty($place['photos'][0]['photo_reference'])) {
            $photoReference = $place['photos'][0]['photo_reference'];
        }

        $openingHours = null;
        if (isset($place['opening_hours'])) {
            $openingHours = [
                'open_now' => $place['opening_hours']['open_now'] ?? null,
                'weekday_text' => $place['opening_hours']['weekday_text'] ?? [],
            ];
        }

        $distanceKm = null;
        if ($originLat !== null && $originLng !== null && $lat !== null && $lng !== null) {
            $distanceKm = $this->haversineDistance($originLat, $originLng, $lat, $lng);
        }

        $priceLevelMap = [
            0 => 'Free',
            1 => 'Inexpensive',
            2 => 'Moderate',
            3 => 'Expensive',
            4 => 'Very Expensive',
        ];

        $priceLevel = $place['price_level'] ?? null;

        return [
            'place_id' => $place['place_id'] ?? null,
            'name' => $place['name'] ?? '',
            'rating' => $place['rating'] ?? null,
            'reviews_count' => $place['user_ratings_total'] ?? 0,
            'address' => $place['formatted_address'] ?? null,
            'phone' => $place['formatted_phone_number'] ?? null,
            'website' => $place['website'] ?? null,
            'google_url' => $place['url'] ?? null,
            'opening_hours' => $openingHours,
            'price_level' => $priceLevel,
            'price_level_text' => $priceLevel !== null ? ($priceLevelMap[$priceLevel] ?? null) : null,
            'photo_reference' => $photoReference,
            'photo_url' => $photoReference ? $this->getPhotoUrl($photoReference) : null,
            'location' => $lat !== null ? ['lat' => $lat, 'lng' => $lng] : null,
            'distance_km' => $distanceKm ? round($distanceKm, 2) : null,
            'types' => $place['types'] ?? [],
            'directions_url' => ($lat !== null && $lng !== null)
                ? "https://www.google.com/maps/dir/?api=1&destination={$lat},{$lng}"
                : null,
        ];
    }

    private function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function buildCacheKey(string $prefix, array $params): string
    {
        $relevant = array_filter($params, fn($v) => $v !== null && $v !== '' && $v !== false);
        unset($relevant['page_token']);
        return "google_places:{$prefix}:" . md5(json_encode($relevant));
    }
}
