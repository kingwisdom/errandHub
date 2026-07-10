import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import api from '../services/api';

interface Category {
  id: string; name: string; slug: string; description?: string;
  icon?: string; is_active: boolean; service_listings_count?: number;
}

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', is_active: true });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', icon: '', is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', is_active: cat.is_active });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Category Management</h2>
        {!showForm && (
          <button onClick={() => { setShowForm(true); resetForm(); }}
            className="flex items-center gap-2 text-surface font-medium px-4 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: '#FF6B00' }}>
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={resetForm}><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Icon (optional)</label>
                <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. wrench, broom"
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-border" />
                  <span className="text-sm font-medium text-text-primary">Active</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Description (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2" rows={2} />
            </div>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full text-surface font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#FF6B00' }}>
              {editingId ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? <p className="text-text-secondary">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat: Category) => (
            <div key={cat.id} className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-text-secondary" />
                  <h3 className="font-medium text-text-primary">{cat.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-1">/{cat.slug}</p>
              {cat.description && <p className="text-sm text-text-secondary mb-2">{cat.description}</p>}
              <p className="text-xs text-text-secondary mb-3">{cat.service_listings_count ?? 0} services</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button onClick={() => startEdit(cat)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => deleteMutation.mutate(cat.id)}
                  disabled={(cat.service_listings_count ?? 0) > 0}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors disabled:opacity-40">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
