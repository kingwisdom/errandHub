import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Shield, ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface UserItem {
  id: string; name: string; email: string; role: string;
  is_verified: boolean; created_at: string;
  agent_profile?: { avg_overall_rating?: number; completed_jobs_count?: number };
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => api.get('/admin/users', { params: { search, role: roleFilter, page, per_page: 15 } }).then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/toggle-status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">User Management</h2>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2" />
        </div>
        {['', 'client', 'agent', 'super-admin'].map((r) => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              roleFilter === r ? 'text-surface' : 'text-text-secondary bg-gray-100'
            }`}
            style={roleFilter === r ? { backgroundColor: '#1E3A8A' } : {}}>
            {r === '' ? 'All' : r === 'super-admin' ? 'Admin' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-text-secondary">Loading...</p> : (
        <>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left p-4 font-medium text-text-secondary">User</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Role</th>
                  <th className="text-left p-4 font-medium text-text-secondary">Verified</th>
                  <th className="text-left p-4 font-medium text-text-secondary hidden md:table-cell">Joined</th>
                  <th className="text-right p-4 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((u: UserItem) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-text-primary">{u.name}</p>
                      <p className="text-xs text-text-secondary">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role === 'super-admin' ? 'Admin' : u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.is_verified ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Shield className="w-3.5 h-3.5" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-text-secondary hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => toggleMutation.mutate(u.id)}
                        disabled={u.role === 'super-admin' || toggleMutation.isPending}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                          u.is_verified
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}>
                        {u.is_verified ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {u.is_verified ? 'Unverify' : 'Verify'}
                      </button>
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
