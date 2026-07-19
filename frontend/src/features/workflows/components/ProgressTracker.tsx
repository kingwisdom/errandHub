import { Check } from 'lucide-react';
import type { WorkflowStep } from '../../../services/ai/workflows';

interface ProgressTrackerProps {
  steps: WorkflowStep[];
  currentStepId: string | null;
  completedSteps?: string[];
}

export default function ProgressTracker({ steps, currentStepId, completedSteps = [] }: ProgressTrackerProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const currentIndex = sortedSteps.findIndex((s) => s.id === currentStepId);

  return (
    <div className="space-y-1">
      {sortedSteps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id) || idx < currentIndex;
        const isCurrent = step.id === currentStepId;

        return (
          <div key={step.id} className="flex items-center gap-3 py-2 px-3 rounded-lg">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                isCompleted
                  ? 'bg-success text-white'
                  : isCurrent
                  ? 'bg-primary text-white'
                  : 'bg-background border border-border text-text-muted'
              }`}
            >
              {isCompleted ? <Check size={14} /> : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
                }`}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-text-muted truncate">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
