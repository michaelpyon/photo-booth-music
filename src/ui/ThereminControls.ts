import type { YAxisMode } from '../audio/ThereminSynth.ts';
import { ROOT_NOTES, SCALE_NAMES } from '../audio/utils.ts';

const Y_MODES: { key: YAxisMode; label: string }[] = [
  { key: 'filter', label: 'Filter' },
  { key: 'timbre', label: 'Timbre' },
  { key: 'vibrato', label: 'Vibrato' },
  { key: 'octave', label: 'Octave' },
];

export class ThereminControls {
  private container: HTMLElement;
  private audioBtn!: HTMLButtonElement;
  private scaleSnapBtn!: HTMLButtonElement;
  private listenBtn!: HTMLButtonElement;
  private detectedKeyBadge!: HTMLSpanElement;
  private confidenceMeter!: HTMLDivElement;
  private confidenceFill!: HTMLDivElement;
  private confidenceLabel!: HTMLSpanElement;
  private yModeButtons: Map<YAxisMode, HTMLButtonElement> = new Map();
  private rootSelect!: HTMLSelectElement;
  private scaleSelect!: HTMLSelectElement;

  private _audioOn = true;
  private _scaleSnap = false;
  private _listening = false;
  private _yMode: YAxisMode = 'filter';

  onAudioToggle: ((on: boolean) => void) | null = null;
  onScaleSnapToggle: ((on: boolean) => void) | null = null;
  onRootChange: ((root: string) => void) | null = null;
  onScaleChange: ((scale: string) => void) | null = null;
  onYModeChange: ((mode: YAxisMode) => void) | null = null;
  onListenToggle: ((on: boolean) => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.build();
  }

