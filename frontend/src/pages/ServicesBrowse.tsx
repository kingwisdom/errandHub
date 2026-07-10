import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search, MapPin, DollarSign, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';

export default function ServicesBrowse() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceType, setPriceType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const params: Record<string, string | undefined> = {
    search: search || undefined,
    category_id: categoryId || undefined,
    price_type: priceType || undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    sort,
  };

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', params],
    queryFn: () => api.get('/services/browse', { params }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const clearFilters = () => {
    setCategoryId(''); setPriceType(''); setMinPrice(''); setMaxPrice(''); setSort('newest');
  };

  const hasFilters = categoryId || priceType || minPrice || maxPrice || sort !== 'newest';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Browse Services</h2>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-border hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
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
          <option value="price_asc">Price: Low</option>
          <option value="price_desc">Price: High</option>
          <option value="experience">Experience</option>
        </select>
      </div>

      {showFilters && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">More Filters</span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs flex items-center gap-1" style={{ color: '#FF6B00' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Price Type</label>
              <select value={priceType} onChange={(e) => setPriceType(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white">
                <option value="">Any</option>
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Min Price ($)</label>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white" min="0" />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Max Price ($)</label>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white" min="0" />
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-text-secondary">Loading services...</p>
      ) : services?.data?.length === 0 ? (
        <p className="text-text-secondary">No services found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services?.data?.map((service: {
            id: string; title: string; description: string; price_type: string;
            starting_price: number | null; location: string; is_negotiable: boolean;
            estimated_duration: number | null; experience_years: number | null;
            category?: { name: string };
            agent?: { id: string; name: string; avatar: string | null };
            photos?: string[];
          }) => (
            <Link key={service.id} to={`/services/${service.id}`}
              className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                {service.photos?.[0] ? (
                  <img src={`${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${service.photos[0]}`}
                    alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <DollarSign className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {service.category && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                      {service.category.name}
                    </span>
                  )}
                  <span className="text-xs text-text-secondary capitalize">{service.price_type}</span>
                </div>
                <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{service.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {service.starting_price && (
                      <span className="font-bold" style={{ color: '#FF6B00' }}>${service.starting_price}</span>
                    )}
                    {service.is_negotiable && <span className="text-xs text-text-secondary ml-1">negotiable</span>}
                  </div>
                  {service.location && (
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3" />
                      {service.location}
                    </div>
                  )}
                </div>
                {service.estimated_duration && (
                  <p className="text-xs text-text-secondary mt-2">~{service.estimated_duration} min</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
