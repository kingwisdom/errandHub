import type { FinancialAnalysis } from '../../../services/ai/finance';
import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  insights: FinancialAnalysis['spending_insights'];
  warnings: FinancialAnalysis['warnings'];
  recommendations: FinancialAnalysis['recommendations'];
}

export default function InsightsPanel({ insights, warnings, recommendations }: InsightsPanelProps) {
  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning" />
            Warnings
          </h3>
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${
                w.severity === 'high' ? 'bg-error/10 text-error' :
                w.severity === 'medium' ? 'bg-warning/10 text-warning' :
                'bg-background text-text-secondary'
              }`}>
                {w.warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Lightbulb size={14} className="text-primary" />
            Spending Insights
          </h3>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-background rounded-lg">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  ins.impact === 'positive' ? 'bg-success' :
                  ins.impact === 'negative' ? 'bg-error' : 'bg-text-muted'
                }`} />
                <div>
                  <p className="text-sm text-text-secondary">{ins.insight}</p>
                  {ins.amount > 0 && <p className="text-xs text-text-muted mt-0.5">${ins.amount.toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <CheckCircle size={14} className="text-success" />
            Recommendations
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-text-primary">{rec.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    rec.priority === 'high' ? 'bg-error/10 text-error' :
                    rec.priority === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-success/10 text-success'
                  }`}>{rec.priority}</span>
                </div>
                <p className="text-xs text-text-secondary">{rec.description}</p>
                {rec.estimated_savings > 0 && (
                  <p className="text-xs text-success font-medium mt-1">Save ~${rec.estimated_savings}/mo</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
