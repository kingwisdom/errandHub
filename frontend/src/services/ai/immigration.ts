import api from '../api';

export interface ImmigrationAnalysis {
  eligibility: {
    score: number;
    verdict: 'likely_eligible' | 'may_be_eligible' | 'unlikely_eligible';
    summary: string;
  };
  recommended_visa_types: Array<{
    name: string;
    match_score: number;
    description: string;
    requirements_met: string[];
    requirements_missing: string[];
  }>;
  requirements: Record<string, { status: 'met' | 'partial' | 'not_met'; detail: string }>;
  timeline: Array<{
    phase: string;
    duration: string;
    description: string;
    status: 'upcoming' | 'in_progress' | 'completed';
  }>;
  document_checklist: Array<{
    document: string;
    category: string;
    required: boolean;
    notes: string;
  }>;
  risks: Array<{ risk: string; severity: string; mitigation: string }>;
  action_items: Array<{
    action: string;
    deadline: string;
    priority: string;
    category: string;
  }>;
  cost_estimate: {
    visa_fee: number;
    application_fee: number;
    medical_exam: number;
    document_translation: number;
    biometrics: number;
    total_estimate: number;
    currency: string;
  };
  resources?: Array<{
    type: 'youtube' | 'government' | 'blog' | 'other';
    title: string;
    url: string;
    description: string;
  }>;
  ai_metadata?: { model: string; provider: string; tokens: number; duration: number };
}

export const immigrationApi = {
  analyze: async (userWorkflowId: string) => {
    const response = await api.post<{ success: boolean; data: ImmigrationAnalysis }>(
      `/ai/immigration/${userWorkflowId}/analyze`
    );
    return response.data;
  },
};
