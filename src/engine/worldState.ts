import { GhostCharacterId } from './ghostChatService';

export interface RoomDoor {
  targetRoomId: string;
  label: string;
  locked: boolean;
  requiredFlag?: string;
  keyItem?: string;
  lockedMessage?: string;
}

export interface RoomInteractable {
  id: string;
  name: string;
  prompt: string;
  actionType: 'inspect' | 'talk' | 'use' | 'toggle' | 'collect';
  description: string;
  spectralReaction?: string;
  rewardFlag?: string;
  evidenceId?: string;
  ghostId?: GhostCharacterId;
  relatedQuestId?: string;
}

export type FloorLevel = 'sub_2' | 'sub_1' | 'ground' | 'first' | 'second' | 'rooftop_void';

export interface HauntedRoom {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  floor: FloorLevel;
  floorName: string;
  isSecret?: boolean;
  unlocked: boolean;
  visited: boolean;
  ambientColor: number;
  lightColor: number;
  fogDensity: number;
  primaryGhost: GhostCharacterId;
  description: string;
  doors: RoomDoor[];
  interactables: RoomInteractable[];
  environmentalNotes: string;
}

export interface CrossRoomQuest {
  id: string;
  title: string;
  stages: {
    description: string;
    completed: boolean;
    hint: string;
  }[];
  currentStage: number;
  completed: boolean;
  rewardFlag: string;
}

export interface WorldEnvironmentState {
  // Power grid switches (Basement Generator -> other rooms)
  powerGrid: {
    mainGenerator: boolean;
    corridorLights: boolean;
    hospitalElevator: boolean;
    cinemaProjector: boolean;
    serverCathedral: boolean;
    drainagePumps: boolean;
  };
  // Water drainage (Generator controls)
  drainageState: {
    apartmentFlooded: boolean;
    archiveFlooded: boolean;
    secondBasementFlooded: boolean;
  };
  // Clock synchronization puzzle
  clocks: {
    lastRoom: string; // "03:14"
    bedroom: string;  // "03:14"
    hospital: string; // "03:14"
  };
  // Puzzle progression flags
  puzzles: {
    cinemaReelMounted: boolean;
    schoolRegisterDecoded: boolean;
    trainTicketFound: boolean;
    caretakerKeyObtained: boolean;
    mirrorShardsCount: number;
    wallpaperPeeled: boolean;
    corridorPhoneAnswered: boolean;
    hospitalLocker314Opened: boolean;
    serverConsoleOverridden: boolean;
    hotelBellRungCount: number;
    memoryGardenPhotoExamined: boolean;
  };
  // Inventory items acquired
  inventory: string[];
}

