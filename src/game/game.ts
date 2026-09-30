import type { LevelData, GameScreen, Block, Spike, Door, LevelTheme } from './types';
import { LEVELS, THEMES, THEME_LIST } from './levels';
import { PhysicsEngine, PlayerState, checkSpikeCollision, checkAABB } from '../engine/physics';
import { TrollManager } from './trolls';
import { ParticleSystem } from '../engine/particles';
import { Camera } from '../engine/camera';
import { sounds } from '../engine/audio';
import { Hud } from '../ui/hud';
import { TouchController } from '../ui/touchControls';
import { LevelEditor } from './editor';

export class Game {
  private static readonly SAVED_LEVEL_KEY = 'die_again_current_level';

  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public camera: Camera;
  public physics: PhysicsEngine;
  public trolls: TrollManager;
  public particles: ParticleSystem;
  public hud: Hud;
  public touch: TouchController;
  public editor: LevelEditor;

  public currentScreen: GameScreen = 'playing';
  public currentLevelIndex: number = 0;
  public currentLevel: LevelData;
  public player: PlayerState;

  // Key states
  private keys: Record<string, boolean> = {};
  private jumpPressedThisFrame: boolean = false;
  private jumpReleasedThisFrame: boolean = false;

  private lastTime: number = 0;
  private globalTime: number = 0;
  private blinkTimer: number = 2.2;
  private isBlinking: boolean = false;
  private levelWinPending: boolean = false;
  private levelWinTimeout: number | null = null;

  constructor(container: HTMLElement) {
    this.enforceLandscapeOrientation();

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-canvas';
    this.ctx = this.canvas.getContext('2d')!;
    container.appendChild(this.canvas);

    this.camera = new Camera(800, 450);
    this.physics = new PhysicsEngine();
    this.trolls = new TrollManager();
    this.particles = new ParticleSystem();

    this.currentLevel = this.cloneLevel(LEVELS[0]);

    this.player = this.createPlayerState(this.currentLevel.playerStart.x, this.currentLevel.playerStart.y);

    // Initialize Touch Controller
    this.touch = new TouchController();
    this.touch.init(container);

    // Initialize HUD
    this.hud = new Hud(container, {
      onRestart: () => this.restartLevel(),
      onSelectLevel: (lvlId) => this.loadLevel(lvlId - 1),
      onOpenEditor: () => this.openEditor(),
      onToggleTouch: () => this.touch.toggleVisibility(),
      onToggleMute: () => {}
    });

    // Initialize Level Editor
    this.editor = new LevelEditor(
      container,
      (customLvl) => this.playCustomLevel(customLvl),
      () => this.exitEditor()
    );

    this.setupWindowEvents();
    this.resizeCanvas();
    this.loadLevel(this.getSavedLevelIndex());

    // Start background music loop on first user interaction
    const startAudioOnInteraction = () => {
      sounds.startMusic();
      window.removeEventListener('keydown', startAudioOnInteraction);
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
    };
    window.addEventListener('keydown', startAudioOnInteraction);
    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('touchstart', startAudioOnInteraction);

    // Begin main game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  public get currentTheme(): LevelTheme {
    if (this.currentLevel.theme) return this.currentLevel.theme;
    return THEME_LIST[(this.currentLevel.id - 1) % THEME_LIST.length] || THEMES.cyber_neon;
  }

  private cloneLevel(lvl: LevelData): LevelData {
    return JSON.parse(JSON.stringify(lvl));
  }

  private getSavedLevelIndex(): number {
    try {
      const savedLevelId = localStorage.getItem(Game.SAVED_LEVEL_KEY);
      if (savedLevelId === null) return 0;

      const levelIndex = LEVELS.findIndex((level) => level.id === Number(savedLevelId));
      return levelIndex >= 0 ? levelIndex : 0;
    } catch (error) {
      console.error('Unable to restore the saved level.', error);
      return 0;
    }
  }

  private createPlayerState(x: number, y: number): PlayerState {
    return {
      x,
      y,
      w: 24,
      h: 26,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facing: 1,
      isDead: false,
      shockedTimer: 0,
      scaleX: 1,
      scaleY: 1,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      respawnTimer: 0,
      color: '#facc15' // Bright cute hero yellow
    };
  }

  private enforceLandscapeOrientation() {
    try {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch {
      // Some browsers and desktop environments do not support orientation locking.
    }
  }

  private setupWindowEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (!this.keys[e.code]) {
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
          this.jumpPressedThisFrame = true;
        }
      }

