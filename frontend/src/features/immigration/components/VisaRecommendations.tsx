interface Props {
  visas: Array<{
    name: string;
    match_score: number;
    description: string;
    requirements_met: string[];
    requirements_missing: string[];
  }>;
}

export default function VisaRecommendations({ visas }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Recommended Visa Types</h3>
      <div className="space-y-3">
        {visas.map((visa, i) => (
          <div key={i} className="bg-background rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-text-primary">{visa.name}</h4>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                visa.match_score >= 75 ? 'bg-green-100 text-green-700' :
                visa.match_score >= 40 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {visa.match_score}% match
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-3">{visa.description}</p>
            {visa.requirements_met.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-green-600 mb-1">Requirements Met</p>
                <div className="flex flex-wrap gap-1">
                  {visa.requirements_met.map((r, j) => (
                    <span key={j} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {visa.requirements_missing.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-600 mb-1">Missing</p>
                <div className="flex flex-wrap gap-1">
                  {visa.requirements_missing.map((r, j) => (
                    <span key={j} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
