<?php

namespace App\Http\Controllers\Api\AI;

use App\Models\UserWorkflow;
use App\Services\AI\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ReportController extends BaseApiController
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function download(string $userWorkflowId): Response|JsonResponse
    {
        $guestUuid = $this->getGuestUuid();
        if (!$guestUuid) {
            return $this->errorResponse('Guest UUID required', 401);
        }

        $userWorkflow = UserWorkflow::with('workflow')->where('id', $userWorkflowId)
            ->where('guest_uuid', $guestUuid)
            ->first();

        if (!$userWorkflow) {
            return $this->errorResponse('Workflow not found', 404);
        }

        if (empty($userWorkflow->data['analysis'])) {
            return $this->errorResponse('No analysis data to export', 400);
        }

        try {
            $pdf = $this->reportService->generateReport($userWorkflow);
            $slug = $userWorkflow->workflow?->slug ?? 'report';
            $filename = $slug . '-report-' . substr($userWorkflowId, 0, 8) . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            return $this->errorResponse('Report generation failed', 500);
        }
    }
}
