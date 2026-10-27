export interface NarrativeState {
  unlockedLocations: string[]; // 'last_room', 'corridor', 'apartment', 'school', 'hospital', 'archive', 'morpheus_core'
  characterTrust: {
    echo: number;
    mirror: number;
    caretaker: number;
    child: number;
    archivist: number;
  };
  restoredMemories: string[];
  evidenceJournal: { id: string; title: string; content: string; source: string }[];
  stability: number; // 0 to 100
  selectedEnding: string | null;
  storyFlags: Record<string, boolean>;
}

export const initialNarrativeState: NarrativeState = {
  unlockedLocations: ['last_room', 'corridor'],
  characterTrust: {
    echo: 30,
    mirror: 10,
    caretaker: 20,
    child: 15,
    archivist: 10
  },
  restoredMemories: [],
  evidenceJournal: [
    { id: 'ev_01', title: 'Project MORPHEUS Log', content: 'Experimental identity reconstruction system designed in 1999.', source: '/var/logs/system.log' },
    { id: 'ev_02', title: 'The Last User Note', content: 'Dr. Aris Thorne noted that thoughts were compiled into the output stream.', source: '/hidden/.the_last_user' }
  ],
  stability: 85,
  selectedEnding: null,
  storyFlags: {}
};

export class NarrativeEngine {
  state: NarrativeState;

  constructor(state: NarrativeState = initialNarrativeState) {
    this.state = state;
  }

  unlockLocation(loc: string) {
    if (!this.state.unlockedLocations.includes(loc)) {
      this.state.unlockedLocations.push(loc);
    }
  }

  addEvidence(id: string, title: string, content: string, source: string) {
    if (!this.state.evidenceJournal.some(e => e.id === id)) {
      this.state.evidenceJournal.push({ id, title, content, source });
    }
  }

  triggerStoryFlag(flag: string): void {
    if (!this.state.storyFlags) {
      this.state.storyFlags = {};
    }
    this.state.storyFlags[flag] = true;
    if (flag === 'The Girl in the Mirror') {
      if (!this.state.characterTrust) {
        this.state.characterTrust = { echo: 30, mirror: 10, caretaker: 20, child: 15, archivist: 10 };
      }
      this.state.characterTrust.mirror = Math.min(100, (this.state.characterTrust.mirror || 10) + 25);
      this.addEvidence(
        'ev_mirror',
        'The Girl in the Mirror',
        'A pale figure visible in reflections claims that THE ECHO is concealing the truth about the 1999 MORPHEUS collapse. "The Echo is lying. Don\'t restore the final buffer."',
        'The Last Room // Tarnished Mirror'
      );
    }
  }

  hasStoryFlag(flag: string): boolean {
    return Boolean(this.state.storyFlags && this.state.storyFlags[flag]);
  }

  restoreMemory(memId: string): string {
    if (this.state.restoredMemories.includes(memId)) {
      return `[SYSTEM] Memory ${memId} is already restored.`;
    }
    this.state.restoredMemories.push(memId);
    this.state.stability = Math.max(10, this.state.stability - 12);
    
    if (memId === 'memory_04' || memId === 'apartment') {
      this.unlockLocation('apartment');
      return `[RESTORE SUCCESS] Memory reconstruction stable. Location unlocked: /morpheus/apartment/ (The Apartment That Floods Upward).`;
    }
    if (memId === 'school' || memId === 'witness_log') {
      this.unlockLocation('school');
      return `[RESTORE SUCCESS] Contradiction reconciled. Location unlocked: /morpheus/school/ (The School With No Students).`;
    }
    if (memId === 'hospital') {
      this.unlockLocation('hospital');
      return `[RESTORE SUCCESS] Patient records indexed. Location unlocked: /morpheus/hospital/ (The Hospital Of Unfinished Names).`;
    }
    if (memId === 'archive') {
      this.unlockLocation('archive');
      return `[RESTORE SUCCESS] Incident records verified. Location unlocked: /morpheus/archive/ (The Flooded Archive).`;
    }
    if (this.state.restoredMemories.length >= 4) {
      this.unlockLocation('morpheus_core');
      return `[CRITICAL ALERT] All primary memory nodes restored. MORPHEUS CORE is now accessible.`;
    }
    return `[RESTORE SUCCESS] Memory ${memId} integrated into system buffer. Stability: ${this.state.stability}%.`;
  }

  compareLogs(file1: string, file2: string): string {
    return `[COMPARE ANALYSIS BETWEEN ${file1} AND ${file2}]\n- Timestamp divergence detected: 03:14:02 vs 03:18:45.\n- Witness testimony contradicts incident report on facility operator identity.\n- Recommendation: Run 'restore school' or inspect the mirror.`;
  }

  traceEntity(target: string): string {
    const t = target.toLowerCase();
    if (t.includes('echo')) {
      return `[TRACE: ECHO // PID 0000]\nOrigin: Unassigned neural sector 0x0000FF\nStatus: Incomplete identity reconstruction.\nTrust Level: ${this.state.characterTrust.echo}%\nWarning: The entity is withholding file descriptors.`;
    }
    if (t.includes('caretaker')) {
      return `[TRACE: CARETAKER]\nOrigin: Facility Operator Buffer\nStatus: Active sentinel guarding unlinked corridors.`;
    }
    return `[TRACE: ${target}]\nSignal strength: 42%. No direct memory anchor found.`;
  }

  checkEndings(): string | null {
    if (this.state.restoredMemories.length >= 4 && this.state.stability <= 30) {
      return 'Ending A: The Perfect Copy';
    }
    if (this.state.evidenceJournal.length >= 6 && this.state.unlockedLocations.length >= 6) {
      return 'Ending B: The House Remembers Everything';
    }
    return null;
  }
}
