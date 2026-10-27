/**
 * PHANTOM SHELL // CENTRALIZED RETRO ASSET MANAGER
 * 
 * 4-Tier Asset Priority Architecture:
 *   Tier 1: Primary Local Assets (High-priority local file paths or custom sprite sheets)
 *   Tier 2: Secondary Original Local Assets (Fallback bundled image assets)
 *   Tier 3: Procedural Pixel-Art Fallbacks (Pure Canvas-generated 16-bit pixel matrices)
 *   Tier 4: Last-Resort Clean Placeholders (Retro wireframe silhouettes with identifying glyphs)
 * 
 * Architectural Guarantee:
 *   Gameplay logic (movement, collision, object inspection, ghost dialogue, story triggers)
 *   is strictly decoupled from visual asset loading. Missing or slow assets will NEVER
 *   crash, delay gameplay, corrupt state, or block player interaction.
 */

export type AssetTier = 'tier1_primary' | 'tier2_secondary' | 'tier3_procedural' | 'tier4_placeholder';
export type AssetStatus = 'idle' | 'loading' | 'loaded' | 'fallback_procedural' | 'fallback_placeholder' | 'error';
export type AssetCategory = 'player' | 'ghost' | 'furniture' | 'item' | 'tile' | 'effect';

export interface AssetDefinition {
  id: string;
  name: string;
  category: AssetCategory;
  primaryPath?: string;
  secondaryPath?: string;
  width: number;
  height: number;
  // Procedural generator for Tier 3
  generateProcedural: (ctx: CanvasRenderingContext2D, width: number, height: number, time?: number) => void;
  // Last resort generator for Tier 4
  generatePlaceholder: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface AssetDiagnosticEntry {
  id: string;
  name: string;
  category: AssetCategory;
  activeTier: AssetTier;
  status: AssetStatus;
  primaryPath?: string;
  secondaryPath?: string;
  lastLoadedAt?: number;
  errorMessage?: string;
}

export class RetroAssetManager {
  private static instance: RetroAssetManager;
  private registry: Map<string, AssetDefinition> = new Map();
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private canvasCache: Map<string, HTMLCanvasElement> = new Map();
  private assetStatuses: Map<string, { tier: AssetTier; status: AssetStatus; error?: string }> = new Map();
  private listeners: Set<() => void> = new Set();

  // Diagnostics & Simulation Flags
  public simulateFailure: boolean = false;
  public forceProcedural: boolean = false;

  private constructor() {
    this.registerBuiltinAssets();
  }

  public static getInstance(): RetroAssetManager {
    if (!RetroAssetManager.instance) {
      RetroAssetManager.instance = new RetroAssetManager();
    }
    return RetroAssetManager.instance;
  }

