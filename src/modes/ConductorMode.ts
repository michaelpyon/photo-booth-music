import { ConductorEngine } from '../audio/ConductorEngine.ts';
import { GenerativeEngine } from '../data/songs/generative.ts';
import { drawConductorOverlay } from '../rendering/ConductorOverlay.ts';
import type { CanvasRenderer } from '../rendering/CanvasRenderer.ts';
import type { TrackingResult } from '../tracking/HandTracker.ts';
import type { SongData, InstrumentGroup } from '../data/songs/types.ts';
import { ALL_GROUPS } from '../data/songs/types.ts';
import { ALL_SONGS } from '../data/songs/index.ts';

export interface ConductorState {
  volume: number;
  tempo: number;
  defaultTempo: number;
  instrumentBalance: number; // 0 = solo, 1 = full ensemble
  mutedGroups: Set<InstrumentGroup>;
  leftHandY: number | null;
  leftHandX: number | null;
  rightHandY: number | null;
  rightHandX: number | null;
  playing: boolean;
  songName: string;
  generativeMode: boolean;
}

export class ConductorMode {
  name = 'Conductor';
  private engine: ConductorEngine | null = null;
  private generativeEngine: GenerativeEngine | null = null;
  private _generativeMode = false;
  private _currentSongIndex = 0;

  // Smoothed gesture values
  private _volume = 0.7;
  private _tempo = 120;
  private _defaultTempo = 120;
  private _instrumentBalance = 1.0;
  private _mutedGroups: Set<InstrumentGroup> = new Set();

  // Hand positions for overlay (canvas coords)
  private leftHandX: number | null = null;
  private leftHandY: number | null = null;
  private rightHandX: number | null = null;
  private rightHandY: number | null = null;

  // Velocity tracking for right hand tempo detection
  private prevRightX: number | null = null;
  private prevTimestamp = 0;
  private velocitySmoothed = 0;

  // Fist detection
  private leftFist = false;
  private rightFist = false;

  // Callbacks
  onStateChange: ((state: ConductorState) => void) | null = null;

  activate(): void {
    this.engine = new ConductorEngine();
  }

  deactivate(): void {
    this.generativeEngine?.stop();
    this.generativeEngine = null;
    this.engine?.stop();
    this.engine?.destroy();
    this.engine = null;
    this.leftHandX = null;
    this.leftHandY = null;
    this.rightHandX = null;
    this.rightHandY = null;
    this.prevRightX = null;
  }

  async playSong(index?: number): Promise<void> {
    if (!this.engine) return;
    if (this._generativeMode) {
      this.generativeEngine?.stop();
      this._generativeMode = false;
    }

    if (index !== undefined) this._currentSongIndex = index;
    const song = ALL_SONGS[this._currentSongIndex];
    if (!song) return;

    this._defaultTempo = song.defaultBpm;
    this._tempo = song.defaultBpm;
    await this.engine.play(song);
    this.emitState();
  }

  async startGenerative(): Promise<void> {
    if (!this.engine) return;
    this.engine.stop();
    this._generativeMode = true;
    this._defaultTempo = 120;
    this._tempo = 120;

    this.generativeEngine = new GenerativeEngine(this.engine);
    await this.generativeEngine.start(120);
    this.emitState();
  }

  pause(): void {
    if (this._generativeMode) {
      this.generativeEngine?.stop();
    } else {
      this.engine?.pause();
    }
    this.emitState();
  }

  resume(): void {
    if (this._generativeMode) {
      if (this.generativeEngine && !this.generativeEngine.isRunning) {
        this.startGenerative();
      }
    } else {
      this.engine?.resume();
    }
    this.emitState();
  }

  stop(): void {
    this.generativeEngine?.stop();
    this.generativeEngine = null;
    this.engine?.stop();
    this._generativeMode = false;
    this.emitState();
  }

  onTrackingResult(result: TrackingResult, renderer: CanvasRenderer): void {
    if (!this.engine) return;

    const now = result.timestamp;
    const dt = this.prevTimestamp > 0 ? (now - this.prevTimestamp) / 1000 : 0.016;
    this.prevTimestamp = now;

    // Classify hands by handedness
    let leftHand: TrackingResult['hands'][0] | null = null;
    let rightHand: TrackingResult['hands'][0] | null = null;

    for (const hand of result.hands) {
      if (hand.handedness === 'Left') {
        // Camera-mirrored: "Left" in mediapipe = user's right hand shown on left
        rightHand = hand;
      } else {
        leftHand = hand;
      }
    }

    // If only one hand, treat it as left (volume control)
    if (result.hands.length === 1 && !leftHand) {
      leftHand = result.hands[0];
      rightHand = null;
    }

    // LEFT HAND: Volume control (Y position)
    if (leftHand) {
      const tip = leftHand.landmarks[8];
      this.leftHandX = renderer.landmarkX(tip.x);
      this.leftHandY = renderer.landmarkY(tip.y);

      // Y inverted: top of screen (low Y) = loud
      const normY = 1 - tip.y;
      const targetVol = Math.max(0, Math.min(1, normY));
      this._volume += (targetVol - this._volume) * 0.15;
      this.engine.setMasterVolume(this._volume);

      // Fist detection for muting
      this.leftFist = this.isFist(leftHand.landmarks);
    } else {
      this.leftHandX = null;
      this.leftHandY = null;
      this.leftFist = false;
    }

    // RIGHT HAND: Tempo control (X velocity)
    if (rightHand) {
      const tip = rightHand.landmarks[8];
      this.rightHandX = renderer.landmarkX(tip.x);
      this.rightHandY = renderer.landmarkY(tip.y);

      // Velocity detection for tempo
      const normX = 1 - tip.x;
      if (this.prevRightX !== null && dt > 0) {
        const velocity = Math.abs(normX - this.prevRightX) / dt;
        this.velocitySmoothed += (velocity - this.velocitySmoothed) * 0.2;

        // Map velocity to tempo adjustment
        // Low velocity (< 0.3) = slow down slightly
        // Medium velocity (0.3-1.0) = normal tempo
        // High velocity (> 1.0) = speed up
        const tempoMultiplier = 0.7 + this.velocitySmoothed * 0.6;
        const targetTempo = this._defaultTempo * Math.max(0.5, Math.min(2.0, tempoMultiplier));
        this._tempo += (targetTempo - this._tempo) * 0.08;
        this.engine.setTempo(this._tempo);
      }
      this.prevRightX = normX;

      this.rightFist = this.isFist(rightHand.landmarks);
    } else {
      this.rightHandX = null;
      this.rightHandY = null;
      this.prevRightX = null;
      this.rightFist = false;
    }

    // HAND DISTANCE: Instrument balance
    if (leftHand && rightHand) {
      const lTip = leftHand.landmarks[8];
      const rTip = rightHand.landmarks[8];
      const dx = lTip.x - rTip.x;
      const dy = lTip.y - rTip.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Normalize: close (< 0.1) = solo, spread (> 0.5) = full ensemble
      const balance = Math.max(0, Math.min(1, (dist - 0.1) / 0.4));
      this._instrumentBalance += (balance - this._instrumentBalance) * 0.1;

      // Apply balance: when close, reduce some groups
      this.applyInstrumentBalance();
    }

    // FIST DETECTION: mute nearest group
    this.updateFistMuting();

    this.emitState();
  }

