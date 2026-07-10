import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 text-center">
        {verified === '1' || verified === 'already' ? (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#22C55E' }} />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Email Verified</h2>
            <p className="text-text-secondary mb-6">
              {verified === 'already' ? 'Your email was already verified.' : 'Your email has been verified successfully.'}
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-error-500" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Verification Failed</h2>
            <p className="text-text-secondary mb-6">The verification link is invalid or expired.</p>
          </>
        )}
        <Link to="/dashboard"
          className="inline-flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors"
          style={{ backgroundColor: '#FF6B00' }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
