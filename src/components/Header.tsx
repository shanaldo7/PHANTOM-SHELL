import React from 'react';
import { Terminal, Volume2, VolumeX, Eye, EyeOff, Settings, RotateCcw, MessageSquare } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  fxEnabled: boolean;
  setFxEnabled: (v: boolean) => void;
  onOpenSettings: () => void;
  onResetStory: () => void;
  onOpenDialogue?: () => void;
  ghostMood: string;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  setSoundEnabled,
  fxEnabled,
  setFxEnabled,
  onOpenSettings,
  onResetStory,
  onOpenDialogue,
  ghostMood
}) => {
  return (
    <header className="h-14 bg-[#090E12] border-b border-[#7CFF9B]/20 px-4 flex items-center justify-between select-none z-30">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-[#7CFF9B]/10 border border-[#7CFF9B]/30 flex items-center justify-center">
          <Terminal className="w-5 h-5 text-[#7CFF9B]" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-widest text-[#7CFF9B] flex items-center space-x-2">
            <span>PHANTOM SHELL</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 font-mono">
              v6.14
            </span>
          </div>
          <div className="text-[10px] text-[#8A9AA7] tracking-wider">
            SESSION: 8492-B // GHOST MOOD: <span className="text-[#A78BFA] uppercase">{ghostMood}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {onOpenDialogue && (
          <button
            onClick={onOpenDialogue}
            title="Open Spectral Dialogue Link"
            className="px-2.5 py-1 bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 text-[#A78BFA] border border-[#A78BFA]/50 rounded text-xs flex items-center space-x-1.5 transition-colors cursor-pointer animate-pulse"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">SPEAK TO GHOST</span>
          </button>
        )}

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Disable Audio' : 'Enable Audio'}
          className="p-2 rounded hover:bg-[#7CFF9B]/10 text-[#8A9AA7] hover:text-[#7CFF9B] transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#7CFF9B]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setFxEnabled(!fxEnabled)}
          title={fxEnabled ? 'Disable CRT Effects' : 'Enable CRT Effects'}
          className="p-2 rounded hover:bg-[#7CFF9B]/10 text-[#8A9AA7] hover:text-[#7CFF9B] transition-colors cursor-pointer"
        >
          {fxEnabled ? <Eye className="w-4 h-4 text-[#58D9FF]" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenSettings}
          title="Settings"
          className="p-2 rounded hover:bg-[#7CFF9B]/10 text-[#8A9AA7] hover:text-[#7CFF9B] transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onResetStory}
          title="Reset Story"
          className="p-2 rounded hover:bg-[#FF5263]/10 text-[#8A9AA7] hover:text-[#FF5263] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
