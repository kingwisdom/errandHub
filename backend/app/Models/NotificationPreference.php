<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'email_notifications',
        'database_notifications',
        'request_updates',
        'booking_updates',
        'chat_messages',
        'marketing_emails',
    ];

    protected function casts(): array
    {
        return [
            'email_notifications' => 'boolean',
            'database_notifications' => 'boolean',
            'request_updates' => 'boolean',
            'booking_updates' => 'boolean',
            'chat_messages' => 'boolean',
            'marketing_emails' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function defaultsFor(int $userId): self
    {
        return self::firstOrCreate(['user_id' => $userId]);
    }
}
