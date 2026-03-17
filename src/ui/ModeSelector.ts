export type ModeName = 'theremin' | 'formant';

export class ModeSelector {
  private container: HTMLElement;
  private buttons: Map<ModeName, HTMLButtonElement> = new Map();
  private _current: ModeName = 'theremin';
  onChange: ((mode: ModeName) => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.setAttribute('role', 'radiogroup');
    this.container.setAttribute('aria-label', 'Instrument mode');
    this.createButtons();
  }

  private createButtons(): void {
    const modes: { key: ModeName; label: string }[] = [
      { key: 'theremin', label: 'Theremin' },
      { key: 'formant', label: 'Voice Box' },
    ];

    for (const mode of modes) {
      const btn = document.createElement('button');
      btn.className = 'btn mode-btn';
      btn.textContent = mode.label;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(mode.key === this._current));
      btn.addEventListener('click', () => this.select(mode.key));
      this.container.appendChild(btn);
      this.buttons.set(mode.key, btn);
    }

    this.updateActive();
  }

  select(mode: ModeName): void {
    if (mode === this._current) return;
    this._current = mode;
    this.updateActive();
    this.onChange?.(mode);
  }

  private updateActive(): void {
    for (const [key, btn] of this.buttons) {
      const isActive = key === this._current;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    }
  }

  get current(): ModeName {
    return this._current;
  }
}
