import { Plane, Home, Utensils, Bus, ShoppingBag, Activity } from 'lucide-react';

interface Props {
  costBreakdown: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
    shopping: number;
    total: number;
    per_day: number;
  };
}

export default function CostBreakdown({ costBreakdown }: Props) {
  const items = [
    { label: 'Flights', amount: costBreakdown.flights, icon: Plane, color: 'text-blue-500' },
    { label: 'Accommodation', amount: costBreakdown.accommodation, icon: Home, color: 'text-purple-500' },
    { label: 'Food', amount: costBreakdown.food, icon: Utensils, color: 'text-green-500' },
    { label: 'Activities', amount: costBreakdown.activities, icon: Activity, color: 'text-amber-500' },
    { label: 'Transport', amount: costBreakdown.transport, icon: Bus, color: 'text-cyan-500' },
    { label: 'Shopping', amount: costBreakdown.shopping, icon: ShoppingBag, color: 'text-pink-500' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Cost Breakdown</h3>
      <div className="space-y-2 mb-4">
        {items.map((item) => {
          const Icon = item.icon;
          const pct = costBreakdown.total > 0 ? (item.amount / costBreakdown.total) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-text-secondary flex items-center gap-1.5">
                  <Icon size={14} className={item.color} /> {item.label}
                </span>
                <span className="text-sm font-medium text-text-primary">${item.amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-background rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm font-semibold text-text-primary">Total</span>
        <span className="text-lg font-bold text-primary">${costBreakdown.total.toLocaleString()}</span>
      </div>
      <div className="text-right text-xs text-text-muted">${costBreakdown.per_day.toLocaleString()}/day</div>
    </div>
  );
}
