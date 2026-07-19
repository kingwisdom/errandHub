import api from '../api';

export interface FinancialAnalysis {
  summary: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
    savings_rate: number;
    health_score: number;
  };
  income_breakdown: Array<{ source: string; amount: number }>;
  expense_breakdown: Array<{ category: string; amount: number; percentage: number }>;
  budget: {
    '50_30_20': { needs: number; wants: number; savings: number };
    recommended_budget?: Array<{ category: string; recommended: number; actual: number; status: string }>;
  };
  savings_plan: {
    emergency_fund_target: number;
    monthly_savings_target: number;
    timeline_months: number;
    projected_savings_12_months: number;
  };
  spending_insights: Array<{ insight: string; impact: string; amount: number }>;
  warnings: Array<{ warning: string; severity: string }>;
  recommendations: Array<{ title: string; description: string; priority: string; estimated_savings: number }>;
  action_items: Array<{ action: string; deadline: string; impact: string }>;
  resources?: Array<{ type: string; title: string; url: string; description: string }>;
  ai_metadata?: { model: string; provider: string; tokens: number; duration: number };
}

export const financeApi = {
  analyze: async (userWorkflowId: string) => {
    const response = await api.post<{ success: boolean; data: FinancialAnalysis }>(
      `/ai/finance/${userWorkflowId}/analyze`
    );
    return response.data;
  },
};
