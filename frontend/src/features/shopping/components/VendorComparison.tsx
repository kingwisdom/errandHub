interface Props {
  vendors: Array<{
    vendor: string;
    price: number;
    shipping: string;
    return_policy: string;
    trust_score: number;
  }>;
}

export default function VendorComparison({ vendors }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Vendor Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-xs font-semibold text-text-muted">Vendor</th>
              <th className="text-right py-2 text-xs font-semibold text-text-muted">Price</th>
              <th className="text-left py-2 text-xs font-semibold text-text-muted">Shipping</th>
              <th className="text-left py-2 text-xs font-semibold text-text-muted">Returns</th>
              <th className="text-right py-2 text-xs font-semibold text-text-muted">Trust</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2.5 font-medium text-text-primary">{v.vendor}</td>
                <td className="py-2.5 text-right font-medium text-primary">${v.price.toLocaleString()}</td>
                <td className="py-2.5 text-text-secondary">{v.shipping}</td>
                <td className="py-2.5 text-text-secondary">{v.return_policy}</td>
                <td className="py-2.5 text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    v.trust_score >= 8 ? 'bg-green-100 text-green-700' :
                    v.trust_score >= 5 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {v.trust_score}/10
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
