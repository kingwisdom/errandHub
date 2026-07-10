<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $skillIds = $this->skills ?? [];

        $skillNames = collect($skillIds)->map(function ($id) {
            $cat = Category::find($id);
            return $cat?->name;
        })->filter()->values()->all();

        return [
            'id' => $this->id,
            'user' => UserResource::make($this->whenLoaded('user')),
            'bio' => $this->bio,
            'skills' => $this->skills,
            'skill_names' => $skillNames,
            'languages' => $this->languages,
            'coverage_area' => $this->coverage_area,
            'vehicle' => $this->vehicle,
            'available_hours' => $this->available_hours,
            'experience_years' => $this->experience_years,
            'completed_jobs_count' => $this->completed_jobs_count,
            'avg_response_time' => $this->avg_response_time,
            'avg_completion_time' => $this->avg_completion_time,
            'profile_completion_score' => $this->profile_completion_score,
            'is_online' => $this->is_online,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'avg_communication_rating' => $this->avg_communication_rating,
            'avg_professionalism_rating' => $this->avg_professionalism_rating,
            'avg_timeliness_rating' => $this->avg_timeliness_rating,
            'avg_quality_rating' => $this->avg_quality_rating,
            'avg_overall_rating' => $this->avg_overall_rating,
            'total_reviews_count' => $this->total_reviews_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
