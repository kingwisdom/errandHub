<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ServiceRequest extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'client_id',
        'agent_id',
        'category_id',
        'title',
        'description',
        'status',
        'priority',
        'location',
        'deadline',
        'budget_range',
        'instructions',
        'photos',
        'cancellation_reason',
        'cancelled_by_id',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
            'expires_at' => 'datetime',
            'budget_range' => 'array',
            'photos' => 'array',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function statuses(): HasMany
    {
        return $this->hasMany(ServiceRequestStatus::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ErrandApplication::class);
    }
}
