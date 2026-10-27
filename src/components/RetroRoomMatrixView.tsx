import React, { useState } from 'react';
import { RetroPixelRoomCanvas } from './RetroPixelRoomCanvas';
import { RetroControlDeck } from './RetroControlDeck';
import { GhostCharacterId } from '../engine/ghostChatService';
import { worldStateManager, HauntedRoom } from '../engine/worldState';
import { Maximize2, Minimize2, Grid } from 'lucide-react';

interface RetroRoomMatrixViewProps {
  onOpenDialogue: (charId?: GhostCharacterId) => void;
  onTriggerSound?: (type: 'click' | 'ghost' | 'error' | 'success') => void;
  onTriggerStoryFlag?: (flag: string) => void;
  onOpenTerminalView?: () => void;
  onOpenAssetManager?: () => void;
}

export const RetroRoomMatrixView: React.FC<RetroRoomMatrixViewProps> = ({
  onOpenDialogue,
  onTriggerSound,
  onTriggerStoryFlag,
  onOpenTerminalView,
  onOpenAssetManager
}) => {
  const [activeRoomId, setActiveRoomId] = useState<string>(worldStateManager.activeRoomId || 'corridor');
  const [isFocusedMode, setIsFocusedMode] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [itemInspectionModal, setItemInspectionModal] = useState<string | null>(null);

  // The 15 canonical rooms exactly as arranged in Capture12_b6175097.PNG
  const gridRooms = [
    // Row 1
    { id: 'corridor', code: '01', title: 'THE LONG CORRIDOR', ghost: 'caretaker' as GhostCharacterId },
    { id: 'bedroom', code: '02', title: 'THE FORGOTTEN BEDROOM', ghost: 'child' as GhostCharacterId },
    { id: 'apartment', code: '03', title: 'THE FLOODED APARTMENT', ghost: 'echo' as GhostCharacterId },
    { id: 'school', code: '04', title: 'THE SCHOOL WITH NO STUDENTS', ghost: 'student' as GhostCharacterId },
    { id: 'hospital', code: '05', title: 'THE HOSPITAL OF UNFINISHED NAMES', ghost: 'doctor' as GhostCharacterId },

    // Row 2
    { id: 'archive', code: '06', title: 'THE FLOODED ARCHIVE', ghost: 'archivist' as GhostCharacterId },
    { id: 'cinema', code: '07', title: 'THE ABANDONED CINEMA', ghost: 'projectionist' as GhostCharacterId },
    { id: 'station', code: '08', title: 'THE ABANDONED TRAIN STATION', ghost: 'passenger' as GhostCharacterId },
    { id: 'mirror_gallery', code: '09', title: 'THE MIRROR GALLERY', ghost: 'mirror' as GhostCharacterId },
    { id: 'generator', code: '10', title: 'THE BASEMENT GENERATOR', ghost: 'engineer' as GhostCharacterId },

    // Row 3
    { id: 'server_cathedral', code: '11', title: 'THE SERVER CATHEDRAL', ghost: 'morpheus' as GhostCharacterId },
    { id: 'hotel', code: '12', title: 'THE LOOPING HOTEL', ghost: 'bellhop' as GhostCharacterId },
    { id: 'rooftop', code: '13', title: 'THE ROOFTOP OF STATIC', ghost: 'watcher' as GhostCharacterId },
    { id: 'memory_garden', code: '14', title: 'THE MEMORY GARDEN', ghost: 'patient' as GhostCharacterId },
    { id: 'morpheus_core', code: '15', title: 'MORPHEUS CORE', ghost: 'morpheus' as GhostCharacterId }
  ];

  const currentRoomData: HauntedRoom =
    worldStateManager.rooms[activeRoomId] || worldStateManager.rooms.corridor || worldStateManager.rooms.last_room;

  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    worldStateManager.travelToRoom(roomId);
    const room = gridRooms.find(r => r.id === roomId);
    if (room) {
      setTerminalLogs(prev => [
        ...prev,
        `[SIGNAL]: Switched feed to Sector ${room.code} — ${room.title}.`
      ]);
    }
  };

  const handleTerminalCommand = (cmd: string) => {
    const trimmed = cmd.toLowerCase().trim();
    if (trimmed === 'look') {
      const room = gridRooms.find(r => r.id === activeRoomId);
      setTerminalLogs(prev => [
        ...prev,
        `> look: Located in ${room?.title || activeRoomId}. Environmental stability: 82%.`,
        `GHOST: Every room remembers what the human forgot.`
      ]);
    } else if (trimmed.startsWith('goto ') || trimmed.startsWith('cd ')) {
      const target = trimmed.replace('goto ', '').replace('cd ', '').trim();
      const match = gridRooms.find(
        r => r.code === target || r.id === target || r.title.toLowerCase().includes(target)
      );
      if (match) {
        handleSelectRoom(match.id);
      } else {
        setTerminalLogs(prev => [...prev, `[ERROR]: Target sector "${target}" not found.`]);
      }
    } else if (trimmed === 'help') {
      setTerminalLogs(prev => [
        ...prev,
        `COMMANDS: look, goto <01-15>, inspect <object>, talk, inventory, quests, clear`
      ]);
    } else if (trimmed === 'clear') {
      setTerminalLogs([]);
    } else {
      setTerminalLogs(prev => [
        ...prev,
        `> ${cmd}: Processed. Buffer acknowledged by kernel.`
      ]);
    }
  };

  const handleInspectItem = (itemName: string) => {
    setItemInspectionModal(itemName);
    setTerminalLogs(prev => [...prev, `[EXAMINE]: Inspecting ${itemName}...`]);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[#030508] text-[#e2e8f0] font-mono select-none overflow-hidden">
      {/* 1. TOP HEADER BANNER (Exact text & layout from screenshot) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#142838] bg-[#05080c] z-20">
        <div className="flex items-center gap-3">
          <span className="text-sm md:text-base font-black tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            PHANTOM SHELL
          </span>
          <span className="text-xs md:text-sm font-bold tracking-wider text-[#00e5ff]">
            THE HOUSE THAT REMEMBERS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs tracking-wider text-[#94a3b8] hidden sm:inline">
            Explore. Discover. Remember.
          </span>
          {onOpenAssetManager && (
            <button
              onClick={() => {
                onTriggerSound?.('click');
                onOpenAssetManager();
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-[#00e5ff]/10 hover:bg-[#00e5ff]/25 text-[#00e5ff] border border-[#00e5ff]/40 transition-colors"
              title="Open 16x16 / 32x32 Retro Asset Manager & Tileset Pipeline"
            >
              <Grid className="w-3 h-3 text-[#00e5ff]" />
              <span>TILESETS (16/32px)</span>
            </button>
          )}

          <button
            onClick={() => {
              onTriggerSound?.('click');
              setIsFocusedMode(!isFocusedMode);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-[#0c1824] hover:bg-[#142838] text-[#00e5ff] border border-[#1f3a52] transition-colors"
          >
            {isFocusedMode ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>SURVEILLANCE MATRIX (15 ROOMS)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>ENTER FOCUSED EXPLORATION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MAIN VIEWPORT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 relative bg-[#020406]">
        {!isFocusedMode ? (
          /* THE 3x5 SURVEILLANCE MATRIX (Screenshot exact layout) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 max-w-[1920px] mx-auto">
            {gridRooms.map((room) => {
              const isCur = activeRoomId === room.id;
              return (
                <div key={room.id} className="flex flex-col">
                  <RetroPixelRoomCanvas
                    roomId={room.id}
                    roomCode={room.code}
                    roomTitle={room.title}
                    isCurrent={isCur}
                    isUnlocked={true}
                    onClick={() => {
                      onTriggerSound?.('click');
                      handleSelectRoom(room.id);
                    }}
                    className="aspect-video w-full"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* FOCUSED INTERACTIVE ROOM EXPLORER */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
            <div className="relative w-full max-w-4xl aspect-video border-2 border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.3)] bg-black">
              <RetroPixelRoomCanvas
                roomId={activeRoomId}
                roomCode={gridRooms.find(r => r.id === activeRoomId)?.code}
                roomTitle={gridRooms.find(r => r.id === activeRoomId)?.title}
                isCurrent={true}
                interactive={true}
                interactables={currentRoomData.interactables}
                className="w-full h-full"
              />

              {/* In-room quick action bar */}
              <div className="absolute top-3 left-3 bg-[#05080c]/90 border border-[#1f3a52] p-2 flex items-center gap-3 backdrop-blur-xs">
                <div>
                  <div className="text-[11px] font-bold text-[#00e5ff]">
                    {currentRoomData.code} — {currentRoomData.title}
                  </div>
                  <div className="text-[9px] text-[#94a3b8]">
                    {currentRoomData.floorName}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const ghost = gridRooms.find(r => r.id === activeRoomId)?.ghost || 'caretaker';
                    onOpenDialogue(ghost);
                  }}
                  className="px-2 py-1 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] text-[10px] font-bold border border-[#00e5ff]/60 flex items-center gap-1"
                >
                  SPEAK TO ENTITY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. LOWER CONTROL DECK (WORLD MAP, TERMINAL, INVENTORY, QUEST LOG, THE CARETAKER) */}
      <RetroControlDeck
        currentRoomId={activeRoomId}
        onSelectRoom={handleSelectRoom}
        onOpenDialogue={onOpenDialogue}
        onTriggerSound={onTriggerSound}
        terminalLogs={terminalLogs}
        onTerminalCommand={handleTerminalCommand}
        onInspectItem={handleInspectItem}
        onOpenFullRoom={() => setIsFocusedMode(true)}
      />

      {/* 4. FOOTER STATUS BAR (Exact text from screenshot) */}
      <div className="px-3 py-1.5 bg-[#03060a] border-t border-[#101e2b] flex items-center justify-center text-[9px] tracking-wider text-[#64748b] select-none text-center font-bold">
        PHANTOM SHELL &nbsp;//&nbsp; A RETRO 2D HORROR ADVENTURE &nbsp;//&nbsp; BUILT WITH NODE.JS + OPEN SOURCE AI &nbsp;//&nbsp; EXPLORE 15+ ROOMS &nbsp;//&nbsp; SOLVE 10+ CROSS-ROOM QUESTS &nbsp;//&nbsp; UNLOCK THE TRUTH
      </div>

      {/* Item Inspection Modal */}
      {itemInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#080d14] border-2 border-[#00e5ff] p-4 text-mono shadow-[0_0_24px_rgba(0,229,255,0.4)]">
            <div className="flex items-center justify-between border-b border-[#182d40] pb-2 mb-3">
              <span className="font-bold text-[#00e5ff] text-xs uppercase tracking-widest">
                ITEM INSPECTION // {itemInspectionModal}
              </span>
              <button
                onClick={() => setItemInspectionModal(null)}
                className="text-[#94a3b8] hover:text-white text-xs px-1"
              >
                [X]
              </button>
            </div>

            <p className="text-xs text-[#cbd5e1] leading-relaxed mb-4">
              Physical relic recovered from the MORPHEUS experimental complex.
              Its surface bears residual neural timestamps from October 27, 1999.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  onTriggerSound?.('click');
                  setTerminalLogs(prev => [...prev, `[ACTION]: Used ${itemInspectionModal} in ${currentRoomData.title}.`]);
                  setItemInspectionModal(null);
                }}
                className="px-3 py-1 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff] text-xs font-bold"
              >
                USE IN CURRENT ROOM
              </button>
              <button
                onClick={() => setItemInspectionModal(null)}
                className="px-3 py-1 bg-[#101e2b] hover:bg-[#182d40] text-[#94a3b8] text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
