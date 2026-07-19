interface Props {
  summary: {
    type: string;
    estimated_value: number;
    price_per_sqft: number;
    condition_assessment: string;
    verdict: string;
  };
}

export default function PropertySummary({ summary }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Property Summary</h3>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-text-primary">{summary.type}</h4>
          <p className="text-sm text-text-secondary">{summary.condition_assessment}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary">${summary.estimated_value.toLocaleString()}</p>
          {summary.price_per_sqft > 0 && (
            <p className="text-xs text-text-muted">${summary.price_per_sqft.toLocaleString()}/sqft</p>
          )}
        </div>
      </div>
      <p className="text-sm text-text-secondary bg-background rounded-lg p-3">{summary.verdict}</p>
    </div>
  );
}
