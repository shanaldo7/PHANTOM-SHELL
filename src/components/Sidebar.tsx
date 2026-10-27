import React from 'react';
import { Terminal, Target, Database, User, BookOpen, Scroll, Award, Settings as SettingsIcon, Box, Compass, LayoutGrid, Grid, Gamepad2 } from 'lucide-react';

export type ActiveTab = 'matrix2d' | 'tilesets' | 'terminal' | 'missions' | 'fragments' | 'ghost' | 'codex' | 'lore' | 'achievements' | 'settings' | 'room3d' | 'map';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  fragmentCount: number;
  unlockedAchievementsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  fragmentCount,
  unlockedAchievementsCount
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'matrix2d', label: 'Surveillance Matrix (2D)', icon: <LayoutGrid className="w-4 h-4 text-[#00E5FF]" /> },
    { id: 'tilesets', label: 'Retro Asset Manager', icon: <Grid className="w-4 h-4 text-[#00E5FF]" />, badge: '16/32px' },
    { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
    { id: 'room3d', label: 'Haunted Room (2D)', icon: <Gamepad2 className="w-4 h-4 text-[#A78BFA]" /> },
    { id: 'map', label: 'World Map', icon: <Compass className="w-4 h-4 text-[#58D9FF]" /> },
    { id: 'missions', label: 'Missions', icon: <Target className="w-4 h-4" /> },
    { id: 'fragments', label: 'Fragments', icon: <Database className="w-4 h-4" />, badge: `${fragmentCount}/4` },
    { id: 'ghost', label: 'Ghost Profile', icon: <User className="w-4 h-4" /> },
    { id: 'codex', label: 'Command Codex', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'lore', label: 'Lore Archive', icon: <Scroll className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" />, badge: unlockedAchievementsCount },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#090E12] border-r border-[#7CFF9B]/20 flex flex-col select-none z-20">
      <div className="p-3 text-[10px] font-mono text-[#8A9AA7] uppercase tracking-widest border-b border-[#7CFF9B]/10">
        Navigation Matrix
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#7CFF9B]/15 text-[#7CFF9B] border border-[#7CFF9B]/40 shadow-[0_0_10px_rgba(124,255,155,0.15)]'
                  : 'text-[#8A9AA7] hover:bg-[#7CFF9B]/5 hover:text-[#7CFF9B]'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded bg-[#58D9FF]/10 text-[#58D9FF] text-[10px] border border-[#58D9FF]/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#7CFF9B]/10 text-[10px] text-[#8A9AA7] text-center font-mono">
        PID: 0000 // STATUS: ONLINE
      </div>
    </aside>
  );
};
