interface Props {
  summary: {
    name: string;
    category: string;
    average_price: number;
    price_range: { min: number; max: number };
    best_for: string;
    verdict: string;
  };
}

export default function ProductSummary({ summary }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Product Summary</h3>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-text-primary">{summary.name}</h4>
          <p className="text-sm text-text-secondary">{summary.category}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary">${summary.average_price.toLocaleString()}</p>
          <p className="text-xs text-text-muted">${summary.price_range.min.toLocaleString()} - ${summary.price_range.max.toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-background rounded-lg p-3">
        <p className="text-sm text-text-secondary"><span className="font-medium text-text-primary">Best for:</span> {summary.best_for}</p>
        <p className="text-sm text-text-secondary mt-1">{summary.verdict}</p>
      </div>
    </div>
  );
}