  /**
   * Subscribe to asset loading/state changes
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  /**
   * Register built-in assets with 4-tier fallback generators
   */
  private registerBuiltinAssets() {
    // -------------------------------------------------------------
    // 1. PLAYER SPRITES (4 directions x 3 animation frames)
    // -------------------------------------------------------------
    const directions = ['down', 'up', 'left', 'right'] as const;
    const frames = [0, 1, 2] as const;

    directions.forEach(dir => {
      frames.forEach(frame => {
        const id = `player_${dir}_${frame}`;
        this.registerAsset({
          id,
          name: `Player Investigator (${dir.toUpperCase()} Frame ${frame})`,
          category: 'player',
          primaryPath: `/assets/sprites/player_${dir}_${frame}.png`,
          secondaryPath: `/assets/retro/player.png`,
          width: 32,
          height: 48,
          generateProcedural: (ctx, w, h) => {
            this.drawProceduralPlayer(ctx, w, h, dir, frame);
          },
          generatePlaceholder: (ctx, w, h) => {
            this.drawWireframeBox(ctx, w, h, '#00e5ff', `P:${dir[0].toUpperCase()}${frame}`);
          }
        });
      });
    });

    // -------------------------------------------------------------
    // 2. GHOST SPRITES (Primary story ghosts)
    // -------------------------------------------------------------
    const ghosts: { id: string; name: string; color: string; tint: string }[] = [
      { id: 'echo', name: 'THE ECHO', color: '#00e5ff', tint: 'rgba(0, 229, 255, 0.65)' },
      { id: 'caretaker', name: 'THE CARETAKER', color: '#ffb703', tint: 'rgba(255, 183, 3, 0.65)' },
      { id: 'child', name: 'THE LOST CHILD', color: '#fed7aa', tint: 'rgba(254, 215, 170, 0.65)' },
      { id: 'doctor', name: 'DR. THORNE', color: '#5eead4', tint: 'rgba(94, 234, 212, 0.65)' },
      { id: 'student', name: 'THE STUDENT', color: '#93c5fd', tint: 'rgba(147, 197, 253, 0.65)' },
      { id: 'archivist', name: 'THE ARCHIVIST', color: '#fde047', tint: 'rgba(253, 224, 71, 0.65)' },
      { id: 'projectionist', name: 'THE PROJECTIONIST', color: '#f43f5e', tint: 'rgba(244, 63, 94, 0.65)' },
      { id: 'passenger', name: 'THE PASSENGER', color: '#38bdf8', tint: 'rgba(56, 189, 248, 0.65)' },
      { id: 'mirror', name: 'GIRL IN THE MIRROR', color: '#c084fc', tint: 'rgba(192, 132, 252, 0.75)' },
      { id: 'morpheus', name: 'MORPHEUS CORE', color: '#ef4444', tint: 'rgba(239, 68, 68, 0.85)' },
    ];

    ghosts.forEach(g => {
      this.registerAsset({
        id: `ghost_${g.id}`,
        name: g.name,
        category: 'ghost',
        primaryPath: `/assets/sprites/ghost_${g.id}.png`,
        secondaryPath: `/assets/retro/ghosts.png`,
        width: 32,
        height: 48,
        generateProcedural: (ctx, w, h, time = 0) => {
          this.drawProceduralGhost(ctx, w, h, g.color, g.tint, time, g.id);
        },
        generatePlaceholder: (ctx, w, h) => {
          this.drawWireframeBox(ctx, w, h, g.color, `G:${g.id.slice(0, 4).toUpperCase()}`);
        }
      });
    });

    // -------------------------------------------------------------
    // 3. INTERACTIVE ROOM OBJECTS & FURNITURE
    // -------------------------------------------------------------
    this.registerAsset({
      id: 'obj_terminal',
      name: 'IBM Phosphor CRT Terminal',
      category: 'furniture',
      primaryPath: '/assets/sprites/terminal.png',
      width: 48,
      height: 48,
      generateProcedural: (ctx, w, h, time = 0) => {
        this.drawProceduralTerminal(ctx, w, h, time);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#7cff9b', 'CRT');
      }
    });

    this.registerAsset({
      id: 'obj_mirror',
      name: 'Antique Tarnished Mirror',
      category: 'furniture',
      primaryPath: '/assets/sprites/mirror.png',
      width: 36,
      height: 52,
      generateProcedural: (ctx, w, h, time = 0) => {
        this.drawProceduralMirror(ctx, w, h, time);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#a78bfa', 'MIRROR');
      }
    });

    this.registerAsset({
      id: 'obj_clock',
      name: 'Mantelpiece Clock (03:14 AM)',
      category: 'furniture',
      primaryPath: '/assets/sprites/clock.png',
      width: 32,
      height: 40,
      generateProcedural: (ctx, w, h, time = 0) => {
        this.drawProceduralClock(ctx, w, h, time);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#d4af37', '03:14');
      }
    });

    this.registerAsset({
      id: 'obj_desk',
      name: 'Mahogany Investigator Desk',
      category: 'furniture',
      primaryPath: '/assets/sprites/desk.png',
      width: 64,
      height: 40,
      generateProcedural: (ctx, w, h) => {
        this.drawProceduralDesk(ctx, w, h);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#8b5a2b', 'DESK');
      }
    });

    this.registerAsset({
      id: 'obj_bed',
      name: 'Forgotten Bedroom Bed',
      category: 'furniture',
      primaryPath: '/assets/sprites/bed.png',
      width: 64,
      height: 54,
      generateProcedural: (ctx, w, h) => {
        this.drawProceduralBed(ctx, w, h);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#475569', 'BED');
      }
    });

    this.registerAsset({
      id: 'obj_hospital_bed',
      name: 'Rusted Medical Cot',
      category: 'furniture',
      primaryPath: '/assets/sprites/hospital_bed.png',
      width: 64,
      height: 54,
      generateProcedural: (ctx, w, h) => {
        this.drawProceduralHospitalBed(ctx, w, h);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#225946', 'MED');
      }
    });

    this.registerAsset({
      id: 'obj_door_wood',
      name: 'Heavy Damask Doorway',
      category: 'furniture',
      primaryPath: '/assets/sprites/door_wood.png',
      width: 36,
      height: 60,
      generateProcedural: (ctx, w, h) => {
        this.drawProceduralDoor(ctx, w, h, '#5c3e26');
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#c49563', 'DOOR');
      }
    });

    this.registerAsset({
      id: 'obj_phone',
      name: 'Rotary Wall Phone',
      category: 'furniture',
      primaryPath: '/assets/sprites/phone.png',
      width: 24,
      height: 36,
      generateProcedural: (ctx, w, h, time = 0) => {
        this.drawProceduralPhone(ctx, w, h, time);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#ff5555', 'PHONE');
      }
    });

    this.registerAsset({
      id: 'obj_generator',
      name: 'High Voltage Breaker Box',
      category: 'furniture',
      primaryPath: '/assets/sprites/generator.png',
      width: 44,
      height: 52,
      generateProcedural: (ctx, w, h, time = 0) => {
        this.drawProceduralGenerator(ctx, w, h, time);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#f59e0b', 'GEN');
      }
    });

    this.registerAsset({
      id: 'obj_server_rack',
      name: 'MORPHEUS Server Rack Array',
      category: 'furniture',
      primaryPath: '/assets/sprites/server_rack.png',
      width: 48,
      height: 64,
      generateProcedural: (ctx, w, h, time = 0) => {
        this.drawProceduralServerRack(ctx, w, h, time);
      },
      generatePlaceholder: (ctx, w, h) => {
        this.drawWireframeBox(ctx, w, h, '#00e5ff', 'SERVER');
      }
    });
  }

