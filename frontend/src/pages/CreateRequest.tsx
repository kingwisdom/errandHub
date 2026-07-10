import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertCircle } from 'lucide-react';
import api from '../services/api';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category_id: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  location: z.string().optional(),
  deadline: z.string().optional(),
  budget_min: z.string().optional(),
  budget_max: z.string().optional(),
  instructions: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/requests', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      navigate(`/requests/${res.data.id}`);
    },
    onError: (err: unknown) => {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
        if (axiosErr.response?.data?.errors) {
          const serverErrors = axiosErr.response.data.errors;
          for (const [field, messages] of Object.entries(serverErrors)) {
            if (field in schema.shape) {
              setError(field as keyof FormData, { message: messages[0] });
            }
          }
        }
      }
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      title: data.title,
      description: data.description,
      category_id: data.category_id ? Number(data.category_id) : null,
      priority: data.priority,
      location: data.location || null,
      deadline: data.deadline || null,
      budget_range: data.budget_min || data.budget_max ? { min: data.budget_min ? Number(data.budget_min) : null, max: data.budget_max ? Number(data.budget_max) : null } : null,
      instructions: data.instructions || null,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Post a New Request</h2>
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-2 bg-red-50 text-error-600 p-4 rounded-xl mb-6 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              {Object.entries(errors).map(([field, err]) => (
                err.message && <p key={field}>{err.message}</p>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Title</label>
            <input type="text" {...register('title')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
              placeholder="e.g., Buy groceries from the local market" />
            {errors.title && <p className="text-error-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
            <textarea {...register('description')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
              rows={4} placeholder="Describe what you need done in detail..." />
            {errors.description && <p className="text-error-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Category</label>
              <select {...register('category_id')}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow">
                <option value="">Select category</option>
                {categories?.map((cat: { id: number; name: string }) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Priority</label>
              <select {...register('priority')}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Location</label>
            <input type="text" {...register('location')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
              placeholder="e.g., Downtown, City Center" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Deadline</label>
            <input type="datetime-local" {...register('deadline')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Budget Min</label>
              <input type="number" {...register('budget_min')}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="$" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Budget Max</label>
              <input type="number" {...register('budget_max')}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" placeholder="$" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Instructions for Agent</label>
            <textarea {...register('instructions')}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
              rows={3} placeholder="Any specific instructions for the agent..." />
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 text-surface font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FF6B00' }}>
            <Send className="w-4 h-4" />
            {mutation.isPending ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
