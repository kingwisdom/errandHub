import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/login', { email, password });
      setAuth(data.user, data.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
        setError(axiosErr.response?.data?.errors?.email?.[0] || axiosErr.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
        <p className="text-text-secondary text-sm mb-8">Sign in to your ErrandHub account</p>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-error-600 p-3 rounded-xl mb-4 text-sm">
            <span>⚠</span> {error}
          </div>
        )}
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
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                placeholder="••••••••" required />
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" style={{ color: '#1E3A8A' }} className="text-sm font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 text-surface font-medium py-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: '#FF6B00' }}>
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1E3A8A' }} className="font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
