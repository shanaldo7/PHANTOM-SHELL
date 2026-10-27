import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, X, Terminal, Hand, AlertTriangle, ShieldCheck } from 'lucide-react';

interface GhostlyMirrorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal: () => void;
  onWipeCondensation?: () => void;
}

export const GhostlyMirrorOverlay: React.FC<GhostlyMirrorOverlayProps> = ({
  isOpen,
  onClose,
  onOpenTerminal,
  onWipeCondensation
}) => {
  const [wiped, setWiped] = useState(false);
  const [stareDeeper, setStareDeeper] = useState(false);
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setWiped(false);
      setStareDeeper(false);
      return;
    }
    // Random subtle glitch flicker
    const interval = setInterval(() => {
      setFlicker(prev => !prev);
    }, 2800);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 select-none font-mono">
      {/* Antique Tarnished Mirror Frame Container */}
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[750px] bg-[#070b10] border-4 border-[#3d2817] rounded-xl shadow-[0_0_50px_rgba(167,139,250,0.35)] flex flex-col overflow-hidden">
        
        {/* Mirror Header / Spec */}
        <div className="h-10 bg-[#160f08] border-b border-[#3d2817] px-4 flex items-center justify-between text-xs text-[#a78bfa] shrink-0">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#a78bfa] animate-pulse" />
            <span className="font-bold tracking-widest uppercase">
              TARNISHED REFLECTION // THE GIRL IN THE MIRROR
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/40">
              STORY FLAG ACTIVE
            </span>
            <button
              onClick={onClose}
              className="text-[#8a9aa7] hover:text-[#ff5263] transition-colors p-1"
              title="Close Inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Distorted Ghostly Reflection Surface */}
        <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#090f18] via-[#05070a] to-[#0d0914]">
          {/* Glass grain and tarnished vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(167,139,250,0.04)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />

          {/* Mirrored Distorted Room Visuals (Inverted Room Perspective) */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${stareDeeper ? 'scale-105 filter hue-rotate-90' : ''}`}>
            
            {/* Background: Inverted Room Silhouette */}
            <div className="absolute inset-0 opacity-40">
              {/* Mirrored Desk & CRT on the opposite side */}
              <div className="absolute right-12 bottom-12 w-64 h-40 bg-[#111822] border-t-2 border-[#58d9ff]/30 rounded">
                {/* Glowing Mirrored CRT */}
                <div className="absolute -top-24 left-10 w-28 h-24 bg-[#1a2332] border border-[#58d9ff]/40 flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(255,82,99,0.4)]">
                  <div className="text-[8px] text-[#ff5263] leading-none text-center font-bold">
                    OVERWRITE
                    <br />
                    IN PROGRESS
                    <br />
                    PID 0000
                  </div>
                </div>
              </div>

              {/* Distorted Doorway in the reflection */}
              <div className="absolute left-16 top-16 w-28 h-72 border-2 border-dashed border-[#a78bfa]/30 bg-black/60">
                <div className="absolute bottom-4 left-2 text-[9px] text-[#8a9aa7]/50 italic">
                  Corridor 0
                </div>
              </div>

              {/* Rain Streaks in reverse */}
              <div className="absolute left-1/3 top-8 w-44 h-48 border border-[#58d9ff]/20 bg-blue-950/20 p-2 overflow-hidden">
                <div className="text-[9px] text-[#58d9ff]/40">
                  ||||||||||||||||
                  <br />
                  ||||||||||||||||
                </div>
              </div>
            </div>

            {/* Central Entity: THE GIRL IN THE MIRROR (Pixelated Supernatural Specter) */}
            <div className="relative z-20 flex flex-col items-center select-none">
              {/* Pixel Art Ghost Apparition */}
              <div className="relative mb-3 flex flex-col items-center">
                {/* Aura Glow */}
                <div className="absolute -inset-6 bg-[#a78bfa]/20 rounded-full blur-xl animate-pulse" />

                {/* Head & Hair */}
                <div className="relative w-20 h-24 bg-gradient-to-b from-[#181124] to-[#2a2238] rounded-t-2xl border-t border-l border-r border-[#a78bfa]/60 flex flex-col items-center pt-6 shadow-2xl">
                  {/* Pale Face Mask */}
                  <div className="w-12 h-14 bg-[#e8e4f0] rounded-b-xl border border-[#a78bfa]/40 flex flex-col items-center pt-3 relative shadow-inner">
                    {/* Hollow Pixel Eyes */}
                    <div className="flex space-x-3 mb-2">
                      <div className="w-2.5 h-3 bg-[#0d0714] rounded-sm animate-ping" />
                      <div className="w-2.5 h-3 bg-[#0d0714] rounded-sm" />
                    </div>
                    {/* Tear / Static streak */}
                    <div className="w-1 h-4 bg-[#58d9ff]/80 rounded-full" />
                  </div>
                </div>

                {/* Spectral Shroud / Gown */}
                <div className="w-32 h-44 bg-gradient-to-b from-[#2a2238]/90 via-[#1d1629]/80 to-transparent border-l border-r border-[#a78bfa]/40 clip-path-polygon flex flex-col items-center pt-2">
                  <div className="text-[10px] text-[#a78bfa]/60 tracking-widest mt-4">
                    [WITNESS_1999]
                  </div>
                  <div className="text-[9px] text-[#8a9aa7]/40 mt-1">
                    SECTOR 7 PRESERVED
                  </div>
                </div>
              </div>

              {/* Haunting Dialogue etched into the mirror */}
              <div className="max-w-md bg-[#05070a]/85 border border-[#a78bfa]/50 p-4 rounded-lg text-center space-y-2 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.9)]">
                <p className="text-sm md:text-base font-bold text-[#e8e4f0] leading-snug tracking-wide">
                  &ldquo;THE ECHO IS LYING. DON&rsquo;T RESTORE THE FINAL BUFFER.&rdquo;
                </p>
                <p className="text-xs text-[#a78bfa] leading-relaxed">
                  &ldquo;He was never alone in 1999. Dr. Thorne merged with the system to erase what we saw. Every time you type &lsquo;restore&rsquo;, my voice gets quieter.&rdquo;
                </p>

                {wiped && (
                  <div className="pt-2 border-t border-[#a78bfa]/30 text-xs text-[#58d9ff] font-mono animate-fadeIn">
                    &ldquo;Look behind the clock at 03:14... The secret key is hidden in <span className="text-[#7cff9b]">/hidden/.last_signal</span>.&rdquo;
                  </div>
                )}
              </div>
            </div>

            {/* Condensation & Moisture overlay */}
            {!wiped && (
              <div className="absolute inset-0 bg-[#58d9ff]/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                <div className="text-xs text-[#8a9aa7]/50 font-mono tracking-widest border border-dashed border-[#58d9ff]/30 px-3 py-1 rounded bg-black/40">
                  [ CONDENSATION ON GLASS ]
                </div>
              </div>
            )}
          </div>

          {/* In-Engine Discovery Notification Banner */}
          <div className="absolute top-4 left-4 z-30 max-w-sm bg-[#090e12]/90 border-l-4 border-[#a78bfa] p-2.5 rounded text-xs space-y-1 shadow-lg">
            <div className="flex items-center space-x-1.5 text-[#a78bfa] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>STORY FLAG UNLOCKED</span>
            </div>
            <div className="text-[11px] text-[#7cff9b]">
              &bull; NarrativeEngine flag: <strong>&apos;The Girl in the Mirror&apos;</strong>
            </div>
            <div className="text-[10px] text-[#8a9aa7]">
              &bull; Evidence recorded to Journal: <em>ev_mirror</em> (+25% Trust)
            </div>
          </div>
        </div>

        {/* Bottom Interactive Mirror Bar */}
        <div className="h-16 bg-[#110c07] border-t border-[#3d2817] px-4 flex items-center justify-between gap-2 shrink-0 overflow-x-auto text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setWiped(true);
                onWipeCondensation?.();
              }}
              disabled={wiped}
              className={`px-3 py-1.5 rounded border text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                wiped
                  ? 'bg-transparent text-[#8a9aa7]/50 border-[#8a9aa7]/20 cursor-default'
                  : 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/40 hover:bg-[#a78bfa]/30'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span>{wiped ? 'Glass Cleared' : 'Wipe Condensation'}</span>
            </button>

            <button
              onClick={() => setStareDeeper(prev => !prev)}
              className="px-3 py-1.5 bg-[#58d9ff]/15 hover:bg-[#58d9ff]/25 text-[#58d9ff] border border-[#58d9ff]/30 rounded text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{stareDeeper ? 'Normalize Gaze' : 'Stare Deeper'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenTerminal();
              }}
              className="px-3.5 py-1.5 bg-[#7cff9b]/20 hover:bg-[#7cff9b]/30 text-[#7cff9b] border border-[#7cff9b]/40 rounded text-xs font-mono flex items-center space-x-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Open Terminal</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-[#e8e4f0] border border-white/20 rounded text-xs font-mono cursor-pointer"
            >
              Step Back
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
