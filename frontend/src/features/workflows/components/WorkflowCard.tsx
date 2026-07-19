import type { Workflow, UserWorkflow } from '../../../services/ai/workflows';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';

interface WorkflowCardProps {
  workflow: Workflow;
  userWorkflow?: UserWorkflow;
}

export default function WorkflowCard({ workflow, userWorkflow }: WorkflowCardProps) {
  const status = userWorkflow?.status;
  const progress = userWorkflow?.progress || 0;

  return (
    <Link to={userWorkflow ? `/workflow/${workflow.slug}/${userWorkflow.id}` : `/workflow/${workflow.slug}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{workflow.name}</h3>
            <p className="text-sm text-text-secondary mt-0.5">{workflow.description}</p>
          </div>
          <div className="p-2 rounded-xl bg-primary-light text-primary flex-shrink-0">
            <ArrowRight size={16} />
          </div>
        </div>
        {status && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={`font-medium ${status === 'completed' ? 'text-success' : 'text-primary'}`}>
                {status === 'completed' ? 'Completed' : `${progress}% complete`}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${status === 'completed' ? 'bg-success' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
