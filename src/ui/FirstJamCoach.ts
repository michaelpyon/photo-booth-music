/**
 * FirstJamCoach: a short, scripted "first jam" overlay so the live instrument
 * is never silent and unexplained for a first-timer.
 *
 * The empty instrument is powerful but unguided: a brand-new visitor sees their
 * webcam and does not know that the left hand is pitch, the right hand is
 * volume and effects, or that "Match the music" is the magic trick. This walks
 * them through 3 short prompts pinned to the top-center, then gets out of the
 * way. It does NOT touch the audio, tracking, or any mode state, it only shows
 * text, so it is fully additive.
 *
 * Shown once per device (localStorage). Advances on its own timer and on a
 * "Next" click, and can be skipped at any time.
 */

interface CoachStep {
  label: string;
  text: string;
  /** Auto-advance delay in ms once this step is shown. */
  hold: number;
}

const STEPS: CoachStep[] = [
  {
    label: 'PITCH',
    text: 'Raise your left hand into view. Move it left and right to change the pitch.',
    hold: 6000,
  },
  {
    label: 'TONE',
    text: 'Now raise your right hand. Move it up and down to shape the volume and tone.',
    hold: 6000,
  },
  {
    label: 'KEY',
    text: 'Want to sound in tune? Hit "Match the music" and play a song near your mic.',
    hold: 7000,
  },
];

export class FirstJamCoach {
  private el: HTMLDivElement;
  private labelEl: HTMLSpanElement;
  private textEl: HTMLSpanElement;
  private nextBtn: HTMLButtonElement;
  private dotsEl: HTMLDivElement;
  private index = 0;
  private timer = 0;
  private finished = false;

  private static readonly STORAGE_KEY = 'air-composer-first-jam-coached';

  static shouldShow(): boolean {
    return localStorage.getItem(FirstJamCoach.STORAGE_KEY) !== '1';
  }

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'first-jam-coach';
    this.el.setAttribute('role', 'status');
    this.el.setAttribute('aria-live', 'polite');

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'fjc-label';
    this.labelEl.setAttribute('aria-hidden', 'true');

    this.textEl = document.createElement('span');
    this.textEl.className = 'fjc-text';

    this.dotsEl = document.createElement('div');
    this.dotsEl.className = 'fjc-dots';
    this.dotsEl.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < STEPS.length; i++) {
      const dot = document.createElement('span');
      dot.className = 'fjc-dot';
      this.dotsEl.appendChild(dot);
    }

    this.nextBtn = document.createElement('button');
    this.nextBtn.type = 'button';
    this.nextBtn.className = 'fjc-next';
    this.nextBtn.textContent = 'Next';
    this.nextBtn.addEventListener('click', () => this.advance());

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'fjc-skip';
    skipBtn.setAttribute('aria-label', 'Skip the guided intro');
    skipBtn.textContent = 'Skip';
    skipBtn.addEventListener('click', () => this.finish());

    const content = document.createElement('div');
    content.className = 'fjc-content';
    content.appendChild(this.labelEl);
    content.appendChild(this.textEl);

    const controls = document.createElement('div');
    controls.className = 'fjc-controls';
    controls.appendChild(this.dotsEl);
    controls.appendChild(this.nextBtn);
    controls.appendChild(skipBtn);

    this.el.appendChild(content);
    this.el.appendChild(controls);
    document.body.appendChild(this.el);

    this.render();
    requestAnimationFrame(() => this.el.classList.add('visible'));
    this.scheduleAuto();
  }

  private render(): void {
    const step = STEPS[this.index];
    this.labelEl.textContent = step.label;
    this.textEl.textContent = step.text;
    this.nextBtn.textContent = this.index === STEPS.length - 1 ? 'Got it' : 'Next';
    const dots = this.dotsEl.querySelectorAll('.fjc-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === this.index));
  }

  private scheduleAuto(): void {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.advance(), STEPS[this.index].hold);
  }

  private advance(): void {
    if (this.finished) return;
    if (this.index >= STEPS.length - 1) {
      this.finish();
      return;
    }
    this.index += 1;
    this.render();
    this.scheduleAuto();
  }

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    window.clearTimeout(this.timer);
    localStorage.setItem(FirstJamCoach.STORAGE_KEY, '1');
    this.el.classList.remove('visible');
    setTimeout(() => this.el.remove(), 300);
  }
}
