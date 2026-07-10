import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Ban } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  accepted: { bg: '#DBEAFE', text: '#1E40AF', label: 'Accepted' },
  declined: { bg: '#FEE2E2', text: '#991B1B', label: 'Declined' },
  rescheduled: { bg: '#F3E8FF', text: '#6B21A8', label: 'Rescheduled' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' },
  completed: { bg: '#D1FAE5', text: '#065F46', label: 'Completed' },
};

export default function MyBookings() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then((r) => r.data),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.post(`/bookings/${id}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => api.post(`/bookings/${id}/decline`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post(`/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setCancelTarget(null);
      setCancelReason('');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/bookings/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  if (isLoading) return <p className="text-text-secondary">Loading bookings...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">My Bookings</h2>
      {bookings?.data?.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-text-secondary mb-4">No bookings yet.</p>
          <Link to="/services"
            className="text-sm font-medium text-surface px-5 py-2.5 rounded-xl transition-colors inline-block"
            style={{ backgroundColor: '#FF6B00' }}>
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings?.data?.map((booking: {
            id: string; status: string; scheduled_at: string | null; notes: string | null;
            provider?: { id: string; name: string };
            client?: { id: string; name: string };
            serviceListing?: { id: string; title: string; starting_price: number | null };
            serviceRequest?: { id: string; title: string };
          }) => {
            const s = statusStyles[booking.status] || { bg: '#F3F4F6', text: '#111827', label: booking.status };
            const isProvider = user?.role === 'agent';
            const title = booking.serviceListing?.title || booking.serviceRequest?.title || 'Booking';
            const otherParty = isProvider ? booking.client?.name : booking.provider?.name;

            return (
              <div key={booking.id} className="bg-surface rounded-2xl shadow-sm border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-text-primary">{title}</h3>
                    <p className="text-sm text-text-secondary">{isProvider ? 'From' : 'With'}: {otherParty}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ backgroundColor: s.bg, color: s.text }}>
                    {s.label}
                  </span>
                </div>

                {booking.scheduled_at && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.scheduled_at).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                )}

                {booking.notes && (
                  <p className="text-sm text-text-secondary mb-3 whitespace-pre-wrap">{booking.notes}</p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {isProvider && booking.status === 'pending' && (
                    <>
                      <button onClick={() => acceptMutation.mutate(booking.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-surface px-3 py-1.5 rounded-lg transition-colors"
                        style={{ backgroundColor: '#22C55E' }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => declineMutation.mutate(booking.id)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border-2 transition-colors"
                        style={{ color: '#DC2626', borderColor: '#DC2626' }}>
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </>
                  )}
                  {booking.status === 'accepted' && isProvider && (
                    <button onClick={() => completeMutation.mutate(booking.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-surface px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: '#1E3A8A' }}>
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                    </button>
                  )}
                  {!['completed', 'cancelled', 'declined'].includes(booking.status) && (
                    <button onClick={() => setCancelTarget(booking.id)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border-2 transition-colors"
                      style={{ color: '#6B7280', borderColor: '#D1D5DB' }}>
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setCancelTarget(null); setCancelReason(''); }}>
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary mb-2">Cancel Booking</h3>
            <p className="text-sm text-text-secondary mb-4">Reason for cancellation (optional):</p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Optional reason..."
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow mb-4"
              rows={3} maxLength={500} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setCancelTarget(null); setCancelReason(''); }}
                className="text-sm text-text-secondary hover:text-text-primary px-4 py-2 transition-colors">
                Keep Booking
              </button>
              <button onClick={() => cancelMutation.mutate({ id: cancelTarget, reason: cancelReason })}
                disabled={cancelMutation.isPending}
                className="text-sm font-medium text-surface px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#6B7280' }}>
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
