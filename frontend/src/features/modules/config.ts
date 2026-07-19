import { Briefcase, Globe, DollarSign, ShoppingCart, Plane, Home, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ModuleConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  lightColor: string;
  placeholder: string;
  greeting: string;
}

export const modules: Record<string, ModuleConfig> = {
  chat: {
    slug: 'chat',
    name: 'AI Chat',
    description: 'General AI assistant for any question',
    icon: MessageCircle,
    color: '#0F766E',
    lightColor: '#CCFBF1',
    placeholder: 'Ask me anything...',
    greeting: "Hello! I'm your AI assistant. How can I help you today?",
  },
  career: {
    slug: 'career',
    name: 'Career Guidance',
    description: 'CV reviews, interview prep, and career advice',
    icon: Briefcase,
    color: '#7C3AED',
    lightColor: '#EDE9FE',
    placeholder: 'Describe your career question...',
    greeting: "Welcome to Career Guidance! I can help with CV reviews, interview prep, job search strategies, and professional development. What's your career question?",
  },
  immigration: {
    slug: 'immigration',
    name: 'Immigration Help',
    description: 'Visa requirements, processes, and relocation',
    icon: Globe,
    color: '#2563EB',
    lightColor: '#DBEAFE',
    placeholder: 'Ask about visa requirements...',
    greeting: "Welcome to Immigration Help! I can guide you through visa requirements, immigration processes, and document preparation. Where are you looking to relocate?",
  },
  finance: {
    slug: 'finance',
    name: 'Finance Insights',
    description: 'Budgeting, savings, and financial planning',
    icon: DollarSign,
    color: '#16A34A',
    lightColor: '#DCFCE7',
    placeholder: 'Ask about finances...',
    greeting: "Welcome to Finance Insights! I can help with budgeting, savings strategies, investment basics, and financial planning. What's your financial goal?",
  },
  shopping: {
    slug: 'shopping',
    name: 'Smart Shopping',
    description: 'Deals, comparisons, and product recommendations',
    icon: ShoppingCart,
    color: '#EA580C',
    lightColor: '#FFF7ED',
    placeholder: 'What are you looking to buy?',
    greeting: "Welcome to Smart Shopping! I can help you compare products, find deals, and make informed purchasing decisions. What are you shopping for?",
  },
  travel: {
    slug: 'travel',
    name: 'Travel Planning',
    description: 'Destinations, itineraries, and travel tips',
    icon: Plane,
    color: '#0891B2',
    lightColor: '#CFFAFE',
    placeholder: 'Where do you want to travel?',
    greeting: "Welcome to Travel Planning! I can help with destination recommendations, itinerary planning, budget travel tips, and visa requirements. Where are you dreaming of going?",
  },
  property: {
    slug: 'property',
    name: 'Property Advice',
    description: 'Market trends, buying vs renting, and mortgages',
    icon: Home,
    color: '#CA8A04',
    lightColor: '#FEF9C3',
    placeholder: 'Ask about property...',
    greeting: "Welcome to Property Advice! I can help with property research, market trends, buying vs renting analysis, and mortgage basics. Are you looking to buy, rent, or sell?",
  },
};

export const moduleList = Object.values(modules);
