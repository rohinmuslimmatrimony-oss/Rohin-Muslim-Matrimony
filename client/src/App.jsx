import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileCompletenessBanner from './components/ProfileCompletenessBanner';
import BottomNavigation from './components/BottomNavigation';
import LogoLoader from './components/LogoLoader';
import SimpleSpinner from './components/SimpleSpinner';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Page Imports
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SearchProfiles from './pages/SearchProfiles';
import UserProfile from './pages/UserProfile';
import MobileChatPage from './components/MobileChatPage';
import MobileChatRoom from './components/MobileChatRoom';
import EditProfile from './pages/EditProfile';
import MyProfilePage from './pages/MyProfilePage';
import InterestsPage from './pages/InterestsPage';
import PlansPage from './pages/PlansPage';
import AdminDashboard from './pages/AdminDashboard';
import KycVerificationPage from './pages/KycVerificationPage';
import PaymentInfoPage from './pages/PaymentInfoPage';
import BlockedUsersPage from './pages/BlockedUsersPage';
import SupportPage from './pages/SupportPage';
import PrivacySettings from './pages/PrivacySettings';

// Protected Route Guard (Must be logged in)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <SimpleSpinner fullScreen />;
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
    return <SimpleSpinner fullScreen />;
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
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      return <SimpleSpinner fullScreen />;
    }
    return <LogoLoader fullScreen text="Loading Blessings..." />;
  }

  const completeness = getCompleteness().score;
  const showBanner = user && user.role !== 'admin' && completeness < 100 && !['/login', '/register', '/edit-profile', '/admin'].includes(location.pathname);
  const showBottomNav = user && user.role !== 'admin' && !['/login', '/register', '/admin'].includes(location.pathname);

  // Dynamic bottom padding for main container to prevent overlap of sticky bottom components
  let pbClass = 'pb-0';
  if (showBottomNav && showBanner) {
    pbClass = 'pb-24 md:pb-10'; // Both mobile bottom nav and banner active
  } else if (showBottomNav) {
    pbClass = 'pb-14 md:pb-0';  // Only mobile bottom nav active
  } else if (showBanner) {
    pbClass = 'pb-10';          // Only banner active
  }

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

      {/* PWA Install Banner - shown on mobile when app is installable */}
      <PWAInstallPrompt />

      {/* Sticky Header Wrapper (Navbar) */}
      <header className={`sticky top-0 z-50 w-full ${(location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') ? 'hidden md:block' : ''}`}>
        <Navbar />
      </header>


      {/* Main Routed Views - padded dynamically based on active floating bottom panels */}
      <main className={`flex-grow transition-all duration-300 ${pbClass}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/plans" element={<PlansPage />} />

          {/* Authenticated Member Views */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchProfiles /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/interests" element={<Navigate to="/activity" replace />} />
          <Route path="/activity" element={<ProtectedRoute><InterestsPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><div className="block md:hidden"><MobileChatPage /></div><div className="hidden md:block text-center mt-20 font-bold">Please use the Activity tab for desktop chat.</div></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><div className="block md:hidden"><MobileChatRoom /></div></ProtectedRoute>} />
          <Route path="/verify-identity" element={<ProtectedRoute><KycVerificationPage /></ProtectedRoute>} />
          <Route path="/payment-info" element={<ProtectedRoute><PaymentInfoPage /></ProtectedRoute>} />
          <Route path="/blocked-users" element={<ProtectedRoute><BlockedUsersPage /></ProtectedRoute>} />
          <Route path="/privacy-settings" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

          {/* Admin Management Views */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Profile Completeness Floating Banner (sticky bottom) */}
      <ProfileCompletenessBanner />

      {/* Bottom Sticky Navigation for Mobile devices */}
      <BottomNavigation />

      {/* Footer */}
      <div className="hidden md:block">
        {location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/admin' && <Footer />}
      </div>
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
