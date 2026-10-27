import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Grid,
  Layers,
  Image as ImageIcon,
  FolderOpen,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  ZoomIn,
  Eye,
  Sliders,
  Sparkles,
  Maximize2,
  Minimize2,
  Search,
  X,
  Play,
  Zap
} from 'lucide-react';
import { audioEngine } from '../engine/audioEngine';

export type AssetType = 'sprite' | 'tileset' | 'background';
export type AssetLoadStatus = 'idle' | 'loading' | 'loaded' | 'fallback_procedural' | 'error';
export type AssetSource = 'local' | 'procedural' | 'unloaded';
export type GridScaleSize = 16 | 32;

export interface AssetDefinition {
  id: string;
  name: string;
  type: AssetType;
  path: string;
  fallbackPath?: string;
  gridScale: GridScaleSize; // 16x16 or 32x32 grid
  width: number;           // Width in pixels at 16x scale
  height: number;          // Height in pixels at 16x scale
  description: string;
  tags: string[];
  room?: string;
  status: AssetLoadStatus;
  source: AssetSource;
  cachedCanvas?: HTMLCanvasElement;
  proceduralGenerator: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gridSize: GridScaleSize,
    time?: number
  ) => void;
}

// -----------------------------------------------------------------
// 1. PROCEDURAL CANVAS GENERATORS (Supporting 16x16 or 32x32 Grid Scale)
// -----------------------------------------------------------------

export function drawGridPlayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  grid: GridScaleSize,
  dir: 'down' | 'up' | 'left',
  frame: number
) {
  const s = grid === 32 ? 2 : 1;
  const stepOffset = frame === 1 ? -2 * s : 0;

  // Shadow on floor
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(w / 2 - 8 * s, h - 4 * s, 16 * s, 4 * s);

  // Boots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(w / 2 - 6 * s, h - 8 * s, 4 * s, 4 * s);
  ctx.fillRect(w / 2 + 2 * s, h - 8 * s + stepOffset, 4 * s, 4 * s);

  // Trousers
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(w / 2 - 6 * s, h - 16 * s, 12 * s, 8 * s);

  // Trenchcoat
  ctx.fillStyle = '#1c2430';
  ctx.fillRect(w / 2 - 8 * s, h - 30 * s, 16 * s, 15 * s);
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(w / 2 - 6 * s, h - 28 * s, 12 * s, 3 * s);

  // Red Scarf Accent
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(w / 2 - 3 * s, h - 31 * s, 6 * s, 3 * s);

  // Face
  ctx.fillStyle = '#d6b896';
  ctx.fillRect(w / 2 - 5 * s, h - 40 * s, 10 * s, 9 * s);

  // Fedora
  ctx.fillStyle = '#090d14';
  ctx.fillRect(w / 2 - 7 * s, h - 44 * s, 14 * s, 4 * s);
  ctx.fillRect(w / 2 - 5 * s, h - 48 * s, 10 * s, 5 * s);

  if (dir === 'down') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w / 2 - 3 * s, h - 37 * s, 2 * s, 2 * s);
    ctx.fillRect(w / 2 + 1 * s, h - 37 * s, 2 * s, 2 * s);
  }
}

export function drawGridGhost(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  grid: GridScaleSize,
  color: string,
  charId: string
) {
  const s = grid === 32 ? 2 : 1;

  // Glow
  const grad = ctx.createRadialGradient(w / 2, h / 2, 2 * s, w / 2, h / 2, w / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = color;
  ctx.fillRect(w / 2 - 6 * s, h - 32 * s, 12 * s, 20 * s);
  ctx.fillRect(w / 2 - 5 * s, h - 40 * s, 10 * s, 8 * s);

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w / 2 - 3 * s, h - 37 * s, 2 * s, 2 * s);
  ctx.fillRect(w / 2 + 1 * s, h - 37 * s, 2 * s, 2 * s);
}

export function drawGridWoodFloor(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#24170e';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#3a2416';
  ctx.fillRect(0, 0, w, 7 * s);
  ctx.fillRect(0, 8 * s, w, 7 * s);

  ctx.fillStyle = '#140c06';
  ctx.fillRect(0, 7 * s, w, 1 * s);
  ctx.fillRect(0, 15 * s, w, 1 * s);
  ctx.fillRect(8 * s, 0, 1 * s, 7 * s);
  ctx.fillRect(4 * s, 8 * s, 1 * s, 7 * s);

  ctx.fillStyle = '#4a3320';
  ctx.fillRect(2 * s, 2 * s, 1 * s, 1 * s);
  ctx.fillRect(14 * s, 10 * s, 1 * s, 1 * s);
}

