import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../features/chat/store/chatStore';
import { useMessages } from '../features/chat/hooks/useChat';
import { modules } from '../features/modules/config';
import ModuleConversationList from '../features/modules/ModuleConversationList';
import MessageBubble from '../features/chat/components/MessageBubble';
import ChatInput from '../features/chat/components/ChatInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MessageCircle } from 'lucide-react';

export default function AiChatPage() {
  const { conversationId } = useParams();
  const { setCurrentConversationId, messages, clearMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
    } else {
      clearMessages();
    }
  }, [conversationId, setCurrentConversationId, clearMessages]);

  const { isLoading: messagesLoading } = useMessages(conversationId || '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const mod = modules.chat;

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-surface border-r border-border flex-col hidden lg:flex">
          <div className="flex-1 overflow-hidden">
            <ModuleConversationList module="chat" />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {!conversationId ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Start a Conversation</h3>
                  <p className="text-sm text-text-secondary max-w-sm mb-6">{mod.greeting}</p>
                </div>
              ) : messagesLoading ? (
                <div className="py-16">
                  <LoadingSpinner text="Loading messages..." />
                </div>
              ) : messages.length === 0 ? (
                <div
                  className="border rounded-2xl p-4 text-sm"
                  style={{ backgroundColor: mod.lightColor, borderColor: mod.color + '30', color: mod.color }}
                >
                  {mod.greeting}
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border p-4 bg-surface">
            <div className="max-w-3xl mx-auto">
              <ChatInput module="chat" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
