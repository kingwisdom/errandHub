import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Menu, X, Briefcase, User, MapPin, MessageCircle, Globe, DollarSign, ShoppingCart, Plane, Home, LayoutDashboard } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const aiModules = [
  { slug: 'finance', name: 'Finance', icon: DollarSign, color: '#16A34A' },
  { slug: 'immigration', name: 'Immigration', icon: Globe, color: '#2563EB' },
  { slug: 'shopping', name: 'Shopping', icon: ShoppingCart, color: '#EA580C' },
  { slug: 'travel', name: 'Travel', icon: Plane, color: '#0891B2' },
  { slug: 'property', name: 'Property', icon: Home, color: '#CA8A04' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAiSection = location.pathname.startsWith('/ai') || location.pathname.startsWith('/workflow');
  const isAdminSection = location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      //
    }
    logout();
    navigate('/login');
  };

  if (isAdminSection) {
    return <Outlet />;
  }

  if (isAiSection) {
    return (
      <div className="min-h-screen bg-background flex">
        <AiSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <AiNavbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            menuOpen={sidebarOpen}
            user={user}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: '#FF6B00' }}>
                <Briefcase className="w-6 h-6" />
                PAMIHUB
              </Link>
              <div className="hidden sm:flex gap-6">
                <Link to="/ai" className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isAiSection ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                  <MessageCircle className="w-4 h-4" />
                  AI Assistant
                </Link>
                {user && (
                  <>
                    <Link to="/errands" className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${location.pathname.startsWith('/errand') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                      <LayoutDashboard className="w-4 h-4" />
                      Errands
                    </Link>
                    <Link to="/services" className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${location.pathname.startsWith('/service') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                      <Briefcase className="w-4 h-4" />
                      Services
                    </Link>
                    <Link to="/nearby" className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${location.pathname === '/nearby' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                      <MapPin className="w-3.5 h-3.5" /> Near Me
                    </Link>
                    <Link to="/bookings" className={`text-sm font-medium transition-colors ${location.pathname === '/bookings' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                      Bookings
                    </Link>
                    <Link to="/agents" className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/agent') ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                      Find Agents
                    </Link>
                    {user.role === 'agent' && (
                      <>
                        <Link to="/my-profile" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">My Profile</Link>
                        <Link to="/services/my" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">My Services</Link>
                      </>
                    )}
                    {user.role === 'client' && (
                      <Link to="/requests/create" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">Post Request</Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <>
                  <NotificationBell />
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    <User className="w-4 h-4" />
                    {user.name}
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-error-500 hover:text-error-600 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Login</Link>
                  <Link to="/register" className="text-sm font-medium text-surface px-5 py-2.5 rounded-xl transition-colors" style={{ backgroundColor: '#FF6B00', color: 'white' }}>Sign Up</Link>
                </>
              )}
            </div>
            <button className="sm:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border px-4 py-4 space-y-3 bg-surface">
            <Link to="/ai" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>AI Assistant</Link>
            {user && (
              <>
                <Link to="/errands" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Errands</Link>
                <Link to="/services" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                <Link to="/nearby" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Near Me</Link>
                <Link to="/bookings" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Bookings</Link>
                <Link to="/agents" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Find Agents</Link>
                {user.role === 'agent' && (
                  <>
                    <Link to="/my-profile" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                    <Link to="/services/my" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>My Services</Link>
                  </>
                )}
                <button onClick={handleLogout} className="block text-error-500 text-sm">Logout</button>
              </>
            )}
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function AiNavbar({ onMenuToggle, menuOpen, user, onLogout }: {
  onMenuToggle: () => void;
  menuOpen: boolean;
  user: { name: string; role: string } | null;
  onLogout: () => void;
}) {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="lg:hidden p-1.5 rounded-lg hover:bg-background text-text-secondary">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/ai" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">PH</span>
            </div>
            <span className="text-lg font-bold text-primary">PAMIHUB</span>
          </Link>
          <span className="text-xs font-medium text-text-muted bg-primary/10 px-2 py-1 rounded-full">AI Assistant</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Marketplace</Link>
          {user && (
            <button onClick={onLogout} className="text-sm text-error-500 hover:text-error-600 transition-colors">
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function AiSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-border">
          <Link to="/ai" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">PH</span>
            </div>
            <span className="text-lg font-bold text-primary">PAMIHUB AI</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link
            to="/ai"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/ai' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}
          >
            <MessageCircle size={18} />
            <span>AI Chat</span>
          </Link>

          <Link
            to="/ai/workflows"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/ai/workflows' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}
          >
            <Briefcase size={18} />
            <span>All Workflows</span>
          </Link>

          <div className="pt-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 py-2">Modules</p>
            {aiModules.map((mod) => {
              const isActive = location.pathname.includes(`/workflow/${mod.slug}`) || location.pathname.includes(`/ai/${mod.slug}`);
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.slug}
                  to={`/ai/workflow/${mod.slug}`}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary'}`}
                >
                  <Icon size={18} style={{ color: mod.color }} />
                  <span>{mod.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
