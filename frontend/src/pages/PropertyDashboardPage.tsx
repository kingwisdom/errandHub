import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workflowsApi } from '../services/ai/workflows';
import type { UserWorkflow } from '../services/ai/workflows';
import { propertyApi } from '../services/ai/property';
import type { PropertyAnalysis } from '../services/ai/property';
import PropertySummary from '../features/property/components/PropertySummary';
import RiskAssessment from '../features/property/components/RiskAssessment';
import AffordabilityCheck from '../features/property/components/AffordabilityCheck';
import MortgageOptions from '../features/property/components/MortgageOptions';
import AreaInsights from '../features/property/components/AreaInsights';
import ResourcesPanel from '../components/shared/ResourcesPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ExportButton from '../components/shared/ExportButton';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardHeader from '../components/shared/DashboardHeader';

export default function PropertyDashboardPage() {
  const { userWorkflowId } = useParams<{ userWorkflowId: string }>();
  const [userWorkflow, setUserWorkflow] = useState<UserWorkflow | null>(null);
  const [analysis, setAnalysis] = useState<PropertyAnalysis | null>(null);
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
          const existingAnalysis = uw.data?.analysis as PropertyAnalysis | undefined;
          if (existingAnalysis) setAnalysis(existingAnalysis);
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
      const res = await propertyApi.analyze(userWorkflowId);
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
        <LoadingSpinner text="Loading property data..." />
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
          title="Property Dashboard"
          subtitle={analysis ? 'Analysis complete' : 'No analysis yet'}
          userWorkflowId={userWorkflowId}
          onDelete={handleDelete}
          actions={analysis && userWorkflowId ? <ExportButton userWorkflowId={userWorkflowId} filename="property-report.pdf" /> : undefined}
        />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {!analysis ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Ready to Analyse</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              We have your property details and budget. Click below to run the AI analysis.
            </p>
            <div className="bg-background rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
              <h3 className="text-xs font-semibold text-text-muted uppercase mb-2">Your Data</h3>
              <pre className="text-xs text-text-secondary overflow-auto max-h-40">
                {JSON.stringify(userWorkflow.data, null, 2)}
              </pre>
            </div>
            <button onClick={handleAnalyze} disabled={analyzing} className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
              {analyzing ? 'Analysing...' : 'Run Property Analysis'}
            </button>
          </div>
        ) : (
          <>
            <PropertySummary summary={analysis.property_summary} />
            <RiskAssessment riskAssessment={analysis.risk_assessment} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AffordabilityCheck affordability={analysis.affordability} />
              <MortgageOptions options={analysis.mortgage_options} />
            </div>
            <AreaInsights areaInsights={analysis.area_insights} />

            {analysis.recommendation && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Recommendation</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                  analysis.recommendation.verdict === 'buy' ? 'bg-green-50 text-green-700' :
                  analysis.recommendation.verdict === 'negotiate' ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {analysis.recommendation.verdict.toUpperCase()} — {analysis.recommendation.confidence}% confidence
                </div>
                <p className="text-sm text-text-secondary mb-4">{analysis.recommendation.summary}</p>
                {analysis.recommendation.negotiation_points.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-text-muted mb-1">Negotiation Points</p>
                    <div className="space-y-1">
                      {analysis.recommendation.negotiation_points.map((p, i) => (
                        <p key={i} className="text-xs text-text-secondary">- {p}</p>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.recommendation.next_steps.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-muted mb-1">Next Steps</p>
                    <div className="space-y-1">
                      {analysis.recommendation.next_steps.map((s, i) => (
                        <p key={i} className="text-xs text-text-secondary">- {s}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {analysis.action_items && analysis.action_items.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Action Items</h3>
                <div className="space-y-2">
                  {analysis.action_items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">{item.action}</p>
                        <p className="text-xs text-text-muted">{item.deadline}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.priority === 'high' ? 'bg-red-50 text-red-700' :
                        item.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-surface text-text-muted'
                      }`}>{item.priority}</span>
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
