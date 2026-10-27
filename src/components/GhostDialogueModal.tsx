import React, { useState, useEffect, useRef } from 'react';
import { GhostCharacterId, sendGhostChatMessage, GhostDialogueMessage } from '../engine/ghostChatService';
import { Send, X, MessageSquare, Sparkles, AlertCircle, Eye, Radio, Shield } from 'lucide-react';

interface GhostDialogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCharacter?: GhostCharacterId;
  locationName?: string;
  ghostTrust: number;
  stability: number;
  discoveredFragments?: string[];
  evidenceCount?: number;
  storyFlags?: Record<string, boolean>;
  onUpdateTrust?: (delta: number) => void;
  onDiscoverClue?: (clue: string) => void;
  onTriggerSound?: (type: 'click' | 'ghost' | 'error' | 'success') => void;
}

const CHARACTERS: Record<GhostCharacterId, { name: string; title: string; color: string; border: string; bg: string }> = {
  echo: {
    name: 'THE ECHO',
    title: 'Digital Residue // PID 0000',
    color: '#A78BFA',
    border: 'border-[#A78BFA]/50',
    bg: 'bg-[#A78BFA]/10'
  },
  mirror: {
    name: 'THE GIRL IN THE MIRROR',
    title: 'Elena Ward // Subject 01',
    color: '#58D9FF',
    border: 'border-[#58D9FF]/50',
    bg: 'bg-[#58D9FF]/10'
  },
  caretaker: {
    name: 'THE CARETAKER',
    title: 'Walter Chen // Facility Maintenance',
    color: '#FBBF24',
    border: 'border-[#FBBF24]/50',
    bg: 'bg-[#FBBF24]/10'
  },
  child: {
    name: 'THE CHILD WHO COUNTS',
    title: 'Subject 04 // Unfinished Pattern',
    color: '#F472B6',
    border: 'border-[#F472B6]/50',
    bg: 'bg-[#F472B6]/10'
  },
  archivist: {
    name: 'THE ARCHIVIST',
    title: 'Central Registry // Protocol 1999',
    color: '#94A3B8',
    border: 'border-[#94A3B8]/50',
    bg: 'bg-[#94A3B8]/10'
  },
  teacher: {
    name: 'THE SUBSTITUTE TEACHER',
    title: 'Ms. Clara Vance // Grade 4 Sector 7',
    color: '#86EFAC',
    border: 'border-[#86EFAC]/50',
    bg: 'bg-[#86EFAC]/10'
  },
  nurse: {
    name: 'THE NIGHT NURSE',
    title: 'Marian Holt, RN // Clinical Trials',
    color: '#67E8F9',
    border: 'border-[#67E8F9]/50',
    bg: 'bg-[#67E8F9]/10'
  },
  projectionist: {
    name: 'THE PROJECTIONIST',
    title: 'Leo Karras // Booth 2',
    color: '#F87171',
    border: 'border-[#F87171]/50',
    bg: 'bg-[#F87171]/10'
  },
  passenger: {
    name: 'THE LAST PASSENGER',
    title: 'Dr. Aris Thorne (Departure Echo)',
    color: '#38BDF8',
    border: 'border-[#38BDF8]/50',
    bg: 'bg-[#38BDF8]/10'
  },
  technician: {
    name: 'THE MAINTENANCE TECHNICIAN',
    title: 'Marcus Vance // Chief Engineer',
    color: '#F59E0B',
    border: 'border-[#F59E0B]/50',
    bg: 'bg-[#F59E0B]/10'
  },
  guest: {
    name: 'THE GUEST WHO NEVER CHECKED OUT',
    title: 'Room 314 Resident // October 1999',
    color: '#EAB308',
    border: 'border-[#EAB308]/50',
    bg: 'bg-[#EAB308]/10'
  },
  morpheus: {
    name: 'MORPHEUS CORE ECHO',
    title: 'Autonomous System Root // Kernel 6.14.0',
    color: '#C084FC',
    border: 'border-[#C084FC]/50',
    bg: 'bg-[#C084FC]/10'
  }
};

