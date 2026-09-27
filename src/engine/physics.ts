import { Block, Spike, Door, Rect } from '../game/types';

export interface PlayerState {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  facing: 1 | -1;
  isDead: boolean;
  shockedTimer: number;
  scaleX: number;
  scaleY: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  respawnTimer: number;
  color: string;
}

export function checkAABB(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// Inset AABB for spikes to feel fair
export function checkSpikeCollision(player: Rect, spike: Spike): boolean {
  // Hitbox is slightly smaller than full spike bounds (tighter hitbox)
  const insetX = spike.w * 0.2;
  const insetY = spike.h * 0.2;

  const spikeBox: Rect = {
    x: spike.x + insetX,
    y: spike.y + (spike.direction === 'up' ? insetY * 1.5 : insetY),
    w: spike.w - insetX * 2,
    h: spike.h - insetY * 1.5
  };

  return checkAABB(player, spikeBox);
}

export class PhysicsEngine {
  public gravity: number = 1350;
  public moveSpeed: number = 240;
  public jumpForce: number = 520;
  public maxFallSpeed: number = 750;
  public iceFriction: number = 0.985;
  public normalFriction: number = 0.72;

  public updatePlayer(
    player: PlayerState,
    inputLeft: boolean,
    inputRight: boolean,
    inputJump: boolean,
    jumpPressedThisFrame: boolean,
    jumpReleasedThisFrame: boolean,
    blocks: Block[],
    gravityDir: 1 | -1,
    dt: number,
    isIce: boolean = false
  ): { jumped: boolean; landed: boolean } {
    let jumped = false;
    let landed = false;

    if (player.isDead) {
      return { jumped, landed };
    }

    // Timers
    if (player.shockedTimer > 0) player.shockedTimer -= dt;
    if (player.coyoteTimer > 0) player.coyoteTimer -= dt;
    if (player.jumpBufferTimer > 0) player.jumpBufferTimer -= dt;

    if (jumpPressedThisFrame) {
      player.jumpBufferTimer = 0.12;
    }

    // Horizontal Movement
    let targetVx = 0;
    if (inputLeft) {
      targetVx -= this.moveSpeed;
      player.facing = -1;
    }
    if (inputRight) {
      targetVx += this.moveSpeed;
      player.facing = 1;
    }

    const friction = isIce ? this.iceFriction : (player.isGrounded ? this.normalFriction : 0.88);
    if (targetVx !== 0) {
      player.vx += (targetVx - player.vx) * (isIce ? 0.08 : 0.45);
    } else {
      player.vx *= friction;
      if (Math.abs(player.vx) < 2) player.vx = 0;
    }

    // Jump Buffering & Coyote Time
    const canJump = player.isGrounded || player.coyoteTimer > 0;
    if (player.jumpBufferTimer > 0 && canJump) {
      player.vy = -this.jumpForce * gravityDir;
      player.isGrounded = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      player.scaleX = 0.75;
      player.scaleY = 1.35;
      jumped = true;
    }

    // Variable Jump Cut (release jump to do short hops)
    if (jumpReleasedThisFrame) {
      if (gravityDir === 1 && player.vy < -150) {
        player.vy *= 0.45;
      } else if (gravityDir === -1 && player.vy > 150) {
        player.vy *= 0.45;
      }
    }

    // Apply Gravity
    player.vy += this.gravity * gravityDir * dt;
    if (gravityDir === 1 && player.vy > this.maxFallSpeed) player.vy = this.maxFallSpeed;
    if (gravityDir === -1 && player.vy < -this.maxFallSpeed) player.vy = -this.maxFallSpeed;

    // Sub-pixel movement and collision resolution
    // X Movement
    player.x += player.vx * dt;
    for (const b of blocks) {
      if (b.type === 'invisible' && !b.visible) continue;
      if (b.type === 'fake') continue; // Pass right through fake blocks!

      if (checkAABB(player, b)) {
        if (player.vx > 0) {
          player.x = b.x - player.w;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = b.x + b.w;
          player.vx = 0;
        }
      }
    }

    // Y Movement
    const wasGrounded = player.isGrounded;
    player.isGrounded = false;
    player.y += player.vy * dt;

    for (const b of blocks) {
      if (b.type === 'invisible' && !b.visible) continue;
      if (b.type === 'fake') continue;

      if (checkAABB(player, b)) {
        if (gravityDir === 1) {
          if (player.vy > 0) {
            // Landing on ground
            player.y = b.y - player.h;
            player.vy = 0;
            player.isGrounded = true;
            player.coyoteTimer = 0.1;

            if (!wasGrounded) {
              landed = true;
              player.scaleX = 1.25;
              player.scaleY = 0.75;
            }

            if (b.type === 'crumble' && !b.isFalling) {
              b.shakeTimer = 0.35;
            }
            if (b.type === 'bouncy') {
              player.vy = -this.jumpForce * 1.35;
              player.isGrounded = false;
              player.scaleX = 0.65;
              player.scaleY = 1.4;
            }
          } else if (player.vy < 0) {
            // Hitting ceiling
            player.y = b.y + b.h;
            player.vy = 0;
          }
        } else {
          // Inverted Gravity
          if (player.vy < 0) {
            // Landing on ceiling
            player.y = b.y + b.h;
            player.vy = 0;
            player.isGrounded = true;
            player.coyoteTimer = 0.1;

            if (!wasGrounded) {
              landed = true;
              player.scaleX = 1.25;
              player.scaleY = 0.75;
            }
            if (b.type === 'crumble' && !b.isFalling) {
              b.shakeTimer = 0.35;
            }
          } else if (player.vy > 0) {
            // Hitting floor in inverted
            player.y = b.y - player.h;
            player.vy = 0;
          }
        }
      }
    }

    // Smoothly return squash and stretch back to 1.0
    player.scaleX += (1 - player.scaleX) * Math.min(1, dt * 12);
    player.scaleY += (1 - player.scaleY) * Math.min(1, dt * 12);

    return { jumped, landed };
  }
}
