import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function AdminRoute() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (user?.role !== 'super-admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
