<?php

namespace App\Http\Controllers\Api\AI;

use App\Models\UserWorkflow;
use App\Models\WorkflowReport;
use App\Models\WorkflowRecommendation;
use App\Services\AI\ImmigrationAnalysisService;
use Illuminate\Http\JsonResponse;

class ImmigrationController extends BaseApiController
{
    public function __construct(
        protected ImmigrationAnalysisService $immigrationAnalysisService
    ) {}

    public function analyze(string $userWorkflowId): JsonResponse
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

        $data = $userWorkflow->data ?? [];
        if (empty($data['destination_country'])) {
            return $this->errorResponse('Please complete the Destination & Goals step before running analysis', 422);
        }

        try {
            $analysis = $this->immigrationAnalysisService->analyze($userWorkflow);

            \Illuminate\Support\Facades\DB::transaction(function () use ($userWorkflow, $analysis, $userWorkflowId) {
                $userWorkflow->update(['data' => array_merge($userWorkflow->data ?? [], ['analysis' => $analysis])]);

                WorkflowReport::create([
                    'user_workflow_id' => $userWorkflowId,
                    'type' => 'immigration_analysis',
                    'title' => 'Immigration Eligibility Report',
                    'content' => $analysis,
                    'format' => 'json',
                ]);

                if (isset($analysis['action_items']) && is_array($analysis['action_items'])) {
                    foreach ($analysis['action_items'] as $item) {
                        WorkflowRecommendation::create([
                            'user_workflow_id' => $userWorkflowId,
                            'type' => 'immigration',
                            'title' => $item['action'] ?? 'Action Item',
                            'description' => $item['category'] ?? '',
                            'priority' => $item['priority'] ?? 'medium',
                            'action_items' => $item,
                        ]);
                    }
                }
            });

            return $this->successResponse($analysis, 'Analysis complete');
        } catch (\Exception $e) {
            return $this->errorResponse('Analysis failed', 500);
        }
    }
}
