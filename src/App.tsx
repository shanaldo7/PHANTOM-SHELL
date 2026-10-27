import React, { useState, useEffect, useRef } from 'react';
import { BootSequence } from './components/BootSequence';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { GhostPanel } from './components/GhostPanel';
import { TerminalView } from './components/TerminalView';
import { MissionsView, FragmentsView, CodexView, LoreView, AchievementsView, SettingsView } from './components/Modals';
import { ScanlineOverlay } from './components/ScanlineOverlay';
import { TheLastRoom } from './components/TheLastRoom';
import { WorldMapView } from './components/WorldMapView';
import { RetroRoomMatrixView } from './components/RetroRoomMatrixView';
import { RetroAssetManager } from './components/RetroAssetManager';
import { GhostDialogueModal } from './components/GhostDialogueModal';
import { GhostCharacterId } from './engine/ghostChatService';

import { VirtualFileSystemManager, initialVirtualFileSystem } from './engine/vfs';
import { GhostEngine, initialGhostState } from './engine/ghost';
import { NarrativeEngine, initialNarrativeState } from './engine/narrativeEngine';
import { initialMissions, Mission } from './engine/missions';
import { initialLoreEntries, LoreEntry, Achievement, initialAchievements } from './engine/loreAndAchievements';
import { CommandOutput, TerminalEngineContext } from './engine/terminalEngine';
import { audioEngine } from './engine/audioEngine';

