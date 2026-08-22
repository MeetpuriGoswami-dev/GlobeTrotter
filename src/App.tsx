import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Trips from '@/pages/Trips';
import NewTrip from '@/pages/NewTrip';
import Explore from '@/pages/Explore';
import ItineraryView from '@/pages/ItineraryView';
import ItineraryBuilder from '@/pages/ItineraryBuilder';
import BudgetBreakdown from '@/pages/BudgetBreakdown';
import SharedItinerary from '@/pages/SharedItinerary';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/components/AdminLayout';
import Community from '@/pages/Community';
import Profile from '@/pages/Profile';
import CalendarView from '@/pages/CalendarView';
import MainLayout from '@/components/MainLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Admin Routes */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Authenticated Routes with Main Layout */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/new" element={<NewTrip />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/itinerary" element={<Navigate to="/trips" />} />
            <Route path="/itinerary/:id" element={<ItineraryView />} />
            <Route path="/itinerary/:id/edit" element={<ItineraryBuilder />} />
            <Route path="/itinerary/:id/budget" element={<BudgetBreakdown />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/calendar" element={<CalendarView />} />
          </Route>
          
          {/* Public / Unauthenticated Routes */}
          <Route path="/shared/:id" element={<SharedItinerary />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