export function drawGridWallpaper(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#3a2717';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#5c3e26';
  ctx.fillRect(4 * s, 4 * s, 8 * s, 8 * s);
  ctx.fillStyle = '#8c603a';
  ctx.fillRect(6 * s, 6 * s, 4 * s, 4 * s);

  ctx.fillStyle = '#140c06';
  ctx.fillRect(14 * s, 0, 2 * s, h);
  ctx.fillStyle = '#090503';
  ctx.fillRect(15 * s, 2 * s, 1 * s, h - 4 * s);
}

export function drawGridTerminal(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#1e242d';
  ctx.fillRect(2 * s, 2 * s, w - 4 * s, h - 8 * s);
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(4 * s, 4 * s, w - 8 * s, 18 * s);

  // Screen
  ctx.fillStyle = '#05070a';
  ctx.fillRect(6 * s, 6 * s, w - 12 * s, 14 * s);

  // Phosphor prompt
  ctx.fillStyle = '#7cff9b';
  ctx.fillRect(8 * s, 9 * s, 8 * s, 2 * s);
  ctx.fillRect(8 * s, 13 * s, 12 * s, 2 * s);

  // Keyboard
  ctx.fillStyle = '#1a202c';
  ctx.fillRect(4 * s, h - 6 * s, w - 8 * s, 4 * s);
}

export function drawGridMirror(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#6b4f1d';
  ctx.fillRect(4 * s, 4 * s, w - 8 * s, h - 8 * s);
  ctx.fillStyle = '#b08968';
  ctx.fillRect(6 * s, 6 * s, w - 12 * s, h - 12 * s);

  ctx.fillStyle = '#17252a';
  ctx.fillRect(8 * s, 8 * s, w - 16 * s, h - 16 * s);

  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(w / 2 - 2 * s, 12 * s, 2 * s, 16 * s);
  ctx.fillRect(w / 2, 24 * s, 4 * s, 2 * s);
}

export function drawGridClock(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#3a2312';
  ctx.fillRect(4 * s, 4 * s, w - 8 * s, h - 8 * s);
  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(6 * s, 6 * s, w - 12 * s, h - 12 * s);

  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(10 * s, 8 * s, 12 * s, 12 * s);

  // Hands at 03:14
  ctx.fillStyle = '#1e1b18';
  ctx.fillRect(15 * s, 13 * s, 4 * s, 1 * s);
  ctx.fillRect(15 * s, 10 * s, 1 * s, 3 * s);

  ctx.fillStyle = '#d97706';
  ctx.fillRect(15 * s, 22 * s, 2 * s, 4 * s);
}

export function drawGridHospitalCot(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#14382c';
  ctx.fillRect(2 * s, 6 * s, w - 4 * s, h - 10 * s);
  ctx.fillStyle = '#225946';
  ctx.fillRect(6 * s, 8 * s, w - 12 * s, h - 14 * s);

  ctx.fillStyle = '#ccfbf1';
  ctx.fillRect(8 * s, 10 * s, 10 * s, 10 * s);
}

export function drawGridServerRack(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#0b0f17';
  ctx.fillRect(2 * s, 2 * s, w - 4 * s, h - 4 * s);

  for (let u = 0; u < 5; u++) {
    const uy = (6 + u * 8) * s;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4 * s, uy, w - 8 * s, 6 * s);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(6 * s, uy + 2 * s, 2 * s, 2 * s);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(10 * s, uy + 2 * s, 2 * s, 2 * s);
  }
}

export function drawGridDoor(ctx: CanvasRenderingContext2D, w: number, h: number, grid: GridScaleSize) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#182029';
  ctx.fillRect(2 * s, 2 * s, w - 4 * s, h - 4 * s);
  ctx.fillStyle = '#5c3e26';
  ctx.fillRect(4 * s, 4 * s, w - 8 * s, h - 6 * s);

  ctx.fillStyle = '#3a2416';
  ctx.fillRect(8 * s, 8 * s, w - 16 * s, 12 * s);
  ctx.fillRect(8 * s, 24 * s, w - 16 * s, 14 * s);

  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(w - 8 * s, 26 * s, 2 * s, 2 * s);
}

