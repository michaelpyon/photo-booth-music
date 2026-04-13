import type { CanvasRenderer } from './CanvasRenderer.ts';
import type { ConductorState } from '../modes/ConductorMode.ts';
import type { InstrumentGroup } from '../data/songs/types.ts';

const GROUP_LABELS: Record<InstrumentGroup, string> = {
  strings: 'STRINGS',
  woodwinds: 'WINDS',
  brass: 'BRASS',
  percussion: 'PERC',
  bass: 'BASS',
};

// Read CSS variables once
let accentGold = '#c9a84c';
let accentViolet = '#a78bfa';
let colorsLoaded = false;

function loadCSSColors(): void {
  if (colorsLoaded) return;
  const style = getComputedStyle(document.documentElement);
  accentGold = style.getPropertyValue('--accent').trim() || accentGold;
  accentViolet = style.getPropertyValue('--accent-secondary').trim() || accentViolet;
  colorsLoaded = true;
}

const GROUP_COLORS: Record<InstrumentGroup, string> = {
  strings: '#ff6b6b',
  woodwinds: '#51cf66',
  brass: '#ffd43b',
  percussion: '#ff922b',
  bass: '#339af0',
};

const GROUP_ANGLES: Record<InstrumentGroup, number> = {
  strings: -Math.PI * 0.4,
  woodwinds: -Math.PI * 0.1,
  brass: Math.PI * 0.2,
  percussion: Math.PI * 0.5,
  bass: Math.PI * 0.8,
};

export function drawConductorOverlay(
  renderer: CanvasRenderer,
  state: ConductorState,
): void {
  loadCSSColors();

  const ctx = renderer.ctx;
  const w = renderer.width;
  const h = renderer.height;

  // Tempo pulse indicator (bottom center)
  drawTempoPulse(ctx, w, h, state.tempo, state.playing);

  // Status bar (top area)
  drawStatusBar(ctx, w, state);

  // Left hand: volume rings
  if (state.leftHandX !== null && state.leftHandY !== null) {
    drawVolumeRings(ctx, state.leftHandX, state.leftHandY, state.volume);
    drawInstrumentArcs(ctx, state.leftHandX, state.leftHandY, state);
  }

  // Right hand: tempo indicator
  if (state.rightHandX !== null && state.rightHandY !== null) {
    drawTempoHand(ctx, state.rightHandX, state.rightHandY, state.tempo, state.defaultTempo);
  }

  // Instrument balance indicator (between hands)
  if (
    state.leftHandX !== null &&
    state.leftHandY !== null &&
    state.rightHandX !== null &&
    state.rightHandY !== null
  ) {
    drawBalanceIndicator(
      ctx,
      state.leftHandX,
      state.leftHandY,
      state.rightHandX,
      state.rightHandY,
      state.instrumentBalance,
    );
  }

  // "No hands" indicator
  if (state.leftHandX === null && state.rightHandX === null && state.playing) {
    ctx.font = '14px "SF Mono", "Fira Code", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('Move hands to conduct', w / 2, h - 30);
  }
}

