import { Star } from 'lucide-react';

interface Props {
  picks: Array<{
    name: string;
    brand: string;
    price: number;
    match_score: number;
    pros: string[];
    cons: string[];
    best_for: string;
    where_to_buy: string;
  }>;
}

export default function TopPicks({ picks }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Top Picks</h3>
      <div className="space-y-3">
        {picks.map((pick, i) => (
          <div key={i} className="bg-background rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">{pick.name}</h4>
                  {i === 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Best Match</span>
                  )}
                </div>
                <p className="text-xs text-text-muted">{pick.brand}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">${pick.price.toLocaleString()}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-text-primary">{pick.match_score}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-text-secondary mb-2">{pick.best_for}</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-xs font-medium text-green-600 mb-1">Pros</p>
                {pick.pros.map((pro, j) => (
                  <p key={j} className="text-xs text-text-secondary">+ {pro}</p>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium text-red-600 mb-1">Cons</p>
                {pick.cons.map((con, j) => (
                  <p key={j} className="text-xs text-text-secondary">- {con}</p>
                ))}
              </div>
            </div>
            <p className="text-xs text-text-muted">Where to buy: {pick.where_to_buy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
