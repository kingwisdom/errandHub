import api from '../api';

export interface ShoppingAnalysis {
  product_summary: {
    name: string;
    category: string;
    average_price: number;
    price_range: { min: number; max: number };
    best_for: string;
    verdict: string;
  };
  top_picks: Array<{
    name: string;
    brand: string;
    price: number;
    match_score: number;
    pros: string[];
    cons: string[];
    best_for: string;
    where_to_buy: string;
  }>;
  alternatives: Array<{
    name: string;
    brand: string;
    price: number;
    reason: string;
    savings: number;
  }>;
  vendor_comparison: Array<{
    vendor: string;
    price: number;
    shipping: string;
    return_policy: string;
    trust_score: number;
  }>;
  price_analysis: {
    current_average: number;
    best_time_to_buy: string;
    price_trend: string;
    historic_low: number;
    coupon_tips: string[];
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    potential_savings: number;
  }>;
  action_items: Array<{ action: string; deadline: string; impact: string }>;
  resources?: Array<{ type: string; title: string; url: string; description: string }>;
  ai_metadata?: { model: string; provider: string; tokens: number; duration: number };
}

export const shoppingApi = {
  analyze: async (userWorkflowId: string) => {
    const response = await api.post<{ success: boolean; data: ShoppingAnalysis }>(
      `/ai/shopping/${userWorkflowId}/analyze`
    );
    return response.data;
  },
};
