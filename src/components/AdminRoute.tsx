import { Navigate } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Loading...
      </div>
    );
  }

  if (!profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
