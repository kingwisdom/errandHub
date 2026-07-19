import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workflowsApi } from '../services/ai/workflows';
import type { Workflow, UserWorkflow } from '../services/ai/workflows';
import { financeApi } from '../services/ai/finance';
import { immigrationApi } from '../services/ai/immigration';
import { shoppingApi } from '../services/ai/shopping';
import { propertyApi } from '../services/ai/property';
import { travelApi } from '../services/ai/travel';
import DynamicForm from '../features/workflows/components/DynamicForm';
import ProgressTracker from '../features/workflows/components/ProgressTracker';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ArrowLeft, FileText, Upload, RotateCcw } from 'lucide-react';

export default function AiWorkflowPage() {
  const { slug, userWorkflowId } = useParams<{ slug: string; userWorkflowId?: string }>();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [userWorkflow, setUserWorkflow] = useState<UserWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const load = async () => {
      try {
        if (userWorkflowId) {
          const res = await workflowsApi.myWorkflows();
          const existing = res.data.find((uw) => uw.id === userWorkflowId);
          if (existing) {
            setUserWorkflow(existing);
            setWorkflow(existing.workflow!);
          } else {
            const wfRes = await workflowsApi.get(slug);
            setWorkflow(wfRes.data);
          }
        } else {
          const wfRes = await workflowsApi.get(slug);
          setWorkflow(wfRes.data);
        }
      } catch {
        window.location.href = '/ai';
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, userWorkflowId]);

  const handleStart = async (forceNew: boolean = false) => {
    if (!slug) return;
    setSubmitting(true);
    try {
      const res = await workflowsApi.start(slug, forceNew);
      setUserWorkflow(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = async (answers: Record<string, unknown>) => {
    if (!userWorkflow) return;
    setSubmitting(true);
    try {
      const currentStepId = userWorkflow.current_step_id;
      const res = await workflowsApi.advance(userWorkflow.id, answers);
      if (currentStepId) setCompletedSteps((prev) => [...prev, currentStepId]);
      setUserWorkflow(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiAnalysis = async () => {
    if (!userWorkflow || !slug) return;
    setSubmitting(true);
    try {
      if (slug === 'finance') {
        await financeApi.analyze(userWorkflow.id);
        window.location.href = `/ai/workflow/finance/${userWorkflow.id}/dashboard`;
        return;
      }
      if (slug === 'immigration') {
        await immigrationApi.analyze(userWorkflow.id);
        window.location.href = `/ai/workflow/immigration/${userWorkflow.id}/dashboard`;
        return;
      }
      if (slug === 'shopping') {
        await shoppingApi.analyze(userWorkflow.id);
        window.location.href = `/ai/workflow/shopping/${userWorkflow.id}/dashboard`;
        return;
      }
      if (slug === 'property') {
        await propertyApi.analyze(userWorkflow.id);
        window.location.href = `/ai/workflow/property/${userWorkflow.id}/dashboard`;
        return;
      }
      if (slug === 'travel') {
        await travelApi.analyze(userWorkflow.id);
        window.location.href = `/ai/workflow/travel/${userWorkflow.id}/dashboard`;
        return;
      }
      const currentStepId = userWorkflow.current_step_id;
      const res = await workflowsApi.advance(userWorkflow.id, {});
      if (currentStepId) setCompletedSteps((prev) => [...prev, currentStepId]);
      setUserWorkflow(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Loading workflow..." />
      </div>
    );
  }

  if (!workflow) return null;

  const steps = workflow.steps || [];
  const currentStep = userWorkflow?.current_step;
  const isCompleted = userWorkflow?.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center h-14 px-4 gap-3">
          <Link to="/ai/workflows" className="p-1.5 rounded-lg hover:bg-background text-text-secondary">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-text-primary">{workflow.name}</h1>
            <p className="text-xs text-text-muted">{workflow.description}</p>
          </div>
          {userWorkflow && userWorkflow.status === 'in_progress' && (
            <button
              onClick={() => handleStart(true)}
              disabled={submitting}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Start New
            </button>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-2xl p-4 sticky top-20">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Progress</h3>
              {userWorkflow ? (
                <ProgressTracker steps={steps} currentStepId={userWorkflow.current_step_id} completedSteps={completedSteps} />
              ) : (
                <div className="space-y-1">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-3 py-2 px-3 rounded-lg">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-background border border-border text-text-muted">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-text-muted">{step.title}</p>
                    </div>
                  ))}
                </div>
              )}
              {userWorkflow && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-muted">Overall</span>
                    <span className="font-medium text-primary">{userWorkflow.progress}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${userWorkflow.progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-3">
            {!userWorkflow ? (
              <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">{workflow.name}</h2>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">{workflow.description}</p>
                <button
                  onClick={() => handleStart(false)}
                  disabled={submitting}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Starting...' : 'Start Workflow'}
                </button>
              </div>
            ) : isCompleted ? (
              <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">Workflow Complete!</h2>
                <p className="text-text-secondary mb-4">Your data has been saved. You can review your results anytime.</p>
                <div className="bg-background rounded-xl p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Your Data</h3>
                  <pre className="text-xs text-text-secondary overflow-auto max-h-60">
                    {JSON.stringify(userWorkflow.data, null, 2)}
                  </pre>
                </div>
                <Link
                  to="/ai"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            ) : currentStep ? (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-text-primary">{currentStep.title}</h2>
                  {currentStep.description && (
                    <p className="text-sm text-text-secondary mt-1">{currentStep.description}</p>
                  )}
                </div>

                {currentStep.type === 'form' && currentStep.questions ? (
                  <DynamicForm
                    questions={currentStep.questions}
                    initialValues={userWorkflow.data || {}}
                    onSubmit={handleAdvance}
                    loading={submitting}
                  />
                ) : currentStep.type === 'document' ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                      <Upload size={32} className="mx-auto text-text-muted mb-3" />
                      <p className="text-sm text-text-secondary mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-text-muted">PDF, DOC, XLS, CSV, Images up to 10MB</p>
                    </div>
                    <button
                      onClick={() => handleAdvance({})}
                      disabled={submitting}
                      className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Skip / Continue Without Upload'}
                    </button>
                  </div>
                ) : currentStep.type === 'ai_analysis' ? (
                  <div className="text-center py-8">
                    <LoadingSpinner text={submitting ? 'AI is analysing your data...' : 'Ready to analyse'} />
                    <p className="text-xs text-text-muted mt-4">This may take a few seconds</p>
                    <button
                      onClick={handleAiAnalysis}
                      disabled={submitting}
                      className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Analysing...' : 'Run AI Analysis'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">Results will appear here</p>
                    <button
                      onClick={() => handleAdvance({})}
                      disabled={submitting}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