  /**
   * Register a new asset definition
   */
  public registerAsset(def: AssetDefinition) {
    this.registry.set(def.id, def);
    this.assetStatuses.set(def.id, {
      tier: 'tier3_procedural',
      status: 'idle'
    });
    // Trigger eager background load attempt
    this.attemptLoadImage(def);
  }

  /**
   * Attempt loading Primary / Secondary image files in background
   */
  private attemptLoadImage(def: AssetDefinition) {
    if (this.forceProcedural || this.simulateFailure) {
      this.assetStatuses.set(def.id, {
        tier: this.simulateFailure ? 'tier4_placeholder' : 'tier3_procedural',
        status: this.simulateFailure ? 'fallback_placeholder' : 'fallback_procedural'
      });
      return;
    }

    if (!def.primaryPath && !def.secondaryPath) {
      this.assetStatuses.set(def.id, {
        tier: 'tier3_procedural',
        status: 'fallback_procedural'
      });
      return;
    }

    const testPath = def.primaryPath || def.secondaryPath;
    if (!testPath) return;

    this.assetStatuses.set(def.id, {
      tier: 'tier1_primary',
      status: 'loading'
    });

    const img = new Image();
    img.src = testPath;
    img.onload = () => {
      if (this.simulateFailure) return;
      this.loadedImages.set(def.id, img);
      this.assetStatuses.set(def.id, {
        tier: def.primaryPath ? 'tier1_primary' : 'tier2_secondary',
        status: 'loaded'
      });
      this.notify();
    };
    img.onerror = () => {
      // Graceful fallback: try secondary or downgrade to Tier 3 Procedural
      if (def.secondaryPath && testPath !== def.secondaryPath) {
        const secImg = new Image();
        secImg.src = def.secondaryPath;
        secImg.onload = () => {
          this.loadedImages.set(def.id, secImg);
          this.assetStatuses.set(def.id, {
            tier: 'tier2_secondary',
            status: 'loaded'
          });
          this.notify();
        };
        secImg.onerror = () => {
          // Downgrade to Tier 3 Procedural
          this.assetStatuses.set(def.id, {
            tier: 'tier3_procedural',
            status: 'fallback_procedural'
          });
          this.notify();
        };
      } else {
        // Instant seamless fallback to Tier 3 Procedural Canvas
        this.assetStatuses.set(def.id, {
          tier: 'tier3_procedural',
          status: 'fallback_procedural'
        });
        this.notify();
      }
    };
  }

