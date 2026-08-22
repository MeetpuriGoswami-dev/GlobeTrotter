import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();
  
  // Check for local demo admin bypass
  const isDemoAdmin = localStorage.getItem('demo_admin') === 'true';

  if (isLoading && !isDemoAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isDemoAdmin && !profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
