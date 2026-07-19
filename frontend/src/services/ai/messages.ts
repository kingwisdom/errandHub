import api from '../api';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens: number | null;
  created_at: string;
  updated_at: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    user_message: Message;
    assistant_message: Message;
    ai_metadata: {
      content: string;
      tokens: number;
      model: string;
      provider: string;
      duration: number;
    };
  };
  message: string;
}

export const messagesApi = {
  list: async (conversationId: string) => {
    const response = await api.get<{ success: boolean; data: Message[] }>(
      `/ai/conversations/${conversationId}/messages`
    );
    return response.data;
  },

  send: async (conversationId: string, content: string, systemPrompt?: string) => {
    const response = await api.post<SendMessageResponse>(
      `/ai/conversations/${conversationId}/messages`,
      { content, system_prompt: systemPrompt }
    );
    return response.data;
  },
};
