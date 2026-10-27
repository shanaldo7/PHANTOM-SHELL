import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Lock,
  Unlock,
  Zap,
  Droplets,
  Eye,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
  Activity
} from 'lucide-react';
import { worldStateManager, HauntedRoom, FloorLevel, CrossRoomQuest } from '../engine/worldState';
import { audioEngine } from '../engine/audioEngine';

interface WorldMapViewProps {
  onTravelToRoom: (roomId: string) => void;
  onOpenDialogue?: (charId: any) => void;
  onTriggerSound?: (type: 'click' | 'ghost' | 'error' | 'success') => void;
}

const FLOOR_LABELS: Record<FloorLevel, { label: string; sub: string; color: string }> = {
  rooftop_void: { label: 'ROOFTOP // VOID', sub: 'Atmospheric transmission mast & null address', color: '#93C5FD' },
  second: { label: '2ND FLOOR', sub: 'Clinical ward, memory courtyard & debug sectors', color: '#67E8F9' },
  first: { label: '1ST FLOOR', sub: 'Living quarters, classroom & mirror gallery', color: '#86EFAC' },
  ground: { label: 'GROUND FLOOR', sub: 'Long corridor, hotel, cinema & transit platform', color: '#FBBF24' },
  sub_1: { label: 'BASEMENT LVL 1', sub: 'Turbine generator, tape archive & server cathedral', color: '#F97316' },
  sub_2: { label: 'SUB-LEVEL 2', sub: 'Deep foundations, Morpheus Core & Final Desk', color: '#C084FC' }
};

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  onTravelToRoom,
  onOpenDialogue,
  onTriggerSound
}) => {
  const [selectedFloor, setSelectedFloor] = useState<FloorLevel>('ground');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(worldStateManager.activeRoomId);
  const [viewMode, setViewMode] = useState<'blueprint' | 'quests'>('blueprint');

  const activeRoom = worldStateManager.getActiveRoom();
  const rooms = worldStateManager.rooms;
  const quests = worldStateManager.quests;
  const env = worldStateManager.env;

  const currentFloorRooms = Object.values(rooms).filter(r => r.floor === selectedFloor);
  const inspectRoom = rooms[selectedRoomId] || activeRoom;

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    if (onTriggerSound) onTriggerSound('click');
    else audioEngine.playKeyClick();
  };

  const handleTravel = (roomId: string) => {
    const res = worldStateManager.travelToRoom(roomId);
    if (res.success) {
      if (onTriggerSound) onTriggerSound('success');
      else audioEngine.playSuccess();
      onTravelToRoom(roomId);
    } else {
      if (onTriggerSound) onTriggerSound('error');
      else audioEngine.playErrorTone();
    }
  };

  const handleToggleBreaker = (circuit: keyof typeof env.powerGrid) => {
    const state = worldStateManager.toggleBreaker(circuit);
    if (onTriggerSound) onTriggerSound('click');
    else audioEngine.playKeyClick();
  };

  const visitedCount = Object.values(rooms).filter(r => r.visited).length;
  const totalRooms = Object.values(rooms).length;

  return (
    <div className="flex-1 flex flex-col bg-[#05070A] text-[#C5D1DE] overflow-hidden select-none font-mono">
      {/* Top Header */}
      <div className="p-4 border-b border-[#7CFF9B]/20 bg-[#090E12] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-[#7CFF9B]/10 border border-[#7CFF9B]/30 text-[#7CFF9B]">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-wider text-[#7CFF9B]">
                HOUSE SCHEMATIC & FACILITY MATRIX
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#58D9FF]/10 text-[#58D9FF] border border-[#58D9FF]/30">
                DISCOVERED: {visitedCount}/{totalRooms} SECTORS
              </span>
            </div>
            <p className="text-xs text-[#8A9AA7]">
              Current Location: <span className="text-white font-semibold">{activeRoom.code} — {activeRoom.title}</span>
            </p>
          </div>
        </div>

        {/* Navigation Mode Switcher */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setViewMode('blueprint'); if (onTriggerSound) onTriggerSound('click'); }}
            className={`px-3 py-1.5 rounded text-xs tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'blueprint'
                ? 'bg-[#7CFF9B]/20 text-[#7CFF9B] border border-[#7CFF9B]/50 shadow-[0_0_12px_rgba(124,255,155,0.2)]'
                : 'text-[#8A9AA7] hover:text-white border border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>BLUEPRINT</span>
          </button>
          <button
            onClick={() => { setViewMode('quests'); if (onTriggerSound) onTriggerSound('click'); }}
            className={`px-3 py-1.5 rounded text-xs tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'quests'
                ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/50 shadow-[0_0_12px_rgba(167,139,250,0.2)]'
                : 'text-[#8A9AA7] hover:text-white border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>INVESTIGATIONS ({quests.filter(q => q.completed).length}/10)</span>
          </button>
        </div>
      </div>

      {viewMode === 'blueprint' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Floor Level Selector Column */}
          <div className="w-64 border-r border-[#7CFF9B]/15 bg-[#070B0F] p-3 flex flex-col space-y-2 overflow-y-auto">
            <div className="text-[10px] text-[#8A9AA7] uppercase tracking-widest px-2 py-1 border-b border-[#7CFF9B]/10">
              Floor Levels
            </div>
            {(['rooftop_void', 'second', 'first', 'ground', 'sub_1', 'sub_2'] as FloorLevel[]).map(lvl => {
              const meta = FLOOR_LABELS[lvl];
              const isSelected = selectedFloor === lvl;
              const lvlRooms = Object.values(rooms).filter(r => r.floor === lvl);
              const hasActive = lvlRooms.some(r => r.id === activeRoom.id);

              return (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedFloor(lvl);
                    if (onTriggerSound) onTriggerSound('click');
                  }}
                  className={`text-left p-2.5 rounded transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#7CFF9B]/15 border-[#7CFF9B]/40 text-white shadow-[0_0_8px_rgba(124,255,155,0.15)]'
                      : 'bg-[#090E12]/60 border-white/5 text-[#8A9AA7] hover:border-[#7CFF9B]/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    {hasActive && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#7CFF9B] text-black font-extrabold animate-pulse">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#8A9AA7] mt-1 truncate">
                    {meta.sub}
                  </div>
                  <div className="text-[9px] text-[#58D9FF] mt-1.5 flex items-center space-x-2">
                    <span>{lvlRooms.filter(r => r.visited).length}/{lvlRooms.length} mapped</span>
                  </div>
                </button>
              );
            })}

            {/* Environmental Facility Status Widget */}
            <div className="mt-auto pt-3 border-t border-[#7CFF9B]/15 space-y-2 text-[11px]">
              <div className="text-[10px] text-[#8A9AA7] uppercase tracking-wider flex items-center justify-between">
                <span>Facility Power Grid</span>
                <Zap className="w-3 h-3 text-[#FBBF24]" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleToggleBreaker('corridorLights')}
                  className={`p-1.5 rounded text-[10px] border text-left cursor-pointer transition-all ${
                    env.powerGrid.corridorLights ? 'bg-[#7CFF9B]/15 border-[#7CFF9B]/40 text-[#7CFF9B]' : 'bg-[#090E12] border-red-500/30 text-red-400'
                  }`}
                >
                  Lights: {env.powerGrid.corridorLights ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => handleToggleBreaker('cinemaProjector')}
                  className={`p-1.5 rounded text-[10px] border text-left cursor-pointer transition-all ${
                    env.powerGrid.cinemaProjector ? 'bg-[#7CFF9B]/15 border-[#7CFF9B]/40 text-[#7CFF9B]' : 'bg-[#090E12] border-red-500/30 text-red-400'
                  }`}
                >
                  Projector: {env.powerGrid.cinemaProjector ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => handleToggleBreaker('hospitalElevator')}
                  className={`p-1.5 rounded text-[10px] border text-left cursor-pointer transition-all ${
                    env.powerGrid.hospitalElevator ? 'bg-[#7CFF9B]/15 border-[#7CFF9B]/40 text-[#7CFF9B]' : 'bg-[#090E12] border-red-500/30 text-red-400'
                  }`}
                >
                  Elevator: {env.powerGrid.hospitalElevator ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => handleToggleBreaker('drainagePumps')}
                  className={`p-1.5 rounded text-[10px] border text-left cursor-pointer transition-all ${
                    env.powerGrid.drainagePumps ? 'bg-[#58D9FF]/20 border-[#58D9FF]/50 text-[#58D9FF]' : 'bg-[#090E12] border-red-500/30 text-red-400'
                  }`}
                >
                  Pumps: {env.powerGrid.drainagePumps ? 'ACTIVE' : 'DRAINED'}
                </button>
              </div>
            </div>
          </div>

          {/* Center Floor Blueprint Room Grid */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#040608] relative">
            {/* Grid CAD background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-15"
              style={{
                backgroundImage: 'linear-gradient(to right, #7CFF9B 1px, transparent 1px), linear-gradient(to bottom, #7CFF9B 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }}
            />

            <div className="relative z-10 max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#7CFF9B]/20">
                <div>
                  <h3 className="text-base font-bold text-white tracking-widest flex items-center space-x-2">
                    <span>{FLOOR_LABELS[selectedFloor].label}</span>
                    <span className="text-xs text-[#8A9AA7] font-normal">// {FLOOR_LABELS[selectedFloor].sub}</span>
                  </h3>
                </div>
                <div className="text-xs text-[#8A9AA7]">
                  Click room node to inspect details or fast-travel
                </div>
              </div>

              {/* Room Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentFloorRooms.map(room => {
                  const isCurrent = room.id === activeRoom.id;
                  const isSelected = room.id === selectedRoomId;

                  return (
                    <div
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className={`p-4 rounded border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#09151C] border-[#7CFF9B] shadow-[0_0_15px_rgba(124,255,155,0.2)]'
                          : isCurrent
                          ? 'bg-[#0A121A] border-[#58D9FF]/70 shadow-[0_0_10px_rgba(88,217,255,0.15)]'
                          : room.visited
                          ? 'bg-[#080E14] border-[#7CFF9B]/30 hover:border-[#7CFF9B]/60'
                          : room.unlocked
                          ? 'bg-[#060A0E] border-white/10 hover:border-white/30'
                          : 'bg-[#040608] border-red-500/20 opacity-60'
                      }`}
                    >
                      {/* Status Badges */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-[#58D9FF] px-1.5 py-0.5 rounded bg-[#58D9FF]/10 border border-[#58D9FF]/30">
                            {room.code}
                          </span>
                          {room.isSecret && (
                            <span className="text-[10px] font-bold text-[#F472B6] px-1.5 py-0.5 rounded bg-[#F472B6]/15 border border-[#F472B6]/40">
                              CLASSIFIED
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-extrabold text-black bg-[#7CFF9B] px-1.5 py-0.2 rounded animate-pulse">
                              CURRENT SECTOR
                            </span>
                          )}
                        </div>

                        {room.unlocked ? (
                          <Unlock className="w-4 h-4 text-[#7CFF9B]" />
                        ) : (
                          <Lock className="w-4 h-4 text-red-400" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2 tracking-wide">
                        {room.title}
                      </h4>
                      <p className="text-xs text-[#8A9AA7] mt-1 line-clamp-2">
                        {room.subtitle}
                      </p>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8A9AA7]">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-[#A78BFA]" />
                          <span>Ghost: {room.primaryGhost.toUpperCase()}</span>
                        </span>
                        <span>{room.doors.length} doors / {room.interactables.length} hotspots</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Selected Room Inspector Sidebar */}
          <div className="w-80 border-l border-[#7CFF9B]/15 bg-[#070B0F] p-4 flex flex-col overflow-y-auto space-y-4">
            <div className="text-[10px] text-[#8A9AA7] uppercase tracking-widest border-b border-[#7CFF9B]/10 pb-1">
              Sector Inspection & Telemetry
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#58D9FF] px-2 py-0.5 rounded bg-[#58D9FF]/10 border border-[#58D9FF]/30">
                  {inspectRoom.code}
                </span>
                <span className="text-xs text-[#8A9AA7]">{inspectRoom.floorName}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{inspectRoom.title}</h3>
              <p className="text-xs text-[#7CFF9B] italic mt-0.5">{inspectRoom.subtitle}</p>
            </div>

            <div className="p-2.5 rounded bg-[#090E12] border border-[#7CFF9B]/20 text-xs text-[#C5D1DE] space-y-2">
              <p>{inspectRoom.description}</p>
              <p className="text-[11px] text-[#8A9AA7] border-t border-white/10 pt-2">
                <span className="text-[#FBBF24]">Atmosphere:</span> {inspectRoom.environmentalNotes}
              </p>
            </div>

            {/* Hotspots */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-[#8A9AA7] uppercase tracking-wider">
                Interactive Nodes ({inspectRoom.interactables.length})
              </div>
              <div className="space-y-1">
                {inspectRoom.interactables.map(item => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-[#090E12] border border-white/5 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-[10px] text-[#8A9AA7]">{item.prompt}</div>
                    </div>
                    {item.ghostId && onOpenDialogue && (
                      <button
                        onClick={() => onOpenDialogue(item.ghostId)}
                        className="px-2 py-1 rounded text-[10px] bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 hover:bg-[#A78BFA]/30 cursor-pointer"
                      >
                        Talk
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Action Button */}
            <div className="mt-auto pt-4 border-t border-[#7CFF9B]/20">
              {inspectRoom.id === activeRoom.id ? (
                <div className="w-full py-2.5 rounded bg-[#7CFF9B]/10 text-[#7CFF9B] border border-[#7CFF9B]/30 text-center text-xs font-bold tracking-wider">
                  CURRENTLY IN THIS SECTOR
                </div>
              ) : inspectRoom.unlocked ? (
                <button
                  onClick={() => handleTravel(inspectRoom.id)}
                  className="w-full py-2.5 rounded bg-[#7CFF9B] text-black font-extrabold text-xs tracking-wider flex items-center justify-center space-x-2 hover:bg-[#68e086] transition-all cursor-pointer shadow-[0_0_15px_rgba(124,255,155,0.3)]"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>TRANSLOCATE TO {inspectRoom.code}</span>
                </button>
              ) : (
                <div className="w-full py-2.5 rounded bg-red-950/30 text-red-400 border border-red-500/30 text-center text-xs flex items-center justify-center space-x-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>DOOR SEALED — OBJECTIVE REQUIRED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Quests View */
        <div className="flex-1 p-6 overflow-y-auto bg-[#040608]">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="pb-2 border-b border-[#A78BFA]/20 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-widest flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#A78BFA]" />
                  <span>CROSS-ROOM INVESTIGATIONS & ANOMALIES</span>
                </h3>
                <p className="text-xs text-[#8A9AA7]">
                  Multi-step objectives linking terminal entries, physical rooms, and spectral testimonies.
                </p>
              </div>
              <div className="text-xs px-2.5 py-1 rounded bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30">
                {quests.filter(q => q.completed).length} / {quests.length} Completed
              </div>
            </div>

            <div className="space-y-3">
              {quests.map(quest => {
                const progressPct = Math.round((quest.stages.filter(s => s.completed).length / quest.stages.length) * 100);

                return (
                  <div
                    key={quest.id}
                    className={`p-4 rounded border transition-all ${
                      quest.completed
                        ? 'bg-[#08120C] border-[#7CFF9B]/40'
                        : 'bg-[#080E14] border-[#A78BFA]/20 hover:border-[#A78BFA]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white tracking-wide">
                            {quest.title}
                          </h4>
                          {quest.completed && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#7CFF9B]/20 text-[#7CFF9B] border border-[#7CFF9B]/30 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>SOLVED</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#58D9FF]">{progressPct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#05070A] rounded overflow-hidden mt-2.5 border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#7CFF9B] to-[#58D9FF] transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Stages List */}
                    <div className="mt-3 space-y-2 border-t border-white/5 pt-2">
                      {quest.stages.map((stg, sIdx) => {
                        const isCurrent = sIdx === quest.currentStage && !quest.completed;
                        return (
                          <div
                            key={sIdx}
                            className={`p-2 rounded text-xs flex items-start space-x-2 ${
                              stg.completed
                                ? 'text-[#7CFF9B] bg-[#7CFF9B]/5'
                                : isCurrent
                                ? 'text-white bg-[#A78BFA]/10 border border-[#A78BFA]/30'
                                : 'text-[#8A9AA7] opacity-60'
                            }`}
                          >
                            <div className="mt-0.5">
                              {stg.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#7CFF9B]" />
                              ) : isCurrent ? (
                                <Clock className="w-3.5 h-3.5 text-[#A78BFA] animate-spin" style={{ animationDuration: '6s' }} />
                              ) : (
                                <HelpCircle className="w-3.5 h-3.5 text-[#8A9AA7]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{stg.description}</div>
                              {isCurrent && (
                                <div className="text-[11px] text-[#58D9FF] mt-0.5">
                                  HINT: {stg.hint}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
