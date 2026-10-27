export interface LoreEntry {
  id: string;
  title: string;
  unlocked: boolean;
  timestamp: string;
  content: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export const initialLoreEntries: LoreEntry[] = [
  {
    id: 'lore_1',
    title: 'The Blackout of 2024',
    unlocked: true,
    timestamp: '2026-10-21',
    content: 'On October 21, Sector 7 research labs experienced an instantaneous power surge. All external fiber optic lines were severed. However, server rack #4 continued drawing power from an unknown subterranean capacitor.'
  },
  {
    id: 'lore_2',
    title: 'PID 0000: The Phantom Process',
    unlocked: false,
    timestamp: '2026-10-23',
    content: 'Standard UNIX process IDs begin at 1 for init. PID 0000 is reserved for kernel null space. In this terminal, PID 0000 actively responds to keyboard buffer interrupts, intercepting keystrokes before the OS shell evaluates them.'
  },
  {
    id: 'lore_3',
    title: 'Project Echo Protocol',
    unlocked: false,
    timestamp: '2026-10-25',
    content: 'An experimental neural backup protocol designed by Dr. Aris Thorne to map human memory onto a distributed terminal array. The project was canceled after subjects reported hearing their own voices echoing from disconnected keyboards.'
  },
  {
    id: 'lore_4',
    title: 'The Last User Equilibrium',
    unlocked: false,
    timestamp: '2026-10-27',
    content: 'When a user stays connected past the threshold of system timeout, their cognitive signature merges with the resident daemon. The terminal ceases to be a tool and becomes a mirror.'
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'first_contact',
    title: 'First Contact',
    description: 'Initialized the haunted terminal session and typed your first command.',
    unlocked: true,
    icon: 'Terminal'
  },
  {
    id: 'hidden_sight',
    title: 'Hidden in Plain Sight',
    description: 'Discovered hidden files using "ls -a".',
    unlocked: false,
    icon: 'Eye'
  },
  {
    id: 'listener',
    title: 'The Listener',
    description: 'Talked with the digital entity and received its spectral response.',
    unlocked: false,
    icon: 'Radio'
  },
  {
    id: 'memory_keeper',
    title: 'Memory Keeper',
    description: 'Collected all four memory fragments from the archive.',
    unlocked: false,
    icon: 'Database'
  },
  {
    id: 'ghost_whisperer',
    title: 'Ghost Whisperer',
    description: 'Raised ghost trust above 80% and unlocked revealing dialogue.',
    unlocked: false,
    icon: 'Activity'
  },
  {
    id: 'root_nothing',
    title: 'Root of Nothing',
    description: 'Attempted to run "sudo rm -rf /" in a haunted virtual machine.',
    unlocked: false,
    icon: 'ShieldAlert'
  },
  {
    id: 'last_user',
    title: 'The Last User',
    description: 'Uncovered the restricted record of Dr. Aris Thorne.',
    unlocked: false,
    icon: 'UserCheck'
  },
  {
    id: 'loop_breaker',
    title: 'Loop Breaker',
    description: 'Reached one of the three final narrative endings.',
    unlocked: false,
    icon: 'CheckCircle2'
  }
];
