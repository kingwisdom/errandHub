import api from '../api';

export interface Upload {
  id: string;
  guest_uuid: string;
  conversation_id: string | null;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
  path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export const uploadsApi = {
  list: async (page = 1, perPage = 20) => {
    const response = await api.get('/ai/uploads', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  upload: async (file: File, conversationId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }

    const response = await api.post<{ success: boolean; data: Upload }>('/ai/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
