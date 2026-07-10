import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || 'localhost';
const REVERB_PORT = import.meta.env.VITE_REVERB_PORT || '8080';
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME || 'http';
const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || '';

const SOCKET_URL = `${REVERB_SCHEME}://${REVERB_HOST}:${REVERB_PORT}`;

export function useChatSocket(
  requestId: string | undefined,
  token: string | null,
  onNewMessage: (msg: unknown) => void,
  onTyping: (data: { userId: string; name: string }) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!requestId || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('subscribe', `private-chat.${requestId}`);
    });

    socket.on('private-chat.${requestId}', (event: string, data: unknown) => {
      if (event === 'NewMessageSent') {
        onNewMessage(data);
      }
      if (event === 'client-typing') {
        onTyping(data as { userId: string; name: string });
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [requestId, token, onNewMessage, onTyping]);

  const emitTyping = useCallback((userId: string, name: string) => {
    if (!socketRef.current || !requestId) return;
    socketRef.current.emit('client-event', {
      channel: `private-chat.${requestId}`,
      event: 'client-typing',
      data: { userId, name },
    });
  }, [requestId]);

  const startTyping = useCallback((userId: string, name: string) => {
    emitTyping(userId, name);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(userId, name);
    }, 2000);
  }, [emitTyping]);

  return { startTyping };
}
