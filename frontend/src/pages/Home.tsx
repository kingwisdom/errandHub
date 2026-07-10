import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { Shield, Zap, Users, Star, MapPin } from 'lucide-react';
import api from '../services/api';

export default function Home() {
  const { user } = useAuthStore();

  const { data: services } = useQuery({
    queryKey: ['services', 'featured'],
    queryFn: () => api.get('/services/browse', { params: { per_page: 6, sort: 'newest' } }).then((r) => r.data),
  });

  const listings = services?.data ?? [];

  return (
    <div>
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-text-primary mb-6 leading-tight">
          Get Things Done. <span style={{ color: '#FF6B00' }}>Locally.</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect with trusted local agents who can run errands, make deliveries,
          provide services, and help with whatever you need.
        </p>
        {!user ? (
          <div className="flex justify-center gap-4">
            <Link to="/register"
              className="text-surface font-medium px-8 py-3 rounded-xl transition-colors"
              style={{ backgroundColor: '#FF6B00' }}>
              Get Started
            </Link>
            <Link to="/services"
              className="font-medium px-8 py-3 rounded-xl border-2 transition-colors"
              style={{ color: '#1E3A8A', borderColor: '#1E3A8A' }}>
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            <Link to="/requests"
              className="text-surface font-medium px-8 py-3 rounded-xl transition-colors"
              style={{ backgroundColor: '#FF6B00' }}>
              My Requests
            </Link>
            <Link to="/services"
              className="font-medium px-8 py-3 rounded-xl border-2 transition-colors"
              style={{ color: '#1E3A8A', borderColor: '#1E3A8A' }}>
              Browse Services
            </Link>
          </div>
        )}
      </div>

      {listings.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Featured Services</h2>
            <Link to="/services" className="text-sm font-medium hover:underline" style={{ color: '#FF6B00' }}>
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((s: any) => (
              <Link key={s.id} to={`/services/${s.id}`}
                className="bg-surface rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="h-40 flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                  {s.photos?.[0] ? (
                    <img src={s.photos[0]} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl" style={{ color: '#FF6B00' }}>{s.title[0]}</span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-text-primary">{s.title}</h3>
                    <span className="text-sm font-bold whitespace-nowrap ml-2" style={{ color: '#FF6B00' }}>
                      {s.price_type === 'hourly' ? `$${s.starting_price}/hr` : s.starting_price ? `$${s.starting_price}` : 'Negotiable'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3 flex-1">{s.description}</p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-auto">
                    {s.agent?.avg_overall_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ color: '#F59E0B' }} />
                        {Number(s.agent.avg_overall_rating).toFixed(1)}
                      </span>
                    )}
                    {s.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {s.location}
                      </span>
                    )}
                    <span className="ml-auto capitalize text-xs" style={{ color: '#22C55E' }}>{s.price_type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-16">
        <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-4" style={{ backgroundColor: '#FFF7ED' }}>
            <Zap className="w-6 h-6" style={{ color: '#FF6B00' }} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">For Clients</h3>
          <p className="text-text-secondary text-sm leading-relaxed">Post what you need done, browse trusted agents, and get help fast.</p>
        </div>
        <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-4" style={{ backgroundColor: '#EFF6FF' }}>
            <Users className="w-6 h-6" style={{ color: '#1E3A8A' }} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">For Agents</h3>
          <p className="text-text-secondary text-sm leading-relaxed">Create your profile, find requests, earn money doing local tasks.</p>
        </div>
        <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-4" style={{ backgroundColor: '#F0FDF4' }}>
            <Shield className="w-6 h-6" style={{ color: '#22C55E' }} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Trust & Safety</h3>
          <p className="text-text-secondary text-sm leading-relaxed">Verified profiles, real reviews, and secure communication built-in.</p>
        </div>
      </div>
    </div>
  );
}
