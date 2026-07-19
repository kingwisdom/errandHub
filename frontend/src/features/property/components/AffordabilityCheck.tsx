import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  affordability: {
    affordable: boolean;
    mortgage_needed: number;
    deposit_percentage: number;
    estimated_monthly_payment: number;
    income_to_loan_ratio: number;
    verdict: string;
  };
}

export default function AffordabilityCheck({ affordability }: Props) {
  const ratio = affordability.income_to_loan_ratio;
  const ratioColor = ratio < 35 ? 'text-green-600' : ratio < 45 ? 'text-amber-600' : 'text-red-600';
  const TrendIcon = ratio < 35 ? TrendingDown : TrendingUp;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Affordability</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Mortgage Needed</p>
          <p className="text-lg font-bold text-text-primary">${affordability.mortgage_needed.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Deposit</p>
          <p className="text-lg font-bold text-primary">{affordability.deposit_percentage}%</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Monthly Payment</p>
          <p className="text-lg font-bold text-text-primary">${affordability.estimated_monthly_payment.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Income to Loan</p>
          <div className="flex items-center gap-1">
            <TrendIcon size={16} className={ratioColor} />
            <span className={`text-lg font-bold ${ratioColor}`}>{ratio}%</span>
          </div>
        </div>
      </div>
      <div className={`rounded-lg p-3 text-center font-semibold ${
        affordability.affordable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        {affordability.verdict}
      </div>
    </div>
  );
}
