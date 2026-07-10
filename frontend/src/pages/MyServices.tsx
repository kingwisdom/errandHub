import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import api from '../services/api';

export default function MyServices() {
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['my-services'],
    queryFn: () => api.get('/services').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-services'] }),
  });

  if (isLoading) return <p className="text-text-secondary">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">My Services</h2>
        <Link to="/services/create"
          className="flex items-center gap-2 text-sm font-medium text-surface px-5 py-2.5 rounded-xl transition-colors"
          style={{ backgroundColor: '#FF6B00' }}>
          <Plus className="w-4 h-4" />
          New Service
        </Link>
      </div>
      {services?.data?.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border">
          <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-text-secondary mb-4">You haven't created any services yet.</p>
          <Link to="/services/create"
            className="text-sm font-medium text-surface px-5 py-2.5 rounded-xl transition-colors inline-block"
            style={{ backgroundColor: '#FF6B00' }}>
            Create Your First Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services?.data?.map((service: {
            id: number; title: string; price_type: string; starting_price: number | null;
            status: string; category?: { name: string }; estimated_duration: number | null;
          }) => (
            <div key={service.id} className="bg-surface rounded-2xl shadow-sm border border-border p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary">{service.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    service.status === 'active' ? 'bg-green-100 text-green-700' :
                    service.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{service.status}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  {service.category && <span>{service.category.name}</span>}
                  <span className="capitalize">{service.price_type}</span>
                  {service.starting_price && <span style={{ color: '#FF6B00' }}>${service.starting_price}</span>}
                  {service.estimated_duration && <span>~{service.estimated_duration} min</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link to={`/services/${service.id}/edit`}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <Edit className="w-4 h-4 text-text-secondary" />
                </Link>
                <button onClick={() => { if (confirm('Delete this service?')) deleteMutation.mutate(service.id); }}
                  className="p-2 rounded-xl hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
