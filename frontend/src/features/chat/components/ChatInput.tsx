import { useState, useRef, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useSendMessage } from '../hooks/useChat';
import { useChatStore } from '../store/chatStore';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  module?: string;
}

export default function ChatInput({ module }: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentConversationId } = useChatStore();
  const sendMessage = useSendMessage(module);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sendMessage.isPending) return;

    const messageContent = content;
    setContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage.mutateAsync({
      conversationId: currentConversationId,
      content: messageContent,
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Shift+Enter for newline)"
        rows={1}
        disabled={sendMessage.isPending}
        className="flex-1 border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 leading-relaxed"
      />
      <button
        type="submit"
        disabled={!content.trim() || sendMessage.isPending}
        className="bg-primary text-white p-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center flex-shrink-0"
      >
        {sendMessage.isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  );
}
