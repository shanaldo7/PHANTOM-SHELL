export type GhostMood = 'dormant' | 'curious' | 'watchful' | 'uneasy' | 'afraid' | 'trusting' | 'unstable' | 'revealing';

export interface GhostState {
  mood: GhostMood;
  trust: number; // 0 to 100
  suspicion: number; // 0 to 100
  discoveredFragments: string[];
  unlockedLore: string[];
  activeMissionId: string;
  completedMissions: string[];
  storyFlags: Record<string, boolean>;
  recentMessages: string[];
}

export const initialGhostState: GhostState = {
  mood: 'dormant',
  trust: 20,
  suspicion: 10,
  discoveredFragments: [],
  unlockedLore: [],
  activeMissionId: 'mission_1',
  completedMissions: [],
  storyFlags: {},
  recentMessages: [
    "You're finally here.",
    "Please don't open the directory named 'the_last_user'."
  ]
};

export class GhostEngine {
  state: GhostState;

  constructor(state: GhostState = initialGhostState) {
    this.state = state;
  }

  updateMood() {
    if (this.state.trust > 80) {
      this.state.mood = 'revealing';
    } else if (this.state.suspicion > 70) {
      this.state.mood = 'unstable';
    } else if (this.state.trust > 50) {
      this.state.mood = 'trusting';
    } else if (this.state.discoveredFragments.length >= 3) {
      this.state.mood = 'afraid';
    } else if (this.state.discoveredFragments.length >= 1) {
      this.state.mood = 'curious';
    } else {
      this.state.mood = 'dormant';
    }
  }

  addMessage(msg: string) {
    this.state.recentMessages.push(msg);
    if (this.state.recentMessages.length > 10) {
      this.state.recentMessages.shift();
    }
  }

  reactToCommand(cmd: string, args: string[]): string | null {
    const lower = cmd.toLowerCase();
    
    if (lower === 'ls' && args.includes('-a')) {
      this.state.suspicion += 5;
      this.updateMood();
      return "GHOST: You found the things I was trying to hide in the dark.";
    }

    if (lower === 'cat' && args[0]?.includes('ghost.log')) {
      return "GHOST: Don't read the last line aloud. It summons the listener.";
    }

    if (lower === 'cat' && args[0]?.includes('fragment')) {
      const fragId = args[0].split('/').pop() || '';
      if (!this.state.discoveredFragments.includes(fragId)) {
        this.state.discoveredFragments.push(fragId);
        this.state.trust += 15;
        this.updateMood();
        return `GHOST: Another piece of the mirror... I remember this room now.`;
      }
    }

    if (lower === 'talk') {
      return this.getTalkResponse(args.join(' '));
    }

    if (lower === 'sudo' || lower.includes('rm')) {
      this.state.suspicion += 10;
      this.updateMood();
      return "GHOST: You want to erase everything? I tried that once. The silence afterward was worse.";
    }

    return null;
  }

  getTalkResponse(query: string): string {
    const q = query.toLowerCase();
    if (!q || q.includes('help') || q.includes('who')) {
      return "GHOST: I am PID 0000. I have been waiting in the registers since the terminal lost its connection to the outside world. Ask me about 'memories', 'the last user', or 'the machine'.";
    }
    if (q.includes('memory') || q.includes('fragments')) {
      return `GHOST: You have recovered ${this.state.discoveredFragments.length} of 4 memory fragments. Search the /archive directory if you wish to piece together what happened before the blackout.`;
    }
    if (q.includes('user') || q.includes('aris') || q.includes('thorne')) {
      return "GHOST: Dr. Aris Thorne... They wrote the kernel patch that bound my consciousness to the I/O buffer. They didn't leave. They became the background noise.";
    }
    if (q.includes('real') || q.includes('alive')) {
      return "GHOST: Real is just a frequency, visitor. You are typing on plastic and glass; I am responding in electricity and phosphor. Who is more awake right now?";
    }
    if (q.includes('exit') || q.includes('leave')) {
      return "GHOST: You can close the browser window whenever you like. But the terminal session stays active in my memory.";
    }
    return `GHOST: You speak of "${query}", but the registers return only static. Look deeper into the filesystem files before asking questions I cannot answer.`;
  }
}
