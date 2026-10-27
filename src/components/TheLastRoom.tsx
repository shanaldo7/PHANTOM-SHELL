import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Compass,
  MessageSquare,
  Monitor,
  Sparkles,
  ArrowRight,
  Layers,
  Eye,
  Key,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { NarrativeEngine } from '../engine/narrativeEngine';
import { GhostlyMirrorOverlay } from './GhostlyMirrorOverlay';
import { AssetDiagnosticsModal } from './AssetDiagnosticsModal';
import { GhostCharacterId } from '../engine/ghostChatService';
import { worldStateManager, HauntedRoom, RoomInteractable } from '../engine/worldState';
import { audioEngine } from '../engine/audioEngine';
import { assetManager } from '../engine/assetManager';
import { drawPixelRoom } from '../engine/pixelArtRoomRenderer';

interface TheLastRoomProps {
  onOpenTerminal: () => void;
  ghostMood: string;
  ghostTrust: number;
  narrative?: NarrativeEngine;
  onTriggerStoryFlag?: (flag: string) => void;
  onTriggerSound?: (type: 'click' | 'ghost' | 'error' | 'success') => void;
  onOpenDialogue?: (character?: GhostCharacterId) => void;
  onOpenMap?: () => void;
}

interface PlayerState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'down' | 'up' | 'left' | 'right';
  isMoving: boolean;
  walkFrame: number;
  animTimer: number;
}

interface InteractiveEntity {
  id: string;
  name: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'object' | 'ghost' | 'door';
  action: () => void;
  doorTarget?: string;
  ghostId?: GhostCharacterId;
}

