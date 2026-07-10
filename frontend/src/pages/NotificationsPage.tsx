import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCheck, Bell, BellOff, Mail, MailOpen } from 'lucide-react';
import api from '../services/api';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'all' | 'preferences'>('all');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
  });

  const { data: prefs } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => api.get('/notifications/preferences').then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const updatePrefsMutation = useMutation({
    mutationFn: (data: Record<string, boolean>) => api.put('/notifications/preferences', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Notifications</h2>
        <div className="flex gap-2">
          <button onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'all' ? 'text-surface' : 'text-text-secondary bg-gray-100'}`}
            style={tab === 'all' ? { backgroundColor: '#1E3A8A' } : {}}>
            All
          </button>
          <button onClick={() => setTab('preferences')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'preferences' ? 'text-surface' : 'text-text-secondary bg-gray-100'}`}
            style={tab === 'preferences' ? { backgroundColor: '#1E3A8A' } : {}}>
            Preferences
          </button>
        </div>
      </div>

      {tab === 'all' && (
        <>
          <button onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-1 text-sm mb-4 transition-colors"
            style={{ color: '#FF6B00' }}>
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
          {isLoading ? <p className="text-text-secondary">Loading...</p> : (
            <div className="space-y-2">
              {notifications?.data?.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-2xl border border-border">
                  <BellOff className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-text-secondary">No notifications yet.</p>
                </div>
              ) : (
                notifications?.data?.map((n: {
                  id: string; data: { message: string; type: string; service_request_id?: string; booking_id?: string };
                  read_at: string | null; created_at: string;
                }) => (
                  <div key={n.id}
                    className={`bg-surface rounded-2xl border border-border p-4 flex items-start gap-3 transition-colors ${!n.read_at ? 'border-l-4' : ''}`}
                    style={!n.read_at ? { borderLeftColor: '#FF6B00' } : {}}>
                    <div className={`p-2 rounded-full ${n.read_at ? 'bg-gray-100' : ''}`}
                      style={!n.read_at ? { backgroundColor: '#FFF7ED' } : {}}>
                      {n.read_at ? <Bell className="w-4 h-4 text-gray-400" /> : <Bell className="w-4 h-4" style={{ color: '#FF6B00' }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{n.data.message}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!n.read_at && (
                      <button onClick={() => markReadMutation.mutate(n.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <CheckCheck className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {tab === 'preferences' && prefs && (
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          {[
            { key: 'email_notifications', label: 'Email notifications', icon: <Mail className="w-4 h-4" /> },
            { key: 'database_notifications', label: 'In-app notifications', icon: <Bell className="w-4 h-4" /> },
            { key: 'request_updates', label: 'Request updates' },
            { key: 'booking_updates', label: 'Booking updates' },
            { key: 'chat_messages', label: 'Chat messages' },
            { key: 'marketing_emails', label: 'Marketing emails', icon: <MailOpen className="w-4 h-4" /> },
          ].map(({ key, label, icon }) => (
            <label key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-text-primary flex items-center gap-2">
                {icon} {label}
              </span>
              <input type="checkbox" checked={(prefs as any)[key]}
                onChange={(e) => updatePrefsMutation.mutate({ [key]: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-orange-500" />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
