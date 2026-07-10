import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Briefcase, UserCheck, PlusCircle, Mail, Phone, MessageSquare,
  Star, StarHalf, Clock, TrendingUp, Users, ShieldCheck,
  Activity, BookOpen, Image, CheckCircle, XCircle, AlertTriangle,
  Bell, Calendar, MapPin, Settings
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

function StatCard({ icon: Icon, label, value, color, href }: {
  icon: React.ElementType; label: string; value: string | number;
  color: string; href?: string;
}) {
  const inner = (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow h-full">
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6" style={{ color }} />
        <span className="text-2xl font-bold text-text-primary">{value}</span>
      </div>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  );
  if (href) return <Link to={href} className="block h-full">{inner}</Link>;
  return inner;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800', published: 'bg-orange-100 text-orange-800',
    accepted: 'bg-blue-100 text-blue-800', client_confirmed: 'bg-purple-100 text-purple-800',
    travelling: 'bg-indigo-100 text-indigo-800', waiting: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800', completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800', expired: 'bg-gray-100 text-gray-600',
    reviewed: 'bg-teal-100 text-teal-800',
    pending: 'bg-yellow-100 text-yellow-800', active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600', paused: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function OverviewCard({ title, items }: { title: string; items: { label: string; count: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
      <h3 className="font-semibold text-text-primary mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary capitalize">{item.label.replace(/_/g, ' ')}</span>
              <span className="font-medium text-text-primary">{item.count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: total > 0 ? `${(item.count / total) * 100}%` : '0%', backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [verificationSent, setVerificationSent] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data.data),
  });

  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => api.get('/requests').then((r) => r.data),
    enabled: user?.role === 'client',
  });

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <p className="text-sm text-text-secondary">Welcome back, {user.name}</p>
      </div>

      {!user.email_verified_at && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <Mail className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#D97706' }} />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Verify your email</p>
            <p className="text-sm text-amber-700 mt-0.5">Please check your inbox and click the verification link.</p>
            {!verificationSent ? (
              <button onClick={async () => {
                await api.post('/email/verification-notification');
                setVerificationSent(true);
              }} className="text-sm font-medium mt-2 hover:underline" style={{ color: '#D97706' }}>
                Resend verification email
              </button>
            ) : (
              <p className="text-sm text-amber-600 mt-2">Verification email sent! Check your inbox.</p>
            )}
          </div>
        </div>
      )}

      {!user.phone_verified_at && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <Phone className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#1E3A8A' }} />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">Verify your phone</p>
            <p className="text-sm text-blue-700 mt-0.5">Add your phone number and verify it to increase trust.</p>
            <Link to="/my-profile" className="text-sm font-medium mt-2 inline-block hover:underline" style={{ color: '#1E3A8A' }}>
              Add phone number →
            </Link>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface p-8 rounded-2xl shadow-sm border border-border animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {stats?.role === 'client' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Briefcase} label="Total Requests" value={stats.requests_total} color="#1E3A8A" href="/requests" />
                <StatCard icon={Calendar} label="Bookings" value={stats.bookings_total} color="#FF6B00" href="/bookings" />
                <StatCard icon={MessageSquare} label="Unread Messages" value={stats.messages_unread} color="#22C55E" href={`/requests/${requests?.data?.[0]?.id || ''}`} />
                <StatCard icon={Star} label="Reviews Received" value={stats.reviews_received} color="#D97706" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <OverviewCard
                  title="Requests by Status"
                  items={Object.entries(stats.requests_by_status || {}).map(([status, count]) => ({
                    label: status, count: count as number,
                    color: status === 'completed' ? '#22C55E' : status === 'cancelled' ? '#EF4444' : status === 'in_progress' ? '#8B5CF6' : '#FF6B00',
                  }))}
                />
                <OverviewCard
                  title="Bookings by Status"
                  items={Object.entries(stats.bookings_by_status || {}).map(([status, count]) => ({
                    label: status, count: count as number,
                    color: status === 'completed' ? '#22C55E' : status === 'accepted' ? '#3B82F6' : status === 'pending' ? '#F59E0B' : '#EF4444',
                  }))}
                />
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-semibold text-text-primary mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to="/requests/create" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <PlusCircle className="w-5 h-5" style={{ color: '#FF6B00' }} />
                      <span className="text-sm font-medium text-text-primary">Post a new request</span>
                    </Link>
                    <Link to="/agents" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <UserCheck className="w-5 h-5" style={{ color: '#1E3A8A' }} />
                      <span className="text-sm font-medium text-text-primary">Find providers</span>
                    </Link>
                    <Link to="/bookings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Calendar className="w-5 h-5" style={{ color: '#22C55E' }} />
                      <span className="text-sm font-medium text-text-primary">My bookings</span>
                    </Link>
                    <Link to="/notifications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Bell className="w-5 h-5" style={{ color: '#D97706' }} />
                      <span className="text-sm font-medium text-text-primary">Notifications ({stats.notifications.unread_count})</span>
                    </Link>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Requests</h3>
              <div className="space-y-3">
                {stats.recent_requests?.map((req: any) => (
                  <Link key={req.id} to={`/requests/${req.id}`}
                    className="block bg-surface p-5 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-text-primary">{req.title}</h4>
                        {req.agent && <p className="text-xs text-text-secondary mt-0.5">Agent: {req.agent.name}</p>}
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  </Link>
                ))}
                {(!stats.recent_requests || stats.recent_requests.length === 0) && (
                  <p className="text-text-secondary text-center py-8">No requests yet. <Link to="/requests/create" className="hover:underline" style={{ color: '#FF6B00' }}>Create one</Link></p>
                )}
              </div>
            </>
          )}

          {stats?.role === 'agent' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Briefcase} label="Total Requests" value={stats.requests_total} color="#1E3A8A" />
                <StatCard icon={Calendar} label="Bookings" value={stats.bookings_total} color="#FF6B00" href="/bookings" />
                <StatCard icon={BookOpen} label="Active Services" value={`${stats.services_active}/${stats.services_total}`} color="#22C55E" href="/services" />
                <StatCard icon={MessageSquare} label="Unread Messages" value={stats.messages_unread} color="#D97706" href="/requests/browse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <OverviewCard
                  title="Requests by Status"
                  items={Object.entries(stats.requests_by_status || {}).map(([status, count]) => ({
                    label: status, count: count as number,
                    color: status === 'completed' ? '#22C55E' : status === 'accepted' ? '#3B82F6' : status === 'published' ? '#F59E0B' : '#EF4444',
                  }))}
                />
                <OverviewCard
                  title="Bookings by Status"
                  items={Object.entries(stats.bookings_by_status || {}).map(([status, count]) => ({
                    label: status, count: count as number,
                    color: status === 'completed' ? '#22C55E' : status === 'accepted' ? '#3B82F6' : status === 'pending' ? '#F59E0B' : '#EF4444',
                  }))}
                />
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-semibold text-text-primary mb-4">Profile</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Profile Completion</span>
                        <span className="font-medium" style={{ color: stats.profile_completion >= 80 ? '#22C55E' : stats.profile_completion >= 50 ? '#F59E0B' : '#EF4444' }}>
                          {stats.profile_completion}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${stats.profile_completion}%`, backgroundColor: stats.profile_completion >= 80 ? '#22C55E' : stats.profile_completion >= 50 ? '#F59E0B' : '#EF4444' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      <span className="text-text-primary font-medium">{Number(stats.avg_rating).toFixed(1)}</span>
                      <span className="text-text-secondary">({stats.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Image className="w-4 h-4" style={{ color: '#1E3A8A' }} />
                      <span className="text-text-primary">{stats.portfolio_items} portfolio items</span>
                    </div>
                    <Link to="/my-profile" className="block text-sm font-medium hover:underline" style={{ color: '#FF6B00' }}>
                      Manage profile →
                    </Link>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Requests</h3>
              <div className="space-y-3">
                {stats.recent_requests?.map((req: any) => (
                  <Link key={req.id} to={`/requests/${req.id}`}
                    className="block bg-surface p-5 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-text-primary">{req.title}</h4>
                        {req.client && <p className="text-xs text-text-secondary mt-0.5">Client: {req.client.name}</p>}
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  </Link>
                ))}
                {(!stats.recent_requests || stats.recent_requests.length === 0) && (
                  <p className="text-text-secondary text-center py-8">No requests assigned yet. <Link to="/requests/browse" className="hover:underline" style={{ color: '#FF6B00' }}>Browse available</Link></p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Link to="/requests/browse" className="bg-surface p-4 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow text-center">
                  <Briefcase className="w-6 h-6 mx-auto mb-1" style={{ color: '#FF6B00' }} />
                  <p className="text-xs font-medium text-text-primary">Browse Jobs</p>
                </Link>
                <Link to="/services" className="bg-surface p-4 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow text-center">
                  <Settings className="w-6 h-6 mx-auto mb-1" style={{ color: '#1E3A8A' }} />
                  <p className="text-xs font-medium text-text-primary">My Services</p>
                </Link>
                <Link to="/bookings" className="bg-surface p-4 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-1" style={{ color: '#22C55E' }} />
                  <p className="text-xs font-medium text-text-primary">Bookings</p>
                </Link>
                <Link to="/portfolio" className="bg-surface p-4 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow text-center">
                  <Image className="w-6 h-6 mx-auto mb-1" style={{ color: '#D97706' }} />
                  <p className="text-xs font-medium text-text-primary">Portfolio</p>
                </Link>
              </div>
            </>
          )}

          {stats?.role === 'super-admin' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Users} label="Total Users" value={stats.total_users} color="#1E3A8A" />
                <StatCard icon={UserCheck} label="Providers" value={stats.total_agents} color="#22C55E" />
                <StatCard icon={Briefcase} label="Requests" value={stats.total_requests} color="#FF6B00" />
                <StatCard icon={ShieldCheck} label="Pending Verifications" value={stats.pending_verifications} color="#D97706" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <OverviewCard
                  title="Requests by Status"
                  items={Object.entries(stats.requests_by_status || {}).map(([status, count]) => ({
                    label: status, count: count as number,
                    color: status === 'completed' ? '#22C55E' : status === 'cancelled' ? '#EF4444' : status === 'in_progress' ? '#8B5CF6' : '#FF6B00',
                  }))}
                />
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
                  <h3 className="font-semibold text-text-primary mb-4">Platform Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-text-primary">{stats.total_clients}</p>
                      <p className="text-xs text-text-secondary">Clients</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-text-primary">{stats.total_agents}</p>
                      <p className="text-xs text-text-secondary">Providers</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-text-primary">{stats.total_bookings}</p>
                      <p className="text-xs text-text-secondary">Bookings</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-text-primary">{stats.total_services}</p>
                      <p className="text-xs text-text-secondary">Services</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl col-span-2">
                      <p className="text-2xl font-bold text-text-primary">{stats.total_reviews}</p>
                      <p className="text-xs text-text-secondary">Reviews</p>
                    </div>
                  </div>
                </div>
              </div>

              {stats.recent_verifications?.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Pending Verifications</h3>
                  <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-gray-50">
                          <th className="text-left p-4 font-medium text-text-secondary">User</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Type</th>
                          <th className="text-left p-4 font-medium text-text-secondary">Submitted</th>
                          <th className="text-right p-4 font-medium text-text-secondary">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent_verifications.map((v: any) => (
                          <tr key={v.id} className="border-b border-border last:border-0">
                            <td className="p-4 text-text-primary">{v.user?.name || 'Unknown'}</td>
                            <td className="p-4 capitalize text-text-secondary">{v.type?.replace(/_/g, ' ')}</td>
                            <td className="p-4 text-text-secondary">{new Date(v.created_at).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <Link to="/admin/verifications" className="text-sm font-medium hover:underline" style={{ color: '#1E3A8A' }}>
                                Review →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
