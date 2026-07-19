<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowDocument extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_workflow_id',
        'step_id',
        'original_name',
        'stored_name',
        'mime_type',
        'size',
        'path',
        'status',
        'extracted_data',
        'ai_analysis',
    ];

    protected $casts = [
        'extracted_data' => 'array',
        'ai_analysis' => 'array',
    ];

    public function userWorkflow(): BelongsTo
    {
        return $this->belongsTo(UserWorkflow::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'step_id');
    }
}
