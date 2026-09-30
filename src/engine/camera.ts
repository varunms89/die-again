export class Camera {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public scale: number = 1;
  public offsetX: number = 0;
  public offsetY: number = 0;

  private shakeIntensity: number = 0;
  private shakeDecay: number = 8;
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;
  public shakeEnabled: boolean = false;

  constructor(public baseWidth: number = 800, public baseHeight: number = 450) {
    this.shakeEnabled = false;
  }

  public shake(intensity: number) {
    if (!this.shakeEnabled) return;
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 25);
  }

  public update(dt: number) {
    if (!this.shakeEnabled) {
      this.shakeIntensity = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    } else if (this.shakeIntensity > 0) {
      // Camera shake decay
      this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt);
      this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Smooth lerp to target
    this.x += (this.targetX - this.x) * Math.min(1, dt * 8);
    this.y += (this.targetY - this.y) * Math.min(1, dt * 8);
  }

  public apply(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.offsetX + this.shakeOffsetX, this.offsetY + this.shakeOffsetY);
    ctx.scale(this.scale, this.scale);
  }

  public restore(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  public resize(windowWidth: number, windowHeight: number) {
    const scaleX = windowWidth / this.baseWidth;
    const scaleY = windowHeight / this.baseHeight;
    this.scale = Math.min(scaleX, scaleY);

    this.offsetX = Math.floor((windowWidth - this.baseWidth * this.scale) / 2);
    this.offsetY = Math.floor((windowHeight - this.baseHeight * this.scale) / 2);
  }

  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale
    };
  }
}
