import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Image, X } from 'lucide-react';
import api from '../services/api';

export default function Portfolio() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', images: [] as File[], previews: [] as string[] });
  const [error, setError] = useState('');

  const { data: items } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/portfolio').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/portfolio', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setShowForm(false);
      setForm({ title: '', description: '', images: [], previews: [] });
    },
    onError: () => setError('Failed to create portfolio item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/portfolio/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setForm({ ...form, images: [...form.images, ...files], previews: [...form.previews, ...previews] });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(form.previews[index]);
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index),
      previews: form.previews.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    if (form.description) fd.append('description', form.description);
    form.images.forEach((img) => fd.append('images[]', img));
    createMutation.mutate(fd);
  };

  const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Portfolio</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-surface font-medium px-4 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: '#FF6B00' }}>
            <Plus className="w-4 h-4" /> Add Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">New Portfolio Item</h3>
            <button onClick={() => { setShowForm(false); setForm({ title: '', description: '', images: [], previews: [] }); }}>
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          {error && <div className="text-error-500 text-sm mb-3">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Description (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Images</label>
              <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleFiles} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-xl text-sm text-text-secondary hover:border-amber-400 transition-colors">
                <Image className="w-4 h-4" /> Add Images
              </button>
              {form.previews.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.previews.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={p} className="w-20 h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                        style={{ backgroundColor: '#FF6B00', color: 'white' }}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={createMutation.isPending}
              className="w-full text-surface font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#FF6B00' }}>
              {createMutation.isPending ? 'Uploading...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item: { id: number; title: string; description?: string; images: string[] }) => (
          <div key={item.id} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden group">
            <div className="aspect-video overflow-hidden">
              {item.images[0] && (
                <img src={imgUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-text-primary">{item.title}</h3>
              {item.description && <p className="text-sm text-text-secondary mt-1">{item.description}</p>}
              <button onClick={() => deleteMutation.mutate(item.id)}
                className="flex items-center gap-1 text-sm text-error-500 mt-2 hover:text-error-600 transition-colors">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {(!items || items.length === 0) && (
          <p className="text-text-secondary col-span-full text-center py-12">No portfolio items yet.</p>
        )}
      </div>
    </div>
  );
}
