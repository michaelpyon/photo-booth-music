import type { CanvasRenderer } from './CanvasRenderer.ts';
import type { YAxisMode } from '../audio/ThereminSynth.ts';
import { frequencyToNoteName } from '../audio/utils.ts';

const Y_MODE_COLORS: Record<YAxisMode, string> = {
  filter: '#f0f',
  timbre: '#ff8800',
  vibrato: '#88ff00',
  octave: '#ffff00',
};

const Y_MODE_LABELS: Record<YAxisMode, string> = {
  filter: 'FILTER',
  timbre: 'TIMBRE',
  vibrato: 'VIBRATO',
  octave: 'OCTAVE',
};

export function drawThereminOverlay(
  renderer: CanvasRenderer,
  handX: number | null,
  handY: number | null,
  freq: number,
  yValue: number,
  yLabel: string,
  yMode: YAxisMode,
  scaleSnap: boolean,
  scaleLabel: string,
  listening: boolean,
  chordLabel: string,
  rangeLabel: string
): void {
  const ctx = renderer.ctx;
  const w = renderer.width;
  const h = renderer.height;

  // Range indicator (bottom-left) — always visible
  ctx.font = 'bold 13px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'left';
  ctx.fillText(`Range: ${rangeLabel}`, 20, h - 40);
  ctx.font = '11px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText('↑↓ arrows to shift', 20, h - 22);

  // Listening indicator + chord (top-right area, below toolbar)
  if (listening) {
    // Pulsing mic dot
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 300);
    const dotRadius = 4 + pulse * 2;
    ctx.beginPath();
    ctx.arc(w - 130, 58, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 50, 50, ${0.6 + pulse * 0.4})`;
    ctx.fill();

    ctx.font = 'bold 12px "SF Mono", "Fira Code", monospace';
    ctx.fillStyle = `rgba(255, 100, 100, ${0.7 + pulse * 0.3})`;
    ctx.textAlign = 'left';
    ctx.fillText('LISTENING', w - 122, 62);

    if (chordLabel) {
      ctx.font = 'bold 16px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
      ctx.textAlign = 'right';
      ctx.fillText(`Chord: ${chordLabel}`, w - 20, 85);
    }
  }

  if (handX === null || handY === null) return;

  const yColor = Y_MODE_COLORS[yMode];
  const yColorAlpha = yColor + '99';

  // Vertical pitch line (cyan)
  ctx.beginPath();
  ctx.moveTo(handX, 0);
  ctx.lineTo(handX, h);
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Horizontal Y-mode line (color depends on mode)
  ctx.beginPath();
  ctx.moveTo(0, handY);
  ctx.lineTo(w, handY);
  ctx.strokeStyle = yColorAlpha;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Crosshair dot
  ctx.beginPath();
  ctx.arc(handX, handY, 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();

  // Note label near crosshair
  const noteName = frequencyToNoteName(freq);
  const freqStr = `${Math.round(freq)} Hz`;
  ctx.font = 'bold 20px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = '#0ff';
  ctx.textAlign = handX > w / 2 ? 'right' : 'left';
  const labelX = handX > w / 2 ? handX - 20 : handX + 20;
  ctx.fillText(noteName, labelX, handY - 35);
  ctx.font = '13px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
  ctx.fillText(freqStr, labelX, handY - 18);

  // Y-axis mode label + value (right side of horizontal line)
  ctx.font = 'bold 14px "SF Mono", "Fira Code", monospace';
  ctx.fillStyle = yColor;
  ctx.textAlign = 'right';
  ctx.fillText(`${Y_MODE_LABELS[yMode]}: ${yLabel}`, w - 20, handY - 10);

  // Scale/key badge (top-right, below toolbar)
  if (scaleSnap && scaleLabel) {
    ctx.font = 'bold 14px "SF Mono", "Fira Code", monospace';
    ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.textAlign = 'right';
    ctx.fillText(`Key: ${scaleLabel}`, w - 20, 65);

    // SNAP indicator near crosshair
    ctx.font = '11px "SF Mono", "Fira Code", monospace';
    ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
    ctx.textAlign = handX > w / 2 ? 'right' : 'left';
    ctx.fillText('SNAP', labelX, handY + 18);
  }
}
