import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle, MessageCircle, Star, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [reviewForm, setReviewForm] = useState({ rating: 5, communication: 0, professionalism: 0, timeliness: 0, quality: 0, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => api.get(`/requests/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.post(`/requests/${id}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['request', id] }),
  });

  const confirmMutation = useMutation({
    mutationFn: () => api.post(`/requests/${id}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['request', id] }),
  });

  const travelMutation = useMutation({
    mutationFn: () => api.post(`/requests/${id}/travel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['request', id] }),
  });

  const waitingMutation = useMutation({
    mutationFn: () => api.post(`/requests/${id}/waiting`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['request', id] }),
  });

  const startMutation = useMutation({
    mutationFn: () => api.post(`/requests/${id}/start`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['request', id] }),
  });

  const completeMutation = useMutation({
    mutationFn: () => api.post(`/requests/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['request', id] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => api.post(`/requests/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      setShowCancelModal(false);
      setCancelReason('');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { rating: number; communication_rating?: number; professionalism_rating?: number; timeliness_rating?: number; quality_rating?: number; comment: string }) => api.post(`/requests/${id}/reviews`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      setReviewForm({ rating: 5, communication: 0, professionalism: 0, timeliness: 0, quality: 0, comment: '' });
    },
    onError: (err: unknown) => {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setReviewError(axiosErr.response?.data?.message || 'Failed to submit review');
      }
    },
  });

  if (isLoading) return <p className="text-text-secondary">Loading...</p>;
  if (!request) return <p className="text-text-secondary">Request not found</p>;

  const isClient = user?.id === request.client_id;
  const isAgent = user?.id === request.agent_id;
  const canAccept = user?.role === 'agent' && request.status === 'published';
  const canConfirm = isClient && request.status === 'accepted';
  const canTravel = isAgent && request.status === 'client_confirmed';
  const canWait = isAgent && request.status === 'travelling';
  const canStart = isAgent && ['accepted', 'client_confirmed', 'waiting'].includes(request.status);
  const canComplete = isAgent && request.status === 'in_progress';
  const canCancel = (isClient || isAgent) && !['completed', 'cancelled', 'expired'].includes(request.status);
  const canReview = (isClient || isAgent) && request.status === 'completed';
  const hasReviewed = request.review && (request.review.reviewer_id === user?.id);
  const canChat = (isClient || isAgent) && ['accepted', 'client_confirmed', 'travelling', 'waiting', 'in_progress'].includes(request.status);

  const statusStyles: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#F3F4F6', text: '#111827' },
    published: { bg: '#FFF7ED', text: '#FF6B00' },
    accepted: { bg: '#EFF6FF', text: '#1E3A8A' },
    client_confirmed: { bg: '#F5F3FF', text: '#7C3AED' },
    travelling: { bg: '#FEF3C7', text: '#B45309' },
    waiting: { bg: '#EDE9FE', text: '#6D28D9' },
    in_progress: { bg: '#F5F3FF', text: '#7C3AED' },
    completed: { bg: '#F0FDF4', text: '#22C55E' },
    reviewed: { bg: '#F0FDF4', text: '#15803D' },
    cancelled: { bg: '#FEF2F2', text: '#DC2626' },
    expired: { bg: '#FEF2F2', text: '#DC2626' },
  };

  const s = statusStyles[request.status] || { bg: '#F3F4F6', text: '#111827' };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    reviewMutation.mutate({
      rating: reviewForm.rating,
      communication_rating: reviewForm.communication || undefined,
      professionalism_rating: reviewForm.professionalism || undefined,
      timeliness_rating: reviewForm.timeliness || undefined,
      quality_rating: reviewForm.quality || undefined,
      comment: reviewForm.comment,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{request.title}</h2>
            <p className="text-text-secondary mt-1">
              Posted by {request.client?.name} · {request.priority} priority
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.text }}>
            {request.status.replace('_', ' ')}
          </span>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-text-primary mb-2">Description</h3>
          <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{request.description}</p>
        </div>

        {request.instructions && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#FFF7ED' }}>
            <h3 className="font-semibold text-text-primary mb-1">Instructions</h3>
            <p className="text-text-secondary whitespace-pre-wrap">{request.instructions}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {request.category && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Category</h3>
              <p className="text-text-primary">{request.category.name}</p>
            </div>
          )}
          {request.location && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Location</h3>
              <p className="text-text-primary">{request.location}</p>
            </div>
          )}
          {request.deadline && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Deadline</h3>
              <p className="text-text-primary">{new Date(request.deadline).toLocaleDateString()}</p>
            </div>
          )}
          {request.budget_range && (request.budget_range.min || request.budget_range.max) && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary">Budget</h3>
              <p className="text-text-primary">
                {request.budget_range.min && `$${request.budget_range.min}`}
                {request.budget_range.max && ` - $${request.budget_range.max}`}
              </p>
            </div>
          )}
        </div>

        {request.agent && (
          <div className="border-t border-border pt-4 mb-6">
            <h3 className="font-semibold text-text-primary mb-2">Assigned Agent</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-surface"
                style={{ backgroundColor: '#FF6B00' }}>
                {request.agent.name.charAt(0)}
              </div>
              <span className="text-text-primary">{request.agent.name}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {canConfirm && (
            <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1E3A8A' }}>
              <CheckCircle className="w-4 h-4" /> Confirm Agent
            </button>
          )}
          {canAccept && (
            <button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#FF6B00' }}>
              <CheckCircle className="w-4 h-4" /> Accept Request
            </button>
          )}
          {canTravel && (
            <button onClick={() => travelMutation.mutate()} disabled={travelMutation.isPending}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#B45309' }}>
              <CheckCircle className="w-4 h-4" /> Start Travelling
            </button>
          )}
          {canWait && (
            <button onClick={() => waitingMutation.mutate()} disabled={waitingMutation.isPending}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#6D28D9' }}>
              <CheckCircle className="w-4 h-4" /> Mark Waiting
            </button>
          )}
          {canStart && (
            <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1E3A8A' }}>
              <CheckCircle className="w-4 h-4" /> Start Request
            </button>
          )}
          {canComplete && (
            <button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#22C55E' }}>
              <CheckCircle className="w-4 h-4" /> Mark Complete
            </button>
          )}
          {canCancel && (
            <button onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: '#DC2626' }}>
              <XCircle className="w-4 h-4" /> Cancel Request
            </button>
          )}
          {canChat && (
            <Link to={`/requests/${id}/chat`}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 font-medium transition-colors"
              style={{ color: '#1E3A8A', borderColor: '#1E3A8A' }}>
              <MessageCircle className="w-4 h-4" /> Chat
            </Link>
          )}
        </div>
      </div>

      {request.statuses?.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <h3 className="font-semibold text-text-primary mb-4">Status Timeline</h3>
          <div className="space-y-4">
            {request.statuses.map((status: { id: number; from_status: string; to_status: string; created_at: string; note?: string; user?: { name: string } }, index: number) => (
              <div key={status.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: index === 0 ? '#22C55E' : '#FF6B00' }} />
                  {index < request.statuses.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-text-primary">
                    {status.from_status || 'Created'} → {status.to_status.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    by {status.user?.name} · {new Date(status.created_at).toLocaleString()}
                  </p>
                  {status.note && <p className="text-sm text-text-secondary mt-1">{status.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {canReview && !hasReviewed && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <h3 className="font-semibold text-text-primary mb-4">Leave a Review</h3>
          {reviewError && <div className="text-error-500 text-sm mb-3">{reviewError}</div>}
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Overall Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                    <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-current' : ''}`}
                      style={{ color: star <= reviewForm.rating ? '#F59E0B' : '#E5E7EB' }} />
                  </button>
                ))}
              </div>
            </div>

            {[
              { key: 'communication', label: 'Communication' },
              { key: 'professionalism', label: 'Professionalism' },
              { key: 'timeliness', label: 'Timeliness' },
              { key: 'quality', label: 'Quality' },
            ].map((dim) => (
              <div key={dim.key}>
                <label className="block text-sm font-medium text-text-primary mb-2">{dim.label}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      onClick={() => setReviewForm({ ...reviewForm, [dim.key]: star })}>
                      <Star className={`w-5 h-5 ${star <= (reviewForm as any)[dim.key] ? 'fill-current' : ''}`}
                        style={{ color: star <= (reviewForm as any)[dim.key] ? '#F59E0B' : '#E5E7EB' }} />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Comment (optional)</label>
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
                rows={3} placeholder="Share your experience..." />
            </div>
            <button type="submit" disabled={reviewMutation.isPending}
              className="flex items-center gap-2 text-surface font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#FF6B00' }}>
              <Star className="w-4 h-4" /> Submit Review
            </button>
          </form>
        </div>
      )}

      {request.cancellation_reason && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="font-semibold text-red-700 mb-1">Cancelled</h3>
          <p className="text-red-600 text-sm">{request.cancellation_reason}</p>
          {request.cancelled_by && (
            <p className="text-xs text-red-500 mt-1">by {request.cancelled_by.name}</p>
          )}
        </div>
      )}

      {request.expires_at && request.status === 'published' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-700">
            Expires: {new Date(request.expires_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCancelModal(false)}>
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-primary mb-2">Cancel Request</h3>
            <p className="text-sm text-text-secondary mb-4">Please tell us why you're cancelling (optional).</p>
            {cancelError && <p className="text-xs text-red-500 mb-2">{cancelError}</p>}
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow mb-4"
              rows={3} maxLength={1000} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowCancelModal(false); setCancelReason(''); setCancelError(''); }}
                className="text-sm text-text-secondary hover:text-text-primary px-4 py-2 transition-colors">
                Keep Request
              </button>
              <button onClick={() => {
                if (cancelReason.length > 1000) { setCancelError('Reason too long'); return; }
                cancelMutation.mutate(cancelReason);
              }} disabled={cancelMutation.isPending}
                className="text-sm font-medium text-surface px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                style={{ backgroundColor: '#DC2626' }}>
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {request.review && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <h3 className="font-semibold text-text-primary mb-4">Review</h3>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-5 h-5 ${star <= request.review.rating ? 'fill-current' : ''}`}
                style={{ color: star <= request.review.rating ? '#F59E0B' : '#E5E7EB' }} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { key: 'communication_rating', label: 'Communication' },
              { key: 'professionalism_rating', label: 'Professionalism' },
              { key: 'timeliness_rating', label: 'Timeliness' },
              { key: 'quality_rating', label: 'Quality' },
            ].map((dim) => {
              const val = request.review[dim.key];
              if (!val) return null;
              return (
                <div key={dim.key}>
                  <p className="text-xs text-text-secondary mb-1">{dim.label}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= val ? 'fill-current' : ''}`}
                        style={{ color: star <= val ? '#F59E0B' : '#E5E7EB' }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {request.review.comment && <p className="text-text-secondary text-sm">{request.review.comment}</p>}
          <p className="text-xs text-text-secondary mt-2">by {request.review.reviewer?.name}</p>
        </div>
      )}
    </div>
  );
}
