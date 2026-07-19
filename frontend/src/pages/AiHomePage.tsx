import { Link } from 'react-router-dom';
import { MessageCircle, Briefcase, DollarSign, Globe, ShoppingCart, Plane, Home } from 'lucide-react';

const modules = [
  { slug: 'finance', name: 'Finance Insights', description: 'Budgeting, savings, and financial planning', icon: DollarSign, color: '#16A34A', lightColor: '#DCFCE7' },
  { slug: 'immigration', name: 'Immigration Help', description: 'Visa requirements, processes, and relocation', icon: Globe, color: '#2563EB', lightColor: '#DBEAFE' },
  { slug: 'shopping', name: 'Smart Shopping', description: 'Deals, comparisons, and product recommendations', icon: ShoppingCart, color: '#EA580C', lightColor: '#FFF7ED' },
  { slug: 'travel', name: 'Travel Planning', description: 'Destinations, itineraries, and travel tips', icon: Plane, color: '#0891B2', lightColor: '#CFFAFE' },
  { slug: 'property', name: 'Property Advice', description: 'Market trends, buying vs renting, and mortgages', icon: Home, color: '#CA8A04', lightColor: '#FEF9C3' },
];

export default function AiHomePage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">AI Assistant</h1>
        <p className="text-sm text-text-secondary mt-1">Chat with AI or use structured workflows for deeper insights.</p>
      </div>

      <section className="mb-10">
        <Link
          to="/ai/chat"
          className="block bg-surface border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <MessageCircle size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">AI Chat</h2>
              <p className="text-sm text-text-secondary">General AI assistant for any question</p>
            </div>
          </div>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Workflows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.slug}
                to={`/ai/workflow/${mod.slug}`}
                className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: mod.lightColor }}
                  >
                    <Icon size={20} style={{ color: mod.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{mod.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{mod.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <Link
          to="/ai/workflows"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          <Briefcase size={16} />
          View All Workflows
        </Link>
      </section>
    </div>
  );
}
