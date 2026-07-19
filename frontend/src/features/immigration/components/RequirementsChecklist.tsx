import { Check, AlertCircle, X } from 'lucide-react';

interface Props {
  requirements: Record<string, { status: string; detail: string }>;
}

export default function RequirementsChecklist({ requirements }: Props) {
  const entries = Object.entries(requirements);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Requirements</h3>
      <div className="space-y-2">
        {entries.map(([key, req]) => (
          <div key={key} className="flex items-start gap-3 p-3 bg-background rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {req.status === 'met' ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={12} className="text-green-600" />
                </div>
              ) : req.status === 'partial' ? (
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle size={12} className="text-amber-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <X size={12} className="text-red-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary capitalize">{key}</p>
              <p className="text-xs text-text-secondary">{req.detail}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
              req.status === 'met' ? 'bg-green-100 text-green-700' :
              req.status === 'partial' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {req.status === 'met' ? 'Met' : req.status === 'partial' ? 'Partial' : 'Not Met'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