export function drawGridRoomBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  grid: GridScaleSize,
  roomType: string
) {
  const s = grid === 32 ? 2 : 1;
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, w, h);

  if (roomType === 'last_room') {
    ctx.fillStyle = '#17120e';
    ctx.fillRect(0, 0, w, 64 * s);
    ctx.fillStyle = '#24170e';
    ctx.fillRect(0, 64 * s, w, 48 * s);

    ctx.fillStyle = '#3f2615';
    ctx.fillRect(64 * s, 52 * s, 48 * s, 24 * s);
    drawGridTerminal(ctx, 32 * s, 32 * s, grid);
    drawGridMirror(ctx, 24 * s, 36 * s, grid);
  } else if (roomType === 'corridor') {
    ctx.fillStyle = '#0a0f15';
    ctx.fillRect(0, 0, w, 32 * s);
    ctx.fillStyle = '#2d1e14';
    ctx.fillRect(0, 32 * s, w, 48 * s);
    ctx.fillStyle = '#38161e';
    ctx.fillRect(0, 80 * s, w, 32 * s);
  } else {
    ctx.fillStyle = '#080d14';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20 * s, 20 * s, 24 * s, 70 * s);
    ctx.fillRect(60 * s, 15 * s, 24 * s, 75 * s);
    ctx.fillRect(100 * s, 20 * s, 24 * s, 70 * s);
  }
}

// -----------------------------------------------------------------
// 2. EXPORTED INTERNAL REGISTRY (SPRITES, TILESETS, BACKGROUNDS)
// -----------------------------------------------------------------

