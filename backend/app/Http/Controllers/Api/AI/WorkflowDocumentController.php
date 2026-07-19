<?php

namespace App\Http\Controllers\Api\AI;

use App\Models\UserWorkflow;
use App\Models\WorkflowDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class WorkflowDocumentController extends BaseApiController
{
    public function index(string $userWorkflowId): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();
        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $userWorkflow = UserWorkflow::where('id', $userWorkflowId)
            ->where('guest_uuid', $guestUuid)
            ->first();

        if (!$userWorkflow) {
            return $this->errorResponse('Workflow not found', 404);
        }

        $documents = $userWorkflow->documents()->with('step')->get();
        return $this->successResponse($documents);
    }

    public function store(string $userWorkflowId): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();
        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $userWorkflow = UserWorkflow::where('id', $userWorkflowId)
            ->where('guest_uuid', $guestUuid)
            ->first();

        if (!$userWorkflow) {
            return $this->errorResponse('Workflow not found', 404);
        }

        request()->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,csv,xls,xlsx',
            'step_id' => 'nullable|string',
        ]);

        try {
            $file = request()->file('file');
            $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('documents', $storedName);

            $document = WorkflowDocument::create([
                'user_workflow_id' => $userWorkflowId,
                'step_id' => request()->input('step_id'),
                'original_name' => $file->getClientOriginalName(),
                'stored_name' => $storedName,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'path' => $path,
                'status' => 'pending',
            ]);

            return $this->successResponse($document, 'Document uploaded');
        } catch (\Exception $e) {
            return $this->errorResponse('Document upload failed', 500);
        }
    }
}
