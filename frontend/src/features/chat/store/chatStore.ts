import { create } from 'zustand';
import type { Message } from '../../../services/ai/messages';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentConversationId: string | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsLoading: (isLoading: boolean) => void;
  setCurrentConversationId: (id: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  currentConversationId: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  clearMessages: () => set({ messages: [], currentConversationId: null }),
}));
