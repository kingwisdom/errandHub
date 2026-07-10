import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  role: z.enum(['client', 'agent']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/register', data);
      const { data: loginData } = await api.post('/login', { email: data.email, password: data.password });
      setAuth(loginData.user, loginData.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
        if (axiosErr.response?.data?.errors) {
          const serverErrors = axiosErr.response.data.errors;
          for (const [field, messages] of Object.entries(serverErrors)) {
            if (field in schema.shape) {
              setError(field as keyof FormData, { message: messages[0] });
            }
          }
          if (serverErrors.general) {
            setError('root', { message: serverErrors.general[0] });
          }
        } else {
          setError('root', { message: axiosErr.response?.data?.message || 'Registration failed' });
        }
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Create account</h2>
        <p className="text-text-secondary text-sm mb-8">Join ErrandHub as a client or agent</p>
        {errors.root && (
          <div className="flex items-center gap-2 bg-red-50 text-error-600 p-3 rounded-xl mb-4 text-sm">
            <span>⚠</span> {errors.root.message}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
            <input type="text" {...register('name')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
            {errors.name && <p className="text-error-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <input type="email" {...register('email')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
            {errors.email && <p className="text-error-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Phone (optional)</label>
            <input type="tel" {...register('phone')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">I want to...</label>
            <select {...register('role')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow">
              <option value="client">Hire help (Client)</option>
              <option value="agent">Offer services (Agent)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <input type="password" {...register('password')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
            {errors.password && <p className="text-error-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm Password</label>
            <input type="password" {...register('password_confirmation')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
            {errors.password_confirmation && <p className="text-error-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 text-surface font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FF6B00' }}>
            <UserPlus className="w-4 h-4" />
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1E3A8A' }} className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
