import { ExternalLink, Video, Globe, BookOpen } from 'lucide-react';

interface Resource {
  type: string;
  title: string;
  url: string;
  description: string;
}

interface ResourcesPanelProps {
  resources: Resource[];
}

const iconMap: Record<string, typeof Video> = {
  youtube: Video,
  government: Globe,
  blog: BookOpen,
  other: Globe,
};

const colorMap: Record<string, string> = {
  youtube: 'bg-red-50 text-red-600',
  government: 'bg-blue-50 text-blue-600',
  blog: 'bg-green-50 text-green-600',
  other: 'bg-surface text-text-muted',
};

export default function ResourcesPanel({ resources }: ResourcesPanelProps) {
  if (!resources.length) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Resources & Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {resources.map((resource, i) => {
          const Icon = iconMap[resource.type] || Globe;
          const colors = colorMap[resource.type] || 'bg-surface text-text-muted';
          return (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-background rounded-lg hover:bg-primary-light transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{resource.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{resource.description}</p>
                <p className="text-xs text-text-muted mt-1 truncate">{resource.url}</p>
              </div>
              <ExternalLink size={14} className="flex-shrink-0 mt-1 text-text-muted group-hover:text-primary transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
