<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentProfile extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'bio',
        'skills',
        'languages',
        'coverage_area',
        'latitude',
        'longitude',
        'vehicle',
        'available_hours',
        'experience_years',
        'completed_jobs_count',
        'avg_response_time',
        'avg_completion_time',
        'profile_completion_score',
        'avg_overall_rating',
        'avg_communication_rating',
        'avg_professionalism_rating',
        'avg_timeliness_rating',
        'avg_quality_rating',
        'total_reviews_count',
        'is_online',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'languages' => 'array',
            'available_hours' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_online' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function calculateCompletionScore(): void
    {
        $score = 0;
        if ($this->bio) $score += 15;
        if ($this->skills) $score += 20;
        if ($this->languages) $score += 10;
        if ($this->coverage_area) $score += 15;
        if ($this->vehicle) $score += 10;
        if ($this->available_hours) $score += 10;
        if ($this->experience_years) $score += 10;
        if ($this->user->avatar) $score += 10;
        $this->profile_completion_score = min($score, 100);
    }
}
