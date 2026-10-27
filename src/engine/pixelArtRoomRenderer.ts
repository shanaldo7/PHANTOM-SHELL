/**
 * High-fidelity Retro 2D Pixel Art Scene Renderer
 * Generates authentic 90s/early 2000s psychological horror pixel art for all 15+ rooms
 * matching the visual style in the reference capture.
 */

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  isInspecting?: boolean;
  powerOn?: boolean;
  waterDrained?: boolean;
  playerPos?: { x: number; y: number };
  ghostGlitchIntensity?: number;
}

export function drawPixelRoom(roomId: string, rCtx: RenderContext) {
  const { ctx, width, height, time } = rCtx;

  // Clear background with deep void black/navy
  ctx.fillStyle = '#030508';
  ctx.fillRect(0, 0, width, height);

  switch (roomId) {
    case 'corridor':
    case 'room_01':
    case '01':
      drawLongCorridor(rCtx);
      break;

    case 'bedroom':
    case 'room_02':
    case '02':
      drawForgottenBedroom(rCtx);
      break;

    case 'apartment':
    case 'room_03':
    case '03':
      drawFloodedApartment(rCtx);
      break;

    case 'school':
    case 'room_04':
    case '04':
      drawSchoolWithNoStudents(rCtx);
      break;

    case 'hospital':
    case 'room_05':
    case '05':
      drawHospitalUnfinishedNames(rCtx);
      break;

    case 'archive':
    case 'room_06':
    case '06':
      drawFloodedArchive(rCtx);
      break;

    case 'cinema':
    case 'room_07':
    case '07':
      drawAbandonedCinema(rCtx);
      break;

    case 'station':
    case 'room_08':
    case '08':
      drawAbandonedTrainStation(rCtx);
      break;

    case 'mirror_gallery':
    case 'room_09':
    case '09':
      drawMirrorGallery(rCtx);
      break;

    case 'generator':
    case 'room_10':
    case '10':
      drawBasementGenerator(rCtx);
      break;

    case 'server_cathedral':
    case 'room_11':
    case '11':
      drawServerCathedral(rCtx);
      break;

    case 'hotel':
    case 'room_12':
    case '12':
      drawLoopingHotel(rCtx);
      break;

    case 'rooftop':
    case 'room_13':
    case '13':
      drawRooftopOfStatic(rCtx);
      break;

    case 'memory_garden':
    case 'room_14':
    case '14':
      drawMemoryGarden(rCtx);
      break;

    case 'morpheus_core':
    case 'room_15':
    case '15':
      drawMorpheusCore(rCtx);
      break;

    case 'last_room':
    default:
      drawTheLastRoom(rCtx);
      break;
  }

  // Draw subtle pixel CRT scanline & vignette pass
  drawPixelVignetteAndScanlines(ctx, width, height, time);
}

// -------------------------------------------------------------
// ROOM 01: THE LONG CORRIDOR
// -------------------------------------------------------------
function drawLongCorridor({ ctx, width, height, time }: RenderContext) {
  const cx = width / 2;
  const cy = height * 0.45;
  const flicker = Math.sin(time * 8) > 0.92 ? 0.4 : 1.0;

  // Ceiling
  const gradCeiling = ctx.createLinearGradient(0, 0, 0, cy);
  gradCeiling.addColorStop(0, '#10151c');
  gradCeiling.addColorStop(1, '#05070a');
  ctx.fillStyle = gradCeiling;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(cx + 25, cy);
  ctx.lineTo(cx - 25, cy);
  ctx.closePath();
  ctx.fill();

  // Floor with reflections
  const gradFloor = ctx.createLinearGradient(0, cy, 0, height);
  gradFloor.addColorStop(0, '#0a0d11');
  gradFloor.addColorStop(1, '#1b1816');
  ctx.fillStyle = gradFloor;
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy);
  ctx.lineTo(cx + 25, cy);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Perspective floor tiles/boards
  ctx.strokeStyle = '#1f2429';
  ctx.lineWidth = 1;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 5, cy);
    ctx.lineTo(cx + i * 42, height);
    ctx.stroke();
  }

  // Walls (damask/wood wainscoting)
  // Left wall
  ctx.fillStyle = '#181512';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(cx - 25, cy);
  ctx.lineTo(cx - 25, cy + 20);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Right wall
  ctx.fillStyle = '#141210';
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(cx + 25, cy);
  ctx.lineTo(cx + 25, cy + 20);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Doors on left wall (perspective)
  ctx.fillStyle = '#0c0a09';
  ctx.fillRect(8, 22, 18, 55);
  ctx.fillRect(36, 32, 14, 40);
  ctx.fillRect(58, 38, 10, 30);

  // Door frames (gold/brass trim)
  ctx.strokeStyle = '#382a1d';
  ctx.strokeRect(8, 22, 18, 55);
  ctx.strokeRect(36, 32, 14, 40);
  ctx.strokeRect(58, 38, 10, 30);

  // Doors on right wall
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(width - 26, 22, 18, 55);
  ctx.fillRect(width - 50, 32, 14, 40);
  ctx.fillRect(width - 68, 38, 10, 30);

  ctx.strokeStyle = '#382a1d';
  ctx.strokeRect(width - 26, 22, 18, 55);
  ctx.strokeRect(width - 50, 32, 14, 40);
  ctx.strokeRect(width - 68, 38, 10, 30);

  // Fluorescent overhead fixtures
  const lightY = [cy * 0.25, cy * 0.55, cy * 0.85];
  lightY.forEach((ly, idx) => {
    const scale = 1 - idx * 0.3;
    const lw = 28 * scale;
    ctx.fillStyle = idx === 0 && flicker < 0.8 ? '#406070' : '#d8f0ff';
    ctx.fillRect(cx - lw / 2, ly, lw, 3);

    // Light beam down
    const glow = ctx.createRadialGradient(cx, ly + 2, 2, cx, ly + 40, lw * 1.5);
    glow.addColorStop(0, `rgba(200, 240, 255, ${0.12 * flicker * scale})`);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - lw * 1.5, ly, lw * 3, height - ly);
  });

  // End of hallway doorway / void
  ctx.fillStyle = '#020406';
  ctx.fillRect(cx - 12, cy - 8, 24, 28);
  ctx.strokeStyle = '#182532';
  ctx.strokeRect(cx - 12, cy - 8, 24, 28);

  // Child / Investigator silhouette standing in perspective
  drawHumanSilhouette(ctx, cx, height * 0.72, 1.0, '#0a1017');
}

