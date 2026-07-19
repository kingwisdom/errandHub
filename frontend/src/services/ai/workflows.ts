import api from '../api';

export interface Workflow {
  id: string;
  name: string;
  slug: string;
  module: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  config: Record<string, unknown> | null;
  is_active: boolean;
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  title: string;
  description: string | null;
  order: number;
  type: string;
  is_required: boolean;
  config: Record<string, unknown> | null;
  questions?: WorkflowQuestion[];
}

export interface WorkflowQuestion {
  id: string;
  step_id: string;
  key: string;
  type: string;
  label: string;
  description: string | null;
  is_required: boolean;
  options: string[] | null;
  validation: Record<string, unknown> | null;
  dependencies: Record<string, unknown> | null;
  visibility: Record<string, unknown> | null;
  order: number;
  default_value: unknown;
  placeholder: string | null;
}

export interface UserWorkflow {
  id: string;
  guest_uuid: string;
  workflow_id: string;
  current_step_id: string | null;
  status: string;
  data: Record<string, unknown> | null;
  progress: number;
  completed_at: string | null;
  workflow?: Workflow;
  current_step?: WorkflowStep & { questions?: WorkflowQuestion[] };
}

export const workflowsApi = {
  list: async () => {
    const response = await api.get<{ success: boolean; data: Workflow[] }>('/ai/workflows');
    return response.data;
  },

  get: async (slug: string) => {
    const response = await api.get<{ success: boolean; data: Workflow }>(`/ai/workflows/${slug}`);
    return response.data;
  },

  start: async (slug: string, forceNew: boolean = false) => {
    const response = await api.post<{ success: boolean; data: UserWorkflow }>(
      `/ai/workflows/${slug}/start`,
      { force_new: forceNew }
    );
    return response.data;
  },

  advance: async (userWorkflowId: string, answers: Record<string, unknown>) => {
    const response = await api.post<{ success: boolean; data: UserWorkflow }>(
      `/ai/workflows/${userWorkflowId}/advance`,
      { answers }
    );
    return response.data;
  },

  myWorkflows: async () => {
    const response = await api.get<{ success: boolean; data: UserWorkflow[] }>('/ai/my-workflows');
    return response.data;
  },

  uploadDocument: async (userWorkflowId: string, file: File, stepId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (stepId) formData.append('step_id', stepId);
    const response = await api.post<{ success: boolean; data: unknown }>(
      `/ai/workflows/${userWorkflowId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  delete: async (userWorkflowId: string) => {
    const response = await api.delete<{ success: boolean }>(`/ai/workflows/${userWorkflowId}`);
    return response.data;
  },
};
