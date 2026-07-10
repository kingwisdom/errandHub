<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'service_request_id',
        'reviewer_id',
        'reviewee_id',
        'rating',
        'communication_rating',
        'professionalism_rating',
        'timeliness_rating',
        'quality_rating',
        'comment',
        'is_visible',
        'moderated_by_id',
        'moderated_at',
    ];

    protected function casts(): array
    {
        return [
            'communication_rating' => 'integer',
            'professionalism_rating' => 'integer',
            'timeliness_rating' => 'integer',
            'quality_rating' => 'integer',
        ];
    }

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }

    public function moderatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by_id');
    }
}
