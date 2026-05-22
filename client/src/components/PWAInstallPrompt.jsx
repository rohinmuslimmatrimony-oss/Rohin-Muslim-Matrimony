import React, { useEffect, useState } from 'react';

/**
 * PWAInstallPrompt - Displays a custom install banner on mobile
 * ONLY when direct native installation is supported and ready.
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Check if the app is already running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      return;
    }

    // 2. Capture the browser's native beforeinstallprompt event (only fires on direct install-supporting browsers)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if user hasn't dismissed it in this session
      if (!sessionStorage.getItem('pwa_dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the native browser install prompt directly
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  // Don't show if banner is off, already dismissed, or deferredPrompt is not available
  if (!showBanner || !deferredPrompt || sessionStorage.getItem('pwa_dismissed')) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #1d0306 0%, #3e040a 100%)',
        borderTop: '1px solid rgba(212,175,55,0.35)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
        animation: 'slideUp 0.3s ease-out forwards',
        fontFamily: '"Outfit", sans-serif',
      }}
    >
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>

      {/* Left: App Logo + Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <img
          src="/icons/icon-192x192.png"
          alt="App Icon"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '1px solid rgba(212,175,55,0.2)'
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: '#ffffff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
            Rohin Muslim Matrimony
          </p>
        </div>
      </div>

      {/* Right: Buttons */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.75)',
            borderRadius: 20,
            padding: '6px 12px',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #d4af37, #aa841c)',
            border: 'none',
            color: '#1d0306',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 2px 12px rgba(212,175,55,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Install App
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;


