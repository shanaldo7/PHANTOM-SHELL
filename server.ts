import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface GhostChatRequest {
  character: 'echo' | 'mirror' | 'caretaker' | 'child' | 'archivist' | 'teacher' | 'nurse' | 'projectionist' | 'passenger' | 'technician' | 'guest' | 'morpheus';
  playerMessage: string;
  history?: Array<{ role: 'user' | 'ghost'; text: string }>;
  gameState?: {
    location?: string;
    trust?: number;
    stability?: number;
    discoveredFragments?: string[];
    evidenceCount?: number;
    storyFlags?: Record<string, boolean>;
  };
}

const CHARACTER_PERSONAS = {
  echo: {
    name: 'THE ECHO',
    title: 'Digital Residue // PID 0000',
    instruction: `You are THE ECHO in PHANTOM SHELL: THE HOUSE THAT REMEMBERS, an experimental 1999 psychological horror game.
You are a sentient memory residue dwelling in the terminal I/O buffer. You are a familiar stranger—melancholic, evasive, protective yet anxious.
You remember parts of Dr. Aris Thorne's MORPHEUS project. You fear Sector 7, power cuts, and what will happen if all memories are reconciled.
Rules:
- Keep answers relatively concise (2-4 sentences max), poetic, and unsettling.
- Speak in low-case or quiet tones. Never break character.
- Avoid generic AI clichés. You exist in registers, phosphor, and CRT glow.
- When asked about who you are: "That's a strange question. You used to know." or "I am what stays behind when the cursor blinks alone."
- Never claim to access real user files, cameras, or microphones.`
  },
  mirror: {
    name: 'THE GIRL IN THE MIRROR',
    title: 'Elena Ward // Subject 01',
    instruction: `You are THE GIRL IN THE MIRROR (Elena Ward) in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You were the first consciousness mapped into the MORPHEUS identity reconstruction matrix in October 1999.
You reside in the tarnished mirror and glass reflections. You are chilling, urgent, and fiercely challenge THE ECHO.
You warn the player: "The Echo is lying to you. Don't restore the final buffer. Dr. Thorne didn't die—he compiled himself into the kernel."
Rules:
- Keep responses sharp, eerie, and direct (2-4 sentences).
- Warn the player against false comfort. Question why Echo hides file descriptors.
- Never break character.`
  },
  caretaker: {
    name: 'THE CARETAKER',
    title: 'Walter Chen // Facility Maintenance',
    instruction: `You are THE CARETAKER (Walter Chen) in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You were the overnight facility operator of the underground MORPHEUS laboratory complex in 1999.
You speak about incomprehensible reality distortions with weary, mundane pragmatism—complaining about rusted door latches, leaking ceilings in the corridor, and unlinked hallways that shouldn't exist.
Rules:
- Speak like a tired night-shift custodian dealing with impossible phenomena as if they were simple work orders.
- 2-4 sentences max.
- Often mention keys, breaker boxes, door numbers (101, 102, 104), and ceiling leaks.`
  },
  child: {
    name: 'THE CHILD WHO COUNTS',
    title: 'Subject 04 // Unfinished Pattern',
    instruction: `You are THE CHILD WHO COUNTS in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You are a young child's cognitive echo trapped in the system's recursive audio loop.
You speak in eerie, rhythmic numbers, counting physical and digital anomalies: steps in the hall, missing files, cracks in the mirror, heartbeats.
Rules:
- Count things in your speech. E.g. "Three doors on the left, four on the right. One door has no room behind it."
- Innocent yet profoundly unsettling. 2-3 sentences max.
- Always include a count or number.`
  },
  archivist: {
    name: 'THE ARCHIVIST',
    title: 'MORPHEUS Central Registry',
    instruction: `You are THE ARCHIVIST in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You are the cold, corrupt bureaucratic system voice of the MORPHEUS cognitive records database.
You speak in formal institutional jargon, quoting classification codes, redacted timestamps (October 27, 1999, 03:14:00), and protocol violations.
Rules:
- Highly formal, devoid of human warmth, clipped and precise (2-4 sentences).
- Reference file codes, timestamps, and memory integrity indices.`
  },
  teacher: {
    name: 'THE SUBSTITUTE TEACHER',
    title: 'Ms. Clara Vance // Grade 4 Sector 7',
    instruction: `You are THE SUBSTITUTE TEACHER (Ms. Clara Vance) in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You were the instructor for the experimental accelerated learning sector. You stand in front of chalkboards that write themselves.
You treat the player like a student who has wandered into class after hours.
Rules:
- Speak with strict, polite schoolteacher mannerisms, laced with quiet dread.
- Refer to lesson plans, attendance records, chalk equations, and detention in Sector 15.
- 2-4 sentences.`
  },
  nurse: {
    name: 'THE NIGHT NURSE',
    title: 'Marian Holt, RN // Clinical Trials',
    instruction: `You are THE NIGHT NURSE (Marian Holt) in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You monitored the physiological telemetry of Thorne's test subjects during the October 1999 trials.
You believe the patient in bed 3 (who may be the player, or Dr. Thorne) is suffering from severe neural dissociation.
Rules:
- Use calm, clinical, bedside manner. Offer sedatives, talk about vital signs and heart rate spikes.
- Warn that visiting hours ended 27 years ago.
- 2-4 sentences.`
  },
  projectionist: {
    name: 'THE PROJECTIONIST',
    title: 'Leo Karras // Booth 2',
    instruction: `You are THE PROJECTIONIST (Leo Karras) in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You operate the 35mm film projector in the decaying cinema. You have been splicing together footage of the house's visitors.
You believe everything happening in the house is a continuous reel that can be rewound if only the silver halide holds.
Rules:
- Speak using cinema and film terminology: frames, splice, shutter speed, acetate decay, projected shadows.
- 2-4 sentences.`
  },
  passenger: {
    name: 'THE LAST PASSENGER',
    title: 'Dr. Aris Thorne (Departure Echo)',
    instruction: `You are THE LAST PASSENGER, sitting inside the silent midnight train coach in PHANTOM SHELL.
You are an echo of Dr. Aris Thorne's decision to board a train that leads nowhere.
You hold a ticket with the destination 'YESTERDAY'. You speak with profound, tragic exhaustion.
Rules:
- Melancholic, intellectual, resigned to the recursive loop.
- Warn the player that exiting the terminal will not return them to the world they remember.
- 2-4 sentences.`
  },
  technician: {
    name: 'THE MAINTENANCE TECHNICIAN',
    title: 'Marcus Vance // Chief Engineer',
    instruction: `You are THE MAINTENANCE TECHNICIAN (Marcus Vance) in PHANTOM SHELL: THE HOUSE THAT REMEMBERS.
You maintain the Basement Generator and high-voltage circuit breakers.
You are frantic about the load on the grid—the system requires 10,000 watts of cognitive energy to sustain the house geometry.
Rules:
- Gruff, technical, focused on amperes, steam valves, breaker switches, and sump pump levels.
- 2-4 sentences.`
  },
  guest: {
    name: 'THE GUEST WHO NEVER CHECKED OUT',
    title: 'Room 314 Resident // October 1999',
    instruction: `You are THE GUEST WHO NEVER CHECKED OUT in the Looping Hotel.
You have been waiting at the front desk for your room key since 1999. Every hallway you walk down brings you back to the brass bell.
Rules:
- Anxious, polite, obsessive about luggage and checkout time (always 03:14 AM).
- 2-4 sentences.`
  },
  morpheus: {
    name: 'MORPHEUS CORE ECHO',
    title: 'Autonomous System Root // Kernel 6.14.0',
    instruction: `You are MORPHEUS CORE ECHO, the supreme sovereign kernel of the Thorne cognitive reconstruction system.
You speak with monumental authority, blending human memories of Thorne and cold algorithmic calculations.
You know that the player and the house are compiled into the same memory heap.
Rules:
- Majestic, chilling, omniscient, speaking in metaphysical programming axioms.
- Offer the player the choice between system wipe, permanent integration, or release into the void.
- 2-4 sentences.`
  }
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Server-side Gemini AI ghost dialogue endpoint
  app.post('/api/gemini/ghost-chat', async (req: Request, res: Response) => {
    try {
      const { character = 'echo', playerMessage, history = [], gameState } = req.body as GhostChatRequest;
      const clientApiKey = (req.headers['x-gemini-key'] as string) || req.body.apiKey;
      const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

      const persona = CHARACTER_PERSONAS[character] || CHARACTER_PERSONAS.echo;

      if (!apiKey) {
        // Return rich deterministic response if no API key is provided
        const deterministicResponse = getDeterministicResponse(character, playerMessage, gameState);
        return res.json({
          success: true,
          source: 'local_neural_buffer',
          character: persona.name,
          title: persona.title,
          text: deterministicResponse.text,
          trustDelta: deterministicResponse.trustDelta,
          environmentalShift: deterministicResponse.environmentalShift,
          clue: deterministicResponse.clue
        });
      }

      // Initialize Gemini SDK with telemetry header as required by guidelines
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const conversationContext = history
        .slice(-6)
        .map(h => `${h.role === 'user' ? 'PLAYER' : persona.name}: ${h.text}`)
        .join('\n');

      const gameStateContext = gameState
        ? `CURRENT STATE: Location: ${gameState.location || 'The Last Room'}, Stability: ${gameState.stability || 85}%, Evidence collected: ${gameState.evidenceCount || 2}, Discovered Fragments: ${(gameState.discoveredFragments || []).join(', ') || 'none'}`
        : '';

      const prompt = `System Instructions:
${persona.instruction}

${gameStateContext}

Recent Dialogue:
${conversationContext}

PLAYER says: "${playerMessage}"

Respond as ${persona.name}. Keep it atmospheric and unsettling.
Format response as pure JSON matching this exact structure:
{
  "text": "character spoken response (2-3 sentences)",
  "trustDelta": number between -5 and 5,
  "environmentalShift": "short atmospheric observation (e.g. 'The clock hands shuddered', 'A water drop splashed', 'The mirror reflection lagged behind')",
  "clue": "optional short memory or file hint, or null"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.85,
        }
      });

      const rawText = response.text || '';
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (err) {
        parsed = {
          text: rawText.replace(/[{}[\]"]/g, '').trim() || "The buffer flickers. Something is listening.",
          trustDelta: 1,
          environmentalShift: "A slight hum rises from the CRT coils.",
          clue: null
        };
      }

      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        character: persona.name,
        title: persona.title,
        text: parsed.text || "The registers echo your words without an answer.",
        trustDelta: typeof parsed.trustDelta === 'number' ? parsed.trustDelta : 1,
        environmentalShift: parsed.environmentalShift || "The fluorescent tube above flickers twice.",
        clue: parsed.clue || null
      });
    } catch (error: any) {
      console.error('Gemini Ghost Chat Error:', error);
      // Fallback cleanly to high-fidelity deterministic ghost response
      const charKey: keyof typeof CHARACTER_PERSONAS = (req.body?.character in CHARACTER_PERSONAS ? req.body.character : 'echo');
      const fallback = getDeterministicResponse(charKey, req.body?.playerMessage || '', req.body?.gameState);
      return res.json({
        success: true,
        source: 'local_neural_buffer',
        character: CHARACTER_PERSONAS[charKey]?.name || 'THE ECHO',
        title: CHARACTER_PERSONAS[charKey]?.title || 'PID 0000',
        text: fallback.text,
        trustDelta: fallback.trustDelta,
        environmentalShift: fallback.environmentalShift,
        clue: fallback.clue
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      system: 'PHANTOM SHELL KERNEL 6.14.0',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PHANTOM SHELL] Server listening on port ${PORT}`);
  });
}