  /**
   * CORE METHOD: Synchronous, crash-proof asset retrieval.
   * Never blocks, never throws, always provides an authentic retro graphic.
   */
  public getAssetCanvas(assetId: string, time: number = 0): HTMLCanvasElement {
    const def = this.registry.get(assetId);
    if (!def) {
      // Unknown asset fallback
      const fallback = document.createElement('canvas');
      fallback.width = 32;
      fallback.height = 32;
      const ctx = fallback.getContext('2d')!;
      this.drawWireframeBox(ctx, 32, 32, '#ef4444', '?');
      return fallback;
    }

    // Check if simulation flags are active
    if (this.simulateFailure) {
      const phCanvas = document.createElement('canvas');
      phCanvas.width = def.width;
      phCanvas.height = def.height;
      const pctx = phCanvas.getContext('2d')!;
      pctx.imageSmoothingEnabled = false;
      def.generatePlaceholder(pctx, def.width, def.height);
      return phCanvas;
    }

    if (!this.forceProcedural && this.loadedImages.has(assetId)) {
      const img = this.loadedImages.get(assetId)!;
      const c = document.createElement('canvas');
      c.width = def.width;
      c.height = def.height;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, def.width, def.height);
      return c;
    }

    // Tier 3: Pure procedural pixel-art fallback (cached or animated)
    const procCanvas = document.createElement('canvas');
    procCanvas.width = def.width;
    procCanvas.height = def.height;
    const ctx = procCanvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    def.generateProcedural(ctx, def.width, def.height, time);
    return procCanvas;
  }

  /**
   * Draw directly to a target canvas context with crisp pixelation
   */
  public drawAsset(
    ctx: CanvasRenderingContext2D,
    assetId: string,
    dx: number,
    dy: number,
    dw?: number,
    dh?: number,
    time: number = 0
  ) {
    const assetCanvas = this.getAssetCanvas(assetId, time);
    const destW = dw ?? assetCanvas.width;
    const destH = dh ?? assetCanvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(assetCanvas, Math.round(dx), Math.round(dy), Math.round(destW), Math.round(destH));
  }

  /**
   * Diagnostic summary of all assets for developer HUD
   */
  public getDiagnostics(): AssetDiagnosticEntry[] {
    const list: AssetDiagnosticEntry[] = [];
    this.registry.forEach((def, id) => {
      const current = this.assetStatuses.get(id) || { tier: 'tier3_procedural', status: 'idle' };
      list.push({
        id,
        name: def.name,
        category: def.category,
        activeTier: this.simulateFailure ? 'tier4_placeholder' : (this.forceProcedural ? 'tier3_procedural' : current.tier),
        status: this.simulateFailure ? 'fallback_placeholder' : (this.forceProcedural ? 'fallback_procedural' : current.status),
        primaryPath: def.primaryPath,
        secondaryPath: def.secondaryPath,
        errorMessage: current.error
      });
    });
    return list;
  }

  public setSimulateFailure(val: boolean) {
    this.simulateFailure = val;
    this.notify();
  }

  public setForceProcedural(val: boolean) {
    this.forceProcedural = val;
    this.notify();
  }

  public reloadAll() {
    this.loadedImages.clear();
    this.canvasCache.clear();
    this.registry.forEach(def => this.attemptLoadImage(def));
    this.notify();
  }

  // -------------------------------------------------------------
  // PROCEDURAL PIXEL-ART GENERATORS (Tier 3)
  // -------------------------------------------------------------

  private drawProceduralPlayer(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dir: 'down' | 'up' | 'left' | 'right',
    frame: number
  ) {
    // Crisp pixel grid coordinates (32x48)
    const legOffset = frame === 1 ? -2 : (frame === 2 ? 2 : 0);

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 3, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoes / boots
    ctx.fillStyle = '#0f172a';
    if (dir === 'left' || dir === 'right') {
      ctx.fillRect(w / 2 - 4 + legOffset, h - 6, 8, 4);
    } else {
      ctx.fillRect(w / 2 - 7, h - 6 + (frame === 1 ? -2 : 0), 5, 4);
      ctx.fillRect(w / 2 + 2, h - 6 + (frame === 2 ? -2 : 0), 5, 4);
    }

    // Trousers
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 6, h - 14, 12, 9);