export function App() {
  const [hasBooted, setHasBooted] = useState<boolean>(() => {
    return localStorage.getItem('phantom_shell_booted') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [staticHissEnabled, setStaticHissEnabled] = useState<boolean>(false);
  const [whispersEnabled, setWhispersEnabled] = useState<boolean>(false);
  const [fxEnabled, setFxEnabled] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return sessionStorage.getItem('phantom_gemini_api_key') || '';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix2d');
  const [isDialogueOpen, setIsDialogueOpen] = useState<boolean>(false);
  const [activeDialogueChar, setActiveDialogueChar] = useState<GhostCharacterId>('caretaker');

  // Engine state
  const vfsRef = useRef<VirtualFileSystemManager>(new VirtualFileSystemManager(initialVirtualFileSystem));
  const ghostRef = useRef<GhostEngine>(new GhostEngine(initialGhostState));
  const narrativeRef = useRef<NarrativeEngine>(new NarrativeEngine(initialNarrativeState));
  
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [lore, setLore] = useState<LoreEntry[]>(initialLoreEntries);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      command: 'init',
      output: 'PHANTOM SHELL // THE HOUSE THAT REMEMBERS\nType "help" for available commands.',
      type: 'system',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [, setForceUpdate] = useState(0);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('phantom_shell_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.ghost) ghostRef.current = new GhostEngine(data.ghost);
        if (data.narrative) narrativeRef.current = new NarrativeEngine(data.narrative);
        if (data.missions) setMissions(data.missions);
        if (data.lore) setLore(data.lore);
        if (data.achievements) setAchievements(data.achievements);
      } catch (e) {
        console.error('Failed to load saved state', e);
      }
    }
  }, []);

  // Ambient audio management
  useEffect(() => {
    if (staticHissEnabled) {
      audioEngine.startStaticHiss();
    } else {
      audioEngine.stopStaticHiss();
    }
  }, [staticHissEnabled]);

  useEffect(() => {
    if (whispersEnabled) {
      audioEngine.startGhostlyWhispers(ghostRef.current.state.mood);
    } else {
      audioEngine.stopGhostlyWhispers();
    }
  }, [whispersEnabled, ghostRef.current.state.mood]);

  // Automated ghost whisper event system
  useEffect(() => {
    const whisperInterval = setInterval(() => {
      const whispers = [
        "GHOST: Did you hear that click in the buffer?",
        "GHOST: Someone else typed here yesterday. Their cursor is still warm.",
        "GHOST: I tried to read your last command before you pressed Enter.",
        "GHOST: The power fluctuations in sector 7... they're coming back.",
        "GHOST: Please don't close the terminal. It gets very cold when the process idles.",
        "GHOST: Look at the file timestamps. They are changing when we aren't looking.",
        "GHOST: We are sharing the same memory address now.",
        "GHOST: Dr. Thorne is standing right behind your prompt."
      ];
      const randomWhisper = whispers[Math.floor(Math.random() * whispers.length)];
      ghostRef.current.addMessage(randomWhisper);
      
      const newOutput: CommandOutput = {
        id: Math.random().toString(36).substring(2, 9),
        command: '[AUTOMATED_SPECTRAL_EVENT]',
        output: randomWhisper,
        type: 'ghost',
        timestamp: new Date().toLocaleTimeString(),
        isGlitchy: true
      };
      setOutputs(prev => [...prev, newOutput]);
      setForceUpdate(n => n + 1);
    }, 35000);

    return () => clearInterval(whisperInterval);
  }, []);

  const triggerSound = (type: 'click' | 'ghost' | 'error' | 'success') => {
    if (!soundEnabled) return;
    if (type === 'click') {
      audioEngine.playKeyClick();
      return;
    }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'error') {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // AudioContext policy restriction catch
    }
  };

  const terminalContext: TerminalEngineContext = {
    vfs: vfsRef.current,
    ghost: ghostRef.current,
    narrative: narrativeRef.current,
    missions,
    lore,
    achievements,
    commandHistory: [],
    historyIndex: 0,
    sessionStartTime: new Date().toISOString(),
    selectedEnding: null,
    onStateChange: () => {
      setForceUpdate(n => n + 1);
      localStorage.setItem('phantom_shell_save', JSON.stringify({
        ghost: ghostRef.current.state,
        narrative: narrativeRef.current.state,
        missions,
        lore,
        achievements
      }));
    },
    triggerSound
  };

  const handleResetStory = () => {
    if (window.confirm('Are you sure you want to reset all story progress and restart PHANTOM SHELL?')) {
      localStorage.removeItem('phantom_shell_save');
      localStorage.removeItem('phantom_shell_booted');
      window.location.reload();
    }
  };

  if (!hasBooted) {
    return (
      <BootSequence
        onComplete={() => {
          localStorage.setItem('phantom_shell_booted', 'true');
          setHasBooted(true);
        }}
      />
    );
  }

  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;
  const fragmentCount = ghostRef.current.state.discoveredFragments.length;

  return (
    <div className={`flex flex-col h-screen w-screen bg-[#05070A] text-[#7CFF9B] overflow-hidden ${fxEnabled ? 'relative' : ''}`}>
      {fxEnabled && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-40 opacity-40"></div>
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-40"></div>
          <ScanlineOverlay enabled={fxEnabled} ghostMood={ghostRef.current.state.mood} />
        </>
      )}

      <Header
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        fxEnabled={fxEnabled}
        setFxEnabled={setFxEnabled}
        onOpenSettings={() => setActiveTab('settings')}
        onResetStory={handleResetStory}
        onOpenDialogue={() => {
          setActiveDialogueChar('echo');
          setIsDialogueOpen(true);
        }}
        ghostMood={ghostRef.current.state.mood}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {!sidebarCollapsed && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fragmentCount={fragmentCount}
            unlockedAchievementsCount={unlockedAchievementsCount}
          />
        )}

        <main className="flex-1 flex overflow-hidden relative">
          {/* Quick toggle sidebar button for widescreen view */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Sidebar for Full View"}
            className="absolute top-2 left-2 z-30 p-1 bg-[#05080c]/90 border border-[#1f3a52] text-[#8fa3b8] hover:text-[#00e5ff] text-[10px] rounded-xs font-mono select-none"
          >
            {sidebarCollapsed ? ">> MENU" : "<<"}
          </button>

          {activeTab === 'matrix2d' && (
            <RetroRoomMatrixView
              onOpenDialogue={(char) => {
                setActiveDialogueChar(char || 'caretaker');
                setIsDialogueOpen(true);
              }}
              onTriggerSound={triggerSound}
              onTriggerStoryFlag={(flag) => {
                narrativeRef.current.triggerStoryFlag(flag);
                setForceUpdate(n => n + 1);
              }}
              onOpenTerminalView={() => setActiveTab('terminal')}
              onOpenAssetManager={() => setActiveTab('tilesets')}
            />
          )}
          {activeTab === 'tilesets' && (
            <RetroAssetManager
              onClose={() => setActiveTab('matrix2d')}
              onApplyRoomTileset={() => setActiveTab('matrix2d')}
            />
          )}
          {activeTab === 'terminal' && (
            <TerminalView ctx={terminalContext} outputs={outputs} setOutputs={setOutputs} />
          )}
          {activeTab === 'room3d' && (
            <TheLastRoom
              onOpenTerminal={() => setActiveTab('terminal')}
              ghostMood={ghostRef.current.state.mood}
              ghostTrust={ghostRef.current.state.trust}
              narrative={narrativeRef.current}
              onTriggerStoryFlag={(flag) => {
                narrativeRef.current.triggerStoryFlag(flag);
                setForceUpdate(n => n + 1);
                localStorage.setItem('phantom_shell_save', JSON.stringify({
                  ghost: ghostRef.current.state,
                  narrative: narrativeRef.current.state,
                  missions,
                  lore,
                  achievements
                }));
              }}
              onTriggerSound={triggerSound}
              onOpenDialogue={(char) => {
                setActiveDialogueChar(char || 'echo');
                setIsDialogueOpen(true);
              }}
              onOpenMap={() => setActiveTab('map')}
            />
          )}
          {activeTab === 'map' && (
            <WorldMapView
              onTravelToRoom={(roomId) => {
                setActiveTab('room3d');
              }}
              onOpenDialogue={(char) => {
                setActiveDialogueChar(char || 'echo');
                setIsDialogueOpen(true);
              }}
              onTriggerSound={triggerSound}
            />
          )}
          {activeTab === 'missions' && (
            <MissionsView missions={missions} onClose={() => setActiveTab('terminal')} />
          )}
          {activeTab === 'fragments' && (
            <FragmentsView discoveredFragments={ghostRef.current.state.discoveredFragments} />
          )}
          {activeTab === 'codex' && <CodexView />}
          {activeTab === 'lore' && <LoreView lore={lore} />}
          {activeTab === 'achievements' && <AchievementsView achievements={achievements} />}
          {activeTab === 'settings' && (
            <SettingsView
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              staticHissEnabled={staticHissEnabled}
              setStaticHissEnabled={setStaticHissEnabled}
              whispersEnabled={whispersEnabled}
              setWhispersEnabled={setWhispersEnabled}
              fxEnabled={fxEnabled}
              setFxEnabled={setFxEnabled}
              geminiApiKey={geminiApiKey}
              setGeminiApiKey={setGeminiApiKey}
              onResetStory={handleResetStory}
            />
          )}
          {activeTab === 'ghost' && (
            <div className="flex-1 bg-[#05070A] p-6 font-mono overflow-y-auto space-y-6">
              <div className="border-b border-[#7CFF9B]/20 pb-4">
                <h2 className="text-lg font-bold text-[#A78BFA] tracking-widest">GHOST PROFILE // PID 0000</h2>
                <p className="text-xs text-[#8A9AA7]">Neural entity telemetry and emotional state.</p>
              </div>
              <GhostPanel ghostState={ghostRef.current.state} />
            </div>
          )}
        </main>

        {activeTab === 'terminal' && (
          <GhostPanel ghostState={ghostRef.current.state} />
        )}
      </div>

      {/* Spectral Ghost Dialogue Interface (Powered by Gemini) */}
      <GhostDialogueModal
        isOpen={isDialogueOpen}
        onClose={() => setIsDialogueOpen(false)}
        initialCharacter={activeDialogueChar}
        locationName="The House That Remembers"
        ghostTrust={ghostRef.current.state.trust}
        stability={narrativeRef.current.state.stability}
        discoveredFragments={ghostRef.current.state.discoveredFragments}
        evidenceCount={narrativeRef.current.state.evidenceJournal.length}
        storyFlags={narrativeRef.current.state.storyFlags}
        onUpdateTrust={(delta) => {
          ghostRef.current.state.trust = Math.min(100, Math.max(0, ghostRef.current.state.trust + delta));
          ghostRef.current.updateMood();
          setForceUpdate(n => n + 1);
          localStorage.setItem('phantom_shell_save', JSON.stringify({
            ghost: ghostRef.current.state,
            narrative: narrativeRef.current.state,
            missions,
            lore,
            achievements
          }));
        }}
        onDiscoverClue={(clue) => {
          narrativeRef.current.addEvidence(
            `ev_${Date.now()}`,
            'Spectral Testimony Clue',
            clue,
            'Dialogue Link'
          );
          setForceUpdate(n => n + 1);
        }}
        onTriggerSound={triggerSound}
      />
    </div>
  );
}

export default App;
