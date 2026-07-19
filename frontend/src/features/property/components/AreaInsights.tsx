import { School, Train, Shield } from 'lucide-react';

interface Props {
  areaInsights: {
    schools: Array<{ name: string; rating: string; distance: string }>;
    transport: Array<{ name: string; type: string; distance: string }>;
    amenities: string[];
    safety_rating: string;
  };
}

export default function AreaInsights({ areaInsights }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Area Insights</h3>

      {areaInsights.schools.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1"><School size={12} /> Schools</p>
          <div className="space-y-2">
            {areaInsights.schools.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-background rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-text-primary">{s.name}</p>
                  <p className="text-xs text-text-muted">{s.distance}</p>
                </div>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {areaInsights.transport.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1"><Train size={12} /> Transport</p>
          <div className="space-y-2">
            {areaInsights.transport.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-background rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.distance}</p>
                </div>
                <span className="text-xs text-text-muted capitalize">{t.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {areaInsights.amenities.length > 0 && (
          <div className="bg-background rounded-lg p-3">
            <p className="text-xs font-medium text-text-muted mb-1">Amenities</p>
            <div className="flex flex-wrap gap-1">
              {areaInsights.amenities.map((a, i) => (
                <span key={i} className="text-xs bg-surface text-text-secondary px-2 py-0.5 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1"><Shield size={10} /> Safety</p>
          <p className="text-sm font-semibold text-text-primary">{areaInsights.safety_rating}</p>
        </div>
      </div>
    </div>
  );
}