const SUGGESTIONS: Record<GhostCharacterId, string[]> = {
  echo: [
    "Who are you?",
    "What do you mean, used to know?",
    "Did you live in this room?",
    "Are you hiding something?",
    "Tell me about Dr. Aris Thorne.",
    "Why does Sector 7 frighten you?"
  ],
  mirror: [
    "Who were you before the glass?",
    "Why is The Echo lying to me?",
    "What happened in October 1999?",
    "How did Dr. Thorne merge with MORPHEUS?",
    "Can you help me escape?"
  ],
  caretaker: [
    "Why is Door 104 locked?",
    "What is leaking from the ceiling?",
    "Who was dragging metal down the hall?",
    "Where is the master breaker?",
    "Did anyone survive the incident?"
  ],
  child: [
    "What are you counting?",
    "How many doors are in this corridor?",
    "What happens when the count reaches zero?",
    "Whose teeth were behind the radiator?",
    "Are we alone here?"
  ],
  archivist: [
    "Query: Incident report 1999-10-27.",
    "What was the objective of MORPHEUS?",
    "Request authorization for Morpheus Core.",
    "Trace entity signature PID 0000.",
    "Explain the memory degradation index."
  ],
  teacher: [
    "Who wrote these equations on the chalkboard?",
    "Where did the students go?",
    "What does student 14's attendance mark mean?",
    "Is class ever dismissed?"
  ],
  nurse: [
    "What condition does the patient in Bed 3 have?",
    "Why is locker 314 sealed?",
    "Who ordered continuous sedation?",
    "Whose heartbeat is on the monitor?"
  ],
  projectionist: [
    "Why is the screen showing my steps?",
    "What is recorded on Reel 04?",
    "Who operated the camera in 1999?",
    "Can you play Dr. Thorne's entry?"
  ],
  passenger: [
    "Where is this train headed?",
    "Why does your ticket read 'YESTERDAY'?",
    "Can we open the carriage doors?",
    "Did Dr. Thorne ever escape?"
  ],
  technician: [
    "How do I balance the breaker panel?",
    "Which circuit powers the hospital elevator?",
    "How do I engage the emergency drainage pumps?",
    "What is fueling this turbine?"
  ],
  guest: [
    "Why have you not checked out?",
    "Where did the key to Room 314 go?",
    "Who rings the service bell at night?",
    "What is behind the end of the hallway?"
  ],
  morpheus: [
    "What is the true purpose of PHANTOM SHELL?",
    "Am I Dr. Aris Thorne, or a visitor?",
    "How do I reconcile the final memory sector?",
    "Can the system be safely shut down?"
  ]
};