      this.keys[e.code] = true;

      if (e.code === 'KeyR') {
        sounds.playClick();
        this.restartLevel();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.jumpReleasedThisFrame = true;
      }
    });

    // Editor click on canvas
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.editor.active) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const screenY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        const worldPos = this.camera.screenToWorld(screenX, screenY);
        this.editor.handleCanvasClick(worldPos.x, worldPos.y);
      }
    });
  }

  public resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(window.innerWidth, window.innerHeight);
    const h = Math.min(window.innerWidth, window.innerHeight);

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);

    this.camera.resize(this.canvas.width / dpr, this.canvas.height / dpr);
  }

  public loadLevel(index: number) {
    if (index < 0 || index >= LEVELS.length) index = 0;
    const targetLevelId = LEVELS[index]?.id || 1;
    if (index > 0 && !this.hud.isLevelUnlocked(targetLevelId)) {
      index = Math.max(0, this.currentLevelIndex);
    }
    this.currentLevelIndex = index;
    this.currentLevel = this.cloneLevel(LEVELS[index]);
    try {
      localStorage.setItem(Game.SAVED_LEVEL_KEY, String(this.currentLevel.id));
    } catch (error) {
      console.error('Unable to save the current level.', error);
    }
    this.restartLevel(false);
    this.hud.updateLevel(
      this.currentLevel.title,
      this.currentLevel.subtitle,
      this.currentLevel.id,
      this.currentLevel.hint || this.currentLevel.initialHint
    );
  }

  public restartLevel(countDeath: boolean = false) {
    if (this.levelWinTimeout !== null) {
      window.clearTimeout(this.levelWinTimeout);
      this.levelWinTimeout = null;
    }
    this.levelWinPending = false;

    if (countDeath) {
      this.hud.recordDeath(this.currentLevel.id);
    }

    this.currentLevel = this.cloneLevel(LEVELS[this.currentLevelIndex]);
    this.trolls.reset();
    this.particles.clear();
    this.particles.initAmbientStars(this.camera.baseWidth, this.camera.baseHeight);
    this.player = this.createPlayerState(this.currentLevel.playerStart.x, this.currentLevel.playerStart.y);
  }

  public openEditor() {
    this.currentScreen = 'editor';
    this.editor.open();
  }

  public exitEditor() {
    this.currentScreen = 'playing';
    this.loadLevel(this.currentLevelIndex);
  }

  public playCustomLevel(lvl: LevelData) {
    this.editor.close();
    this.currentScreen = 'playing';
    this.currentLevel = this.cloneLevel(lvl);
    this.trolls.reset();
    this.particles.clear();
    this.player = this.createPlayerState(this.currentLevel.playerStart.x, this.currentLevel.playerStart.y);
    this.hud.updateLevel("Custom Level", "Playtesting your creation", 999, "Play your custom level carefully!");
  }

  private handlePlayerDeath() {
    if (this.player.isDead) return;
    this.player.isDead = true;
    this.player.respawnTimer = 0.28; // Snappy instant respawn!
    sounds.playDeath();
    this.particles.emitDeath(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, this.player.color);
    this.hud.recordDeath(this.currentLevel.id);
  }

  private handleLevelWin() {
    if (this.levelWinPending) return;
    this.levelWinPending = true;

    sounds.playLevelClear();
    this.hud.recordCompletion(this.currentLevel.id);
    this.particles.emitConfetti(this.camera.baseWidth, this.camera.baseHeight);

    if (this.currentLevelIndex >= LEVELS.length - 1) {
      this.levelWinTimeout = window.setTimeout(() => {
        this.levelWinTimeout = null;
        this.hud.showGrandEndingModal();
      }, 600);
    } else {
      this.levelWinTimeout = window.setTimeout(() => {
        this.levelWinTimeout = null;
        this.hud.showVictoryModal(
          this.currentLevel.id,
          this.currentLevelIndex < LEVELS.length - 1,
          () => {
            this.loadLevel(this.currentLevelIndex + 1);
          }
        );
      }, 500);
    }
  }

  private loop(timestamp: number) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    // Reset frame triggers
    this.jumpPressedThisFrame = false;
    this.jumpReleasedThisFrame = false;
    this.touch.resetFrameTriggers();

    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number) {
    this.globalTime += dt;
    this.camera.update(dt);
    this.particles.update(dt, this.camera.baseWidth, this.camera.baseHeight);

    // Blinking animation
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer <= -0.14) {
        this.isBlinking = false;
        this.blinkTimer = 2.0 + Math.random() * 2.5;
      }
    }

    if (this.currentScreen === 'editor') {
      return;
    }

    if (this.levelWinPending) {
      return;
    }

    // Dead / Respawning
    if (this.player.isDead) {
      this.player.respawnTimer -= dt;
      if (this.player.respawnTimer <= 0) {
        this.restartLevel(false);
      }
      return;
    }

    // Input Aggregation (Keyboard + Touch)
    let moveLeft = this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touch.state.left;
    let moveRight = this.keys['ArrowRight'] || this.keys['KeyD'] || this.touch.state.right;
    const jump = this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp'] || this.touch.state.jump;
    const jumpPressed = this.jumpPressedThisFrame || this.touch.state.jumpJustPressed;
    const jumpReleased = this.jumpReleasedThisFrame || this.touch.state.jumpJustReleased;

    // Troll: Inverted Controls
    if (this.trolls.invertedControls) {
      const temp = moveLeft;
      moveLeft = moveRight;
      moveRight = temp;
    }

    const gravityDir = this.currentLevel.gravityDirection || 1;

    // Run physics update
    const { jumped, landed } = this.physics.updatePlayer(
      this.player,
      moveLeft,
      moveRight,
      jump,
      jumpPressed,
      jumpReleased,
      this.currentLevel.blocks,
      gravityDir,
      dt,
      this.currentLevel.icePhysics
    );

    // Running sparkle particles
    if (Math.abs(this.player.vx) > 35 && this.player.isGrounded) {
      this.particles.emitPlayerTrail(
        this.player.x + this.player.w / 2,
        this.player.y + (gravityDir === 1 ? this.player.h : 0),
        '#fde047'
      );
    }

    if (jumped) {
      sounds.playJump();
      this.particles.emitDust(this.player.x + this.player.w / 2, this.player.y + (gravityDir === 1 ? this.player.h : 0), 6);
      this.particles.emitSparks(this.player.x + this.player.w / 2, this.player.y + (gravityDir === 1 ? this.player.h : 0), '#38bdf8', 6);
    }
    if (landed) {
      this.particles.emitDust(this.player.x + this.player.w / 2, this.player.y + (gravityDir === 1 ? this.player.h : 0), 5);
    }

    // Door radiant sparkles
    this.particles.emitDoorGlow(
      this.currentLevel.door.x + this.currentLevel.door.w / 2,
      this.currentLevel.door.y + this.currentLevel.door.h / 2
    );

    // Troll triggers checking
    this.trolls.checkTriggers(this.currentLevel, this.player, this.camera, this.particles, jumped);
    this.trolls.updateDynamicEntities(this.currentLevel, this.player, this.camera, this.particles, dt);

    // Hazard collisions: Spikes
    for (const spike of this.currentLevel.spikes) {
      if (spike.hidden) continue;
      if (checkSpikeCollision(this.player, spike)) {
        this.handlePlayerDeath();
        return;
      }
    }

    // Falling off screen / void check
    if (gravityDir === 1 && this.player.y > this.camera.baseHeight + 40) {
      this.handlePlayerDeath();
      return;
    }
    if (gravityDir === -1 && this.player.y < -50) {
      this.handlePlayerDeath();
      return;
    }

    // Door Reach Check
    const door = this.currentLevel.door;
    if (!door.isFake && !door.isRocket && checkAABB(this.player, door)) {
      this.handleLevelWin();
    }
  }

  private render() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const theme = this.currentTheme;

    // Window Letterbox backdrop fill
    this.ctx.fillStyle = '#05070e';
    this.ctx.fillRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);

    // Apply Camera Transform
    this.camera.apply(this.ctx);

    // 1. Rich Sky Gradient
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.camera.baseHeight);
    skyGrad.addColorStop(0, theme.skyTop);
    skyGrad.addColorStop(1, theme.skyBottom);
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.camera.baseWidth, this.camera.baseHeight);

    // 2. Animated Ambient Celestial Stars & Dust
    this.particles.renderAmbient(this.ctx);

    // 3. Cyber Neon Grid with gentle glowing pulse
    const gridAlpha = 0.08 + Math.sin(this.globalTime * 2) * 0.03;
    this.ctx.strokeStyle = theme.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = gridAlpha;

    for (let x = 0; x <= this.camera.baseWidth; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.camera.baseHeight);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.camera.baseHeight; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.camera.baseWidth, y);
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1.0;

    // Level Editor Grid
    if (this.editor.active) {
      this.editor.renderGrid(this.ctx, this.camera.baseWidth, this.camera.baseHeight);
    }

    // 4. Render Blocks
    for (const b of this.currentLevel.blocks) {
      this.renderBlock(b, theme);
    }

    // 5. Render Spikes
    for (const s of this.currentLevel.spikes) {
      this.renderSpike(s, theme);
    }

    // 6. Render Door (Glowing Dimensional Portal)
    this.renderDoor(this.currentLevel.door, theme);

    // 7. Render Player
    if (!this.player.isDead) {
      this.renderPlayer(this.player);
    }

    // 8. Render Particles
    this.particles.render(this.ctx);

    // 9. Render Troll Floating Texts
    this.trolls.render(this.ctx);

    // 10. Dark Room Mode Spotlight
    if (this.currentLevel.darkRoom && !this.editor.active) {
      this.renderDarknessSpotlight();
    }

    // Restore Camera Transform
    this.camera.restore(this.ctx);
  }

  private renderBlock(b: Block, theme: LevelTheme) {
    if (b.type === 'invisible' && !b.visible && !this.editor.active) {
      return;
    }

    this.ctx.save();
    if (b.type === 'fake') {
      // Subtle shimmer so players can notice a slight flicker
      this.ctx.globalAlpha = this.editor.active ? 0.7 : 0.88 + Math.sin(this.globalTime * 6) * 0.08;
    }

    // Base colors
    let fillColor = b.color || theme.blockBase;
    let topColor = theme.blockTop;

    if (b.type === 'crumble') {
      fillColor = '#451a03';
      topColor = '#f97316';
    } else if (b.type === 'ice') {
      fillColor = '#0c4a6e';
      topColor = '#38bdf8';
    } else if (b.type === 'bouncy') {
      fillColor = '#701a75';
      topColor = '#f472b6';
    } else if (b.type === 'invisible' && this.editor.active) {
      fillColor = 'rgba(148, 163, 184, 0.4)';
      topColor = '#94a3b8';
    }

    // Block Body Gradient
    const bGrad = this.ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    bGrad.addColorStop(0, fillColor);
    bGrad.addColorStop(1, '#0b0f19');
    this.ctx.fillStyle = bGrad;
    this.ctx.fillRect(b.x, b.y, b.w, b.h);

    // Glowing Neon Top Trim
    this.ctx.shadowColor = topColor;
    this.ctx.shadowBlur = 6;
    this.ctx.fillStyle = topColor;
    this.ctx.fillRect(b.x, b.y, b.w, Math.min(4, b.h));
    this.ctx.shadowBlur = 0;

    // Type-specific details:
    if (b.type === 'bouncy') {
      // Pulsing bouncy arrows
      const bounceOffset = Math.sin(this.globalTime * 8) * 3;
      this.ctx.fillStyle = '#f472b6';
      this.ctx.beginPath();
      this.ctx.moveTo(b.x + b.w / 2 - 8, b.y + b.h / 2 + 4 + bounceOffset);
      this.ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2 - 4 + bounceOffset);
      this.ctx.lineTo(b.x + b.w / 2 + 8, b.y + b.h / 2 + 4 + bounceOffset);
      this.ctx.fill();
    } else if (b.type === 'ice') {
      // Shimmering specular glint across ice
      const glintX = b.x + ((this.globalTime * 60) % (b.w + 40)) - 20;
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(b.x, b.y, b.w, b.h);
      this.ctx.clip();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(glintX - 10, b.y + b.h);
      this.ctx.lineTo(glintX + 15, b.y);
      this.ctx.stroke();
      this.ctx.restore();
    } else if (b.type === 'crumble' && b.shakeTimer && b.shakeTimer > 0) {
      // Volcanic magma cracks when crumbling
      this.ctx.strokeStyle = '#ef4444';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(b.x + b.w * 0.2, b.y);
      this.ctx.lineTo(b.x + b.w * 0.4, b.y + b.h * 0.6);
      this.ctx.lineTo(b.x + b.w * 0.7, b.y + b.h);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private renderSpike(s: Spike, theme: LevelTheme) {
    if (s.hidden && !this.editor.active) return;

    this.ctx.save();
    const spikeColor = s.color || theme.spikeColor;
    const spikeGlow = theme.spikeGlow;

    // Glowing Neon Aura
    this.ctx.shadowColor = spikeGlow;
    this.ctx.shadowBlur = 10;

    // Spike Gradient Fill
    this.ctx.beginPath();
    if (s.direction === 'up') {
      const grad = this.ctx.createLinearGradient(s.x, s.y + s.h, s.x, s.y);
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(1, spikeColor);
      this.ctx.fillStyle = grad;

      this.ctx.moveTo(s.x, s.y + s.h);
      this.ctx.lineTo(s.x + s.w / 2, s.y);
      this.ctx.lineTo(s.x + s.w, s.y + s.h);
    } else if (s.direction === 'down') {
      const grad = this.ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(1, spikeColor);
      this.ctx.fillStyle = grad;

      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x + s.w / 2, s.y + s.h);
      this.ctx.lineTo(s.x + s.w, s.y);
    } else if (s.direction === 'left') {
      this.ctx.fillStyle = spikeColor;
      this.ctx.moveTo(s.x + s.w, s.y);
      this.ctx.lineTo(s.x, s.y + s.h / 2);
      this.ctx.lineTo(s.x + s.w, s.y + s.h);
    } else if (s.direction === 'right') {
      this.ctx.fillStyle = spikeColor;
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x + s.w, s.y + s.h / 2);
      this.ctx.lineTo(s.x, s.y + s.h);
    }

    this.ctx.closePath();
    this.ctx.fill();

    // Sharp metallic white sheen
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    if (s.direction === 'up') {
      this.ctx.moveTo(s.x + s.w * 0.42, s.y + s.h * 0.35);
      this.ctx.lineTo(s.x + s.w / 2, s.y);
      this.ctx.lineTo(s.x + s.w * 0.58, s.y + s.h * 0.35);
    } else if (s.direction === 'down') {
      this.ctx.moveTo(s.x + s.w * 0.42, s.y + s.h * 0.65);
      this.ctx.lineTo(s.x + s.w / 2, s.y + s.h);
      this.ctx.lineTo(s.x + s.w * 0.58, s.y + s.h * 0.65);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  private renderDoor(door: Door, theme: LevelTheme) {
    this.ctx.save();
    const cx = door.x + door.w / 2;
    const cy = door.y + door.h / 2;

    // 1. Rotating Celestial Energy Ring
    if (!door.isFake) {
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(this.globalTime * 1.8);
      this.ctx.strokeStyle = theme.doorPortalStart;
      this.ctx.lineWidth = 1.5;
      this.ctx.shadowColor = theme.doorPortalStart;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, door.w * 0.75, door.h * 0.65, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Opposite rotating ring
      this.ctx.rotate(-this.globalTime * 3.2);
      this.ctx.strokeStyle = theme.doorPortalEnd;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, door.w * 0.6, door.h * 0.5, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 2. Door Outer Golden Frame with rounded arch
    this.ctx.fillStyle = door.isFake ? '#dc2626' : theme.doorFrame;
    this.ctx.shadowColor = door.isFake ? '#ef4444' : theme.doorFrame;
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.roundRect(door.x, door.y, door.w, door.h, [10, 10, 2, 2]);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // 3. Dimensional Swirling Portal Interior
    const portalGrad = this.ctx.createLinearGradient(door.x, door.y, door.x, door.y + door.h);
    if (door.isFake) {
      portalGrad.addColorStop(0, '#f87171');
      portalGrad.addColorStop(1, '#450a0a');
    } else {
      portalGrad.addColorStop(0, theme.doorPortalStart);
      portalGrad.addColorStop(0.5, theme.doorPortalEnd);
      portalGrad.addColorStop(1, '#0f172a');
    }

    this.ctx.fillStyle = portalGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(door.x + 4, door.y + 4, door.w - 8, door.h - 6, [8, 8, 2, 2]);
    this.ctx.fill();

    // 4. Details / Troll Face
    if (door.isFake) {
      // Laughing devil eyes + horns
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(door.x + 9, door.y + 16, 4, 4);
      this.ctx.fillRect(door.x + 19, door.y + 16, 4, 4);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(door.x + door.w / 2, door.y + 26, 6, 0, Math.PI);
      this.ctx.fill();
    } else {
      // Golden celestial knob
      this.ctx.fillStyle = '#fef08a';
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.arc(door.x + door.w - 9, door.y + door.h / 2, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Floating Animated "GOAL 🚪" Hologram
      const floatY = Math.sin(this.globalTime * 4) * 3;
      this.ctx.font = "bold 9px 'Press Start 2P', monospace";
      this.ctx.fillStyle = '#fde047';
      this.ctx.shadowColor = '#ca8a04';
      this.ctx.shadowBlur = 6;
      this.ctx.textAlign = 'center';
      this.ctx.fillText("EXIT", cx, door.y - 8 + floatY);
    }

    this.ctx.restore();
  }

  private renderPlayer(p: PlayerState) {
    this.ctx.save();
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;

    this.ctx.translate(cx, cy);
    this.ctx.scale(p.scaleX, p.scaleY);

    // Gravity Inversion visual rotation
    if ((this.currentLevel.gravityDirection || 1) === -1) {
      this.ctx.rotate(Math.PI);
    }

    // Running cute wobble
    if (Math.abs(p.vx) > 30 && p.isGrounded) {
      this.ctx.rotate(Math.sin(this.globalTime * 20) * 0.08);
    }

    const rx = -p.w / 2;
    const ry = -p.h / 2;
    const r = 6;

    // Glowing hero outline
    this.ctx.shadowColor = '#fde047';
    this.ctx.shadowBlur = 8;

    // Player Hero Body (Bright gradient cube)
    const pGrad = this.ctx.createLinearGradient(rx, ry, rx, ry + p.h);
    pGrad.addColorStop(0, '#fef08a');
    pGrad.addColorStop(0.7, p.color);
    pGrad.addColorStop(1, '#eab308');

    this.ctx.fillStyle = pGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(rx, ry, p.w, p.h, [r]);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Cute pink blush cheeks!
    this.ctx.fillStyle = 'rgba(251, 113, 133, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(rx + 5, ry + 16, 2.5, 0, Math.PI * 2);
    this.ctx.arc(rx + p.w - 5, ry + 16, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Eye direction offsets
    const eyeOffsetX = p.facing * 3;
    const eyeOffsetY = p.isGrounded ? 0 : -2.5;

    if (p.shockedTimer > 0) {
      // O_O Shocked Face when troll triggers!
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(rx + 7, ry + 9, 4.5, 0, Math.PI * 2);
      this.ctx.arc(rx + 17, ry + 9, 4.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Tiny shocked pupils
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(rx + 7, ry + 9, 1.5, 0, Math.PI * 2);
      this.ctx.arc(rx + 17, ry + 9, 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Little surprised mouth O
      this.ctx.beginPath();
      this.ctx.arc(rx + 12, ry + 18, 3, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.isBlinking) {
      // Blinking closed eyes (cute happy lines)
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(rx + 5 + eyeOffsetX, ry + 10);
      this.ctx.lineTo(rx + 9 + eyeOffsetX, ry + 10);
      this.ctx.moveTo(rx + 13 + eyeOffsetX, ry + 10);
      this.ctx.lineTo(rx + 17 + eyeOffsetX, ry + 10);
      this.ctx.stroke();
    } else {
      // Normal cute eyes looking forward
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.roundRect(rx + 5 + eyeOffsetX, ry + 7 + eyeOffsetY, 4, 7, [2]);
      this.ctx.roundRect(rx + 13 + eyeOffsetX, ry + 7 + eyeOffsetY, 4, 7, [2]);
      this.ctx.fill();

      // Sparkly white reflections
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(rx + 6 + eyeOffsetX, ry + 8 + eyeOffsetY, 1.5, 2.5);
      this.ctx.fillRect(rx + 14 + eyeOffsetX, ry + 8 + eyeOffsetY, 1.5, 2.5);
    }

    this.ctx.restore();
  }

  private renderDarknessSpotlight() {
    this.ctx.save();
    const cx = this.player.x + this.player.w / 2;
    const cy = this.player.y + this.player.h / 2;
    const radius = 140;

    const grad = this.ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
    grad.addColorStop(0, 'rgba(11, 15, 25, 0)');
    grad.addColorStop(0.7, 'rgba(11, 15, 25, 0.7)');
    grad.addColorStop(1, 'rgba(11, 15, 25, 0.98)');

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.camera.baseWidth, this.camera.baseHeight);
    this.ctx.restore();
  }

}
