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
    this.container.setAttribute('role', 'toolbar');
    this.container.setAttribute('aria-label', 'Theremin controls');
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
      this.audioBtn.setAttribute('aria-pressed', String(this._audioOn));
      this.onAudioToggle?.(this._audioOn);
    });
    this.audioBtn.setAttribute('aria-pressed', 'true');
    this.container.appendChild(this.audioBtn);

    // Divider
    this.container.appendChild(this.makeDivider());

    // Y-axis mode buttons wrapped in a group
    const yModeGroup = document.createElement('div');
    yModeGroup.className = 'btn-group';
    for (const mode of Y_MODES) {
      const btn = this.makeBtn(mode.label, mode.key === this._yMode, () => {
        this._yMode = mode.key;
        this.updateYModeActive();
        this.onYModeChange?.(mode.key);
      });
      btn.classList.add('ymode-btn');
      btn.setAttribute('aria-pressed', String(mode.key === this._yMode));
      this.yModeButtons.set(mode.key, btn);
      yModeGroup.appendChild(btn);
    }
    this.container.appendChild(yModeGroup);
    this.updateYModeActive();

    // Divider
    this.container.appendChild(this.makeDivider());

    // Scale controls wrapped in a group
    const scaleGroup = document.createElement('div');
    scaleGroup.className = 'btn-group';

    // Scale snap toggle
    this.scaleSnapBtn = this.makeBtn('Scale: OFF', false, () => {
      this._scaleSnap = !this._scaleSnap;
      this.scaleSnapBtn.textContent = `Scale: ${this._scaleSnap ? 'ON' : 'OFF'}`;
      this.scaleSnapBtn.classList.toggle('active-pink', this._scaleSnap);
      this.scaleSnapBtn.setAttribute('aria-pressed', String(this._scaleSnap));
      this.rootSelect.style.display = this._scaleSnap ? '' : 'none';
      this.scaleSelect.style.display = this._scaleSnap ? '' : 'none';
      this.onScaleSnapToggle?.(this._scaleSnap);
    });
    this.scaleSnapBtn.setAttribute('aria-pressed', 'false');
    scaleGroup.appendChild(this.scaleSnapBtn);

    // Root note select
    this.rootSelect = this.makeSelect(ROOT_NOTES, 'C', (val) => {
      this.onRootChange?.(val);
    });
    this.rootSelect.setAttribute('aria-label', 'Root note');
    this.rootSelect.style.display = 'none';
    scaleGroup.appendChild(this.rootSelect);

    // Scale select
    this.scaleSelect = this.makeSelect(SCALE_NAMES, 'Major', (val) => {
      this.onScaleChange?.(val);
    });
    this.scaleSelect.setAttribute('aria-label', 'Scale type');
    this.scaleSelect.style.display = 'none';
    scaleGroup.appendChild(this.scaleSelect);

    this.container.appendChild(scaleGroup);

    // Divider
    this.container.appendChild(this.makeDivider());

    // Listen controls wrapped in a group
    const listenGroup = document.createElement('div');
    listenGroup.className = 'btn-group';

    // Listen toggle
    this.listenBtn = this.makeBtn('Listen', false, () => {
      this._listening = !this._listening;
      this.listenBtn.classList.toggle('active-listen', this._listening);
      this.listenBtn.textContent = this._listening ? 'Listening...' : 'Listen';
      this.listenBtn.setAttribute('aria-pressed', String(this._listening));

      if (this._listening) {
        // Auto-enable scale snap
        if (!this._scaleSnap) {
          this._scaleSnap = true;
          this.scaleSnapBtn.textContent = 'Scale: ON';
          this.scaleSnapBtn.classList.add('active-pink');
          this.scaleSnapBtn.setAttribute('aria-pressed', 'true');
          this.rootSelect.style.display = '';
          this.scaleSelect.style.display = '';
          this.onScaleSnapToggle?.(true);
        }
        this.detectedKeyBadge.style.display = '';
      } else {
        this.detectedKeyBadge.style.display = 'none';
      }

      this.onListenToggle?.(this._listening);
    });
    this.listenBtn.classList.add('listen-btn');
    this.listenBtn.setAttribute('aria-pressed', 'false');
    listenGroup.appendChild(this.listenBtn);

    // Detected key badge (hidden until listening), wrapped in aria-live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    this.detectedKeyBadge = document.createElement('span');
    this.detectedKeyBadge.className = 'detected-key-badge';
    this.detectedKeyBadge.textContent = '...';
    this.detectedKeyBadge.style.display = 'none';
    liveRegion.appendChild(this.detectedKeyBadge);
    listenGroup.appendChild(liveRegion);

    this.container.appendChild(listenGroup);
  }

  /** Called externally when key detector identifies a key */
  setDetectedKey(root: string, scale: string, confidence: number): void {
    // Update the badge
    const pct = Math.round(confidence * 100);
    this.detectedKeyBadge.textContent = `${root} ${scale} (${pct}%)`;

    // Sync dropdowns
    this.rootSelect.value = root;
    this.scaleSelect.value = scale;
  }

  // Public accessors so keyboard shortcuts can toggle controls
  toggleAudio(): void {
    this.audioBtn.click();
  }

  toggleScaleSnap(): void {
    this.scaleSnapBtn.click();
  }

  toggleListen(): void {
    this.listenBtn.click();
  }

  setYMode(mode: YAxisMode): void {
    const btn = this.yModeButtons.get(mode);
    if (btn) btn.click();
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
      const isActive = key === this._yMode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    }
  }

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
