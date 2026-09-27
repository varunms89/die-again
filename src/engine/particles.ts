import type { Particle } from '../game/types';

interface AmbientStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  pulseSpeed: number;
  phase: number;
  color: string;
  vx: number;
  vy: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private ambientStars: AmbientStar[] = [];

  constructor() {
    this.initAmbientStars(800, 450);
  }

  public initAmbientStars(width: number, height: number) {
    this.ambientStars = [];
    const colors = ['#f43f5e', '#38bdf8', '#a855f7', '#fbbf24', '#34d399', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      this.ambientStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.5,
        baseAlpha: 0.2 + Math.random() * 0.5,
        pulseSpeed: 1 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 8,
        vy: -4 - Math.random() * 8
      });
    }
  }

  public update(dt: number, width: number = 800, height: number = 450) {
    // 1. Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.gravity !== undefined) {
        p.vy += p.gravity * dt;
      }

      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed * dt;
      }

      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 2. Update ambient stars/motes
    for (const star of this.ambientStars) {
      star.x += star.vx * dt;
      star.y += star.vy * dt;
      star.phase += star.pulseSpeed * dt;

      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * width;
      }
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
    }
  }

  public renderAmbient(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const star of this.ambientStars) {
      const alpha = star.baseAlpha + Math.sin(star.phase) * 0.25;
      ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
      ctx.fillStyle = star.color;
      ctx.shadowColor = star.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;

      if (p.rotation !== undefined) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === 'confetti') {
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.8);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }
  }

  public emitPlayerTrail(x: number, y: number, color: string = '#fde047') {
    if (Math.random() < 0.6) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.4 ? color : '#38bdf8',
        alpha: 0.8,
        decay: 3.5,
        shape: 'circle'
      });
    }
  }

  public emitSparks(x: number, y: number, color: string = '#fbbf24', count: number = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 2.5 + Math.random() * 1.5,
        gravity: 200,
        shape: 'circle'
      });
    }
  }

  public emitDeath(x: number, y: number, primaryColor: string = '#facc15') {
    const rainbowColors = [primaryColor, '#f43f5e', '#ec4899', '#a855f7', '#38bdf8', '#34d399', '#ffffff'];

    // 1. Shards & cubes
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.4;
      const speed = 140 + Math.random() * 300;
      const color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        size: 5 + Math.random() * 7,
        color,
        alpha: 1,
        decay: 1.0 + Math.random() * 0.8,
        gravity: 650,
        shape: 'square',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 14
      });
    }

    // 2. Bright sparkle shockwave
    this.emitSparks(x, y, '#ffffff', 16);
    this.emitSparks(x, y, '#ef4444', 16);
  }

  public emitDust(x: number, y: number, count: number = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 70,
        vy: -20 - Math.random() * 50,
        size: 3 + Math.random() * 4,
        color: '#cbd5e1',
        alpha: 0.85,
        decay: 2.2,
        gravity: 50,
        shape: 'circle'
      });
    }
  }

  public emitConfetti(width: number, height: number) {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#facc15'];
    for (let i = 0; i < 110; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: Math.random() * width,
        y: -10 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 200,
        vy: 120 + Math.random() * 200,
        size: 7 + Math.random() * 7,
        color,
        alpha: 1,
        decay: 0.25 + Math.random() * 0.25,
        gravity: 45,
        shape: 'confetti',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }
  }

  public emitDoorGlow(x: number, y: number) {
    const colors = ['#fde047', '#38bdf8', '#c084fc', '#ec4899'];
    if (Math.random() < 0.6) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 26,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 35,
        vy: -20 - Math.random() * 45,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 1.4,
        shape: 'circle'
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
