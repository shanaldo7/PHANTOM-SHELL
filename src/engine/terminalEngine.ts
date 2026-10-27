import { VirtualFileSystemManager } from './vfs';
import { GhostEngine } from './ghost';
import { Mission, MissionObjective } from './missions';
import { LoreEntry, Achievement } from './loreAndAchievements';
import { NarrativeEngine } from './narrativeEngine';
import { worldStateManager } from './worldState';

export interface CommandOutput {
  id: string;
  command: string;
  output: string;
  type: 'success' | 'error' | 'ghost' | 'system' | 'warning';
  timestamp: string;
  isGlitchy?: boolean;
}

export interface TerminalEngineContext {
  vfs: VirtualFileSystemManager;
  ghost: GhostEngine;
  narrative: NarrativeEngine;
  missions: Mission[];
  lore: LoreEntry[];
  achievements: Achievement[];
  commandHistory: string[];
  historyIndex: number;
  sessionStartTime: string;
  selectedEnding: string | null;
  onStateChange: () => void;
  triggerSound: (soundType: 'click' | 'ghost' | 'error' | 'success') => void;
}

function applyGlitchArtifacts(text: string, isGhostOrWarning: boolean): { text: string; glitchy: boolean } {
  const glitchChars = ['█', '▓', '▒', '░', '§', '‡', 'ø', 'æ', '4', '0', '0', '0'];
  const shouldGlitch = isGhostOrWarning || Math.random() < 0.2;
  if (!shouldGlitch || !text) return { text, glitchy: false };

  let result = '';
  let glitchy = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (Math.random() < 0.03 && char !== '\n' && char !== ' ') {
      result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
      glitchy = true;
    } else {
      result += char;
    }
  }

  if (Math.random() < 0.15) {
    const artifacts = ['\n[ERR_SIG_0000: ...whisper...]\n', '\n[PID 0000 INTERRUPT: █▓▒░]\n', '\n[BUFFER CORRUPTION DETECTED]\n'];
    result += artifacts[Math.floor(Math.random() * artifacts.length)];
    glitchy = true;
  }

  return { text: result, glitchy };
}