// -------------------------------------------------------------
// ROOM 02: THE FORGOTTEN BEDROOM
// -------------------------------------------------------------
function drawForgottenBedroom({ ctx, width, height, time }: RenderContext) {
  // Back wall (muted dusty blue/navy wallpaper)
  ctx.fillStyle = '#121722';
  ctx.fillRect(0, 0, width, height * 0.7);

  // Floor (wooden planks, warm mahogany/brown)
  const gradFloor = ctx.createLinearGradient(0, height * 0.7, 0, height);
  gradFloor.addColorStop(0, '#1c1510');
  gradFloor.addColorStop(1, '#2c1e16');
  ctx.fillStyle = gradFloor;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  // Floor plank lines
  ctx.strokeStyle = '#140e0b';
  for (let y = height * 0.7; y < height; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Large Blue Window (center right) with moonlight
  const wx = width * 0.52;
  const wy = 14;
  const ww = 42;
  const wh = 52;

  // Window frame & glass
  ctx.fillStyle = '#061628';
  ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = '#3a72a6';
  ctx.fillRect(wx + 2, wy + 2, ww - 4, wh - 4);

  // Window panes (crossbars)
  ctx.fillStyle = '#101d2d';
  ctx.fillRect(wx + ww / 2 - 1, wy, 2, wh);
  ctx.fillRect(wx, wy + wh / 2 - 1, ww, 2);

  // Starry moonlight & curtain ripples
  ctx.fillStyle = '#9fd2ff';
  ctx.fillRect(wx + 8, wy + 10, 2, 2);
  ctx.fillRect(wx + 26, wy + 18, 2, 2);
  ctx.fillRect(wx + 16, wy + 32, 2, 2);

  // Moonlight beam across floor
  ctx.fillStyle = 'rgba(70, 130, 190, 0.16)';
  ctx.beginPath();
  ctx.moveTo(wx, wy + wh);
  ctx.lineTo(wx + ww, wy + wh);
  ctx.lineTo(wx + ww + 40, height);
  ctx.lineTo(wx - 20, height);
  ctx.closePath();
  ctx.fill();

  // White lace curtains on window sides
  ctx.fillStyle = '#7a8e9f';
  ctx.fillRect(wx - 6, wy, 6, wh + 8);
  ctx.fillRect(wx + ww, wy, 6, wh + 8);

  // Bed on the left
  ctx.fillStyle = '#2d2218'; // Headboard
  ctx.fillRect(10, height * 0.52, 50, 28);
  ctx.fillStyle = '#4c3928'; // Bed frame
  ctx.fillRect(10, height * 0.65, 58, 14);
  // White/blue wrinkled quilt mattress
  ctx.fillStyle = '#223044';
  ctx.fillRect(14, height * 0.58, 52, 14);
  ctx.fillStyle = '#5c728e'; // Pillow
  ctx.fillRect(14, height * 0.54, 18, 8);

  // Bedside nightstand with small glowing amber lamp
  ctx.fillStyle = '#3a2515';
  ctx.fillRect(72, height * 0.6, 16, 18);
  // Lamp
  const lampFlicker = 0.85 + Math.sin(time * 6) * 0.1;
  ctx.fillStyle = '#ffe082';
  ctx.fillRect(77, height * 0.54, 6, 6);
  ctx.fillStyle = `rgba(255, 220, 130, ${0.18 * lampFlicker})`;
  ctx.beginPath();
  ctx.arc(80, height * 0.57, 24, 0, Math.PI * 2);
  ctx.fill();

  // Child's desk on the far right
  ctx.fillStyle = '#2e1c10';
  ctx.fillRect(width - 32, height * 0.58, 28, 20);
  ctx.fillStyle = '#1c1109';
  ctx.fillRect(width - 24, height * 0.65, 12, 12); // Chair

  // Posters & child drawings on wall
  ctx.fillStyle = '#28553f';
  ctx.fillRect(18, 18, 14, 18);
  ctx.fillStyle = '#6d3f2d';
  ctx.fillRect(36, 16, 16, 14);

  // Teddy bear / doll on floor
  ctx.fillStyle = '#9c5b36';
  ctx.fillRect(width * 0.48, height * 0.76, 6, 8);
  ctx.fillStyle = '#c77848';
  ctx.fillRect(width * 0.49, height * 0.74, 4, 4);

  // Silhouette standing in room looking toward the window
  drawHumanSilhouette(ctx, width * 0.42, height * 0.76, 1.0, '#0c1017');
}

// -------------------------------------------------------------
// ROOM 03: THE FLOODED APARTMENT
// -------------------------------------------------------------
function drawFloodedApartment({ ctx, width, height, time }: RenderContext) {
  // Walls (decaying wet plaster, dark teal/charcoal)
  ctx.fillStyle = '#0c161a';
  ctx.fillRect(0, 0, width, height * 0.6);

  // Water level covering floor (cyan/navy reflection)
  const waterY = height * 0.58;
  const gradWater = ctx.createLinearGradient(0, waterY, 0, height);
  gradWater.addColorStop(0, '#062028');
  gradWater.addColorStop(0.5, '#0d323e');
  gradWater.addColorStop(1, '#051419');
  ctx.fillStyle = gradWater;
  ctx.fillRect(0, waterY, width, height - waterY);

  // Animated water ripple lines
  ctx.strokeStyle = '#1b5b6e';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const ry = waterY + 6 + i * 8;
    const waveOffset = Math.sin(time * 3 + i * 1.5) * 4;
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.bezierCurveTo(width * 0.3 + waveOffset, ry - 1, width * 0.7 - waveOffset, ry + 1, width, ry);
    ctx.stroke();
  }

  // Living room couch / sofa on left
  ctx.fillStyle = '#222d2b';
  ctx.fillRect(12, height * 0.46, 48, 18);
  ctx.fillStyle = '#151f1c';
  ctx.fillRect(10, height * 0.50, 52, 14);

  // Hanging pendant ceiling lamp (center-left)
  ctx.strokeStyle = '#2d3e42';
  ctx.beginPath();
  ctx.moveTo(width * 0.48, 0);
  ctx.lineTo(width * 0.48, 22);
  ctx.stroke();
  // Lamp cone
  ctx.fillStyle = '#33484f';
  ctx.beginPath();
  ctx.moveTo(width * 0.48 - 6, 26);
  ctx.lineTo(width * 0.48 + 6, 26);
  ctx.lineTo(width * 0.48 + 2, 22);
  ctx.lineTo(width * 0.48 - 2, 22);
  ctx.closePath();
  ctx.fill();
  // Warm bulb
  ctx.fillStyle = '#ffdf94';
  ctx.fillRect(width * 0.48 - 2, 26, 4, 3);

  // Glowing CRT TV on small cart (right side)
  const tvX = width - 42;
  const tvY = height * 0.44;
  ctx.fillStyle = '#10171a';
  ctx.fillRect(tvX, tvY, 28, 24);
  // Screen with cyan static glow
  const tvGlow = 0.8 + Math.sin(time * 12) * 0.2;
  ctx.fillStyle = `rgba(80, 200, 255, ${0.9 * tvGlow})`;
  ctx.fillRect(tvX + 3, tvY + 3, 20, 16);
  // CRT scanlines on TV
  ctx.fillStyle = 'rgba(0, 30, 50, 0.4)';
  for (let s = tvY + 3; s < tvY + 19; s += 2) {
    ctx.fillRect(tvX + 3, s, 20, 1);
  }

  // Reflection of TV in water
  ctx.fillStyle = `rgba(60, 180, 230, ${0.25 * tvGlow})`;
  ctx.fillRect(tvX + 4, waterY + 4, 18, 12);

  // Silhouette standing in ankle-deep water
  drawHumanSilhouette(ctx, width * 0.5, height * 0.7, 1.0, '#071217');

  // Water ripples around silhouette feet
  ctx.strokeStyle = 'rgba(80, 220, 255, 0.4)';
  ctx.strokeRect(width * 0.5 - 6, height * 0.7 + 10, 12, 2);
}

