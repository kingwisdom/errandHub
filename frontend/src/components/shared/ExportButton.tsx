import { useState } from 'react';
import { Download } from 'lucide-react';
import { reportsApi } from '../../services/ai/reports';

interface Props {
  userWorkflowId: string;
  filename?: string;
}

export default function ExportButton({ userWorkflowId, filename }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await reportsApi.download(userWorkflowId);
      const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-2 bg-surface border border-border text-text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-background transition-colors disabled:opacity-50"
    >
      <Download size={16} />
      {downloading ? 'Generating...' : 'Export PDF'}
    </button>
  );
}
