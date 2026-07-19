import { Link } from 'react-router-dom';
import { Star, MapPin, Briefcase, Award } from 'lucide-react';

interface InternalResultCardProps {
  result: {
    type: 'agent' | 'service';
    id: string;
    name?: string;
    title?: string;
    description?: string;
    avatar?: string;
    rating?: number;
    reviews_count?: number;
    skills?: string[];
    bio?: string;
    experience_years?: number;
    completed_jobs_count?: number;
    distance_km?: number;
    is_verified?: boolean;
    profile_url?: string;
    service_url?: string;
    price_type?: string;
    starting_price?: number;
    category?: string;
    agent_name?: string;
    agent_avatar?: string;
    location?: string;
    photos?: string[];
  };
}

export default function InternalResultCard({ result }: InternalResultCardProps) {
  const isAgent = result.type === 'agent';

  return (
    <Link
      to={isAgent ? (result.profile_url ?? '#') : (result.service_url ?? '#')}
      className="block bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
               style={{ backgroundColor: isAgent ? '#FF6B00' : '#7C3AED' }}>
            {isAgent
              ? (result.avatar
                  ? <img src={result.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  : (result.name?.[0] ?? 'A'))
              : (result.agent_avatar
                  ? <img src={result.agent_avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  : (result.agent_name?.[0] ?? 'S'))
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: isAgent ? '#FFF3E0' : '#EDE9FE', color: isAgent ? '#E65100' : '#5B21B6' }}>
                {isAgent ? 'Agent' : 'Service'}
              </span>
              {result.is_verified && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                  Verified
                </span>
              )}
            </div>
            <h3 className="font-semibold text-text-primary mt-1 truncate">
              {isAgent ? result.name : result.title}
            </h3>
            {isAgent && result.bio && (
              <p className="text-sm text-text-secondary line-clamp-1 mt-0.5">{result.bio}</p>
            )}
            {!isAgent && result.description && (
              <p className="text-sm text-text-secondary line-clamp-1 mt-0.5">{result.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {result.rating != null && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-text-primary">{result.rating}</span>
                  {result.reviews_count != null && (
                    <span className="text-xs text-text-secondary">({result.reviews_count})</span>
                  )}
                </div>
              )}
              {result.distance_km != null && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <MapPin className="w-3 h-3" />
                  {result.distance_km} km
                </div>
              )}
              {isAgent && result.experience_years != null && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Award className="w-3 h-3" />
                  {result.experience_years}yr
                </div>
              )}
              {isAgent && result.completed_jobs_count != null && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Briefcase className="w-3 h-3" />
                  {result.completed_jobs_count} jobs
                </div>
              )}
              {!isAgent && result.starting_price != null && (
                <span className="text-sm font-bold" style={{ color: '#FF6B00' }}>
                  ${result.starting_price}
                </span>
              )}
              {!isAgent && result.agent_name && (
                <span className="text-xs text-text-secondary">by {result.agent_name}</span>
              )}
            </div>
          </div>
        </div>
        {isAgent && result.skills && result.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {result.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                {skill}
              </span>
            ))}
            {result.skills.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                +{result.skills.length - 4}
              </span>
            )}
          </div>
        )}
        {!isAgent && result.category && (
          <div className="mt-3">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
              {result.category}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