    // Overcoat / Trenchcoat (Charcoal/Dusty Navy)
    ctx.fillStyle = '#1c2430';
    ctx.fillRect(w / 2 - 8, h - 28, 16, 16);
    // Overcoat hem & collar
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(w / 2 - 7, h - 26, 14, 4);

    // Collar / Scarf (Subtle wine red accent)
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(w / 2 - 4, h - 29, 8, 3);

    // Head / Face
    ctx.fillStyle = '#d6b896'; // Faded skin tone
    ctx.fillRect(w / 2 - 6, h - 40, 12, 11);

    // Hair / Detective Fedora
    ctx.fillStyle = '#090d14';
    ctx.fillRect(w / 2 - 8, h - 44, 16, 5); // Brim
    ctx.fillRect(w / 2 - 6, h - 48, 12, 5); // Crown

    // Facing Direction features
    if (dir === 'down') {
      // Eyes (white + dark pupils looking forward)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w / 2 - 4, h - 36, 2, 2);
      ctx.fillRect(w / 2 + 2, h - 36, 2, 2);
      ctx.fillStyle = '#090d14';
      ctx.fillRect(w / 2 - 3, h - 35, 1, 1);
      ctx.fillRect(w / 2 + 3, h - 35, 1, 1);
    } else if (dir === 'left') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w / 2 - 5, h - 36, 2, 2);
      ctx.fillStyle = '#090d14';
      ctx.fillRect(w / 2 - 5, h - 35, 1, 1);
    } else if (dir === 'right') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w / 2 + 3, h - 36, 2, 2);
      ctx.fillStyle = '#090d14';
      ctx.fillRect(w / 2 + 4, h - 35, 1, 1);
    }

    // Flashlight held in hand
    if (dir === 'down' || dir === 'right') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(w / 2 + 6, h - 22, 3, 7);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(w / 2 + 6, h - 16, 3, 2);
    } else if (dir === 'left') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(w / 2 - 9, h - 22, 3, 7);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(w / 2 - 9, h - 16, 3, 2);
    }
  }

  private drawProceduralGhost(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    color: string,
    tint: string,
    time: number,
    ghostId: string
  ) {
    const floatY = Math.sin(time * 3) * 3;
    const pulseAlpha = 0.55 + Math.sin(time * 4) * 0.25;

    // Spectral aura glow
    const grad = ctx.createRadialGradient(w / 2, h / 2 + floatY, 4, w / 2, h / 2 + floatY, w * 0.7);
    grad.addColorStop(0, tint);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(0, floatY);

    if (ghostId === 'caretaker') {
      // Tall silhouette with wide brim hat
      ctx.fillStyle = `rgba(15, 23, 42, ${pulseAlpha + 0.2})`;
      ctx.fillRect(w / 2 - 8, h - 42, 16, 4); // Hat brim
      ctx.fillRect(w / 2 - 5, h - 47, 10, 6); // Hat crown
      ctx.fillRect(w / 2 - 7, h - 37, 14, 28); // Long dark duster coat
      // Glowing amber eyes peering from under brim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(w / 2 - 4, h - 36, 2, 2);
      ctx.fillRect(w / 2 + 2, h - 36, 2, 2);
    } else if (ghostId === 'child') {
      // Small fragile child silhouette
      ctx.fillStyle = `rgba(254, 215, 170, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(w / 2, h - 32, 6, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(w / 2 - 5, h - 26, 10, 14); // Dress / nightgown
      // Teddy bear in hand
      ctx.fillStyle = '#92400e';
      ctx.fillRect(w / 2 + 4, h - 22, 6, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w / 2 - 2, h - 33, 1, 1);
      ctx.fillRect(w / 2 + 1, h - 33, 1, 1);
    } else if (ghostId === 'mirror') {
      // Girl in the mirror: pale silhouette, dark hair, shattered static
      ctx.fillStyle = `rgba(192, 132, 252, ${pulseAlpha})`;
      ctx.fillRect(w / 2 - 7, h - 38, 14, 28);
      // Long dark hair
      ctx.fillStyle = '#0f0a1c';
      ctx.fillRect(w / 2 - 8, h - 44, 16, 18);
      // Pale visage
      ctx.fillStyle = '#ede9fe';
      ctx.fillRect(w / 2 - 4, h - 40, 8, 8);
      // Hollow dark eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(w / 2 - 3, h - 38, 2, 3);
      ctx.fillRect(w / 2 + 1, h - 38, 2, 3);
    } else {
      // Classic THE ECHO / Morphing Spectre
      ctx.fillStyle = color;
      ctx.globalAlpha = pulseAlpha;

      // Spectral head
      ctx.beginPath();
      ctx.arc(w / 2, h - 36, 6, 0, Math.PI * 2);
      ctx.fill();

      // Spectral drifting shroud
      ctx.beginPath();
      ctx.moveTo(w / 2 - 7, h - 32);
      ctx.lineTo(w / 2 + 7, h - 32);
      ctx.lineTo(w / 2 + 9 + Math.sin(time * 5) * 3, h - 8);
      ctx.lineTo(w / 2 - 9 + Math.cos(time * 5) * 3, h - 8);
      ctx.closePath();
      ctx.fill();

      // Glowing twin phosphor eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w / 2 - 3, h - 37, 2, 2);
      ctx.fillRect(w / 2 + 1, h - 37, 2, 2);
    }

    ctx.restore();
  }

  private drawProceduralTerminal(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    // Heavy beige/grey 1999 computer chassis
    ctx.fillStyle = '#222831';
    ctx.fillRect(4, h - 38, w - 8, 28);
    // Bevel
    ctx.fillStyle = '#393e46';
    ctx.fillRect(6, h - 36, w - 12, 24);

    // Curved CRT glass
    ctx.fillStyle = '#05070a';
    ctx.fillRect(9, h - 33, w - 18, 18);

    // Phosphor green screen scanline glow
    const flicker = 0.85 + Math.sin(time * 8) * 0.15;
    ctx.fillStyle = `rgba(0, 229, 255, ${flicker * 0.3})`;
    ctx.fillRect(10, h - 32, w - 20, 16);

    // Blinking green prompt cursor
    if (Math.sin(time * 6) > 0) {
      ctx.fillStyle = '#7cff9b';
      ctx.fillRect(13, h - 26, 4, 2);
    }

    // Keyboard & Floppy slot
    ctx.fillStyle = '#1e242d';
    ctx.fillRect(8, h - 8, w - 16, 6);
    ctx.fillStyle = '#05070a';
    ctx.fillRect(w - 14, h - 16, 6, 2); // 3.5" slot
  }

  private drawProceduralMirror(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    // Ornate antique bronze oval frame
    ctx.fillStyle = '#6b4f1d';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b08968';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - 5, h / 2 - 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tarnished, oxidized reflective glass
    ctx.fillStyle = '#17252a';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - 7, h / 2 - 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle ghostly sheen & crack in the glass
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 4, 10);
    ctx.lineTo(w / 2 + 3, h / 2);
    ctx.lineTo(w / 2 - 2, h - 12);
    ctx.stroke();

    // Eerie silhouette reflection appearing inside mirror
    if (Math.sin(time * 2) > 0.4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 3, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawProceduralClock(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    // Carved wood mantelpiece clock
    ctx.fillStyle = '#3a2312';
    ctx.fillRect(4, h - 34, w - 8, 30);
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(6, h - 32, w - 12, 26);

    // Clock face (ivory)
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(w / 2, h - 22, 9, 0, Math.PI * 2);
    ctx.fill();

    // Brass rim
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, h - 22, 9, 0, Math.PI * 2);
    ctx.stroke();

    // Clock hands frozen rigidly at 03:14
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Center
    ctx.moveTo(w / 2, h - 22);
    // Hour hand at 3
    ctx.lineTo(w / 2 + 5, h - 22);
    // Minute hand at 14 (approx 85 deg)
    ctx.moveTo(w / 2, h - 22);
    ctx.lineTo(w / 2 + 6, h - 20);
    ctx.stroke();

    // Brass pendulum frozen
    ctx.fillStyle = '#d97706';
    ctx.fillRect(w / 2 - 1, h - 11, 2, 7);
    ctx.beginPath();
    ctx.arc(w / 2, h - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawProceduralDesk(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Dark mahogany investigator desk
    ctx.fillStyle = '#22150c';
    ctx.fillRect(4, h - 26, w - 8, 22); // Body & drawers
    ctx.fillStyle = '#3f2615';
    ctx.fillRect(2, h - 30, w - 4, 6); // Top surface
    // Brass drawer handles
    ctx.fillStyle = '#d97706';
    ctx.fillRect(10, h - 18, 8, 2);
    ctx.fillRect(w - 18, h - 18, 8, 2);
    ctx.fillRect(10, h - 10, 8, 2);
    ctx.fillRect(w - 18, h - 10, 8, 2);

    // Papers / Memo on desk
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(12, h - 29, 10, 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(14, h - 28, 6, 1);
  }

  private drawProceduralBed(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Wooden bed frame
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(4, h - 46, w - 8, 42); // Headboard & rails
    ctx.fillStyle = '#5c381e';
    ctx.fillRect(4, h - 46, w - 8, 10); // Headboard top
    // Mattress & dusty blue blanket
    ctx.fillStyle = '#334155';
    ctx.fillRect(8, h - 34, w - 16, 28);
    // Folded quilt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(8, h - 20, w - 16, 14);
    // Pillow
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(12, h - 36, 18, 8);
    ctx.fillRect(w - 30, h - 36, 18, 8);
  }

  private drawProceduralHospitalBed(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Rusted hospital iron frame
    ctx.fillStyle = '#14382c';
    ctx.fillRect(4, h - 44, w - 8, 40);
    // Hospital mattress with faded green sheet
    ctx.fillStyle = '#225946';
    ctx.fillRect(8, h - 32, w - 16, 26);
    // Stained pillow
    ctx.fillStyle = '#ccfbf1';
    ctx.fillRect(10, h - 34, 20, 8);
    // Chrome guard rails
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, h - 32, w - 12, 10);
  }

  private drawProceduralDoor(ctx: CanvasRenderingContext2D, w: number, h: number, woodColor: string) {
    // Wooden / security door frame
    ctx.fillStyle = '#182029';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = woodColor;
    ctx.fillRect(3, 3, w - 6, h - 3);

    // Door panels
    ctx.fillStyle = '#1f150c';
    ctx.fillRect(6, 6, w - 12, 20);
    ctx.fillRect(6, 30, w - 12, 22);

    // Brass doorknob
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(w - 7, 34, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawProceduralPhone(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 4, w - 8, h - 8);
    // Rotary dial
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(w / 2, 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(w / 2, 14, 2, 0, Math.PI * 2);
    ctx.fill();
    // Handset
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, 2, w - 4, 4);
    // Coiled cord
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(w / 2, 20);
    ctx.lineTo(w / 2 - 2, 24);
    ctx.lineTo(w / 2 + 2, 27);
    ctx.lineTo(w / 2, 30);
    ctx.stroke();
  }

  private drawProceduralGenerator(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    // Industrial steel enclosure
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, 4, w - 4, h - 8);
    ctx.fillStyle = '#334155';
    ctx.fillRect(5, 7, w - 10, h - 14);

    // Breaker switch rows
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, 12 + i * 8, w - 16, 5);
      // Switches (green / red)
      const on = (i + Math.floor(time)) % 2 === 0;
      ctx.fillStyle = on ? '#22c55e' : '#ef4444';
      ctx.fillRect(on ? w - 18 : 10, 13 + i * 8, 4, 3);
    }
  }

  private drawProceduralServerRack(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
    // Server tower
    ctx.fillStyle = '#0b0f17';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(2, 2, w - 4, h - 4);

    // 1U blade units with blinking LEDs
    const blades = 7;
    for (let b = 0; b < blades; b++) {
      const by = 6 + b * 7;
      ctx.fillStyle = '#111827';
      ctx.fillRect(5, by, w - 10, 5);

      // Activity LEDs
      for (let led = 0; led < 4; led++) {
        const blink = Math.sin(time * 12 + b * 3 + led) > 0.3;
        ctx.fillStyle = blink ? '#00e5ff' : '#033f4a';
        ctx.fillRect(7 + led * 4, by + 2, 2, 2);
      }
    }
  }

  private drawWireframeBox(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, label: string) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    ctx.fillStyle = color;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, w / 2, h / 2);
  }
}

export const assetManager = RetroAssetManager.getInstance();
