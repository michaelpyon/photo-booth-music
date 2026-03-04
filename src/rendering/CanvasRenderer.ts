export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  private video: HTMLVideoElement;

  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.video = video;
  }

  /** Resize canvas to match video dimensions */
  resize(): void {
    const rect = this.video.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  get width(): number { return this.canvas.width; }
  get height(): number { return this.canvas.height; }

  /** Draw the mirrored video frame as background */
  drawVideoFrame(): void {
    const ctx = this.ctx;
    ctx.save();
    // Mirror horizontally
    ctx.translate(this.canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Convert normalized landmark x to canvas x (mirrored) */
  landmarkX(nx: number): number {
    return (1 - nx) * this.canvas.width;
  }

  /** Convert normalized landmark y to canvas y */
  landmarkY(ny: number): number {
    return ny * this.canvas.height;
  }
}
