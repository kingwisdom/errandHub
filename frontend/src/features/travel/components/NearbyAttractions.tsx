import { MapPin } from 'lucide-react';

interface Props {
  attractions: Array<{
    name: string;
    type: string;
    distance: string;
    cost: number;
    description: string;
  }>;
}

export default function NearbyAttractions({ attractions }: Props) {
  if (attractions.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Nearby Attractions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attractions.map((attr, i) => (
          <div key={i} className="bg-background rounded-lg p-4">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-semibold text-text-primary">{attr.name}</h4>
              <span className="text-xs text-text-muted capitalize bg-surface px-2 py-0.5 rounded-full">{attr.type}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <MapPin size={10} /> {attr.distance}
              {attr.cost > 0 && <span className="text-primary font-medium">${attr.cost}</span>}
              {attr.cost === 0 && <span className="text-green-600 font-medium">Free</span>}
            </div>
            <p className="text-xs text-text-secondary">{attr.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
