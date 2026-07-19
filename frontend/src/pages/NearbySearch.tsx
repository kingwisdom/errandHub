import { useState, useCallback, useEffect } from 'react';
import { Search, MapPin, Locate, SlidersHorizontal, X, Layers, List } from 'lucide-react';
import api from '../services/api';
import GoogleMap, { type MapMarker } from '../components/GoogleMap';
import PlaceResultCard from '../components/PlaceResultCard';
import InternalResultCard from '../components/InternalResultCard';

interface ParsedQuery {
  search_term: string;
  original_query: string;
  matched_category: string | null;
  google_type: string | null;
  open_now: boolean;
  min_rating: number | null;
  location_bias: string | null;
}

interface ExternalPlace {
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
  location: { lat: number; lng: number } | null;
  distance_km: number | null;
  types: string[];
  directions_url: string | null;
}

interface InternalResult {
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
}

interface SearchResult {
  parsed_query: ParsedQuery;
  internal_results: InternalResult[];
  external_results: ExternalPlace[];
  external_error: string | null;
  meta: { total_internal: number; total_external: number; search_radius_km: number };
}

const SUGGESTION_CHIPS = [
  'Electrician near me',
  'Plumber open now',
  'Restaurant nearby',
  'Pharmacy near me',
  'Mechanic close by',
  'Hospital nearby',
  'Hotel near me',
  'Bank nearby',
  'Dentist open now',
  'School nearby',
];

export default function NearbySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<'all' | 'internal' | 'external'>('all');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null);
        },
        () => {
          setLocationError('Location access denied. Please enable location services.');
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    if (!userLocation) {
      setLocationError('Location is required. Please enable location access.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/search/nearby', {
        query: q,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius,
      });
      setResults(data.data);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, userLocation, radius]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const mapMarkers: MapMarker[] = [];
  if (results) {
    results.external_results.forEach((place) => {
      if (place.location) {
        mapMarkers.push({
          id: place.place_id,
          lat: place.location.lat,
          lng: place.location.lng,
          title: place.name,
          type: 'external',
          info: {
            rating: place.rating ?? undefined,
            address: place.address ?? undefined,
            photo_url: place.photo_url ?? undefined,
            distance_km: place.distance_km ?? undefined,
          },
        });
      }
    });
  }

  const filteredResults = results
    ? {
        internal: activeResultTab === 'external' ? [] : results.internal_results,
        external: activeResultTab === 'internal' ? [] : results.external_results,
      }
    : { internal: [], external: [] };

  const hasResults = filteredResults.internal.length > 0 || filteredResults.external.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Nearby Search</h2>
          <p className="text-sm text-text-secondary mt-1">
            Find artisans, businesses & public places around you
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. &quot;Electrician near me open now&quot; or &quot;Restaurant nearby&quot;"
            className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSearch()}
            disabled={loading || !userLocation}
            className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FF6B00' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-gray-50 transition-colors text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Search Radius</label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value={1000}>1 km</option>
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={20000}>20 km</option>
                <option value={50000}>50 km</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as typeof viewMode)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white"
              >
                <option value="split">Split (Map + List)</option>
                <option value="list">List Only</option>
                <option value="map">Map Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {locationError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Locate className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-700">{locationError}</p>
            <button
              onClick={() => {
                navigator.geolocation?.getCurrentPosition(
                  (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationError(null);
                  },
                  () => setLocationError('Location access denied.'),
                  { timeout: 10000 }
                );
              }}
              className="text-xs font-medium mt-1 underline text-amber-600 hover:text-amber-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: '#FF6B00' }} />
            <h3 className="text-lg font-semibold text-text-primary mb-2">What are you looking for?</h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
              Search for electricians, restaurants, hospitals, pharmacies, schools, mechanics, hotels,
              banks, parks, tourist attractions, and more — all near you.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setQuery(chip); handleSearch(chip); }}
                  className="text-xs px-4 py-2 rounded-full border border-border text-text-secondary hover:border-orange-300 hover:text-orange-600 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {results && !loading && (
        <>
          {results.external_error && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-amber-600 text-sm flex-1">
                <span className="font-medium">External places unavailable: </span>
                {results.external_error}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(['all', 'internal', 'external'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveResultTab(tab)}
                  className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors ${
                    activeResultTab === tab
                      ? 'bg-white shadow-sm text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'internal' ? 'On ErrandHub' : 'External'}
                  <span className="ml-1 text-text-secondary">
                    {tab === 'all'
                      ? results.meta.total_internal + results.meta.total_external
                      : tab === 'internal'
                        ? results.meta.total_internal
                        : results.meta.total_external}
                  </span>
                </button>
              ))}
            </div>
            {results.parsed_query.matched_category && (
              <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-medium">
                {results.parsed_query.matched_category}
              </span>
            )}
            {results.parsed_query.open_now && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-600 font-medium">
                Open Now
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <div className="hidden sm:flex gap-1">
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'split' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                >
                  <Layers className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'split' && userLocation && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="order-2 lg:order-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {!hasResults && <p className="text-text-secondary text-sm text-center py-8">No results found.</p>}
                {filteredResults.internal.map((r) => (
                  <InternalResultCard key={`internal-${r.id}`} result={r} />
                ))}
                {filteredResults.external.map((p) => (
                  <PlaceResultCard key={`external-${p.place_id}`} place={p} />
                ))}
              </div>
              <div className="order-1 lg:order-2">
                <GoogleMap
                  center={userLocation}
                  markers={mapMarkers}
                  className="w-full h-[400px] lg:h-[600px]"
                />
              </div>
            </div>
          )}

          {(viewMode === 'list' || !userLocation) && (
            <div className="space-y-4">
              {!hasResults && <p className="text-text-secondary text-sm text-center py-8">No results found.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.internal.map((r) => (
                  <InternalResultCard key={`internal-${r.id}`} result={r} />
                ))}
              </div>
              {filteredResults.external.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.external.map((p) => (
                    <PlaceResultCard key={`external-${p.place_id}`} place={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === 'map' && userLocation && (
            <GoogleMap
              center={userLocation}
              markers={mapMarkers}
              className="w-full h-[600px]"
            />
          )}

          {results.meta.search_radius_km && (
            <p className="text-xs text-text-secondary text-center">
              Searching within {results.meta.search_radius_km} km of your location
            </p>
          )}
        </>
      )}
    </div>
  );
}
