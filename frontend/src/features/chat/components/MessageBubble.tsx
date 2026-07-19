import type { Message } from '../../../services/ai/messages';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-primary" />
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-surface border border-border text-text-primary rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-accent" />
        </div>
      )}
    </div>
  );
}
