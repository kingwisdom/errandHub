import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, Menu, X, Briefcase, User } from 'lucide-react';
import api from '../services/api';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      //
    }
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: '#FF6B00' }}>
                <Briefcase className="w-6 h-6" />
                ErrandHub
              </Link>
              {user && (
                <div className="hidden sm:flex gap-6">
                  <Link to="/requests" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                    Requests
                  </Link>
                  <Link to="/services" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                    Services
                  </Link>
                  <Link to="/bookings" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                    Bookings
                  </Link>
                  <Link to="/agents" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                    Find Agents
                  </Link>
                  {user.role === 'agent' ? (
                    <>
                      <Link to="/my-profile" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                        My Profile
                      </Link>
                      <Link to="/services/my" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                        My Services
                      </Link>
                      <Link to="/portfolio" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                        Portfolio
                      </Link>
                    </>
                  ) : (
                    <Link to="/requests/create" className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
                      Post Request
                    </Link>
                  )}
                </div>
              )}
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
                  <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-sm font-medium text-surface px-5 py-2.5 rounded-xl transition-colors" style={{ backgroundColor: '#FF6B00', color: 'white' }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            <button className="sm:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && user && (
          <div className="sm:hidden border-t border-border px-4 py-4 space-y-3 bg-surface">
            <Link to="/requests" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Requests</Link>
            <Link to="/bookings" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Bookings</Link>
            <Link to="/services" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            <Link to="/agents" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Find Agents</Link>
            {user.role === 'agent' ? (
              <>
                <Link to="/my-profile" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                <Link to="/services/my" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>My Services</Link>
                <Link to="/portfolio" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Portfolio</Link>
              </>
            ) : (
              <Link to="/requests/create" className="block text-text-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Post Request</Link>
            )}
            <button onClick={handleLogout} className="block text-error-500 text-sm">Logout</button>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