export const INITIAL_ROOMS: Record<string, HauntedRoom> = {
  last_room: {
    id: 'last_room',
    code: 'ROOM 00',
    title: 'THE LAST ROOM',
    subtitle: 'Where the session began. 1999.',
    floor: 'first',
    floorName: '1st Floor // Living Quarters',
    unlocked: true,
    visited: true,
    ambientColor: 0x090e12,
    lightColor: 0xffbf69,
    fogDensity: 0.04,
    primaryGhost: 'echo',
    description: 'A wood-paneled room preserved in amber. A green phosphor terminal hums on the desk beside an ominous tarnished mirror.',
    environmentalNotes: 'The air smells of ozone and 27-year-old dust. Outside the window, static fills the sky.',
    doors: [
      { targetRoomId: 'corridor', label: 'Door 101 to Long Corridor', locked: false }
    ],
    interactables: [
      {
        id: 'terminal',
        name: 'Phosphor Terminal',
        prompt: 'Access CLI',
        actionType: 'use',
        description: 'IBM-compatible terminal running PHANTOM SHELL Kernel 6.14.0. The cursor blinks autonomously.'
      },
      {
        id: 'mirror',
        name: 'Tarnished Mirror',
        prompt: 'Look into Mirror',
        actionType: 'inspect',
        description: 'An antique oval mirror. When you stare into it, your reflection blinks half a second late.',
        spectralReaction: 'A pale girl with dark hair appears in the glass, pointing behind you.',
        rewardFlag: 'The Girl in the Mirror',
        evidenceId: 'ev_mirror',
        ghostId: 'mirror'
      },
      {
        id: 'clock',
        name: 'Mantelpiece Clock',
        prompt: 'Check Time',
        actionType: 'inspect',
        description: 'The brass pendulum is frozen in place. The hands point rigidly to 03:14 AM.',
        spectralReaction: 'The hands twitch backward once with a metallic snap.'
      },
      {
        id: 'desk_drawer',
        name: 'Mahogany Desk Drawer',
        prompt: 'Search Drawer',
        actionType: 'inspect',
        description: 'Inside lies a handwritten memorandum labeled "MORPHEUS - Phase 3 Human Integration by Dr. Thorne".',
        rewardFlag: 'Discovered Thorne Memo',
        evidenceId: 'ev_02'
      }
    ]
  },

  corridor: {
    id: 'corridor',
    code: 'ROOM 01',
    title: 'THE LONG CORRIDOR',
    subtitle: 'Flickering fluorescent tubes and numbered doors.',
    floor: 'ground',
    floorName: 'Ground Floor // Main Wing',
    unlocked: true,
    visited: false,
    ambientColor: 0x071118,
    lightColor: 0x88ccff,
    fogDensity: 0.05,
    primaryGhost: 'caretaker',
    description: 'An unnervingly long corridor lined with doors numbered 101 through 108. The brown floral wallpaper is peeling near a humming telephone.',
    environmentalNotes: 'Fluorescent tubes hum with a 60Hz buzz. In the distance, a silhouette vanishes around a corner.',
    doors: [
      { targetRoomId: 'last_room', label: 'Door 101 to The Last Room', locked: false },
      { targetRoomId: 'bedroom', label: 'Door 102 to Forgotten Bedroom', locked: false },
      { targetRoomId: 'apartment', label: 'Door 104 to Flooded Apartment', locked: false },
      { targetRoomId: 'school', label: 'Double Doors to Deserted School', locked: false },
      { targetRoomId: 'hotel', label: 'Heavy Fire Door to Looping Hotel', locked: false },
      { targetRoomId: 'generator', label: 'Basement Stairs to Generator', locked: false },
      { targetRoomId: 'room_behind_wall', label: 'Peeling Wallpaper Seam', locked: true, requiredFlag: 'wallpaperPeeled', lockedMessage: 'The wallpaper is swollen with moisture. Inspect it closely to peel it back.' }
    ],
    interactables: [
      {
        id: 'phone',
        name: 'Wall-Mounted Rotary Phone',
        prompt: 'Listen to Handset',
        actionType: 'use',
        description: 'The black rotary phone clicks rhythmically. A quiet breathing sound waits on the line.',
        spectralReaction: '"...He left via the platform. Don\'t let the clock reach 03:15..."',
        rewardFlag: 'Corridor Phone Call Answered',
        evidenceId: 'ev_phone'
      },
      {
        id: 'wallpaper',
        name: 'Peeling Damask Wallpaper',
        prompt: 'Peel Wallpaper',
        actionType: 'toggle',
        description: 'Layers of wallpaper have bubbled away from the drywall, exposing a hollow rectangular seam.',
        spectralReaction: 'You peel back the brittle paper, revealing a hidden crawlspace doorway labeled "MAINTENANCE ACCESS 0".',
        rewardFlag: 'Wallpaper Peeled Open'
      },
      {
        id: 'door_8492',
        name: 'Door 8492-B',
        prompt: 'Inspect Door Plaque',
        actionType: 'inspect',
        description: 'A tarnished brass number reads "8492-B"—the exact ID of your terminal session.',
        spectralReaction: 'From within, the sound of keyboard strokes matches your exact cadence.'
      },
      {
        id: 'caretaker_cart',
        name: 'Rusty Janitor Cart',
        prompt: 'Inspect Tool Cart',
        actionType: 'inspect',
        description: 'A galvanized bucket, dried mop, and a clip-board with Walter Chen\'s daily patrol log from October 27, 1999.',
        ghostId: 'caretaker'
      }
    ]
  },

  bedroom: {
    id: 'bedroom',
    code: 'ROOM 02',
    title: 'THE FORGOTTEN BEDROOM',
    subtitle: "A child's bedroom frozen in time.",
    floor: 'first',
    floorName: '1st Floor // Domestic Wing',
    unlocked: true,
    visited: false,
    ambientColor: 0x0c0812,
    lightColor: 0xf472b6,
    fogDensity: 0.045,
    primaryGhost: 'child',
    description: 'A small child\'s bedroom. Glow-in-the-dark stars line the ceiling, and wooden counting blocks are arranged across the rug.',
    environmentalNotes: 'A faint windup lullaby plays backwards from an unseen source.',
    doors: [
      { targetRoomId: 'corridor', label: 'Exit to Corridor', locked: false },
      { targetRoomId: 'observation_room', label: 'Wardrobe False Back', locked: true, requiredFlag: 'wardrobeInspected', lockedMessage: 'The wardrobe is packed with heavy woolen coats.' }
    ],
    interactables: [
      {
        id: 'blocks',
        name: 'Carved Toy Blocks',
        prompt: 'Read Block Order',
        actionType: 'inspect',
        description: 'Wooden blocks spell out: "3 - 1 - 4 - E - X - I - T".',
        spectralReaction: 'A childish whisper: "I counted all the teeth. Four left for you."',
        ghostId: 'child'
      },
      {
        id: 'music_box',
        name: 'Vintage Tin Music Box',
        prompt: 'Wind Music Box',
        actionType: 'use',
        description: 'The key turns with heavy resistance. A discordant melody tinkles as the tin lid opens.',
        rewardFlag: 'Music Box Melody Played',
        evidenceId: 'ev_music_box'
      },
      {
        id: 'wardrobe',
        name: 'Carved Oak Wardrobe',
        prompt: 'Inspect Back Panel',
        actionType: 'inspect',
        description: 'Behind the hanging coats, the rear wooden panel sounds hollow and has a concealed sliding latch.',
        rewardFlag: 'Wardrobe False Back Revealed'
      }
    ]
  },

  apartment: {
    id: 'apartment',
    code: 'ROOM 03',
    title: 'THE FLOODED APARTMENT',
    subtitle: 'Black water rising from beneath the floorboards.',
    floor: 'first',
    floorName: '1st Floor // Residential Sector',
    unlocked: true,
    visited: false,
    ambientColor: 0x040810,
    lightColor: 0x4488bb,
    fogDensity: 0.06,
    primaryGhost: 'child',
    description: 'An open-concept living room submerged in four inches of reflective black water. Soaked velvet armchairs float slightly.',
    environmentalNotes: 'Water drips continuously from the cracked ceiling. A grandfather clock ticks in reverse.',
    doors: [
      { targetRoomId: 'corridor', label: 'Door to Corridor', locked: false },
      { targetRoomId: 'empty_apartment', label: 'Balcony Doorway to Empty Flat', locked: false }
    ],
    interactables: [
      {
        id: 'reverse_clock',
        name: 'Reversed Grandfather Clock',
        prompt: 'Inspect Clockwork',
        actionType: 'inspect',
        description: 'The wooden hands rotate counter-clockwise. The brass pendulum swings through the pooling water.',
        spectralReaction: 'The minute hand halts on XII, then snaps violently backward to 03:14.'
      },
      {
        id: 'submerged_safe',
        name: 'Iron Wall Safe',
        prompt: 'Inspect Submerged Safe',
        actionType: 'use',
        description: 'A heavy iron safe bolted near floor level, currently flooded with murky water. Requires drainage pump activation.',
        rewardFlag: 'Submerged Safe Inspected'
      },
      {
        id: 'floating_papers',
        name: 'Waterlogged Document Pages',
        prompt: 'Fish Out Documents',
        actionType: 'inspect',
        description: 'Floppy disk labels and shredded psychiatric evaluations for Subject 01 (Elena Ward).',
        evidenceId: 'ev_elena_eval'
      }
    ]
  },

  school: {
    id: 'school',
    code: 'ROOM 04',
    title: 'THE SCHOOL WITH NO STUDENTS',
    subtitle: 'Chalk formulas on the slate that write themselves.',
    floor: 'first',
    floorName: '1st Floor // Institutional Wing',
    unlocked: true,
    visited: false,
    ambientColor: 0x090d0b,
    lightColor: 0x77ffaa,
    fogDensity: 0.045,
    primaryGhost: 'teacher',
    description: 'A 1990s classroom with rows of wooden desks. White chalk dust hangs in the air beneath dead fluorescent fixtures.',
    environmentalNotes: 'The squeak of chalk scratching against slate echoes through the room even when nobody is at the board.',
    doors: [
      { targetRoomId: 'corridor', label: 'Door to Main Corridor', locked: false },
      { targetRoomId: 'hospital', label: 'Covered Walkway to Hospital Wing', locked: false }
    ],
    interactables: [
      {
        id: 'chalkboard',
        name: 'Self-Writing Blackboard',
        prompt: 'Read Chalk Equations',
        actionType: 'inspect',
        description: 'Mathematical formulas decomposing human memory into byte streams. Fresh chalk dust settles on the tray.',
        spectralReaction: 'The words "ATTENDANCE: MARIAN HOLT // LOCKER 314" appear in sharp cursive.',
        rewardFlag: 'Classroom Formula Decoded',
        evidenceId: 'ev_chalk'
      },
      {
        id: 'teacher_desk',
        name: "Teacher's Oak Desk",
        prompt: 'Inspect Attendance Ledger',
        actionType: 'inspect',
        description: 'The daily attendance book for October 1999. The final entry lists 14 students, all marked "TRANSFERRED TO SECTOR 7".',
        ghostId: 'teacher'
      },
      {
        id: 'pa_speaker',
        name: 'Wall Intercom Speaker',
        prompt: 'Listen to Speaker',
        actionType: 'use',
        description: 'The metal speaker grille emits crackling static and a woman\'s voice asking everyone to remain at their desks.',
        spectralReaction: '"Class is not dismissed until all neural registers are cleared."'
      }
    ]
  },

  hospital: {
    id: 'hospital',
    code: 'ROOM 05',
    title: 'HOSPITAL OF UNFINISHED NAMES',
    subtitle: 'Corrupted patient records and silent heart monitors.',
    floor: 'second',
    floorName: '2nd Floor // Clinical Sector',
    unlocked: true,
    visited: false,
    ambientColor: 0x060e10,
    lightColor: 0x55ffcc,
    fogDensity: 0.055,
    primaryGhost: 'nurse',
    description: 'A sterile, dim ward with overturned metal gurneys, vinyl curtains stained with time, and a nurses\' triage desk.',
    environmentalNotes: 'An ECG monitor displays a flat green line, emitting a continuous low electrical tone.',
    doors: [
      { targetRoomId: 'school', label: 'Walkway to School Wing', locked: false },
      { targetRoomId: 'memory_garden', label: 'Double Doors to Memory Courtyard', locked: false },
      { targetRoomId: 'unfinished_floor', label: 'Elevator Shaft (Glitch Access)', locked: true, requiredFlag: 'hospitalElevatorPowered', lockedMessage: 'The elevator call button is dead. Restore power in the Basement Generator.' }
    ],
    interactables: [
      {
        id: 'nurse_station',
        name: "Nurses' Station Desk",
        prompt: 'Talk to Nurse Marian',
        actionType: 'talk',
        description: 'A shadowy silhouette in a vintage nurse uniform sits behind the acrylic partition.',
        ghostId: 'nurse'
      },
      {
        id: 'locker_314',
        name: 'Supply Locker 314',
        prompt: 'Open Locker 314',
        actionType: 'use',
        description: 'A dented metal locker labeled "M. HOLT - CHARGE NURSE". Locked with a 3-digit combination.',
        spectralReaction: 'Dialing 3-1-4 pops the latch open! Inside is a sealed vial labeled "SEDATIVE 09" and Dr. Thorne\'s medical clearance badge.',
        rewardFlag: 'Locker 314 Opened',
        evidenceId: 'ev_nurse_badge'
      },
      {
        id: 'ecg_monitor',
        name: 'Flickering ECG Unit',
        prompt: 'Inspect Pulse Trace',
        actionType: 'inspect',
        description: 'The green phosphor trace occasionally spikes into the waveform of a human voice speaking binary.',
        spectralReaction: 'The speaker chirps: "PULSE DETECTED IN SECTOR 15 (CORE)."'
      }
    ]
  },

  archive: {
    id: 'archive',
    code: 'ROOM 06',
    title: 'THE FLOODED ARCHIVE',
    subtitle: 'Submerged tape drives and waterlogged magnetic reels.',
    floor: 'sub_1',
    floorName: 'Basement Level 1 // Data Repository',
    unlocked: true,
    visited: false,
    ambientColor: 0x03080e,
    lightColor: 0x3399ff,
    fogDensity: 0.065,
    primaryGhost: 'archivist',
    description: 'Towering metal bookstacks and 9-track magnetic tape cabinets standing in knee-deep dark water. A rolling library ladder sits half-submerged.',
    environmentalNotes: 'Magnetic tape strips hang from overhead cable trays like weeping willow branches.',
    doors: [
      { targetRoomId: 'cinema', label: 'Tunnel to Cinema Projection Booth', locked: false },
      { targetRoomId: 'generator', label: 'Waterproof Hatch to Generator', locked: false }
    ],
    interactables: [
      {
        id: 'tape_rack',
        name: 'Magnetic Tape Drive Bank',
        prompt: 'Inspect Tape Drive',
        actionType: 'inspect',
        description: 'Open reel-to-reel drives from 1999. One reel labeled "REEL 04 - INCIDENT RECONSTRUCTION" rests on the console shelf.',
        rewardFlag: 'Cinema Film Reel Acquired',
        evidenceId: 'ev_film_reel'
      },
      {
        id: 'microfilm_viewer',
        name: 'Green Microfilm Reader',
        prompt: 'Read Microfilm',
        actionType: 'use',
        description: 'The motorized viewer hums. Scanned newspapers from October 1999 report the sudden evacuation of the Thorne Institute.',
        ghostId: 'archivist'
      },
      {
        id: 'archive_ladder',
        name: 'Submerged Library Ladder',
        prompt: 'Climb Ladder to Upper Shelf',
        actionType: 'inspect',
        description: 'High on the dry top shelf rests a brass key stamped "MASTER - CARETAKER".',
        rewardFlag: 'Caretaker Master Key Acquired'
      }
    ]
  },

  cinema: {
    id: 'cinema',
    code: 'ROOM 07',
    title: 'THE ABANDONED CINEMA',
    subtitle: 'Red velvet seats in decay, dust in the projector beam.',
    floor: 'ground',
    floorName: 'Ground Floor // Entertainment Sector',
    unlocked: true,
    visited: false,
    ambientColor: 0x0c0608,
    lightColor: 0xff4455,
    fogDensity: 0.05,
    primaryGhost: 'projectionist',
    description: 'A decaying single-screen movie theater with rows of slashed red velvet seats. An empty projector beam cuts through the gloom.',
    environmentalNotes: 'The giant canvas screen flickers with black and white surveillance loops of the player in other rooms.',
    doors: [
      { targetRoomId: 'archive', label: 'Backstage Door to Flooded Archive', locked: false },
      { targetRoomId: 'train_station', label: 'Concourse to Train Station', locked: false }
    ],
    interactables: [
      {
        id: 'projector',
        name: '35mm Film Projector',
        prompt: 'Mount Film Reel',
        actionType: 'use',
        description: 'A heavy brass and steel projector. The feed spool is empty, waiting for an archival reel.',
        spectralReaction: 'The projector clatters to life! On the main screen, Dr. Thorne is seen entering Morpheus Core while reciting access code "OMEGA-1999".',
        rewardFlag: 'Cinema Reel Projected',
        evidenceId: 'ev_cinema_feed'
      },
      {
        id: 'cinema_screen',
        name: 'Rotting Movie Screen',
        prompt: 'Inspect Projection Screen',
        actionType: 'inspect',
        description: 'The giant cloth screen ripples as if someone is pressing their face against the reverse side.',
        ghostId: 'projectionist'
      },
      {
        id: 'seat_g12',
        name: 'Row G Seat 12',
        prompt: 'Search Seat Cushion',
        actionType: 'inspect',
        description: 'Tucked beneath the moldy velvet cushion is a half-torn ticket to the 03:14 express train.',
        rewardFlag: 'Train Ticket Found',
        evidenceId: 'ev_ticket'
      }
    ]
  },

  train_station: {
    id: 'train_station',
    code: 'ROOM 08',
    title: 'THE ABANDONED TRAIN STATION',
    subtitle: 'Concrete platform and an arrival board with impossible destinations.',
    floor: 'ground',
    floorName: 'Ground Floor // Sub-Transit Terminal',
    unlocked: true,
    visited: false,
    ambientColor: 0x06080c,
    lightColor: 0x58d9ff,
    fogDensity: 0.05,
    primaryGhost: 'passenger',
    description: 'An underground passenger platform with yellow tactile paving. A split-flap arrival board clatters continuously without stopping.',
    environmentalNotes: 'A matte-black passenger train sits motionless on the tracks, illuminated by cold interior coach lights.',
    doors: [
      { targetRoomId: 'cinema', label: 'Stairs to Cinema', locked: false },
      { targetRoomId: 'mirror_gallery', label: 'Turnstiles to Mirror Gallery', locked: false }
    ],
    interactables: [
      {
        id: 'arrival_board',
        name: 'Split-Flap Solari Board',
        prompt: 'Read Arrivals',
        actionType: 'inspect',
        description: 'The mechanical flaps rattle: "DESTINATION: YESTERDAY - TRACK 1 // SECTOR 0 - DEPARTED // BEFORE - ON TIME".',
        spectralReaction: 'The board spells out the player\'s current session ID.'
      },
      {
        id: 'train_carriage',
        name: 'Silent Midnight Coach',
        prompt: 'Step Into Train Coach',
        actionType: 'use',
        description: 'Inside the carriage, all seats are empty except for a miniature scale model of THE LAST ROOM placed on a table.',
        spectralReaction: 'A man in an overcoat sits in the rear window reflection: "The train doesn\'t leave. The world outside dissolved years ago."',
        ghostId: 'passenger'
      },
      {
        id: 'turnstile',
        name: 'Brass Token Turnstile',
        prompt: 'Inspect Turnstile Gate',
        actionType: 'inspect',
        description: 'The turnstile mechanism is rusted solid, holding open the path toward the Mirror Gallery.'
      }
    ]
  },

  mirror_gallery: {
    id: 'mirror_gallery',
    code: 'ROOM 09',
    title: 'THE MIRROR GALLERY',
    subtitle: 'A hall of ornate mirrors where reflections do not obey.',
    floor: 'first',
    floorName: '1st Floor // West Wing',
    unlocked: true,
    visited: false,
    ambientColor: 0x070b14,
    lightColor: 0xa78bfa,
    fogDensity: 0.045,
    primaryGhost: 'mirror',
    description: 'A high-ceilinged corridor flanked on both sides by full-length gilded mirrors. In each mirror, the room appears slightly different.',
    environmentalNotes: 'When you take three paces forward, your reflection in the third mirror on the left pauses to watch you pass.',
    doors: [
      { targetRoomId: 'train_station', label: 'Archway to Train Station', locked: false },
      { targetRoomId: 'hotel', label: 'Curtained Passage to Looping Hotel', locked: false }
    ],
    interactables: [
      {
        id: 'central_mirror',
        name: 'Great Cracked Mirror',
        prompt: 'Commune with Elena Ward',
        actionType: 'talk',
        description: 'A seven-foot Venetian mirror cracked into a spiderweb pattern. In the center stands Elena Ward.',
        ghostId: 'mirror'
      },
      {
        id: 'mirror_shards',
        name: 'Silver Glass Shards',
        prompt: 'Collect Reflective Shard',
        actionType: 'collect',
        description: 'Sharp shards of silvered glass lying on the parquet floor, reflecting impossible angles of Room 00.',
        rewardFlag: 'Mirror Shards Collected'
      },
      {
        id: 'false_mirror',
        name: 'Framed Empty Aperture',
        prompt: 'Inspect Dark Opening',
        actionType: 'inspect',
        description: 'One mirror frame contains no glass at all—only an ink-black doorway looking into the Observation Room.',
        rewardFlag: 'Discovered Observation Room Entrance'
      }
    ]
  },

  generator: {
    id: 'generator',
    code: 'ROOM 10',
    title: 'THE BASEMENT GENERATOR',
    subtitle: 'Massive turbine and circuit breaker panels controlling the house.',
    floor: 'sub_1',
    floorName: 'Basement Level 1 // Power Station',
    unlocked: true,
    visited: false,
    ambientColor: 0x0a0604,
    lightColor: 0xffbf69,
    fogDensity: 0.05,
    primaryGhost: 'technician',
    description: 'A concrete bunker housing a 500kW diesel turbine. Giant copper busbars run along the ceiling toward a massive breaker panel.',
    environmentalNotes: 'Steam hisses from high-pressure valves. The turbine vibrates the floor with a rhythmic subterranean pulse.',
    doors: [
      { targetRoomId: 'corridor', label: 'Concrete Stairs to Ground Corridor', locked: false },
      { targetRoomId: 'archive', label: 'Watertight Bulkhead to Archive', locked: false },
      { targetRoomId: 'server_cathedral', label: 'Steel Door to Server Cathedral', locked: false },
      { targetRoomId: 'second_basement', label: 'Sub-Pump Floor Trapdoor', locked: true, requiredFlag: 'drainagePumpsActive', lockedMessage: 'The iron trapdoor is submerged beneath flooded sump water. Activate the drainage pump first.' }
    ],
    interactables: [
      {
        id: 'breaker_panel',
        name: 'High-Voltage Breaker Rack',
        prompt: 'Toggle Power Circuits',
        actionType: 'toggle',
        description: 'Heavy knife switches labeled: [1] Corridor [2] Hospital Elevator [3] Cinema Projector [4] Server Core [5] Drainage Pumps.',
        spectralReaction: 'You throw the breaker! Relays clatter across the complex as power floods into the dormant circuits.',
        rewardFlag: 'All Facility Breakers Energized'
      },
      {
        id: 'pump_control',
        name: 'Emergency Sump Pump Lever',
        prompt: 'Engage Drainage Sump',
        actionType: 'use',
        description: 'Industrial turbine pump controls designed to evacuate floodwaters from Sector 1 and Sector 3.',
        spectralReaction: 'The massive pump roars to life. Gurgling sounds echo through the floor pipes as water levels drop.',
        rewardFlag: 'Facility Water Drained'
      },
      {
        id: 'technician_workbench',
        name: 'Marcus Vance Workstation',
        prompt: 'Talk to Marcus Vance',
        actionType: 'talk',
        description: 'A blue jumpsuit hanging from an iron pipe, with greasy tool manuals on the bench.',
        ghostId: 'technician'
      }
    ]
  },

  server_cathedral: {
    id: 'server_cathedral',
    code: 'ROOM 11',
    title: 'THE SERVER CATHEDRAL',
    subtitle: 'Towering racks of blinking LEDs and suspended data cables.',
    floor: 'sub_1',
    floorName: 'Basement Level 1 // Computational Core',
    unlocked: true,
    visited: false,
    ambientColor: 0x05030c,
    lightColor: 0x7cff9b,
    fogDensity: 0.04,
    primaryGhost: 'echo',
    description: 'A vault with 20-foot ceilings packed with floor-to-ceiling server cabinets. Thousands of green and amber LEDs flicker like fireflies.',
    environmentalNotes: 'Overhead cooling fans produce a deep harmonic hum reminiscent of a gothic organ.',
    doors: [
      { targetRoomId: 'generator', label: 'Bulkhead to Generator', locked: false },
      { targetRoomId: 'morpheus_core', label: 'Central Vault Door to Morpheus Core', locked: true, requiredFlag: 'serverOverridden', lockedMessage: 'The 3-ton magnetic vault door requires root terminal authorization.' }
    ],
    interactables: [
      {
        id: 'altar_terminal',
        name: 'Pedestal Terminal Console',
        prompt: 'Override Root Access',
        actionType: 'use',
        description: 'An elevated CRT workstation illuminated by phosphor green. Prompts for system reconciliation.',
        spectralReaction: 'ROOT ACCESS GRANTED. Sector 15 (Morpheus Core) blast doors unsealed.',
        rewardFlag: 'Server Core Overridden',
        evidenceId: 'ev_root_auth'
      },
      {
        id: 'hanging_cables',
        name: 'Cascading Ribbon Cables',
        prompt: 'Inspect Cable Bunches',
        actionType: 'inspect',
        description: 'Thick bundles of coaxial lines woven together like roots of an ancient banyan tree.',
        spectralReaction: 'A spark jumps from the cable jacket, spelling out letters: "M-O-R-P-H-E-U-S".'
      }
    ]
  },

  hotel: {
    id: 'hotel',
    code: 'ROOM 12',
    title: 'THE LOOPING HOTEL',
    subtitle: 'An endless hallway where every turn leads back to the reception desk.',
    floor: 'ground',
    floorName: 'Ground Floor // Annex Sector',
    unlocked: true,
    visited: false,
    ambientColor: 0x0c0704,
    lightColor: 0xfbbf24,
    fogDensity: 0.05,
    primaryGhost: 'guest',
    description: 'A mahogany-paneled hotel reception area from 1999. A brass desk bell sits next to an open leather-bound guest register.',
    environmentalNotes: 'Walking down the side hallway leads right back to the front desk from the opposite door.',
    doors: [
      { targetRoomId: 'corridor', label: 'Door to Corridor', locked: false },
      { targetRoomId: 'mirror_gallery', label: 'Archway to Mirror Gallery', locked: false }
    ],
    interactables: [
      {
        id: 'brass_bell',
        name: 'Brass Reception Bell',
        prompt: 'Ring Service Bell',
        actionType: 'use',
        description: 'A polished brass service bell. A small plaque reads "RING FOR ATTENDANT".',
        spectralReaction: 'Ding! The sound reverberates unnervingly. A silhouette steps behind the front desk counter.',
        rewardFlag: 'Hotel Bell Rung',
        ghostId: 'guest'
      },
      {
        id: 'guest_register',
        name: 'Leather Guestbook',
        prompt: 'Read Guest Register',
        actionType: 'inspect',
        description: 'Every single line is signed by "Dr. Aris Thorne" with checkout date listed as "NEVER".',
        evidenceId: 'ev_guestbook'
      },
      {
        id: 'key_rack',
        name: 'Brass Key Cabinet',
        prompt: 'Inspect Key Hooks',
        actionType: 'inspect',
        description: 'Hooks for rooms 101 to 400. Only hook 314 is empty.',
        spectralReaction: 'A chill passes over the key cabinet.'
      }
    ]
  },

  rooftop: {
    id: 'rooftop',
    code: 'ROOM 13',
    title: 'THE ROOFTOP OF STATIC',
    subtitle: 'Rain in the dark and a transmission antenna broadcasting white noise.',
    floor: 'rooftop_void',
    floorName: 'Roof Level // Atmospheric Station',
    unlocked: true,
    visited: false,
    ambientColor: 0x040508,
    lightColor: 0x93c5fd,
    fogDensity: 0.065,
    primaryGhost: 'echo',
    description: 'A tar-and-gravel rooftop exposed to pitch black skies. A triangular broadcast tower hums as lightning flashes silently on the horizon.',
    environmentalNotes: 'Rain falls upward in sporadic slow-motion bursts before evaporating into grey static.',
    doors: [
      { targetRoomId: 'memory_garden', label: 'Fire Escape Stairwell Down', locked: false },
      { targetRoomId: 'room_zero', label: 'Edge of Parapet (Void Jump)', locked: true, requiredFlag: 'rooftopTelescopeAimed', lockedMessage: 'The drop leads into pure television static. Align the telescope first.' }
    ],
    interactables: [
      {
        id: 'telescope',
        name: 'Brass Parapet Telescope',
        prompt: 'Look Through Telescope',
        actionType: 'use',
        description: 'Pointed into the distance. Through the reticle, you can see THE LAST ROOM\'s window—with someone looking right back at you.',
        spectralReaction: 'Coordinates 0x0000 lock into the ocular lens.',
        rewardFlag: 'Rooftop Telescope Aligned',
        evidenceId: 'ev_telescope'
      },
      {
        id: 'broadcast_mast',
        name: 'Shortwave Transmission Mast',
        prompt: 'Inspect Antenna Feed',
        actionType: 'inspect',
        description: 'The antenna lead cables vibrate against the steel bracing, receiving morse code from inside the kernel.',
        ghostId: 'echo'
      }
    ]
  },

  memory_garden: {
    id: 'memory_garden',
    code: 'ROOM 14',
    title: 'THE MEMORY GARDEN',
    subtitle: 'Withered dead trees hanging paper photographs from their branches.',
    floor: 'second',
    floorName: '2nd Floor // Solarium Wing',
    unlocked: true,
    visited: false,
    ambientColor: 0x060907,
    lightColor: 0x86efac,
    fogDensity: 0.045,
    primaryGhost: 'teacher',
    description: 'A decayed indoor courtyard with shattered skylights. In the center grows a dead willow tree whose boughs are tied with hundreds of black-and-white photos.',
    environmentalNotes: 'The dry fountain basin in the center is filled with discarded terminal punch cards.',
    doors: [
      { targetRoomId: 'hospital', label: 'Glass Doors to Hospital', locked: false },
      { targetRoomId: 'rooftop', label: 'Iron Spiral Stairs to Rooftop', locked: false }
    ],
    interactables: [
      {
        id: 'willow_photos',
        name: 'Hanging Memory Photographs',
        prompt: 'Examine Photos',
        actionType: 'inspect',
        description: 'Photographs of staff and patients in 1999. In the final photo, Dr. Thorne is smiling alongside Elena Ward before the experiment.',
        spectralReaction: 'The photograph flutters in your hands. On the back is scribbled: "We never left."',
        rewardFlag: 'Garden Photographs Examined',
        evidenceId: 'ev_garden_photo'
      },
      {
        id: 'stone_fountain',
        name: 'Cracked Stone Fountain',
        prompt: 'Search Punch Cards',
        actionType: 'inspect',
        description: 'A punch card dated October 27, 1999 reads: "PROGRAM HALTED - MEMORY CONVERGENCE ACHIEVED".'
      }
    ]
  },

  morpheus_core: {
    id: 'morpheus_core',
    code: 'ROOM 15',
    title: 'MORPHEUS CENTRAL CORE',
    subtitle: 'The nexus where consciousness and kernel converged.',
    floor: 'sub_2',
    floorName: 'Sub-Level 2 // System Kernel',
    unlocked: true,
    visited: false,
    ambientColor: 0x0a0314,
    lightColor: 0xa855f7,
    fogDensity: 0.035,
    primaryGhost: 'morpheus',
    description: 'An impossible space of surreal overlapping architecture. Pieces of the bedroom, classroom, hospital, and station float in a luminous violet abyss.',
    environmentalNotes: 'At the center floats a monolithic stone pulpit supporting the original root terminal of Dr. Aris Thorne.',
    doors: [
      { targetRoomId: 'server_cathedral', label: 'Vault Door to Server Cathedral', locked: false },
      { targetRoomId: 'final_desk', label: 'Singularity Threshold', locked: false }
    ],
    interactables: [
      {
        id: 'morpheus_pulpit',
        name: 'Kernel Terminal Pulpit',
        prompt: 'Commune with Morpheus Core',
        actionType: 'talk',
        description: 'The root console of the MORPHEUS identity reconstruction engine.',
        ghostId: 'morpheus'
      },
      {
        id: 'reconciliation_pod',
        name: 'Neural Interface Cradle',
        prompt: 'Inspect Neural Cradle',
        actionType: 'inspect',
        description: 'A reclined medical chair surrounded by sensory induction coils where Thorne uploaded his final memories.',
        rewardFlag: 'Core Cradle Reconciled',
        evidenceId: 'ev_cradle'
      }
    ]
  },

  // SECRET ROOMS
  room_behind_wall: {
    id: 'room_behind_wall',
    code: 'SECRET 01',
    title: 'ROOM BEHIND THE WALL',
    subtitle: 'The hidden monitoring post between the hallway studs.',
    floor: 'ground',
    floorName: 'Ground Floor // Concealed Void',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x060608,
    lightColor: 0xf59e0b,
    fogDensity: 0.05,
    primaryGhost: 'caretaker',
    description: 'A cramped crawlspace lined with exposed two-by-four timber framing, acoustic listening tubes, and an old reel tape recorder.',
    environmentalNotes: 'Dust motes float in the beam of a hanging bare lightbulb.',
    doors: [
      { targetRoomId: 'corridor', label: 'Hole in Wallpaper to Corridor', locked: false }
    ],
    interactables: [
      {
        id: 'tape_recorder',
        name: 'Uher Reel-to-Reel Recorder',
        prompt: 'Play Cassette',
        actionType: 'use',
        description: 'Dr. Thorne\'s private diary: "The subject didn\'t die. The system simply refused to release her thoughts."',
        rewardFlag: 'Secret Audio Tape Played',
        evidenceId: 'ev_secret_tape'
      }
    ]
  },

  room_zero: {
    id: 'room_zero',
    code: 'SECRET 02',
    title: 'ROOM ZERO',
    subtitle: 'The unmapped null pointer address of the physical house.',
    floor: 'rooftop_void',
    floorName: 'Void Space // Address 0x0000',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x000000,
    lightColor: 0x22c55e,
    fogDensity: 0.03,
    primaryGhost: 'echo',
    description: 'A pitch black geometric room where walls are rendered in glowing green wireframes. Mathematical memory dumps scroll across the dark floor.',
    environmentalNotes: 'No sound exists here except for raw sine wave tones.',
    doors: [
      { targetRoomId: 'last_room', label: 'Memory Return to Room 00', locked: false }
    ],
    interactables: [
      {
        id: 'null_pointer_orb',
        name: 'Singularity Hex Node',
        prompt: 'Touch Hex Node',
        actionType: 'inspect',
        description: 'Memory address 0x00000000: The seed from which all 15 rooms were synthesized.',
        rewardFlag: 'Room Zero Discovered',
        evidenceId: 'ev_null_pointer'
      }
    ]
  },

  unfinished_floor: {
    id: 'unfinished_floor',
    code: 'SECRET 03',
    title: 'THE UNFINISHED FLOOR',
    subtitle: 'A wireframe sector left incomplete during compilation.',
    floor: 'second',
    floorName: '2nd Floor // Debug Space',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x030308,
    lightColor: 0x06b6d4,
    fogDensity: 0.04,
    primaryGhost: 'archivist',
    description: 'Half-rendered concrete walls dissolving into digital grid lines. Floating yellow caution tape and placeholder cubes with text "TODO: FURNITURE".',
    environmentalNotes: 'The world here lacks collision in some corners, revealing the deep void below.',
    doors: [
      { targetRoomId: 'hospital', label: 'Elevator Shaft Back to Hospital', locked: false }
    ],
    interactables: [
      {
        id: 'developer_clipboard',
        name: 'Compile Error Log',
        prompt: 'Read Debug Notes',
        actionType: 'inspect',
        description: 'Note from lead architect: "Build 6.14 failed to isolate Thorne. He is now part of the heap."',
        evidenceId: 'ev_debug_note'
      }
    ]
  },

  second_basement: {
    id: 'second_basement',
    code: 'SECRET 04',
    title: 'THE SECOND BASEMENT',
    subtitle: 'The deep sump chamber beneath the turbine foundation.',
    floor: 'sub_2',
    floorName: 'Sub-Level 2 // Deep Foundations',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x050402,
    lightColor: 0xd97706,
    fogDensity: 0.055,
    primaryGhost: 'technician',
    description: 'A flooded masonry chamber directly underneath the massive turbine foundation. Rusted chains hang from iron ringbolts in the stone.',
    environmentalNotes: 'Cold groundwater seeps between cracked bedrock slabs.',
    doors: [
      { targetRoomId: 'generator', label: 'Iron Ladder to Generator', locked: false }
    ],
    interactables: [
      {
        id: 'drained_chest',
        name: 'Iron Strongbox',
        prompt: 'Open Strongbox',
        actionType: 'use',
        description: 'Inside lies the original hard drive enclosure containing the MORPHEUS Alpha source code.',
        rewardFlag: 'Source Code Retrieved',
        evidenceId: 'ev_source_code'
      }
    ]
  },

  moving_room: {
    id: 'moving_room',
    code: 'SECRET 05',
    title: 'THE ROOM THAT MOVES',
    subtitle: 'A spatial anomaly whose doorway shifts across the house.',
    floor: 'ground',
    floorName: 'Wandering Sector // Phase Anomaly',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x080208,
    lightColor: 0xec4899,
    fogDensity: 0.05,
    primaryGhost: 'echo',
    description: 'A circular room with six identical doors. When you look back, the door you entered through has vanished.',
    environmentalNotes: 'A compass spinning madly without settling on north.',
    doors: [
      { targetRoomId: 'corridor', label: 'North Door to Corridor', locked: false }
    ],
    interactables: [
      {
        id: 'gyroscopic_compass',
        name: 'Brass Gyroscope',
        prompt: 'Calibrate Gyroscope',
        actionType: 'use',
        description: 'A clockwork orientation device that stabilizes spatial drift in the house.',
        rewardFlag: 'Spatial Drift Stabilized'
      }
    ]
  },

  observation_room: {
    id: 'observation_room',
    code: 'SECRET 06',
    title: 'THE OBSERVATION ROOM',
    subtitle: 'Two-way mirrors looking directly into Rooms 00 and 02.',
    floor: 'first',
    floorName: '1st Floor // Surreptitious Gallery',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x040608,
    lightColor: 0x38bdf8,
    fogDensity: 0.04,
    primaryGhost: 'mirror',
    description: 'A darkened gallery equipped with reel-to-reel audio consoles and tinted two-way glass peering straight into The Last Room and The Forgotten Bedroom.',
    environmentalNotes: 'Through the glass, you see your own chair in Room 00.',
    doors: [
      { targetRoomId: 'bedroom', label: 'Passage through Wardrobe', locked: false },
      { targetRoomId: 'mirror_gallery', label: 'Door to Mirror Gallery', locked: false }
    ],
    interactables: [
      {
        id: 'two_way_glass',
        name: 'Two-Way Mirror Pane',
        prompt: 'Look into Room 00',
        actionType: 'inspect',
        description: 'You can clearly see the phosphor terminal in Room 00 blinking quietly.',
        ghostId: 'mirror'
      }
    ]
  },

  empty_apartment: {
    id: 'empty_apartment',
    code: 'SECRET 07',
    title: 'THE EMPTY APARTMENT',
    subtitle: 'The dry, pristine twin of the Flooded Apartment.',
    floor: 'first',
    floorName: '1st Floor // Alternate Reflection',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x08090a,
    lightColor: 0xfef08a,
    fogDensity: 0.035,
    primaryGhost: 'child',
    description: 'An exact twin of Room 03, but completely dry, spotless, and furnished with warm 1999 sunlight pouring through the sheer curtains.',
    environmentalNotes: 'The grandfather clock here runs forward at perfect real-time speed.',
    doors: [
      { targetRoomId: 'apartment', label: 'Balcony Door to Flooded Apartment', locked: false }
    ],
    interactables: [
      {
        id: 'sunlit_tea',
        name: 'Warm Teacup on Table',
        prompt: 'Touch Ceramic Cup',
        actionType: 'inspect',
        description: 'Steam rises from the porcelain cup. Someone was sitting here less than ten seconds ago.',
        rewardFlag: 'Empty Apartment Solace'
      }
    ]
  },

  final_desk: {
    id: 'final_desk',
    code: 'SECRET 08',
    title: 'THE FINAL DESK',
    subtitle: 'An isolated island in the void with a single blinking monitor.',
    floor: 'sub_2',
    floorName: 'Sub-Kernel // The Zero Horizon',
    isSecret: true,
    unlocked: false,
    visited: false,
    ambientColor: 0x020204,
    lightColor: 0xa855f7,
    fogDensity: 0.025,
    primaryGhost: 'morpheus',
    description: 'An infinite dark expanse with no walls or ceiling. In the center floats a single oak desk with a green phosphor terminal displaying a blinking cursor.',
    environmentalNotes: 'The ultimate destination of the MORPHEUS reconstruction.',
    doors: [
      { targetRoomId: 'morpheus_core', label: 'Step Back into Core Vault', locked: false }
    ],
    interactables: [
      {
        id: 'final_terminal',
        name: 'The Origin Terminal',
        prompt: 'Enter Final Command',
        actionType: 'use',
        description: 'The prompt reads: "visitor@phantom:/$ _". All 15 memory sectors are linked.',
        rewardFlag: 'Final Desk Reached',
        ghostId: 'morpheus'
      }
    ]
  }
};

