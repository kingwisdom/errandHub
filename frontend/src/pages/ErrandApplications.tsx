import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Star, Award, Briefcase } from 'lucide-react';
import api from '../services/api';

export default function ErrandApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: errand } = useQuery({
    queryKey: ['errand', id],
    queryFn: () => api.get(`/requests/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ['errand-applications', id],
    queryFn: () => api.get(`/requests/${id}/applications`).then((r) => r.data.data),
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: (applicationId: string) => api.post(`/errand-applications/${applicationId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errand-applications', id] });
      queryClient.invalidateQueries({ queryKey: ['errand', id] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (applicationId: string) => api.post(`/errand-applications/${applicationId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errand-applications', id] });
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Applications</h2>
        {errand && <p className="text-text-secondary text-sm mt-1">for "{errand.title}"</p>}
      </div>

      {isLoading ? (
        <p className="text-text-secondary">Loading applications...</p>
      ) : !applications?.length ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-text-secondary">No applications yet. Share your errand to attract agents.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app: {
            id: string; cover_letter?: string; proposed_budget?: number;
            status: string; created_at: string;
            agent?: { id: string; name: string; avatar?: string; is_verified: boolean;
              agent_profile?: { avg_overall_rating?: number; total_reviews_count?: number;
                completed_jobs_count?: number; experience_years?: number; bio?: string };
            };
          }) => (
            <div key={app.id} className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {app.agent?.avatar ? (
                    <img src={`http://localhost:8000/storage/${app.agent.avatar}`} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-surface"
                      style={{ backgroundColor: '#1E3A8A' }}>
                      {app.agent?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-primary">{app.agent?.name}</p>
                      {app.agent?.is_verified && <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />}
                    </div>
                    {app.agent?.agent_profile && (
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-0.5">
                        {app.agent.agent_profile.avg_overall_rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {Number(app.agent.agent_profile.avg_overall_rating).toFixed(1)}
                          </span>
                        )}
                        {app.agent.agent_profile.completed_jobs_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {app.agent.agent_profile.completed_jobs_count} jobs
                          </span>
                        )}
                        {app.agent.agent_profile.experience_years && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {app.agent.agent_profile.experience_years}y exp
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  app.status === 'withdrawn' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {app.status}
                </span>
              </div>

              {app.agent?.agent_profile?.bio && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{app.agent.agent_profile.bio}</p>
              )}

              {app.cover_letter && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{app.cover_letter}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  {app.proposed_budget && (
                    <span className="font-medium" style={{ color: '#FF6B00' }}>${app.proposed_budget}</span>
                  )}
                  <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                </div>
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => rejectMutation.mutate(app.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      Reject
                    </button>
                    <button onClick={() => acceptMutation.mutate(app.id)} disabled={acceptMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium text-surface rounded-lg transition-colors"
                      style={{ backgroundColor: '#22C55E' }}>
                      Pick This Agent
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
