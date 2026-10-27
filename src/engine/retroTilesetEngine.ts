/**
 * PHANTOM SHELL // RETRO TILESET ENGINE
 * Pure Retro 2D Pixel-Art Asset & Grid Management System
 * Enforces strict 16x16 and 32x32 pixel grids for authentic 90s/early-2000s psychological horror aesthetics.
 */

export type GridSize = 16 | 32;

export type TileCategory = 
  | 'floor'
  | 'wall'
  | 'door'
  | 'prop'
  | 'terminal'
  | 'spectral'
  | 'hazard'
  | 'foliage'
  | 'light';

export interface PixelTile {
  id: string;
  name: string;
  category: TileCategory;
  gridSize: GridSize;
  roomIds: string[]; // which rooms this tile primarily belongs to
  tags: string[];
  isSolid: boolean;
  isInteractable?: boolean;
  spectralEnergy?: number; // 0 to 100
  // Color palette: indexed colors used in the pixel matrix
  palette: string[];
  // 16x16 or 32x32 matrix of palette indices (-1 or 0 for transparent)
  matrix: number[][];
  description: string;
}

export interface RoomTileLayer {
  name: string;
  visible: boolean;
  opacity: number;
  // 2D grid of tile IDs or empty string ''
  grid: string[][];
}

export interface RoomTileMap {
  roomId: string;
  name: string;
  gridSize: GridSize;
  cols: number;
  rows: number;
  layers: {
    floor: RoomTileLayer;
    walls: RoomTileLayer;
    props: RoomTileLayer;
    spectral: RoomTileLayer;
  };
}

// Built-in color palettes for authentic retro horror (inspired by PC-98, PS1 VRAM 16-color CLUTs)
export const HORROR_PALETTES = {
  voidMonochrome: ['#00000000', '#030508', '#0c131a', '#1e2b38', '#384d5e', '#647c8f', '#96b0c2', '#d2e2ec'],
  cyanPhosphor: ['#00000000', '#020b12', '#051f2d', '#08384f', '#00708f', '#00a8b8', '#00e5ff', '#a5f3fc'],
  crimsonDecay: ['#00000000', '#0f0406', '#26090e', '#450a14', '#781220', '#aa1d2e', '#e11d48', '#fca5a5'],
  hospitalGreen: ['#00000000', '#030d0a', '#0a1f18', '#14382c', '#225946', '#3b8266', '#5eead4', '#ccfbf1'],
  sepiaAsh: ['#00000000', '#0d0905', '#1f150c', '#382617', '#5c3e26', '#8c603a', '#c49563', '#fed7aa'],
  spectralViolet: ['#00000000', '#090412', '#170929', '#2e1250', '#552191', '#8b5cf6', '#c4b5fd', '#ede9fe'],
};

/**
 * Procedural pixel matrix generator helpers
 */
function createEmptyMatrix(size: GridSize): number[][] {
  return Array(size).fill(0).map(() => Array(size).fill(0));
}

// Helper to fill pattern
function generateTileMatrix(
  size: GridSize,
  generator: (x: number, y: number, size: GridSize) => number
): number[][] {
  const m = createEmptyMatrix(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      m[y][x] = generator(x, y, size);
    }
  }
  return m;
}

