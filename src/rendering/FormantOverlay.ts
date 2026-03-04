import type { CanvasRenderer } from './CanvasRenderer.ts';
import type { HandVis } from '../modes/FormantMode.ts';

// ── Vowel formant targets for proximity indicator ───────────────────
const VOWEL_TARGETS = [
  { display: 'EE',  f1: 270, f2: 2300 },  // "see"
  { display: 'IH',  f1: 390, f2: 1990 },  // "sit"
  { display: 'EH',  f1: 530, f2: 1840 },  // "set"
  { display: 'AE',  f1: 660, f2: 1720 },  // "sat"
  { display: 'AH',  f1: 730, f2: 1090 },  // "father"
  { display: 'AW',  f1: 570, f2: 840 },   // "saw"
  { display: 'OH',  f1: 490, f2: 1350 },  // "go"
  { display: 'OO',  f1: 300, f2: 870 },   // "boot"
  { display: 'UH',  f1: 440, f2: 1020 },  // "put"
];

function getClosestVowel(f1: number, f2: number): string {
  let best = VOWEL_TARGETS[0];
  let bestDist = Infinity;
  for (const v of VOWEL_TARGETS) {
    // Normalize by typical range (F1: ~250-750, F2: ~800-2400)
    const d1 = (f1 - v.f1) / 500;
    const d2 = (f2 - v.f2) / 1600;
    const dist = d1 * d1 + d2 * d2;
    if (dist < bestDist) {
      bestDist = dist;
      best = v;
    }
  }
  return best.display;
}

// ── Brightness constants for normalization ──────────────────────────
const BRIGHTNESS_MIN = 300;
const BRIGHTNESS_MAX = 8000;

// ── Main overlay function ───────────────────────────────────────────
export function drawFormantOverlay(
  renderer: CanvasRenderer,
  hands: HandVis[],
  guideVisible: boolean
): void {
  const ctx = renderer.ctx;
  const w = renderer.width;
  const h = renderer.height;

  for (const hand of hands) {
    // ── Glowing fingertip dot ─────────────────────────────────────
    ctx.save();
    ctx.shadowColor = hand.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(hand.x, hand.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = hand.color;
    ctx.fill();
    ctx.restore();

    // Inner white dot
    ctx.beginPath();
    ctx.arc(hand.x, hand.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    if (hand.kind === 'vowel') {
      // ── Vowel hand labels ─────────────────────────────────────
      // Closest vowel sound (large, prominent)
      const vowelName = getClosestVowel(hand.f1, hand.f2);
      ctx.font = 'bold 22px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = hand.color;
      ctx.textAlign = 'left';
      ctx.fillText(vowelName, hand.x + 20, hand.y - 22);

      // F1/F2 values
      ctx.font = '11px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = 'rgba(255, 51, 102, 0.7)';
      ctx.fillText(`F1: ${Math.round(hand.f1)} Hz`, hand.x + 20, hand.y - 4);
      ctx.fillText(`F2: ${Math.round(hand.f2)} Hz`, hand.x + 20, hand.y + 10);

      // "VOWEL" tag
      ctx.font = 'bold 9px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = 'rgba(255, 51, 102, 0.4)';
      ctx.fillText('VOWEL', hand.x + 20, hand.y + 24);

    } else {
      // ── Pitch hand labels ─────────────────────────────────────
      // Note name (large, prominent)
      ctx.font = 'bold 22px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = hand.color;
      ctx.textAlign = 'left';
      ctx.fillText(hand.noteName, hand.x + 20, hand.y - 22);

      // Pitch in Hz
      ctx.font = '11px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = 'rgba(0, 255, 204, 0.7)';
      ctx.fillText(`${Math.round(hand.pitch)} Hz`, hand.x + 20, hand.y - 4);

      // Brightness bar
      const barWidth = 50;
      const barHeight = 4;
      const barX = hand.x + 20;
      const barY = hand.y + 10;
      const brightnessNorm = Math.log(hand.brightness / BRIGHTNESS_MIN)
        / Math.log(BRIGHTNESS_MAX / BRIGHTNESS_MIN);
      ctx.fillStyle = 'rgba(0, 255, 204, 0.15)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = hand.color;
      ctx.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, brightnessNorm)), barHeight);

      // "PITCH" tag
      ctx.font = 'bold 9px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = 'rgba(0, 255, 204, 0.4)';
      ctx.fillText('PITCH', hand.x + 20, hand.y + 26);
    }
  }

  // ── Tutorial guide (toggleable) ─────────────────────────────────
  if (guideVisible) {
    drawTutorialGuide(ctx, w, h);
  }

  // ── Bottom hint ─────────────────────────────────────────────────
  ctx.font = '11px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Hand 1: vowel shape  \u2022  Hand 2: pitch + brightness  \u2022  [H] guide',
    w / 2, h - 12
  );
}

// ── Tutorial guide panels ───────────────────────────────────────────
function drawTutorialGuide(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  drawVowelMap(ctx, w, h);
  drawPitchReference(ctx, w, h);
  drawTryThisPanel(ctx, w);
}

