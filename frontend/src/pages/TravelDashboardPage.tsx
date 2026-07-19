import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workflowsApi } from '../services/ai/workflows';
import type { UserWorkflow } from '../services/ai/workflows';
import { travelApi } from '../services/ai/travel';
import type { TravelAnalysis } from '../services/ai/travel';
import TripSummary from '../features/travel/components/TripSummary';
import DailyItinerary from '../features/travel/components/DailyItinerary';
import CostBreakdown from '../features/travel/components/CostBreakdown';
import PackingAndTips from '../features/travel/components/PackingAndTips';
import NearbyAttractions from '../features/travel/components/NearbyAttractions';
import ResourcesPanel from '../components/shared/ResourcesPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ExportButton from '../components/shared/ExportButton';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardHeader from '../components/shared/DashboardHeader';

export default function TravelDashboardPage() {
  const { userWorkflowId } = useParams<{ userWorkflowId: string }>();
  const [userWorkflow, setUserWorkflow] = useState<UserWorkflow | null>(null);
  const [analysis, setAnalysis] = useState<TravelAnalysis | null>(null);
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
          const existingAnalysis = uw.data?.analysis as TravelAnalysis | undefined;
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
      const res = await travelApi.analyze(userWorkflowId);
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
        <LoadingSpinner text="Loading trip data..." />
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
          title="Trip Planner"
          subtitle={analysis ? 'Plan ready' : 'No plan yet'}
          userWorkflowId={userWorkflowId}
          onDelete={handleDelete}
          actions={analysis && userWorkflowId ? <ExportButton userWorkflowId={userWorkflowId} filename="travel-plan.pdf" /> : undefined}
        />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {!analysis ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Ready to Plan</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              We have your trip details and preferences. Click below to generate your AI travel plan.
            </p>
            <div className="bg-background rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
              <h3 className="text-xs font-semibold text-text-muted uppercase mb-2">Your Data</h3>
              <pre className="text-xs text-text-secondary overflow-auto max-h-40">
                {JSON.stringify(userWorkflow.data, null, 2)}
              </pre>
            </div>
            <button onClick={handleAnalyze} disabled={analyzing} className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
              {analyzing ? 'Generating...' : 'Generate Travel Plan'}
            </button>
          </div>
        ) : (
          <>
            <TripSummary summary={analysis.trip_summary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CostBreakdown costBreakdown={analysis.cost_breakdown} />
              {analysis.accommodation_options.length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Accommodation</h3>
                  <div className="space-y-2">
                    {analysis.accommodation_options.map((acc, i) => (
                      <div key={i} className="bg-background rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-text-primary">{acc.name}</h4>
                            <p className="text-xs text-text-muted">{acc.type} — {acc.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">${acc.price_per_night}/night</p>
                            <p className="text-xs text-amber-500">{acc.rating}*</p>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{acc.best_for}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {analysis.daily_itinerary.length > 0 && (
              <DailyItinerary itinerary={analysis.daily_itinerary} />
            )}

            {analysis.nearby_attractions.length > 0 && (
              <NearbyAttractions attractions={analysis.nearby_attractions} />
            )}

            <PackingAndTips packingList={analysis.packing_list} travelTips={analysis.travel_tips} />

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
