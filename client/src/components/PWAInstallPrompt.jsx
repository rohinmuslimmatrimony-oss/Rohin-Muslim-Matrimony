import React, { useEffect, useState } from 'react';

/**
 * PWAInstallPrompt - Shows a custom install banner on mobile devices
 * with smart fallbacks for iOS and browsers where beforeinstallprompt is not ready.
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if the app is already running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      return; // Do not show anything if already installed and running as app
    }

    // 2. Detect if device is iOS (iPhone/iPad)
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // 3. Detect if user is on mobile/tablet screen size or user agent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

    // Show the banner if on mobile, not standalone, and not dismissed in this session
    if (isMobile && !sessionStorage.getItem('pwa_dismissed')) {
      setShowBanner(true);
    }

    // 4. Capture the browser's native beforeinstallprompt event
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      if (isMobile && !sessionStorage.getItem('pwa_dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the native browser install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // If native prompt is not available (like iOS or other browsers/settings), show custom guidance modal
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  // Don't show if hidden or already dismissed this session
  if (!showBanner || sessionStorage.getItem('pwa_dismissed')) return null;

  return (
    <>
      {/* Bottom Sticky Install Banner */}
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
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
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
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>
              Install app for quick access & chat notifications!
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

      {/* Instructional Popup Modal (For iOS or Fallback Devices) */}
      {showInstructions && (
        <div
          onClick={() => setShowInstructions(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.25s ease-out forwards',
            fontFamily: '"Outfit", sans-serif',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#240205',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: '24px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              color: '#fff',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              ✕
            </button>

            <h3 style={{ margin: '0 0 16px 0', color: '#d4af37', fontSize: '18px', fontWeight: 700, textAlign: 'center' }}>
              How to Install App
            </h3>

            {isIOS ? (
              // iOS Safari Instructions
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: 1.5 }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: '13px' }}>
                  Safari browser does not support direct installation. Follow these simple steps:
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ background: '#d4af37', color: '#1d0306', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '12px' }}>1</div>
                  <div>
                    Tap the <strong>Share</strong> button <span style={{ fontSize: '18px', verticalAlign: 'middle' }}>⎋</span> or <span style={{ fontSize: '18px', verticalAlign: 'middle' }}>📤</span> at the bottom/top of Safari.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ background: '#d4af37', color: '#1d0306', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '12px' }}>2</div>
                  <div>
                    Scroll down and select <strong>Add to Home Screen</strong> <span style={{ fontSize: '18px', color: '#d4af37', verticalAlign: 'middle' }}>⊞</span>.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ background: '#d4af37', color: '#1d0306', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '12px' }}>3</div>
                  <div>
                    Tap <strong>Add</strong> in the top-right corner to complete.
                  </div>
                </div>
              </div>
            ) : (
              // Android Chrome / Firefox Fallback Instructions
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', lineHeight: 1.5 }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: '13px' }}>
                  If the automatic prompt does not open, try these steps:
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ background: '#d4af37', color: '#1d0306', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '12px' }}>1</div>
                  <div>
                    Tap the browser menu <strong>(⋮ or ☰)</strong> in the top-right corner.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ background: '#d4af37', color: '#1d0306', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '12px' }}>2</div>
                  <div>
                    Select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ background: '#d4af37', color: '#1d0306', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '12px' }}>3</div>
                  <div>
                    Confirm the prompt to pin it to your desktop.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInstructions(false)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginTop: '20px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;