// -------------------------------------------------------------
// ROOM 04: THE SCHOOL WITH NO STUDENTS
// -------------------------------------------------------------
function drawSchoolWithNoStudents({ ctx, width, height, time }: RenderContext) {
  // Back wall (chalkboard green / olive institutional)
  ctx.fillStyle = '#141c16';
  ctx.fillRect(0, 0, width, height * 0.65);

  // Wooden floor
  const gradFloor = ctx.createLinearGradient(0, height * 0.65, 0, height);
  gradFloor.addColorStop(0, '#1c1611');
  gradFloor.addColorStop(1, '#2b2016');
  ctx.fillStyle = gradFloor;
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Large Green Chalkboard (center)
  const cbX = 26;
  const cbY = 16;
  const cbW = 76;
  const cbH = 34;
  ctx.fillStyle = '#3a2717'; // Wooden border
  ctx.fillRect(cbX - 2, cbY - 2, cbW + 4, cbH + 4);
  ctx.fillStyle = '#193022'; // Slate surface
  ctx.fillRect(cbX, cbY, cbW, cbH);

  // Faint chalk text / diagrams on board
  ctx.fillStyle = 'rgba(230, 245, 230, 0.3)';
  ctx.fillRect(cbX + 8, cbY + 8, 24, 2);
  ctx.fillRect(cbX + 8, cbY + 14, 38, 2);
  ctx.fillRect(cbX + 8, cbY + 20, 18, 2);
  // Geometric triangle chalk drawing
  ctx.strokeStyle = 'rgba(230, 245, 230, 0.25)';
  ctx.beginPath();
  ctx.moveTo(cbX + 54, cbY + 10);
  ctx.lineTo(cbX + 66, cbY + 26);
  ctx.lineTo(cbX + 44, cbY + 26);
  ctx.closePath();
  ctx.stroke();

  // Classroom round analog clock above board
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(width * 0.5, 10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();
  // Clock hands frozen at 03:14
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width * 0.5, 10);
  ctx.lineTo(width * 0.5 + 4, 10);
  ctx.moveTo(width * 0.5, 10);
  ctx.lineTo(width * 0.5 + 2, 6);
  ctx.stroke();

  // Classroom door on right
  ctx.fillStyle = '#1e2424';
  ctx.fillRect(width - 28, 14, 22, height * 0.65 - 14);
  ctx.fillStyle = '#2f3b3b';
  ctx.strokeRect(width - 28, 14, 22, height * 0.65 - 14);
  // Frosted door glass
  ctx.fillStyle = '#546b6b';
  ctx.fillRect(width - 24, 20, 14, 18);

  // Rows of student desks
  const deskColors = ['#281e15', '#332418', '#3d2c1c'];
  // Back row desks
  for (let i = 0; i < 3; i++) {
    const dx = 16 + i * 36;
    const dy = height * 0.64;
    ctx.fillStyle = deskColors[0];
    ctx.fillRect(dx, dy, 18, 10);
  }
  // Front row desks
  for (let i = 0; i < 3; i++) {
    const dx = 12 + i * 38;
    const dy = height * 0.78;
    ctx.fillStyle = deskColors[1];
    ctx.fillRect(dx, dy, 24, 14);
    // Desk legs
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(dx + 2, dy + 14, 2, 6);
    ctx.fillRect(dx + 20, dy + 14, 2, 6);
  }

  // Student silhouette standing near the classroom door
  drawHumanSilhouette(ctx, width * 0.76, height * 0.68, 0.95, '#0b1411');
}

