import React, { useState } from 'react';
import {
  Compass,
  Key,
  Image as ImageIcon,
  HardDrive,
  Clock,
  Ticket,
  FileText,
  Film,
  Cpu,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { GhostCharacterId } from '../engine/ghostChatService';

interface RetroControlDeckProps {
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onOpenDialogue: (charId?: GhostCharacterId) => void;
  onTriggerSound?: (type: 'click' | 'ghost' | 'error' | 'success') => void;
  terminalLogs: string[];
  onTerminalCommand: (cmd: string) => void;
  onInspectItem: (itemName: string) => void;
  onOpenFullRoom?: (roomId: string) => void;
}

export const RetroControlDeck: React.FC<RetroControlDeckProps> = ({
  currentRoomId,
  onSelectRoom,
  onOpenDialogue,
  onTriggerSound,
  terminalLogs,
  onTerminalCommand,
  onInspectItem,
  onOpenFullRoom
}) => {
  const [termInput, setTermInput] = useState('');

  // Handle terminal submit
  const handleTermSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    onTriggerSound?.('click');
    onTerminalCommand(termInput.trim());
    setTermInput('');
  };

  // Node positions on the tactical World Map schematic
  const mapNodes = [
    { id: 'corridor', code: '01', x: 26, y: 22, unlocked: true },
    { id: 'bedroom', code: '02', x: 14, y: 44, unlocked: true },
    { id: 'apartment', code: '03', x: 8, y: 64, unlocked: true },
    { id: 'hospital', code: '05', x: 56, y: 22, unlocked: true },
    { id: 'cinema', code: '07', x: 18, y: 78, unlocked: true },
    { id: 'station', code: '08', x: 38, y: 44, unlocked: true },
    { id: 'mirror_gallery', code: '09', x: 38, y: 64, unlocked: true },
    { id: 'hotel', code: '12', x: 32, y: 84, unlocked: true },
    { id: 'rooftop', code: '13', x: 48, y: 78, unlocked: true },
    { id: 'memory_garden', code: '14', x: 56, y: 64, unlocked: true },
    { id: 'morpheus_core', code: '15', x: 52, y: 92, unlocked: true },
    { id: 'secret', code: '?', x: 68, y: 52, unlocked: false, isSecret: true }
  ];

  const inventoryItems = [
    { name: 'Old Key', icon: Key, color: '#f59e0b', desc: 'A heavy brass key stamped with 8492.' },
    { name: 'Photograph', icon: ImageIcon, color: '#60a5fa', desc: 'A faded Polaroid showing three figures before the facility.' },
    { name: 'Memory Fragment', icon: HardDrive, color: '#a78bfa', desc: 'A crystalline ROM wafer containing encoded neural memories.' },
    { name: 'Broken Watch', icon: Clock, color: '#f87171', desc: 'Hands frozen rigidly at 03:14 AM.' },
    { name: 'Train Ticket', icon: Ticket, color: '#34d399', desc: 'One-way passage from Sector 8 to Morpheus Core.' },
    { name: 'Hospital Record', icon: FileText, color: '#38bdf8', desc: 'Case notes on Patient #404: Thorne, Walter.' },
    { name: 'Film Reel', icon: Film, color: '#fb923c', desc: '16mm archival reel labeled "TEST RUN - OCTOBER 1999".' },
    { name: 'Circuit Board', icon: Cpu, color: '#4ade80', desc: 'A scorched logic card extracted from the generator relay.' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2 bg-[#040609] border-t border-[#122230] text-xs font-mono h-[280px]">
      {/* 1. WORLD MAP */}
      <div className="bg-[#060a0f] border border-[#142838] p-2 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#142838] pb-1 mb-1">
          <span className="font-bold tracking-wider text-[#00e5ff] text-[11px]">WORLD MAP</span>
          <span className="text-[9px] text-[#486581]">SCHEMATIC V2</span>
        </div>

        {/* Schematic Canvas / SVG Graph */}
        <div className="relative flex-1 bg-[#03060a] border border-[#0d1b26] p-1 overflow-hidden">
          {/* Wireframe connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <line x1="26%" y1="22%" x2="56%" y2="22%" stroke="#00e5ff" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="26%" y1="22%" x2="38%" y2="44%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="26%" y1="22%" x2="14%" y2="44%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="14%" y1="44%" x2="8%" y2="64%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="38%" y1="44%" x2="38%" y2="64%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="38%" y1="64%" x2="56%" y2="64%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="8%" y1="64%" x2="18%" y2="78%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="18%" y1="78%" x2="32%" y2="84%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="38%" y1="64%" x2="48%" y2="78%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="32%" y1="84%" x2="52%" y2="92%" stroke="#00e5ff" strokeWidth="1" />
            <line x1="56%" y1="64%" x2="68%" y2="52%" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
          </svg>

          {/* Node buttons */}
          {mapNodes.map(node => {
            const isCur = currentRoomId.includes(node.id) || (node.id === 'corridor' && currentRoomId === 'room_01');
            return (
              <button
                key={node.id}
                onClick={() => {
                  onTriggerSound?.('click');
                  onSelectRoom(node.id);
                }}
                title={`Sector ${node.code}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-5 flex items-center justify-center text-[9px] font-bold border transition-all ${
                  isCur
                    ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.6)] animate-pulse'
                    : node.isSecret
                    ? 'bg-[#ef4444]/10 border-[#ef4444]/60 text-[#ef4444]'
                    : 'bg-[#0a141e] border-[#1f3a52] text-[#8fa3b8] hover:border-[#00e5ff] hover:text-[#00e5ff]'
                }`}
              >
                {node.code}
              </button>
            );
          })}

          {/* Compass rose */}
          <div className="absolute right-2 bottom-2 text-[#486581] flex flex-col items-center">
            <span className="text-[8px] font-bold text-[#00e5ff]">N</span>
            <Compass className="w-4 h-4 opacity-70" />
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] text-[#627d98] pt-1.5 border-t border-[#142838] mt-1">
          <div className="flex items-center gap-1">
            <span className="text-[#00e5ff]">❖</span> Current
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#8fa3b8]">👁</span> Discovered
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#f59e0b]">🔒</span> Locked
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#ef4444]">⚚</span> Secret
          </div>
        </div>
      </div>

      {/* 2. TERMINAL */}
      <div className="bg-[#05080c] border border-[#142838] p-2 flex flex-col justify-between">
        <div className="border-b border-[#142838] pb-1 mb-1 flex items-center justify-between">
          <span className="font-bold tracking-wider text-[#00e5ff] text-[11px]">TERMINAL</span>
          <span className="text-[9px] text-[#486581]">KERNEL 6.14.0</span>
        </div>

        {/* Terminal Logs View */}
        <div className="flex-1 overflow-y-auto space-y-1 text-[10px] pr-1 leading-relaxed text-[#b0c4de]">
          <div className="text-[#627d98] text-[9px]">
            PHANTOM SHELL // KERNEL 6.14.0-phantom-generic
            <br />Connected to session #8492-B. Type &apos;help&apos;.
          </div>
          <div className="text-[#00e5ff] font-bold">
            visitor@phantom:/home/visitor$ <span className="text-[#cbd5e1] font-normal">look</span>
          </div>
          <div className="text-[#94a3b8] pl-2 border-l border-[#1f3a52]">
            You see:
            <br />- A heavy door with brass number
            <br />- A flickering cold light
            <br />- A shadow waiting in the distance
          </div>
          <div className="text-[#f472b6] italic">
            GHOST: You&apos;re not supposed to be here yet...
          </div>
          {terminalLogs.slice(-3).map((log, i) => (
            <div key={i} className="text-[#7CFF9B] text-[9px] break-words">
              {log}
            </div>
          ))}
        </div>

        {/* Command Input Form */}
        <form onSubmit={handleTermSubmit} className="mt-1 flex items-center gap-1 border-t border-[#142838] pt-1">
          <span className="text-[#00e5ff] text-[10px] select-none">$</span>
          <input
            type="text"
            value={termInput}
            onChange={(e) => setTermInput(e.target.value)}
            placeholder="look, inspect, quests..."
            className="flex-1 bg-transparent border-none text-[#7CFF9B] text-[10px] font-mono outline-none placeholder-[#486581]"
          />
          <button
            type="submit"
            className="px-1.5 py-0.5 bg-[#142838] hover:bg-[#00e5ff]/20 text-[#00e5ff] text-[9px] border border-[#1f3a52]"
          >
            RUN
          </button>
        </form>
      </div>

      {/* 3. INVENTORY */}
      <div className="bg-[#060a0f] border border-[#142838] p-2 flex flex-col justify-between">
        <div className="border-b border-[#142838] pb-1 mb-1 flex items-center justify-between">
          <span className="font-bold tracking-wider text-[#00e5ff] text-[11px]">INVENTORY</span>
          <span className="text-[9px] text-[#486581]">{inventoryItems.length} ITEMS</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {inventoryItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onTriggerSound?.('click');
                  onInspectItem(item.name);
                }}
                className="w-full flex items-center gap-2 p-1 bg-[#0a121a] hover:bg-[#122230] border border-[#142838] hover:border-[#00e5ff]/40 text-left transition-colors group"
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
                <span className="text-[10px] text-[#b0c4de] group-hover:text-white truncate">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[8px] text-[#486581] pt-1 border-t border-[#142838] text-center">
          CLICK ITEM TO EXAMINE / USE
        </div>
      </div>

      {/* 4. QUEST LOG */}
      <div className="bg-[#060a0f] border border-[#142838] p-2 flex flex-col justify-between">
        <div className="border-b border-[#142838] pb-1 mb-1 flex items-center justify-between">
          <span className="font-bold tracking-wider text-[#00e5ff] text-[11px]">QUEST LOG</span>
          <span className="text-[9px] text-[#486581]">ACTIVE (5)</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[9px]">
          <div>
            <div className="text-[#7CFF9B] font-bold flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5 text-[#00e5ff]" />
              The Missing Photograph
            </div>
            <div className="text-[#8fa3b8] pl-3.5">
              • Find 3 fragments (1/3)
            </div>
          </div>

          <div>
            <div className="text-[#7CFF9B] font-bold flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5 text-[#00e5ff]" />
              The Lost Patient
            </div>
            <div className="text-[#8fa3b8] pl-3.5">
              • Match hospital records (0/4)
            </div>
          </div>

          <div>
            <div className="text-[#7CFF9B] font-bold flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5 text-[#00e5ff]" />
              The Final Train
            </div>
            <div className="text-[#8fa3b8] pl-3.5">
              • Discover the destination (0/1)
            </div>
          </div>

          <div>
            <div className="text-[#7CFF9B] font-bold flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5 text-[#00e5ff]" />
              The Memory Garden
            </div>
            <div className="text-[#8fa3b8] pl-3.5">
              • Find the hidden path (0/1)
            </div>
          </div>

          <div>
            <div className="text-[#7CFF9B] font-bold flex items-center gap-1">
              <ChevronRight className="w-2.5 h-2.5 text-[#00e5ff]" />
              The Secret Ending
            </div>
            <div className="text-[#8fa3b8] pl-3.5">
              • Collect all memories (0/15)
            </div>
          </div>
        </div>

        <div className="text-[8px] text-[#486581] pt-1 border-t border-[#142838] text-center">
          PROGRESS SAVES AUTOMATICALLY
        </div>
      </div>

      {/* 5. THE CARETAKER (GHOST DOSSIER) */}
      <div className="bg-[#060a0f] border border-[#142838] p-2 flex flex-col justify-between">
        <div className="border-b border-[#142838] pb-1 mb-1 flex items-center justify-between">
          <span className="font-bold tracking-wider text-[#00e5ff] text-[11px]">THE CARETAKER</span>
          <span className="text-[9px] text-[#f59e0b] animate-pulse">SPECTRAL</span>
        </div>

        <div className="flex-1 flex gap-2 overflow-hidden my-1">
          {/* Pixel Portrait */}
          <div className="w-16 h-22 bg-[#020406] border border-[#1f3a52] flex-shrink-0 relative overflow-hidden flex items-center justify-center">
            {/* Silhouette with fedora & trenchcoat */}
            <div className="relative flex flex-col items-center">
              {/* Fedora brim */}
              <div className="w-9 h-1.5 bg-[#14202c] rounded-xs shadow"></div>
              {/* Hat crown */}
              <div className="w-6 h-3 bg-[#1e2e3d] -mt-1 rounded-t-xs"></div>
              {/* Face shadow */}
              <div className="w-5 h-4 bg-[#0a1017] flex items-center justify-center gap-1.5">
                <div className="w-1 h-1 bg-[#00e5ff] rounded-full animate-ping"></div>
                <div className="w-1 h-1 bg-[#00e5ff] rounded-full animate-ping"></div>
              </div>
              {/* Trenchcoat shoulders */}
              <div className="w-11 h-10 bg-[#16222f] mt-0.5 rounded-t-sm border-t border-[#2d4257]"></div>
            </div>
            {/* Scanline over portrait */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,229,255,0.08)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
          </div>

          {/* Lore Text & Quote */}
          <div className="flex-1 flex flex-col justify-between text-[9px] leading-tight">
            <p className="text-[#8fa3b8]">
              He appears in places where he shouldn&apos;t be. Some say he&apos;s the building&apos;s caretaker. Others say he&apos;s just another memory.
            </p>
            <div className="text-[#f59e0b] italic text-[8.5px] border-l border-[#f59e0b]/50 pl-1.5 my-1">
              &ldquo;You shouldn&apos;t be here... but since you are... follow the light.&rdquo;
            </div>
          </div>
        </div>

        {/* Action Button: Talk to Ghost */}
        <button
          onClick={() => {
            onTriggerSound?.('ghost');
            onOpenDialogue('caretaker');
          }}
          className="w-full py-1.5 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 hover:border-[#00e5ff] flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider transition-all shadow-[0_0_8px_rgba(0,229,255,0.2)]"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          COMMUNE (GEMINI AI)
        </button>
      </div>
    </div>
  );
};