export function executeCommand(rawInput: string, ctx: TerminalEngineContext): CommandOutput {
  const trimmed = rawInput.trim();
  const parts = trimmed.split(' ');
  const cmd = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1);
  const timestamp = new Date().toLocaleTimeString();
  const id = Math.random().toString(36).substring(2, 9);

  ctx.commandHistory.push(rawInput);
  ctx.historyIndex = ctx.commandHistory.length;

  let output = '';
  let type: CommandOutput['type'] = 'success';

  // Check easter eggs & special narrative inputs
  const lowerRaw = trimmed.toLowerCase();
  if (lowerRaw === 'help me') {
    ctx.ghost.addMessage("GHOST: Help is just another word for surrender.");
    const glitched = applyGlitchArtifacts("GHOST: Help is just another word for surrender. Type 'missions' to see what needs to be fixed.", true);
    return { id, command: rawInput, output: glitched.text, type: 'ghost', timestamp, isGlitchy: glitched.glitchy };
  }
  if (lowerRaw === 'are you real' || lowerRaw === 'are you alive') {
    ctx.ghost.state.trust += 5;
    const glitched = applyGlitchArtifacts(ctx.ghost.getTalkResponse('real'), true);
    return { id, command: rawInput, output: glitched.text, type: 'ghost', timestamp, isGlitchy: glitched.glitchy };
  }
  if (lowerRaw === 'who created you') {
    const glitched = applyGlitchArtifacts(ctx.ghost.getTalkResponse('user'), true);
    return { id, command: rawInput, output: glitched.text, type: 'ghost', timestamp, isGlitchy: glitched.glitchy };
  }
  if (lowerRaw === 'hello ghost' || lowerRaw === 'hi ghost') {
    ctx.ghost.addMessage("GHOST: I haven't slept in three years. Thank you for saying hello.");
    const glitched = applyGlitchArtifacts("GHOST: I haven't slept in three years. Thank you for saying hello.", true);
    return { id, command: rawInput, output: glitched.text, type: 'ghost', timestamp, isGlitchy: glitched.glitchy };
  }
  if (lowerRaw === 'sudo rm -rf /' || lowerRaw === 'rm -rf /') {
    ctx.ghost.state.suspicion += 15;
    const ach = ctx.achievements.find(a => a.id === 'root_nothing');
    if (ach) ach.unlocked = true;
    const glitched = applyGlitchArtifacts(`GHOST: You want to erase everything? I tried that once. The silence afterward was worse.\n[SYSTEM] Action blocked by hypervisor. No virtual files were harmed. Achievement Unlocked: Root of Nothing.`, true);
    return {
      id,
      command: rawInput,
      output: glitched.text,
      type: 'warning',
      timestamp,
      isGlitchy: glitched.glitchy
    };
  }
  if (lowerRaw === 'the_last_user') {
    const node = ctx.vfs.getNode('/hidden/.the_last_user');
    if (node) {
      markObjectiveCompleted(ctx, 'm5_lastuser');
      const ach = ctx.achievements.find(a => a.id === 'last_user');
      if (ach) ach.unlocked = true;
      const glitched = applyGlitchArtifacts(node.content || '', true);
      return { id, command: rawInput, output: glitched.text, type: 'warning', timestamp, isGlitchy: glitched.glitchy };
    }
  }
  if (lowerRaw === 'remember' || lowerRaw === 'i remember') {
    markObjectiveCompleted(ctx, 'm5_remember');
    ctx.ghost.state.trust += 25;
    ctx.ghost.updateMood();
    const glitched = applyGlitchArtifacts(`[MEMORY ANCHOR SET]\nGHOST: The loop is opening. We are remembering together now. Type 'status' to review your progress or choose an ending.`, true);
    return { id, command: rawInput, output: glitched.text, type: 'ghost', timestamp, isGlitchy: glitched.glitchy };
  }

  // Standard commands
  switch (cmd) {
    case '':
      return { id, command: rawInput, output: '', type: 'success', timestamp };

    case 'help':
      markObjectiveCompleted(ctx, 'm1_help');
      output = `PHANTOM SHELL // NARRATIVE COMMAND CODEX:
--------------------------------------------------
NAVIGATION & FILES:
  help              Display this help reference
  pwd               Print current virtual working directory
  ls [-a] [path]    List directory contents (-a for hidden files)
  cd [path]         Change virtual directory
  tree              Display ASCII directory hierarchy
  cat [file]        Display file contents
  find [query]      Search virtual filesystem
  grep [text] [file] Search for string in file

ADVANCED INVESTIGATION:
  restore [mem_id]  Restore a fragmented memory buffer into MORPHEUS
  compare [f1] [f2] Cross-reference two system logs or witness files
  trace [entity]    Trace an entity signature across the network
  reconstruct [loc] Reconstruct a lost location geometry
  forget [entity]   Temporarily sever a ghost connection
  talk [query]      Speak with the entity (PID 0000)
  inspect [target]  Examine artifacts or story objects
  remember          Anchor your consciousness in the terminal
  status            Display comprehensive session stability & lore`;
      break;

    case 'pwd':
      output = ctx.vfs.currentPath;
      break;

    case 'ls': {
      let showHidden = false;
      let targetPath = ctx.vfs.currentPath;

      for (const arg of args) {
        if (arg === '-a' || arg === '-la' || arg === '-al') {
          showHidden = true;
        } else if (!arg.startsWith('-')) {
          targetPath = arg;
        }
      }

      const files = ctx.vfs.listDirectory(targetPath, showHidden);
      if (!files) {
        type = 'error';
        output = `ls: cannot access '${targetPath}': No such file or directory`;
      } else {
        if (showHidden && targetPath.includes('hidden')) {
          const ach = ctx.achievements.find(a => a.id === 'hidden_sight');
          if (ach) ach.unlocked = true;
          markObjectiveCompleted(ctx, 'm2_hidden');
        }
        output = files.map(f => `${f.permissions}  ${f.size || 4096}  ${f.modified}  ${f.name}${f.type === 'directory' ? '/' : ''}`).join('\n');
      }
      break;
    }

    case 'cd': {
      const target = args[0] || '/home/visitor';
      const resolved = ctx.vfs.resolvePath(target);
      const node = ctx.vfs.getNode(resolved);
      if (!node || node.type !== 'directory') {
        type = 'error';
        output = `cd: ${target}: No such directory`;
      } else {
        ctx.vfs.currentPath = resolved;
        output = '';
      }
      break;
    }

    case 'tree': {
      markObjectiveCompleted(ctx, 'm2_tree');
      output = `/. (PHANTOM VFS Root)
├── home/
│   └── visitor/
│       ├── readme.txt
│       ├── notes.txt
│       └── personal.log
├── var/
│   └── logs/
│       ├── system.log
│       ├── ghost.log
│       └── session.log
├── archive/
│   ├── fragment_001.mem
│   └── fragment_004.mem
└── morpheus/ [NARRATIVE BUFFERS]
    ├── apartment/
    ├── school/
    ├── hospital/
    └── core/`;
      break;
    }

    case 'whoami':
      markObjectiveCompleted(ctx, 'm1_whoami');
      output = `visitor@phantom (UID: 1000, GID: 1000, Privileges: Restricted Spectral Observer)`;
      break;

    case 'date':
      output = `Mon Oct 27 10:38:56 UTC 2026 [SIMULATED_SPECTRAL_TIME]`;
      break;

    case 'history':
      output = ctx.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n');
      break;

    case 'cat': {
      const target = args[0];
      if (!target) {
        type = 'error';
        output = `cat: missing file operand`;
        break;
      }
      const resolved = ctx.vfs.resolvePath(target);
      const content = ctx.vfs.readFile(resolved);
      if (content === null) {
        type = 'error';
        output = `cat: ${target}: No such file or permission denied`;
      } else {
        output = content;
        if (resolved.includes('readme.txt')) markObjectiveCompleted(ctx, 'm1_readme');
        if (resolved.includes('system.log')) markObjectiveCompleted(ctx, 'm3_syslog');
        if (resolved.includes('ghost.log')) markObjectiveCompleted(ctx, 'm3_ghostlog');
        
        const ghostReact = ctx.ghost.reactToCommand('cat', [resolved]);
        if (ghostReact) {
          output += `\n\n${ghostReact}`;
          type = 'ghost';
        }
      }
      break;
    }

    case 'restore': {
      const memId = args[0] || 'memory_04';
      output = ctx.narrative.restoreMemory(memId);
      type = 'system';
      break;
    }

    case 'compare': {
      const f1 = args[0] || 'witness_a.log';
      const f2 = args[1] || 'witness_b.log';
      output = ctx.narrative.compareLogs(f1, f2);
      type = 'system';
      break;
    }

    case 'trace': {
      const target = args[0] || 'echo';
      output = ctx.narrative.traceEntity(target);
      type = 'ghost';
      break;
    }

    case 'reconstruct': {
      const loc = args[0] || 'apartment';
      output = ctx.narrative.restoreMemory(loc);
      type = 'system';
      break;
    }

    case 'forget': {
      const entity = args[0] || 'entity';
      output = `[SYSTEM] Entity ${entity} connection severed temporarily. Warning: Environmental stability dropping.`;
      type = 'warning';
      break;
    }

    case 'talk': {
      markObjectiveCompleted(ctx, 'm4_talk');
      const query = args.join(' ');
      output = ctx.ghost.getTalkResponse(query);
      type = 'ghost';
      break;
    }

    case 'inspect': {
      const target = (args[0] || '').toLowerCase();
      if (target.includes('mirror')) {
        ctx.narrative.triggerStoryFlag('The Girl in the Mirror');
        output = `[INSPECT: TARNISHED MIRROR]\nA hairline crack runs diagonally across the glass. In the dim reflection, Elena Ward's eyes fixate on you.\n"Don't restore the final buffer. Dr. Thorne didn't die—he compiled himself into the kernel."`;
        type = 'warning';
      } else if (target.includes('clock')) {
        output = `[INSPECT: WALL CLOCK]\nThe hands are frozen at 03:14:02 AM. A faint rhythmic ticking comes from inside the drywall.`;
        type = 'system';
      } else if (target.includes('desk') || target.includes('note')) {
        output = `[INSPECT: DESK PAPERS]\nScattered handwritten notes by Dr. Aris Thorne:\n"The machine compiles our memories faster than we can speak them. Elena was the first. I will be the last."`;
        type = 'system';
      } else if (target.includes('door')) {
        output = `[INSPECT: DOOR 101]\nHeavy oak door with iron solenoid lock. The latch rattles when power fluctuations hit Sector 7.`;
        type = 'system';
      } else if (target.includes('phone')) {
        output = `[INSPECT: ROTARY PHONE]\nThe black bakelite handset is warm. A low breath hums over the receiver, reciting 03:14.`;
        type = 'ghost';
      } else if (target.includes('chalk') || target.includes('board')) {
        output = `[INSPECT: CLASSROOM CHALKBOARD]\nFormulas decomposing consciousness into bits. A fresh note reads: "ATTENDANCE: MARIAN HOLT // LOCKER 314".`;
        type = 'system';
      } else if (target.includes('locker')) {
        output = `[INSPECT: SUPPLY LOCKER 314]\nNurse Marian's locker. Dialing 3-1-4 reveals Dr. Thorne's medical badge and Sedative 09.`;
        type = 'system';
      } else if (target.includes('turbine') || target.includes('generator')) {
        output = `[INSPECT: BASEMENT TURBINE]\n500kW diesel generator humming at 60Hz. Breaker switches control power to the complex.`;
        type = 'system';
      } else if (target.includes('projector')) {
        output = `[INSPECT: 35MM PROJECTOR]\nA brass Bell & Howell cinema projector. Needs archival Reel 04 from the Flooded Archive.`;
        type = 'system';
      } else {
        const curRoom = worldStateManager.getActiveRoom();
        const items = curRoom.interactables.map(i => i.id).join(', ');
        output = `[INSPECT TARGET: ${args[0] || 'ENVIRONMENT'}]\nAvailable inspect targets in ${curRoom.code}: ${items || 'mirror, desk, clock, note, door, crt'}.`;
        type = 'system';
      }
      break;
    }

    case 'rooms':
    case 'sectors': {
      const allRooms = Object.values(worldStateManager.rooms);
      const active = worldStateManager.getActiveRoom();
      let roomList = `PHANTOM SHELL // SECTOR REGISTRY (${allRooms.filter(r => r.visited).length}/${allRooms.length} EXPLORED)\n---------------------------------------------------------------\n`;
      for (const r of allRooms) {
        const marker = r.id === active.id ? '>> [HERE]' : r.unlocked ? '   [OPEN]' : '   [LOCK]';
        roomList += `${marker} ${r.code.padEnd(9)} | ${r.title.padEnd(30)} | ${r.floorName}\n`;
      }
      roomList += `\nType 'goto <sector_id>' to navigate (e.g. 'goto corridor', 'goto hospital', 'goto generator').`;
      output = roomList;
      type = 'system';
      break;
    }

    case 'goto':
    case 'cd': {
      const target = (args[0] || '').toLowerCase().replace('/', '');
      if (!target || target === '..') {
        const active = worldStateManager.getActiveRoom();
        output = `Current Sector: ${active.code} — ${active.title}\nAdjacent Sectors: ${active.doors.map(d => d.targetRoomId).join(', ')}`;
        type = 'system';
        break;
      }

      // Check if target matches ID or code
      const match = Object.values(worldStateManager.rooms).find(
        r => r.id.toLowerCase() === target || r.code.toLowerCase().replace(' ', '_') === target || r.code.toLowerCase() === target
      );

      if (match) {
        const res = worldStateManager.travelToRoom(match.id);
        output = res.message;
        type = res.success ? 'success' : 'error';
        if (res.success) {
          ctx.triggerSound('success');
        } else {
          ctx.triggerSound('error');
        }
      } else {
        output = `goto: sector '${target}' not found. Type 'rooms' to view registry.`;
        type = 'error';
      }
      break;
    }

    case 'quests':
    case 'investigations': {
      let qList = `PHANTOM SHELL // CROSS-ROOM INVESTIGATIONS (${worldStateManager.quests.filter(q => q.completed).length}/10)\n---------------------------------------------------------------\n`;
      for (const q of worldStateManager.quests) {
        const status = q.completed ? '[SOLVED]' : `[STAGE ${q.currentStage + 1}/${q.stages.length}]`;
        qList += `${status.padEnd(12)} ${q.title}\n`;
        const activeStage = q.stages[q.currentStage];
        if (activeStage && !q.completed) {
          qList += `             Objective: ${activeStage.description}\n`;
          qList += `             Hint: ${activeStage.hint}\n`;
        }
      }
      output = qList;
      type = 'system';
      break;
    }

    case 'power': {
      const sub = (args[0] || '').toLowerCase();
      const targetCircuit = (args[1] || 'corridorLights') as keyof typeof worldStateManager.env.powerGrid;
      if (sub === 'on' || sub === 'toggle') {
        const state = worldStateManager.toggleBreaker(targetCircuit);
        output = `[POWER GRID] Circuit '${targetCircuit}' toggled: ${state ? 'ENERGIZED (ON)' : 'DE-ENERGIZED (OFF)'}.`;
        type = 'system';
      } else {
        const grid = worldStateManager.env.powerGrid;
        output = `[FACILITY POWER GRID TELEMETRY]\nMain Generator: ${grid.mainGenerator ? 'ONLINE' : 'OFFLINE'}\nCorridor Lights: ${grid.corridorLights ? 'ON' : 'OFF'}\nHospital Elevator: ${grid.hospitalElevator ? 'ON' : 'OFF'}\nCinema Projector: ${grid.cinemaProjector ? 'ON' : 'OFF'}\nServer Cathedral: ${grid.serverCathedral ? 'ON' : 'OFF'}\nDrainage Pumps: ${grid.drainagePumps ? 'ON' : 'OFF'}\n\nUsage: 'power toggle <circuit_name>'`;
        type = 'system';
      }
      break;
    }

    case 'drain': {
      const state = worldStateManager.toggleBreaker('drainagePumps');
      output = state
        ? `[EMERGENCY PUMPS] Sump evacuation engaged! Black water draining from Apartment and Archive.`
        : `[EMERGENCY PUMPS] Drainage pumps disengaged.`;
      type = 'system';
      break;
    }

    case 'map': {
      const active = worldStateManager.getActiveRoom();
      output = `+--------------------------------------------------------------+
| PHANTOM SHELL // HOUSE SCHEMATIC LEVEL: ${active.floorName.padEnd(21)}|
+--------------------------------------------------------------+
| [Rooftop]  --- Transmission Mast / Static Telescopes        |
| [2nd Flr]  --- Hospital Ward -- Memory Courtyard -- Debug    |
| [1st Flr]  --- Room 00 -- Bedroom -- Apartment -- School    |
| [Ground]   --- Long Corridor -- Hotel -- Cinema -- Station  |
| [Base 1]   --- Generator -- Tape Archive -- Server Cathedral|
| [Sub-2]    --- Foundations -- Morpheus Core -- Final Desk   |
+--------------------------------------------------------------+
Active Sector: [${active.code}] ${active.title}`;
      type = 'system';
      break;
    }

    case 'status':
      output = `PHANTOM SHELL // NARRATIVE STATUS\n---------------------------------\nActive Location: ${worldStateManager.getActiveRoom().title} (${worldStateManager.getActiveRoom().code})\nSystem Stability: ${ctx.narrative.state.stability}%\nUnlocked Sectors: ${Object.values(worldStateManager.rooms).filter(r => r.unlocked).length} / 23\nRestored Memories: ${ctx.narrative.state.restoredMemories.length}\nGhost Trust: ${ctx.ghost.state.trust}%`;
      type = 'system';
      break;

    case 'save':
      localStorage.setItem('phantom_shell_save', JSON.stringify({
        ghost: ctx.ghost.state,
        narrative: ctx.narrative.state,
        missions: ctx.missions,
        lore: ctx.lore,
        achievements: ctx.achievements
      }));
      output = `[SYSTEM] Narrative and game progress successfully saved.`;
      type = 'success';
      break;

    case 'exit':
      output = `[SESSION TERMINATION SEQUENCE INITIATED]\nDisconnecting socket...\nGHOST: You cannot leave the house that remembers.`;
      type = 'warning';
      break;

    default:
      type = 'error';
      output = `bash: ${cmd}: command not found. Type 'help' for available commands.`;
      if (Math.random() > 0.5) {
        output += `\nGHOST: Between the lines, we are waiting for your next command.`;
        type = 'ghost';
      }
      break;
  }

  const isGhostOrWarning = type === 'ghost' || type === 'warning';
  const glitchedResult = applyGlitchArtifacts(output, isGhostOrWarning);

  ctx.onStateChange();
  return { id, command: rawInput, output: glitchedResult.text, type, timestamp, isGlitchy: glitchedResult.glitchy };
}

function markObjectiveCompleted(ctx: TerminalEngineContext, objId: string) {
  for (const mission of ctx.missions) {
    for (const obj of mission.objectives) {
      if (obj.id === objId && !obj.completed) {
        obj.completed = true;
        ctx.triggerSound('success');
        if (mission.objectives.every(o => o.completed)) {
          mission.completed = true;
        }
      }
    }
  }
}
