<?php

namespace App\Http\Controllers\Api\AI;

use App\Models\UserWorkflow;
use App\Models\WorkflowReport;
use App\Models\WorkflowRecommendation;
use App\Services\AI\TravelAnalysisService;
use Illuminate\Http\JsonResponse;

class TravelController extends BaseApiController
{
    public function __construct(
        protected TravelAnalysisService $travelAnalysisService
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
            $analysis = $this->travelAnalysisService->analyze($userWorkflow);

            \Illuminate\Support\Facades\DB::transaction(function () use ($userWorkflow, $analysis, $userWorkflowId) {
                $userWorkflow->update(['data' => array_merge($userWorkflow->data ?? [], ['analysis' => $analysis])]);

                WorkflowReport::create([
                    'user_workflow_id' => $userWorkflowId,
                    'type' => 'travel_plan',
                    'title' => 'Travel Plan Report',
                    'content' => $analysis,
                    'format' => 'json',
                ]);

                if (isset($analysis['recommendations']) && is_array($analysis['recommendations'])) {
                    foreach ($analysis['recommendations'] as $rec) {
                        WorkflowRecommendation::create([
                            'user_workflow_id' => $userWorkflowId,
                            'type' => 'travel',
                            'title' => $rec['title'] ?? 'Recommendation',
                            'description' => $rec['description'] ?? '',
                            'priority' => $rec['priority'] ?? 'medium',
                            'action_items' => $rec,
                        ]);
                    }
                }
            });

            return $this->successResponse($analysis, 'Plan generated');
        } catch (\Exception $e) {
            return $this->errorResponse('Analysis failed', 500);
        }
    }
}
