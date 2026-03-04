export type ModeName = 'theremin' | 'formant';

export class ModeSelector {
  private container: HTMLElement;
  private buttons: Map<ModeName, HTMLButtonElement> = new Map();
  private _current: ModeName = 'theremin';
  onChange: ((mode: ModeName) => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
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
      btn.classList.toggle('active', key === this._current);
    }
  }

  get current(): ModeName {
    return this._current;
  }
}
