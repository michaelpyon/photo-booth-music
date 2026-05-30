import type { AudioEngine } from '../audio/AudioEngine.ts';

const MAX_SECONDS = 15;

/** Codec preference: vp9 + opus first, then vp8, then plain webm. */
const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
];

export type RecorderState = 'idle' | 'recording' | 'ready';

/** Result handed back when a clip finishes. */
export interface Clip {
  blob: Blob;
  url: string;
  file: File;
}

/**
 * Records the visible overlay canvas plus the live audio mix into one webm
 * clip. Caps at 15 seconds, then exposes download and (where supported) Web
 * Share paths. Self-contained: if MediaRecorder or a webm codec is missing,
 * isSupported() returns false and the caller hides the feature.
 */
export class ClipRecorder {
  private canvas: HTMLCanvasElement;
  private audio: AudioEngine;
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private stream: MediaStream | null = null;
  private audioTap: MediaStreamAudioDestinationNode | null = null;
  private stopTimer = 0;
  private tickTimer = 0;
  private mimeType = '';

  state: RecorderState = 'idle';
  readonly maxSeconds = MAX_SECONDS;

  /** Fires once per second while recording with seconds remaining. */
  onTick: ((remaining: number) => void) | null = null;
  /** Fires when a finished clip is ready. */
  onClip: ((clip: Clip) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, audio: AudioEngine) {
    this.canvas = canvas;
    this.audio = audio;
  }

  /** Feature detection. Call before showing the record control. */
  static isSupported(canvas: HTMLCanvasElement): boolean {
    if (typeof MediaRecorder === 'undefined') return false;
    if (typeof canvas.captureStream !== 'function') return false;
    return MIME_CANDIDATES.some((m) => MediaRecorder.isTypeSupported(m));
  }

  private pickMime(): string {
    for (const m of MIME_CANDIDATES) {
      if (MediaRecorder.isTypeSupported(m)) return m;
    }
    return '';
  }

  start(): boolean {
    if (this.state === 'recording') return false;

    const videoStream = this.canvas.captureStream(30);
    this.audioTap = this.audio.createRecordingTap();

    const tracks = [
      ...videoStream.getVideoTracks(),
      ...this.audioTap.stream.getAudioTracks(),
    ];
    this.stream = new MediaStream(tracks);

    this.mimeType = this.pickMime();
    try {
      this.recorder = this.mimeType
        ? new MediaRecorder(this.stream, { mimeType: this.mimeType })
        : new MediaRecorder(this.stream);
    } catch (_e) {
      this.cleanup();
      return false;
    }

    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.onstop = () => this.finish();

    this.recorder.start();
    this.state = 'recording';

    let remaining = MAX_SECONDS;
    this.onTick?.(remaining);
    this.tickTimer = window.setInterval(() => {
      remaining -= 1;
      this.onTick?.(remaining);
    }, 1000);

    this.stopTimer = window.setTimeout(() => this.stop(), MAX_SECONDS * 1000);
    return true;
  }

  stop(): void {
    if (this.state !== 'recording' || !this.recorder) return;
    window.clearTimeout(this.stopTimer);
    window.clearInterval(this.tickTimer);
    if (this.recorder.state !== 'inactive') this.recorder.stop();
  }

  private finish(): void {
    const type = this.mimeType || 'video/webm';
    const blob = new Blob(this.chunks, { type });
    const url = URL.createObjectURL(blob);
    const file = new File([blob], this.fileName(), { type });
    this.cleanup();
    this.state = 'ready';
    this.onClip?.({ blob, url, file });
  }

  private fileName(): string {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    return `air-composer-${stamp}.webm`;
  }

  /** Whether the browser can share files via the Web Share API. */
  canShare(file: File): boolean {
    return (
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    );
  }

  /** Attempt a native file share. Resolves false if it is unsupported. */
  async share(clip: Clip): Promise<boolean> {
    if (!this.canShare(clip.file)) return false;
    try {
      await navigator.share({
        files: [clip.file],
        title: 'Air Composer',
        text: 'I just played this with my hands on Air Composer.',
      });
      return true;
    } catch (_e) {
      return false;
    }
  }

  private cleanup(): void {
    window.clearTimeout(this.stopTimer);
    window.clearInterval(this.tickTimer);
    // Detach the recording tap from the analyser so it stops drawing the
    // mix. The analyser stays wired to the speakers, so playback is intact.
    if (this.audioTap) {
      try {
        this.audio.analyser.disconnect(this.audioTap);
      } catch (_e) {
        // Already disconnected; harmless.
      }
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.audioTap = null;
    this.recorder = null;
  }

  reset(): void {
    this.state = 'idle';
  }
}
