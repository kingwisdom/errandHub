<?php

namespace App\Services\AI;

use App\Models\Workflow;
use App\Models\WorkflowStep;
use App\Models\UserWorkflow;
use Illuminate\Support\Collection;

class AiWorkflowService
{
    public function getAll(): Collection
    {
        return Workflow::where('is_active', true)->get();
    }

    public function getBySlug(string $slug): ?Workflow
    {
        return Workflow::where('slug', $slug)->where('is_active', true)->with('steps.questions')->first();
    }

    public function getById(string $id): ?Workflow
    {
        return Workflow::with('steps.questions')->find($id);
    }

    public function getOrCreateUserWorkflow(string $workflowId, string $guestUuid, bool $forceNew = false): UserWorkflow
    {
        if ($forceNew) {
            UserWorkflow::where('workflow_id', $workflowId)
                ->where('guest_uuid', $guestUuid)
                ->where('status', 'in_progress')
                ->update(['status' => 'abandoned']);
        }

        $userWorkflow = UserWorkflow::where('workflow_id', $workflowId)
            ->where('guest_uuid', $guestUuid)
            ->where('status', 'in_progress')
            ->first();

        if (!$userWorkflow) {
            $workflow = Workflow::with('steps')->find($workflowId);
            $firstStep = $workflow->steps->sortBy('order')->first();

            $userWorkflow = UserWorkflow::create([
                'guest_uuid' => $guestUuid,
                'workflow_id' => $workflowId,
                'current_step_id' => $firstStep?->id,
                'status' => 'in_progress',
                'progress' => 0,
            ]);
        }

        return $userWorkflow;
    }

    public function advanceStep(UserWorkflow $userWorkflow, array $answers): UserWorkflow
    {
        $currentStep = $userWorkflow->currentStep;
        $workflow = $userWorkflow->workflow;

        $data = array_merge($userWorkflow->data ?? [], $answers);

        if (!$currentStep || !$workflow) {
            $userWorkflow->update(['data' => $data, 'status' => 'completed', 'progress' => 100, 'completed_at' => now()]);
            return $userWorkflow->fresh(['currentStep.questions', 'workflow']);
        }

        $allSteps = $workflow->steps()->orderBy('order')->get();
        $currentIndex = $allSteps->pluck('id')->search($currentStep->id);

        if ($currentIndex === false) {
            $userWorkflow->update(['data' => $data, 'current_step_id' => null, 'status' => 'completed', 'progress' => 100, 'completed_at' => now()]);
            return $userWorkflow->fresh(['currentStep.questions', 'workflow']);
        }

        $nextIndex = $currentIndex + 1;

        if ($nextIndex >= $allSteps->count()) {
            $userWorkflow->update([
                'data' => $data,
                'current_step_id' => null,
                'status' => 'completed',
                'progress' => 100,
                'completed_at' => now(),
            ]);
        } else {
            $nextStep = $allSteps[$nextIndex];
            $progress = (int) round(($nextIndex / $allSteps->count()) * 100);
            $userWorkflow->update([
                'data' => $data,
                'current_step_id' => $nextStep->id,
                'progress' => $progress,
            ]);
        }

        return $userWorkflow->fresh(['currentStep.questions', 'workflow']);
    }

    public function getUserWorkflows(string $guestUuid): Collection
    {
        return UserWorkflow::where('guest_uuid', $guestUuid)
            ->with(['workflow', 'currentStep.questions', 'reports', 'recommendations'])
            ->orderBy('updated_at', 'desc')
            ->get();
    }
}
