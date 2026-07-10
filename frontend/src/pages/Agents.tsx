import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search, MapPin, Star, Verified } from 'lucide-react';
import api from '../services/api';

export default function Agents() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [verified, setVerified] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');

  const params: Record<string, string | undefined> = {
    search: search || undefined,
    category_id: categoryId || undefined,
    verified: verified || undefined,
    min_rating: minRating || undefined,
    include_offline: 'true',
    sort,
  };

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents', params],
    queryFn: () => api.get('/agents', { params }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Find Agents</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bio, location, or skills..."
            className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface" />
        </div>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className="border border-border rounded-xl px-4 py-3 text-sm bg-surface min-w-[160px]">
          <option value="">All Categories</option>
          {categories?.map((cat: { id: number; name: string }) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="border border-border rounded-xl px-4 py-3 text-sm bg-surface min-w-[140px]">
          <option value="newest">Newest</option>
          <option value="experience">Experience</option>
          <option value="jobs">Most Jobs</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={verified} onChange={(e) => setVerified(e.target.value)}
          className="border border-border rounded-xl px-4 py-2 text-sm bg-surface">
          <option value="">Any verification</option>
          <option value="true">Verified only</option>
        </select>
        <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
          className="border border-border rounded-xl px-4 py-2 text-sm bg-surface">
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
          <option value="2">2+ stars</option>
        </select>
      </div>
      {isLoading ? (
        <p className="text-text-secondary">Loading agents...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents?.data?.map((agent: {
            id: string; bio: string; coverage_area: string; completed_jobs_count: number;
            profile_completion_score: number; experience_years: number | null;
            avg_overall_rating: number; total_reviews_count: number;
            user: { name: string; avatar: string | null; is_verified: boolean };
          }) => (
            <Link key={agent.id} to={`/agents/${agent.id}`}
              className="bg-surface rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-surface relative"
                  style={{ backgroundColor: '#FF6B00' }}>
                  {agent.user.name.charAt(0)}
                  {agent.user.is_verified && (
                    <span className="absolute -top-1 -right-1"><Verified className="w-5 h-5 text-blue-500" /></span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-text-primary">{agent.user.name}</h3>
                    {agent.user.is_verified && <Verified className="w-4 h-4 text-blue-500" />}
                  </div>
                  <p className="text-sm text-text-secondary">{agent.completed_jobs_count} jobs completed</p>
                  {agent.avg_overall_rating > 0 && (
                    <p className="text-xs flex items-center gap-1" style={{ color: '#F59E0B' }}>
                      <Star className="w-3 h-3 fill-current" /> {agent.avg_overall_rating.toFixed(1)}
                      <span className="text-text-secondary">({agent.total_reviews_count})</span>
                    </p>
                  )}
                </div>
              </div>
              {agent.bio && <p className="text-sm text-text-secondary mb-3 line-clamp-2">{agent.bio}</p>}
              {agent.experience_years && (
                <p className="text-xs text-text-secondary mb-1">{agent.experience_years} years experience</p>
              )}
              {agent.coverage_area && (
                <p className="text-xs text-text-secondary flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" /> {agent.coverage_area}
                </p>
              )}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${agent.profile_completion_score}%`, backgroundColor: '#22C55E' }} />
              </div>
              <p className="text-xs text-text-secondary mt-1">Profile: {agent.profile_completion_score}%</p>
            </Link>
          ))}
          {agents?.data?.length === 0 && <p className="text-text-secondary col-span-3 text-center py-8">No agents found.</p>}
        </div>
      )}
    </div>
  );
}
