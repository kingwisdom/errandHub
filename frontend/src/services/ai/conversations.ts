import api from '../api';

export interface Conversation {
  id: string;
  guest_uuid: string;
  title: string | null;
  module: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const conversationsApi = {
  list: async (page = 1, perPage = 20) => {
    const response = await api.get<PaginatedResponse<Conversation>>('/ai/conversations', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Conversation }>(`/ai/conversations/${id}`);
    return response.data;
  },

  create: async (data?: { title?: string; module?: string }) => {
    const response = await api.post<{ success: boolean; data: Conversation }>('/ai/conversations', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/ai/conversations/${id}`);
    return response.data;
  },
};