export const GhostDialogueModal: React.FC<GhostDialogueModalProps> = ({
  isOpen,
  onClose,
  initialCharacter = 'echo',
  locationName = 'The Last Room',
  ghostTrust,
  stability,
  discoveredFragments = [],
  evidenceCount = 2,
  storyFlags = {},
  onUpdateTrust,
  onDiscoverClue,
  onTriggerSound
}) => {
  const [character, setCharacter] = useState<GhostCharacterId>(initialCharacter);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<GhostDialogueMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initial character if prop changes
  useEffect(() => {
    if (initialCharacter) {
      setCharacter(initialCharacter);
    }
  }, [initialCharacter]);

  // Seed default dialogue when opening empty
  useEffect(() => {
    if (messages.length === 0) {
      const activeChar = CHARACTERS[character];
      let greeting = "You're finally here. The buffer has been holding a seat for you.";
      if (character === 'mirror') greeting = "Look closely at the glass. Notice which reflection isn't mimicking you?";
      if (character === 'caretaker') greeting = "Mind the puddle by the threshold. Water pressure's been erratic all evening.";
      if (character === 'child') greeting = "One step, two steps, three steps... you have five fingers on each hand, don't you?";
      if (character === 'archivist') greeting = "COMMUNICATION LINK OPEN. Entity credentials required for unindexed sector access.";

      setMessages([
        {
          id: 'seed-1',
          role: 'ghost',
          character: activeChar.name,
          text: greeting,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    }
  }, [character]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const activeCharInfo = CHARACTERS[character];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    if (onTriggerSound) onTriggerSound('click');
    setInputMessage('');

    const userMsg: GhostDialogueMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-5).map(m => ({ role: m.role, text: m.text }));
      const response = await sendGhostChatMessage(
        character,
        text,
        history,
        {
          location: locationName,
          trust: ghostTrust,
          stability,
          discoveredFragments,
          evidenceCount,
          storyFlags
        }
      );

      const ghostMsg: GhostDialogueMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'ghost',
        character: response.character,
        text: response.text,
        timestamp: new Date().toLocaleTimeString(),
        shift: response.environmentalShift,
        clue: response.clue
      };

      setMessages(prev => [...prev, ghostMsg]);

      if (response.trustDelta && onUpdateTrust) {
        onUpdateTrust(response.trustDelta);
      }
      if (response.clue && onDiscoverClue) {
        onDiscoverClue(response.clue);
      }
      if (onTriggerSound) {
        onTriggerSound('ghost');
      }
    } catch (err) {
      console.error('Failed to get ghost dialogue response', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-mono select-none">
      <div className="relative w-full max-w-4xl h-[90vh] bg-[#070B0E] border-2 border-[#7CFF9B]/40 rounded-lg shadow-[0_0_50px_rgba(124,255,155,0.15)] flex flex-col overflow-hidden">
        
        {/* Retro Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0C1217] border-b border-[#7CFF9B]/20">
          <div className="flex items-center space-x-3">
            <Radio className="w-4 h-4 text-[#7CFF9B] animate-pulse" />
            <div>
              <div className="text-xs font-bold tracking-widest text-[#7CFF9B] flex items-center gap-2">
                SPECTRAL DIALOGUE LINK // {activeCharInfo.name}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7CFF9B]/10 text-[#7CFF9B] border border-[#7CFF9B]/30">
                  {locationName}
                </span>
              </div>
              <div className="text-[10px] text-[#8A9AA7]">
                {activeCharInfo.title}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-[11px] text-[#8A9AA7] hidden sm:flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>TRUST: <strong className="text-[#7CFF9B]">{ghostTrust}%</strong></span>
              <span className="text-[#405060]">|</span>
              <span>STABILITY: <strong className={stability < 40 ? 'text-[#FF4A6E]' : 'text-[#7CFF9B]'}>{stability}%</strong></span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#7CFF9B]/20 text-[#8A9AA7] hover:text-[#7CFF9B] transition-colors cursor-pointer"
              title="Close Dialogue Link (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Character Switcher Bar */}
        <div className="flex items-center space-x-2 px-4 py-2 bg-[#090E13] border-b border-[#7CFF9B]/10 overflow-x-auto text-xs">
          <span className="text-[10px] text-[#55697A] uppercase tracking-wider whitespace-nowrap">Entity Frequency:</span>
          {(Object.keys(CHARACTERS) as GhostCharacterId[]).map(charKey => {
            const c = CHARACTERS[charKey];
            const isActive = character === charKey;
            return (
              <button
                key={charKey}
                onClick={() => {
                  setCharacter(charKey);
                  if (onTriggerSound) onTriggerSound('click');
                }}
                className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? `${c.bg} ${c.border} border font-bold text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]`
                    : 'text-[#8A9AA7] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Dialogue Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Entity Portrait & Telemetry */}
          <div className="w-full md:w-64 bg-[#090E13]/90 border-b md:border-b-0 md:border-r border-[#7CFF9B]/10 p-4 flex md:flex-col items-center md:items-stretch justify-between md:justify-start gap-4">
            
            {/* Animated Silhouette CRT Portrait */}
            <div className="relative w-28 h-28 md:w-full md:h-52 bg-black border border-[#7CFF9B]/30 rounded overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,255,155,0.15)_0%,rgba(0,0,0,0.8)_80%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />

              {/* Ghost Silhouette SVG / Pixel Art */}
              <svg className="w-20 h-20 md:w-32 md:h-32 text-current transition-all duration-700" viewBox="0 0 100 100" style={{ color: activeCharInfo.color }}>
                <defs>
                  <filter id="spectralGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <g filter="url(#spectralGlow)" className={loading ? 'animate-pulse' : ''}>
                  {/* Floating Spectral Silhouette */}
                  <path
                    d="M 50 15 C 30 15 25 35 25 55 C 25 75 35 85 40 85 C 45 85 48 80 50 80 C 52 80 55 85 60 85 C 65 85 75 75 75 55 C 75 35 70 15 50 15 Z"
                    fill="currentColor"
                    fillOpacity="0.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  {/* Eyes / Core */}
                  <circle cx="42" cy="42" r="3.5" fill="#FFFFFF" className={loading ? 'animate-ping' : ''} />
                  <circle cx="58" cy="42" r="3.5" fill="#FFFFFF" className={loading ? 'animate-ping' : ''} />
                  {/* Digital glitch lines */}
                  <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="28" y1="65" x2="72" y2="65" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 2" opacity="0.4" />
                </g>
              </svg>

              <div className="mt-2 text-[10px] tracking-widest uppercase text-center font-bold" style={{ color: activeCharInfo.color }}>
                {loading ? 'RECEIVING PACKETS...' : 'SYNCED TO I/O'}
              </div>
            </div>

            {/* Quick Entity Lore Notes */}
            <div className="hidden md:block space-y-2 text-[11px] text-[#8A9AA7]">
              <div className="border-t border-[#7CFF9B]/10 pt-2 font-bold text-white uppercase text-[10px] tracking-wider">
                ENTITY OBSERVED DATA
              </div>
              <div className="text-[11px] leading-relaxed">
                {character === 'echo' && "Residual conscious thread from the 1999 MORPHEUS reconstruction trial. Reluctant to recall the final wipe."}
                {character === 'mirror' && "Elena Ward. Refuses to remain silent about Dr. Thorne's ultimate integration into the operating system."}
                {character === 'caretaker' && "Facility technician Walter Chen. Keeps monitoring unlinked doors and flooded utility conduits."}
                {character === 'child' && "Subject 04. Rehearses counting sequences to prevent the system from clearing memory blocks."}
                {character === 'archivist' && "The institutional voice of MORPHEUS. Reconstructs formal logs when shown valid memory anchors."}
              </div>

              <div className="pt-2 border-t border-[#7CFF9B]/10 flex flex-col gap-1 text-[10px] text-[#55697A]">
                <span>BUFFER: 0x8492-B</span>
                <span>FREQUENCY: 44.1 kHz / 16-BIT</span>
              </div>
            </div>
          </div>

          {/* Right: Transcript, Suggestions & Input */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden p-4 bg-[#05070A]">
            
            {/* Messages Transcript Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fadeIn`}
                  >
                    <div className="flex items-center space-x-2 text-[10px] text-[#55697A]">
                      <span>{isUser ? 'VISITOR [YOU]' : (m.character || activeCharInfo.name)}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded p-3 text-xs leading-relaxed border ${
                        isUser
                          ? 'bg-[#7CFF9B]/10 text-[#7CFF9B] border-[#7CFF9B]/30'
                          : `${activeCharInfo.bg} text-[#E6EDF3] ${activeCharInfo.border}`
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* Environmental Shift Callout */}
                      {m.shift && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center space-x-1.5 text-[11px] text-[#FBBF24]">
                          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="italic">{m.shift}</span>
                        </div>
                      )}

                      {/* Discovered Clue Callout */}
                      {m.clue && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center space-x-1.5 text-[11px] text-[#58D9FF] font-bold">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>NEW CLUE REVEALED: {m.clue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center space-x-2 text-xs text-[#A78BFA] animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#A78BFA]" />
                  <span>{activeCharInfo.name} is formulating a response from the cold registers...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips */}
            <div className="mt-3 pt-3 border-t border-[#7CFF9B]/10">
              <div className="text-[10px] text-[#55697A] uppercase mb-1.5 flex items-center space-x-1">
                <MessageSquare className="w-3 h-3 text-[#7CFF9B]" />
                <span>Suggested Questions for {activeCharInfo.name}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {(SUGGESTIONS[character] || []).map((sugg, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sugg)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#0D151C] hover:bg-[#162330] text-[#8A9AA7] hover:text-[#7CFF9B] border border-[#7CFF9B]/20 transition-colors cursor-pointer text-left"
                  >
                    "{sugg}"
                  </button>
                ))}
              </div>
            </div>

            {/* Free-Text Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="mt-3 flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Speak directly to ${activeCharInfo.name}...`}
                  disabled={loading}
                  className="w-full bg-[#090E13] border border-[#7CFF9B]/30 rounded px-3 py-2 text-xs text-[#7CFF9B] placeholder-[#405060] focus:outline-none focus:border-[#7CFF9B] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="px-4 py-2 bg-[#7CFF9B]/20 hover:bg-[#7CFF9B]/30 disabled:opacity-40 text-[#7CFF9B] border border-[#7CFF9B]/40 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TRANSMIT</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