function drawVolumeRings(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  volume: number,
): void {
  const numRings = 3;
  const maxRadius = 50 + volume * 40;
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);

  for (let i = 0; i < numRings; i++) {
    const t = (i + 1) / numRings;
    const radius = maxRadius * t + pulse * 5 * volume;
    const alpha = (1 - t) * 0.3 * volume + 0.05;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(201, 168, 76, ${alpha})`;
    ctx.lineWidth = 2 + volume * 2;
    ctx.stroke();
  }

  // Center dot
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = accentGold;
  ctx.fill();

  // Volume label
  ctx.font = 'bold 12px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = `rgba(201, 168, 76, 0.8)`;
  ctx.textAlign = 'center';
  ctx.fillText(`VOL ${Math.round(volume * 100)}%`, x, y - maxRadius - 10);
}

function drawInstrumentArcs(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: ConductorState,
): void {
  const radius = 70 + state.volume * 20;
  const arcWidth = Math.PI * 0.15;
  const groups: InstrumentGroup[] = ['strings', 'woodwinds', 'brass', 'percussion', 'bass'];

  for (const group of groups) {
    const angle = GROUP_ANGLES[group];
    const color = GROUP_COLORS[group];
    const isMuted = state.mutedGroups.has(group);
    const alpha = isMuted ? 0.15 : 0.3 + state.instrumentBalance * 0.4;

    ctx.beginPath();
    ctx.arc(x, y, radius, angle - arcWidth, angle + arcWidth);
    ctx.strokeStyle = isMuted ? `rgba(128, 128, 128, 0.2)` : `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = isMuted ? 2 : 3 + state.instrumentBalance * 3;
    ctx.stroke();

    // Label
    const labelR = radius + 15;
    const lx = x + Math.cos(angle) * labelR;
    const ly = y + Math.sin(angle) * labelR;
    ctx.font = '9px "SF Mono", "Fira Code", monospace';
    ctx.fillStyle = isMuted ? 'rgba(128, 128, 128, 0.3)' : `${color}aa`;
    ctx.textAlign = 'center';
    ctx.fillText(isMuted ? `${GROUP_LABELS[group]} [M]` : GROUP_LABELS[group], lx, ly + 4);
  }
}

function drawTempoHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tempo: number,
  defaultTempo: number,
): void {
  // Pulsing ring synced to tempo
  const beatDuration = 60 / tempo;
  const phase = ((Date.now() / 1000) % beatDuration) / beatDuration;
  const pulseScale = 1 - phase;
  const radius = 20 + pulseScale * 25;
  const alpha = pulseScale * 0.5;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = accentViolet;
  ctx.fill();

  // Tempo label
  const ratio = tempo / defaultTempo;
  const label = ratio > 1.1 ? 'FAST' : ratio < 0.9 ? 'SLOW' : '';
  ctx.font = 'bold 12px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(tempo)} BPM`, x, y - 35);
  if (label) {
    ctx.font = '10px "SF Mono", "Fira Code", monospace';
    ctx.fillStyle = 'rgba(167, 139, 250, 0.6)';
    ctx.fillText(label, x, y - 22);
  }
}

function drawBalanceIndicator(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  balance: number,
): void {
  // Line between hands
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.lineTo(rx, ry);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + balance * 0.15})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Balance label at midpoint
  const mx = (lx + rx) / 2;
  const my = (ly + ry) / 2;
  const label = balance > 0.7 ? 'FULL' : balance < 0.3 ? 'SOLO' : 'MIX';
  ctx.font = '10px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'center';
  ctx.fillText(label, mx, my - 8);
}

function drawTempoPulse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tempo: number,
  playing: boolean,
): void {
  if (!playing) return;

  const beatDuration = 60 / tempo;
  const phase = ((Date.now() / 1000) % beatDuration) / beatDuration;

  // Horizontal pulse line at bottom
  const lineY = h - 8;
  const pulseWidth = w * 0.4;
  const startX = (w - pulseWidth) / 2;

  // Background track
  ctx.beginPath();
  ctx.moveTo(startX, lineY);
  ctx.lineTo(startX + pulseWidth, lineY);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Moving dot
  const dotX = startX + phase * pulseWidth;
  ctx.beginPath();
  ctx.arc(dotX, lineY, 4, 0, Math.PI * 2);
  ctx.fillStyle = accentGold;
  ctx.fill();

  // Beat markers
  for (let i = 0; i <= 4; i++) {
    const mx = startX + (i / 4) * pulseWidth;
    ctx.beginPath();
    ctx.arc(mx, lineY, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
  }
}

function drawStatusBar(
  ctx: CanvasRenderingContext2D,
  w: number,
  state: ConductorState,
): void {
  if (!state.playing) return;

  // Song name (bottom-left)
  ctx.font = 'bold 13px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'left';
  const label = state.generativeMode ? 'Generative: I-V-vi-IV' : state.songName;
  ctx.fillText(label, 20, 60);
}
