import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function MyRequests() {
  const { user } = useAuthStore();
  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests', user?.role],
    queryFn: () => {
      if (user?.role === 'agent') {
        return api.get('/requests/browse').then((r) => r.data);
      }
      return api.get('/requests').then((r) => r.data);
    },
  });

  const statusStyles: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#F3F4F6', text: '#111827' },
    published: { bg: '#FFF7ED', text: '#FF6B00' },
    accepted: { bg: '#EFF6FF', text: '#1E3A8A' },
    client_confirmed: { bg: '#F5F3FF', text: '#7C3AED' },
    in_progress: { bg: '#F5F3FF', text: '#7C3AED' },
    completed: { bg: '#F0FDF4', text: '#22C55E' },
    reviewed: { bg: '#F0FDF4', text: '#15803D' },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Requests</h2>
        {user?.role === 'client' && (
          <Link to="/requests/create"
            className="flex items-center gap-2 text-surface font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
            style={{ backgroundColor: '#FF6B00' }}>
            <Plus className="w-4 h-4" /> New Request
          </Link>
        )}
      </div>
      {isLoading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : (
        <div className="space-y-3">
          {requests?.data?.map((request: { id: number; title: string; status: string; priority: string; deadline: string; client: { name: string } }) => {
            const s = statusStyles[request.status] || { bg: '#F3F4F6', text: '#111827' };
            return (
              <Link key={request.id} to={`/requests/${request.id}`}
                className="block bg-surface p-5 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-text-primary">{request.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {request.client?.name && `by ${request.client.name} · `}
                      {request.priority} priority
                      {request.deadline && ` · Due: ${new Date(request.deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ backgroundColor: s.bg, color: s.text }}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            );
          })}
          {(!requests?.data || requests.data.length === 0) && (
            <p className="text-text-secondary text-center py-8">No requests found.</p>
          )}
        </div>
      )}
    </div>
  );
}