// ── Vowel Map (bottom-right) ────────────────────────────────────────
function drawVowelMap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const size = 130;
  const x = w - size - 20;
  const y = h - size - 45;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(x - 10, y - 25, size + 20, size + 40);

  // Title
  ctx.font = 'bold 10px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 51, 102, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('HAND 1: VOWELS', x + size / 2, y - 10);

  // Vowel positions in the chart
  // X = F2 (right=high/front, left=low/back)
  // Y = F1 (top=closed, bottom=open)
  const vowelPositions = [
    { label: 'EE',  px: 0.85, py: 0.05 },
    { label: 'IH',  px: 0.72, py: 0.25 },
    { label: 'EH',  px: 0.62, py: 0.48 },
    { label: 'AE',  px: 0.52, py: 0.72 },
    { label: 'AH',  px: 0.28, py: 0.92 },
    { label: 'AW',  px: 0.08, py: 0.60 },
    { label: 'OO',  px: 0.05, py: 0.08 },
    { label: 'UH',  px: 0.15, py: 0.32 },
  ];

  // Draw connecting lines (vowel trapezoid)
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 51, 102, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < vowelPositions.length; i++) {
    const vp = vowelPositions[i];
    const px = x + vp.px * size;
    const py = y + vp.py * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Draw vowel labels
  ctx.font = 'bold 11px "SF Mono", "Fira Code", monospace';
  ctx.textAlign = 'center';
  for (const vp of vowelPositions) {
    const px = x + vp.px * size;
    const py = y + vp.py * size;
    ctx.fillStyle = 'rgba(255, 51, 102, 0.8)';
    ctx.fillText(vp.label, px, py);
  }

  // Axis hints
  ctx.font = '7px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.textAlign = 'left';
  ctx.fillText('\u2190 back', x, y + size + 12);
  ctx.textAlign = 'right';
  ctx.fillText('front \u2192', x + size, y + size + 12);

  // Border
  ctx.strokeStyle = 'rgba(255, 51, 102, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
}

// ── Pitch Reference (bottom-left) ───────────────────────────────────
function drawPitchReference(
  ctx: CanvasRenderingContext2D,
  _w: number,
  h: number
): void {
  const prX = 20;
  const prY = h - 75;
  const prWidth = 200;
  const prHeight = 24;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(prX - 5, prY - 22, prWidth + 10, prHeight + 50);

  // Title
  ctx.font = 'bold 10px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(0, 255, 204, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('HAND 2: PITCH + EXPRESSION', prX + prWidth / 2, prY - 8);

  // Pitch bar background
  ctx.fillStyle = 'rgba(0, 255, 204, 0.08)';
  ctx.fillRect(prX, prY, prWidth, prHeight);

  // Note tick marks (C3\u2013C5, 2 octaves = 24 semitones)
  const noteMarks = [
    { label: 'C3', pos: 0 / 24 },
    { label: 'E3', pos: 4 / 24 },
    { label: 'G3', pos: 7 / 24 },
    { label: 'C4', pos: 12 / 24 },
    { label: 'E4', pos: 16 / 24 },
    { label: 'G4', pos: 19 / 24 },
    { label: 'C5', pos: 24 / 24 },
  ];

  ctx.font = '8px "SF Mono", "Fira Code", monospace';
  ctx.textAlign = 'center';
  for (const nm of noteMarks) {
    const nx = prX + nm.pos * prWidth;
    // Tick line
    ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
    ctx.fillRect(nx, prY, 1, prHeight);
    // Label
    ctx.fillStyle = 'rgba(0, 255, 204, 0.5)';
    ctx.fillText(nm.label, nx, prY + prHeight + 10);
  }

  // Y-axis hint
  ctx.font = '8px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.textAlign = 'left';
  ctx.fillText('\u2191 bright  \u2193 dark  \u270b vibrato', prX, prY + prHeight + 22);
}

// ── "Try This!" panel (top-right) ───────────────────────────────────
function drawTryThisPanel(
  ctx: CanvasRenderingContext2D,
  w: number
): void {
  const tpX = w - 230;
  const tpY = 50;
  const tpWidth = 215;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(tpX - 5, tpY - 5, tpWidth + 10, 118);

  // Title
  ctx.font = 'bold 11px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.textAlign = 'left';
  ctx.fillText('TRY THIS:', tpX, tpY + 12);

  // Sound recipes
  ctx.font = '9px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

  ctx.fillText('"YEAH" \u2014 H1: quick EE \u2192 EH (default!)', tpX, tpY + 30);
  ctx.fillText('"WAH"  \u2014 H1: sweep OO \u2192 AH', tpX, tpY + 44);
  ctx.fillText('"WOW"  \u2014 H1: sweep AH \u2192 OO \u2192 AH', tpX, tpY + 58);
  ctx.fillText('"YOW"  \u2014 H1: sweep EE \u2192 AH', tpX, tpY + 72);
  ctx.fillText('"RIFF" \u2014 H2: slide pitch + H1 vowels', tpX, tpY + 86);

  // Toggle hint
  ctx.font = '8px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('[H] hide guide  \u2022  \u270b spread fingers = vibrato', tpX, tpY + 105);
}
