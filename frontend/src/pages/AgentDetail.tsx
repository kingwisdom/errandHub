import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Car, Globe, Award, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

export default function AgentDetail() {
  const { id } = useParams();
  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => api.get(`/agents/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['agent-portfolio', id],
    queryFn: () => api.get(`/agents/${id}/portfolio`).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-text-secondary">Loading...</p>;
  if (!agent) return <p className="text-text-secondary">Agent not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <div className="flex items-center gap-6 mb-6">
          {agent.user?.avatar ? (
            <img src={imgUrl(agent.user.avatar)} className="w-20 h-20 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-surface shrink-0"
              style={{ backgroundColor: '#FF6B00' }}>
              {agent.user?.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-text-primary">{agent.user?.name}</h2>
              {agent.user?.is_verified && <CheckCircle className="w-5 h-5" style={{ color: '#22C55E' }} />}
            </div>
            <p className="text-text-secondary">
              {agent.experience_years ? `${agent.experience_years} years experience` : 'New agent'} · {agent.completed_jobs_count} jobs completed
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2.5 h-2.5 rounded-full ${agent.is_online ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm text-text-secondary">{agent.is_online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {agent.bio && (
          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-2">About</h3>
            <p className="text-text-secondary leading-relaxed">{agent.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          {agent.coverage_area && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-text-primary">Coverage Area</h3>
                <p className="text-text-secondary text-sm">{agent.coverage_area}</p>
              </div>
            </div>
          )}
          {agent.vehicle && (
            <div className="flex items-start gap-2">
              <Car className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-text-primary">Vehicle</h3>
                <p className="text-text-secondary text-sm">{agent.vehicle}</p>
              </div>
            </div>
          )}
          {agent.avg_response_time && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-text-primary">Avg Response</h3>
                <p className="text-text-secondary text-sm">{agent.avg_response_time} min</p>
              </div>
            </div>
          )}
          {agent.avg_completion_time && (
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-text-primary">Avg Completion</h3>
                <p className="text-text-secondary text-sm">{agent.avg_completion_time} min</p>
              </div>
            </div>
          )}
        </div>

        {agent.skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-3">Skills & Categories</h3>
            <div className="flex flex-wrap gap-2">
              {agent.skills.map((skill: number, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface"
                  style={{ backgroundColor: '#1E3A8A' }}>
                  Skill #{skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {agent.languages?.length > 0 && (
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              <Globe className="w-4 h-4 inline mr-1" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.languages.map((lang: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-text-secondary">{lang}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="h-2.5 rounded-full transition-all" style={{ width: `${agent.profile_completion_score}%`, backgroundColor: '#22C55E' }} />
          </div>
          <p className="text-xs text-text-secondary mt-1">Profile completion: {agent.profile_completion_score}%</p>
        </div>
      </div>

      {portfolio?.length > 0 && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <h3 className="font-semibold text-text-primary mb-4">Portfolio</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {portfolio.map((item: { id: number; title: string; description?: string; images: string[] }) => (
              <div key={item.id} className="rounded-xl overflow-hidden border border-border group">
                <div className="aspect-square overflow-hidden">
                  {item.images[0] && (
                    <img src={imgUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-text-primary">{item.title}</p>
                  {item.description && <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