// -------------------------------------------------------------
// CORE TILE DEFINITIONS FOR ALL 15 ROOMS (16x16 and 32x32)
// -------------------------------------------------------------
export const BUILTIN_TILES: PixelTile[] = [
  // 1. CORRIDOR (Room 01)
  {
    id: 'corridor_floor_carpet_16',
    name: 'Worn Hotel Carpet',
    category: 'floor',
    gridSize: 16,
    roomIds: ['corridor', 'hotel'],
    tags: ['carpet', 'fabric', 'dirty'],
    isSolid: false,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Decades of footsteps pressed into stained amber carpeting.',
    matrix: generateTileMatrix(16, (x, y) => {
      if ((x === 0 || y === 0 || x === 15 || y === 15) && (x + y) % 2 === 0) return 2;
      if ((x * y) % 7 === 0) return 4;
      if ((x + y) % 5 === 0) return 3;
      return 2;
    }),
  },
  {
    id: 'corridor_floor_carpet_32',
    name: 'Worn Hotel Carpet (Hi-Res)',
    category: 'floor',
    gridSize: 32,
    roomIds: ['corridor', 'hotel'],
    tags: ['carpet', 'ornate', 'damask'],
    isSolid: false,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Faded damask weave with worn traffic channels down the center.',
    matrix: generateTileMatrix(32, (x, y) => {
      const cx = Math.abs(x - 16);
      const cy = Math.abs(y - 16);
      if (cx + cy === 8 || cx + cy === 12) return 5;
      if (cx === cy) return 4;
      if ((x + y) % 6 === 0) return 3;
      return 2;
    }),
  },
  {
    id: 'corridor_wall_peeling_16',
    name: 'Peeling Damask Wall',
    category: 'wall',
    gridSize: 16,
    roomIds: ['corridor'],
    tags: ['wall', 'wallpaper', 'torn'],
    isSolid: true,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Brittle 1970s wallpaper curling at the seams, revealing blackened lath.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (y === 0 || y === 15) return 2;
      if (x === 0 || x === 15) return 2;
      if (y > 10 && x < 6) return 1; // curled tear
      if ((x % 4 === 0) && (y % 4 === 0)) return 5;
      return 3;
    }),
  },
  {
    id: 'corridor_wall_peeling_32',
    name: 'Peeling Damask Wall (32px)',
    category: 'wall',
    gridSize: 32,
    roomIds: ['corridor'],
    tags: ['wall', 'wallpaper', 'decay'],
    isSolid: true,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Extensive moisture damage with peeling edges showing rotten plaster underneath.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (y < 3 || y > 28) return 2;
      if (x < 2 || x > 29) return 2;
      if (x > 12 && x < 24 && y > 14 && y < 26) return 1; // large torn hole
      if ((x % 6 === 0) && (y % 6 === 0)) return 5;
      return 3;
    }),
  },
  {
    id: 'corridor_door_numbered_16',
    name: 'Room 314 Door',
    category: 'door',
    gridSize: 16,
    roomIds: ['corridor', 'hotel'],
    tags: ['door', 'locked', 'brass'],
    isSolid: true,
    isInteractable: true,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Heavy oak door with tarnished brass numerals reading "314".',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x === 0 || x === 15 || y === 0 || y === 15) return 1;
      if (x >= 2 && x <= 13 && y >= 2 && y <= 6) return 4; // upper panel
      if (x >= 2 && x <= 13 && y >= 8 && y <= 13) return 4; // lower panel
      if (x === 12 && y === 9) return 7; // brass doorknob
      if (x >= 6 && x <= 10 && y === 4) return 6; // door number badge
      return 3;
    }),
  },
  {
    id: 'fluorescent_tube_light_16',
    name: 'Flickering Fluorescent Fixture',
    category: 'light',
    gridSize: 16,
    roomIds: ['corridor', 'hospital', 'school', 'server_cathedral'],
    tags: ['light', 'flicker', 'ceiling'],
    isSolid: false,
    palette: HORROR_PALETTES.cyanPhosphor,
    spectralEnergy: 45,
    description: 'Industrial tube buzzing at 60Hz. Insects are trapped behind the diffuser.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (y === 7 || y === 8) {
        if (x >= 2 && x <= 13) return 7; // tube bulb
        return 4;
      }
      if (y === 6 || y === 9) {
        if (x >= 1 && x <= 14) return 3; // fixture frame
      }
      return 0; // transparent
    }),
  },

  // 2. BEDROOM (Room 02)
  {
    id: 'bedroom_wood_floor_16',
    name: 'Creaking Pine Floorboard',
    category: 'floor',
    gridSize: 16,
    roomIds: ['bedroom', 'apartment'],
    tags: ['wood', 'planks', 'vintage'],
    isSolid: false,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Uneven pine planks that groan under the slightest shift in weight.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (y % 4 === 0) return 2; // plank seams
      if ((x === 5 && y < 4) || (x === 11 && y >= 4 && y < 8) || (x === 2 && y >= 8)) return 1; // nail heads
      return 3 + (x % 3 === 0 ? 1 : 0);
    }),
  },
  {
    id: 'bedroom_toy_bunny_16',
    name: 'Stitched Ragdoll Toy',
    category: 'prop',
    gridSize: 16,
    roomIds: ['bedroom'],
    tags: ['child', 'toy', 'haunted'],
    isSolid: false,
    isInteractable: true,
    spectralEnergy: 65,
    palette: HORROR_PALETTES.crimsonDecay,
    description: 'A handmade bunny with mismatched button eyes. One ear is missing.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x >= 5 && x <= 10 && y >= 7 && y <= 13) return 4; // body
      if (x >= 6 && x <= 9 && y >= 4 && y <= 6) return 5; // head
      if ((x === 6 || x === 9) && y >= 1 && y <= 3) return 3; // ears
      if ((x === 7 || x === 8) && y === 5) return 6; // button eyes
      if (x === 7 && y === 9) return 7; // crimson chest stitch
      return 0;
    }),
  },
  {
    id: 'bedroom_bed_frame_32',
    name: 'Iron Bed Frame & Cold Quilt',
    category: 'prop',
    gridSize: 32,
    roomIds: ['bedroom', 'hospital'],
    tags: ['furniture', 'bed', 'cold'],
    isSolid: true,
    palette: HORROR_PALETTES.hospitalGreen,
    description: 'Cast-iron child frame with tucked patchwork quilt, cold to the touch.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (x < 3 || x > 28) return 2; // iron posts
      if (y < 4 || y > 28) return 3; // headboard / footboard
      if (x >= 5 && x <= 26 && y >= 7 && y <= 25) return 4; // quilt body
      if (x >= 8 && x <= 23 && y >= 9 && y <= 14) return 6; // pillow
      return 0;
    }),
  },

  // 3. FLOODED APARTMENT (Room 03)
  {
    id: 'water_flooded_floor_16',
    name: 'Black Submerged Linoleum',
    category: 'hazard',
    gridSize: 16,
    roomIds: ['apartment', 'archive'],
    tags: ['water', 'flood', 'reflection'],
    isSolid: false,
    spectralEnergy: 30,
    palette: HORROR_PALETTES.cyanPhosphor,
    description: 'Four inches of stagnant, oily water with eerie light reflections.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (y % 4 === 1 && (x + y) % 3 === 0) return 5; // water ripples
      if ((x + y) % 7 === 0) return 4;
      return 2;
    }),
  },
  {
    id: 'crt_tv_monitor_16',
    name: 'Humming CRT Television',
    category: 'terminal',
    gridSize: 16,
    roomIds: ['apartment', 'rooftop'],
    tags: ['crt', 'static', 'broadcast'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 80,
    palette: HORROR_PALETTES.cyanPhosphor,
    description: 'Cathode-ray set playing static. Ghostly shapes briefly coalesce between snow lines.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x >= 2 && x <= 13 && y >= 2 && y <= 13) {
        if (x === 2 || x === 13 || y === 2 || y === 13) return 2; // chassis
        if ((x + y) % 2 === 0) return 6; // snow static
        return 5;
      }
      if (x >= 5 && x <= 10 && y >= 14 && y <= 15) return 3; // stand
      return 0;
    }),
  },

  // 4. SCHOOL (Room 04)
  {
    id: 'school_blackboard_32',
    name: 'Scratched Slate Blackboard',
    category: 'prop',
    gridSize: 32,
    roomIds: ['school'],
    tags: ['chalk', 'school', 'secret'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 50,
    palette: HORROR_PALETTES.hospitalGreen,
    description: 'Dark green slate board etched with repeating equations and names never spoken.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (x < 2 || x > 29 || y < 2 || y > 29) return 2; // wood frame
      if (x >= 4 && x <= 27 && y >= 4 && y <= 27) {
        if ((x === 8 || x === 15 || x === 22) && y > 10 && y < 20) return 6; // chalk marks
        return 3;
      }
      return 1;
    }),
  },
  {
    id: 'school_desk_wood_16',
    name: 'Vintage Classroom Desk',
    category: 'prop',
    gridSize: 16,
    roomIds: ['school'],
    tags: ['furniture', 'desk', 'empty'],
    isSolid: true,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Single-student oak desk with inkwell notch and carved initials.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x >= 2 && x <= 13 && y >= 4 && y <= 8) return 4; // desktop
      if ((x === 3 || x === 12) && y >= 9 && y <= 14) return 2; // legs
      if (x >= 5 && x <= 10 && y >= 10 && y <= 13) return 3; // attached bench
      return 0;
    }),
  },

  // 5. HOSPITAL (Room 05)
  {
    id: 'hospital_tile_wall_16',
    name: 'Sickly Ceramic Wall Tile',
    category: 'wall',
    gridSize: 16,
    roomIds: ['hospital', 'mirror_gallery'],
    tags: ['tile', 'clean', 'cold', 'sanitary'],
    isSolid: true,
    palette: HORROR_PALETTES.hospitalGreen,
    description: 'Sterile institutional tile with discolored grout lines.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x === 0 || x === 8 || y === 0 || y === 8) return 2; // grout
      if (x === 4 && y === 4) return 6; // glaze highlight
      return 4;
    }),
  },
  {
    id: 'hospital_ekg_monitor_16',
    name: 'Cardiac Vital Monitor',
    category: 'terminal',
    gridSize: 16,
    roomIds: ['hospital'],
    tags: ['monitor', 'ekg', 'medical'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 75,
    palette: HORROR_PALETTES.hospitalGreen,
    description: 'Flatlined green phosphorescent trace continuing to pulse silently.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x >= 2 && x <= 13 && y >= 3 && y <= 11) {
        if (x === 2 || x === 13 || y === 3 || y === 11) return 2; // bezel
        if (y === 7 && (x === 5 || x === 9)) return 7; // spike peak
        if (y === 8 && (x === 4 || x === 6 || x === 8 || x === 10)) return 6; // trace line
        return 1; // dark screen
      }
      if (x >= 6 && x <= 9 && y >= 12 && y <= 15) return 3; // stand
      return 0;
    }),
  },

  // 6. ARCHIVE (Room 06)
  {
    id: 'archive_bookshelf_32',
    name: 'Waterlogged Archive Stack',
    category: 'prop',
    gridSize: 32,
    roomIds: ['archive'],
    tags: ['books', 'archive', 'records'],
    isSolid: true,
    isInteractable: true,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Floor-to-ceiling iron shelving housing thousands of rotting MORPHEUS dossiers.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (x < 3 || x > 28) return 1; // upright struts
      if (y % 8 === 0) return 2; // horizontal shelf bars
      if (y > 4 && y < 28) {
        if (x % 3 === 0) return 4; // book spines
        if (x % 5 === 0) return 5;
        return 3;
      }
      return 0;
    }),
  },

  // 7. CINEMA (Room 07)
  {
    id: 'cinema_projector_beam_32',
    name: 'Dusty Projector Light Cone',
    category: 'light',
    gridSize: 32,
    roomIds: ['cinema'],
    tags: ['projector', 'light', 'dust', 'film'],
    isSolid: false,
    spectralEnergy: 70,
    palette: HORROR_PALETTES.voidMonochrome,
    description: 'Volumetric light shaft suspended with drifting cigarette ash and silver halide particles.',
    matrix: generateTileMatrix(32, (x, y) => {
      const coneWidth = (y / 32) * 16;
      const distFromCenter = Math.abs(x - 16);
      if (distFromCenter < coneWidth) {
        if ((x + y) % 5 === 0) return 6; // dust fleck
        return 3;
      }
      return 0;
    }),
  },
  {
    id: 'cinema_velvet_seat_16',
    name: 'Theater Velvet Seat',
    category: 'prop',
    gridSize: 16,
    roomIds: ['cinema'],
    tags: ['seat', 'velvet', 'red'],
    isSolid: true,
    palette: HORROR_PALETTES.crimsonDecay,
    description: 'Deep crimson velvet auditorium seat with spring exposed through worn upholstery.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x >= 3 && x <= 12 && y >= 3 && y <= 9) return 4; // backrest
      if (x >= 2 && x <= 13 && y >= 10 && y <= 12) return 5; // cushion
      if ((x === 2 || x === 13) && y >= 7 && y <= 14) return 2; // iron armrests
      return 0;
    }),
  },

  // 8. TRAIN STATION (Room 08)
  {
    id: 'subway_tile_yellow_strip_16',
    name: 'Platform Safety Edge',
    category: 'floor',
    gridSize: 16,
    roomIds: ['station'],
    tags: ['station', 'subway', 'warning', 'tracks'],
    isSolid: false,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Bumpy yellow tactile paving preceding the dark abyss of the electrified train tracks.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (y >= 10) return 1; // dark train pit
      if (y >= 6 && y <= 9) {
        if ((x + y) % 2 === 0) return 6; // yellow bumps
        return 5;
      }
      return 3; // concrete platform
    }),
  },
  {
    id: 'train_clock_station_16',
    name: 'Station Analog Clock',
    category: 'prop',
    gridSize: 16,
    roomIds: ['station', 'hotel'],
    tags: ['clock', 'time', 'brass'],
    isSolid: true,
    isInteractable: true,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Suspended double-faced clock frozen at precisely 03:14:02 AM.',
    matrix: generateTileMatrix(16, (x, y) => {
      const cx = Math.abs(x - 8);
      const cy = Math.abs(y - 8);
      if (cx * cx + cy * cy <= 25) {
        if (cx * cx + cy * cy >= 20) return 2; // outer brass rim
        if (cx === 0 && y <= 8 && y >= 4) return 1; // hour hand
        if (cy === 0 && x >= 8 && x <= 11) return 1; // minute hand
        return 7; // white face
      }
      if (x >= 7 && x <= 9 && y < 3) return 2; // mounting chain
      return 0;
    }),
  },

  // 9. MIRROR GALLERY (Room 09)
  {
    id: 'baroque_mirror_frame_32',
    name: 'Baroque Gilded Mirror',
    category: 'prop',
    gridSize: 32,
    roomIds: ['mirror_gallery'],
    tags: ['mirror', 'reflection', 'spectral', 'gold'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 95,
    palette: HORROR_PALETTES.spectralViolet,
    description: 'Ornate gold-leaf mirror whose reflection delays user movement by 1.2 seconds.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (x < 4 || x > 27 || y < 4 || y > 27) return 3; // gold filigree border
      if (x >= 5 && x <= 26 && y >= 5 && y <= 26) {
        if ((x + y) === 20 || (x + y) === 32) return 6; // glass sheen
        if (x === 16 && y > 10 && y < 22) return 5; // ghostly figure silhouette
        return 2; // darkened glass depth
      }
      return 0;
    }),
  },

  // 10. GENERATOR (Room 10)
  {
    id: 'generator_turbine_32',
    name: 'Industrial Steam Turbine',
    category: 'terminal',
    gridSize: 32,
    roomIds: ['generator'],
    tags: ['generator', 'machinery', 'power', 'industrial'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 40,
    palette: HORROR_PALETTES.voidMonochrome,
    description: '1960s cast-iron flywheel and turbine block that powers the lower MORPHEUS substructure.',
    matrix: generateTileMatrix(32, (x, y) => {
      const cx = Math.abs(x - 16);
      const cy = Math.abs(y - 16);
      if (cx * cx + cy * cy <= 120) {
        if (cx * cx + cy * cy <= 20) return 6; // central axle
        if (x % 4 === 0) return 4; // radial spokes
        return 2;
      }
      if (y > 24) return 1; // heavy mount base
      return 0;
    }),
  },
  {
    id: 'conduit_cables_bundle_16',
    name: 'High Voltage Conduit Cables',
    category: 'hazard',
    gridSize: 16,
    roomIds: ['generator', 'server_cathedral'],
    tags: ['wires', 'electric', 'danger'],
    isSolid: false,
    palette: HORROR_PALETTES.crimsonDecay,
    description: 'Thick bundles of black and red rubber wiring snaking across puddles.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (y === 6 || y === 9 || y === 12) {
        if ((x + y) % 3 === 0) return 6; // wire banding
        return 2;
      }
      return 0;
    }),
  },

  // 11. SERVER CATHEDRAL (Room 11)
  {
    id: 'server_rack_tower_16',
    name: 'MORPHEUS Server Rack Array',
    category: 'terminal',
    gridSize: 16,
    roomIds: ['server_cathedral'],
    tags: ['server', 'led', 'mainframe', 'datacenter'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 85,
    palette: HORROR_PALETTES.cyanPhosphor,
    description: 'Black monolithic rack housing tape spools and arrays of flashing green/cyan LEDs.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x < 1 || x > 14 || y < 1 || y > 14) return 1; // chassis
      if (y % 3 === 0) return 2; // drive bays
      if (x === 4 || x === 7 || x === 11) return (x + y) % 2 === 0 ? 6 : 4; // status lights
      return 3;
    }),
  },
  {
    id: 'server_rack_tower_32',
    name: 'MORPHEUS Server Array (32px)',
    category: 'terminal',
    gridSize: 32,
    roomIds: ['server_cathedral'],
    tags: ['server', 'mainframe', 'computing'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 90,
    palette: HORROR_PALETTES.cyanPhosphor,
    description: 'Full-height server cabinet with dual spinning magnetic tape reels and serial terminals.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (x < 2 || x > 29 || y < 2 || y > 29) return 1;
      if (y > 4 && y < 14) {
        // Dual magnetic tape reels
        const r1 = Math.hypot(x - 9, y - 9);
        const r2 = Math.hypot(x - 22, y - 9);
        if (r1 < 4 || r2 < 4) return 6;
      }
      if (y > 16 && y < 28) {
        // Blinking bus array
        if ((x % 3 === 0) && (y % 2 === 0)) return 6;
        return 2;
      }
      return 3;
    }),
  },

  // 12. HOTEL (Room 12)
  {
    id: 'hotel_reception_bell_16',
    name: 'Brass Reception Desk Bell',
    category: 'prop',
    gridSize: 16,
    roomIds: ['hotel'],
    tags: ['brass', 'bell', 'counter'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 55,
    palette: HORROR_PALETTES.sepiaAsh,
    description: 'Tarnished counter bell. Ringing it summons footsteps from the locked stairwell.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x >= 4 && x <= 11 && y >= 8 && y <= 12) return 5; // dome
      if (x === 7 && y >= 5 && y <= 7) return 7; // plunger
      if (x >= 2 && x <= 13 && y >= 13 && y <= 14) return 3; // base
      return 0;
    }),
  },

  // 13. ROOFTOP OF STATIC (Room 13)
  {
    id: 'rooftop_antenna_mast_32',
    name: 'Skeletal TV Antenna Mast',
    category: 'prop',
    gridSize: 32,
    roomIds: ['rooftop'],
    tags: ['antenna', 'sky', 'lightning', 'metal'],
    isSolid: true,
    spectralEnergy: 75,
    palette: HORROR_PALETTES.cyanPhosphor,
    description: 'Twisted aerial transmitting phantom transmissions into the midnight rain.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (x === 16 && y < 28) return 4; // central pole
      if (y === 6 && x >= 4 && x <= 28) return 5; // crossbar 1
      if (y === 14 && x >= 8 && x <= 24) return 5; // crossbar 2
      if (y === 22 && x >= 10 && x <= 22) return 5; // crossbar 3
      if (y >= 28) return 2; // tripod base
      return 0;
    }),
  },

  // 14. MEMORY GARDEN (Room 14)
  {
    id: 'garden_angel_statue_32',
    name: 'Weathered Weeping Angel Statue',
    category: 'prop',
    gridSize: 32,
    roomIds: ['memory_garden'],
    tags: ['statue', 'stone', 'angel', 'memorial'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 90,
    palette: HORROR_PALETTES.spectralViolet,
    description: 'Moss-covered stone sculpture with weeping eyes that weep actual fresh tear traces.',
    matrix: generateTileMatrix(32, (x, y) => {
      const cx = Math.abs(x - 16);
      if (cx < 6 && y >= 8 && y <= 24) return 4; // draped stone body
      if (cx < 4 && y >= 4 && y <= 7) return 5; // bowed head
      if (x >= 6 && x <= 26 && y >= 8 && y <= 16) {
        if (Math.abs(x - 16) > 4) return 3; // wings
      }
      if (y > 24) return 2; // stone plinth
      return 0;
    }),
  },
  {
    id: 'garden_violet_flower_16',
    name: 'Luminescent Memory Blossom',
    category: 'foliage',
    gridSize: 16,
    roomIds: ['memory_garden'],
    tags: ['flower', 'glow', 'nature'],
    isSolid: false,
    spectralEnergy: 60,
    palette: HORROR_PALETTES.spectralViolet,
    description: 'Translucent nocturnal flora blooming exclusively within corrupted sectors.',
    matrix: generateTileMatrix(16, (x, y) => {
      if (x === 8 && y >= 8 && y <= 15) return 2; // green stem
      if ((x >= 6 && x <= 10 && y >= 4 && y <= 7) || (x >= 5 && x <= 11 && y >= 5 && y <= 6)) return 6; // blossom
      if (x === 8 && y === 5) return 7; // glowing pistil
      return 0;
    }),
  },

  // 15. MORPHEUS CORE (Room 15)
  {
    id: 'morpheus_core_pillar_32',
    name: 'Central Neural Storage Core',
    category: 'terminal',
    gridSize: 32,
    roomIds: ['morpheus_core'],
    tags: ['core', 'ai', 'neural', 'final'],
    isSolid: true,
    isInteractable: true,
    spectralEnergy: 100,
    palette: HORROR_PALETTES.crimsonDecay,
    description: 'The primary cryogenic bio-digital matrix containing the reconstructed consciousness.',
    matrix: generateTileMatrix(32, (x, y) => {
      if (x >= 8 && x <= 23 && y >= 2 && y <= 29) {
        if (x === 8 || x === 23 || y === 2 || y === 29) return 1; // containment frame
        if (x >= 12 && x <= 19 && y >= 8 && y <= 24) {
          if ((x + y) % 3 === 0) return 6; // glowing core energy
          return 5;
        }
        return 3;
      }
      return 0;
    }),
  },
  {
    id: 'spectral_rift_anomaly_16',
    name: 'Torn Dimensional Buffer',
    category: 'spectral',
    gridSize: 16,
    roomIds: ['morpheus_core', 'corridor', 'mirror_gallery'],
    tags: ['anomaly', 'rift', 'glitch', 'void'],
    isSolid: false,
    isInteractable: true,
    spectralEnergy: 95,
    palette: HORROR_PALETTES.spectralViolet,
    description: 'A rip in virtual memory where raw pixel geometry spills into real space.',
    matrix: generateTileMatrix(16, (x, y) => {
      const cx = Math.abs(x - 8);
      const cy = Math.abs(y - 8);
      if (cx + cy <= 6) {
        if ((x * y) % 3 === 0) return 6;
        if (cx === 0 || cy === 0) return 7;
        return 4;
      }
      return 0;
    }),
  }
];

