import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, X, Briefcase, User, Menu, ShieldCheck, Users, FileText, Star, FolderOpen, BarChart3, ClipboardCheck, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const navItems = [
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/verifications', label: 'Verifications', icon: ClipboardCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/services', label: 'Services', icon: Briefcase },
  { to: '/admin/requests', label: 'Requests', icon: FileText },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    logout();
    navigate('/login');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <Briefcase className="w-5 h-5" style={{ color: '#FF6B00' }} />
          ErrandHub
        </Link>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 mb-1">
          <ShieldCheck className="w-4 h-4" style={{ color: '#FF6B00' }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-white shadow-lg'
                  : 'text-blue-200/70 hover:text-white hover:bg-white/5'
              }`}
              style={active ? { backgroundColor: 'rgba(255,107,0,0.2)', color: '#FF6B00' } : {}}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200/70 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-blue-300/60 truncate">{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="text-blue-200/50 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30"
        style={{ backgroundColor: '#0f172a' }}>
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 flex flex-col w-72 h-full"
            style={{ backgroundColor: '#0f172a' }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden flex items-center gap-2 text-sm font-semibold" style={{ color: '#FF6B00' }}>
              <ShieldCheck className="w-4 h-4" />
              Admin
            </div>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <User className="w-4 h-4" />
                {user?.name}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
