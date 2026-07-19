import { Clock } from 'lucide-react';

interface Props {
  timeline: Array<{
    phase: string;
    duration: string;
    description: string;
    status: string;
  }>;
}

export default function ImmigrationTimeline({ timeline }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Timeline</h3>
      <div className="relative">
        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
        <div className="space-y-4">
          {timeline.map((step, i) => (
            <div key={i} className="relative flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                step.status === 'completed' ? 'bg-green-500 text-white' :
                step.status === 'in_progress' ? 'bg-primary text-white' :
                'bg-surface border-2 border-border text-text-muted'
              }`}>
                {step.status === 'completed' ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-text-primary">{step.phase}</h4>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock size={10} />
                    {step.duration}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
