import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </header>
        
        <main>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h2 className="text-xl font-semibold mb-4">Welcome, {profile?.name || session?.user?.email}</h2>
            <p className="text-neutral-600 mb-4">This is your Dashboard placeholder.</p>
            {profile && (
              <div className="text-sm text-neutral-500">
                <p><strong>City:</strong> {profile.city || 'N/A'}</p>
                <p><strong>Country:</strong> {profile.country || 'N/A'}</p>
                <p><strong>Phone:</strong> {profile.phone_number || 'N/A'}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
