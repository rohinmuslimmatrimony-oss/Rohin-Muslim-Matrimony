import React, { useEffect, useState } from 'react';

/**
 * PWAInstallPrompt - Shows a custom install banner on mobile
 * when the browser fires the beforeinstallprompt event.
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the browser's default mini-infobar
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // Show the native install dialog
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (!showBanner || sessionStorage.getItem('pwa_dismissed')) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #1a0002 0%, #3d0008 100%)',
        borderTop: '1px solid rgba(212,175,55,0.3)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Icon + Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <img
          src="/icons/icon-192x192.png"
          alt="App Icon"
          style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
            Rohin Muslim Matrimony
          </p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>
            Install app for better experience
          </p>
        </div>
      </div>

      {/* Right: Buttons */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)',
            borderRadius: 20,
            padding: '6px 12px',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #e21b5a, #b01244)',
            border: 'none',
            color: '#fff',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 2px 12px rgba(226,27,90,0.4)',
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
