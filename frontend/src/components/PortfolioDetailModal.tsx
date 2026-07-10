import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, Tag } from 'lucide-react';
import api from '../services/api';

const imgUrl = (path: string) => `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000'}/storage/${path}`;

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  images: string[];
  category?: { id: string; name: string; slug: string };
  service_request?: { id: string; title: string; status: string; completed_at: string };
}

interface Props {
  item: PortfolioItem;
  onClose: () => void;
}

export default function PortfolioDetailModal({ item, onClose }: Props) {
  const [currentImage, setCurrentImage] = useState(0);

  const prev = () => setCurrentImage((c) => (c === 0 ? item.images.length - 1 : c - 1));
  const next = () => setCurrentImage((c) => (c === item.images.length - 1 ? 0 : c + 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="relative bg-black">
          {item.images.length > 0 && (
            <>
              <img
                src={imgUrl(item.images[currentImage])}
                alt={`${item.title} - ${currentImage + 1}`}
                className="w-full max-h-[50vh] object-contain"
              />
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5 text-text-primary" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md"
                  >
                    <ChevronRight className="w-5 h-5 text-text-primary" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {item.images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="p-5 space-y-4">
          {item.description && (
            <p className="text-text-secondary leading-relaxed">{item.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {item.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                <Tag className="w-3 h-3" />
                {item.category.name}
              </span>
            )}
            {item.service_request && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3" />
                Completed: {item.service_request.title}
              </span>
            )}
          </div>

          <p className="text-xs text-text-secondary">
            {item.images.length} {item.images.length === 1 ? 'image' : 'images'} · Added {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
