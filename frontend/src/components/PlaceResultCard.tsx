import { Star, MapPin, Clock, Phone, Globe, Navigation, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface PlaceResultCardProps {
  place: {
    place_id: string;
    name: string;
    rating: number | null;
    reviews_count: number;
    address: string | null;
    phone: string | null;
    website: string | null;
    google_url: string | null;
    opening_hours: { open_now: boolean | null; weekday_text: string[] } | null;
    price_level: number | null;
    price_level_text: string | null;
    photo_url: string | null;
    distance_km: number | null;
    directions_url: string | null;
    types: string[];
  };
}

export default function PlaceResultCard({ place }: PlaceResultCardProps) {
  const [imgError, setImgError] = useState(false);

  const openNow = place.opening_hours?.open_now;
  const hoursText = openNow === true ? 'Open now' : openNow === false ? 'Closed' : '';

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
      {place.photo_url && !imgError && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={place.photo_url}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">{place.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              {place.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-text-primary">{place.rating}</span>
                  <span className="text-xs text-text-secondary">({place.reviews_count})</span>
                </div>
              )}
              {place.price_level_text && (
                <span className="text-xs text-text-secondary">{place.price_level_text}</span>
              )}
            </div>
          </div>
          {place.distance_km != null && (
            <span className="text-xs text-text-secondary whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
              {place.distance_km} km
            </span>
          )}
        </div>

        {place.address && (
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{place.address}</span>
          </div>
        )}

        {hoursText && (
          <div className="flex items-center gap-2 text-sm mb-1">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: openNow ? '#16a34a' : '#dc2626' }} />
            <span style={{ color: openNow ? '#16a34a' : '#dc2626' }}>{hoursText}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {place.directions_url && (
            <a
              href={place.directions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#1A73E8' }}
            >
              <Navigation className="w-3 h-3" />
              Directions
            </a>
          )}
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-text-primary hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-3 h-3" />
              Call
            </a>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-text-primary hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-3 h-3" />
              Website
            </a>
          )}
          {place.google_url && (
            <a
              href={place.google_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="w-3 h-3" />
              Google
            </a>
          )}
        </div>

        {place.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0 && (
          <details className="mt-3">
            <summary className="text-xs text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
              View hours
            </summary>
            <div className="mt-2 space-y-0.5">
              {place.opening_hours.weekday_text.map((line) => (
                <div key={line} className="text-xs text-text-secondary">{line}</div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
