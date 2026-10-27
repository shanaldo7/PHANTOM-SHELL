import React, { useState, useEffect } from 'react';
import { assetManager, AssetDiagnosticEntry } from '../engine/assetManager';
import { Layers, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface AssetDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetDiagnosticsModal: React.FC<AssetDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<AssetDiagnosticEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'player' | 'ghost' | 'furniture'>('all');
  const [simulateFail, setSimulateFail] = useState(assetManager.simulateFailure);
  const [forceProc, setForceProc] = useState(assetManager.forceProcedural);

  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      setDiagnostics(assetManager.getDiagnostics());
      setSimulateFail(assetManager.simulateFailure);
      setForceProc(assetManager.forceProcedural);
    };

    update();
    const unsub = assetManager.subscribe(update);
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filter === 'all' 
    ? diagnostics 
    : diagnostics.filter(d => d.category === filter);

  const tierCounts = {
    tier1: diagnostics.filter(d => d.activeTier === 'tier1_primary').length,
    tier2: diagnostics.filter(d => d.activeTier === 'tier2_secondary').length,
    tier3: diagnostics.filter(d => d.activeTier === 'tier3_procedural').length,
    tier4: diagnostics.filter(d => d.activeTier === 'tier4_placeholder').length,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-[#070b10] border border-[#00e5ff]/50 rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col shadow-[0_0_30px_rgba(0,229,255,0.25)] text-xs text-[#cbd5e1]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#142838] bg-[#05080c]">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-4 h-4 text-[#00e5ff]" />
            <span className="font-bold tracking-wider text-white">
              RETRO ASSET MANAGER // 4-TIER PIPELINE DIAGNOSTICS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748b] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resilience Summary Bar */}
        <div className="p-4 bg-[#090e15] border-b border-[#142838] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#7cff9b]" />
              <span className="text-[11px] text-[#7cff9b] font-bold">
                DECOUPLED LOGIC ENGINE: ACTIVE & SECURE
              </span>
            </div>
            <div className="text-[10px] text-[#94a3b8]">
              Gameplay (movement, dialogue, triggers) never blocks on missing assets
            </div>
          </div>

          {/* Tier Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-2 bg-[#0c1622] border border-[#1b2f44] rounded">
              <div className="text-[#94a3b8]">TIER 1 (PRIMARY)</div>
              <div className="text-sm font-bold text-[#00e5ff]">{tierCounts.tier1} Assets</div>
            </div>
            <div className="p-2 bg-[#0c1622] border border-[#1b2f44] rounded">
              <div className="text-[#94a3b8]">TIER 2 (SECONDARY)</div>
              <div className="text-sm font-bold text-[#58d9ff]">{tierCounts.tier2} Assets</div>
            </div>
            <div className="p-2 bg-[#0c1622] border border-[#1b2f44] rounded">
              <div className="text-[#94a3b8]">TIER 3 (PROCEDURAL)</div>
              <div className="text-sm font-bold text-[#7cff9b]">{tierCounts.tier3} Active</div>
            </div>
            <div className="p-2 bg-[#0c1622] border border-[#1b2f44] rounded">
              <div className="text-[#94a3b8]">TIER 4 (PLACEHOLDER)</div>
              <div className="text-sm font-bold text-[#f59e0b]">{tierCounts.tier4} Active</div>
            </div>
          </div>

          {/* Resilience Simulation Controls */}
          <div className="flex items-center space-x-3 pt-1 flex-wrap gap-2">
            <button
              onClick={() => {
                const next = !simulateFail;
                assetManager.setSimulateFailure(next);
                setSimulateFail(next);
              }}
              className={`px-3 py-1 rounded text-[11px] flex items-center space-x-1.5 border transition-all cursor-pointer ${
                simulateFail
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-[#132333] border-[#22405d] text-[#94a3b8] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Missing Assets: {simulateFail ? 'ON (Tier 4 Force)' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                const next = !forceProc;
                assetManager.setForceProcedural(next);
                setForceProc(next);
              }}
              className={`px-3 py-1 rounded text-[11px] flex items-center space-x-1.5 border transition-all cursor-pointer ${
                forceProc
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-[#132333] border-[#22405d] text-[#94a3b8] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Force Pure Procedural: {forceProc ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                assetManager.reloadAll();
              }}
              className="px-3 py-1 rounded text-[11px] bg-[#132333] border border-[#22405d] text-[#00e5ff] hover:bg-[#1a324a] flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Pipeline</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 px-4 py-2 border-b border-[#142838] bg-[#060a0f]">
          <span className="text-[10px] text-[#64748b] mr-2">CATEGORY:</span>
          {(['all', 'player', 'ghost', 'furniture'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase cursor-pointer ${
                filter === cat
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Asset Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map(asset => {
            const previewCanvas = assetManager.getAssetCanvas(asset.id, 0);
            return (
              <div
                key={asset.id}
                className="flex items-center justify-between p-2.5 bg-[#0a1017] border border-[#142436] rounded hover:border-[#1f3c5b] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Mini Preview Box with Nearest-Neighbor rendering */}
                  <div className="w-10 h-10 bg-black border border-[#1b2f44] flex items-center justify-center p-1 rounded overflow-hidden">
                    <img
                      src={previewCanvas.toDataURL()}
                      alt={asset.name}
                      className="max-w-full max-h-full object-contain [image-rendering:pixelated]"
                    />
                  </div>

                  <div>
                    <div className="font-bold text-white text-[11px] flex items-center space-x-2">
                      <span>{asset.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#1e293b] text-[#94a3b8] font-normal uppercase">
                        {asset.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#64748b] truncate max-w-md">
                      ID: {asset.id} {asset.primaryPath ? `// ${asset.primaryPath}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.activeTier === 'tier1_primary'
                        ? 'bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30'
                        : asset.activeTier === 'tier2_secondary'
                        ? 'bg-[#58d9ff]/15 text-[#58d9ff] border border-[#58d9ff]/30'
                        : asset.activeTier === 'tier3_procedural'
                        ? 'bg-[#7cff9b]/15 text-[#7cff9b] border border-[#7cff9b]/30'
                        : 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                    }`}
                  >
                    {asset.activeTier.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-[9px] text-[#94a3b8] hidden sm:inline">
                    {asset.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#142838] bg-[#05080c] flex items-center justify-between text-[10px] text-[#64748b]">
          <span>PHANTOM SHELL ASSET SUBSYSTEM v6.14</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#132333] hover:bg-[#1a324a] text-white rounded cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
