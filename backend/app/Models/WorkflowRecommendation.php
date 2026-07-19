<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowRecommendation extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_workflow_id',
        'type',
        'title',
        'description',
        'priority',
        'action_items',
        'is_read',
    ];

    protected $casts = [
        'action_items' => 'array',
        'is_read' => 'boolean',
    ];

    public function userWorkflow(): BelongsTo
    {
        return $this->belongsTo(UserWorkflow::class);
    }
}
