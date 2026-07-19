import type { FinancialAnalysis } from '../../../services/ai/finance';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertTriangle } from 'lucide-react';

interface SummaryCardsProps {
  summary: FinancialAnalysis['summary'];
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Monthly Income',
      value: `$${summary.total_income.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Monthly Expenses',
      value: `$${summary.total_expenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-error',
      bg: 'bg-error/10',
    },
    {
      label: 'Net Savings',
      value: `$${summary.net_savings.toLocaleString()}`,
      icon: summary.net_savings >= 0 ? TrendingUp : AlertTriangle,
      color: summary.net_savings >= 0 ? 'text-success' : 'text-error',
      bg: summary.net_savings >= 0 ? 'bg-success/10' : 'bg-error/10',
    },
    {
      label: 'Savings Rate',
      value: `${summary.savings_rate}%`,
      icon: PiggyBank,
      color: summary.savings_rate >= 20 ? 'text-success' : summary.savings_rate >= 10 ? 'text-warning' : 'text-error',
      bg: summary.savings_rate >= 20 ? 'bg-success/10' : summary.savings_rate >= 10 ? 'bg-warning/10' : 'bg-error/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-surface border border-border rounded-xl p-4">
          <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
            <card.icon size={16} className={card.color} />
          </div>
          <p className="text-xs text-text-muted">{card.label}</p>
          <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
