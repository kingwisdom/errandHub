import { MapPin, Calendar, Users } from 'lucide-react';

interface Props {
  summary: {
    destination: string;
    duration_days: number;
    trip_type: string;
    best_season: string;
    highlights: string[];
    verdict: string;
  };
}

export default function TripSummary({ summary }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Trip Summary</h3>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <MapPin size={18} className="text-cyan-500" />
            {summary.destination}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><Calendar size={12} /> {summary.duration_days} days</span>
            <span className="flex items-center gap-1"><Users size={12} /> {summary.trip_type}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-medium">{summary.best_season}</span>
        </div>
      </div>
      {summary.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {summary.highlights.map((h, i) => (
            <span key={i} className="text-xs bg-background text-text-secondary px-2 py-0.5 rounded-full">{h}</span>
          ))}
        </div>
      )}
      <p className="text-sm text-text-secondary bg-background rounded-lg p-3">{summary.verdict}</p>
    </div>
  );
}
