export interface MissionObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  objectives: MissionObjective[];
  rewardText: string;
  completed: boolean;
}

export const initialMissions: Mission[] = [
  {
    id: 'mission_1',
    title: 'Chapter 01: First Contact',
    description: 'Initialize the haunted terminal environment and establish initial baseline communications.',
    objectives: [
      { id: 'm1_init', description: 'Complete system boot sequence', completed: true },
      { id: 'm1_help', description: 'Run the "help" command', completed: false },
      { id: 'm1_whoami', description: 'Check your visitor identity with "whoami"', completed: false },
      { id: 'm1_readme', description: 'Inspect the visitor manual ("cat /home/visitor/readme.txt")', completed: false }
    ],
    rewardText: 'Unlocked First Contact Achievement & Ghost Trust +10.',
    completed: false
  },
  {
    id: 'mission_2',
    title: 'Chapter 02: Something Is Missing',
    description: 'Explore the virtual filesystem hierarchy and uncover concealed entries.',
    objectives: [
      { id: 'm2_tree', description: 'Display the directory tree with "tree"', completed: false },
      { id: 'm2_hidden', description: 'List hidden directory contents with "ls -a /hidden"', completed: false },
      { id: 'm2_frag1', description: 'Read the first memory fragment ("/archive/fragment_001.mem")', completed: false }
    ],
    rewardText: 'Unlocked Lore Entry #01 & Ghost Curious State.',
    completed: false
  },
  {
    id: 'mission_3',
    title: 'Chapter 03: The Unfinished Session',
    description: 'Examine system diagnostics and interaction logs left behind by previous operators.',
    objectives: [
      { id: 'm3_syslog', description: 'Read system log ("cat /var/logs/system.log")', completed: false },
      { id: 'm3_ghostlog', description: 'Read ghost daemon log ("cat /var/logs/ghost.log")', completed: false },
      { id: 'm3_ps', description: 'Inspect simulated process table ("ps")', completed: false }
    ],
    rewardText: 'Unlocked Memory Fragment #02 & Trust +15.',
    completed: false
  },
  {
    id: 'mission_4',
    title: 'Chapter 04: The Echo Remembers',
    description: 'Engage directly with the digital entity and collect all residual memory fragments.',
    objectives: [
      { id: 'm4_talk', description: 'Talk to the ghost ("talk what happened here")', completed: false },
      { id: 'm4_allfrags', description: 'Collect all 4 memory fragments from /archive', completed: false },
      { id: 'm4_signal', description: 'Inspect hidden signal file (".last_signal")', completed: false }
    ],
    rewardText: 'Ghost Trust reached Unstable/Revealing state.',
    completed: false
  },
  {
    id: 'mission_5',
    title: 'Chapter 05: The Last User',
    description: 'Uncover the restricted record of Dr. Aris Thorne and make your final choice.',
    objectives: [
      { id: 'm5_lastuser', description: 'Read restricted record (".the_last_user")', completed: false },
      { id: 'm5_remember', description: 'Execute the final command "remember"', completed: false },
      { id: 'm5_ending', description: 'Choose your ending (Release, Preserve, or Loop)', completed: false }
    ],
    rewardText: 'Final Chapter Completion & Achievement Unlocked.',
    completed: false
  }
];
