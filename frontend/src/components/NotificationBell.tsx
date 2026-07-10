import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellDot, CheckCheck, ExternalLink } from 'lucide-react';
import api from '../services/api';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    enabled: open,
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const count = unread?.count ?? 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        {count > 0 ? (
          <>
            <BellDot className="w-5 h-5" style={{ color: '#FF6B00' }} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-surface flex items-center justify-center"
              style={{ backgroundColor: '#DC2626' }}>
              {count > 9 ? '9+' : count}
            </span>
          </>
        ) : (
          <Bell className="w-5 h-5 text-text-secondary" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-border z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            {count > 0 && (
              <button onClick={() => markAllReadMutation.mutate()}
                className="text-xs flex items-center gap-1" style={{ color: '#FF6B00' }}>
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications?.data?.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">No notifications</p>
            ) : (
              notifications?.data?.map((n: {
                id: string; data: { message: string; type: string; service_request_id?: string };
                read_at: string | null; created_at: string;
              }) => (
                <div key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read_at ? 'bg-orange-50/30' : ''}`}
                  onClick={() => {
                    if (!n.read_at) markReadMutation.mutate(n.id);
                  }}>
                  <p className="text-sm text-text-primary">{n.data.message}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <Link to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 px-4 py-2.5 border-t border-border text-xs font-medium transition-colors"
            style={{ color: '#FF6B00' }}>
            <ExternalLink className="w-3 h-3" /> View all
          </Link>
        </div>
      )}
    </div>
  );
}
