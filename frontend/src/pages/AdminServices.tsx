import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pause, Play, Ban } from 'lucide-react';
import api from '../services/api';

interface ServiceItem {
  id: string; title: string; status: string; price_type: string;
  starting_price?: number; location: string; created_at: string;
  agent?: { name: string; email: string };
  category?: { name: string };
}

export default function AdminServices() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services', search, statusFilter, page],
    queryFn: () => api.get('/admin/services', { params: { search, status: statusFilter, page, per_page: 15 } }).then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.post(`/admin/services/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    paused: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Service Moderation</h2>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2" />
        </div>
        {['', 'active', 'paused', 'inactive'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === s ? 'text-surface' : 'text-text-secondary bg-gray-100'
            }`}
            style={statusFilter === s ? { backgroundColor: '#1E3A8A' } : {}}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-text-secondary">Loading...</p> : (
        <>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left p-4 font-medium text-text-secondary">Service</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden md:table-cell">Provider</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden md:table-cell">Category</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                  <th className="text-right p-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((s: ServiceItem) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-text-primary">{s.title}</p>
                      <p className="text-xs text-text-secondary">{s.location}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-text-primary">{s.agent?.name}</p>
                      <p className="text-xs text-text-secondary">{s.agent?.email}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-text-secondary text-xs">{s.category?.name || '—'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || 'bg-gray-100 text-gray-600'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === 'active' && (
                          <button onClick={() => statusMutation.mutate({ id: s.id, status: 'paused' })}
                            className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors" title="Pause">
                            <Pause className="w-4 h-4 text-yellow-600" />
                          </button>
                        )}
                        {s.status === 'paused' && (
                          <button onClick={() => statusMutation.mutate({ id: s.id, status: 'active' })}
                            className="p-1.5 rounded-lg hover:bg-green-50 transition-colors" title="Activate">
                            <Play className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        {s.status !== 'inactive' && (
                          <button onClick={() => statusMutation.mutate({ id: s.id, status: 'inactive' })}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Deactivate">
                            <Ban className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.meta && data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    page === p ? 'text-surface' : 'text-text-secondary bg-gray-100'
                  }`}
                  style={page === p ? { backgroundColor: '#FF6B00' } : {}}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
