export class AudioEngine {
  ctx: AudioContext;
  masterGain: GainNode;
  analyser: AnalyserNode;

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  async resume(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Tap the master output as a MediaStream for recording. Every instrument
   * routes through masterGain, so the analyser node (masterGain -> analyser
   * -> destination) carries the full mix. We fan that same signal into a
   * MediaStreamAudioDestinationNode without touching the existing path to the
   * speakers, so playback is unchanged while recording captures the live mix.
   */
  createRecordingTap(): MediaStreamAudioDestinationNode {
    const dest = this.ctx.createMediaStreamDestination();
    this.analyser.connect(dest);
    return dest;
  }

  get currentTime(): number {
    return this.ctx.currentTime;
  }
}
