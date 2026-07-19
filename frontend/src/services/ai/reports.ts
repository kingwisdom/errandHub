import api from '../api';

export const reportsApi = {
  download: async (userWorkflowId: string) => {
    const response = await api.get(`/ai/reports/${userWorkflowId}/download`, {
      responseType: 'blob',
    });
    return response;
  },
};
