import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const { data } = await api.post('/forgot-password', { email });
      setMessage(data.message);
      setSent(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to send reset link');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Forgot password?</h2>
        <p className="text-text-secondary text-sm mb-8">No worries, we'll send you a reset link.</p>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-error-600 p-3 rounded-xl mb-4 text-sm">
            <span>⚠</span> {error}
          </div>
        )}
        {message && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm">
            {message}
          </div>
        )}
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                  placeholder="you@example.com" required />
              </div>
            </div>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 text-surface font-medium py-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: '#FF6B00' }}>
              <Send className="w-4 h-4" />
              Send Reset Link
            </button>
          </form>
        ) : (
          <Link to="/login"
            className="w-full flex items-center justify-center gap-2 text-surface font-medium py-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: '#1E3A8A' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        )}
        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link to="/login" style={{ color: '#1E3A8A' }} className="font-medium hover:underline">
            <ArrowLeft className="w-3 h-3 inline mr-1" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
