/**
 * KeyboardHints: a small, dismissible chip pinned to the bottom-left of the
 * viewport that surfaces the per-mode keyboard shortcuts.
 *
 * The app already wires Arrow keys (theremin pitch range), H (formant guide),
 * and Space (conductor play/pause) in main.ts, but those were completely
 * undiscoverable. A first-time visitor had no way to learn them, so they went
 * unused. This component shows the shortcuts for whichever mode is active and
 * lets the visitor dismiss it (remembered per device).
 *
 * Fully additive: no existing behavior changes. Call setMode() whenever the
 * active mode changes.
 */
export type HintMode = 'theremin' | 'formant' | 'conductor';

const HINTS: Record<HintMode, { keys: string[]; label: string }> = {
  theremin: { keys: ['Up', 'Down'], label: 'shift pitch range' },
  formant: { keys: ['H'], label: 'toggle the guide' },
  conductor: { keys: ['Space'], label: 'play and pause' },
};

export class KeyboardHints {
  private el: HTMLDivElement;
  private keysEl: HTMLSpanElement;
  private labelEl: HTMLSpanElement;
  private dismissed = false;

  private static readonly STORAGE_KEY = 'air-composer-kbd-hint-dismissed';

  constructor(initialMode: HintMode = 'theremin') {
    this.dismissed = localStorage.getItem(KeyboardHints.STORAGE_KEY) === '1';

    this.el = document.createElement('div');
    this.el.className = 'kbd-hints';
    this.el.setAttribute('role', 'note');
    this.el.setAttribute('aria-label', 'Keyboard shortcut');

    this.keysEl = document.createElement('span');
    this.keysEl.className = 'kbd-hints-keys';

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'kbd-hints-label';

    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'kbd-hints-dismiss';
    dismissBtn.type = 'button';
    dismissBtn.setAttribute('aria-label', 'Hide keyboard hint');
    dismissBtn.textContent = '×';
    dismissBtn.addEventListener('click', () => this.dismiss());

    this.el.appendChild(this.keysEl);
    this.el.appendChild(this.labelEl);
    this.el.appendChild(dismissBtn);
    document.body.appendChild(this.el);

    this.setMode(initialMode);

    if (this.dismissed) {
      this.el.style.display = 'none';
    } else {
      requestAnimationFrame(() => this.el.classList.add('visible'));
    }
  }

  setMode(mode: HintMode): void {
    const hint = HINTS[mode];
    this.keysEl.innerHTML = hint.keys
      .map((k) => `<kbd>${k}</kbd>`)
      .join('');
    this.labelEl.textContent = hint.label;
  }

  private dismiss(): void {
    this.dismissed = true;
    localStorage.setItem(KeyboardHints.STORAGE_KEY, '1');
    this.el.classList.remove('visible');
    setTimeout(() => {
      this.el.style.display = 'none';
    }, 250);
  }
}
