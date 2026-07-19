import type { FinancialAnalysis } from '../../../services/ai/finance';
import { Target, TrendingUp, Calendar } from 'lucide-react';

interface SavingsPlanProps {
  savingsPlan: FinancialAnalysis['savings_plan'];
}

export default function SavingsPlan({ savingsPlan }: SavingsPlanProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Savings Plan</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-background rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-primary" />
            <span className="text-xs text-text-muted">Emergency Fund Target</span>
          </div>
          <p className="text-lg font-bold text-primary">${savingsPlan.emergency_fund_target.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-background rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-success" />
            <span className="text-xs text-text-muted">Monthly Savings Target</span>
          </div>
          <p className="text-lg font-bold text-success">${savingsPlan.monthly_savings_target.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-background rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-accent" />
            <span className="text-xs text-text-muted">Timeline</span>
          </div>
          <p className="text-lg font-bold text-accent">{savingsPlan.timeline_months} months</p>
        </div>
        <div className="p-3 bg-background rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-success" />
            <span className="text-xs text-text-muted">12-Month Projection</span>
          </div>
          <p className="text-lg font-bold text-success">${savingsPlan.projected_savings_12_months.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
