import type { FinancialAnalysis } from '../../../services/ai/finance';

interface ExpenseChartProps {
  expenses: FinancialAnalysis['expense_breakdown'];
}

const COLORS = ['#0F766E', '#2563EB', '#EA580C', '#16A34A', '#CA8A04', '#7C3AED', '#DC2626', '#0891B2'];

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  const maxAmount = Math.max(...expenses.map((e) => e.amount), 1);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Expense Breakdown</h3>
      <div className="space-y-3">
        {expenses.map((expense, idx) => (
          <div key={expense.category}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-secondary">{expense.category}</span>
              <span className="font-medium text-text-primary">${expense.amount.toLocaleString()} ({expense.percentage}%)</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${(expense.amount / maxAmount) * 100}%`,
                  backgroundColor: COLORS[idx % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
