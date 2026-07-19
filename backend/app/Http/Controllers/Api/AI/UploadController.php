<?php

namespace App\Http\Controllers\Api\AI;

use App\Services\AI\AiUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends BaseApiController
{
    public function __construct(
        protected AiUploadService $uploadService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $uploads = $this->uploadService->getByGuestUuid($guestUuid);

        return $this->paginatedResponse($uploads);
    }

    public function store(Request $request): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();

        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $validated = $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png',
            'conversation_id' => 'nullable|uuid',
        ]);

        try {
            $upload = $this->uploadService->upload(
                $request->file('file'),
                $guestUuid,
                $validated['conversation_id'] ?? null
            );

            return $this->successResponse($upload, 'File uploaded', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to upload file: ' . $e->getMessage(), 500);
        }
    }
}
