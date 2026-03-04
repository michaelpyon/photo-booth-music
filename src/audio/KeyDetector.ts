import { detectChord, type ChordResult } from './chordDetector.ts';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Krumhansl-Schmuckler key profiles
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export interface DetectedKey {
  root: string;
  quality: 'Major' | 'Minor';
  confidence: number;
}

export class KeyDetector {
  private ctx: AudioContext;
  private analyser: AnalyserNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private intervalId: number | null = null;
  private freqData: Float32Array<ArrayBuffer> | null = null;

  // Smoothed chroma vector — slow EMA for stability
  private smoothedChroma: Float32Array<ArrayBuffer> = new Float32Array(12);
  private smoothingAlpha = 0.08; // very slow: ~12 windows to fully shift

  // Hysteresis: require new key to win N consecutive windows with margin
  private pendingKey: DetectedKey | null = null;
  private pendingCount = 0;
  private readonly requiredConsecutive = 8; // ~2.4 sec at 300ms intervals

  // Vote accumulator: count how often each key wins over a sliding window
  private voteHistory: number[] = []; // encoded as root*2 + quality (0=maj, 1=min)
  private readonly voteWindowSize = 15; // ~4.5 sec of votes

  currentKey: DetectedKey | null = null;
  currentChord: ChordResult | null = null;
  isListening = false;

  onKeyChange: ((root: string, quality: 'Major' | 'Minor', confidence: number) => void) | null = null;
  onChordChange: ((chord: ChordResult | null) => void) | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  async start(): Promise<void> {
    if (this.isListening) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.micStream = stream;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 8192;
    this.analyser.smoothingTimeConstant = 0.85;

    this.micSource = this.ctx.createMediaStreamSource(stream);
    // Connect mic → analyser only (NOT to destination — no feedback)
    this.micSource.connect(this.analyser);

    this.freqData = new Float32Array(this.analyser.frequencyBinCount);
    this.smoothedChroma.fill(0);
    this.pendingKey = null;
    this.pendingCount = 0;
    this.voteHistory = [];
    this.isListening = true;

    // Analyze at ~3.3 Hz (every 300ms — slower = more stable)
    this.intervalId = window.setInterval(() => this.analyze(), 300);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.micSource?.disconnect();
    this.micSource = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.analyser?.disconnect();
    this.analyser = null;
    this.freqData = null;
    this.isListening = false;
  }

  private analyze(): void {
    if (!this.analyser || !this.freqData) return;

    this.analyser.getFloatFrequencyData(this.freqData);

    const chroma = this.extractChroma(this.freqData);

    // Exponential moving average for stable chroma
    for (let i = 0; i < 12; i++) {
      this.smoothedChroma[i] =
        this.smoothingAlpha * chroma[i] +
        (1 - this.smoothingAlpha) * this.smoothedChroma[i];
    }

    // Detect key via K-S with margin-of-victory check
    const result = this.krumhanslSchmuckler(this.smoothedChroma);
    const key = result.best;

    // Detect chord (from raw chroma for responsiveness)
    const chord = detectChord(chroma);
    const chordChanged =
      (chord === null) !== (this.currentChord === null) ||
      (chord && this.currentChord && chord.label !== this.currentChord.label);
    if (chordChanged) {
      this.currentChord = chord;
      this.onChordChange?.(chord);
    }

    // Reject if confidence too low or margin too thin
    if (key.confidence < 0.55 || result.margin < 0.05) return;

    // Voting system: accumulate votes over sliding window
    const voteCode = NOTE_NAMES.indexOf(key.root) * 2 + (key.quality === 'Minor' ? 1 : 0);
    this.voteHistory.push(voteCode);
    if (this.voteHistory.length > this.voteWindowSize) {
      this.voteHistory.shift();
    }

    // Count votes
    const voteCounts = new Map<number, number>();
    for (const v of this.voteHistory) {
      voteCounts.set(v, (voteCounts.get(v) ?? 0) + 1);
    }

    // Find the winner
    let winnerCode = voteCode;
    let winnerVotes = 0;
    let runnerUpVotes = 0;
    for (const [code, count] of voteCounts) {
      if (count > winnerVotes) {
        runnerUpVotes = winnerVotes;
        winnerVotes = count;
        winnerCode = code;
      } else if (count > runnerUpVotes) {
        runnerUpVotes = count;
      }
    }

    // Require the winner to have majority AND clear lead over runner-up
    const totalVotes = this.voteHistory.length;
    if (totalVotes < 5) return; // need minimum votes
    if (winnerVotes / totalVotes < 0.5) return; // need majority
    if (winnerVotes - runnerUpVotes < 2) return; // need clear lead

    const winnerRoot = NOTE_NAMES[Math.floor(winnerCode / 2)];
    const winnerQuality: 'Major' | 'Minor' = winnerCode % 2 === 1 ? 'Minor' : 'Major';

    // Consecutive agreement check on top of voting
    if (
      this.pendingKey &&
      this.pendingKey.root === winnerRoot &&
      this.pendingKey.quality === winnerQuality
    ) {
      this.pendingCount++;
    } else {
      this.pendingKey = { root: winnerRoot, quality: winnerQuality, confidence: key.confidence };
      this.pendingCount = 1;
    }

    if (this.pendingCount >= this.requiredConsecutive) {
      if (
        !this.currentKey ||
        this.currentKey.root !== winnerRoot ||
        this.currentKey.quality !== winnerQuality
      ) {
        this.currentKey = { root: winnerRoot, quality: winnerQuality, confidence: key.confidence };
        this.onKeyChange?.(winnerRoot, winnerQuality, key.confidence);
      } else {
        this.currentKey.confidence = key.confidence;
      }
    }
  }

