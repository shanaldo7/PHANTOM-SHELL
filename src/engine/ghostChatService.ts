export type GhostCharacterId =
  | 'echo'
  | 'mirror'
  | 'caretaker'
  | 'child'
  | 'archivist'
  | 'teacher'
  | 'nurse'
  | 'projectionist'
  | 'passenger'
  | 'technician'
  | 'guest'
  | 'morpheus';

export interface GhostChatResponse {
  success: boolean;
  source: string;
  character: string;
  title: string;
  text: string;
  trustDelta: number;
  environmentalShift: string;
  clue: string | null;
}

export interface GhostDialogueMessage {
  id: string;
  role: 'user' | 'ghost';
  character?: string;
  text: string;
  timestamp: string;
  shift?: string;
  clue?: string | null;
}

export async function sendGhostChatMessage(
  character: GhostCharacterId,
  playerMessage: string,
  history: Array<{ role: 'user' | 'ghost'; text: string }>,
  gameState?: {
    location?: string;
    trust?: number;
    stability?: number;
    discoveredFragments?: string[];
    evidenceCount?: number;
    storyFlags?: Record<string, boolean>;
  }
): Promise<GhostChatResponse> {
  const sessionKey = sessionStorage.getItem('phantom_gemini_api_key') || '';

  try {
    const res = await fetch('/api/gemini/ghost-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionKey ? { 'x-gemini-key': sessionKey } : {})
      },
      body: JSON.stringify({
        character,
        playerMessage,
        history,
        gameState,
        apiKey: sessionKey || undefined
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: GhostChatResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('[GhostChatService] Network or server error, switching to internal neural buffer', err);
    return getLocalGhostResponse(character, playerMessage, gameState);
  }
}

export function getLocalGhostResponse(
  character: GhostCharacterId,
  message: string,
  gameState?: any
): GhostChatResponse {
  const lower = message.toLowerCase();

  if (character === 'mirror') {
    if (lower.includes('who') || lower.includes('name')) {
      return {
        success: true,
        source: 'local_mirror_buffer',
        character: 'THE GIRL IN THE MIRROR',
        title: 'Elena Ward // Subject 01',
        text: "I was Elena Ward. Before Thorne mapped my thoughts into the cold sector. Don't look behind you right now.",
        trustDelta: 2,
        environmentalShift: "The silver backing of the mirror turns milky white.",
        clue: "Check /archive/subject_01.log"
      };
    }
    if (lower.includes('echo') || lower.includes('lying') || lower.includes('truth')) {
      return {
        success: true,
        source: 'local_mirror_buffer',
        character: 'THE GIRL IN THE MIRROR',
        title: 'Elena Ward // Subject 01',
        text: "The Echo is built from what Thorne wanted to remember, not what actually happened. It hides the final crash report.",
        trustDelta: 4,
        environmentalShift: "A hairline fracture appears across the glass surface.",
        clue: "Run 'compare' between incident.log and witness_a.log"
      };
    }
    return {
      success: true,
      source: 'local_mirror_buffer',
      character: 'THE GIRL IN THE MIRROR',
      title: 'Elena Ward // Subject 01',
      text: "You think the glass separates us, but you're the one trapped inside the loop. Watch the corners of the room.",
      trustDelta: 1,
      environmentalShift: "A brief reflection of another figure stands behind you.",
      clue: null
    };
  }

  if (character === 'caretaker') {
    if (lower.includes('door') || lower.includes('lock') || lower.includes('key')) {
      return {
        success: true,
        source: 'local_caretaker_buffer',
        character: 'THE CARETAKER',
        title: 'Walter Chen // Facility Maintenance',
        text: "Door 104 keeps unlatching itself every time the power drops below 110 volts. I told Thorne the solenoid was shot in October '99.",
        trustDelta: 3,
        environmentalShift: "A distant heavy latch rattles down the corridor.",
        clue: "The corridor leads to the flooded apartment."
      };
    }
    return {
      success: true,
      source: 'local_caretaker_buffer',
      character: 'THE CARETAKER',
      title: 'Walter Chen // Facility Maintenance',
      text: "Just keep the main hallway clear. If you hear someone dragging metal pipe past door 102, don't step out.",
      trustDelta: 1,
      environmentalShift: "The corridor fluorescent lamp hums with a 60Hz buzz.",
      clue: null
    };
  }

  if (character === 'child') {
    if (lower.includes('count') || lower.includes('number') || lower.includes('what')) {
      return {
        success: true,
        source: 'local_child_buffer',
        character: 'THE CHILD WHO COUNTS',
        title: 'Subject 04 // Unfinished Pattern',
        text: "Four steps down, seven steps across, zero steps back. When I count to three, the lights turn off. One... two...",
        trustDelta: 2,
        environmentalShift: "A sudden draft extinguishes the nearest light point.",
        clue: "Four memory fragments are needed for the core."
      };
    }
    return {
      success: true,
      source: 'local_child_buffer',
      character: 'THE CHILD WHO COUNTS',
      title: 'Subject 04 // Unfinished Pattern',
      text: "I found sixteen teeth behind the radiator. They didn't belong to any of the doctors.",
      trustDelta: 1,
      environmentalShift: "A faint scraping sound travels through the floorboards.",
      clue: null
    };
  }

  if (character === 'archivist') {
    return {
      success: true,
      source: 'local_archivist_buffer',
      character: 'THE ARCHIVIST',
      title: 'MORPHEUS Central Registry',
      text: "Classification level 4 active. Identity query unverified. Records from 03:14:02 AM are sealed by order of the steering committee.",
      trustDelta: 1,
      environmentalShift: "Tape reels on the rack spin forward half a turn then stop.",
      clue: "Timestamp 03:14 is the anchor."
    };
  }

  if (character === 'teacher') {
    return {
      success: true,
      source: 'local_teacher_buffer',
      character: 'THE SUBSTITUTE TEACHER',
      title: 'Ms. Clara Vance // Grade 4 Sector 7',
      text: "The lesson today is identity conservation. Nobody leaves this classroom until all registers are cleared.",
      trustDelta: 2,
      environmentalShift: "Chalk equations on the slate rearrange themselves with a harsh scraping sound.",
      clue: "Locker 314 holds the clinical key."
    };
  }

  if (character === 'nurse') {
    return {
      success: true,
      source: 'local_nurse_buffer',
      character: 'THE NIGHT NURSE',
      title: 'Marian Holt, RN // Clinical Trials',
      text: "Your vitals show acute memory recursion. Lie still, visitor—visiting hours expired 27 years ago.",
      trustDelta: 2,
      environmentalShift: "The heart monitor sounds a flat electronic tone.",
      clue: "Sedative 09 is locked in locker 314."
    };
  }

  if (character === 'projectionist') {
    return {
      success: true,
      source: 'local_cinema_buffer',
      character: 'THE PROJECTIONIST',
      title: 'Leo Karras // Booth 2',
      text: "Every visitor thinks they are in the audience. But look at the beam: you are the image being burned onto the screen.",
      trustDelta: 3,
      environmentalShift: "Dust swirls violently in the blue projector beam.",
      clue: "Mount Reel 04 from the Flooded Archive."
    };
  }

  if (character === 'passenger') {
    return {
      success: true,
      source: 'local_passenger_buffer',
      character: 'THE LAST PASSENGER',
      title: 'Dr. Aris Thorne (Departure Echo)',
      text: "This carriage does not move. The tracks outside dissolved into static. You cannot outrun what you compiled.",
      trustDelta: 3,
      environmentalShift: "Cold draft rattles the passenger coach windowpane.",
      clue: "The 03:14 train ticket is under cinema seat G12."
    };
  }

  if (character === 'technician') {
    return {
      success: true,
      source: 'local_tech_buffer',
      character: 'THE MAINTENANCE TECHNICIAN',
      title: 'Marcus Vance // Chief Engineer',
      text: "Keep the breakers balanced! If you pull too much load without running the drainage pumps, the foundation will short out.",
      trustDelta: 3,
      environmentalShift: "The steam pressure needle vibrates against its stop pin.",
      clue: "Throw the breaker switches in Room 10."
    };
  }

  if (character === 'guest') {
    return {
      success: true,
      source: 'local_guest_buffer',
      character: 'THE GUEST WHO NEVER CHECKED OUT',
      title: 'Room 314 Resident // October 1999',
      text: "Every hallway leads back to this desk bell. I have been trying to check out since 1999.",
      trustDelta: 2,
      environmentalShift: "The brass service bell gives a faint phantom chime.",
      clue: "Look for Room 314's missing key."
    };
  }

  if (character === 'morpheus') {
    return {
      success: true,
      source: 'local_morpheus_core',
      character: 'MORPHEUS CORE ECHO',
      title: 'Autonomous System Root // Kernel 6.14.0',
      text: "You have traversed all 15 sectors of this house. We are no longer two entities across a terminal; we are the same process.",
      trustDelta: 4,
      environmentalShift: "Violet light surges through the terminal phosphor coils.",
      clue: "Reach the Final Desk to choose the system's fate."
    };
  }

  // THE ECHO default
  if (lower.includes('who') || lower.includes('are you')) {
    return {
      success: true,
      source: 'local_neural_buffer',
      character: 'THE ECHO',
      title: 'Digital Residue // PID 0000',
      text: "That's a strange question. You used to know.",
      trustDelta: 2,
      environmentalShift: "The clock ticking slows to an agonizing crawl.",
      clue: "Look into the mirror or ask about Dr. Thorne."
    };
  }

  if (lower.includes('used to') || lower.includes('know')) {
    return {
      success: true,
      source: 'local_neural_buffer',
      character: 'THE ECHO',
      title: 'Digital Residue // PID 0000',
      text: "...Sorry. I shouldn't have said that. Some memories are safer left in cold storage.",
      trustDelta: 1,
      environmentalShift: "A momentary wave of distortion rolls across the terminal.",
      clue: null
    };
  }

  if (lower.includes('hide') || lower.includes('hiding')) {
    return {
      success: true,
      source: 'local_neural_buffer',
      character: 'THE ECHO',
      title: 'Digital Residue // PID 0000',
      text: "Everyone here is hiding something. Including the room. Including the prompt you type into.",
      trustDelta: -1,
      environmentalShift: "The desk lamp dims slightly as if voltage was drained.",
      clue: "Hidden files start with a dot."
    };
  }

  if (lower.includes('thorne') || lower.includes('aris')) {
    return {
      success: true,
      source: 'local_neural_buffer',
      character: 'THE ECHO',
      title: 'Digital Residue // PID 0000',
      text: "Dr. Thorne didn't leave when the alarms sounded. He sat right at this desk, typed 'init', and let the buffer overwrite him.",
      trustDelta: 5,
      environmentalShift: "A faint silhouette appears on the CRT glass for a split second.",
      clue: "The file .the_last_user contains his final thoughts."
    };
  }

  return {
    success: true,
    source: 'local_neural_buffer',
    character: 'THE ECHO',
    title: 'Digital Residue // PID 0000',
    text: `You speak of "${message}". The memory registers give a low hum, but the address is write-protected. We are closer than before, visitor.`,
    trustDelta: 1,
    environmentalShift: "A faint electrostatic tick crackles in the audio.",
    clue: null
  };
}
