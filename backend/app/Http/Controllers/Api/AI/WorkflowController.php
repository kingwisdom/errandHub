<?php

namespace App\Http\Controllers\Api\AI;

use App\Models\UserWorkflow;
use App\Services\AI\AiWorkflowService;
use Illuminate\Http\JsonResponse;

class WorkflowController extends BaseApiController
{
    public function __construct(
        protected AiWorkflowService $workflowService
    ) {}

    public function index(): JsonResponse
    {
        $workflows = $this->workflowService->getAll();
        return $this->successResponse($workflows);
    }

    public function show(string $slug): JsonResponse
    {
        $workflow = $this->workflowService->getBySlug($slug);

        if (!$workflow) {
            return $this->errorResponse('Workflow not found', 404);
        }

        return $this->successResponse($workflow);
    }

    public function start(string $slug): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();
        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $workflow = $this->workflowService->getBySlug($slug);
        if (!$workflow) {
            return $this->errorResponse('Workflow not found', 404);
        }

        $forceNew = (bool) request()->input('force_new', false);
        $userWorkflow = $this->workflowService->getOrCreateUserWorkflow($workflow->id, $guestUuid, $forceNew);
        $userWorkflow->load(['currentStep.questions', 'workflow']);

        return $this->successResponse($userWorkflow);
    }

    public function advance(string $userWorkflowId): JsonResponse
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

        if ($userWorkflow->status !== 'in_progress') {
            return $this->errorResponse('Workflow is not in progress', 422);
        }

        $answers = request()->input('answers', []);
        $userWorkflow = $this->workflowService->advanceStep($userWorkflow, $answers);

        return $this->successResponse($userWorkflow);
    }

    public function myWorkflows(): JsonResponse
    {
        $guestUuid = $this->getGuestUuid();
        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $workflows = $this->workflowService->getUserWorkflows($guestUuid);
        return $this->successResponse($workflows);
    }

    public function destroy(string $userWorkflowId): JsonResponse
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

        $userWorkflow->delete();

        return $this->successResponse(null, 'Workflow deleted');
    }
}
