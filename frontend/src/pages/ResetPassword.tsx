import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, KeyRound, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: '',
    token: searchParams.get('token') || '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/reset-password', form);
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Password reset failed');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Reset password</h2>
        <p className="text-text-secondary text-sm mb-8">Enter your new password below.</p>
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                required readOnly={!!searchParams.get('email')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                placeholder="••••••••" required minLength={8} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                className="w-full border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 text-surface font-medium py-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: '#FF6B00' }}>
            <KeyRound className="w-4 h-4" />
            Reset Password
          </button>
        </form>
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
