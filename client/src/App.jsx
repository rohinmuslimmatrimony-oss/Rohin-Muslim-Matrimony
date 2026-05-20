import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileCompletenessBanner from './components/ProfileCompletenessBanner';
import LogoLoader from './components/LogoLoader';

// Page Imports
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SearchProfiles from './pages/SearchProfiles';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import InterestsPage from './pages/InterestsPage';
import PlansPage from './pages/PlansPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Guard (Must be logged in)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LogoLoader fullScreen text="Verifying Credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Guard (Must be admin)
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LogoLoader fullScreen text="Checking Permissions..." />;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { user, profile, loading, getCompleteness } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LogoLoader fullScreen text="Loading Blessings..." />;
  }

  const completeness = getCompleteness().score;
  const showBanner = user && user.role !== 'admin' && completeness < 100 && !['/login', '/register', '/edit-profile', '/admin'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-cream-50 text-slate-800">
      {/* Toast notifications handler */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#064e3b',
            color: '#fff',
            fontFamily: '"Outfit", sans-serif',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#d4af37',
              secondary: '#064e3b',
            },
          },
        }}
      />
      
      {/* Sticky Header Wrapper (Navbar + Completeness Banner) */}
      <header className="sticky top-0 z-50 w-full">
        <Navbar />
        <div className="absolute w-full top-full left-0 -z-10">
          <ProfileCompletenessBanner />
        </div>
      </header>

      {/* Main Routed Views - Pushed down when the completeness banner is active */}
      <main className={`flex-grow transition-all duration-500 ${showBanner ? 'pt-[68px] sm:pt-[36px]' : 'pt-0'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<PlansPage />} />

          {/* Authenticated Member Views */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchProfiles /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/interests" element={<ProtectedRoute><InterestsPage /></ProtectedRoute>} />

          {/* Admin Management Views */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
