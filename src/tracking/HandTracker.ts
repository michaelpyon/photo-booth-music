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
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
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
