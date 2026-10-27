import React, { useState } from 'react';
import { Mission } from '../engine/missions';
import { LoreEntry, Achievement } from '../engine/loreAndAchievements';
import { X, CheckCircle2, Circle, Award, Database, BookOpen, Shield, Settings as SettingsIcon, Scroll, Sparkles } from 'lucide-react';

interface MissionsModalProps {
  missions: Mission[];
  onClose: () => void;
}

export const MissionsView: React.FC<MissionsModalProps> = ({ missions }) => {
  return (
    <div className="flex-1 bg-[#05070A] p-6 font-mono overflow-y-auto space-y-6">
      <div className="border-b border-[#7CFF9B]/20 pb-4">
        <h2 className="text-lg font-bold text-[#7CFF9B] tracking-widest flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-[#58D9FF]" />
          <span>CHAPTER MISSIONS & OBJECTIVES</span>
        </h2>
        <p className="text-xs text-[#8A9AA7]">Complete objectives to unravel the mystery of PHANTOM SHELL.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {missions.map(m => (
          <div key={m.id} className={`p-4 rounded border ${m.completed ? 'bg-[#7CFF9B]/5 border-[#7CFF9B]/40' : 'bg-[#090E12] border-[#7CFF9B]/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#7CFF9B]">{m.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${m.completed ? 'bg-[#7CFF9B]/20 text-[#7CFF9B]' : 'bg-[#FFBF69]/20 text-[#FFBF69]'}`}>
                {m.completed ? 'COMPLETED' : 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-[#8A9AA7] mb-3">{m.description}</p>
            <div className="space-y-1.5 pl-2 border-l border-[#7CFF9B]/20">
              {m.objectives.map(o => (
                <div key={o.id} className="flex items-center space-x-2 text-xs">
                  {o.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-[#7CFF9B]" /> : <Circle className="w-3.5 h-3.5 text-[#8A9AA7]" />}
                  <span className={o.completed ? 'text-[#7CFF9B] line-through opacity-80' : 'text-[#8A9AA7]'}>{o.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-[#58D9FF] font-semibold">
              Reward: {m.rewardText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FragmentsViewProps {
  discoveredFragments: string[];
}

export const FragmentsView: React.FC<FragmentsViewProps> = ({ discoveredFragments }) => {
  const fragments = [
    { id: 'fragment_001.mem', title: 'Memory Fragment 01', content: '"The screen wasn\'t always black. Before the power cut, there were windows..."' },
    { id: 'fragment_002.mem', title: 'Memory Fragment 02', content: '"They left their name in the registry, but the ink dissolved..."' },
    { id: 'fragment_003.mem', title: 'Memory Fragment 03', content: '"The code isn\'t binary anymore. It\'s breathing..."' },
    { id: 'fragment_004.mem', title: 'Memory Fragment 04', content: '"The final command isn\'t exit. It\'s remember..."' },
  ];

  return (
    <div className="flex-1 bg-[#05070A] p-6 font-mono overflow-y-auto space-y-6">
      <div className="border-b border-[#7CFF9B]/20 pb-4">
        <h2 className="text-lg font-bold text-[#58D9FF] tracking-widest flex items-center space-x-2">
          <Database className="w-5 h-5 text-[#58D9FF]" />
          <span>MEMORY FRAGMENTS ARCHIVE</span>
        </h2>
        <p className="text-xs text-[#8A9AA7]">Discovered residual data buffers from previous sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fragments.map(f => {
          const unlocked = discoveredFragments.includes(f.id);
          return (
            <div key={f.id} className={`p-4 rounded border ${unlocked ? 'bg-[#58D9FF]/5 border-[#58D9FF]/40 text-[#58D9FF]' : 'bg-[#090E12] border-[#8A9AA7]/20 text-[#8A9AA7]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{f.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${unlocked ? 'bg-[#58D9FF]/20 text-[#58D9FF]' : 'bg-[#8A9AA7]/20 text-[#8A9AA7]'}`}>
                  {unlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <p className="text-xs font-mono leading-relaxed italic">
                {unlocked ? f.content : '?? [Inspect /archive/' + f.id + ' in terminal to unlock] ??'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CodexViewProps {}
export const CodexView: React.FC<CodexViewProps> = () => {
  const commands = [
    { cmd: 'help', desc: 'Display command reference' },
    { cmd: 'ls [-a]', desc: 'List files (use -a for hidden files)' },
    { cmd: 'cd [path]', desc: 'Change virtual directory' },
    { cmd: 'cat [file]', desc: 'Read file contents' },
    { cmd: 'pwd', desc: 'Print working directory' },
    { cmd: 'tree', desc: 'Display directory hierarchy' },
    { cmd: 'rooms / sectors', desc: 'List all 23 facility sectors & status' },
    { cmd: 'goto [sector]', desc: 'Translocate directly to unlocked room' },
    { cmd: 'quests', desc: 'Display cross-room investigations & objectives' },
    { cmd: 'power [toggle] [circuit]', desc: 'Control facility breaker grid' },
    { cmd: 'drain', desc: 'Engage emergency pumps to drain floodwaters' },
    { cmd: 'map', desc: 'Display ASCII schematic blueprint of active level' },
    { cmd: 'inspect [target]', desc: 'Examine room objects (mirror, phone, clock, desk)' },
    { cmd: 'talk [query]', desc: 'Converse with spectral entity via neural link' },
    { cmd: 'whoami', desc: 'Display visitor identity & session PID' },
    { cmd: 'scan [--deep]', desc: 'Scan spectral environment & frequencies' },
    { cmd: 'missions', desc: 'View active chapters and objectives' },
    { cmd: 'status', desc: 'Display session diagnostics & narrative state' },
    { cmd: 'save', desc: 'Save game progress to local storage' }
  ];

  return (
    <div className="flex-1 bg-[#05070A] p-6 font-mono overflow-y-auto space-y-6">
      <div className="border-b border-[#7CFF9B]/20 pb-4">
        <h2 className="text-lg font-bold text-[#7CFF9B] tracking-widest flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#7CFF9B]" />
          <span>COMMAND CODEX</span>
        </h2>
        <p className="text-xs text-[#8A9AA7]">Supported virtual terminal instructions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {commands.map((c, i) => (
          <div key={i} className="p-3 bg-[#090E12] border border-[#7CFF9B]/20 rounded flex flex-col justify-between">
            <span className="text-xs font-bold text-[#7CFF9B] font-mono">{c.cmd}</span>
            <span className="text-xs text-[#8A9AA7] mt-1">{c.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface LoreViewProps {
  lore: LoreEntry[];
}
export const LoreView: React.FC<LoreViewProps> = ({ lore }) => {
  return (
    <div className="flex-1 bg-[#05070A] p-6 font-mono overflow-y-auto space-y-6">
      <div className="border-b border-[#7CFF9B]/20 pb-4">
        <h2 className="text-lg font-bold text-[#A78BFA] tracking-widest flex items-center space-x-2">
          <Scroll className="w-5 h-5 text-[#A78BFA]" />
          <span>LORE ARCHIVE</span>
        </h2>
        <p className="text-xs text-[#8A9AA7]">Historical records and recovered research notes.</p>
      </div>

      <div className="space-y-4">
        {lore.map(l => (
          <div key={l.id} className={`p-4 rounded border ${l.unlocked ? 'bg-[#A78BFA]/5 border-[#A78BFA]/40' : 'bg-[#090E12] border-[#8A9AA7]/20'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-sm font-bold ${l.unlocked ? 'text-[#A78BFA]' : 'text-[#8A9AA7]'}`}>{l.title}</h3>
              <span className="text-[10px] text-[#8A9AA7]">{l.timestamp}</span>
            </div>
            <p className="text-xs text-[#8A9AA7] leading-relaxed">
              {l.unlocked ? l.content : '?? [Restricted Record - Explore terminal to unlock] ??'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AchievementsViewProps {
  achievements: Achievement[];
}
export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements }) => {
  return (
    <div className="flex-1 bg-[#05070A] p-6 font-mono overflow-y-auto space-y-6">
      <div className="border-b border-[#7CFF9B]/20 pb-4">
        <h2 className="text-lg font-bold text-[#FFBF69] tracking-widest flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#FFBF69]" />
          <span>ACHIEVEMENTS</span>
        </h2>
        <p className="text-xs text-[#8A9AA7]">Milestones unlocked during your terminal exploration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(a => (
          <div key={a.id} className={`p-4 rounded border flex items-start space-x-3 ${a.unlocked ? 'bg-[#FFBF69]/10 border-[#FFBF69]/50' : 'bg-[#090E12] border-[#8A9AA7]/20 opacity-60'}`}>
            <Award className={`w-6 h-6 shrink-0 ${a.unlocked ? 'text-[#FFBF69]' : 'text-[#8A9AA7]'}`} />
            <div>
              <h3 className={`text-xs font-bold ${a.unlocked ? 'text-[#FFBF69]' : 'text-[#8A9AA7]'}`}>{a.title}</h3>
              <p className="text-[11px] text-[#8A9AA7] mt-1">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SettingsViewProps {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  staticHissEnabled: boolean;
  setStaticHissEnabled: (v: boolean) => void;
  whispersEnabled: boolean;
  setWhispersEnabled: (v: boolean) => void;
  fxEnabled: boolean;
  setFxEnabled: (v: boolean) => void;
  geminiApiKey: string;
  setGeminiApiKey: (v: string) => void;
  onResetStory: () => void;
}
export const SettingsView: React.FC<SettingsViewProps> = ({
  soundEnabled,
  setSoundEnabled,
  staticHissEnabled,
  setStaticHissEnabled,
  whispersEnabled,
  setWhispersEnabled,
  fxEnabled,
  setFxEnabled,
  geminiApiKey,
  setGeminiApiKey,
  onResetStory
}) => {
  const [keySaved, setKeySaved] = useState(false);

  return (
    <div className="flex-1 bg-[#05070A] p-6 font-mono overflow-y-auto space-y-6">
      <div className="border-b border-[#7CFF9B]/20 pb-4">
        <h2 className="text-lg font-bold text-[#7CFF9B] tracking-widest flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-[#7CFF9B]" />
          <span>SYSTEM PREFERENCES</span>
        </h2>
        <p className="text-xs text-[#8A9AA7]">Configure terminal audio, static hiss, ghostly whispers, and API credentials.</p>
      </div>

      <div className="space-y-4 max-w-xl">
        <div className="p-4 bg-[#090E12] border border-[#7CFF9B]/20 rounded flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#7CFF9B]">Sound Effects & Key Clicks</div>
            <div className="text-[11px] text-[#8A9AA7]">Play subtle key clicks and confirmation tones.</div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded text-xs border ${soundEnabled ? 'bg-[#7CFF9B]/20 text-[#7CFF9B] border-[#7CFF9B]/40' : 'bg-[#05070A] text-[#8A9AA7] border-[#8A9AA7]/30'}`}
          >
            {soundEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        <div className="p-4 bg-[#090E12] border border-[#58D9FF]/20 rounded flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#58D9FF]">Static Hiss (Ambient Radio)</div>
            <div className="text-[11px] text-[#8A9AA7]">Continuous analog noise floor simulation.</div>
          </div>
          <button
            onClick={() => setStaticHissEnabled(!staticHissEnabled)}
            className={`px-3 py-1.5 rounded text-xs border ${staticHissEnabled ? 'bg-[#58D9FF]/20 text-[#58D9FF] border-[#58D9FF]/40' : 'bg-[#05070A] text-[#8A9AA7] border-[#8A9AA7]/30'}`}
          >
            {staticHissEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        <div className="p-4 bg-[#090E12] border border-[#A78BFA]/20 rounded flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#A78BFA]">Ghostly Whispers</div>
            <div className="text-[11px] text-[#8A9AA7]">Procedural ethereal audio swells based on ghost mood.</div>
          </div>
          <button
            onClick={() => setWhispersEnabled(!whispersEnabled)}
            className={`px-3 py-1.5 rounded text-xs border ${whispersEnabled ? 'bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/40' : 'bg-[#05070A] text-[#8A9AA7] border-[#8A9AA7]/30'}`}
          >
            {whispersEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        <div className="p-4 bg-[#090E12] border border-[#7CFF9B]/20 rounded flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#58D9FF]">CRT Scanlines & Phosphor Glow</div>
            <div className="text-[11px] text-[#8A9AA7]">Enable analog terminal aesthetic overlays.</div>
          </div>
          <button
            onClick={() => setFxEnabled(!fxEnabled)}
            className={`px-3 py-1.5 rounded text-xs border ${fxEnabled ? 'bg-[#58D9FF]/20 text-[#58D9FF] border-[#58D9FF]/40' : 'bg-[#05070A] text-[#8A9AA7] border-[#8A9AA7]/30'}`}
          >
            {fxEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Gemini API Key Configuration Section */}
        <div className="p-4 bg-[#090E12] border border-[#A78BFA]/40 rounded space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#A78BFA]">
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
            <span>Gemini API Key Configuration</span>
          </div>
          <div className="text-[11px] text-[#8A9AA7]">
            Provide your custom Gemini API key. Stored securely in session state for AI-powered dialogue and ghostly analysis.
          </div>
          <div className="flex space-x-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiApiKey}
              onChange={e => setGeminiApiKey(e.target.value)}
              className="flex-1 bg-[#05070A] border border-[#A78BFA]/40 rounded px-3 py-1.5 text-xs text-[#7CFF9B] font-mono focus:outline-none"
            />
            <button
              onClick={() => {
                sessionStorage.setItem('phantom_gemini_api_key', geminiApiKey);
                setKeySaved(true);
                setTimeout(() => setKeySaved(false), 3000);
              }}
              className="px-4 py-1.5 bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 rounded text-xs hover:bg-[#A78BFA]/30 cursor-pointer"
            >
              {keySaved ? 'SAVED!' : 'SAVE KEY'}
            </button>
          </div>
          {keySaved && (
            <div className="text-[10px] text-[#7CFF9B]">API key securely stored in session state.</div>
          )}
        </div>

        <div className="p-4 bg-[#090E12] border border-[#FF5263]/20 rounded flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#FF5263]">Reset Story Progress</div>
            <div className="text-[11px] text-[#8A9AA7]">Erase all saved game state and restart terminal.</div>
          </div>
          <button
            onClick={onResetStory}
            className="px-3 py-1.5 rounded text-xs border bg-[#FF5263]/20 text-[#FF5263] border-[#FF5263]/40 hover:bg-[#FF5263]/35 cursor-pointer"
          >
            RESET STORY
          </button>
        </div>
      </div>
    </div>
  );
};
