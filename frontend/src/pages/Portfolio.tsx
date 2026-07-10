import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Image, X, Pencil, CheckSquare, Tag } from 'lucide-react';
import api from '../services/api';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  images: string[];
  category_id?: string;
  category?: { id: string; name: string; slug: string };
  service_request_id?: string;
  service_request?: { id: string; title: string; status: string; completed_at: string };
}

interface CompletedRequest {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const emptyForm = { title: '', description: '', category_id: '', service_request_id: '', images: [] as File[], previews: [] as string[] };

export default function Portfolio() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { data: items } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/portfolio').then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
  });

  const { data: completedRequests } = useQuery({
    queryKey: ['completed-requests'],
    queryFn: () => api.get('/portfolio/completed-requests').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/portfolio', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setShowForm(false);
      setForm(emptyForm);
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create portfolio item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      api.post(`/portfolio/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }, params: { _method: 'PUT' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setEditingItem(null);
      setEditForm(emptyForm);
      setEditExistingImages([]);
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update portfolio item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/portfolio/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    if (isEdit) {
      setEditForm({ ...editForm, images: [...editForm.images, ...files], previews: [...editForm.previews, ...previews] });
    } else {
      setForm({ ...form, images: [...form.images, ...files], previews: [...form.previews, ...previews] });
    }
  };

  const removeImage = (index: number, isEdit: boolean) => {
    if (isEdit) {
      URL.revokeObjectURL(editForm.previews[index]);
      setEditForm({
        ...editForm,
        images: editForm.images.filter((_, i) => i !== index),
        previews: editForm.previews.filter((_, i) => i !== index),
      });
    } else {
      URL.revokeObjectURL(form.previews[index]);
      setForm({
        ...form,
        images: form.images.filter((_, i) => i !== index),
        previews: form.previews.filter((_, i) => i !== index),
      });
    }
  };

  const removeExistingImage = (index: number) => {
    setEditExistingImages(editExistingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    if (form.description) fd.append('description', form.description);
    if (form.category_id) fd.append('category_id', form.category_id);
    if (form.service_request_id) fd.append('service_request_id', form.service_request_id);
    form.images.forEach((img) => fd.append('images[]', img));
    createMutation.mutate(fd);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const fd = new FormData();
    fd.append('title', editForm.title);
    fd.append('description', editForm.description || '');
    fd.append('category_id', editForm.category_id || '');
    fd.append('service_request_id', editForm.service_request_id || '');
    editForm.images.forEach((img) => fd.append('images[]', img));
    if (editForm.images.length === 0 && editExistingImages.length > 0) {
      editExistingImages.forEach((img) => fd.append('existing_images[]', img));
    }
    updateMutation.mutate({ id: editingItem.id, data: fd });
  };

  const startEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      description: item.description || '',
      category_id: item.category_id || '',
      service_request_id: item.service_request_id || '',
      images: [],
      previews: [],
    });
    setEditExistingImages(item.images || []);
    setError('');
  };

  const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Portfolio</h2>
        {!showForm && !editingItem && (
          <button onClick={() => { setShowForm(true); setError(''); }}
            className="flex items-center gap-2 text-surface font-medium px-4 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: '#FF6B00' }}>
            <Plus className="w-4 h-4" /> Add Item
          </button>
        )}
      </div>

      {(showForm || editingItem) && (
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{editingItem ? 'Edit Portfolio Item' : 'New Portfolio Item'}</h3>
            <button onClick={() => {
              setShowForm(false);
              setEditingItem(null);
              setForm(emptyForm);
              setEditForm(emptyForm);
              setEditExistingImages([]);
              setError('');
            }}>
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
          <form onSubmit={editingItem ? handleUpdate : handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Title</label>
              <input
                type="text"
                value={editingItem ? editForm.title : form.title}
                onChange={(e) => editingItem
                  ? setEditForm({ ...editForm, title: e.target.value })
                  : setForm({ ...form, title: e.target.value })
                }
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Description (optional)</label>
              <textarea
                value={editingItem ? editForm.description : form.description}
                onChange={(e) => editingItem
                  ? setEditForm({ ...editForm, description: e.target.value })
                  : setForm({ ...form, description: e.target.value })
                }
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-shadow" rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />
                  Category (optional)
                </label>
                <select
                  value={editingItem ? editForm.category_id : form.category_id}
                  onChange={(e) => editingItem
                    ? setEditForm({ ...editForm, category_id: e.target.value })
                    : setForm({ ...form, category_id: e.target.value })
                  }
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface">
                  <option value="">No category</option>
                  {categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  <CheckSquare className="w-3.5 h-3.5 inline mr-1" />
                  Link to completed task (optional)
                </label>
                <select
                  value={editingItem ? editForm.service_request_id : form.service_request_id}
                  onChange={(e) => editingItem
                    ? setEditForm({ ...editForm, service_request_id: e.target.value })
                    : setForm({ ...form, service_request_id: e.target.value })
                  }
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-shadow bg-surface">
                  <option value="">No linked task</option>
                  {completedRequests?.map((req: CompletedRequest) => (
                    <option key={req.id} value={req.id}>{req.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Images</label>
              <input
                type="file"
                ref={editingItem ? editFileInputRef : fileInputRef}
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e, !!editingItem)}
                className="hidden" />
              <button type="button" onClick={() => (editingItem ? editFileInputRef : fileInputRef).current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-xl text-sm text-text-secondary hover:border-amber-400 transition-colors">
                <Image className="w-4 h-4" /> Add Images
              </button>
              {editingItem && editExistingImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {editExistingImages.map((img, i) => (
                    <div key={`existing-${i}`} className="relative">
                      <img src={imgUrl(img)} className="w-20 h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeExistingImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center bg-red-500 text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {(editingItem ? editForm.previews : form.previews).length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(editingItem ? editForm.previews : form.previews).map((p, i) => (
                    <div key={`new-${i}`} className="relative">
                      <img src={p} className="w-20 h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(i, !!editingItem)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center bg-red-500 text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full text-surface font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#FF6B00' }}>
              {createMutation.isPending || updateMutation.isPending
                ? (editingItem ? 'Updating...' : 'Uploading...')
                : (editingItem ? 'Update' : 'Save')
              }
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item: PortfolioItem) => (
          <div key={item.id} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden group">
            <div className="aspect-video overflow-hidden relative bg-gray-100">
              {item.images[0] && (
                <img src={imgUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              )}
              {item.images.length > 1 && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-black/60 text-white">
                  <Image className="w-3 h-3" />
                  {item.images.length}
                </span>
              )}
              {item.service_request && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-500 text-white">
                  <CheckSquare className="w-3 h-3" />
                  Linked
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-text-primary">{item.title}</h3>
              {item.description && <p className="text-sm text-text-secondary mt-1 line-clamp-2">{item.description}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.category && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                    <Tag className="w-2.5 h-2.5" />
                    {item.category.name}
                  </span>
                )}
                {item.service_request && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700">
                    {item.service_request.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                <button onClick={() => startEdit(item)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => deleteMutation.mutate(item.id)}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!items || items.length === 0) && (
          <p className="text-text-secondary col-span-full text-center py-12">No portfolio items yet. Add your first completed task!</p>
        )}
      </div>
    </div>
  );
}
