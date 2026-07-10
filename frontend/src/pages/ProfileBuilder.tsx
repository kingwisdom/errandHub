import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, AlertCircle } from 'lucide-react';
import api from '../services/api';

const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

export default function ProfileBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    bio: '', skills: [] as number[], languages: [] as string[], coverage_area: '',
    vehicle: '', experience_years: '', available_hours: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/my-profile').then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
  });

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || '',
        skills: profile.skills || [],
        languages: profile.languages || [],
        coverage_area: profile.coverage_area || '',
        vehicle: profile.vehicle || '',
        experience_years: profile.experience_years?.toString() || '',
        available_hours: profile.available_hours || [],
      });
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      queryClient.setQueryData(['my-profile'], (old: Record<string, unknown> | undefined) => old ? { ...old, user: data } : old);
    } catch {
      // ignore
    }
    setAvatarUploading(false);
  };

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      if (profile?.id) {
        return api.put(`/my-profile/${profile.id}`, data);
      }
      return api.post('/my-profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
        if (axiosErr.response?.data?.errors) setErrors(axiosErr.response.data.errors);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate({
      ...form,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
    });
  };

  const toggleSkill = (id: number) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(id) ? f.skills.filter((s) => s !== id) : [...f.skills, id],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Complete Your Profile</h2>
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-2 bg-red-50 text-error-600 p-4 rounded-xl mb-6 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              {Object.entries(errors).map(([field, msgs]) => (
                <p key={field}>{msgs[0]}</p>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {profile?.user?.avatar ? (
                <img src={imgUrl(profile.user.avatar)} className="w-20 h-20 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-bold text-surface"
                  style={{ backgroundColor: '#FF6B00' }}>
                  {profile?.user?.name?.charAt(0) || '?'}
                </div>
              )}
              <label className="cursor-pointer text-sm font-medium px-4 py-2 rounded-xl border-2 border-border hover:border-amber-400 transition-colors disabled:opacity-50"
                style={{ color: '#FF6B00' }}>
                <input type="file" ref={avatarInputRef} accept="image/*" hidden onChange={handleAvatarChange} />
                {avatarUploading ? 'Uploading...' : 'Upload Photo'}
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow"
              rows={4} placeholder="Tell clients about yourself and your services..." />
            <p className="text-xs text-text-secondary mt-1">A good bio helps clients trust you.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Skills & Categories</label>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto bg-gray-50 rounded-xl p-3">
              {categories?.map((cat: { id: number; name: string; children?: { id: number; name: string }[] }) => (
                <div key={cat.id}>
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <input type="checkbox" checked={form.skills.includes(cat.id)}
                      onChange={() => toggleSkill(cat.id)} className="rounded"
                      style={{ accentColor: '#FF6B00' }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </label>
                  {cat.children?.map((child) => (
                    <label key={child.id} className="flex items-center gap-2 pl-6 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <input type="checkbox" checked={form.skills.includes(child.id)}
                        onChange={() => toggleSkill(child.id)} className="rounded"
                        style={{ accentColor: '#FF6B00' }} />
                      <span className="text-sm text-text-secondary">{child.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Coverage Area</label>
              <input type="text" value={form.coverage_area} onChange={(e) => setForm({ ...form, coverage_area: e.target.value })}
                placeholder="e.g., Downtown, Uptown, City-wide"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Vehicle</label>
              <input type="text" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                placeholder="e.g., Car, Motorcycle, Bicycle"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Experience (years)</label>
              <input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" min={0} max={50} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Languages</label>
              <input type="text" value={form.languages.join(', ')} onChange={(e) => setForm({ ...form, languages: e.target.value.split(',').map((l) => l.trim()).filter(Boolean) })}
                placeholder="e.g., English, Spanish, French"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" />
            </div>
          </div>

          <button type="submit" disabled={mutation.isPending}
            className="w-full flex items-center justify-center gap-2 text-surface font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FF6B00' }}>
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
