import { TrendingDown, TrendingUp, Minus, Tag } from 'lucide-react';

interface Props {
  priceAnalysis: {
    current_average: number;
    best_time_to_buy: string;
    price_trend: string;
    historic_low: number;
    coupon_tips: string[];
  };
}

export default function PriceAnalysis({ priceAnalysis }: Props) {
  const TrendIcon = priceAnalysis.price_trend === 'falling' ? TrendingDown :
                    priceAnalysis.price_trend === 'rising' ? TrendingUp : Minus;

  const trendColor = priceAnalysis.price_trend === 'falling' ? 'text-green-600' :
                     priceAnalysis.price_trend === 'rising' ? 'text-red-600' : 'text-text-muted';

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Price Analysis</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Current Average</p>
          <p className="text-lg font-bold text-text-primary">${priceAnalysis.current_average.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Historic Low</p>
          <p className="text-lg font-bold text-green-600">${priceAnalysis.historic_low.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Price Trend</p>
          <div className="flex items-center gap-1">
            <TrendIcon size={16} className={trendColor} />
            <span className={`text-sm font-semibold capitalize ${trendColor}`}>{priceAnalysis.price_trend}</span>
          </div>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted">Best Time to Buy</p>
          <p className="text-sm font-medium text-text-primary">{priceAnalysis.best_time_to_buy}</p>
        </div>
      </div>
      {priceAnalysis.coupon_tips.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1">
            <Tag size={12} /> Money-Saving Tips
          </p>
          <div className="space-y-1">
            {priceAnalysis.coupon_tips.map((tip, i) => (
              <p key={i} className="text-xs text-text-secondary bg-background rounded-lg px-3 py-2">- {tip}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
