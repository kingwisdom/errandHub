interface Props {
  options: Array<{
    type: string;
    rate: string;
    monthly_payment: number;
    total_cost: number;
    pros: string[];
    cons: string[];
  }>;
}

export default function MortgageOptions({ options }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Mortgage Options</h3>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <div key={i} className="bg-background rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{opt.type}</h4>
                <p className="text-xs text-primary font-medium">{opt.rate} APR</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">${opt.monthly_payment.toLocaleString()}/mo</p>
                <p className="text-xs text-text-muted">Total: ${opt.total_cost.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-xs font-medium text-green-600 mb-1">Pros</p>
                {opt.pros.map((p, j) => <p key={j} className="text-xs text-text-secondary">+ {p}</p>)}
              </div>
              <div>
                <p className="text-xs font-medium text-red-600 mb-1">Cons</p>
                {opt.cons.map((c, j) => <p key={j} className="text-xs text-text-secondary">- {c}</p>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
