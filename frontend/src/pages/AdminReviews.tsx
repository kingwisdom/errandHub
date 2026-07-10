import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Star, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'all' | 'flagged'>('all');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews', tab],
    queryFn: () => api.get(`/admin/reviews${tab === 'flagged' ? '/flagged' : ''}`).then((r) => r.data),
  });

  const hideMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/reviews/${id}/hide`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  const showMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/reviews/${id}/show`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Review Moderation</h2>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'all' ? 'text-surface' : 'text-text-secondary bg-gray-100'}`}
          style={tab === 'all' ? { backgroundColor: '#1E3A8A' } : {}}>
          All Reviews
        </button>
        <button onClick={() => setTab('flagged')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'flagged' ? 'text-surface' : 'text-text-secondary bg-gray-100'}`}
          style={tab === 'flagged' ? { backgroundColor: '#DC2626' } : {}}>
          Flagged
        </button>
      </div>

      {isLoading ? <p className="text-text-secondary">Loading...</p> : (
        <div className="space-y-4">
          {reviews?.data?.map((review: {
            id: string; rating: number; communication_rating?: number; professionalism_rating?: number;
            timeliness_rating?: number; quality_rating?: number; comment?: string; is_visible: boolean;
            created_at: string; reviewer?: { name: string }; reviewee?: { name: string };
            serviceRequest?: { title: string };
          }) => (
            <div key={review.id} className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-text-primary">
                    {review.reviewer?.name} → {review.reviewee?.name}
                  </p>
                  <p className="text-sm text-text-secondary">{review.serviceRequest?.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${review.is_visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {review.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                  {review.is_visible ? (
                    <button onClick={() => hideMutation.mutate(review.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Hide">
                      <EyeOff className="w-4 h-4 text-red-500" />
                    </button>
                  ) : (
                    <button onClick={() => showMutation.mutate(review.id)}
                      className="p-1.5 rounded-lg hover:bg-green-50 transition-colors" title="Show">
                      <Eye className="w-4 h-4 text-green-500" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : ''}`}
                    style={{ color: star <= review.rating ? '#F59E0B' : '#E5E7EB' }} />
                ))}
                <span className="text-xs text-text-secondary ml-1">Overall</span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { key: 'communication_rating', label: 'Comm' },
                  { key: 'professionalism_rating', label: 'Prof' },
                  { key: 'timeliness_rating', label: 'Time' },
                  { key: 'quality_rating', label: 'Quality' },
                ].map((dim) => {
                  const val = (review as any)[dim.key];
                  if (!val) return null;
                  return (
                    <div key={dim.key}>
                      <p className="text-xs text-text-secondary">{dim.label}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3 h-3 ${star <= val ? 'fill-current' : ''}`}
                            style={{ color: star <= val ? '#F59E0B' : '#E5E7EB' }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {review.comment && <p className="text-sm text-text-secondary mb-2">{review.comment}</p>}
              <p className="text-xs text-text-secondary">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {reviews?.data?.length === 0 && <p className="text-text-secondary text-center py-8">No reviews found.</p>}
        </div>
      )}
    </div>
  );
}
