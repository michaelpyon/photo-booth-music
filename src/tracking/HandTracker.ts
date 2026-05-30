import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface HandData {
  landmarks: NormalizedLandmark[];
  handedness: 'Left' | 'Right';
}

export interface TrackingResult {
  hands: HandData[];
  timestamp: number;
}

export class HandTracker {
  private handLandmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement;
  private lastVideoTime = -1;
  private running = false;
  private onResult: (result: TrackingResult) => void;

  constructor(video: HTMLVideoElement, onResult: (result: TrackingResult) => void) {
    this.video = video;
    this.onResult = onResult;
  }

  async init(): Promise<void> {
    // Pin the MediaPipe WASM + model versions. Floating @latest is a
    // reliability landmine: a CDN-side bump can break the live app silently.
    // Keep this in sync with the @mediapipe/tasks-vision version in package.json.
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
      );
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        numHands: 2,
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (e) {
      // Surface a clear failure so the boot flow can show a retry card
      // instead of hanging on a forever-spinner.
      throw new Error(
        `Hand tracking model failed to load. ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  start(): void {
    this.running = true;
    this.detect();
  }

  stop(): void {
    this.running = false;
  }

  private detect = (): void => {
    if (!this.running || !this.handLandmarker) return;

    if (this.video.readyState >= 2 && this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      const result = this.handLandmarker.detectForVideo(this.video, performance.now());

      const hands: HandData[] = [];
      if (result.landmarks) {
        for (let i = 0; i < result.landmarks.length; i++) {
          hands.push({
            landmarks: result.landmarks[i],
            handedness: (result.handednesses?.[i]?.[0]?.categoryName as 'Left' | 'Right') ?? 'Right',
          });
        }
      }

      this.onResult({ hands, timestamp: performance.now() });
    }

    requestAnimationFrame(this.detect);
  };
}
