<?php

namespace App\Services;

class QueryParserService
{
    private const TYPE_KEYWORDS = [
        'electrician' => ['electrician', 'electrical', 'wiring', 'electric'],
        'plumber' => ['plumber', 'plumbing', 'pipe', 'leak'],
        'mechanic' => ['mechanic', 'auto repair', 'car repair', 'automotive'],
        'restaurant' => ['restaurant', 'food', 'dining', 'eatery', 'cafe', 'cafe'],
        'pharmacy' => ['pharmacy', 'pharmacist', 'drugstore', 'chemist', 'medicine'],
        'hospital' => ['hospital', 'clinic', 'medical', 'health center', 'emergency'],
        'school' => ['school', 'academy', 'college', 'university', 'tutor', 'education'],
        'hotel' => ['hotel', 'motel', 'lodge', 'inn', 'accommodation', 'hostel'],
        'bank' => ['bank', 'atm', 'financial', 'credit union'],
        'park' => ['park', 'garden', 'playground', 'recreation'],
        'tourist_attraction' => ['attraction', 'monument', 'landmark', 'museum', 'tourist'],
        'dentist' => ['dentist', 'dental', 'teeth'],
        'lawyer' => ['lawyer', 'attorney', 'legal', 'solicitor', 'barrister'],
        'real_estate_agent' => ['real estate', 'realtor', 'property', 'housing'],
        'car_repair' => ['car repair', 'auto service', 'tire', 'oil change'],
        'beauty_salon' => ['salon', 'beauty', 'hairdresser', 'barber', 'spa'],
        'gym' => ['gym', 'fitness', 'workout', 'exercise'],
        'supermarket' => ['supermarket', 'grocery', 'groceries', 'store', 'shop'],
        'hardware_store' => ['hardware', 'hardware store', 'tools', 'building materials'],
        'laundry' => ['laundry', 'dry cleaning', 'cleaners'],
        'photographer' => ['photographer', 'photography', 'photo studio'],
        'catering' => ['catering', 'caterer', 'event food'],
        'moving_company' => ['movers', 'moving company', 'relocation', 'packing'],
        'cleaning_service' => ['cleaning', 'cleaner', 'housekeeping', 'janitorial'],
        'tutor' => ['tutor', 'tutoring', 'teacher', 'coaching'],
    ];

    private const PLACE_TYPES = [
        'electrician' => 'electrician',
        'plumber' => 'plumber',
        'mechanic' => 'car_repair',
        'restaurant' => 'restaurant',
        'pharmacy' => 'pharmacy',
        'hospital' => 'hospital',
        'school' => 'school',
        'hotel' => 'lodging',
        'bank' => 'bank',
        'park' => 'park',
        'tourist_attraction' => 'tourist_attraction',
        'dentist' => 'dentist',
        'lawyer' => 'lawyer',
        'real_estate_agent' => 'real_estate_agent',
        'car_repair' => 'car_repair',
        'beauty_salon' => 'beauty_salon',
        'gym' => 'gym',
        'supermarket' => 'supermarket',
        'hardware_store' => 'hardware_store',
        'laundry' => 'laundry',
        'photographer' => 'photographer',
        'catering' => 'restaurant',
        'moving_company' => 'moving_company',
        'cleaning_service' => 'cleaning',
        'tutor' => 'school',
    ];

    public function parse(string $query): array
    {
        $normalized = mb_strtolower(trim($query));

        $openNow = $this->extractOpenNow($normalized);
        $minRating = $this->extractMinRating($normalized);
        $locationBias = $this->extractLocationBias($normalized);
        $matchedType = $this->matchType($normalized);
        $searchTerm = $this->extractSearchTerm($normalized, $matchedType);

        $googleType = null;
        if ($matchedType && isset(self::PLACE_TYPES[$matchedType])) {
            $googleType = self::PLACE_TYPES[$matchedType];
        }

        return [
            'search_term' => $searchTerm,
            'original_query' => $query,
            'matched_category' => $matchedType,
            'google_type' => $googleType,
            'open_now' => $openNow,
            'min_rating' => $minRating,
            'location_bias' => $locationBias,
        ];
    }

    private function extractOpenNow(string $query): bool
    {
        $patterns = ['open now', 'open today', 'currently open', 'open at', 'right now'];
        foreach ($patterns as $pattern) {
            if (str_contains($query, $pattern)) {
                return true;
            }
        }
        return false;
    }

    private function extractMinRating(string $query): ?float
    {
        if (preg_match('/(\d(?:\.\d)?)\s*(?:star|rating|\/5|\+ reviews?)/i', $query, $matches)) {
            $rating = (float) $matches[1];
            return $rating >= 1 && $rating <= 5 ? $rating : null;
        }
        if (str_contains($query, 'top rated') || str_contains($query, 'best rated') || str_contains($query, 'highly rated')) {
            return 4.0;
        }
        return null;
    }

    private function extractLocationBias(string $query): ?string
    {
        $patterns = [
            'near me' => 'near_me',
            'nearby' => 'near_me',
            'around here' => 'near_me',
            'close to me' => 'near_me',
            'in my area' => 'near_me',
        ];
        foreach ($patterns as $pattern => $bias) {
            if (str_contains($query, $pattern)) {
                return $bias;
            }
        }
        return null;
    }

    private function matchType(string $query): ?string
    {
        foreach (self::TYPE_KEYWORDS as $type => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($query, $keyword)) {
                    return $type;
                }
            }
        }
        return null;
    }

    private function extractSearchTerm(string $query, ?string $matchedType): string
    {
        $stopWords = ['near me', 'nearby', 'open now', 'open today', 'around here', 'close to me',
            'in my area', 'top rated', 'best rated', 'highly rated', 'the', 'a', 'an', 'find',
            'search for', 'looking for', 'i need', 'i want', 'show me', 'where can i find',
            'best', 'good', 'cheap', 'affordable', 'nearby', 'around'];

        $cleaned = $query;
        foreach ($stopWords as $stop) {
            $cleaned = str_replace($stop, '', $cleaned);
        }
        $cleaned = preg_replace('/\s+/', ' ', trim($cleaned));

        if (!empty($cleaned)) {
            return $cleaned;
        }

        return $matchedType ?? $query;
    }
}