  private extractChroma(freqData: Float32Array): Float32Array {
    const chroma = new Float32Array(12);
    const sampleRate = this.ctx.sampleRate;
    const fftSize = this.analyser!.fftSize;
    const binCount = freqData.length;

    // Musically relevant range: ~65 Hz (C2) to ~2100 Hz (C7)
    const minBin = Math.ceil((65 * fftSize) / sampleRate);
    const maxBin = Math.min(Math.floor((2100 * fftSize) / sampleRate), binCount - 1);

    // Noise floor: ignore bins below this threshold (dB)
    const noiseFloor = -60;

    for (let bin = minBin; bin <= maxBin; bin++) {
      if (freqData[bin] < noiseFloor) continue;

      const freq = (bin * sampleRate) / fftSize;

      // Convert dB to power (squared magnitude) — better pitch discrimination
      const power = Math.pow(10, freqData[bin] / 10);

      // Map frequency to pitch class
      const semitone = 12 * Math.log2(freq / 261.63); // relative to C4
      const pitchClass = ((Math.round(semitone) % 12) + 12) % 12;
      chroma[pitchClass] += power;
    }

    // Normalize to 0-1
    let max = 0;
    for (let i = 0; i < 12; i++) {
      if (chroma[i] > max) max = chroma[i];
    }
    if (max > 0) {
      for (let i = 0; i < 12; i++) {
        chroma[i] /= max;
      }
    }

    return chroma;
  }

  private krumhanslSchmuckler(chroma: Float32Array): { best: DetectedKey; margin: number } {
    const scores: { root: number; quality: 'Major' | 'Minor'; corr: number }[] = [];

    for (let root = 0; root < 12; root++) {
      scores.push({ root, quality: 'Major', corr: this.correlate(chroma, MAJOR_PROFILE, root) });
      scores.push({ root, quality: 'Minor', corr: this.correlate(chroma, MINOR_PROFILE, root) });
    }

    // Sort descending by correlation
    scores.sort((a, b) => b.corr - a.corr);

    const best = scores[0];
    const runnerUp = scores[1];
    const margin = best.corr - runnerUp.corr;

    const confidence = Math.max(0, Math.min(1, (best.corr + 1) / 2));

    return {
      best: { root: NOTE_NAMES[best.root], quality: best.quality, confidence },
      margin,
    };
  }

  private correlate(chroma: Float32Array, profile: number[], rootOffset: number): number {
    // Pearson correlation between rotated chroma and profile
    const n = 12;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const x = chroma[(i + rootOffset) % n];
      const y = profile[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }

    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return den === 0 ? 0 : num / den;
  }
}