export const INITIAL_ASSET_REGISTRY: Record<string, AssetDefinition> = {
  // ==================== SPRITES ====================
  'sprite_player_idle_down': {
    id: 'sprite_player_idle_down',
    name: 'Player Investigator (Down Idle)',
    type: 'sprite',
    path: '/assets/sprites/player_down_0.png',
    fallbackPath: '/assets/retro/player.png',
    gridScale: 16,
    width: 32, // 2x16
    height: 48, // 3x16
    description: 'Lead investigator facing forward in charcoal trenchcoat and fedora.',
    tags: ['player', 'investigator', 'character'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridPlayer(ctx, w, h, grid, 'down', 0);
    }
  },
  'sprite_player_walk_down': {
    id: 'sprite_player_walk_down',
    name: 'Player Investigator (Down Walk)',
    type: 'sprite',
    path: '/assets/sprites/player_down_1.png',
    fallbackPath: '/assets/retro/player.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Lead investigator stepping forward with flashlight.',
    tags: ['player', 'walk', 'animation'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridPlayer(ctx, w, h, grid, 'down', 1);
    }
  },
  'sprite_player_idle_up': {
    id: 'sprite_player_idle_up',
    name: 'Player Investigator (Up Idle)',
    type: 'sprite',
    path: '/assets/sprites/player_up_0.png',
    fallbackPath: '/assets/retro/player.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Investigator facing away into darkness.',
    tags: ['player', 'investigator'],
    room: 'corridor',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridPlayer(ctx, w, h, grid, 'up', 0);
    }
  },
  'sprite_player_idle_side': {
    id: 'sprite_player_idle_side',
    name: 'Player Investigator (Side Profile)',
    type: 'sprite',
    path: '/assets/sprites/player_side_0.png',
    fallbackPath: '/assets/retro/player.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Investigator profile holding lantern.',
    tags: ['player', 'side'],
    room: 'corridor',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridPlayer(ctx, w, h, grid, 'left', 0);
    }
  },
  'sprite_ghost_echo': {
    id: 'sprite_ghost_echo',
    name: 'The Echo Apparition',
    type: 'sprite',
    path: '/assets/sprites/ghost_echo.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Translucent cyan ghost that remembers the 1999 session.',
    tags: ['ghost', 'echo', 'spectral'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridGhost(ctx, w, h, grid, '#00e5ff', 'echo');
    }
  },
  'sprite_ghost_caretaker': {
    id: 'sprite_ghost_caretaker',
    name: 'The Caretaker',
    type: 'sprite',
    path: '/assets/sprites/ghost_caretaker.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Tall silhouette lurking at the end of the long corridor.',
    tags: ['ghost', 'caretaker', 'corridor'],
    room: 'corridor',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridGhost(ctx, w, h, grid, '#fbbf24', 'caretaker');
    }
  },
  'sprite_ghost_mirror': {
    id: 'sprite_ghost_mirror',
    name: 'The Girl in the Mirror',
    type: 'sprite',
    path: '/assets/sprites/ghost_mirror.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Pale girl with dark hair peering through cracked reflection glass.',
    tags: ['ghost', 'mirror', 'spectral'],
    room: 'mirror_gallery',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridGhost(ctx, w, h, grid, '#c084fc', 'mirror');
    }
  },
  'sprite_ghost_morpheus': {
    id: 'sprite_ghost_morpheus',
    name: 'Morpheus Core Entity',
    type: 'sprite',
    path: '/assets/sprites/ghost_morpheus.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Corrupted digital identity matrix awakening in the sealed server.',
    tags: ['ghost', 'morpheus', 'boss'],
    room: 'morpheus_core',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridGhost(ctx, w, h, grid, '#ef4444', 'morpheus');
    }
  },

  // ==================== TILESETS ====================
  'tile_wood_floor': {
    id: 'tile_wood_floor',
    name: 'Decaying Oak Floorboards',
    type: 'tileset',
    path: '/assets/tilesets/floor_wood.png',
    gridScale: 16,
    width: 16,
    height: 16,
    description: 'Dark mahogany 1999 parlor floorboards with rusted nail rivets.',
    tags: ['floor', 'wood', 'tileset'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridWoodFloor(ctx, w, h, grid);
    }
  },
  'tile_peeling_wallpaper': {
    id: 'tile_peeling_wallpaper',
    name: 'Peeling Damask Wallpaper',
    type: 'tileset',
    path: '/assets/tilesets/wall_damask.png',
    gridScale: 16,
    width: 16,
    height: 16,
    description: 'Damask brown wallpaper peeling away to reveal hollow crawlspace.',
    tags: ['wall', 'wallpaper', 'tileset'],
    room: 'corridor',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridWallpaper(ctx, w, h, grid);
    }
  },
  'tile_terminal_phosphor': {
    id: 'tile_terminal_phosphor',
    name: 'Phosphor CRT Console',
    type: 'tileset',
    path: '/assets/tilesets/prop_terminal.png',
    gridScale: 16,
    width: 32,
    height: 32,
    description: 'IBM-compatible green phosphor monitor with blinking cursor prompt.',
    tags: ['prop', 'crt', 'terminal', 'interactive'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridTerminal(ctx, w, h, grid);
    }
  },
  'tile_antique_mirror': {
    id: 'tile_antique_mirror',
    name: 'Tarnished Oval Mirror',
    type: 'tileset',
    path: '/assets/tilesets/prop_mirror.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Antique bronze oval mirror where reflection blinks late.',
    tags: ['prop', 'mirror', 'interactive'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridMirror(ctx, w, h, grid);
    }
  },
  'tile_mantel_clock': {
    id: 'tile_mantel_clock',
    name: 'Frozen Clock 03:14',
    type: 'tileset',
    path: '/assets/tilesets/prop_clock.png',
    gridScale: 16,
    width: 32,
    height: 32,
    description: 'Brass pendulum clock frozen rigidly at 03:14 AM.',
    tags: ['prop', 'clock', 'puzzle'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridClock(ctx, w, h, grid);
    }
  },
  'tile_hospital_cot': {
    id: 'tile_hospital_cot',
    name: 'Rusted Medical Cot',
    type: 'tileset',
    path: '/assets/tilesets/prop_hospital_cot.png',
    gridScale: 16,
    width: 48,
    height: 32,
    description: 'Rusted iron bed frame with stained mint-green mattress.',
    tags: ['prop', 'hospital', 'bed'],
    room: 'hospital',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridHospitalCot(ctx, w, h, grid);
    }
  },
  'tile_server_blade': {
    id: 'tile_server_blade',
    name: 'Server Cathedral Blade',
    type: 'tileset',
    path: '/assets/tilesets/prop_server_blade.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Industrial server blade rack with rhythmic cyan LED pulses.',
    tags: ['prop', 'server', 'morpheus'],
    room: 'server_cathedral',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridServerRack(ctx, w, h, grid);
    }
  },
  'tile_door_wooden': {
    id: 'tile_door_wooden',
    name: 'Numbered Room Doorway',
    type: 'tileset',
    path: '/assets/tilesets/door_wood.png',
    gridScale: 16,
    width: 32,
    height: 48,
    description: 'Heavy wood door with brass plate reading 101 through 108.',
    tags: ['door', 'portal', 'wood'],
    room: 'corridor',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridDoor(ctx, w, h, grid);
    }
  },

  // ==================== BACKGROUNDS ====================
  'bg_last_room_overview': {
    id: 'bg_last_room_overview',
    name: 'The Last Room Parlor',
    type: 'background',
    path: '/assets/backgrounds/room_last_room.png',
    gridScale: 16,
    width: 160,
    height: 112,
    description: 'Complete 1999 living quarters with desk, phosphor terminal, and tarnished mirror.',
    tags: ['background', 'last_room', '1999'],
    room: 'last_room',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridRoomBackground(ctx, w, h, grid, 'last_room');
    }
  },
  'bg_corridor_endless': {
    id: 'bg_corridor_endless',
    name: 'The Long Corridor',
    type: 'background',
    path: '/assets/backgrounds/room_corridor.png',
    gridScale: 16,
    width: 160,
    height: 112,
    description: 'Endless hallway with flickering fluorescents and peeling damask paper.',
    tags: ['background', 'corridor', 'doors'],
    room: 'corridor',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridRoomBackground(ctx, w, h, grid, 'corridor');
    }
  },
  'bg_server_cathedral': {
    id: 'bg_server_cathedral',
    name: 'Server Cathedral',
    type: 'background',
    path: '/assets/backgrounds/room_server.png',
    gridScale: 16,
    width: 160,
    height: 112,
    description: 'Monolithic towers of mainframe units humming beneath emergency red lights.',
    tags: ['background', 'server', 'core'],
    room: 'server_cathedral',
    status: 'idle',
    source: 'unloaded',
    proceduralGenerator: (ctx, w, h, grid) => {
      drawGridRoomBackground(ctx, w, h, grid, 'server_cathedral');
    }
  }
};

