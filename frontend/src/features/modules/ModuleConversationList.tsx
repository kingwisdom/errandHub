import { useConversations, useCreateConversation, useDeleteConversation } from '../chat/hooks/useConversations';
import { useChatStore } from '../chat/store/chatStore';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import type { Conversation } from '../../services/ai/conversations';

interface ModuleConversationListProps {
  module: string;
  onNavigate?: () => void;
}

export default function ModuleConversationList({ module, onNavigate }: ModuleConversationListProps) {
  const { data, isLoading } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const { setCurrentConversationId, clearMessages } = useChatStore();
  const navigate = useNavigate();

  const handleNewChat = async () => {
    const response = await createConversation.mutateAsync({ module });
    setCurrentConversationId(response.data.id);
    navigate(`/ai/chat/${response.data.id}`);
    onNavigate?.();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    navigate(`/ai/chat/${id}`);
    onNavigate?.();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      await deleteConversation.mutateAsync(id);
      clearMessages();
      navigate(`/ai/chat`);
      onNavigate?.();
    }
  };

  if (isLoading) {
    return <div className="p-4 text-text-muted text-sm">Loading...</div>;
  }

  const conversations: Conversation[] = (data?.data || []).filter((c) => c.module === module);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <button
          onClick={handleNewChat}
          disabled={createConversation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-4 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="text-text-muted text-xs text-center py-8">No conversations yet</p>
        ) : (
          <div className="space-y-0.5">
            {conversations.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer hover:bg-background transition-colors group"
              >
                <MessageSquare size={14} className="text-text-muted flex-shrink-0" />
                <span className="flex-1 truncate text-sm text-text-secondary">
                  {conversation.title || 'New Conversation'}
                </span>
                <button
                  onClick={(e) => handleDelete(conversation.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error/10 hover:text-error transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
