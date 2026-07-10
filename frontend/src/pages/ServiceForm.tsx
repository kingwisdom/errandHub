import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, AlertCircle } from 'lucide-react';
import api from '../services/api';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category_id: z.string().optional(),
  price_type: z.enum(['fixed', 'hourly', 'negotiable']),
  starting_price: z.string().optional(),
  is_negotiable: z.boolean(),
  location: z.string().optional(),
  coverage_radius: z.string().optional(),
  experience_years: z.string().optional(),
  estimated_duration: z.string().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { price_type: 'fixed', is_negotiable: true },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: existing } = useQuery({
    queryKey: ['my-service', id],
    queryFn: () => api.get(`/services/${id}`).then((r) => r.data.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title || '',
        description: existing.description || '',
        category_id: existing.category_id?.toString() || '',
        price_type: existing.price_type || 'fixed',
        starting_price: existing.starting_price?.toString() || '',
        is_negotiable: existing.is_negotiable ?? true,
        location: existing.location || '',
        coverage_radius: existing.coverage_radius?.toString() || '',
        experience_years: existing.experience_years?.toString() || '',
        estimated_duration: existing.estimated_duration?.toString() || '',
        tags: existing.tags?.join(', ') || '',
      });
    }
  }, [existing, reset]);

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/services', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      navigate('/services/my');
    },
    onError: (err: { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }) => {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        Object.entries(serverErrors).forEach(([field, msgs]) => {
          setError(field as keyof FormData, { message: (msgs as string[])[0] });
        });
      } else {
        setError('title', { message: err.response?.data?.message || 'Failed to create service' });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/services/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      navigate('/services/my');
    },
    onError: (err: { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }) => {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        Object.entries(serverErrors).forEach(([field, msgs]) => {
          setError(field as keyof FormData, { message: (msgs as string[])[0] });
        });
      } else {
        setError('title', { message: err.response?.data?.message || 'Failed to update service' });
      }
    },
  });

  const onSubmit = (data: FormData) => {
    const payload: Record<string, unknown> = {
      ...data,
      starting_price: data.starting_price ? parseFloat(data.starting_price) : null,
      coverage_radius: data.coverage_radius ? parseInt(data.coverage_radius) : null,
      experience_years: data.experience_years ? parseInt(data.experience_years) : null,
      estimated_duration: data.estimated_duration ? parseInt(data.estimated_duration) : null,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      category_id: data.category_id ? parseInt(data.category_id) : null,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text-primary mb-6">{isEdit ? 'Edit Service' : 'Create Service'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-surface rounded-2xl shadow-sm border border-border p-8">
        {(createMutation.isError || updateMutation.isError) && !Object.keys(errors).length && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
            <p className="text-sm" style={{ color: '#DC2626' }}>{createMutation.error?.response?.data?.message || updateMutation.error?.response?.data?.message || 'Something went wrong'}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Title *</label>
          <input {...register('title')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="e.g., I will repair your plumbing" />
          {errors.title && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Category</label>
          <select {...register('category_id')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface">
            <option value="">Select category...</option>
            {categories?.map((cat: { id: number; name: string }) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
          <textarea {...register('description')} rows={4} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="Describe your service in detail..." />
          {errors.description && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Price Type *</label>
            <select {...register('price_type')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface">
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Starting Price ($)</label>
            <input type="number" step="0.01" min="0" {...register('starting_price')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="0.00" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('is_negotiable')} className="rounded" style={{ accentColor: '#FF6B00' }} />
          <span className="text-sm text-text-secondary">Price is negotiable</span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Location</label>
            <input {...register('location')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="e.g., Downtown, City-wide" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Coverage Radius (km)</label>
            <input type="number" min="0" {...register('coverage_radius')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="e.g., 15" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Experience (years)</label>
            <input type="number" min="0" {...register('experience_years')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="e.g., 5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Est. Duration (min)</label>
            <input type="number" min="0" {...register('estimated_duration')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="e.g., 60" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Tags (comma separated)</label>
          <input {...register('tags')} className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="e.g., plumbing, emergency, residential" />
        </div>

        <button type="submit" disabled={isPending}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-surface px-5 py-3 rounded-xl transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#FF6B00' }}>
          <Save className="w-4 h-4" />
          {isPending ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
        </button>
      </form>
    </div>
  );
}