/**
 * Categorized view of the asset registry
 */
export const assetRegistry = {
  sprites: Object.fromEntries(
    Object.entries(INITIAL_ASSET_REGISTRY).filter(([, a]) => a.type === 'sprite')
  ),
  tilesets: Object.fromEntries(
    Object.entries(INITIAL_ASSET_REGISTRY).filter(([, a]) => a.type === 'tileset')
  ),
  backgrounds: Object.fromEntries(
    Object.entries(INITIAL_ASSET_REGISTRY).filter(([, a]) => a.type === 'background')
  ),
  all: INITIAL_ASSET_REGISTRY
};

// -----------------------------------------------------------------
// 3. STANDALONE loadAsset METHOD
// Attempts fetch on local project path -> Falls back to Canvas pixel-art
// Supports 16x16 or 32x32 grid with pre-cached canvas for consistent performance
// -----------------------------------------------------------------

export async function loadAsset(
  assetId: string,
  forceFail: boolean = false,
  targetGrid: GridScaleSize = 16
): Promise<HTMLCanvasElement> {
  const asset = INITIAL_ASSET_REGISTRY[assetId];
  if (!asset) {
    throw new Error(`Asset "${assetId}" not found in RetroAssetManager registry.`);
  }

  const scaleMultiplier = targetGrid === 32 ? 2 : 1;
  const targetW = asset.width * scaleMultiplier;
  const targetH = asset.height * scaleMultiplier;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');
  ctx.imageSmoothingEnabled = false;

  const applyCanvasFallback = () => {
    ctx.clearRect(0, 0, targetW, targetH);
    asset.proceduralGenerator(ctx, targetW, targetH, targetGrid);
    asset.status = 'fallback_procedural';
    asset.source = 'procedural';
    asset.gridScale = targetGrid;
    asset.cachedCanvas = canvas;
    return canvas;
  };

  if (forceFail) {
    return applyCanvasFallback();
  }

  try {
    const response = await fetch(asset.path);
    if (!response.ok) {
      throw new Error(`Fetch failed with HTTP status ${response.status}`);
    }
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    asset.status = 'loaded';
    asset.source = 'local';
    asset.gridScale = targetGrid;
    asset.cachedCanvas = canvas;
    return canvas;
  } catch (err) {
    // Local project fetch failed -> fallback to Canvas procedural pixel-art generator!
    return applyCanvasFallback();
  }
}

// -----------------------------------------------------------------
// 4. REACT COMPONENT: RetroAssetManager
// -----------------------------------------------------------------

export interface RetroAssetManagerProps {
  initialRoomId?: string;
  onClose?: () => void;
  onApplyRoomTileset?: (roomId: string) => void;
}

