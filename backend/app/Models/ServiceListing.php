<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceListing extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'agent_id',
        'category_id',
        'title',
        'description',
        'price_type',
        'starting_price',
        'is_negotiable',
        'location',
        'latitude',
        'longitude',
        'coverage_radius',
        'photos',
        'availability',
        'tags',
        'experience_years',
        'estimated_duration',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_negotiable' => 'boolean',
            'starting_price' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'coverage_radius' => 'integer',
            'experience_years' => 'integer',
            'estimated_duration' => 'integer',
            'photos' => 'array',
            'availability' => 'array',
            'tags' => 'array',
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