// -------------------------------------------------------------
// DEFAULT ROOM TILEMAP REGISTRY (15 ROOMS)
// -------------------------------------------------------------
export function createDefaultRoomTileMap(roomId: string, gridSize: GridSize = 16): RoomTileMap {
  // Grid dimension: 24 cols x 14 rows for 16px (384x224 base canvas) or 12 cols x 7 rows for 32px
  const cols = gridSize === 16 ? 24 : 12;
  const rows = gridSize === 16 ? 14 : 7;

  const floorLayer: RoomTileLayer = {
    name: 'Floor Layer',
    visible: true,
    opacity: 1,
    grid: Array(rows).fill('').map(() => Array(cols).fill('')),
  };

  const wallLayer: RoomTileLayer = {
    name: 'Walls & Structure',
    visible: true,
    opacity: 1,
    grid: Array(rows).fill('').map(() => Array(cols).fill('')),
  };

  const propsLayer: RoomTileLayer = {
    name: 'Props & Furniture',
    visible: true,
    opacity: 1,
    grid: Array(rows).fill('').map(() => Array(cols).fill('')),
  };

  const spectralLayer: RoomTileLayer = {
    name: 'Spectral Anomalies',
    visible: true,
    opacity: 1,
    grid: Array(rows).fill('').map(() => Array(cols).fill('')),
  };

  // Determine relevant floor tile
  const floorTileId = gridSize === 16
    ? (roomId === 'apartment' || roomId === 'archive' ? 'water_flooded_floor_16'
      : roomId === 'hospital' ? 'hospital_tile_wall_16'
      : roomId === 'bedroom' ? 'bedroom_wood_floor_16'
      : 'corridor_floor_carpet_16')
    : 'corridor_floor_carpet_32';

  // Fill floor bottom half
  const floorStartRow = Math.floor(rows / 2);
  for (let r = floorStartRow; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      floorLayer.grid[r][c] = floorTileId;
    }
  }

  // Fill walls top half
  const wallTileId = gridSize === 16 ? 'corridor_wall_peeling_16' : 'corridor_wall_peeling_32';
  for (let r = 0; r < floorStartRow; r++) {
    for (let c = 0; c < cols; c++) {
      wallLayer.grid[r][c] = wallTileId;
    }
  }

  // Stamp room specific props
  if (gridSize === 16) {
    if (roomId === 'corridor') {
      propsLayer.grid[floorStartRow - 1][Math.floor(cols / 2)] = 'corridor_door_numbered_16';
      propsLayer.grid[1][Math.floor(cols / 2)] = 'fluorescent_tube_light_16';
    } else if (roomId === 'bedroom') {
      propsLayer.grid[floorStartRow + 1][cols - 4] = 'bedroom_toy_bunny_16';
    } else if (roomId === 'apartment') {
      propsLayer.grid[floorStartRow][cols - 5] = 'crt_tv_monitor_16';
    } else if (roomId === 'school') {
      propsLayer.grid[floorStartRow + 1][4] = 'school_desk_wood_16';
      propsLayer.grid[floorStartRow + 1][8] = 'school_desk_wood_16';
    } else if (roomId === 'hospital') {
      propsLayer.grid[floorStartRow][cols - 4] = 'hospital_ekg_monitor_16';
      propsLayer.grid[1][Math.floor(cols / 2)] = 'fluorescent_tube_light_16';
    } else if (roomId === 'cinema') {
      propsLayer.grid[floorStartRow + 2][4] = 'cinema_velvet_seat_16';
      propsLayer.grid[floorStartRow + 2][8] = 'cinema_velvet_seat_16';
      propsLayer.grid[floorStartRow + 2][12] = 'cinema_velvet_seat_16';
    } else if (roomId === 'server_cathedral') {
      propsLayer.grid[floorStartRow - 1][3] = 'server_rack_tower_16';
      propsLayer.grid[floorStartRow - 1][7] = 'server_rack_tower_16';
      propsLayer.grid[floorStartRow - 1][11] = 'server_rack_tower_16';
    } else if (roomId === 'morpheus_core') {
      spectralLayer.grid[floorStartRow][Math.floor(cols / 2)] = 'spectral_rift_anomaly_16';
    }
  }

  return {
    roomId,
    name: roomId.toUpperCase().replace('_', ' '),
    gridSize,
    cols,
    rows,
    layers: {
      floor: floorLayer,
      walls: wallLayer,
      props: propsLayer,
      spectral: spectralLayer,
    },
  };
}