  private build(): void {
    // Divider after mode selector
    this.container.appendChild(this.makeDivider());

    // Audio toggle
    this.audioBtn = this.makeBtn('Audio: ON', true, () => {
      this._audioOn = !this._audioOn;
      this.audioBtn.textContent = `Audio: ${this._audioOn ? 'ON' : 'OFF'}`;
      this.audioBtn.classList.toggle('active', this._audioOn);
      this.onAudioToggle?.(this._audioOn);
    });
    this.container.appendChild(this.audioBtn);

    // Divider
    this.container.appendChild(this.makeDivider());

    // Y-axis mode buttons
    for (const mode of Y_MODES) {
      const btn = this.makeBtn(mode.label, mode.key === this._yMode, () => {
        this._yMode = mode.key;
        this.updateYModeActive();
        this.onYModeChange?.(mode.key);
      });
      btn.classList.add('ymode-btn');
      this.yModeButtons.set(mode.key, btn);
      this.container.appendChild(btn);
    }
    this.updateYModeActive();

    // Divider
    this.container.appendChild(this.makeDivider());

    // Scale snap toggle
    this.scaleSnapBtn = this.makeBtn('Scale: OFF', false, () => {
      this._scaleSnap = !this._scaleSnap;
      this.scaleSnapBtn.textContent = `Scale: ${this._scaleSnap ? 'ON' : 'OFF'}`;
      this.scaleSnapBtn.classList.toggle('active-pink', this._scaleSnap);
      this.rootSelect.style.display = this._scaleSnap ? '' : 'none';
      this.scaleSelect.style.display = this._scaleSnap ? '' : 'none';
      this.onScaleSnapToggle?.(this._scaleSnap);
    });
    this.container.appendChild(this.scaleSnapBtn);

    // Root note select
    this.rootSelect = this.makeSelect(ROOT_NOTES, 'C', (val) => {
      this.onRootChange?.(val);
    });
    this.rootSelect.style.display = 'none';
    this.container.appendChild(this.rootSelect);

    // Scale select
    this.scaleSelect = this.makeSelect(SCALE_NAMES, 'Major', (val) => {
      this.onScaleChange?.(val);
    });
    this.scaleSelect.style.display = 'none';
    this.container.appendChild(this.scaleSelect);

    // Divider
    this.container.appendChild(this.makeDivider());

    // Play-along toggle. This is the headline feature: it listens to a song
    // in the room, finds the key, and snaps your notes so you sound in tune.
    this.listenBtn = this.makeBtn('Match the music', false, () => {
      this._listening = !this._listening;
      this.listenBtn.classList.toggle('active-listen', this._listening);
      this.listenBtn.textContent = this._listening
        ? 'Listening for the key...'
        : 'Match the music';

      if (this._listening) {
        // Auto-enable scale snap
        if (!this._scaleSnap) {
          this._scaleSnap = true;
          this.scaleSnapBtn.textContent = 'Scale: ON';
          this.scaleSnapBtn.classList.add('active-pink');
          this.rootSelect.style.display = '';
          this.scaleSelect.style.display = '';
          this.onScaleSnapToggle?.(true);
        }
        this.detectedKeyBadge.textContent = 'Finding the key...';
        this.detectedKeyBadge.classList.remove('snapped');
        this.detectedKeyBadge.style.display = '';
        this.confidenceMeter.style.display = '';
        this.setConfidence(0);
      } else {
        this.detectedKeyBadge.style.display = 'none';
        this.detectedKeyBadge.classList.remove('snapped');
        this.confidenceMeter.style.display = 'none';
      }

      this.onListenToggle?.(this._listening);
    });
    this.listenBtn.classList.add('play-along-btn');
    this.container.appendChild(this.listenBtn);

    // Detected key badge (hidden until listening)
    this.detectedKeyBadge = document.createElement('span');
    this.detectedKeyBadge.className = 'detected-key-badge';
    this.detectedKeyBadge.textContent = 'Finding the key...';
    this.detectedKeyBadge.style.display = 'none';
    this.container.appendChild(this.detectedKeyBadge);

    // Live in-tune confidence meter. The key detector reports how sure it is
    // about the room's key. A text percentage alone read as noise, so this
    // turns it into a small horizontal bar that fills as the lock strengthens,
    // making the headline "snap you to the key" trick feel live and tangible.
    this.confidenceMeter = document.createElement('div');
    this.confidenceMeter.className = 'confidence-meter';
    this.confidenceMeter.style.display = 'none';
    this.confidenceMeter.setAttribute('role', 'meter');
    this.confidenceMeter.setAttribute('aria-label', 'In-tune match confidence');
    this.confidenceMeter.setAttribute('aria-valuemin', '0');
    this.confidenceMeter.setAttribute('aria-valuemax', '100');

    const track = document.createElement('div');
    track.className = 'confidence-track';
    this.confidenceFill = document.createElement('div');
    this.confidenceFill.className = 'confidence-fill';
    track.appendChild(this.confidenceFill);

    this.confidenceLabel = document.createElement('span');
    this.confidenceLabel.className = 'confidence-label';
    this.confidenceLabel.textContent = 'In tune';

    this.confidenceMeter.appendChild(this.confidenceLabel);
    this.confidenceMeter.appendChild(track);
    this.container.appendChild(this.confidenceMeter);
  }

  /** Drive the live confidence meter. confidence is 0..1. */
  private setConfidence(confidence: number): void {
    const pct = Math.max(0, Math.min(100, Math.round(confidence * 100)));
    this.confidenceFill.style.width = `${pct}%`;
    this.confidenceMeter.setAttribute('aria-valuenow', String(pct));
    // Strong lock (>=70%) gets the full violet glow so a screenshot reads
    // "in tune"; a weaker lock stays dimmer.
    this.confidenceMeter.classList.toggle('locked', pct >= 70);
  }

  /** Called externally when key detector identifies a key */
  setDetectedKey(root: string, scale: string, confidence: number): void {
    // Update the badge with the snapped key and a clear in-tune signal.
    const pct = Math.round(confidence * 100);
    this.detectedKeyBadge.textContent = `Snapped to ${root} ${scale} · ${pct}%`;
    this.detectedKeyBadge.classList.add('snapped');
    this.setConfidence(confidence);

    // Sync dropdowns
    this.rootSelect.value = root;
    this.scaleSelect.value = scale;
  }

  private makeBtn(label: string, active: boolean, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `btn${active ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private makeDivider(): HTMLDivElement {
    const d = document.createElement('div');
    d.className = 'divider';
    return d;
  }

  private makeSelect(options: string[], defaultVal: string, onChange: (val: string) => void): HTMLSelectElement {
    const sel = document.createElement('select');
    sel.className = 'toolbar-select';
    for (const opt of options) {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      if (opt === defaultVal) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  }

  private updateYModeActive(): void {
    for (const [key, btn] of this.yModeButtons) {
      btn.classList.toggle('active', key === this._yMode);
    }
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