  private isFist(landmarks: TrackingResult['hands'][0]['landmarks']): boolean {
    // Check if fingers are curled: compare fingertip Y to knuckle Y
    // Tips: 8 (index), 12 (middle), 16 (ring), 20 (pinky)
    // Knuckles (MCP): 5, 9, 13, 17
    let curled = 0;
    const tipIds = [8, 12, 16, 20];
    const knuckleIds = [5, 9, 13, 17];
    for (let i = 0; i < 4; i++) {
      const tip = landmarks[tipIds[i]];
      const knuckle = landmarks[knuckleIds[i]];
      if (tip.y > knuckle.y) curled++;
    }
    return curled >= 3;
  }

  private applyInstrumentBalance(): void {
    if (!this.engine) return;

    // Full ensemble: all groups at their volume
    // Solo (balance near 0): only strings + bass, others quiet
    const groupVolumes: Record<InstrumentGroup, number> = {
      strings: 0.7 + 0.1 * this._instrumentBalance,
      woodwinds: 0.1 + 0.6 * this._instrumentBalance,
      brass: 0.05 + 0.55 * this._instrumentBalance,
      percussion: 0.1 + 0.5 * this._instrumentBalance,
      bass: 0.5 + 0.2 * this._instrumentBalance,
    };

    for (const group of ALL_GROUPS) {
      if (!this._mutedGroups.has(group)) {
        this.engine.setGroupVolume(group, groupVolumes[group]);
      }
    }
  }

  private updateFistMuting(): void {
    if (!this.engine) return;

    // If either hand is a fist, mute based on position
    const fists: { x: number | null; y: number | null }[] = [];
    if (this.leftFist && this.leftHandX !== null) {
      fists.push({ x: this.leftHandX, y: this.leftHandY });
    }
    if (this.rightFist && this.rightHandX !== null) {
      fists.push({ x: this.rightHandX, y: this.rightHandY });
    }

    // Clear previous mutes
    const prevMuted = new Set(this._mutedGroups);
    this._mutedGroups.clear();

    if (fists.length > 0) {
      // Map vertical position to instrument group
      // Top = strings, upper-mid = woodwinds, mid = brass, lower-mid = percussion, bottom = bass
      for (const fist of fists) {
        if (fist.y === null) continue;
        const normY = fist.y / (window.innerHeight || 720);
        let group: InstrumentGroup;
        if (normY < 0.2) group = 'strings';
        else if (normY < 0.4) group = 'woodwinds';
        else if (normY < 0.6) group = 'brass';
        else if (normY < 0.8) group = 'percussion';
        else group = 'bass';
        this._mutedGroups.add(group);
      }
    }

    // Apply mute changes
    for (const group of ALL_GROUPS) {
      if (this._mutedGroups.has(group) && !prevMuted.has(group)) {
        this.engine.muteGroup(group);
      } else if (!this._mutedGroups.has(group) && prevMuted.has(group)) {
        this.engine.unmuteGroup(group);
      }
    }
  }

  render(renderer: CanvasRenderer): void {
    drawConductorOverlay(renderer, this.getState());
  }

  getState(): ConductorState {
    return {
      volume: this._volume,
      tempo: this._tempo,
      defaultTempo: this._defaultTempo,
      instrumentBalance: this._instrumentBalance,
      mutedGroups: this._mutedGroups,
      leftHandY: this.leftHandY,
      leftHandX: this.leftHandX,
      rightHandY: this.rightHandY,
      rightHandX: this.rightHandX,
      playing: this.engine?.playing ?? false,
      songName: this._generativeMode
        ? 'Generative'
        : (ALL_SONGS[this._currentSongIndex]?.name ?? ''),
      generativeMode: this._generativeMode,
    };
  }

  private emitState(): void {
    this.onStateChange?.(this.getState());
  }

  get currentSongIndex(): number {
    return this._currentSongIndex;
  }

  get generativeMode(): boolean {
    return this._generativeMode;
  }

  get playing(): boolean {
    return this.engine?.playing ?? false;
  }
}
