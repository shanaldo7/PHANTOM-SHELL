import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const bootLogs = [
    "PHANTOM SHELL // SYSTEM INITIALIZATION v6.14",
    "Loading memory fragments...",
    "Restoring abandoned processes...",
    "Mounting virtual filesystem (/dev/phantom0)...",
    "Establishing secure socket layer (Port 8492)...",
    "Unknown process detected.",
    "PID: 0000",
    "Identity: UNRESOLVED",
    "--------------------------------------------------",
    "GHOST: You're finally here.",
    "GHOST: Please don't open the directory named 'the_last_user'.",
    "--------------------------------------------------",
    "SYSTEM: Ready for visitor input..."
  ];

  useEffect(() => {
    if (currentIndex < bootLogs.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, bootLogs[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex > 8 ? 600 : 350);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 bg-[#05070A] text-[#7CFF9B] font-mono p-8 flex flex-col justify-between z-50 select-none overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60"></div>
      
      <div className="max-w-3xl w-full mx-auto space-y-2 z-10 my-auto">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#7CFF9B]/20">
          <Terminal className="w-8 h-8 text-[#7CFF9B] animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest text-[#58D9FF]">PHANTOM SHELL // BOOT SEQUENCE</h1>
        </div>

        <div className="space-y-1.5 min-h-[320px]">
          {lines.map((line, idx) => (
            <div key={idx} className={`text-sm md:text-base ${line.startsWith('GHOST:') ? 'text-[#A78BFA] font-semibold animate-pulse' : line.startsWith('SYSTEM:') ? 'text-[#FFBF69]' : 'text-[#7CFF9B]/90'}`}>
              {line}
            </div>
          ))}
          {currentIndex < bootLogs.length && (
            <span className="inline-block w-2.5 h-5 bg-[#7CFF9B] animate-ping ml-1"></span>
          )}
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto flex justify-between items-center z-10 pt-4 border-t border-[#7CFF9B]/20">
        <div className="text-xs text-[#8A9AA7]">
          Hacktoberfest 2026 Open-Source AI Challenge // Week 4
        </div>
        <button
          onClick={onComplete}
          className="px-4 py-2 border border-[#7CFF9B]/40 hover:bg-[#7CFF9B]/20 text-[#7CFF9B] text-xs font-mono uppercase tracking-widest transition-all cursor-pointer"
        >
          [ Skip Boot Sequence ]
        </button>
      </div>
    </div>
  );
};
