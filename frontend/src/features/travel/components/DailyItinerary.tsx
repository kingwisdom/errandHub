import { Clock, MapPin } from 'lucide-react';

interface Props {
  itinerary: Array<{
    day: number;
    theme: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      duration: string;
      cost: number;
      tips: string;
    }>;
    meals: { breakfast: string; lunch: string; dinner: string };
    daily_cost: number;
  }>;
}

export default function DailyItinerary({ itinerary }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Daily Itinerary</h3>
      <div className="space-y-4">
        {itinerary.map((day) => (
          <div key={day.day} className="bg-background rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-primary">Day {day.day}: {day.theme}</h4>
              <span className="text-xs font-medium text-text-muted">${day.daily_cost.toLocaleString()}</span>
            </div>
            <div className="space-y-2 mb-3">
              {day.activities.map((act, i) => (
                <div key={i} className="flex items-start gap-2 pl-3 border-l-2 border-primary/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary">{act.time}</span>
                      <span className="text-sm font-medium text-text-primary">{act.activity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                      <MapPin size={10} /> {act.location}
                      <Clock size={10} /> {act.duration}
                      {act.cost > 0 && <span className="text-primary">${act.cost}</span>}
                    </div>
                    {act.tips && <p className="text-xs text-text-secondary mt-0.5 italic">{act.tips}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-surface rounded-lg px-2 py-1.5">
                <span className="text-text-muted">Breakfast</span>
                <p className="text-text-secondary font-medium">{day.meals.breakfast}</p>
              </div>
              <div className="bg-surface rounded-lg px-2 py-1.5">
                <span className="text-text-muted">Lunch</span>
                <p className="text-text-secondary font-medium">{day.meals.lunch}</p>
              </div>
              <div className="bg-surface rounded-lg px-2 py-1.5">
                <span className="text-text-muted">Dinner</span>
                <p className="text-text-secondary font-medium">{day.meals.dinner}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
