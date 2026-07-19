<?php

namespace App\Services\AI;

use App\Models\UserWorkflow;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportService
{
    public function generateReport(UserWorkflow $userWorkflow)
    {
        $data = $userWorkflow->data ?? [];
        $analysis = $data['analysis'] ?? [];
        $workflow = $userWorkflow->workflow;

        $pdf = Pdf::loadView('reports.workflow', [
            'userWorkflow' => $userWorkflow,
            'workflow' => $workflow,
            'analysis' => $analysis,
            'data' => $data,
        ]);

        return $pdf;
    }
}
