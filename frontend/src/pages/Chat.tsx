import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Send, Paperclip, MapPin, Image, FileText, Check, CheckCheck } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

export default function Chat() {
  const { requestId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<{ userId: string; name: string }[]>([]);
  const [fileAttached, setFileAttached] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: request } = useQuery({
    queryKey: ['request', requestId],
    queryFn: () => api.get(`/requests/${requestId}`).then((r) => r.data.data),
    enabled: !!requestId,
  });

  const { data: messages, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['messages', requestId],
    queryFn: ({ pageParam = 1 }) =>
      api.get(`/requests/${requestId}/messages`, { params: { page: pageParam } }).then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next_page_url ? lastPage.current_page + 1 : undefined,
    enabled: !!requestId,
    refetchInterval: false,
  });

  const allMessages = messages?.pages?.flatMap((p: { data: unknown[] }) => p.data) ?? [];

  const sendMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post(`/requests/${requestId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', requestId] });
      setFileAttached(null);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.post(`/requests/${requestId}/messages/read`),
  });

  useEffect(() => {
    if (!requestId) return;
    const wsUrl = `${import.meta.env.VITE_REVERB_SCHEME || 'http'}://${import.meta.env.VITE_REVERB_HOST || 'localhost'}:${import.meta.env.VITE_REVERB_PORT || '8080'}`;
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = new WebSocket(wsUrl.replace('http', 'ws') + '/app/' + (import.meta.env.VITE_REVERB_APP_KEY || ''));

    socket.onopen = () => {
      socket.send(JSON.stringify({
        event: 'subscribe',
        data: { channel: `private-chat.${requestId}` },
      }));
    };

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'NewMessageSent' && data.data?.sender_id !== user?.id) {
          queryClient.invalidateQueries({ queryKey: ['messages', requestId] });
          markReadMutation.mutate();
        }
        if (data.event === 'client-typing' && data.data?.userId !== user?.id) {
          setTypingUsers((prev) => {
            if (prev.some((u) => u.userId === data.data.userId)) return prev;
            return [...prev, data.data];
          });
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== data.data.userId));
          }, 3000);
        }
      } catch {}
    };

    return () => socket.close();
  }, [requestId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  useEffect(() => {
    if (allMessages.length > 0 && requestId) {
      markReadMutation.mutate();
    }
  }, [allMessages.length, requestId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileAttached) return;

    const formData = new FormData();
    formData.append('content', newMessage.trim() || (fileAttached ? fileAttached.name : ''));
    formData.append('type', fileAttached ? (fileAttached.type.startsWith('image/') ? 'image' : 'file') : 'text');

    if (fileAttached) {
      formData.append('file', fileAttached);
    }

    sendMutation.mutate(formData);
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileAttached(file);
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const formData = new FormData();
        formData.append('content', `https://maps.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
        formData.append('type', 'location');
        formData.append('metadata', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        sendMutation.mutate(formData);
      },
      () => {},
    );
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    const wsUrl = `${import.meta.env.VITE_REVERB_SCHEME || 'http'}://${import.meta.env.VITE_REVERB_HOST || 'localhost'}:${import.meta.env.VITE_REVERB_PORT || '8080'}`;
    const token = localStorage.getItem('token');
    if (!token || !requestId) return;
    const socket = new WebSocket(wsUrl.replace('http', 'ws') + '/app/' + (import.meta.env.VITE_REVERB_APP_KEY || ''));
    socket.onopen = () => {
      socket.send(JSON.stringify({
        event: 'client-event',
        data: {
          channel: `private-chat.${requestId}`,
          event: 'client-typing',
          data: { userId: user?.id, name: user?.name },
        },
      }));
      socket.close();
    };
  };

  if (isLoading) return <p className="text-text-secondary">Loading messages...</p>;
  if (!requestId) return <p className="text-text-secondary">No conversation selected.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">
            Chat: {request?.title || 'Loading...'}
          </h2>
          {hasNextPage && (
            <button onClick={() => fetchNextPage()} className="text-xs" style={{ color: '#FF6B00' }}>
              Load older messages
            </button>
          )}
        </div>

        <div className="h-[400px] overflow-y-auto p-6 space-y-4">
          {allMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}
          {allMessages.map((msg: {
            id: string; type: string; content: string; metadata: { lat?: number; lng?: number } | null;
            sender: { id: string; name: string }; created_at: string; read_at: string | null;
            file_url?: string;
          }) => {
            const isMine = msg.sender.id === user?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-surface shrink-0"
                  style={{ backgroundColor: isMine ? '#FF6B00' : '#1E3A8A' }}>
                  {msg.sender.name.charAt(0)}
                </div>
                <div className={`max-w-[70%] ${isMine ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-text-primary">{isMine ? 'You' : msg.sender.name}</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 ${isMine ? 'rounded-tr-md' : 'rounded-tl-md'}`}
                    style={{ backgroundColor: isMine ? '#FF6B00' : '#F3F4F6', color: isMine ? '#fff' : '#111827' }}>
                    {msg.type === 'image' && msg.file_url && (
                      <img src={imgUrl(msg.file_url)} alt="" className="max-w-full rounded-lg mb-2" />
                    )}
                    {msg.type === 'location' && msg.metadata?.lat && msg.metadata?.lng ? (
                      <a href={`https://maps.google.com/maps?q=${msg.metadata.lat},${msg.metadata.lng}`}
                        target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                        <MapPin className="w-4 h-4" /> Shared Location
                      </a>
                    ) : msg.type === 'file' ? (
                      <a href={msg.file_url ? imgUrl(msg.file_url) : '#'} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 underline">
                        <FileText className="w-4 h-4" /> {msg.content}
                      </a>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {isMine && (
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      {msg.read_at ? (
                        <CheckCheck className="w-3.5 h-3.5" style={{ color: '#1E3A8A' }} />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span className="text-[10px] text-gray-400">
                        {msg.read_at ? new Date(msg.read_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <div className="text-xs text-text-secondary italic">
              {typingUsers.map((u) => u.name).join(', ')} typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {fileAttached && (
          <div className="px-6 py-2 flex items-center gap-2 border-t border-border bg-gray-50">
            {fileAttached.type.startsWith('image/') ? (
              <Image className="w-4 h-4" style={{ color: '#FF6B00' }} />
            ) : (
              <FileText className="w-4 h-4" style={{ color: '#FF6B00' }} />
            )}
            <span className="text-sm text-text-secondary truncate flex-1">{fileAttached.name}</span>
            <button onClick={() => setFileAttached(null)} className="text-xs text-red-500">Remove</button>
          </div>
        )}

        <form onSubmit={handleSend} className="px-6 py-4 border-t border-border flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border border-border hover:bg-gray-50 transition-colors">
            <Paperclip className="w-4 h-4 text-text-secondary" />
          </button>
          <button type="button" onClick={handleShareLocation}
            className="p-2.5 rounded-xl border border-border hover:bg-gray-50 transition-colors">
            <MapPin className="w-4 h-4 text-text-secondary" />
          </button>
          <input value={newMessage} onChange={handleTyping} onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface"
          />
          <button type="submit" disabled={(!newMessage.trim() && !fileAttached) || sendMutation.isPending}
            className="flex items-center gap-2 text-sm font-medium text-surface px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FF6B00' }}>
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
