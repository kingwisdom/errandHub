import { AlertTriangle } from 'lucide-react';

interface Props {
  riskAssessment: {
    overall_risk: string;
    structural_risk: string;
    legal_risk: string;
    market_risk: string;
    risks: Array<{ risk: string; severity: string; detail: string }>;
  };
}

export default function RiskAssessment({ riskAssessment }: Props) {
  const riskColor = (risk: string) =>
    risk === 'low' ? 'text-green-600 bg-green-50' :
    risk === 'medium' ? 'text-amber-600 bg-amber-50' :
    'text-red-600 bg-red-50';

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Risk Assessment</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Overall', value: riskAssessment.overall_risk },
          { label: 'Structural', value: riskAssessment.structural_risk },
          { label: 'Legal', value: riskAssessment.legal_risk },
          { label: 'Market', value: riskAssessment.market_risk },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg p-3 text-center ${riskColor(item.value)}`}>
            <p className="text-xs font-medium opacity-70">{item.label}</p>
            <p className="text-sm font-bold capitalize">{item.value}</p>
          </div>
        ))}
      </div>
      {riskAssessment.risks.length > 0 && (
        <div className="space-y-2">
          {riskAssessment.risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-lg">
              <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${
                risk.severity === 'high' ? 'text-red-500' :
                risk.severity === 'medium' ? 'text-amber-500' : 'text-text-muted'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{risk.risk}</p>
                <p className="text-xs text-text-secondary">{risk.detail}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                risk.severity === 'high' ? 'bg-red-50 text-red-700' :
                risk.severity === 'medium' ? 'bg-amber-50 text-amber-700' :
                'bg-surface text-text-muted'
              }`}>{risk.severity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