export const INITIAL_QUESTS: CrossRoomQuest[] = [
  {
    id: 'quest_signal',
    title: 'The Signal in the Static',
    currentStage: 0,
    completed: false,
    rewardFlag: 'SignalDecoded',
    stages: [
      {
        description: 'Investigate the transmission antenna on the Rooftop of Static (Room 13).',
        completed: false,
        hint: 'Use the parapet telescope to locate the origin beacon in the sky.'
      },
      {
        description: 'Restore high-voltage power to the Server Cathedral in the Basement Generator (Room 10).',
        completed: false,
        hint: 'Throw the breaker knife switches in Room 10.'
      },
      {
        description: 'Override the central altar terminal in the Server Cathedral (Room 11) using root authorization.',
        completed: false,
        hint: 'Access the glowing green pedestal in Room 11.'
      }
    ]
  },
  {
    id: 'quest_reel',
    title: 'The Missing Reel',
    currentStage: 0,
    completed: false,
    rewardFlag: 'ReelRestored',
    stages: [
      {
        description: 'Search the Flooded Archive (Room 06) for the incident reconstruction tape reel.',
        completed: false,
        hint: 'Look for tape drives resting above the water line.'
      },
      {
        description: 'Mount the film reel onto the 35mm projector in the Abandoned Cinema (Room 07).',
        completed: false,
        hint: 'Interact with the projector in Room 07.'
      },
      {
        description: 'Speak with The Projectionist about the surveillance feed showing your steps.',
        completed: false,
        hint: 'Talk to the silhouette behind the cinema screen.'
      }
    ]
  },
  {
    id: 'quest_attendance',
    title: 'The Attendance Record',
    currentStage: 0,
    completed: false,
    rewardFlag: 'LockerDecoded',
    stages: [
      {
        description: 'Examine the chalkboard in the School With No Students (Room 04) for forgotten names.',
        completed: false,
        hint: 'Read the self-writing chalk formulas in Room 04.'
      },
      {
        description: 'Locate Nurse Marian\'s supply locker 314 in the Hospital of Unfinished Names (Room 05).',
        completed: false,
        hint: 'Locker 314 is in the hallway corner of Room 05.'
      },
      {
        description: 'Retrieve Dr. Thorne\'s medical clearance badge from locker 314.',
        completed: false,
        hint: 'Use combination 3-1-4.'
      }
    ]
  },
  {
    id: 'quest_drain',
    title: 'Drain the Lowers',
    currentStage: 0,
    completed: false,
    rewardFlag: 'FloodsEvacuated',
    stages: [
      {
        description: 'Locate the emergency drainage pump controls in the Basement Generator (Room 10).',
        completed: false,
        hint: 'Find the red sump pump lever near the turbine.'
      },
      {
        description: 'Engage the pumps to drain the dark water from the Flooded Apartment (Room 03).',
        completed: false,
        hint: 'Once drained, inspect the floor-level safe in Room 03.'
      },
      {
        description: 'Retrieve Elena Ward\'s psychiatric evaluation file from the drained safe.',
        completed: false,
        hint: 'Examine the iron safe in Room 03.'
      }
    ]
  },
  {
    id: 'quest_mirror',
    title: "Elena's Broken Reflection",
    currentStage: 0,
    completed: false,
    rewardFlag: 'ElenaReconciled',
    stages: [
      {
        description: 'Confront The Girl in the Mirror in The Last Room (Room 00).',
        completed: false,
        hint: 'Inspect the tarnished mirror in Room 00.'
      },
      {
        description: 'Gather reflective silver shards from the floor of the Mirror Gallery (Room 09).',
        completed: false,
        hint: 'Collect the glass fragments in Room 09.'
      },
      {
        description: 'Bring the shards to the Great Cracked Mirror in Room 09 to repair Elena\'s memory.',
        completed: false,
        hint: 'Speak to Elena Ward in the Mirror Gallery.'
      }
    ]
  },
  {
    id: 'quest_counting',
    title: "The Child's Counting Song",
    currentStage: 0,
    completed: false,
    rewardFlag: 'ChildSecretFound',
    stages: [
      {
        description: 'Decipher the block arrangement in the Forgotten Bedroom (Room 02).',
        completed: false,
        hint: 'Inspect the wooden blocks on the rug.'
      },
      {
        description: 'Answer the ringing rotary telephone in the Long Corridor (Room 01).',
        completed: false,
        hint: 'Listen to the handset in Room 01.'
      },
      {
        description: 'Unlock Door 8492-B matching your terminal session ID in Room 01.',
        completed: false,
        hint: 'Find the door with your terminal session number.'
      }
    ]
  },
  {
    id: 'quest_train',
    title: 'The Midnight Train',
    currentStage: 0,
    completed: false,
    rewardFlag: 'TrainDeparted',
    stages: [
      {
        description: 'Examine the guest register at the front desk of the Looping Hotel (Room 12).',
        completed: false,
        hint: 'Read the entries in Room 12.'
      },
      {
        description: 'Recover the torn 03:14 express train ticket hidden under seat G12 in the Cinema (Room 07).',
        completed: false,
        hint: 'Search row G seat 12 in Room 07.'
      },
      {
        description: 'Board the silent coach at the Abandoned Train Station (Room 08) and meet The Last Passenger.',
        completed: false,
        hint: 'Enter the train carriage in Room 08.'
      }
    ]
  },
  {
    id: 'quest_caretaker',
    title: "The Caretaker's Master Key",
    currentStage: 0,
    completed: false,
    rewardFlag: 'MasterKeyFound',
    stages: [
      {
        description: 'Speak with Walter Chen in the Long Corridor (Room 01) about the rusted doors.',
        completed: false,
        hint: 'Talk to The Caretaker in Room 01.'
      },
      {
        description: 'Climb the library ladder in the Flooded Archive (Room 06) to reach the top shelf.',
        completed: false,
        hint: 'Inspect the high shelf in Room 06.'
      },
      {
        description: 'Use Walter\'s Master Key to unlock the hidden crawlspace behind the Corridor wallpaper.',
        completed: false,
        hint: 'Peel the wallpaper in Room 01 to reveal the door.'
      }
    ]
  },
  {
    id: 'quest_prescription',
    title: "The Doctor's Last Prescription",
    currentStage: 0,
    completed: false,
    rewardFlag: 'PrescriptionSolved',
    stages: [
      {
        description: 'Open supply locker 314 in the Hospital of Unfinished Names (Room 05).',
        completed: false,
        hint: 'Use the code from the School chalkboard in Room 05.'
      },
      {
        description: 'Search the dry fountain in the Memory Garden (Room 14) for the discarded punch card.',
        completed: false,
        hint: 'Examine the stone fountain in Room 14.'
      },
      {
        description: 'Deliver the diagnostic memory card to the Origin Terminal at The Final Desk.',
        completed: false,
        hint: 'Reach The Final Desk beyond Morpheus Core.'
      }
    ]
  },
  {
    id: 'quest_morpheus',
    title: 'Morpheus Protocol Reconvergence',
    currentStage: 0,
    completed: false,
    rewardFlag: 'MorpheusReconciled',
    stages: [
      {
        description: 'Visit all 15 core sectors of the haunted complex.',
        completed: false,
        hint: 'Explore and unlock every room in the world.'
      },
      {
        description: 'Energize the Server Cathedral and unseal the blast doors to Morpheus Core (Room 15).',
        completed: false,
        hint: 'Use the altar terminal in Room 11.'
      },
      {
        description: 'Commune directly with Morpheus Core at the central pulpit to choose the terminal\'s fate.',
        completed: false,
        hint: 'Speak to Morpheus Core in Room 15.'
      }
    ]
  }
];