// -------------------------------------------------------------
// ROOM 05: THE HOSPITAL OF UNFINISHED NAMES
// -------------------------------------------------------------
function drawHospitalUnfinishedNames({ ctx, width, height, time }: RenderContext) {
  // Hospital wall (sickly institutional pale sage/green)
  ctx.fillStyle = '#15241e';
  ctx.fillRect(0, 0, width, height * 0.62);

  // Hospital linoleum floor
  const gradFloor = ctx.createLinearGradient(0, height * 0.62, 0, height);
  gradFloor.addColorStop(0, '#101a16');
  gradFloor.addColorStop(1, '#1a2a22');
  ctx.fillStyle = gradFloor;
  ctx.fillRect(0, height * 0.62, width, height * 0.38);

  // Privacy curtains suspended from ceiling
  ctx.fillStyle = '#22382e';
  ctx.fillRect(width * 0.28, 10, 4, height * 0.55);
  ctx.fillRect(width * 0.68, 10, 4, height * 0.55);

  // Hospital beds with metal frames and white sheets
  const bedPositions = [8, 54, width - 42];
  bedPositions.forEach((bx, idx) => {
    // Metal headboard
    ctx.fillStyle = '#5c786d';
    ctx.fillRect(bx, height * 0.54, 26, 16);
    // White mattress & blanket
    ctx.fillStyle = '#d2e3dc';
    ctx.fillRect(bx + 2, height * 0.60, 24, 12);
    // Bed frame & legs
    ctx.fillStyle = '#2e3d36';
    ctx.fillRect(bx + 2, height * 0.72, 2, 8);
    ctx.fillRect(bx + 22, height * 0.72, 2, 8);
  });

  // Glowing heart monitor / ECG oscilloscope on cart (right bed)
  const ecgX = width - 24;
  const ecgY = height * 0.44;
  ctx.fillStyle = '#0f1713';
  ctx.fillRect(ecgX, ecgY, 16, 14);
  // Green display
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(ecgX + 2, ecgY + 2, 12, 10);
  // ECG trace line
  ctx.strokeStyle = '#003318';
  ctx.lineWidth = 1;
  const pulse = Math.floor(time * 10) % 10;
  ctx.beginPath();
  ctx.moveTo(ecgX + 2, ecgY + 7);
  ctx.lineTo(ecgX + 5, ecgY + 7);
  if (pulse === 4) {
    ctx.lineTo(ecgX + 7, ecgY + 3);
    ctx.lineTo(ecgX + 9, ecgY + 11);
  }
  ctx.lineTo(ecgX + 14, ecgY + 7);
  ctx.stroke();

  // Silhouette doctor / patient standing between beds
  drawHumanSilhouette(ctx, width * 0.52, height * 0.68, 1.0, '#0d1814');
}

// -------------------------------------------------------------
// ROOM 06: THE FLOODED ARCHIVE
// -------------------------------------------------------------
function drawFloodedArchive({ ctx, width, height, time }: RenderContext) {
  // Towering bookshelves on left and right stretching up
  ctx.fillStyle = '#0a1419';
  ctx.fillRect(0, 0, width, height * 0.6);

  // Left bookcase
  ctx.fillStyle = '#1c242b';
  ctx.fillRect(0, 0, 36, height * 0.62);
  // Book rows
  ctx.fillStyle = '#2d3b47';
  for (let r = 8; r < height * 0.6; r += 10) {
    ctx.fillRect(2, r, 32, 2);
    // Colored book spines
    ctx.fillStyle = r % 20 === 0 ? '#486581' : '#334e68';
    ctx.fillRect(4, r - 6, 28, 6);
  }

  // Right bookcase
  ctx.fillStyle = '#182026';
  ctx.fillRect(width - 36, 0, 36, height * 0.62);
  for (let r = 8; r < height * 0.6; r += 10) {
    ctx.fillStyle = '#2d3b47';
    ctx.fillRect(width - 34, r, 32, 2);
    ctx.fillStyle = r % 20 === 0 ? '#334e68' : '#486581';
    ctx.fillRect(width - 32, r - 6, 28, 6);
  }

  // Flooded teal water surface covering the floor
  const waterY = height * 0.6;
  const gradWater = ctx.createLinearGradient(0, waterY, 0, height);
  gradWater.addColorStop(0, '#062029');
  gradWater.addColorStop(0.5, '#0b3947');
  gradWater.addColorStop(1, '#05151c');
  ctx.fillStyle = gradWater;
  ctx.fillRect(0, waterY, width, height - waterY);

  // Floating documents & papers on water
  ctx.fillStyle = 'rgba(200, 230, 240, 0.4)';
  ctx.fillRect(width * 0.28, waterY + 8, 8, 6);
  ctx.fillRect(width * 0.65, waterY + 14, 10, 7);

  // Distant glowing catalog terminal in center
  const termX = width * 0.5 - 10;
  const termY = height * 0.44;
  ctx.fillStyle = '#0e171c';
  ctx.fillRect(termX, termY, 20, 18);
  ctx.fillStyle = '#40e0d0'; // Glowing cyan terminal screen
  ctx.fillRect(termX + 3, termY + 3, 14, 10);

  // Reflection of terminal glow in water
  ctx.fillStyle = 'rgba(64, 224, 208, 0.2)';
  ctx.fillRect(termX + 2, waterY + 2, 16, 12);

  // Silhouette standing in aisle
  drawHumanSilhouette(ctx, width * 0.5, height * 0.7, 1.0, '#06131a');
}

