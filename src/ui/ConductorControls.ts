import { ALL_SONGS } from '../data/songs/index.ts';

export class ConductorControls {
  private container: HTMLElement;
  private songSelect!: HTMLSelectElement;
  private playPauseBtn!: HTMLButtonElement;
  private tempoDisplay!: HTMLSpanElement;
  private generativeBtn!: HTMLButtonElement;

  private _playing = false;
  private _generativeMode = false;

  onSongChange: ((index: number) => void) | null = null;
  onPlayPause: (() => void) | null = null;
  onGenerativeToggle: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.build();
  }

  private build(): void {
    // Divider after mode selector
    this.container.appendChild(this.makeDivider());

    // Song selector
    this.songSelect = document.createElement('select');
    this.songSelect.className = 'toolbar-select';
    for (let i = 0; i < ALL_SONGS.length; i++) {
      const song = ALL_SONGS[i];
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${song.composer}: ${song.name}`;
      this.songSelect.appendChild(opt);
    }
    this.songSelect.addEventListener('change', () => {
      this.onSongChange?.(parseInt(this.songSelect.value, 10));
    });
    this.container.appendChild(this.songSelect);

    // Play/Pause button
    this.playPauseBtn = this.makeBtn('Play', false, () => {
      this.onPlayPause?.();
    });
    this.playPauseBtn.classList.add('conductor-play-btn');
    this.container.appendChild(this.playPauseBtn);

    // Divider
    this.container.appendChild(this.makeDivider());

    // Tempo display
    this.tempoDisplay = document.createElement('span');
    this.tempoDisplay.className = 'tempo-display';
    this.tempoDisplay.textContent = '-- BPM';
    this.container.appendChild(this.tempoDisplay);

    // Divider
    this.container.appendChild(this.makeDivider());

    // Generative mode toggle
    this.generativeBtn = this.makeBtn('Generative', false, () => {
      this.onGenerativeToggle?.();
    });
    this.generativeBtn.classList.add('generative-btn');
    this.container.appendChild(this.generativeBtn);
  }

  updatePlaying(playing: boolean): void {
    this._playing = playing;
    this.playPauseBtn.textContent = playing ? 'Pause' : 'Play';
    this.playPauseBtn.classList.toggle('active', playing);
  }

  updateTempo(bpm: number): void {
    this.tempoDisplay.textContent = `${Math.round(bpm)} BPM`;
  }

  updateGenerative(on: boolean): void {
    this._generativeMode = on;
    this.generativeBtn.classList.toggle('active-pink', on);
    this.generativeBtn.textContent = on ? 'Generative: ON' : 'Generative';
    // Disable song select in generative mode
    this.songSelect.disabled = on;
    this.songSelect.style.opacity = on ? '0.4' : '1';
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

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }
}