export const INITIAL_ENVIRONMENT_STATE: WorldEnvironmentState = {
  powerGrid: {
    mainGenerator: true,
    corridorLights: true,
    hospitalElevator: false,
    cinemaProjector: false,
    serverCathedral: false,
    drainagePumps: false
  },
  drainageState: {
    apartmentFlooded: true,
    archiveFlooded: true,
    secondBasementFlooded: true
  },
  clocks: {
    lastRoom: '03:14',
    bedroom: '03:14',
    hospital: '03:14'
  },
  puzzles: {
    cinemaReelMounted: false,
    schoolRegisterDecoded: false,
    trainTicketFound: false,
    caretakerKeyObtained: false,
    mirrorShardsCount: 0,
    wallpaperPeeled: false,
    corridorPhoneAnswered: false,
    hospitalLocker314Opened: false,
    serverConsoleOverridden: false,
    hotelBellRungCount: 0,
    memoryGardenPhotoExamined: false
  },
  inventory: ['session_key_8492']
};

export class WorldStateManager {
  rooms: Record<string, HauntedRoom>;
  quests: CrossRoomQuest[];
  env: WorldEnvironmentState;
  activeRoomId: string;

  constructor() {
    this.rooms = { ...INITIAL_ROOMS };
    this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
    this.env = JSON.parse(JSON.stringify(INITIAL_ENVIRONMENT_STATE));
    this.activeRoomId = 'last_room';
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('phantom_world_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rooms) {
          // Merge rooms so new rooms are preserved
          Object.keys(parsed.rooms).forEach(id => {
            if (this.rooms[id]) {
              this.rooms[id].unlocked = parsed.rooms[id].unlocked;
              this.rooms[id].visited = parsed.rooms[id].visited;
            }
          });
        }
        if (parsed.quests) this.quests = parsed.quests;
        if (parsed.env) this.env = parsed.env;
        if (parsed.activeRoomId && this.rooms[parsed.activeRoomId]) {
          this.activeRoomId = parsed.activeRoomId;
        }
      }
    } catch (e) {
      console.warn('[WorldStateManager] Error loading saved world state', e);
    }
  }

  saveToStorage(): void {
    try {
      const data = {
        rooms: Object.fromEntries(
          Object.entries(this.rooms).map(([k, v]) => [k, { unlocked: v.unlocked, visited: v.visited }])
        ),
        quests: this.quests,
        env: this.env,
        activeRoomId: this.activeRoomId
      };
      localStorage.setItem('phantom_world_state', JSON.stringify(data));
    } catch (e) {
      console.warn('[WorldStateManager] Error saving world state', e);
    }
  }

  getActiveRoom(): HauntedRoom {
    return this.rooms[this.activeRoomId] || this.rooms.last_room;
  }

  travelToRoom(roomId: string): { success: boolean; message: string } {
    const target = this.rooms[roomId];
    if (!target) {
      return { success: false, message: `Sector "${roomId}" does not exist in memory.` };
    }
    if (!target.unlocked) {
      return { success: false, message: `Door to ${target.title} is locked. Required condition unmet.` };
    }

    this.activeRoomId = roomId;
    target.visited = true;
    this.checkMorpheusQuestProgress();
    this.saveToStorage();
    return { success: true, message: `Entered ${target.code} — ${target.title}.` };
  }

  unlockRoom(roomId: string): void {
    if (this.rooms[roomId]) {
      this.rooms[roomId].unlocked = true;
      this.saveToStorage();
    }
  }

  toggleBreaker(circuit: keyof WorldEnvironmentState['powerGrid']): boolean {
    this.env.powerGrid[circuit] = !this.env.powerGrid[circuit];
    if (circuit === 'drainagePumps' && this.env.powerGrid.drainagePumps) {
      this.env.drainageState.apartmentFlooded = false;
      this.env.drainageState.archiveFlooded = false;
      this.env.drainageState.secondBasementFlooded = false;
      this.advanceQuestStage('quest_drain', 1);
    }
    if (circuit === 'cinemaProjector' && this.env.powerGrid.cinemaProjector) {
      this.advanceQuestStage('quest_reel', 1);
    }
    if (circuit === 'hospitalElevator' && this.env.powerGrid.hospitalElevator) {
      this.unlockRoom('unfinished_floor');
    }
    if (circuit === 'serverCathedral' && this.env.powerGrid.serverCathedral) {
      this.advanceQuestStage('quest_signal', 1);
    }
    this.saveToStorage();
    return this.env.powerGrid[circuit];
  }

  advanceQuestStage(questId: string, stageIdx: number): void {
    const q = this.quests.find(quest => quest.id === questId);
    if (q && stageIdx >= q.currentStage && stageIdx < q.stages.length) {
      q.stages[stageIdx].completed = true;
      q.currentStage = Math.min(q.stages.length, stageIdx + 1);
      if (q.currentStage >= q.stages.length) {
        q.completed = true;
      }
      this.saveToStorage();
    }
  }

  checkMorpheusQuestProgress(): void {
    const coreRooms = Object.values(this.rooms).filter(r => !r.isSecret);
    const visitedCount = coreRooms.filter(r => r.visited).length;
    if (visitedCount >= 15) {
      this.advanceQuestStage('quest_morpheus', 0);
    }
  }

  addToInventory(item: string): void {
    if (!this.env.inventory.includes(item)) {
      this.env.inventory.push(item);
      this.saveToStorage();
    }
  }

  hasInventory(item: string): boolean {
    return this.env.inventory.includes(item);
  }
}

export const worldStateManager = new WorldStateManager();
