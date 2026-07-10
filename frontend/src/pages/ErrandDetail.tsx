import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { MapPin, Calendar, DollarSign, AlertTriangle, Users, CheckCircle, Send, XCircle } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function ErrandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data: errand, isLoading } = useQuery({
    queryKey: ['errand', id],
    queryFn: () => api.get(`/requests/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: myApps } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/my-applications').then((r) => r.data.data),
    enabled: !!user && user.role === 'agent',
  });

  const myApplication = myApps?.find((a: { service_request?: { id: string }; status: string }) => a.service_request?.id === id);

  const applyMutation = useMutation({
    mutationFn: () => api.post('/errand-applications', {
      service_request_id: id,
      cover_letter: coverLetter || undefined,
      proposed_budget: proposedBudget ? parseFloat(proposedBudget) : undefined,
    }),
    onSuccess: () => {
      setShowApplyForm(false);
      setCoverLetter('');
      setProposedBudget('');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => api.post(`/errand-applications/${myApplication?.id}/withdraw`),
  });

  if (isLoading) return <p className="text-text-secondary">Loading...</p>;
  if (!errand) return <p className="text-text-secondary">Errand not found</p>;

  const isOwner = user && errand.client?.id === user.id;
  const isAgent = user && user.role === 'agent';
  const isClaimed = errand.has_agent_assigned;
  const canApply = !isOwner && !myApplication && !isClaimed;
  const showApplyButton = canApply && !showApplyForm;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        {errand.photos?.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {errand.photos.slice(0, 4).map((photo: string, i: number) => (
              <div key={i} className={`${i === 0 ? 'col-span-2' : ''} aspect-video overflow-hidden bg-gray-100`}>
                <img src={`http://localhost:8000/storage/${photo}`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-2 mb-1">
            {errand.category && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                {errand.category.name}
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[errand.priority] || ''}`}>
              {errand.priority}
            </span>
            {isClaimed && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Claimed</span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-4">{errand.title}</h2>

          <div className="flex flex-wrap gap-6 mb-6">
            {errand.budget_range && errand.budget_range.length === 2 && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" style={{ color: '#FF6B00' }} />
                <span className="text-xl font-bold" style={{ color: '#FF6B00' }}>${errand.budget_range[0]} - ${errand.budget_range[1]}</span>
              </div>
            )}
            {errand.deadline && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Due {new Date(errand.deadline).toLocaleDateString()}</span>
              </div>
            )}
            {errand.location && (
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{errand.location}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-2">Description</h3>
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{errand.description}</p>
          </div>

          {errand.instructions && (
            <div className="mb-6">
              <h3 className="font-semibold text-text-primary mb-2">Special Instructions</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{errand.instructions}</p>
            </div>
          )}

          {errand.client && (
            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold text-text-primary mb-3">Posted by</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-surface"
                  style={{ backgroundColor: '#1E3A8A' }}>
                  {errand.client.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{errand.client.name}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Users className="w-4 h-4" />
              <span>{errand.applications_count ?? 0} agents applied</span>
            </div>
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <p className="text-sm text-blue-800 mb-2">Want to apply for this errand?</p>
              <div className="flex justify-center gap-3">
                <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-lg text-surface transition-colors" style={{ backgroundColor: '#FF6B00' }}>
                  Log In
                </Link>
                <Link to="/register" className="text-sm font-medium px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors">
                  Sign Up as Agent
                </Link>
              </div>
            </div>
          )}

          {user && user.role !== 'agent' && canApply && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-sm text-orange-800 mb-2">Only agents can apply to errands. Switch to an agent account to apply.</p>
              <Link to="/my-profile" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-surface transition-colors" style={{ backgroundColor: '#FF6B00' }}>
                Switch to Agent
              </Link>
            </div>
          )}

          {showApplyButton && isAgent && (
            <button onClick={() => setShowApplyForm(true)}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-medium text-surface px-6 py-3 rounded-xl transition-colors"
              style={{ backgroundColor: '#FF6B00' }}>
              <Send className="w-4 h-4" /> Apply for This Errand
            </button>
          )}

          {canApply && isAgent && showApplyForm && (
            <div className="mt-6 p-4 border border-border rounded-xl space-y-3">
              <h4 className="font-semibold text-text-primary">Apply</h4>
              <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the client why you're a great fit (optional)"
                rows={4} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2" />
              <input type="number" value={proposedBudget} onChange={(e) => setProposedBudget(e.target.value)}
                placeholder="Your proposed budget (optional)"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2" />
              <div className="flex gap-3">
                <button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-surface px-4 py-2.5 rounded-xl transition-colors"
                  style={{ backgroundColor: '#FF6B00' }}>
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </button>
                <button onClick={() => setShowApplyForm(false)}
                  className="px-4 py-2.5 text-sm border border-border rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
              {applyMutation.isError && <p className="text-xs text-red-500">Failed to submit. You may have already applied.</p>}
            </div>
          )}

          {myApplication && (
            <div className="mt-6 p-4 border border-border rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />
                  <span className="text-sm font-medium text-text-primary">You applied — {myApplication.status}</span>
                </div>
                {myApplication.status === 'pending' && (
                  <button onClick={() => withdrawMutation.mutate()}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Withdraw
                  </button>
                )}
              </div>
            </div>
          )}

          {isOwner && (
            <button onClick={() => navigate(`/errands/${errand.id}/applications`)}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-medium px-6 py-3 rounded-xl border-2 transition-colors"
              style={{ borderColor: '#FF6B00', color: '#FF6B00' }}>
              <Users className="w-4 h-4" /> View Applications ({errand.applications_count ?? 0})
            </button>
          )}

          {isClaimed && errand.agent && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-medium text-green-800">This errand has been claimed by {errand.agent.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
