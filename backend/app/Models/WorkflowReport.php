<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowReport extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_workflow_id',
        'type',
        'title',
        'content',
        'format',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function userWorkflow(): BelongsTo
    {
        return $this->belongsTo(UserWorkflow::class);
    }
}