// -------------------------------------------------------------
// ROOM 07: THE ABANDONED CINEMA
// -------------------------------------------------------------
function drawAbandonedCinema({ ctx, width, height, time }: RenderContext) {
  // Cinema hall background (deep burgundy/charcoal)
  ctx.fillStyle = '#140c10';
  ctx.fillRect(0, 0, width, height);

  // Giant glowing projector screen in front (with grainy black & white face)
  const scX = width * 0.24;
  const scY = 10;
  const scW = width * 0.52;
  const scH = height * 0.42;

  // Screen glow
  const flicker = 0.85 + Math.sin(time * 10) * 0.15;
  ctx.fillStyle = `rgba(180, 190, 200, ${0.85 * flicker})`;
  ctx.fillRect(scX, scY, scW, scH);

  // Spectral vintage face silhouette inside the screen projection
  ctx.fillStyle = '#3a3a40';
  // Head
  ctx.beginPath();
  ctx.arc(scX + scW / 2, scY + scH * 0.45, 12, 0, Math.PI * 2);
  ctx.fill();
  // Shoulders
  ctx.beginPath();
  ctx.ellipse(scX + scW / 2, scY + scH * 0.85, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Creepy empty eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(scX + scW / 2 - 5, scY + scH * 0.42, 3, 2);
  ctx.fillRect(scX + scW / 2 + 2, scY + scH * 0.42, 3, 2);

  // Projector beam down from upper ceiling
  ctx.fillStyle = 'rgba(230, 240, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(width * 0.5, 0);
  ctx.lineTo(scX, scY + scH);
  ctx.lineTo(scX + scW, scY + scH);
  ctx.closePath();
  ctx.fill();

  // Rows of red velvet theater seats in foreground
  const seatRows = [height * 0.60, height * 0.74, height * 0.88];
  seatRows.forEach((ry, rIdx) => {
    ctx.fillStyle = rIdx === 2 ? '#4a151b' : '#330e13';
    for (let c = 8; c < width - 8; c += 14) {
      // Seat cushion
      ctx.fillRect(c, ry, 11, 8);
      // Seat back
      ctx.fillRect(c + 1, ry - 6, 9, 6);
    }
  });

  // Silhouette standing in center theater aisle
  drawHumanSilhouette(ctx, width * 0.5, height * 0.74, 1.0, '#0a0507');
}

// -------------------------------------------------------------
// ROOM 08: THE ABANDONED TRAIN STATION
// -------------------------------------------------------------
function drawAbandonedTrainStation({ ctx, width, height, time }: RenderContext) {
  // Train platform background
  ctx.fillStyle = '#0a1017';
  ctx.fillRect(0, 0, width, height);

  // Train cars on the left
  const trainW = width * 0.42;
  ctx.fillStyle = '#222831';
  ctx.fillRect(0, 18, trainW, height * 0.7);
  // Red train stripe
  ctx.fillStyle = '#8b2635';
  ctx.fillRect(0, 36, trainW, 6);

  // Train windows glowing warm amber
  ctx.fillStyle = '#ffb347';
  for (let wx = 6; wx < trainW - 8; wx += 16) {
    ctx.fillRect(wx, 22, 10, 11);
  }

  // Station Platform (right side) with wet tiles
  const platX = trainW;
  const gradPlat = ctx.createLinearGradient(platX, height * 0.55, width, height);
  gradPlat.addColorStop(0, '#16202c');
  gradPlat.addColorStop(1, '#223040');
  ctx.fillStyle = gradPlat;
  ctx.fillRect(platX, height * 0.45, width - platX, height * 0.55);

  // Tile grid
  ctx.strokeStyle = '#0e151c';
  for (let y = height * 0.45; y < height; y += 8) {
    ctx.beginPath();
    ctx.moveTo(platX, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Yellow LED Departure schedule sign hanging from ceiling
  const signX = width * 0.65;
  const signY = 12;
  ctx.fillStyle = '#080808';
  ctx.fillRect(signX, signY, 34, 16);
  ctx.fillStyle = '#ffb703'; // Amber LED text
  ctx.fillRect(signX + 3, signY + 3, 20, 2);
  ctx.fillRect(signX + 3, signY + 7, 28, 2);
  ctx.fillRect(signX + 3, signY + 11, 16, 2);

  // Information kiosk / CRT monitor on platform
  const kioskX = width - 24;
  const kioskY = height * 0.5;
  ctx.fillStyle = '#1c242c';
  ctx.fillRect(kioskX, kioskY, 14, 22);
  ctx.fillStyle = '#8ecae6';
  ctx.fillRect(kioskX + 2, kioskY + 2, 10, 8);

  // Silhouette waiting on platform
  drawHumanSilhouette(ctx, width * 0.58, height * 0.68, 1.0, '#081017');
}

// -------------------------------------------------------------
// ROOM 09: THE MIRROR GALLERY
// -------------------------------------------------------------
function drawMirrorGallery({ ctx, width, height, time }: RenderContext) {
  // Hallway perspective walls
  ctx.fillStyle = '#120d14';
  ctx.fillRect(0, 0, width, height);

  // Reflective checkerboard floor
  const floorY = height * 0.52;
  ctx.fillStyle = '#09070a';
  ctx.fillRect(0, floorY, width, height - floorY);

  // Gilded baroque mirrors along walls
  const mirrorPositions = [
    { x: 10, y: 16, w: 22, h: 48 },
    { x: 38, y: 22, w: 18, h: 40 },
    { x: width - 32, y: 16, w: 22, h: 48 },
    { x: width - 56, y: 22, w: 18, h: 40 },
    { x: width * 0.5 - 12, y: 18, w: 24, h: 42 } // Center mirror
  ];

  mirrorPositions.forEach((m, idx) => {
    // Gold baroque frame
    ctx.fillStyle = '#8c6d36';
    ctx.fillRect(m.x - 2, m.y - 2, m.w + 4, m.h + 4);
    // Silver mirror surface
    ctx.fillStyle = '#263238';
    ctx.fillRect(m.x, m.y, m.w, m.h);

    // Eerie ghost reflection inside mirrors
    const glitch = Math.sin(time * 5 + idx) > 0.6 ? 2 : 0;
    ctx.fillStyle = 'rgba(180, 210, 240, 0.4)';
    // Pale girl silhouette inside mirror
    ctx.fillRect(m.x + m.w / 2 - 3 + glitch, m.y + m.h * 0.3, 6, 8);
    ctx.fillRect(m.x + m.w / 2 - 4 + glitch, m.y + m.h * 0.45, 8, 14);
  });

  // Candle wall sconces with warm flame
  const candleFlame = 0.8 + Math.sin(time * 8) * 0.2;
  ctx.fillStyle = `rgba(255, 180, 60, ${0.9 * candleFlame})`;
  ctx.fillRect(4, 28, 3, 5);
  ctx.fillRect(width - 7, 28, 3, 5);

  // Silhouette standing in center gallery
  drawHumanSilhouette(ctx, width * 0.5, height * 0.72, 1.0, '#0a060d');
}

// -------------------------------------------------------------
// ROOM 10: THE BASEMENT GENERATOR
// -------------------------------------------------------------
function drawBasementGenerator({ ctx, width, height, time }: RenderContext) {
  // Industrial brick/iron walls
  ctx.fillStyle = '#1c1512';
  ctx.fillRect(0, 0, width, height);

  // Overhead heavy steam pipes and conduits
  ctx.fillStyle = '#3a2b22';
  ctx.fillRect(0, 8, width, 6);
  ctx.fillRect(0, 18, width, 4);
  ctx.fillRect(width * 0.35, 0, 5, height * 0.5);

  // Large iron generator furnace in center/right
  const genX = width * 0.48;
  const genY = height * 0.35;
  const genW = 48;
  const genH = 46;

  ctx.fillStyle = '#2e2019';
  ctx.fillRect(genX, genY, genW, genH);
  ctx.strokeStyle = '#4a362a';
  ctx.strokeRect(genX, genY, genW, genH);

  // Round furnace hatch / pressure gauge
  ctx.fillStyle = '#140c08';
  ctx.beginPath();
  ctx.arc(genX + genW / 2, genY + genH * 0.45, 12, 0, Math.PI * 2);
  ctx.fill();

  // Pulsing red indicator LED
  const redPulse = 0.5 + Math.sin(time * 4) * 0.5;
  ctx.fillStyle = `rgba(255, 40, 40, ${redPulse})`;
  ctx.fillRect(genX + genW - 8, genY + 6, 4, 4);

  // Control levers / fuse box on left
  ctx.fillStyle = '#38281e';
  ctx.fillRect(14, height * 0.42, 22, 28);
  // Three breaker switches
  ctx.fillStyle = '#7a5a44';
  ctx.fillRect(18, height * 0.46, 14, 3);
  ctx.fillRect(18, height * 0.52, 14, 3);
  ctx.fillRect(18, height * 0.58, 14, 3);

  // Metal grating floor
  const floorY = height * 0.7;
  ctx.fillStyle = '#100b08';
  ctx.fillRect(0, floorY, width, height - floorY);
  ctx.strokeStyle = '#2d1e17';
  for (let x = 0; x < width; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Silhouette inspecting the pressure gauge
  drawHumanSilhouette(ctx, width * 0.38, height * 0.72, 1.0, '#0b0705');
}

// -------------------------------------------------------------
// ROOM 11: THE SERVER CATHEDRAL
// -------------------------------------------------------------
function drawServerCathedral({ ctx, width, height, time }: RenderContext) {
  // Midnight navy data hall
  ctx.fillStyle = '#050c14';
  ctx.fillRect(0, 0, width, height);

  // Server rack columns flanking both sides
  const drawRack = (rx: number, rw: number) => {
    ctx.fillStyle = '#0c1622';
    ctx.fillRect(rx, 0, rw, height * 0.78);
    // Blade shelves
    for (let sy = 6; sy < height * 0.75; sy += 8) {
      ctx.fillStyle = '#18283a';
      ctx.fillRect(rx + 2, sy, rw - 4, 6);
      // Blinking cyan & green LEDs
      const ledColor = (sy + Math.floor(time * 8)) % 3 === 0 ? '#00f5d4' : '#00bbf9';
      ctx.fillStyle = ledColor;
      ctx.fillRect(rx + 4, sy + 2, 2, 2);
      ctx.fillRect(rx + 8, sy + 2, 2, 2);
    }
  };

  drawRack(4, 28);
  drawRack(36, 22);
  drawRack(width - 32, 28);
  drawRack(width - 58, 22);

  // Suspended ceiling cable trays
  ctx.fillStyle = '#1e3246';
  ctx.fillRect(0, 6, width, 4);

  // Raised data center tile floor
  const floorY = height * 0.65;
  const gradFloor = ctx.createLinearGradient(0, floorY, 0, height);
  gradFloor.addColorStop(0, '#0a1622');
  gradFloor.addColorStop(1, '#0e2032');
  ctx.fillStyle = gradFloor;
  ctx.fillRect(0, floorY, width, height - floorY);

  // Grid lines
  ctx.strokeStyle = '#1a334d';
  for (let x = 0; x < width; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Cold cooling mist on floor
  const mistOffset = Math.sin(time * 2) * 8;
  ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.fillRect(0, height * 0.75, width, height * 0.25);

  // Silhouette walking between the glowing server towers
  drawHumanSilhouette(ctx, width * 0.5, height * 0.7, 1.0, '#050d17');
}

// -------------------------------------------------------------
// ROOM 12: THE LOOPING HOTEL
// -------------------------------------------------------------
function drawLoopingHotel({ ctx, width, height, time }: RenderContext) {
  // Warm retro hotel reception lobby (amber / sepia / burgundy)
  ctx.fillStyle = '#1a100d';
  ctx.fillRect(0, 0, width, height);

  // Back wall paneling
  ctx.fillStyle = '#261713';
  ctx.fillRect(0, 0, width, height * 0.65);

  // "RECEPTION" glowing brass sign
  const signX = width * 0.38;
  const signY = 12;
  const signW = 38;
  const signH = 10;
  ctx.fillStyle = '#4a2c1d';
  ctx.fillRect(signX, signY, signW, signH);
  ctx.fillStyle = '#f6bd60'; // Golden letters
  ctx.font = '6px monospace';
  ctx.fillText('RECEPTION', signX + 4, signY + 7);

  // Key cubbies grid behind desk
  const cubX = width * 0.35;
  const cubY = 25;
  ctx.fillStyle = '#180e0c';
  ctx.fillRect(cubX, cubY, 44, 18);
  ctx.strokeStyle = '#4a2c1d';
  for (let cx = cubX; cx <= cubX + 44; cx += 6) {
    ctx.strokeRect(cx, cubY, 6, 9);
    ctx.strokeRect(cx, cubY + 9, 6, 9);
  }

  // Wooden Reception Counter desk
  const deskY = height * 0.52;
  ctx.fillStyle = '#3f2218';
  ctx.fillRect(20, deskY, width - 40, 22);
  ctx.fillStyle = '#5c3324'; // Counter top
  ctx.fillRect(18, deskY - 3, width - 36, 4);

  // Counter brass bell & guest register book
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(width * 0.45, deskY - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9d8a6'; // Open ledger
  ctx.fillRect(width * 0.55, deskY - 4, 10, 4);

  // Warm amber wall sconces
  const sconceGlow = 0.85 + Math.sin(time * 5) * 0.15;
  ctx.fillStyle = `rgba(255, 190, 80, ${0.8 * sconceGlow})`;
  ctx.fillRect(14, 28, 4, 6);
  ctx.fillRect(width - 18, 28, 4, 6);

  // Burgundy carpet floor
  const floorY = height * 0.68;
  ctx.fillStyle = '#2d0c11';
  ctx.fillRect(0, floorY, width, height - floorY);

  // Silhouette standing in front of reception counter
  drawHumanSilhouette(ctx, width * 0.5, height * 0.74, 1.0, '#0c0706');
}

// -------------------------------------------------------------
// ROOM 13: THE ROOFTOP OF STATIC
// -------------------------------------------------------------
function drawRooftopOfStatic({ ctx, width, height, time }: RenderContext) {
  // Midnight rainy night sky
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, width, height);

  // Distant city skyline silhouettes
  const bldgX = [0, 18, 38, 62, 85, 110, 135];
  bldgX.forEach((bx, idx) => {
    const bh = 25 + (idx % 4) * 8;
    ctx.fillStyle = '#0c1524';
    ctx.fillRect(bx, height * 0.5 - bh, 20, bh + 10);
    // Distant yellow/cyan window lights
    ctx.fillStyle = idx % 2 === 0 ? '#ffea00' : '#00f5d4';
    ctx.fillRect(bx + 4, height * 0.5 - bh + 6, 2, 2);
    ctx.fillRect(bx + 10, height * 0.5 - bh + 14, 2, 2);
  });

  // Radio antenna tower blinking red on right
  const towerX = width - 20;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(towerX, height * 0.55);
  ctx.lineTo(towerX, 8);
  ctx.stroke();
  const blink = Math.sin(time * 4) > 0.4;
  ctx.fillStyle = blink ? '#ff0054' : '#47111e';
  ctx.fillRect(towerX - 1, 6, 3, 3);

  // Chainlink safety fence along rooftop edge
  const fenceY = height * 0.48;
  ctx.strokeStyle = '#202f45';
  ctx.strokeRect(0, fenceY, width, 18);
  for (let fx = 0; fx < width; fx += 6) {
    ctx.beginPath();
    ctx.moveTo(fx, fenceY);
    ctx.lineTo(fx + 6, fenceY + 18);
    ctx.moveTo(fx + 6, fenceY);
    ctx.lineTo(fx, fenceY + 18);
    ctx.stroke();
  }

  // Concrete rooftop floor
  const floorY = height * 0.62;
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, floorY, width, height - floorY);

  // CRT monitor playing static on wooden crate
  const crateX = width * 0.38;
  const crateY = height * 0.62;
  ctx.fillStyle = '#372b22';
  ctx.fillRect(crateX, crateY, 16, 12);
  // Monitor on top
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(crateX + 1, crateY - 14, 14, 12);
  // Static screen
  const staticVal = Math.sin(time * 20);
  ctx.fillStyle = staticVal > 0 ? '#7dd3fc' : '#38bdf8';
  ctx.fillRect(crateX + 3, crateY - 12, 10, 8);

  // Silhouette standing in rain looking at city
  drawHumanSilhouette(ctx, width * 0.58, height * 0.72, 1.0, '#060a12');
}

// -------------------------------------------------------------
// ROOM 14: THE MEMORY GARDEN
// -------------------------------------------------------------
function drawMemoryGarden({ ctx, width, height, time }: RenderContext) {
  // Gothic twilight garden with violet/purple ambiance
  ctx.fillStyle = '#0d0714';
  ctx.fillRect(0, 0, width, height);

  // Giant weeping purple willow tree in background
  const treeX = width * 0.5;
  const treeY = height * 0.38;
  // Gnarled dark trunk
  ctx.fillStyle = '#1c1024';
  ctx.fillRect(treeX - 6, treeY, 12, height * 0.4);
  // Violet foliage canopy
  ctx.fillStyle = '#3a1848';
  ctx.beginPath();
  ctx.arc(treeX, treeY - 8, 38, 0, Math.PI * 2);
  ctx.fill();

  // Floating fireflies / memory motes
  ctx.fillStyle = '#c77dff';
  for (let i = 0; i < 6; i++) {
    const fx = treeX + Math.sin(time * 2 + i * 2) * 26;
    const fy = treeY - 12 + Math.cos(time * 1.5 + i) * 16;
    ctx.fillRect(fx, fy, 2, 2);
  }

  // Classical stone statues covered in ivy on left & right
  const statue = (sx: number) => {
    ctx.fillStyle = '#3c4048'; // Pedestal
    ctx.fillRect(sx, height * 0.54, 12, 16);
    // Statue bust
    ctx.fillStyle = '#5a606d';
    ctx.beginPath();
    ctx.arc(sx + 6, height * 0.48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx + 3, height * 0.50, 6, 6);
  };
  statue(14);
  statue(width - 26);

  // Glowing stone lantern on post
  const lantX = width * 0.32;
  const lantY = height * 0.64;
  ctx.fillStyle = '#ffbe0b';
  ctx.fillRect(lantX, lantY, 4, 6);
  ctx.fillStyle = 'rgba(255, 190, 11, 0.2)';
  ctx.beginPath();
  ctx.arc(lantX + 2, lantY + 3, 16, 0, Math.PI * 2);
  ctx.fill();

  // Overgrown grass and gravel path
  const floorY = height * 0.68;
  ctx.fillStyle = '#131b14';
  ctx.fillRect(0, floorY, width, height - floorY);

  // Silhouette standing near tree
  drawHumanSilhouette(ctx, width * 0.5, height * 0.72, 1.0, '#0a050f');
}

// -------------------------------------------------------------
// ROOM 15: MORPHEUS CORE
// -------------------------------------------------------------
function drawMorpheusCore({ ctx, width, height, time }: RenderContext) {
  // Deep void black/crimson
  ctx.fillStyle = '#080204';
  ctx.fillRect(0, 0, width, height);

  // Giant ominous monolith / entity shadow looming in center
  const monoX = width * 0.42;
  const monoY = 12;
  const monoW = 26;
  const monoH = height * 0.55;
  ctx.fillStyle = '#140508';
  ctx.fillRect(monoX, monoY, monoW, monoH);

  // Glowing crimson core eye / neural node
  const corePulse = 0.7 + Math.sin(time * 6) * 0.3;
  ctx.fillStyle = `rgba(255, 0, 54, ${corePulse})`;
  ctx.beginPath();
  ctx.arc(width * 0.5, monoY + monoH * 0.35, 6, 0, Math.PI * 2);
  ctx.fill();

  // Red horizontal laser grid wires across corridor
  ctx.strokeStyle = 'rgba(255, 0, 50, 0.65)';
  ctx.lineWidth = 1;
  const laserY = [24, 38, 52, 66];
  laserY.forEach((ly, idx) => {
    const shift = Math.sin(time * 5 + idx) * 3;
    ctx.beginPath();
    ctx.moveTo(0, ly + shift);
    ctx.lineTo(width, ly - shift);
    ctx.stroke();
  });

  // Vault blast door arches on left & right
  ctx.fillStyle = '#2b080f';
  ctx.fillRect(0, 0, 20, height * 0.7);
  ctx.fillRect(width - 20, 0, 20, height * 0.7);

  // Sprawling cables across the dark floor
  const floorY = height * 0.68;
  ctx.fillStyle = '#0d0305';
  ctx.fillRect(0, floorY, width, height - floorY);

  ctx.strokeStyle = '#380a14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.85);
  ctx.bezierCurveTo(width * 0.3, height * 0.72, width * 0.7, height * 0.9, width, height * 0.8);
  ctx.stroke();

  // Silhouette standing in front of the colossal Core
  drawHumanSilhouette(ctx, width * 0.5, height * 0.74, 1.0, '#0a0204');
}

// -------------------------------------------------------------
// ROOM 00: THE LAST ROOM
// -------------------------------------------------------------
function drawTheLastRoom({ ctx, width, height, time }: RenderContext) {
  // Wood-paneled parlor (1999)
  ctx.fillStyle = '#17120e';
  ctx.fillRect(0, 0, width, height * 0.65);

  // Floorboards
  ctx.fillStyle = '#2b1e16';
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Computer desk with green phosphor CRT
  const deskX = width * 0.45;
  const deskY = height * 0.48;
  ctx.fillStyle = '#422a1d';
  ctx.fillRect(deskX, deskY, 36, 24);

  // CRT monitor
  ctx.fillStyle = '#1c1f24';
  ctx.fillRect(deskX + 6, deskY - 18, 22, 18);
  // Phosphor green screen
  const greenGlow = 0.85 + Math.sin(time * 6) * 0.15;
  ctx.fillStyle = `rgba(124, 255, 155, ${greenGlow})`;
  ctx.fillRect(deskX + 9, deskY - 15, 16, 12);

  // Oval mirror on wall (left)
  ctx.fillStyle = '#8c6d36';
  ctx.beginPath();
  ctx.ellipse(26, 32, 14, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#203038';
  ctx.beginPath();
  ctx.ellipse(26, 32, 11, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mantelpiece clock frozen at 03:14
  ctx.fillStyle = '#b08968';
  ctx.fillRect(width - 28, 22, 16, 20);

  // Silhouette standing beside terminal
  drawHumanSilhouette(ctx, width * 0.38, height * 0.72, 1.0, '#0a0806');
}

// -------------------------------------------------------------
// HELPER: Human / Investigator Silhouette Sprite
// -------------------------------------------------------------
function drawHumanSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Head
  ctx.beginPath();
  ctx.arc(x, y - 18 * scale, 4 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Torso / Jacket
  ctx.fillRect(x - 5 * scale, y - 13 * scale, 10 * scale, 12 * scale);

  // Backpack bulge on left
  ctx.fillRect(x - 7 * scale, y - 11 * scale, 3 * scale, 8 * scale);

  // Legs / Trousers
  ctx.fillRect(x - 4 * scale, y - 1 * scale, 3 * scale, 12 * scale);
  ctx.fillRect(x + 1 * scale, y - 1 * scale, 3 * scale, 12 * scale);

  // Shadow on floor
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x, y + 11 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// -------------------------------------------------------------
// HELPER: Pixel Vignette & Subtle CRT Scanlines
// -------------------------------------------------------------
function drawPixelVignetteAndScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  // Fine pixel scanlines (every 2px)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  for (let y = 0; y < height; y += 2) {
    ctx.fillRect(0, y, width, 1);
  }

  // Corner vignette
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.45,
    width / 2,
    height / 2,
    Math.min(width, height) * 0.85
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}
