import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export function ProtectedRoute({ requiredRole }: { requiredRole?: 'ADMIN' | 'REPORTER' }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}