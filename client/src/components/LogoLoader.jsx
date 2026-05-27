import React, { useState, useEffect } from 'react';
import logo3 from '../assets/logo.png';

const LogoLoader = ({ fullScreen = false, text = 'Loading Blessings...' }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let active = true;
    const runTyping = async () => {
      while (active) {
        setDisplayedText('');
        for (let i = 0; i <= text.length; i++) {
          if (!active) return;
          setDisplayedText(text.slice(0, i));
          await new Promise((r) => setTimeout(r, 60)); // typing speed
        }
        await new Promise((r) => setTimeout(r, 2000)); // hold completed text
      }
    };
    runTyping();
    return () => {
      active = false;
    };
  }, [text]);

  // Sizing definitions based on fullScreen prop
  const auraSize = fullScreen ? 'w-40 h-40 md:w-56 md:h-56' : 'w-28 h-28 md:w-36 md:h-36';
  const ringSize = fullScreen ? 'w-36 h-36 md:w-48 md:h-48' : 'w-24 h-24 md:w-32 md:h-32';
  const innerSize = fullScreen ? 'w-28 h-28 md:w-38 md:h-38' : 'w-20 h-20 md:w-28 md:h-28';
  const logoHeight = fullScreen ? 'h-16 md:h-24' : 'h-12 md:h-16';
  const fontSize = fullScreen ? 'text-sm md:text-base font-bold' : 'text-xs md:text-sm font-semibold';

  const loaderContent = (
    <div className="flex flex-col items-center justify-center text-center p-8 select-none">
      <style>{`
        /* Animate the horizontal image crop reveal using clip-path to prevent squishing */
        @keyframes drawLogo {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 1;
          }
          70% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
          }
          85% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
          }
          95%, 100% {
            clip-path: inset(0 0% 0 0);
            opacity: 0;
          }
        }

        /* Animate the pen tip horizontally */
        @keyframes drawPenTip {
          0% {
            left: 0%;
            opacity: 1;
          }
          70% {
            left: 100%;
            opacity: 1;
          }
          75%, 85% {
            left: 100%;
            opacity: 0;
          }
          95%, 100% {
            left: 0%;
            opacity: 0;
          }
        }

        /* Bouncing pen tip stroke motion vertically */
        @keyframes penMoveY {
          0%, 100% {
            top: 15%;
          }
          20% {
            top: 85%;
          }
          40% {
            top: 25%;
          }
          60% {
            top: 75%;
          }
          80% {
            top: 35%;
          }
        }
        
        .animated-logo-container {
          animation: drawLogo 4s infinite ease-in-out;
        }

        .animated-pen-tip {
          animation: drawPenTip 4s infinite ease-in-out;
        }

        .pen-stroke-y {
          animation: penMoveY 0.4s infinite ease-in-out;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink {
          animation: blink 0.8s infinite;
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* Glowing pulsing aura in the background */}
        <div className={`absolute ${auraSize} bg-gold-500/10 rounded-full filter blur-xl animate-pulse`}></div>

        {/* Slow rotating ring with accent gradient */}
        <div className={`absolute ${ringSize} border-2 border-dashed border-gold-500/30 rounded-full animate-spin`} style={{ animationDuration: '8s' }}></div>

        {/* Faster outer loading ring */}
        <div className={`absolute ${ringSize} border-4 border-transparent border-t-gold-500 rounded-full animate-spin`}></div>

        {/* Inner static border */}
        <div className={`absolute ${innerSize} border border-gold-500/20 rounded-full`}></div>

        {/* Logo Container for Drawing Reveal */}
        <div className={`relative z-10 flex items-center justify-center ${fullScreen ? 'w-48 h-16 md:w-72 md:h-24' : 'w-36 h-12 md:w-48 md:h-16'}`}>
          {/* Faint logo placeholder to reserve aspect ratio and layout space */}
          <img 
            src={logo3} 
            alt="Rohin Matrimony Logo Template" 
            className="w-full h-full object-contain opacity-0 pointer-events-none"
          />

          {/* The drawing animated layer */}
          <div className="absolute inset-0 w-full h-full overflow-hidden animated-logo-container">
            {/* The actual visible logo image */}
            <img 
              src={logo3} 
              alt="Rohin Matrimony Loading" 
              className="w-full h-full object-contain" 
            />
          </div>
          {/* Golden Bouncing Pen-Tip (Sparkle) */}
          <div className="absolute top-0 left-0 h-full w-full pointer-events-none z-20">
            <div className="absolute h-full w-0.5 animated-pen-tip">
              <div 
                className="absolute w-3 h-3 bg-white rounded-full pen-stroke-y"
                style={{
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 12px #D4AF37, 0 0 4px #ffffff, 0 0 20px #D4AF37'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading message removed as per user request */}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 min-h-screen w-full bg-cream-50 flex items-center justify-center z-[9999]">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12 px-4">
      {loaderContent}
    </div>
  );
};

export default LogoLoader;
