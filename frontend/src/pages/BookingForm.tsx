import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader } from 'lucide-react';
import api from '../services/api';

type FormData = { scheduled_at: string; notes: string };

export default function BookingForm() {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const { data: service } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => api.get(`/services/${serviceId}`).then((r) => r.data.data),
    enabled: !!serviceId,
  });

  const bookingMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/bookings', {
      service_listing_id: serviceId,
      provider_id: service?.agent?.id,
      scheduled_at: data.scheduled_at,
      notes: data.notes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/bookings');
    },
  });

  const onSubmit = (data: FormData) => bookingMutation.mutate(data);

  if (!service) return <p className="text-text-secondary">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Book a Service</h2>
        <p className="text-text-secondary mb-6">
          {service.title} &mdash; {service.starting_price ? `$${service.starting_price}` : 'Price negotiable'}
          {service.is_negotiable ? ' (negotiable)' : ''}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Scheduled Date &amp; Time</label>
            <input type="datetime-local" {...register('scheduled_at', { required: 'Please pick a date and time' })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white outline-none transition-colors focus:border-[#FF6B00] text-sm" />
            {errors.scheduled_at && <p className="text-xs text-red-500 mt-1">{errors.scheduled_at.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Notes for the provider</label>
            <textarea {...register('notes', { maxLength: 1000 })}
              rows={4}
              placeholder="Describe what you need, location details, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white outline-none transition-colors focus:border-[#FF6B00] text-sm resize-none" />
            {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={bookingMutation.isPending}
              className="flex items-center gap-2 text-sm font-medium text-surface px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#FF6B00' }}>
              {bookingMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {bookingMutation.isPending ? 'Sending...' : 'Send Booking Request'}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
