import { ClipRecorder } from '../recording/ClipRecorder.ts';
import type { Clip } from '../recording/ClipRecorder.ts';
import type { AudioEngine } from '../audio/AudioEngine.ts';

// Canonical public URL for this app (verified live, matches the canonical
// and og:url in index.html). Used for the share-link intents below.
const APP_URL = 'https://air-composer.michaelpyon.com';
const SHARE_CAPTION =
  'I just played this with my hands using only a webcam, no installs. Air Composer:';

/**
 * Floating "Record clip" control plus the result panel. Lives over the
 * viewport so a player can capture a 15 second clip of their hands making
 * music and then download or share it. Additive: it does not touch the
 * instrument or landing flow.
 */
export class ClipRecorderUI {
  private recorder: ClipRecorder;
  private root: HTMLElement;
  private recordBtn!: HTMLButtonElement;
  private timeLabel!: HTMLSpanElement;
  private panel!: HTMLElement;
  private lastClip: Clip | null = null;

  constructor(canvas: HTMLCanvasElement, audio: AudioEngine) {
    this.recorder = new ClipRecorder(canvas, audio);
    this.root = this.build();
    document.body.appendChild(this.root);

    if (!ClipRecorder.isSupported(canvas)) {
      this.recordBtn.disabled = true;
      this.recordBtn.title =
        'Clip recording is not supported in this browser. Try the latest Chrome, Edge, or Firefox on desktop.';
      this.recordBtn.classList.add('clip-btn-disabled');
    }

    this.recorder.onTick = (remaining) => {
      this.timeLabel.textContent = `0:${String(Math.max(0, remaining)).padStart(2, '0')}`;
    };
    this.recorder.onClip = (clip) => this.showResult(clip);
  }

  private build(): HTMLElement {
    const root = document.createElement('div');
    root.id = 'clip-recorder';

    this.recordBtn = document.createElement('button');
    this.recordBtn.type = 'button';
    this.recordBtn.className = 'clip-btn';
    this.recordBtn.innerHTML =
      '<span class="clip-dot" aria-hidden="true"></span><span class="clip-label">Record clip</span><span class="clip-time"></span>';
    this.timeLabel = this.recordBtn.querySelector('.clip-time') as HTMLSpanElement;
    this.recordBtn.addEventListener('click', () => this.toggle());
    root.appendChild(this.recordBtn);

    this.panel = document.createElement('div');
    this.panel.className = 'clip-panel hidden';
    root.appendChild(this.panel);

    return root;
  }

  private toggle(): void {
    if (this.recorder.state === 'recording') {
      this.recorder.stop();
      return;
    }
    const started = this.recorder.start();
    if (!started) return;
    this.recordBtn.classList.add('recording');
    this.recordBtn.querySelector('.clip-label')!.textContent = 'Stop';
    this.hidePanel();
  }

  private showResult(clip: Clip): void {
    this.lastClip = clip;
    this.recordBtn.classList.remove('recording');
    this.recordBtn.querySelector('.clip-label')!.textContent = 'Record clip';
    this.timeLabel.textContent = '';

    this.panel.innerHTML = '';

    const video = document.createElement('video');
    video.className = 'clip-preview';
    video.src = clip.url;
    video.controls = true;
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    this.panel.appendChild(video);

    const actions = document.createElement('div');
    actions.className = 'clip-actions';

    const download = document.createElement('a');
    download.className = 'clip-action clip-download';
    download.textContent = 'Download clip';
    download.href = clip.url;
    download.download = clip.file.name;
    actions.appendChild(download);

    if (this.recorder.canShare(clip.file)) {
      const shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.className = 'clip-action clip-share';
      shareBtn.textContent = 'Share clip';
      shareBtn.addEventListener('click', async () => {
        const ok = await this.recorder.share(clip);
        if (!ok) download.click();
      });
      actions.appendChild(shareBtn);
    }

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'clip-action clip-close';
    close.textContent = 'Done';
    close.addEventListener('click', () => this.hidePanel());
    actions.appendChild(close);

    this.panel.appendChild(actions);

    // Share-link row. A tweet or Reddit post cannot carry a local video file
    // via a web intent, so these prefill a post with the app link and caption
    // and the player attaches their downloaded clip. Always available, no
    // dependency on the Web Share API.
    const shareRow = document.createElement('div');
    shareRow.className = 'clip-share-row';

    const shareTo = document.createElement('span');
    shareTo.className = 'clip-share-to';
    shareTo.textContent = 'Post the link';
    shareRow.appendChild(shareTo);

    const xLink = document.createElement('a');
    xLink.className = 'clip-link clip-link-x';
    xLink.textContent = 'X';
    xLink.target = '_blank';
    xLink.rel = 'noopener noreferrer';
    xLink.href =
      'https://twitter.com/intent/tweet?text=' +
      encodeURIComponent(`${SHARE_CAPTION} ${APP_URL}`);
    shareRow.appendChild(xLink);

    const redditLink = document.createElement('a');
    redditLink.className = 'clip-link clip-link-reddit';
    redditLink.textContent = 'Reddit';
    redditLink.target = '_blank';
    redditLink.rel = 'noopener noreferrer';
    redditLink.href =
      'https://www.reddit.com/submit?url=' +
      encodeURIComponent(APP_URL) +
      '&title=' +
      encodeURIComponent('Air Composer: play a theremin with your hands, just a webcam');
    shareRow.appendChild(redditLink);

    const copyLink = document.createElement('button');
    copyLink.type = 'button';
    copyLink.className = 'clip-link clip-link-copy';
    copyLink.textContent = 'Copy link';
    copyLink.addEventListener('click', async () => {
      const original = 'Copy link';
      try {
        await navigator.clipboard.writeText(APP_URL);
        copyLink.textContent = 'Copied';
      } catch (_e) {
        copyLink.textContent = APP_URL;
      }
      window.setTimeout(() => {
        copyLink.textContent = original;
      }, 1800);
    });
    shareRow.appendChild(copyLink);

    this.panel.appendChild(shareRow);

    const saved = document.createElement('p');
    saved.className = 'clip-saved';
    saved.textContent = 'Clip saved. Download it, then post the link and attach your clip.';
    this.panel.appendChild(saved);

    this.panel.classList.remove('hidden');
    this.recorder.reset();
  }

  private hidePanel(): void {
    this.panel.classList.add('hidden');
    if (this.lastClip) {
      URL.revokeObjectURL(this.lastClip.url);
      this.lastClip = null;
    }
  }
}