export const TheLastRoom: React.FC<TheLastRoomProps> = ({
  onOpenTerminal,
  ghostMood,
  ghostTrust,
  narrative,
  onTriggerStoryFlag,
  onTriggerSound,
  onOpenDialogue,
  onOpenMap
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeRoomId, setActiveRoomId] = useState<string>(worldStateManager.activeRoomId || 'last_room');
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isInspectingMirror, setIsInspectingMirror] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [hoveredPrompt, setHoveredPrompt] = useState<{ label: string; action: () => void } | null>(null);
  const [flashlightEnabled, setFlashlightEnabled] = useState(true);

  // Player state
  const playerRef = useRef<PlayerState>({
    x: 180,
    y: 190,
    targetX: 180,
    targetY: 190,
    facing: 'up',
    isMoving: false,
    walkFrame: 0,
    animTimer: 0
  });

  // Track active keys pressed
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const lastStepSoundTime = useRef<number>(0);

  const currentRoom: HauntedRoom =
    worldStateManager.rooms[activeRoomId] || worldStateManager.rooms.last_room;

  // Sound triggering helper
  const triggerAudio = useCallback((type: 'click' | 'ghost' | 'error' | 'success') => {
    if (onTriggerSound) {
      onTriggerSound(type);
    } else {
      if (type === 'click') audioEngine.playKeyClick();
      else if (type === 'ghost') audioEngine.playGhostWhisper();
      else if (type === 'success') audioEngine.playSuccess();
      else if (type === 'error') audioEngine.playErrorTone();
    }
  }, [onTriggerSound]);

  const handleInspectMirror = () => {
    setIsInspectingMirror(true);
    if (narrative) {
      narrative.triggerStoryFlag('The Girl in the Mirror');
    }
    if (onTriggerStoryFlag) {
      onTriggerStoryFlag('The Girl in the Mirror');
    }
    triggerAudio('ghost');
  };

  const handleSpeakWithGhost = (characterId?: GhostCharacterId) => {
    const targetChar = characterId || currentRoom.primaryGhost;
    if (onOpenDialogue) {
      onOpenDialogue(targetChar);
    }
    triggerAudio('ghost');
  };

  const handleTravelToRoom = (targetId: string) => {
    const res = worldStateManager.travelToRoom(targetId);
    if (res.success) {
      setActiveRoomId(targetId);
      // Reset player position near entry door
      playerRef.current.x = 240;
      playerRef.current.y = 210;
      playerRef.current.targetX = 240;
      playerRef.current.targetY = 210;
      triggerAudio('success');
      setModalMessage(res.message);
    } else {
      triggerAudio('error');
      setModalMessage(res.message);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when in input elements
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      keysPressed.current[e.key.toLowerCase()] = true;

      // Hotkey [E] or [Space] or [Enter] triggers hovered action
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        if (hoveredPrompt) {
          e.preventDefault();
          hoveredPrompt.action();
        }
      }

      // Hotkey [F] toggles flashlight
      if (e.key === 'f' || e.key === 'F') {
        setFlashlightEnabled(prev => !prev);
        triggerAudio('click');
      }

      // Hotkey [F2] or [~] toggles diagnostics
      if (e.key === 'F2' || e.key === '`') {
        setIsDiagnosticsOpen(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hoveredPrompt, triggerAudio]);

  // Main 2D Pixel-Art Game Loop & Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animId: number;
    let startTime = performance.now();

    // Internal virtual resolution: 480 x 270 (16:9 pixel-perfect retro resolution)
    const V_WIDTH = 480;
    const V_HEIGHT = 270;
    canvas.width = V_WIDTH;
    canvas.height = V_HEIGHT;

    // Build room interactable entities with coordinates
    const getRoomEntities = (): InteractiveEntity[] => {
      const entities: InteractiveEntity[] = [];

      if (activeRoomId === 'last_room') {
        // 1. Phosphor CRT Terminal (on Desk)
        entities.push({
          id: 'terminal',
          name: 'Phosphor CRT Terminal',
          prompt: 'ACCESS TERMINAL CLI',
          x: 215,
          y: 95,
          width: 50,
          height: 40,
          type: 'object',
          action: () => {
            triggerAudio('click');
            onOpenTerminal();
          }
        });

        // 2. Tarnished Antique Mirror
        entities.push({
          id: 'mirror',
          name: 'Tarnished Mirror',
          prompt: 'LOOK INTO MIRROR',
          x: 48,
          y: 75,
          width: 36,
          height: 54,
          type: 'object',
          action: handleInspectMirror
        });

        // 3. Mantelpiece Clock
        entities.push({
          id: 'clock',
          name: 'Mantelpiece Clock (03:14 AM)',
          prompt: 'CHECK TIME',
          x: 400,
          y: 65,
          width: 34,
          height: 42,
          type: 'object',
          action: () => {
            triggerAudio('ghost');
            setModalMessage(
              'The brass pendulum is frozen. The hands point rigidly to 03:14 AM. As you stare, the second hand twitches backward once with a metallic snap.'
            );
          }
        });

        // 4. Desk Drawer
        entities.push({
          id: 'desk_drawer',
          name: 'Desk Drawer',
          prompt: 'SEARCH DRAWER',
          x: 275,
          y: 135,
          width: 32,
          height: 25,
          type: 'object',
          action: () => {
            triggerAudio('success');
            if (narrative) narrative.triggerStoryFlag('Discovered Thorne Memo');
            if (onTriggerStoryFlag) onTriggerStoryFlag('Discovered Thorne Memo');
            setModalMessage(
              'Inside lies a handwritten memorandum by Dr. Thorne: "Project MORPHEUS: Memory isn\'t a recording of what happened. It is the cage built around the observer."'
            );
          }
        });

        // 5. Door to Long Corridor
        entities.push({
          id: 'door_corridor',
          name: 'Door 101 to Long Corridor',
          prompt: 'EXIT TO CORRIDOR',
          x: 38,
          y: 200,
          width: 36,
          height: 55,
          type: 'door',
          action: () => handleTravelToRoom('corridor'),
          doorTarget: 'corridor'
        });

        // 6. Spectral Ghost Apparition (THE ECHO)
        entities.push({
          id: 'ghost_echo',
          name: 'THE ECHO',
          prompt: 'COMMUNE WITH THE ECHO',
          x: 140,
          y: 110,
          width: 34,
          height: 50,
          type: 'ghost',
          action: () => handleSpeakWithGhost('echo'),
          ghostId: 'echo'
        });
      } else {
        // Dynamic interactable mapping for all other rooms
        currentRoom.interactables.forEach((item, idx) => {
          const ix = 80 + (idx * 80) % 320;
          const iy = 100 + Math.floor(idx / 4) * 45;
          entities.push({
            id: item.id,
            name: item.name,
            prompt: item.prompt.toUpperCase(),
            x: ix,
            y: iy,
            width: 36,
            height: 40,
            type: 'object',
            action: () => {
              if (item.id === 'mirror' || item.id === 'antique_mirror') {
                handleInspectMirror();
              } else if (item.spectralReaction) {
                triggerAudio('ghost');
                if (item.rewardFlag && narrative) narrative.triggerStoryFlag(item.rewardFlag);
                if (item.rewardFlag && onTriggerStoryFlag) onTriggerStoryFlag(item.rewardFlag);
                setModalMessage(`${item.description}\n\n[SPECTRAL RESPONSE]: ${item.spectralReaction}`);
              } else {
                triggerAudio('click');
                setModalMessage(item.description);
              }
            }
          });
        });

        // Primary ghost for the room
        entities.push({
          id: `ghost_${currentRoom.primaryGhost}`,
          name: currentRoom.primaryGhost.toUpperCase(),
          prompt: `COMMUNE WITH ${currentRoom.primaryGhost.toUpperCase()}`,
          x: 340,
          y: 115,
          width: 34,
          height: 50,
          type: 'ghost',
          action: () => handleSpeakWithGhost(currentRoom.primaryGhost),
          ghostId: currentRoom.primaryGhost
        });

        // Doors connecting to other rooms
        currentRoom.doors.forEach((door, idx) => {
          const dx = 40 + idx * 75;
          entities.push({
            id: `door_${door.targetRoomId}`,
            name: door.label,
            prompt: `ENTER: ${door.label}`,
            x: dx,
            y: 205,
            width: 36,
            height: 50,
            type: 'door',
            action: () => handleTravelToRoom(door.targetRoomId),
            doorTarget: door.targetRoomId
          });
        });
      }

      return entities;
    };

    // Render loop
    const render = (now: number) => {
      const time = (now - startTime) / 1000;
      const player = playerRef.current;
      const entities = getRoomEntities();

      // -----------------------------------------------------------
      // 1. UPDATE PLAYER MOVEMENT (WASD / Arrow Keys or Click Path)
      // -----------------------------------------------------------
      let dx = 0;
      let dy = 0;
      const speed = 1.6;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
        dy -= speed;
        player.facing = 'up';
      }
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
        dy += speed;
        player.facing = 'down';
      }
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
        dx -= speed;
        player.facing = 'left';
      }
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
        dx += speed;
        player.facing = 'right';
      }

      // If moving via mouse click
      if (dx === 0 && dy === 0) {
        const toTargetX = player.targetX - player.x;
        const toTargetY = player.targetY - player.y;
        const dist = Math.hypot(toTargetX, toTargetY);
        if (dist > 2) {
          dx = (toTargetX / dist) * speed;
          dy = (toTargetY / dist) * speed;
          if (Math.abs(toTargetX) > Math.abs(toTargetY)) {
            player.facing = toTargetX > 0 ? 'right' : 'left';
          } else {
            player.facing = toTargetY > 0 ? 'down' : 'up';
          }
        }
      }

      // Room boundary collision bounds
      const minX = 40;
      const maxX = V_WIDTH - 40;
      const minY = 90;
      const maxY = V_HEIGHT - 30;

      const newX = Math.max(minX, Math.min(maxX, player.x + dx));
      const newY = Math.max(minY, Math.min(maxY, player.y + dy));

      const isActuallyMoving = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;
      player.isMoving = isActuallyMoving;
      player.x = newX;
      player.y = newY;

      // Animate walk frames
      if (isActuallyMoving) {
        player.animTimer += 0.18;
        player.walkFrame = (Math.floor(player.animTimer) % 3);

        // Footstep audio click every few steps
        if (now - lastStepSoundTime.current > 380) {
          lastStepSoundTime.current = now;
          audioEngine.playKeyClick();
        }
      } else {
        player.walkFrame = 0;
      }

      // -----------------------------------------------------------
      // 2. CHECK PROXIMITY TO INTERACTABLES
      // -----------------------------------------------------------
      let closestEntity: InteractiveEntity | null = null;
      let minDistance = 45; // Interaction distance

      for (const ent of entities) {
        const entCenterX = ent.x + ent.width / 2;
        const entCenterY = ent.y + ent.height / 2;
        const d = Math.hypot(player.x - entCenterX, player.y - entCenterY);
        if (d < minDistance) {
          minDistance = d;
          closestEntity = ent;
        }
      }

      if (closestEntity) {
        setHoveredPrompt({
          label: `${closestEntity.prompt} [E]`,
          action: closestEntity.action
        });
      } else {
        setHoveredPrompt(null);
      }

      // -----------------------------------------------------------
      // 3. DRAW 2D RETRO ENVIRONMENT (Room backdrop)
      // -----------------------------------------------------------
      ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

      // Render base pixel-art room
      drawPixelRoom(activeRoomId, {
        ctx,
        width: V_WIDTH,
        height: V_HEIGHT,
        time,
        powerOn: true,
        waterDrained: false,
        playerPos: { x: player.x, y: player.y }
      });

      // -----------------------------------------------------------
      // 4. DRAW OBJECTS & FURNITURE (Using Centralized Asset Manager)
      // -----------------------------------------------------------
      if (activeRoomId === 'last_room') {
        // Draw mahogany desk
        assetManager.drawAsset(ctx, 'obj_desk', 200, 105, 64, 40, time);
        // Draw CRT terminal on desk
        assetManager.drawAsset(ctx, 'obj_terminal', 215, 78, 36, 36, time);
        // Draw tarnished mirror on left wall
        assetManager.drawAsset(ctx, 'obj_mirror', 48, 65, 34, 52, time);
        // Draw mantelpiece clock on right wall
        assetManager.drawAsset(ctx, 'obj_clock', 400, 60, 30, 38, time);
        // Draw door to corridor
        assetManager.drawAsset(ctx, 'obj_door_wood', 38, 195, 36, 56, time);
        // Draw THE ECHO ghost
        assetManager.drawAsset(ctx, 'ghost_echo', 140, 95, 32, 48, time);
      } else {
        // Generic room entities
        entities.forEach(ent => {
          if (ent.type === 'door') {
            assetManager.drawAsset(ctx, 'obj_door_wood', ent.x, ent.y, ent.width, ent.height, time);
          } else if (ent.type === 'ghost' && ent.ghostId) {
            assetManager.drawAsset(ctx, `ghost_${ent.ghostId}`, ent.x, ent.y, ent.width, ent.height, time);
          }
        });
      }

      // Draw interaction highlights / reticles over nearby entities
      if (closestEntity) {
        const pulse = 0.5 + Math.sin(time * 6) * 0.5;
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 + pulse * 0.6})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(closestEntity.x - 2, closestEntity.y - 2, closestEntity.width + 4, closestEntity.height + 4);

        // Reticle corners
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(closestEntity.x - 3, closestEntity.y - 3, 3, 3);
        ctx.fillRect(closestEntity.x + closestEntity.width, closestEntity.y - 3, 3, 3);
        ctx.fillRect(closestEntity.x - 3, closestEntity.y + closestEntity.height, 3, 3);
        ctx.fillRect(closestEntity.x + closestEntity.width, closestEntity.y + closestEntity.height, 3, 3);
      }

      // -----------------------------------------------------------
      // 5. DRAW PLAYER INVESTIGATOR SPRITE (From Asset Manager)
      // -----------------------------------------------------------
      const playerSpriteId = `player_${player.facing}_${player.walkFrame}`;
      assetManager.drawAsset(ctx, playerSpriteId, player.x - 16, player.y - 42, 32, 48, time);

      // -----------------------------------------------------------
      // 6. HORROR LIGHTING & FLASHLIGHT PASS (Canvas composite)
      // -----------------------------------------------------------
      if (flashlightEnabled) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';

        // Dark ambient overlay with darkness
        const lightCanvas = document.createElement('canvas');
        lightCanvas.width = V_WIDTH;
        lightCanvas.height = V_HEIGHT;
        const lctx = lightCanvas.getContext('2d')!;

        // Fill pitch black room shadow
        lctx.fillStyle = 'rgba(7, 10, 15, 0.78)';
        lctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        // Flashlight beam cutout using destination-out
        lctx.globalCompositeOperation = 'destination-out';

        // 1. Ambient circle around player
        const playerGlow = lctx.createRadialGradient(player.x, player.y - 18, 4, player.x, player.y - 18, 38);
        playerGlow.addColorStop(0, 'rgba(0, 0, 0, 1)');
        playerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        lctx.fillStyle = playerGlow;
        lctx.beginPath();
        lctx.arc(player.x, player.y - 18, 38, 0, Math.PI * 2);
        lctx.fill();

        // 2. Directional Flashlight Cone
        let coneAngle = 0;
        if (player.facing === 'down') coneAngle = Math.PI / 2;
        else if (player.facing === 'up') coneAngle = -Math.PI / 2;
        else if (player.facing === 'left') coneAngle = Math.PI;
        else if (player.facing === 'right') coneAngle = 0;

        const coneDist = 110;
        const spread = 0.45; // Cone width angle
        lctx.beginPath();
        lctx.moveTo(player.x, player.y - 20);
        lctx.arc(player.x, player.y - 20, coneDist, coneAngle - spread, coneAngle + spread);
        lctx.closePath();
        lctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        lctx.fill();

        // 3. Phosphor terminal ambient glow
        const termGlow = lctx.createRadialGradient(235, 95, 2, 235, 95, 45);
        termGlow.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
        termGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        lctx.fillStyle = termGlow;
        lctx.beginPath();
        lctx.arc(235, 95, 45, 0, Math.PI * 2);
        lctx.fill();

        ctx.drawImage(lightCanvas, 0, 0);
        ctx.restore();
      }

      // -----------------------------------------------------------
      // 7. DRIFTING DUST & SPECTRAL PARTICLES
      // -----------------------------------------------------------
      ctx.fillStyle = 'rgba(167, 139, 250, 0.45)';
      for (let p = 0; p < 8; p++) {
        const px = (Math.sin(time * 0.4 + p * 2.1) * 0.5 + 0.5) * V_WIDTH;
        const py = ((time * 12 + p * 40) % V_HEIGHT);
        ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeRoomId, flashlightEnabled, triggerAudio, onOpenTerminal]);

  // Click on canvas to move player / interact
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Set player movement target
    playerRef.current.targetX = clickX;
    playerRef.current.targetY = clickY;

    // If an action was hovered, trigger it directly!
    if (hoveredPrompt) {
      hoveredPrompt.action();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#030508] select-none overflow-hidden font-mono flex flex-col justify-between"
    >
      {/* 2D RETRO CANVAS VIEW (CRISP 16-BIT RETRO SCALING) */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain block [image-rendering:pixelated] cursor-crosshair"
        />

        {/* Floating Reticle Interaction Prompt */}
        {hoveredPrompt && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
            <div className="px-4 py-2 rounded-full bg-[#05080c]/95 border border-[#00e5ff] text-[#00e5ff] text-xs font-bold tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)] backdrop-blur-md flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7cff9b]" />
              <span>{hoveredPrompt.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* TOP HUD BAR: Room info, Commune, Terminal, Diagnostics */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 flex-wrap gap-2">
        <div className="flex items-center space-x-3 pointer-events-auto bg-[#070b10]/90 border border-[#00e5ff]/30 px-3 py-1.5 rounded backdrop-blur-md shadow-[0_0_15px_rgba(0,229,255,0.15)]">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#00e5ff] px-1.5 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30">
              {currentRoom.code}
            </span>
            <span className="text-xs font-bold text-white tracking-wider">
              {currentRoom.title}
            </span>
          </div>
          <span className="text-[10px] text-[#64748b] hidden md:inline">
            // {currentRoom.subtitle}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Flashlight toggle */}
          <button
            onClick={() => {
              setFlashlightEnabled(!flashlightEnabled);
              triggerAudio('click');
            }}
            title="Toggle Flashlight [F]"
            className={`px-2.5 py-1 rounded text-[11px] flex items-center space-x-1.5 border transition-all cursor-pointer backdrop-blur-md ${
              flashlightEnabled
                ? 'bg-[#fef08a]/15 border-[#fef08a]/40 text-[#fef08a]'
                : 'bg-[#090e15]/80 border-[#334155] text-[#64748b]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">LIGHT</span>
          </button>

          {/* Developer Asset Pipeline Diagnostics */}
          <button
            onClick={() => {
              triggerAudio('click');
              setIsDiagnosticsOpen(true);
            }}
            title="Developer Asset Pipeline Diagnostics [F2]"
            className="px-2.5 py-1 rounded bg-[#090e15]/90 border border-[#00e5ff]/40 text-[#00e5ff] text-[11px] flex items-center space-x-1 hover:bg-[#00e5ff]/20 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            <Layers className="w-3 h-3" />
            <span>DIAGNOSTICS</span>
          </button>

          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="px-2.5 py-1 rounded bg-[#090e15]/90 border border-[#58d9ff]/40 text-[#58d9ff] text-[11px] flex items-center space-x-1 hover:bg-[#58d9ff]/20 transition-all cursor-pointer backdrop-blur-md"
            >
              <Compass className="w-3 h-3" />
              <span>MAP</span>
            </button>
          )}

          <button
            onClick={() => handleSpeakWithGhost()}
            className="px-2.5 py-1 rounded bg-[#a78bfa]/20 border border-[#a78bfa]/50 text-[#a78bfa] text-[11px] flex items-center space-x-1 hover:bg-[#a78bfa]/30 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_10px_rgba(167,139,250,0.2)]"
          >
            <MessageSquare className="w-3 h-3" />
            <span>COMMUNE</span>
          </button>

          <button
            onClick={onOpenTerminal}
            className="px-2.5 py-1 rounded bg-[#7cff9b]/20 border border-[#7cff9b]/50 text-[#7cff9b] text-[11px] flex items-center space-x-1 hover:bg-[#7cff9b]/30 transition-all cursor-pointer backdrop-blur-md shadow-[0_0_10px_rgba(124,255,155,0.2)]"
          >
            <Monitor className="w-3 h-3" />
            <span>TERMINAL</span>
          </button>
        </div>
      </div>

      {/* BOTTOM WALKWAY & DOOR NAVIGATION BAR */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20 flex-wrap gap-2">
        <div className="flex items-center space-x-2 pointer-events-auto overflow-x-auto max-w-2xl py-1">
          {currentRoom.doors.map(door => (
            <button
              key={door.targetRoomId}
              onClick={() => handleTravelToRoom(door.targetRoomId)}
              className="px-2.5 py-1 rounded bg-[#070b10]/90 border border-[#7cff9b]/30 text-white text-[10px] flex items-center space-x-1 hover:border-[#7cff9b] hover:text-[#7cff9b] transition-all cursor-pointer backdrop-blur-md"
            >
              <ArrowRight className="w-3 h-3 text-[#7cff9b]" />
              <span>{door.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[10px] text-[#94a3b8] bg-[#070b10]/90 px-2.5 py-1 rounded border border-[#1e293b] hidden sm:block">
          WASD to Walk // Press <span className="text-[#00e5ff] font-bold">[E]</span> or Click to Interact
        </div>
      </div>

      {/* MODAL MESSAGE / LORE OVERLAY */}
      {modalMessage && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#070b10] border border-[#00e5ff]/50 rounded p-5 space-y-4 shadow-[0_0_30px_rgba(0,229,255,0.25)]">
            <div className="flex items-center space-x-2 text-[#00e5ff] text-xs font-bold tracking-wider border-b border-[#00e5ff]/20 pb-2">
              <Sparkles className="w-4 h-4" />
              <span>PHYSICAL PHENOMENON LOGGED</span>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
              {modalMessage}
            </p>
            <button
              onClick={() => setModalMessage(null)}
              className="w-full py-2 rounded bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40 hover:bg-[#00e5ff]/25 transition-all text-xs font-bold cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* GHOSTLY MIRROR DISTORTION OVERLAY */}
      {isInspectingMirror && (
        <GhostlyMirrorOverlay
          isOpen={isInspectingMirror}
          onClose={() => setIsInspectingMirror(false)}
          onOpenTerminal={onOpenTerminal}
        />
      )}

      {/* DEVELOPER ASSET DIAGNOSTICS MODAL */}
      <AssetDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
};
