import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WorkflowCard from '../features/workflows/components/WorkflowCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { workflowsApi } from '../services/ai/workflows';
import type { Workflow, UserWorkflow } from '../services/ai/workflows';
import { ArrowLeft, Briefcase, ExternalLink } from 'lucide-react';

export default function AiWorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [myWorkflows, setMyWorkflows] = useState<UserWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [wfRes, myRes] = await Promise.all([
          workflowsApi.list(),
          workflowsApi.myWorkflows(),
        ]);
        setWorkflows(wfRes.data);
        setMyWorkflows(myRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/ai" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-4">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-manrope">Workflows</h1>
          <p className="text-sm text-text-secondary mt-1">Choose a workflow to get started. Each one guides you step-by-step.</p>
        </div>

        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Loading workflows..." />
          </div>
        ) : (
          <>
            {myWorkflows.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold text-text-primary mb-4 font-manrope">Continue Where You Left Off</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myWorkflows.map((uw) => (
                    <WorkflowCard key={uw.id} workflow={uw.workflow!} userWorkflow={uw} />
                  ))}
                </div>
              </section>
            )}

            <section className="mb-10">
              <h2 className="text-lg font-semibold text-text-primary mb-4 font-manrope">Available Workflows</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((wf) => {
                  const existing = myWorkflows.find((uw) => uw.workflow_id === wf.id && uw.status === 'in_progress');
                  return <WorkflowCard key={wf.id} workflow={wf} userWorkflow={existing} />;
                })}
              </div>
            </section>

            <section className="pb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4 font-manrope">Platforms</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="https://jobdrive.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-surface border border-border rounded-2xl p-5 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={20} className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">Job Platform</h3>
                        <ExternalLink size={12} className="text-text-muted" />
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">Job search, applications, and career tools</p>
                    </div>
                  </div>
                </a>
              </div>
            </section>
          </>
        )}
      </main>
  );
}
