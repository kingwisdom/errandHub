import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, DollarSign, Award, Tag, CalendarPlus } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => api.get(`/services/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-text-secondary">Loading...</p>;
  if (!service) return <p className="text-text-secondary">Service not found</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        {service.photos?.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {service.photos.slice(0, 4).map((photo: string, i: number) => (
              <div key={i} className={`${i === 0 ? 'col-span-2' : ''} aspect-video overflow-hidden bg-gray-100`}>
                <img src={imgUrl(photo)} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-2 mb-1">
            {service.category && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                {service.category.name}
              </span>
            )}
            <span className="text-xs text-text-secondary capitalize">{service.price_type}</span>
            {service.status === 'active' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-4">{service.title}</h2>

          <div className="flex flex-wrap gap-6 mb-6">
            {service.starting_price && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" style={{ color: '#FF6B00' }} />
                <span className="text-xl font-bold" style={{ color: '#FF6B00' }}>${service.starting_price}</span>
                {service.is_negotiable && <span className="text-sm text-text-secondary">negotiable</span>}
              </div>
            )}
            {service.estimated_duration && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="w-4 h-4" />
                <span className="text-sm">~{service.estimated_duration} min</span>
              </div>
            )}
            {service.location && (
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{service.location}{service.coverage_radius ? ` (${service.coverage_radius}km)` : ''}</span>
              </div>
            )}
            {service.experience_years && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Award className="w-4 h-4" />
                <span className="text-sm">{service.experience_years} years experience</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-2">Description</h3>
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          {service.tags?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-1">
                <Tag className="w-4 h-4" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-text-secondary">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {service.agent && (
            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold text-text-primary mb-3">Service Provider</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-surface"
                  style={{ backgroundColor: '#1E3A8A' }}>
                  {service.agent.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{service.agent.name}</p>
                  <a href={`/agents/${service.agent.id}`} className="text-xs" style={{ color: '#FF6B00' }}>
                    View Profile
                  </a>
                </div>
              </div>
            </div>
          )}

          {user && user.role === 'client' && service.status === 'active' && (
            <button onClick={() => navigate(`/services/${service.id}/book`)}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-medium text-surface px-6 py-3 rounded-xl transition-colors"
              style={{ backgroundColor: '#FF6B00' }}>
              <CalendarPlus className="w-4 h-4" /> Book This Service
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