// -------------------------------------------------------------
// RETRO ASSET MANAGER CLASS
// -------------------------------------------------------------
export class RetroAssetManagerEngine {
  private tiles: Map<string, PixelTile> = new Map();
  private roomTileMaps: Map<string, RoomTileMap> = new Map();
  private activeGridSize: GridSize = 16;
  private listeners: (() => void)[] = [];

  constructor() {
    // Load builtins
    BUILTIN_TILES.forEach(tile => {
      this.tiles.set(tile.id, tile);
    });

    // Initialize tilemaps for the 15 standard rooms
    const standardRooms = [
      'corridor', 'bedroom', 'apartment', 'school', 'hospital',
      'archive', 'cinema', 'station', 'mirror_gallery', 'generator',
      'server_cathedral', 'hotel', 'rooftop', 'memory_garden', 'morpheus_core'
    ];

    standardRooms.forEach(id => {
      this.roomTileMaps.set(`${id}_16`, createDefaultRoomTileMap(id, 16));
      this.roomTileMaps.set(`${id}_32`, createDefaultRoomTileMap(id, 32));
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getGridSize(): GridSize {
    return this.activeGridSize;
  }

  public setGridSize(size: GridSize) {
    if (size !== 16 && size !== 32) return;
    this.activeGridSize = size;
    this.notify();
  }

  public getAllTiles(category?: TileCategory, roomId?: string, sizeFilter?: GridSize): PixelTile[] {
    let result = Array.from(this.tiles.values());
    if (sizeFilter) {
      result = result.filter(t => t.gridSize === sizeFilter);
    }
    if (category) {
      result = result.filter(t => t.category === category);
    }
    if (roomId) {
      result = result.filter(t => t.roomIds.includes(roomId) || t.roomIds.length === 0);
    }
    return result;
  }

  public getTile(id: string): PixelTile | undefined {
    return this.tiles.get(id);
  }

  public registerTile(tile: PixelTile) {
    this.tiles.set(tile.id, tile);
    this.notify();
  }

  public getRoomTileMap(roomId: string, size: GridSize = this.activeGridSize): RoomTileMap {
    const key = `${roomId}_${size}`;
    if (!this.roomTileMaps.has(key)) {
      this.roomTileMaps.set(key, createDefaultRoomTileMap(roomId, size));
    }
    return this.roomTileMaps.get(key)!;
  }

  public setTileInRoom(
    roomId: string,
    layerName: 'floor' | 'walls' | 'props' | 'spectral',
    col: number,
    row: number,
    tileId: string,
    size: GridSize = this.activeGridSize
  ) {
    const map = this.getRoomTileMap(roomId, size);
    if (map && map.layers[layerName]) {
      if (row >= 0 && row < map.rows && col >= 0 && col < map.cols) {
        map.layers[layerName].grid[row][col] = tileId;
        this.notify();
      }
    }
  }

  /**
   * Renders a single pixel tile onto an HTML5 canvas context at exact integer scaling
   */
  public renderTile(
    ctx: CanvasRenderingContext2D,
    tileId: string,
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number
  ) {
    const tile = this.getTile(tileId);
    if (!tile) return;

    const size = tile.gridSize;
    const pixelWidth = destWidth / size;
    const pixelHeight = destHeight / size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const colorIdx = tile.matrix[y]?.[x] ?? 0;
        if (colorIdx > 0 && colorIdx < tile.palette.length) {
          ctx.fillStyle = tile.palette[colorIdx];
          ctx.fillRect(
            destX + Math.floor(x * pixelWidth),
            destY + Math.floor(y * pixelHeight),
            Math.ceil(pixelWidth),
            Math.ceil(pixelHeight)
          );
        }
      }
    }
  }

  /**
   * Generates a sprite atlas (offscreen canvas) containing all tiles in the current grid mode
   */
  public generateSpriteAtlas(size: GridSize = this.activeGridSize): HTMLCanvasElement {
    const tiles = this.getAllTiles(undefined, undefined, size);
    const canvas = document.createElement('canvas');
    const cols = 8;
    const rows = Math.ceil(tiles.length / cols) || 1;

    canvas.width = cols * size;
    canvas.height = rows * size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tiles.forEach((tile, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      this.renderTile(ctx, tile.id, col * size, row * size, size, size);
    });

    return canvas;
  }
}

// Global singleton
export const retroAssetManagerEngine = new RetroAssetManagerEngine();
