import { LevelData, Block, Spike, BlockType, SpikeDirection } from './types';
import { sounds } from '../engine/audio';

export type EditorTool = 
  | 'solid'
  | 'crumble'
  | 'fake'
  | 'invisible'
  | 'bouncy'
  | 'ice'
  | 'spike_up'
  | 'spike_down'
  | 'player'
  | 'door'
  | 'erase';

export class LevelEditor {
  public active: boolean = false;
  public currentTool: EditorTool = 'solid';
  public customLevel: LevelData;
  private container!: HTMLElement;
  private onPlayCustomLevel: (lvl: LevelData) => void;
  private onCloseEditor: () => void;
  public gridSize: number = 25;

  constructor(
    private parent: HTMLElement,
    onPlay: (lvl: LevelData) => void,
    onClose: () => void
  ) {
    this.onPlayCustomLevel = onPlay;
    this.onCloseEditor = onClose;
    this.customLevel = this.createDefaultEmptyLevel();
    this.initHtml();
  }

  public createDefaultEmptyLevel(): LevelData {
    return {
      id: 999,
      title: "Custom Troll Level",
      subtitle: "Created by You",
      width: 800,
      height: 450,
      playerStart: { x: 75, y: 350 },
      door: {
        x: 700,
        y: 336,
        w: 32,
        h: 44,
        initialX: 700,
        initialY: 336
      },
      blocks: [
        { id: 'b_custom_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 }
      ],
      spikes: [],
      triggers: [],
      gravityDirection: 1,
      initialHint: "Your custom creation"
    };
  }

  private initHtml() {
    this.container = document.createElement('div');
    this.container.id = 'level-editor-panel';
    this.container.className = 'level-editor-panel';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="editor-toolbar">
        <div class="editor-tool-group">
          <span class="editor-label">Blocks:</span>
          <button class="editor-tool-btn active" data-tool="solid" title="Solid Wall/Ground">🧱 Solid</button>
          <button class="editor-tool-btn" data-tool="crumble" title="Crumble (Falls when stepped on)">⏳ Crumble</button>
          <button class="editor-tool-btn" data-tool="fake" title="Fake Block (Walk right through!)">👻 Fake</button>
          <button class="editor-tool-btn" data-tool="invisible" title="Invisible Block">🔍 Invis</button>
          <button class="editor-tool-btn" data-tool="bouncy" title="Bouncy Trampoline">⚡ Bounce</button>
          <button class="editor-tool-btn" data-tool="ice" title="Slippery Ice">🧊 Ice</button>
        </div>

        <div class="editor-tool-group">
          <span class="editor-label">Hazards & Goals:</span>
          <button class="editor-tool-btn" data-tool="spike_up" title="Floor Spike">🔺 Spike Up</button>
          <button class="editor-tool-btn" data-tool="spike_down" title="Ceiling Spike">🔻 Spike Down</button>
          <button class="editor-tool-btn" data-tool="player" title="Player Start">👤 Spawn</button>
          <button class="editor-tool-btn" data-tool="door" title="Exit Door">🚪 Door</button>
          <button class="editor-tool-btn text-red" data-tool="erase" title="Eraser">❌ Erase</button>
        </div>

        <div class="editor-tool-group editor-actions">
          <button id="btn-editor-play" class="hud-btn hud-btn-action">▶ Playtest</button>
          <button id="btn-editor-export" class="hud-btn hud-btn-secondary">📋 Export JSON</button>
          <button id="btn-editor-clear" class="hud-btn hud-btn-danger">🗑 Clear</button>
          <button id="btn-editor-exit" class="hud-btn">✕ Exit</button>
        </div>
      </div>
    `;

    this.parent.appendChild(this.container);

    this.container.querySelectorAll('.editor-tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.editor-tool-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTool = btn.getAttribute('data-tool') as EditorTool;
        sounds.playClick();
      });
    });

    document.getElementById('btn-editor-play')?.addEventListener('click', () => {
      sounds.playClick();
      this.onPlayCustomLevel(this.customLevel);
    });

    document.getElementById('btn-editor-export')?.addEventListener('click', () => {
      const json = JSON.stringify(this.customLevel, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        alert("Custom Level JSON copied to clipboard! You can share it or paste it into your notes.");
      });
    });

    document.getElementById('btn-editor-clear')?.addEventListener('click', () => {
      if (confirm("Reset custom level to empty ground?")) {
        this.customLevel = this.createDefaultEmptyLevel();
        sounds.playDeath();
      }
    });

    document.getElementById('btn-editor-exit')?.addEventListener('click', () => {
      sounds.playClick();
      this.close();
      this.onCloseEditor();
    });
  }

  public open() {
    this.active = true;
    this.container.style.display = 'flex';
  }

  public close() {
    this.active = false;
    this.container.style.display = 'none';
  }

  public handleCanvasClick(worldX: number, worldY: number) {
    if (!this.active) return;

    // Snap to grid
    const snapX = Math.floor(worldX / this.gridSize) * this.gridSize;
    const snapY = Math.floor(worldY / this.gridSize) * this.gridSize;

    if (this.currentTool === 'player') {
      this.customLevel.playerStart = { x: snapX, y: snapY };
      sounds.playClick();
      return;
    }

    if (this.currentTool === 'door') {
      this.customLevel.door.x = snapX;
      this.customLevel.door.y = snapY;
      this.customLevel.door.initialX = snapX;
      this.customLevel.door.initialY = snapY;
      sounds.playDoorOpen();
      return;
    }

    if (this.currentTool === 'erase') {
      // Remove any block or spike touching this point
      const prevBlockCount = this.customLevel.blocks.length;
      this.customLevel.blocks = this.customLevel.blocks.filter(
        (b) => !(worldX >= b.x && worldX <= b.x + b.w && worldY >= b.y && worldY <= b.y + b.h)
      );

      const prevSpikeCount = this.customLevel.spikes.length;
      this.customLevel.spikes = this.customLevel.spikes.filter(
        (s) => !(worldX >= s.x && worldX <= s.x + s.w && worldY >= s.y && worldY <= s.y + s.h)
      );

      if (this.customLevel.blocks.length < prevBlockCount || this.customLevel.spikes.length < prevSpikeCount) {
        sounds.playClick();
      }
      return;
    }

    if (this.currentTool.startsWith('spike_')) {
      const dir: SpikeDirection = this.currentTool === 'spike_down' ? 'down' : 'up';
      const spikeId = `s_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      this.customLevel.spikes.push({
        id: spikeId,
        direction: dir,
        x: snapX,
        y: snapY,
        w: this.gridSize,
        h: this.gridSize,
        initialX: snapX,
        initialY: snapY
      });
      sounds.playClick();
      return;
    }

    // Place block
    const blockType = this.currentTool as BlockType;
    const blockId = `b_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let color: string | undefined;
    if (blockType === 'crumble') color = '#fb923c';
    if (blockType === 'fake') color = '#38bdf8';
    if (blockType === 'invisible') color = '#94a3b8';
    if (blockType === 'bouncy') color = '#ec4899';
    if (blockType === 'ice') color = '#06b6d4';

    this.customLevel.blocks.push({
      id: blockId,
      type: blockType,
      x: snapX,
      y: snapY,
      w: this.gridSize,
      h: this.gridSize,
      initialX: snapX,
      initialY: snapY,
      color
    });

    sounds.playClick();
  }

  public renderGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.active) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
