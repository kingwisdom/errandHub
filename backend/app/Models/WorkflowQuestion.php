<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowQuestion extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'step_id',
        'key',
        'type',
        'label',
        'description',
        'is_required',
        'options',
        'validation',
        'dependencies',
        'visibility',
        'order',
        'default_value',
        'placeholder',
    ];

    protected $casts = [
        'options' => 'array',
        'validation' => 'array',
        'dependencies' => 'array',
        'visibility' => 'array',
        'default_value' => 'array',
        'is_required' => 'boolean',
    ];

    public function step(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'step_id');
    }
}
