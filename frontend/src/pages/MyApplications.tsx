import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, MapPin, DollarSign, XCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const statusColors: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-600',
};

export default function MyApplications() {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const params: Record<string, string | undefined> = {
    status: statusFilter || undefined,
  };

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications', params],
    queryFn: () => api.get('/my-applications', { params }).then((r) => r.data.data),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => api.post(`/errand-applications/${id}/withdraw`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-text-primary mb-6">My Applications</h2>

      <div className="flex gap-2 mb-6">
        {['', 'pending', 'accepted', 'rejected', 'withdrawn'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === s ? 'text-surface' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
            style={statusFilter === s ? { backgroundColor: '#FF6B00' } : undefined}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : !applications?.length ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary mb-3">You haven't applied to any errands yet.</p>
          <Link to="/errands" className="text-sm font-medium" style={{ color: '#FF6B00' }}>Browse Errands</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: {
            id: string; cover_letter?: string; proposed_budget?: number;
            status: string; created_at: string;
            service_request?: { id: string; title: string; status: string;
              deadline?: string; location?: string; budget_range?: number[];
            };
          }) => (
            <div key={app.id} className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  {app.service_request && (
                    <Link to={`/errands/${app.service_request.id}`}
                      className="font-semibold text-text-primary hover:underline line-clamp-1">
                      {app.service_request.title}
                    </Link>
                  )}
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                    {app.service_request?.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.service_request.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {app.service_request?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {app.service_request.location}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColors[app.status] || ''}`}>
                  {app.status}
                </span>
              </div>

              {app.cover_letter && (
                <p className="text-sm text-text-secondary line-clamp-2 mt-2">{app.cover_letter}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  {app.proposed_budget && (
                    <span className="font-medium" style={{ color: '#FF6B00' }}>${app.proposed_budget}</span>
                  )}
                  <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                </div>
                {app.status === 'pending' && (
                  <button onClick={() => withdrawMutation.mutate(app.id)} disabled={withdrawMutation.isPending}
                    className="flex items-center gap-1 text-xs text-red-500 hover:underline">
                    <XCircle className="w-3.5 h-3.5" /> Withdraw
                  </button>
                )}
                {app.status === 'accepted' && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" /> You were picked!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
