import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileCompletenessBanner from './components/ProfileCompletenessBanner';

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
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  const { user, profile } = useContext(AuthContext);
  const location = useLocation();

  // Calculate completeness to determine if banner is shown
  const getCompleteness = () => {
    if (!profile) return 0;
    let score = 20;
    if (profile.waliContact && profile.waliContact.trim() !== '') score += 25;
    if (profile.familyDetails && (profile.familyDetails.fatherOccupation || profile.familyDetails.motherOccupation || profile.familyDetails.siblingsCount !== undefined)) score += 25;
    if (profile.customCareerDetails && (profile.customCareerDetails.degree || profile.customCareerDetails.occupation)) score += 30;
    return score;
  };

  const completeness = getCompleteness();
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
