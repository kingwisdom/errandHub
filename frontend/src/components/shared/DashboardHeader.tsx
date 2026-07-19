import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Menu, X, Home, Briefcase } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  title: string;
  subtitle: string;
  userWorkflowId?: string;
  onDelete?: () => Promise<void>;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function DashboardHeader({ title, subtitle, userWorkflowId, onDelete, actions, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      navigate('/workflows');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <header className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center h-14 px-4 gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-background text-text-secondary">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-text-primary truncate">{title}</h1>
            <p className="text-xs text-text-muted truncate">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {userWorkflowId && onDelete && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                title="Delete workflow"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-background text-text-secondary"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-surface">
            <nav className="p-2 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-background"
              >
                <Home size={18} />
                Home
              </Link>
              <Link
                to="/workflows"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-background"
              >
                <Briefcase size={18} />
                All Workflows
              </Link>
              {children}
            </nav>
          </div>
        )}
      </header>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Workflow"
        message="This will permanently delete this workflow and all its data. This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
