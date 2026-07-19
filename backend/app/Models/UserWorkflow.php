<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class UserWorkflow extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'guest_uuid',
        'workflow_id',
        'current_step_id',
        'status',
        'data',
        'progress',
        'completed_at',
    ];

    protected $casts = [
        'data' => 'array',
        'progress' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'current_step_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(WorkflowDocument::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(WorkflowReport::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(WorkflowRecommendation::class);
    }
}
