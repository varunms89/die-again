import { LevelData, Block, Spike, Door, FloatingText, TrollTrigger } from './types';
import { PlayerState, checkAABB } from '../engine/physics';
import { sounds } from '../engine/audio';
import { Camera } from '../engine/camera';
import { ParticleSystem } from '../engine/particles';

export class TrollManager {
  public invertedControls: boolean = false;
  public floatingTexts: FloatingText[] = [];

  public reset() {
    this.invertedControls = false;
    this.floatingTexts = [];
  }

  public checkTriggers(
    level: LevelData,
    player: PlayerState,
    camera: Camera,
    particles: ParticleSystem,
    justJumped: boolean
  ) {
    if (player.isDead) return;

    for (const trigger of level.triggers) {
      if (trigger.executed) continue;

      let shouldFire = false;
      const p = trigger.params;

      switch (trigger.condition) {
        case 'player_x_gt':
          if (player.x > p.x) shouldFire = true;
          break;

        case 'player_x_lt':
          if (player.x < p.x) shouldFire = true;
          break;

        case 'distance_to_door': {
          const doorCenterX = level.door.x + level.door.w / 2;
          const doorCenterY = level.door.y + level.door.h / 2;
          const playerCenterX = player.x + player.w / 2;
          const playerCenterY = player.y + player.h / 2;
          const dist = Math.hypot(doorCenterX - playerCenterX, doorCenterY - playerCenterY);
          if (dist < p.distance) shouldFire = true;
          break;
        }

        case 'distance_to_point': {
          const dist = Math.hypot(p.x - player.x, p.y - player.y);
          if (dist < p.distance) shouldFire = true;
          break;
        }

        case 'player_jump':
          if (justJumped) {
            // Optional region constraint
            if (p.minX !== undefined && player.x < p.minX) break;
            if (p.maxX !== undefined && player.x > p.maxX) break;
            shouldFire = true;
          }
          break;
      }

      if (shouldFire) {
        trigger.executed = true;
        this.executeAction(trigger, level, player, camera, particles);
      }
    }
  }

  public executeAction(
    trigger: TrollTrigger,
    level: LevelData,
    player: PlayerState,
    camera: Camera,
    particles: ParticleSystem
  ) {
    const p = trigger.params;
    player.shockedTimer = 0.6; // Shocked O_O face!

    switch (trigger.action) {
      case 'drop_blocks': {
        const ids: string[] = p.blockIds || [];
        for (const b of level.blocks) {
          if (ids.includes(b.id)) {
            b.isFalling = true;
            b.shakeTimer = p.delay !== undefined ? p.delay : 0.15;
            b.vy = 0;
            particles.emitDust(b.x + b.w / 2, b.y, 4);
          }
        }
        sounds.playTrapFall();
        camera.shake(6);
        break;
      }

      case 'raise_spikes': {
        const ids: string[] = p.spikeIds || [];
        for (const s of level.spikes) {
          if (ids.includes(s.id)) {
            s.hidden = false;
            s.popped = true;
            s.vy = p.speed || -350;
            s.isMoving = true;
            particles.emitDust(s.x + s.w / 2, s.y + s.h, 6);
          }
        }
        sounds.playTrollChime();
        camera.shake(8);
        break;
      }

      case 'flee_door': {
        level.door.isFleeing = true;
        level.door.targetX = p.targetX !== undefined ? p.targetX : (level.door.x > player.x ? level.door.x + 220 : level.door.x - 220);
        level.door.vx = p.speed || 380;
        level.door.trollMessage = p.message || "BYE! 💨";
        sounds.playTrollChime();
        this.addFloatingText(level.door.trollMessage || "BYE! 💨", level.door.x, level.door.y - 20, '#fbbf24');
        break;
      }

      case 'jump_spikes': {
        const ids: string[] = p.spikeIds || [];
        for (const s of level.spikes) {
          if (ids.includes(s.id)) {
            s.vy = -(p.force || 450);
            s.isMoving = true;
          }
        }
        sounds.playJump();
        break;
      }

      case 'crush_ceiling': {
        const ids: string[] = p.blockIds || [];
        for (const b of level.blocks) {
          if (ids.includes(b.id)) {
            b.isFalling = true;
            b.vy = p.speed || 500;
          }
        }
        sounds.playTrapFall();
        camera.shake(12);
        this.addFloatingText("CRUSH! 💥", player.x, player.y - 30, '#ef4444');
        break;
      }

      case 'flip_gravity': {
        level.gravityDirection = level.gravityDirection === 1 ? -1 : 1;
        sounds.playTrollChime();
        camera.shake(10);
        this.addFloatingText("GRAVITY FLIPPED! 🙃", player.x, player.y - 30, '#a855f7');
        break;
      }

      case 'invert_controls': {
        this.invertedControls = !this.invertedControls;
        sounds.playTrollChime();
        camera.shake(8);
        this.addFloatingText("CONTROLS INVERTED! 🔄", player.x, player.y - 30, '#f97316');
        break;
      }

      case 'fake_door_reveal': {
        level.door.isFake = true;
        sounds.playTrollChime();
        camera.shake(10);
        this.addFloatingText("SIKE! 😂", level.door.x, level.door.y - 25, '#ef4444');

        // Spawn real door elsewhere
        if (p.realDoorX !== undefined && p.realDoorY !== undefined) {
          setTimeout(() => {
            level.door.x = p.realDoorX;
            level.door.y = p.realDoorY;
            level.door.isFake = false;
            sounds.playDoorOpen();
            particles.emitDust(level.door.x + 15, level.door.y + 20, 10);
          }, 800);
        }
        break;
      }

      case 'rocket_door': {
        level.door.isRocket = true;
        level.door.rocketVy = -700;
        level.door.targetX = p.newX;
        level.door.targetY = p.newY;
        sounds.playTrollChime();
        camera.shake(14);
        this.addFloatingText("TO THE MOON! 🚀", level.door.x, level.door.y - 20, '#38bdf8');
        break;
      }

      case 'troll_message': {
        sounds.playTrollChime();
        this.addFloatingText(p.text || "LOL! 😈", player.x, player.y - 30, p.color || '#f43f5e');
        break;
      }

      case 'shake_camera': {
        camera.shake(p.intensity || 15);
        sounds.playTrapFall();
        break;
      }
    }
  }

