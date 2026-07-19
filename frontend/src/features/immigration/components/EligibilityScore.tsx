interface Props {
  eligibility: {
    score: number;
    verdict: string;
    summary: string;
  };
}

export default function EligibilityScore({ eligibility }: Props) {
  const color =
    eligibility.verdict === 'likely_eligible'
      ? 'text-green-600 bg-green-50 border-green-200'
      : eligibility.verdict === 'may_be_eligible'
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-red-600 bg-red-50 border-red-200';

  const label =
    eligibility.verdict === 'likely_eligible'
      ? 'Likely Eligible'
      : eligibility.verdict === 'may_be_eligible'
        ? 'May Be Eligible'
        : 'Unlikely Eligible';

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Eligibility</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={eligibility.verdict === 'likely_eligible' ? '#16a34a' : eligibility.verdict === 'may_be_eligible' ? '#d97706' : '#dc2626'}
              strokeWidth="3"
              strokeDasharray={`${eligibility.score}, 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">
            {eligibility.score}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
            {label}
          </span>
          <p className="text-sm text-text-secondary mt-2">{eligibility.summary}</p>
        </div>
      </div>
    </div>
  );
}
