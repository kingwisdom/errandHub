interface Props {
  costEstimate: {
    visa_fee: number;
    application_fee: number;
    medical_exam: number;
    document_translation: number;
    biometrics: number;
    total_estimate: number;
    currency: string;
  };
}

export default function CostEstimate({ costEstimate }: Props) {
  const items = [
    { label: 'Visa Fee', amount: costEstimate.visa_fee },
    { label: 'Application Fee', amount: costEstimate.application_fee },
    { label: 'Medical Exam', amount: costEstimate.medical_exam },
    { label: 'Document Translation', amount: costEstimate.document_translation },
    { label: 'Biometrics', amount: costEstimate.biometrics },
  ];

  const currency = costEstimate.currency || 'USD';

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Cost Estimate</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-text-secondary">{item.label}</span>
            <span className="text-sm font-medium text-text-primary">{currency} {item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-semibold text-text-primary">Total Estimate</span>
          <span className="text-lg font-bold text-primary">{currency} {costEstimate.total_estimate.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
