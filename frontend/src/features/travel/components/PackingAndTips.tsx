import { Backpack, Lightbulb, Star } from 'lucide-react';

interface Props {
  packingList: Array<{ category: string; items: string[] }>;
  travelTips: Array<{ tip: string; category: string; importance: string }>;
}

export default function PackingAndTips({ packingList, travelTips }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Backpack size={14} /> Packing List
        </h3>
        <div className="space-y-3">
          {packingList.map((cat, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-text-primary mb-1.5">{cat.category}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item, j) => (
                  <span key={j} className="text-xs bg-background text-text-secondary px-2 py-1 rounded-lg">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Lightbulb size={14} /> Travel Tips
        </h3>
        <div className="space-y-2">
          {travelTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 bg-background rounded-lg p-3">
              <Star size={14} className={`flex-shrink-0 mt-0.5 ${
                tip.importance === 'high' ? 'text-amber-400 fill-amber-400' :
                tip.importance === 'medium' ? 'text-text-muted' : 'text-text-muted'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary">{tip.tip}</p>
                <p className="text-xs text-text-muted capitalize">{tip.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