  public updateDynamicEntities(
    level: LevelData,
    player: PlayerState,
    camera: Camera,
    particles: ParticleSystem,
    dt: number
  ) {
    // 1. Update Falling Blocks
    for (const b of level.blocks) {
      if (b.shakeTimer && b.shakeTimer > 0) {
        b.shakeTimer -= dt;
        b.x = b.initialX + (Math.random() - 0.5) * 5;
        if (b.shakeTimer <= 0) {
          b.isFalling = true;
          b.x = b.initialX;
        }
      }

      if (b.isFalling && (!b.shakeTimer || b.shakeTimer <= 0)) {
        b.vy = (b.vy || 0) + 1200 * dt;
        b.y += b.vy * dt;

        // Check if falling block squishes the player!
        if (!player.isDead && checkAABB(player, b)) {
          // If falling downward and block's bottom is near player's top
          if (b.vy > 100) {
            player.isDead = true;
            sounds.playDeath();
            camera.shake(14);
            particles.emitDeath(player.x + player.w / 2, player.y + player.h / 2, player.color);
            this.addFloatingText("SQUASHED! 🥞", player.x, player.y - 20, '#ef4444');
          }
        }
      }
    }

    // 2. Update Moving & Jumping Spikes
    for (const s of level.spikes) {
      if (s.isMoving) {
        s.vy = (s.vy || 0) + 1100 * dt;
        s.y += s.vy * dt;

        // Land back on original ground
        if (s.direction === 'up' && s.y >= s.initialY) {
          s.y = s.initialY;
          s.vy = 0;
          s.isMoving = false;
        }
      }
    }

    // 3. Update Fleeing Door
    if (level.door.isFleeing && level.door.targetX !== undefined) {
      const dx = level.door.targetX - level.door.x;
      const speed = level.door.vx || 320;
      if (Math.abs(dx) > 4) {
        level.door.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
        particles.emitDoorGlow(level.door.x + level.door.w / 2, level.door.y + level.door.h / 2);
      } else {
        level.door.isFleeing = false;
      }
    }

    // 4. Update Rocket Door
    if (level.door.isRocket) {
      if (level.door.rocketVy !== undefined) {
        level.door.y += level.door.rocketVy * dt;
        particles.emitDust(level.door.x + level.door.w / 2, level.door.y + level.door.h, 4);

        if (level.door.y < -100 && level.door.targetX !== undefined && level.door.targetY !== undefined) {
          // Parachute back down at new location
          level.door.x = level.door.targetX;
          level.door.rocketVy = 300;
        }

        if (level.door.targetY !== undefined && level.door.rocketVy > 0 && level.door.y >= level.door.targetY) {
          level.door.y = level.door.targetY;
          level.door.isRocket = false;
          camera.shake(8);
          sounds.playDoorOpen();
        }
      }
    }

    // 5. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.lifetime -= dt;
      ft.alpha = Math.max(0, ft.lifetime / 1.5);
      if (ft.lifetime <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#facc15') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      size: 16,
      alpha: 1,
      lifetime: 1.8,
      vy: -35
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px 'Courier New', monospace, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
