import type { FinancialAnalysis } from '../../../services/ai/finance';

interface BudgetComparisonProps {
  budget: FinancialAnalysis['budget'];
}

export default function BudgetComparison({ budget }: BudgetComparisonProps) {
  const rule = budget['50_30_20'];

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">50/30/20 Budget Rule</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-background rounded-xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold text-primary">50%</span>
          </div>
          <p className="text-xs font-medium text-text-primary">Needs</p>
          <p className="text-sm font-bold text-primary">${rule.needs.toLocaleString()}</p>
          <p className="text-xs text-text-muted">Housing, food, transport</p>
        </div>
        <div className="text-center p-3 bg-background rounded-xl">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold text-accent">30%</span>
          </div>
          <p className="text-xs font-medium text-text-primary">Wants</p>
          <p className="text-sm font-bold text-accent">${rule.wants.toLocaleString()}</p>
          <p className="text-xs text-text-muted">Entertainment, dining</p>
        </div>
        <div className="text-center p-3 bg-background rounded-xl">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
            <span className="text-lg font-bold text-success">20%</span>
          </div>
          <p className="text-xs font-medium text-text-primary">Savings</p>
          <p className="text-sm font-bold text-success">${rule.savings.toLocaleString()}</p>
          <p className="text-xs text-text-muted">Emergency, investments</p>
        </div>
      </div>
    </div>
  );
}
