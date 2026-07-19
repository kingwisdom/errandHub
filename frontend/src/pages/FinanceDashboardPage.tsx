import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workflowsApi } from '../services/ai/workflows';
import type { UserWorkflow } from '../services/ai/workflows';
import { financeApi } from '../services/ai/finance';
import type { FinancialAnalysis } from '../services/ai/finance';
import SummaryCards from '../features/finance/components/SummaryCards';
import ExpenseChart from '../features/finance/components/ExpenseChart';
import BudgetComparison from '../features/finance/components/BudgetComparison';
import InsightsPanel from '../features/finance/components/InsightsPanel';
import SavingsPlan from '../features/finance/components/SavingsPlan';
import ResourcesPanel from '../components/shared/ResourcesPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ExportButton from '../components/shared/ExportButton';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardHeader from '../components/shared/DashboardHeader';

export default function FinanceDashboardPage() {
  const { userWorkflowId } = useParams<{ userWorkflowId: string }>();
  const [userWorkflow, setUserWorkflow] = useState<UserWorkflow | null>(null);
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!userWorkflowId) return;
    setLoading(true);

    const load = async () => {
      try {
        const myRes = await workflowsApi.myWorkflows();
        const uw = myRes.data.find((w: UserWorkflow) => w.id === userWorkflowId);
        if (uw) {
          setUserWorkflow(uw);
          const existingAnalysis = uw.data?.analysis as FinancialAnalysis | undefined;
          if (existingAnalysis) {
            setAnalysis(existingAnalysis);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userWorkflowId]);

  const handleAnalyze = async () => {
    if (!userWorkflowId) return;
    setAnalyzing(true);
    try {
      const res = await financeApi.analyze(userWorkflowId);
      setAnalysis(res.data);
      setUserWorkflow((prev: UserWorkflow | null) => prev ? { ...prev, data: { ...prev.data, analysis: res.data } } : prev);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!userWorkflowId) return;
    await workflowsApi.delete(userWorkflowId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Loading financial data..." />
      </div>
    );
  }

  if (!userWorkflow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Workflow not found</p>
          <Link to="/ai" className="text-primary hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <DashboardHeader
          title="Financial Dashboard"
          subtitle={analysis ? 'AI analysis complete' : 'No analysis yet'}
          userWorkflowId={userWorkflowId}
          onDelete={handleDelete}
          actions={analysis && userWorkflowId ? <ExportButton userWorkflowId={userWorkflowId} filename="finance-report.pdf" /> : undefined}
        />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {!analysis ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Ready to Analyse</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              We have your income and expense data. Click below to run the AI financial analysis.
            </p>
            <div className="bg-background rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
              <h3 className="text-xs font-semibold text-text-muted uppercase mb-2">Your Data</h3>
              <pre className="text-xs text-text-secondary overflow-auto max-h-40">
                {JSON.stringify(userWorkflow.data, null, 2)}
              </pre>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {analyzing ? 'Analysing...' : 'Run AI Analysis'}
            </button>
          </div>
        ) : (
          <>
            <SummaryCards summary={analysis.summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart expenses={analysis.expense_breakdown} />
              <BudgetComparison budget={analysis.budget} />
            </div>

            {analysis.savings_plan && <SavingsPlan savingsPlan={analysis.savings_plan} />}

            <InsightsPanel
              insights={analysis.spending_insights}
              warnings={analysis.warnings}
              recommendations={analysis.recommendations}
            />

            {analysis.action_items && analysis.action_items.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Action Items</h3>
                <div className="space-y-2">
                  {analysis.action_items.map((item: { action: string; deadline: string; impact: string }, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.action}</p>
                        <p className="text-xs text-text-muted">{item.deadline} — {item.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.resources && analysis.resources.length > 0 && (
              <ResourcesPanel resources={analysis.resources} />
            )}

            {analysis.ai_metadata && (
              <div className="text-center text-xs text-text-muted py-4">
                Powered by {analysis.ai_metadata.provider} ({analysis.ai_metadata.model}) — {analysis.ai_metadata.tokens} tokens — {Math.round(analysis.ai_metadata.duration)}ms
              </div>
            )}
          </>
        )}
      </main>
      </div>
    </ErrorBoundary>
  );
}
