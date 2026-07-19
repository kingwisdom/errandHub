import { FileText } from 'lucide-react';

interface Props {
  documents: Array<{
    document: string;
    category: string;
    required: boolean;
    notes: string;
  }>;
}

export default function DocumentChecklist({ documents }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Document Checklist</h3>
      <div className="space-y-2">
        {documents.map((doc, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <FileText size={14} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary">{doc.document}</p>
                {doc.required && (
                  <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">Required</span>
                )}
              </div>
              <p className="text-xs text-text-muted">{doc.notes}</p>
            </div>
            <span className="text-xs text-text-muted capitalize bg-surface px-2 py-0.5 rounded-full">{doc.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
