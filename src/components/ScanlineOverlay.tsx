import React from 'react';

interface ScanlineOverlayProps {
  enabled: boolean;
  ghostMood?: string;
}

export const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({ enabled, ghostMood = 'dormant' }) => {
  if (!enabled) return null;

  // Determine distortion intensity based on ghost mood
  const isHighTension = ['unstable', 'afraid', 'revealing', 'uneasy'].includes(ghostMood);
  const animDuration = isHighTension ? '2.5s' : '6s';
  const skewAmount = isHighTension ? '0.8deg' : '0.2deg';

  return (
    <div className={`absolute inset-0 pointer-events-none z-50 overflow-hidden select-none ${isHighTension ? 'animate-screen-ripple' : ''}`}>
      {/* Moving scanner beam */}
      <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#7CFF9B]/15 to-transparent animate-scanline opacity-75"></div>
      
      <style>{`
        @keyframes scanlineBeam {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .animate-scanline {
          animation: scanlineBeam 6s linear infinite;
        }

        @keyframes screenRipple {
          0% {
            transform: perspective(500px) rotateX(0deg) skewX(0deg);
          }
          25% {
            transform: perspective(500px) rotateX(0.15deg) skewX(${skewAmount});
          }
          50% {
            transform: perspective(500px) rotateX(-0.1deg) skewX(-${skewAmount});
          }
          75% {
            transform: perspective(500px) rotateX(0.1deg) skewX(calc(${skewAmount} * 0.5));
          }
          100% {
            transform: perspective(500px) rotateX(0deg) skewX(0deg);
          }
        }

        .animate-screen-ripple {
          animation: screenRipple ${animDuration} ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
