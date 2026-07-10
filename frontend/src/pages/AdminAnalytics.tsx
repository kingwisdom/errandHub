import { useQuery } from '@tanstack/react-query';
import { Users, Briefcase, Calendar, Star, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../services/api';

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const diff = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
  if (diff === 0) return <span className="text-xs text-text-secondary">—</span>;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
      {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {diff > 0 ? '+' : ''}{diff}%
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border">
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-2xl font-bold text-text-primary">{value}</span>
      </div>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  );
}

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then((r) => r.data.data),
  });

  if (isLoading) return <p className="text-text-secondary">Loading analytics...</p>;
  if (!data) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">Platform Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border">
          <div className="flex items-start justify-between mb-2">
            <Users className="w-5 h-5" style={{ color: '#1E3A8A' }} />
            <TrendBadge current={data.growth.users.current} previous={data.growth.users.previous} />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.summary.total_users}</p>
          <p className="text-sm text-text-secondary">Total Users</p>
        </div>
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border">
          <div className="flex items-start justify-between mb-2">
            <Briefcase className="w-5 h-5" style={{ color: '#FF6B00' }} />
            <TrendBadge current={data.growth.requests.current} previous={data.growth.requests.previous} />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.summary.total_requests}</p>
          <p className="text-sm text-text-secondary">Total Requests</p>
        </div>
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border">
          <div className="flex items-start justify-between mb-2">
            <Calendar className="w-5 h-5" style={{ color: '#22C55E' }} />
            <TrendBadge current={data.growth.bookings.current} previous={data.growth.bookings.previous} />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.summary.total_bookings}</p>
          <p className="text-sm text-text-secondary">Total Bookings</p>
        </div>
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-border">
          <div className="flex items-start justify-between mb-2">
            <ShieldCheck className="w-5 h-5" style={{ color: '#D97706' }} />
          </div>
          <p className="text-2xl font-bold text-text-primary">{data.summary.pending_verifications}</p>
          <p className="text-sm text-text-secondary">Pending Verifications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-semibold text-text-primary mb-4">Requests by Status</h3>
          <div className="space-y-3">
            {Object.entries(data.requests_by_status || {}).map(([status, count]) => {
              const total = Object.values(data.requests_by_status || {}).reduce((s: number, v: any) => s + v, 0) as number;
              const colors: Record<string, string> = {
                completed: '#22C55E', cancelled: '#EF4444', in_progress: '#8B5CF6',
                published: '#FF6B00', accepted: '#3B82F6', draft: '#9CA3AF',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-text-primary">{count as number}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: total > 0 ? `${((count as number) / total) * 100}%` : '0%', backgroundColor: colors[status] || '#FF6B00' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
          <h3 className="font-semibold text-text-primary mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {Object.entries(data.bookings_by_status || {}).map(([status, count]) => {
              const total = Object.values(data.bookings_by_status || {}).reduce((s: number, v: any) => s + v, 0) as number;
              const colors: Record<string, string> = {
                completed: '#22C55E', accepted: '#3B82F6', pending: '#F59E0B',
                cancelled: '#EF4444', declined: '#EF4444',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-text-primary">{count as number}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: total > 0 ? `${((count as number) / total) * 100}%` : '0%', backgroundColor: colors[status] || '#FF6B00' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
        <h3 className="font-semibold text-text-primary mb-4">Top Agents by Completed Jobs</h3>
        {data.top_agents?.length > 0 ? (
          <div className="space-y-3">
            {data.top_agents.map((agent: any, i: number) => (
              <div key={agent.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-sm font-bold text-text-secondary w-6 text-center">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{agent.name}</p>
                  <p className="text-xs text-text-secondary">{agent.completed_count} completed jobs</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} />
                  <span className="text-sm font-medium text-text-primary">{Number(agent.avg_rating).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-6">No agent data yet.</p>
        )}
      </div>
    </div>
  );
}