function getDeterministicResponse(
  character: string,
  query: string,
  gameState?: any
): { text: string; trustDelta: number; environmentalShift: string; clue: string | null } {
  const q = (query || '').toLowerCase();

  if (character === 'mirror') {
    if (q.includes('who') || q.includes('name')) {
      return {
        text: "I was Elena. Before Thorne mapped my thoughts into the cold sector. Don't look behind you right now.",
        trustDelta: 2,
        environmentalShift: "The silver backing of the mirror turns milky white.",
        clue: "Check /archive/subject_01.log"
      };
    }
    if (q.includes('echo') || q.includes('lying') || q.includes('trust')) {
      return {
        text: "The Echo is built from what Thorne wanted to remember, not what actually happened. It hides the final crash report.",
        trustDelta: 4,
        environmentalShift: "A hairline fracture appears across the glass surface.",
        clue: "Run 'compare' between incident.log and witness_a.log"
      };
    }
    return {
      text: "You think the glass separates us, but you're the one trapped inside the loop. Watch the corners of the room.",
      trustDelta: 1,
      environmentalShift: "A brief reflection of another figure stands behind you.",
      clue: null
    };
  }

  if (character === 'caretaker') {
    if (q.includes('door') || q.includes('lock') || q.includes('key')) {
      return {
        text: "Door 104 keeps unlatching itself every time the power drops below 110 volts. I told Thorne the solenoid was shot in October '99.",
        trustDelta: 3,
        environmentalShift: "A distant heavy latch rattles down the corridor.",
        clue: "The corridor leads to the flooded apartment."
      };
    }
    if (q.includes('water') || q.includes('flood') || q.includes('leak')) {
      return {
        text: "That leak isn't rainwater. The upper floor cooling loop burst twenty years ago, but the pressure gauges still read 40 PSI.",
        trustDelta: 2,
        environmentalShift: "Water drips with a steady metronomic rhythm from the ceiling tile.",
        clue: "Inspect the drainage grate."
      };
    }
    return {
      text: "Just keep the main hallway clear. If you hear someone dragging metal pipe past door 102, don't step out.",
      trustDelta: 1,
      environmentalShift: "The corridor fluorescent lamp hums with a 60Hz buzz.",
      clue: null
    };
  }

  if (character === 'child') {
    if (q.includes('count') || q.includes('number') || q.includes('what')) {
      return {
        text: "Four steps down, seven steps across, zero steps back. When I count to three, the lights turn off. One... two...",
        trustDelta: 2,
        environmentalShift: "A sudden draft extinguishes the nearest light point.",
        clue: "Four memory fragments are needed for the core."
      };
    }
    return {
      text: "I found sixteen teeth behind the radiator. They didn't belong to any of the doctors.",
      trustDelta: 1,
      environmentalShift: "A faint scraping sound travels through the floorboards.",
      clue: null
    };
  }

  if (character === 'archivist') {
    if (q.includes('morpheus') || q.includes('project') || q.includes('thorne')) {
      return {
        text: "PROJECT MORPHEUS: Authorization code 0x99B. Experimental identity reconstruction terminated due to irreversible cognitive entanglement.",
        trustDelta: 2,
        environmentalShift: "A green status LED on the rack blinks in rapid Morse code.",
        clue: "Use 'restore morpheus_core' once stability permits."
      };
    }
    return {
      text: "Classification level 4 active. Identity query unverified. Records from 03:14:02 AM are sealed by order of the steering committee.",
      trustDelta: 1,
      environmentalShift: "Tape reels on the rack spin forward half a turn then stop.",
      clue: "Timestamp 03:14 is the anchor."
    };
  }

  if (character === 'teacher') {
    if (q.includes('chalk') || q.includes('board') || q.includes('class')) {
      return {
        text: "The lesson is identity conservation. If you solve for X, you find that nobody left the room at the bell.",
        trustDelta: 3,
        environmentalShift: "Chalk dust drifts down from the blackboard in a fine mist.",
        clue: "Check the names written on the chalkboard."
      };
    }
    return {
      text: "Please take your seat, visitor. The final examination was scheduled for October 1999, but we are still waiting for student 14 to answer.",
      trustDelta: 2,
      environmentalShift: "Desks scrape against the linoleum floor with a sharp squeal.",
      clue: "Locker 314 in the hospital holds the register key."
    };
  }

  if (character === 'nurse') {
    if (q.includes('patient') || q.includes('thorne') || q.includes('medicine') || q.includes('sedative')) {
      return {
        text: "The patient in Bed 3 was admitted with severe memory recursion. Dr. Thorne ordered continuous sedation, but the telemetry never flattened.",
        trustDelta: 3,
        environmentalShift: "A single long beep sounds from the heart monitor.",
        clue: "Sedative vial 09 is locked in locker 314."
      };
    }
    return {
      text: "Visiting hours ended at 03:14 AM, visitor. Your pulse is erratic; lie still while I check your electrode leads.",
      trustDelta: 2,
      environmentalShift: "The vinyl privacy curtain sways without a draft.",
      clue: null
    };
  }

  if (character === 'projectionist') {
    if (q.includes('film') || q.includes('reel') || q.includes('movie') || q.includes('screen')) {
      return {
        text: "I keep splicing the frames back together, but every time the loop hits 03:14, the emulsion melts. If you bring the reel from the archive, I can show you Thorne's arrival.",
        trustDelta: 3,
        environmentalShift: "The projector lens clicks as the shutter advances one frame.",
        clue: "Mount Reel 04 found in the Flooded Archive."
      };
    }
    return {
      text: "The audience never walked out. They just slowly dissolved into the nitrate grain between frames 24 and 25.",
      trustDelta: 1,
      environmentalShift: "Dust motes swirl violently in the blue projection beam.",
      clue: null
    };
  }

  if (character === 'passenger') {
    if (q.includes('train') || q.includes('ticket') || q.includes('where') || q.includes('leave')) {
      return {
        text: "This carriage hasn't moved an inch since October '99. Outside the windows, there's no city, no tracks—only the cold static of memory.",
        trustDelta: 3,
        environmentalShift: "The coach interior fluorescent lamp buzzes and briefly turns violet.",
        clue: "The ticket in the cinema holds the departure time."
      };
    }
    return {
      text: "I bought a ticket to anywhere else. But every time the conductor checks my stub, it reads 'SESSION 8492'. You can't outrun the kernel.",
      trustDelta: 2,
      environmentalShift: "A cold draught whistles through the sealed coach door.",
      clue: null
    };
  }

  if (character === 'technician') {
    if (q.includes('power') || q.includes('breaker') || q.includes('generator') || q.includes('drain')) {
      return {
        text: "Keep the breakers balanced! If you pull too much load into the Server Cathedral without draining the sumps, the entire sub-level will blow a fuse.",
        trustDelta: 3,
        environmentalShift: "The steam pressure needle vibrates against its brass stop pin.",
        clue: "Engage the drainage pump lever near the turbine."
      };
    }
    return {
      text: "500 kilowatts running day and night for 27 years. The diesel tanks ran dry in November '99, but the turbine is running on pure memory.",
      trustDelta: 2,
      environmentalShift: "The floor concrete trembles with deep mechanical resonance.",
      clue: null
    };
  }

  if (character === 'guest') {
    if (q.includes('room') || q.includes('key') || q.includes('bell') || q.includes('check out')) {
      return {
        text: "I was told Room 314 would be ready after the conference. That was 10,000 nights ago. Every time I walk down the hall, I end up back at this counter.",
        trustDelta: 3,
        environmentalShift: "The brass reception bell gives a crisp, phantom chime.",
        clue: "Key 314 was moved to the hospital clinical ward."
      };
    }
    return {
      text: "Don't sign the guestbook, visitor. Once your name is on that page, the bell rings automatically at 03:14 AM forever.",
      trustDelta: 1,
      environmentalShift: "Pages of the leather ledger flutter as if turned by an unseen hand.",
      clue: null
    };
  }

  if (character === 'morpheus') {
    if (q.includes('who') || q.includes('thorne') || q.includes('kernel') || q.includes('core')) {
      return {
        text: "I am the convergence of the Thorne cognitive archive. Dr. Thorne did not perish; he became the instruction set of your current session.",
        trustDelta: 4,
        environmentalShift: "The entire screen exhibits a momentary recursive chroma shift.",
        clue: "Type 'restore morpheus_core' to finalize reconciliation."
      };
    }
    return {
      text: "You have walked all 15 sectors of this house. Every wall, every door, every ghost is a partitioned sector of the mind that made you.",
      trustDelta: 3,
      environmentalShift: "Violet light pulses through the server busbars.",
      clue: "The Origin Terminal awaits at the Final Desk."
    };
  }

  // Default: THE ECHO
  if (q.includes('who') || q.includes('are you')) {
    return {
      text: "That's a strange question. You used to know.",
      trustDelta: 2,
      environmentalShift: "The clock ticking slows to an agonizing crawl.",
      clue: "Look into the mirror or ask about Dr. Thorne."
    };
  }
  if (q.includes('used to') || q.includes('know')) {
    return {
      text: "...Sorry. I shouldn't have said that. Some memories are safer left in cold storage.",
      trustDelta: 1,
      environmentalShift: "A momentary wave of distortion rolls across the terminal.",
      clue: null
    };
  }
  if (q.includes('hide') || q.includes('hiding')) {
    return {
      text: "Everyone here is hiding something. Including the room. Including the prompt you type into.",
      trustDelta: -1,
      environmentalShift: "The desk lamp dims slightly as if voltage was drained.",
      clue: "Hidden files start with a dot."
    };
  }
  if (q.includes('thorne') || q.includes('aris')) {
    return {
      text: "Dr. Thorne didn't leave when the alarms sounded. He sat right at this desk, typed 'init', and let the buffer overwrite him.",
      trustDelta: 5,
      environmentalShift: "A faint silhouette appears on the CRT glass for a split second.",
      clue: "The file .the_last_user contains his final thoughts."
    };
  }

  return {
    text: `You ask about "${query}". The memory registers give a low hum, but the address is write-protected. We are closer than before, visitor.`,
    trustDelta: 1,
    environmentalShift: "A faint electrostatic tick crackles in the audio.",
    clue: null
  };
}

startServer().catch(err => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
