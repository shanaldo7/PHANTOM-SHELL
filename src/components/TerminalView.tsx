import React, { useState, useRef, useEffect } from 'react';
import { CommandOutput, TerminalEngineContext, executeCommand } from '../engine/terminalEngine';
import { Terminal as TerminalIcon, Sparkles, Send, Trash2, HelpCircle } from 'lucide-react';

interface TerminalViewProps {
  ctx: TerminalEngineContext;
  outputs: CommandOutput[];
  setOutputs: React.Dispatch<React.SetStateAction<CommandOutput[]>>;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ ctx, outputs, setOutputs }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!input.trim()) return;
      ctx.triggerSound('click');
      const res = executeCommand(input, ctx);
      setOutputs(prev => [...prev, res]);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (ctx.commandHistory.length > 0 && ctx.historyIndex > 0) {
        ctx.historyIndex--;
        setInput(ctx.commandHistory[ctx.historyIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (ctx.historyIndex < ctx.commandHistory.length - 1) {
        ctx.historyIndex++;
        setInput(ctx.commandHistory[ctx.historyIndex] || '');
      } else {
        ctx.historyIndex = ctx.commandHistory.length;
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab autocomplete for commands
      const knownCommands = ['help', 'pwd', 'ls', 'cd', 'tree', 'clear', 'whoami', 'date', 'history', 'cat', 'head', 'tail', 'stat', 'find', 'grep', 'file', 'strings', 'ps', 'top', 'uptime', 'uname', 'free', 'df', 'netstat', 'ping', 'talk', 'inspect', 'scan', 'listen', 'remember', 'trust', 'missions', 'status', 'lore', 'save', 'reset', 'exit'];
      const match = knownCommands.find(c => c.startsWith(input.trim().toLowerCase()));
      if (match) {
        setInput(match);
      }
    }
  };

  const handleQuickCommand = (cmd: string) => {
    ctx.triggerSound('click');
    const res = executeCommand(cmd, ctx);
    setOutputs(prev => [...prev, res]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05070A] font-mono overflow-hidden relative">
      {/* Quick Actions Bar */}
      <div className="bg-[#090E12] border-b border-[#7CFF9B]/20 p-2 flex items-center space-x-2 overflow-x-auto text-xs shrink-0 select-none">
        <span className="text-[#8A9AA7] pl-1 font-bold">Quick:</span>
        {['help', 'ls -a', 'tree', 'missions', 'status', 'talk who are you', 'clear'].map(cmd => (
          <button
            key={cmd}
            onClick={() => {
              if (cmd === 'clear') {
                setOutputs([]);
              } else {
                handleQuickCommand(cmd);
              }
            }}
            className="px-2.5 py-1 bg-[#7CFF9B]/10 hover:bg-[#7CFF9B]/20 text-[#7CFF9B] border border-[#7CFF9B]/30 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-xs text-[#8A9AA7] space-y-1">
          <div>PHANTOM SHELL // KERNEL 6.14.0-phantom-generic</div>
          <div>Connected to virtual session #8492-B. Type <span className="text-[#7CFF9B]">help</span> for command reference.</div>
        </div>

        {outputs.map(item => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#58D9FF]">visitor@phantom:{ctx.vfs.currentPath}$</span>
              <span className="text-[#7CFF9B]">{item.command}</span>
              <span className="text-[10px] text-[#8A9AA7] ml-auto">{item.timestamp}</span>
            </div>
            {item.output && (
              <pre className={`text-xs md:text-sm whitespace-pre-wrap font-mono leading-relaxed p-2 rounded ${
                item.type === 'ghost' ? 'text-[#A78BFA] bg-[#A78BFA]/10 border-l-2 border-[#A78BFA]' :
                item.type === 'error' ? 'text-[#FF5263] bg-[#FF5263]/10 border-l-2 border-[#FF5263]' :
                item.type === 'warning' ? 'text-[#FFBF69] bg-[#FFBF69]/10 border-l-2 border-[#FFBF69]' :
                item.type === 'system' ? 'text-[#58D9FF] bg-[#58D9FF]/10 border-l-2 border-[#58D9FF]' :
                'text-[#7CFF9B]'
              } ${item.isGlitchy ? 'glitch-effect' : ''}`}>
                {item.output}
              </pre>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Bar */}
      <div className="p-3 bg-[#090E12] border-t border-[#7CFF9B]/20 flex items-center space-x-2 shrink-0">
        <span className="text-xs text-[#58D9FF] font-bold">visitor@phantom:{ctx.vfs.currentPath}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command (e.g. 'help', 'ls -a', 'talk')..."
          className="flex-1 bg-transparent text-[#7CFF9B] text-xs md:text-sm font-mono focus:outline-none placeholder-[#8A9AA7]/50"
          autoFocus
        />
        <button
          onClick={() => {
            if (!input.trim()) return;
            ctx.triggerSound('click');
            const res = executeCommand(input, ctx);
            setOutputs(prev => [...prev, res]);
            setInput('');
          }}
          className="px-3 py-1.5 bg-[#7CFF9B]/20 hover:bg-[#7CFF9B]/30 text-[#7CFF9B] border border-[#7CFF9B]/40 rounded text-xs transition-colors cursor-pointer flex items-center space-x-1"
        >
          <span>EXEC</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
