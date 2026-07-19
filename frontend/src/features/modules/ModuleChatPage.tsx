import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useChatStore } from '../chat/store/chatStore';
import { useMessages } from '../chat/hooks/useChat';
import { modules } from './config';
import ModuleConversationList from './ModuleConversationList';
import MessageBubble from '../chat/components/MessageBubble';
import ChatInput from '../chat/components/ChatInput';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

interface ModuleChatPageProps {
  moduleSlug: string;
}

export default function ModuleChatPage({ moduleSlug }: ModuleChatPageProps) {
  const { conversationId } = useParams();
  const { setCurrentConversationId, messages, clearMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mod = modules[moduleSlug];

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

  if (!mod) return null;

  const Icon = mod.icon;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="flex items-center h-14 px-4 gap-3">
          <Link to="/ai" className="p-1.5 rounded-lg hover:bg-background text-text-secondary">
            <ArrowLeft size={20} />
          </Link>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: mod.lightColor }}
          >
            <Icon size={16} style={{ color: mod.color }} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-tight">{mod.name}</h1>
            <p className="text-xs text-text-muted">{mod.description}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-surface border-r border-border flex-col hidden lg:flex">
          <div className="flex-1 overflow-hidden">
            <ModuleConversationList module={moduleSlug} />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {!conversationId ? (
                <EmptyState
                  icon={<Icon size={32} style={{ color: mod.color }} />}
                  title={`Start a ${mod.name} Conversation`}
                  description={mod.greeting}
                />
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
              <ChatInput module={moduleSlug} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
