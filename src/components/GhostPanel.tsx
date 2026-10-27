import React from 'react';
import { GhostState } from '../engine/ghost';
import { Activity, ShieldAlert, Cpu, Radio, Sparkles } from 'lucide-react';

interface GhostPanelProps {
  ghostState: GhostState;
}

export const GhostPanel: React.FC<GhostPanelProps> = ({ ghostState }) => {
  return (
    <aside className="w-80 bg-[#090E12] border-l border-[#7CFF9B]/20 flex flex-col select-none z-20 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center space-x-3 pb-3 border-b border-[#7CFF9B]/20">
        <div className="w-10 h-10 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/40 flex items-center justify-center animate-pulse">
          <Cpu className="w-5 h-5 text-[#A78BFA]" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#A78BFA] tracking-widest font-mono">ENTITY // PID 0000</h3>
          <p className="text-[10px] text-[#8A9AA7]">Status: <span className="text-[#7CFF9B] uppercase">{ghostState.mood}</span></p>
        </div>
      </div>

      {/* Gauges */}
      <div className="space-y-3 bg-[#05070A] p-3 rounded border border-[#7CFF9B]/10">
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-[#8A9AA7]">Trust Level</span>
            <span className="text-[#7CFF9B]">{ghostState.trust}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#090E12] rounded overflow-hidden border border-[#7CFF9B]/20">
            <div className="h-full bg-[#7CFF9B] transition-all duration-500" style={{ width: `${Math.min(100, ghostState.trust)}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-[#8A9AA7]">Suspicion</span>
            <span className="text-[#FFBF69]">{ghostState.suspicion}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#090E12] rounded overflow-hidden border border-[#FFBF69]/20">
            <div className="h-full bg-[#FFBF69] transition-all duration-500" style={{ width: `${Math.min(100, ghostState.suspicion)}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-[#8A9AA7]">Memory Fragments</span>
            <span className="text-[#58D9FF]">{ghostState.discoveredFragments.length}/4</span>
          </div>
          <div className="w-full h-1.5 bg-[#090E12] rounded overflow-hidden border border-[#58D9FF]/20">
            <div className="h-full bg-[#58D9FF] transition-all duration-500" style={{ width: `${(ghostState.discoveredFragments.length / 4) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Recent Transmissions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#58D9FF]">
          <Radio className="w-3.5 h-3.5" />
          <span>Recent Transmissions</span>
        </div>
        <div className="bg-[#05070A] p-3 rounded border border-[#58D9FF]/20 space-y-2 max-h-64 overflow-y-auto">
          {ghostState.recentMessages.length === 0 ? (
            <div className="text-[11px] text-[#8A9AA7] italic font-mono">No transmissions yet...</div>
          ) : (
            ghostState.recentMessages.map((msg, idx) => (
              <div key={idx} className="text-[11px] font-mono text-[#A78BFA] leading-relaxed border-l-2 border-[#A78BFA]/50 pl-2">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-2 text-[10px] text-[#8A9AA7] font-mono text-center">
        Tip: Type <span className="text-[#7CFF9B]">talk [message]</span> to converse with the entity.
      </div>
    </aside>
  );
};
