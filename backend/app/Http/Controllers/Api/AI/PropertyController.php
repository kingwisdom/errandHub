<?php

namespace App\Http\Controllers\Api\AI;

use App\Models\UserWorkflow;
use App\Models\WorkflowReport;
use App\Models\WorkflowRecommendation;
use App\Services\AI\PropertyAnalysisService;
use Illuminate\Http\JsonResponse;

class PropertyController extends BaseApiController
{
    public function __construct(
        protected PropertyAnalysisService $propertyAnalysisService
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

        try {
            $analysis = $this->propertyAnalysisService->analyze($userWorkflow);

            \Illuminate\Support\Facades\DB::transaction(function () use ($userWorkflow, $analysis, $userWorkflowId) {
                $userWorkflow->update(['data' => array_merge($userWorkflow->data ?? [], ['analysis' => $analysis])]);

                WorkflowReport::create([
                    'user_workflow_id' => $userWorkflowId,
                    'type' => 'property_analysis',
                    'title' => 'Property Analysis Report',
                    'content' => $analysis,
                    'format' => 'json',
                ]);

                if (isset($analysis['recommendation']) && is_array($analysis['recommendation'])) {
                    WorkflowRecommendation::create([
                        'user_workflow_id' => $userWorkflowId,
                        'type' => 'property',
                        'title' => 'Property Recommendation',
                        'description' => $analysis['recommendation']['summary'] ?? '',
                        'priority' => 'medium',
                        'action_items' => $analysis['recommendation'],
                    ]);
                }
            });

            return $this->successResponse($analysis, 'Analysis complete');
        } catch (\Exception $e) {
            return $this->errorResponse('Analysis failed', 500);
        }
    }
}
