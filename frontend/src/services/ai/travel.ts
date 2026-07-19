import api from '../api';

export interface TravelAnalysis {
  trip_summary: {
    destination: string;
    duration_days: number;
    trip_type: string;
    best_season: string;
    highlights: string[];
    verdict: string;
  };
  daily_itinerary: Array<{
    day: number;
    theme: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      duration: string;
      cost: number;
      tips: string;
    }>;
    meals: { breakfast: string; lunch: string; dinner: string };
    daily_cost: number;
  }>;
  cost_breakdown: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
    shopping: number;
    total: number;
    per_day: number;
  };
  accommodation_options: Array<{
    name: string;
    type: string;
    price_per_night: number;
    rating: number;
    location: string;
    pros: string[];
    best_for: string;
  }>;
  transport_options: Array<{
    from: string;
    to: string;
    mode: string;
    duration: string;
    cost: number;
    tips: string;
  }>;
  packing_list: Array<{ category: string; items: string[] }>;
  travel_tips: Array<{ tip: string; category: string; importance: string }>;
  nearby_attractions: Array<{ name: string; type: string; distance: string; cost: number; description: string }>;
  recommendations: Array<{ title: string; description: string; priority: string }>;
  action_items: Array<{ action: string; deadline: string; priority: string }>;
  resources?: Array<{ type: string; title: string; url: string; description: string }>;
  ai_metadata?: { model: string; provider: string; tokens: number; duration: number };
}

export const travelApi = {
  analyze: async (userWorkflowId: string) => {
    const response = await api.post<{ success: boolean; data: TravelAnalysis }>(
      `/ai/travel/${userWorkflowId}/analyze`
    );
    return response.data;
  },
};
