<?php

namespace App\Services\AI;

use App\Models\UploadedFile;
use Illuminate\Http\UploadedFile as HttpUploadedFile;
use Illuminate\Support\Str;

class AiUploadService
{
    public function getByGuestUuid(string $guestUuid)
    {
        return UploadedFile::where('guest_uuid', $guestUuid)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    public function upload(HttpUploadedFile $file, string $guestUuid, ?string $conversationId = null): UploadedFile
    {
        $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('uploads', $storedName);

        return UploadedFile::create([
            'guest_uuid' => $guestUuid,
            'conversation_id' => $conversationId,
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => $storedName,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'path' => $path,
            'status' => 'completed',
        ]);
    }
}
