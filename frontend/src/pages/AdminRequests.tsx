import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Briefcase } from 'lucide-react';
import api from '../services/api';

interface RequestItem {
  id: string; title: string; status: string; priority: string;
  location?: string; created_at: string;
  client?: { name: string };
  agent?: { name: string };
  category?: { name: string };
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600', published: 'bg-orange-100 text-orange-700',
  accepted: 'bg-blue-100 text-blue-700', client_confirmed: 'bg-purple-100 text-purple-700',
  travelling: 'bg-indigo-100 text-indigo-700', waiting: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-violet-100 text-violet-700', completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', expired: 'bg-gray-100 text-gray-500',
  reviewed: 'bg-teal-100 text-teal-700',
};

export default function AdminRequests() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', search, statusFilter, page],
    queryFn: () => api.get('/admin/requests', { params: { search, status: statusFilter, page, per_page: 15 } }).then((r) => r.data),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Request Overview</h2>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2" />
        </div>
        {['', 'published', 'in_progress', 'completed', 'cancelled'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === s ? 'text-surface' : 'text-text-secondary bg-gray-100'
            }`}
            style={statusFilter === s ? { backgroundColor: '#1E3A8A' } : {}}>
            {s === '' ? 'All' : s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-text-secondary">Loading...</p> : (
        <>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left p-4 font-medium text-text-secondary">Request</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden md:table-cell">Client</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden md:table-cell">Agent</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden lg:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((r: RequestItem) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-text-primary">{r.title}</p>
                      <p className="text-xs text-text-secondary">{r.category?.name || '—'} · {r.location || 'No location'}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-text-secondary">{r.client?.name || '—'}</td>
                    <td className="p-4 hidden md:table-cell text-text-secondary">{r.agent?.name || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-text-secondary text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
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
