import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

interface Verification {
  id: string;
  type: string;
  status: string;
  documents: string[];
  admin_note?: string;
  created_at: string;
  user?: { id: string; name: string; email: string };
  reviewer?: { name: string };
}

const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectFor, setShowRejectFor] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications', statusFilter],
    queryFn: () => api.get('/admin/verification-requests', { params: { status: statusFilter } }).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/verification-requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.post(`/admin/verification-requests/${id}/reject`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setRejectNote('');
      setShowRejectFor(null);
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Verification Management</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === s ? 'text-surface' : 'text-text-secondary bg-gray-100'
            }`}
            style={statusFilter === s ? { backgroundColor: s === 'rejected' ? '#DC2626' : s === 'approved' ? '#22C55E' : '#FF6B00' } : {}}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <p className="text-text-secondary">Loading...</p> : (
        <div className="space-y-4">
          {data?.data?.map((v: Verification) => (
            <div key={v.id} className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-text-primary">{v.user?.name || 'Unknown'}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      v.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      v.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{v.user?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {v.type?.replace(/_/g, ' ')}
                    </span>
                    <span>{new Date(v.created_at).toLocaleDateString()}</span>
                    {v.reviewer && <span>Reviewed by {v.reviewer.name}</span>}
                  </div>
                  {v.admin_note && (
                    <p className="text-sm text-text-secondary mt-2 italic">Note: {v.admin_note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {expandedId === v.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {v.status === 'pending' && (
                    <>
                      <button onClick={() => approveMutation.mutate(v.id)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => setShowRejectFor(showRejectFor === v.id ? null : v.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {expandedId === v.id && v.documents?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-text-primary mb-2">Documents</p>
                  <div className="flex gap-3 flex-wrap">
                    {v.documents.map((doc: string, i: number) => (
                      <a key={i} href={imgUrl(doc)} target="_blank" rel="noopener noreferrer"
                        className="block w-40 h-28 rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow">
                        {doc.endsWith('.pdf') ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <FileText className="w-8 h-8 text-text-secondary" />
                          </div>
                        ) : (
                          <img src={imgUrl(doc)} alt="Document" className="w-full h-full object-cover" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {showRejectFor === v.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Rejection reason (required)</label>
                  <div className="flex gap-2">
                    <input type="text" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Explain why this verification was rejected..."
                      className="flex-1 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                    <button onClick={() => rejectMutation.mutate({ id: v.id, note: rejectNote })}
                      disabled={!rejectNote || rejectMutation.isPending}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {data?.data?.length === 0 && (
            <p className="text-text-secondary text-center py-12">No verification requests found.</p>
          )}
        </div>
      )}
    </div>
  );
}