export const RetroAssetManager: React.FC<RetroAssetManagerProps> = ({
  initialRoomId = 'corridor',
  onClose,
  onApplyRoomTileset,
}) => {
  const [activeGridSize, setActiveGridSize] = useState<GridScaleSize>(16);
  const [registryState, setRegistryState] = useState<Record<string, AssetDefinition>>(INITIAL_ASSET_REGISTRY);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('tile_terminal_phosphor');
  const [activeTypeFilter, setActiveTypeFilter] = useState<AssetType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [isBatchLoading, setIsBatchLoading] = useState<boolean>(false);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Component-bound loadAsset method that syncs with React state
  const handleLoadAsset = useCallback(
    async (
      assetId: string,
      forceFail: boolean = false,
      targetGrid: GridScaleSize = activeGridSize
    ): Promise<HTMLCanvasElement> => {
      setRegistryState(prev => ({
        ...prev,
        [assetId]: { ...prev[assetId], status: 'loading' }
      }));

      const canvas = await loadAsset(assetId, forceFail, targetGrid);

      setRegistryState(prev => ({
        ...prev,
        [assetId]: {
          ...prev[assetId],
          status: INITIAL_ASSET_REGISTRY[assetId].status,
          source: INITIAL_ASSET_REGISTRY[assetId].source,
          gridScale: targetGrid,
          cachedCanvas: canvas
        }
      }));

      return canvas;
    },
    [activeGridSize]
  );

  // Initial eager load
  useEffect(() => {
    handleLoadAsset(selectedAssetId, false, activeGridSize);
  }, [selectedAssetId, handleLoadAsset, activeGridSize]);

  // Batch load all assets in registry
  const handleLoadAll = async () => {
    setIsBatchLoading(true);
    audioEngine.playBlip(520);
    const assetIds = Object.keys(registryState);
    for (const id of assetIds) {
      await handleLoadAsset(id, false, activeGridSize);
    }
    setIsBatchLoading(false);
    audioEngine.playSuccess();
  };

  // Switch grid scale mode (16x16 <-> 32x32)
  const handleToggleGridSize = (newGrid: GridScaleSize) => {
    setActiveGridSize(newGrid);
    audioEngine.playBlip(newGrid === 16 ? 440 : 660);
    handleLoadAsset(selectedAssetId, false, newGrid);
  };

  const selectedAsset = registryState[selectedAssetId];

  // Draw preview in canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !selectedAsset) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const scaleMultiplier = activeGridSize === 32 ? 2 : 1;
    const baseW = selectedAsset.width * scaleMultiplier;
    const baseH = selectedAsset.height * scaleMultiplier;

    const displayW = baseW * zoomLevel;
    const displayH = baseH * zoomLevel;
    canvas.width = displayW;
    canvas.height = displayH;

    // Checkerboard pattern
    const checkSize = 8;
    for (let y = 0; y < displayH; y += checkSize) {
      for (let x = 0; x < displayW; x += checkSize) {
        ctx.fillStyle = (x / checkSize + y / checkSize) % 2 === 0 ? '#0b1118' : '#060a0f';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Cached canvas or procedural render
    if (selectedAsset.cachedCanvas) {
      ctx.drawImage(selectedAsset.cachedCanvas, 0, 0, displayW, displayH);
    } else {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = baseW;
      tempCanvas.height = baseH;
      const tctx = tempCanvas.getContext('2d')!;
      tctx.imageSmoothingEnabled = false;
      selectedAsset.proceduralGenerator(tctx, baseW, baseH, activeGridSize);
      ctx.drawImage(tempCanvas, 0, 0, displayW, displayH);
    }

    // 16x16 or 32x32 Grid Overlay
    if (showGridOverlay) {
      const step = activeGridSize * zoomLevel;
      ctx.strokeStyle = activeGridSize === 16 ? 'rgba(0, 229, 255, 0.35)' : 'rgba(124, 255, 155, 0.35)';
      ctx.lineWidth = 1;

      for (let gx = 0; gx <= displayW; gx += step) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, displayH);
        ctx.stroke();
      }

      for (let gy = 0; gy <= displayH; gy += step) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(displayW, gy);
        ctx.stroke();
      }
    }
  }, [selectedAsset, zoomLevel, showGridOverlay, activeGridSize]);

  // Export current asset as PNG
  const handleExportPNG = () => {
    if (!selectedAsset?.cachedCanvas) return;
    const link = document.createElement('a');
    link.download = `${selectedAsset.id}_${activeGridSize}x${activeGridSize}.png`;
    link.href = selectedAsset.cachedCanvas.toDataURL('image/png');
    link.click();
    audioEngine.playKeyClick();
  };

  const filteredAssets = Object.values(registryState).filter(asset => {
    const matchesType = activeTypeFilter === 'all' || asset.type === activeTypeFilter;
    const matchesQuery =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.room && asset.room.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  });

  const totalCount = Object.keys(registryState).length;
  const loadedCount = Object.values(registryState).filter(a => a.status === 'loaded').length;
  const proceduralCount = Object.values(registryState).filter(a => a.status === 'fallback_procedural').length;

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-[#030508] text-[#e2e8f0] font-mono select-none overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#142838] bg-[#05080c] z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center">
            <Grid className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-wider text-white">
                RETRO ASSET MANAGER
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 font-bold">
                GRID PIPELINE: {activeGridSize}x{activeGridSize}
              </span>
            </div>
            <div className="text-[10px] text-[#64748b]">
              Local Fetch Loader with Automatic Canvas Pixel-Art Fallback
            </div>
          </div>
        </div>

        {/* Top Controls: 16x16 / 32x32 Switcher & Load All */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#090e15] border border-[#1b2f44] rounded p-0.5 text-[10px]">
            <button
              onClick={() => handleToggleGridSize(16)}
              className={`px-2 py-1 rounded cursor-pointer font-bold ${
                activeGridSize === 16
                  ? 'bg-[#00e5ff]/25 text-[#00e5ff] border border-[#00e5ff]/40'
                  : 'text-[#64748b] hover:text-white'
              }`}
            >
              16x16 GRID
            </button>
            <button
              onClick={() => handleToggleGridSize(32)}
              className={`px-2 py-1 rounded cursor-pointer font-bold ${
                activeGridSize === 32
                  ? 'bg-[#7cff9b]/25 text-[#7cff9b] border border-[#7cff9b]/40'
                  : 'text-[#64748b] hover:text-white'
              }`}
            >
              32x32 GRID
            </button>
          </div>

          <button
            onClick={handleLoadAll}
            disabled={isBatchLoading}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40 text-xs font-bold hover:bg-[#00e5ff]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBatchLoading ? 'animate-spin' : ''}`} />
            <span>LOAD ALL ASSETS</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#132333] hover:bg-[#1f3a54] text-white rounded text-xs border border-[#22405d] transition-all cursor-pointer"
            >
              CLOSE
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace (Split View) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Asset Registry Explorer */}
        <div className="w-80 md:w-96 border-r border-[#142838] bg-[#070b10] flex flex-col">
          {/* Search & Filter Toolbar */}
          <div className="p-3 border-b border-[#142838] space-y-2 bg-[#05080c]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search sprites, tiles, backgrounds..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#090e15] border border-[#1b2f44] rounded text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00e5ff]"
              />
            </div>

            {/* Type Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 text-[10px]">
              {(['all', 'sprite', 'tileset', 'background'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setActiveTypeFilter(type)}
                  className={`py-1 text-center rounded uppercase font-bold transition-all cursor-pointer ${
                    activeTypeFilter === type
                      ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                      : 'text-[#64748b] hover:text-[#94a3b8] bg-[#090e15]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Registry List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredAssets.map(asset => {
              const isSelected = selectedAssetId === asset.id;
              const scaleMult = activeGridSize === 32 ? 2 : 1;
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    audioEngine.playKeyClick();
                  }}
                  className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#00e5ff]/10 border-[#00e5ff] text-white shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                      : 'bg-[#090e15] border-[#142436] text-[#cbd5e1] hover:border-[#1f3c5b]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-black border border-[#1b2f44] flex items-center justify-center shrink-0">
                      {asset.type === 'sprite' ? (
                        <ImageIcon className="w-4 h-4 text-[#00e5ff]" />
                      ) : asset.type === 'tileset' ? (
                        <Grid className="w-4 h-4 text-[#7cff9b]" />
                      ) : (
                        <Layers className="w-4 h-4 text-[#a78bfa]" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">{asset.name}</div>
                      <div className="text-[10px] text-[#64748b] truncate">
                        {asset.width * scaleMult}x{asset.height * scaleMult}px // {asset.path}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 ml-2">
                    {asset.status === 'loaded' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold">
                        LOCAL
                      </span>
                    ) : asset.status === 'fallback_procedural' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold">
                        CANVAS {activeGridSize}px
                      </span>
                    ) : asset.status === 'loading' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-400 font-bold animate-pulse">
                        FETCHING
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                        IDLE
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Registry Stats Footer */}
          <div className="p-3 border-t border-[#142838] bg-[#05080c] text-[10px] text-[#64748b] flex items-center justify-between">
            <span>TOTAL: {totalCount} ASSETS</span>
            <span className="text-[#00e5ff]">
              {proceduralCount} CANVAS // {loadedCount} LOCAL
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Grid Inspector & Performance Console */}
        <div className="flex-1 flex flex-col bg-[#030508] overflow-hidden">
          {selectedAsset ? (
            <>
              {/* Toolbar */}
              <div className="px-4 py-2 border-b border-[#142838] bg-[#070b10] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {selectedAsset.name}
                  </span>
                  <span className="text-[10px] text-[#00e5ff] px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30 font-bold">
                    GRID SCALE: {activeGridSize}x{activeGridSize}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Grid Lines Toggle */}
                  <button
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                    className={`px-2.5 py-1 rounded text-[11px] flex items-center space-x-1.5 border transition-all cursor-pointer ${
                      showGridOverlay
                        ? 'bg-[#00e5ff]/20 border-[#00e5ff]/50 text-[#00e5ff]'
                        : 'bg-[#090e15] border-[#1b2f44] text-[#64748b]'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Grid Lines: {showGridOverlay ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Zoom Controls */}
                  <div className="flex items-center bg-[#090e15] border border-[#1b2f44] rounded text-[11px]">
                    {[2, 4, 8, 12].map(z => (
                      <button
                        key={z}
                        onClick={() => setZoomLevel(z)}
                        className={`px-2 py-0.5 cursor-pointer ${
                          zoomLevel === z
                            ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold'
                            : 'text-[#64748b] hover:text-white'
                        }`}
                      >
                        {z}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportPNG}
                    className="px-2.5 py-1 rounded bg-[#132333] hover:bg-[#1f3a54] text-white border border-[#22405d] text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT</span>
                  </button>
                </div>
              </div>

              {/* Viewport: Centered Canvas with nearest-neighbor scaling */}
              <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#020305] relative">
                <div className="p-3 bg-[#05080c] border border-[#142838] rounded-lg shadow-2xl flex flex-col items-center">
                  <canvas
                    ref={previewCanvasRef}
                    className="block [image-rendering:pixelated] border border-[#1f3a54]"
                  />
                  <div className="text-[10px] text-[#64748b] mt-2 font-mono flex items-center space-x-3">
                    <span>
                      RESOLUTION: {selectedAsset.width * (activeGridSize === 32 ? 2 : 1)} x{' '}
                      {selectedAsset.height * (activeGridSize === 32 ? 2 : 1)} PX
                    </span>
                    <span>//</span>
                    <span className="text-[#00e5ff]">
                      PIPELINE: {activeGridSize}x{activeGridSize} MEMOIZED
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Inspector & Fallback Action Console */}
              <div className="p-4 border-t border-[#142838] bg-[#070b10] space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Metadata info */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-[#64748b] uppercase">LOCAL PROJECT PATH & INFO</div>
                    <div className="text-white font-mono text-[11px] truncate">
                      {selectedAsset.path}
                    </div>
                    <div className="text-[10px] text-[#94a3b8]">
                      {selectedAsset.description}
                    </div>
                  </div>

                  {/* Active Source Status */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-[#64748b] uppercase">RENDERING PERFORMANCE & SOURCE</div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedAsset.source === 'local'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : selectedAsset.source === 'procedural'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        SOURCE: {selectedAsset.source.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[#94a3b8]">
                        Status: {selectedAsset.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#64748b] flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-[#7cff9b]" />
                      <span>Pre-cached Canvas: Zero stutter, 60fps stable</span>
                    </div>
                  </div>

                  {/* Interactive Fallback Test Actions */}
                  <div className="flex flex-col space-y-2 justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          handleLoadAsset(selectedAsset.id, false, activeGridSize);
                          audioEngine.playKeyClick();
                        }}
                        className="flex-1 py-1 px-2.5 rounded bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 text-[#00e5ff] border border-[#00e5ff]/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        FETCH LOCAL PATH
                      </button>

                      <button
                        onClick={() => {
                          handleLoadAsset(selectedAsset.id, true, activeGridSize);
                          audioEngine.playGhostWhisper();
                        }}
                        title="Simulate fetch failure to demonstrate Canvas pixel-art fallback (16x16 or 32x32)"
                        className="flex-1 py-1 px-2.5 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        SIMULATE FALLBACK
                      </button>
                    </div>

                    <div className="text-[9px] text-[#64748b]">
                      If local fetch fails, falls back to Canvas generator ({activeGridSize}x{activeGridSize}).
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#64748b]">
              Select an asset from the registry to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetroAssetManager;
