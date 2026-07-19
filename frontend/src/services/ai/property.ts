import api from '../api';

export interface PropertyAnalysis {
  property_summary: {
    type: string;
    estimated_value: number;
    price_per_sqft: number;
    condition_assessment: string;
    verdict: string;
  };
  risk_assessment: {
    overall_risk: string;
    structural_risk: string;
    legal_risk: string;
    market_risk: string;
    risks: Array<{ risk: string; severity: string; detail: string }>;
  };
  repair_priorities: Array<{
    item: string;
    priority: string;
    estimated_cost: number;
    description: string;
  }>;
  affordability: {
    affordable: boolean;
    mortgage_needed: number;
    deposit_percentage: number;
    estimated_monthly_payment: number;
    income_to_loan_ratio: number;
    verdict: string;
  };
  mortgage_options: Array<{
    type: string;
    rate: string;
    monthly_payment: number;
    total_cost: number;
    pros: string[];
    cons: string[];
  }>;
  area_insights: {
    schools: Array<{ name: string; rating: string; distance: string }>;
    transport: Array<{ name: string; type: string; distance: string }>;
    amenities: string[];
    safety_rating: string;
  };
  recommendation: {
    verdict: string;
    confidence: number;
    summary: string;
    negotiation_points: string[];
    next_steps: string[];
  };
  action_items: Array<{ action: string; deadline: string; priority: string }>;
  resources?: Array<{ type: string; title: string; url: string; description: string }>;
  ai_metadata?: { model: string; provider: string; tokens: number; duration: number };
}

export const propertyApi = {
  analyze: async (userWorkflowId: string) => {
    const response = await api.post<{ success: boolean; data: PropertyAnalysis }>(
      `/ai/property/${userWorkflowId}/analyze`
    );
    return response.data;
  },
};
