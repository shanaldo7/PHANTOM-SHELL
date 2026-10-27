import React, { useEffect, useRef, useState } from 'react';
import { drawPixelRoom } from '../engine/pixelArtRoomRenderer';
import { RoomInteractable } from '../engine/worldState';

interface RetroPixelRoomCanvasProps {
  roomId: string;
  roomTitle?: string;
  roomCode?: string;
  isCurrent?: boolean;
  isUnlocked?: boolean;
  interactive?: boolean;
  interactables?: RoomInteractable[];
  onInteract?: (item: RoomInteractable) => void;
  onClick?: () => void;
  className?: string;
}

export const RetroPixelRoomCanvas: React.FC<RetroPixelRoomCanvasProps> = ({
  roomId,
  roomTitle,
  roomCode,
  isCurrent = false,
  isUnlocked = true,
  interactive = false,
  interactables = [],
  onInteract,
  onClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const [hoveredObject, setHoveredObject] = useState<RoomInteractable | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use crisp pixel rendering
    ctx.imageSmoothingEnabled = false;

    let startTime = performance.now();

    const render = (now: number) => {
      const time = (now - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Render pixel art room
      drawPixelRoom(roomId, {
        ctx,
        width,
        height,
        time,
        powerOn: true,
        waterDrained: false
      });

      // If interactive, draw clickable hotspot indicator markers
      if (interactive && interactables.length > 0) {
        interactables.forEach((item, idx) => {
          // Spread hotspots sensibly across room
          const hx = width * (0.2 + (idx * 0.22) % 0.65);
          const hy = height * (0.45 + (idx * 0.15) % 0.35);

          const pulse = 0.5 + Math.sin(time * 4 + idx) * 0.5;
          ctx.strokeStyle = `rgba(124, 255, 155, ${0.4 + pulse * 0.5})`;
          ctx.lineWidth = 1;
          
          // Draw retro pixel reticle [ + ]
          ctx.strokeRect(hx - 4, hy - 4, 8, 8);
          ctx.fillStyle = '#7CFF9B';
          ctx.fillRect(hx - 1, hy - 1, 2, 2);
        });
      }

      // If locked, overlay dark glitch pattern
      if (!isUnlocked) {
        ctx.fillStyle = 'rgba(5, 7, 10, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px monospace';
        ctx.fillText('LOCKED // SECTOR SEALED', 12, height / 2);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [roomId, isUnlocked, interactive, interactables]);

  return (
    <div
      onClick={onClick}
      className={`relative group overflow-hidden cursor-pointer bg-black select-none border transition-all duration-200 ${
        isCurrent
          ? 'border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
          : 'border-[#1b2a38] hover:border-[#406882]'
      } ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={180}
        className="w-full h-full object-cover block [image-rendering:pixelated]"
      />

      {/* Label under or overlaying card matching screenshot */}
      {(roomCode || roomTitle) && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#05080c]/90 px-2 py-1 flex items-center justify-between border-t border-[#13222e]">
          <span className="text-[10px] font-mono tracking-wider text-[#b0c4de] uppercase truncate font-bold">
            {roomCode ? `${roomCode}. ` : ''}
            {roomTitle || roomId}
          </span>
          {isCurrent && (
            <span className="text-[8px] font-mono px-1.5 py-0.2 bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 rounded-xs uppercase tracking-widest animate-pulse">
              ACTIVE
            </span>
          )}
        </div>
      )}
    </div>
  );
};
