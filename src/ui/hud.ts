import { sounds } from '../engine/audio';
import { getDifficultyMultiplier } from '../game/levels';

export interface HudCallbacks {
  onRestart: () => void;
  onSelectLevel: (lvlId: number) => void;
  onOpenEditor: () => void;
  onToggleTouch: () => void;
  onToggleMute: () => void;
}

interface AdCampaign {
  sponsor: string;
  badge: string;
  tagline: string;
  description: string;
  callToAction: string;
  color: string;
  icon: string;
}

const PARODY_ADS: AdCampaign[] = [
  {
    sponsor: "Rage-Proof Keyboards™",
    badge: "OFFICIAL HARDWARE",
    tagline: "Tested with 10,000+ Smashes!",
    description: "Tired of breaking keyboards on Level 8? Our titanium-reinforced gaming keyboard survives rage-quits, flying mice, and tears!",
    callToAction: "Get Smash-Proof Key",
    color: "#ef4444",
    icon: "⌨️"
  },
  {
    sponsor: "Skill Issue Energy ⚡",
    badge: "100% PURE SUGAR",
    tagline: "+0% Reflexes, 1000% Jitter",
    description: "Scientifically proven to make you jump 0.001s faster into spikes. Only for intelligent persons!",
    callToAction: "Gulp the Energy",
    color: "#f59e0b",
    icon: "⚡"
  },
  {
    sponsor: "Door Insurance Inc. 🚪",
    badge: "SANITY POLICY",
    tagline: "Never Get Ditched Again",
    description: "Has a door rocketed into space right before you touched it? File an immediate compensation claim with Door Insurance!",
    callToAction: "Insure Your Exits",
    color: "#38bdf8",
    icon: "🚪"
  },
  {
    sponsor: "Spike X-Ray Goggles 🕶️",
    badge: "MILITARY GRADE",
    tagline: "See Fake Floors Before You Fall",
    description: "Eliminates emotional damage by revealing invisible blocks, falling ceilings, and copycat jumping spikes 3 seconds in advance!",
    callToAction: "Order X-Ray Glasses",
    color: "#10b981",
    icon: "🕶️"
  },
  {
    sponsor: "Anti-Gravity Jordans 👟",
    badge: "PHYSICS REJECTOR",
    tagline: "Walk On Ceilings In Style",
    description: "Laugh in the face of Isaac Newton! Perfect for inverted gravity stages and accidental high-altitude flights.",
    callToAction: "Equip Moon Shoes",
    color: "#a855f7",
    icon: "👟"
  },
  {
    sponsor: "Gamer Tear Collector 9000 💧",
    badge: "ECO FRIENDLY",
    tagline: "Sustainable Frustration Hydration",
    description: "Harvesting the purest gamer tears since Level 1. 100% distilled rage water with organic electrolytes!",
    callToAction: "Collect Tears",
    color: "#06b6d4",
    icon: "💧"
  },
  {
    sponsor: "Brain De-Glitcher Pro 🧠",
    badge: "NEURAL REPAIR",
    tagline: "Fix Inverted Controls Instantly",
    description: "Left is Right, Right is Left? Realign your cerebral cortex and conquer tricky reverse-steering trolls effortlessly.",
    callToAction: "Calibrate Synapses",
    color: "#ec4899",
    icon: "🧠"
  },
  {
    sponsor: "Troll GPS Navigator 🧭",
    badge: "PRECISE GUIDANCE",
    tagline: "In 50 Feet, Step Into The Pit",
    description: "Turn right. Turn left. Recalculating... Your destination was a decoy portal! Upgrade to Premium GPS for real directions.",
    callToAction: "Recalculate Route",
    color: "#8b5cf6",
    icon: "🧭"
  }
];

export class Hud {
  private container: HTMLElement;
  private levelTitleEl!: HTMLElement;
  private deathCountEl!: HTMLElement;
  private soundBtnEl!: HTMLButtonElement;
  private modalContainer!: HTMLElement;
  private completedLevels: Set<number> = new Set();
  private unlockedHints: Set<number> = new Set();
  private deathsPerLevel: Record<number, number> = {};
  private totalDeaths: number = 0;
  private currentLevelId: number = 1;
  private currentLevelHint: string = "";
  private adTimerInterval: number | null = null;

  constructor(private parent: HTMLElement, private callbacks: HudCallbacks) {
    this.container = document.createElement('div');
    this.container.className = 'game-hud hud-collapsed';
    this.loadStats();
    this.initHtml();
  }

  private loadStats() {
    try {
      const savedCompleted = localStorage.getItem('die_again_completed');
      if (savedCompleted) {
        this.completedLevels = new Set(JSON.parse(savedCompleted));
      }
      const savedHints = localStorage.getItem('die_again_unlocked_hints');
      if (savedHints) {
        this.unlockedHints = new Set(JSON.parse(savedHints));
      }
      const savedDeaths = localStorage.getItem('die_again_deaths');
      if (savedDeaths) {
        this.deathsPerLevel = JSON.parse(savedDeaths);
        this.totalDeaths = Object.values(this.deathsPerLevel).reduce((a, b) => a + b, 0);
      }
    } catch (e) {
      console.error(e);
    }
  }

  public syncSoundButtonState() {
    const muted = sounds.getMuted();
    if (this.soundBtnEl) {
      this.soundBtnEl.querySelector('.icon')!.textContent = muted ? '🔇' : '🔊';
      this.soundBtnEl.title = muted ? 'Unmute Sound' : 'Mute Sound';
    }
  }

  public recordDeath(levelId: number) {
    this.deathsPerLevel[levelId] = (this.deathsPerLevel[levelId] || 0) + 1;
    this.totalDeaths++;
    this.saveStats();
    this.updateDeathDisplay(levelId);
    this.triggerRageReaction();
  }

  private triggerRageReaction() {
    const badge = this.container.querySelector('.hud-death-badge');
    if (badge) {
      badge.classList.remove('wobble-death');
      void (badge as HTMLElement).offsetWidth;
      badge.classList.add('wobble-death');

      const plusOne = document.createElement('div');
      plusOne.className = 'floating-plus-one';
      plusOne.textContent = '+1 💀';
      badge.appendChild(plusOne);
      setTimeout(() => plusOne.remove(), 900);
    }

    const rageMessages = [
      "SKILL ISSUE 😂",
      "THE FLOOR LIED 💀",
      "EMOTIONAL DAMAGE 💔",
      "DOOR: 1, YOU: 0 🚪",
      "YOU THOUGHT! 🤡",
      "DON'T CRY 🍼",
      "RAGE +1 🔥",
      "AGAIN! 😈",
      "GRAVITY SAYS HI 👋",
      "NICE TRY! 🎯",
      "WATCH AN AD FOR HINT! 💡"
    ];
    const msg = rageMessages[Math.floor(Math.random() * rageMessages.length)];

    const toast = document.createElement('div');
    toast.className = 'rage-toast';
    toast.textContent = msg;
    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), 1100);
  }

  public recordCompletion(levelId: number) {
    this.completedLevels.add(levelId);
    this.saveStats();
  }

  private saveStats() {
    try {
      localStorage.setItem('die_again_completed', JSON.stringify(Array.from(this.completedLevels)));
      localStorage.setItem('die_again_unlocked_hints', JSON.stringify(Array.from(this.unlockedHints)));
      localStorage.setItem('die_again_deaths', JSON.stringify(this.deathsPerLevel));
    } catch (e) {
      console.error(e);
    }
  }

  private initHtml() {
    this.container.innerHTML = `
      <div class="hud-top-bar">
        <div class="hud-left">
          <button id="hud-btn-logo" class="hud-logo-btn" title="Don't Die Welcome Menu">
            <img src="/logo.png" alt="Don't Die" class="hud-logo-mini" />
          </button>
          <button id="hud-btn-menu" class="hud-btn" title="Select from 256 Levels">
            <span class="icon">☰</span>
            <span class="hud-btn-text">256 Levels</span>
          </button>
          <button id="hud-btn-hint" class="hud-btn hud-btn-hint" title="Watch Ad to Unlock Hint">
            <span class="icon">💡</span>
            <span class="hud-btn-text">Hint (Ad)</span>
          </button>
          <div class="hud-level-info">
            <span id="hud-level-title" class="hud-title">Level 1</span>
            <span id="hud-level-sub" class="hud-subtitle">Just a normal walk</span>
          </div>
        </div>

        <div class="hud-center">
          <div class="hud-inteligent-pill" title="Difficulty increases 10x per level!">
            🧠 ONLY FOR INTELIGENT PERSON ⚡
          </div>
          <div class="hud-death-badge">
            <span class="skull-icon">💀</span>
            <span id="hud-death-count">0</span>
            <span class="hud-death-sub">(Total: ${this.totalDeaths})</span>
          </div>
        </div>

        <div class="hud-right">
          <button id="hud-btn-restart" class="hud-btn hud-btn-action" title="Restart Level (R)">
            <span class="icon">↻</span>
            <span class="hud-btn-text">Restart</span>
          </button>
          <button id="hud-btn-sound" class="hud-btn hud-btn-icon" title="Toggle Sound">
            <span class="icon">${sounds.getMuted() ? '🔇' : '🔊'}</span>
          </button>
          <button id="hud-btn-touch" class="hud-btn hud-btn-icon" title="Toggle Touch Controls">
            <span class="icon">📱</span>
          </button>
          <button id="hud-btn-editor" class="hud-btn hud-btn-secondary" title="Level Editor">
            <span class="icon">🛠️</span>
            <span class="hud-btn-text">Editor</span>
          </button>
          <button id="hud-btn-collapse" class="hud-btn hud-btn-icon" title="Hide game menu" aria-label="Hide game menu">
            <span class="icon">⌃</span>
          </button>
        </div>
      </div>

      <button id="hud-btn-expand" class="hud-compact-toggle" title="Show game menu" aria-label="Show game menu" aria-expanded="false">
        <span aria-hidden="true">☰</span>
      </button>

      <div id="hud-modal" class="hud-modal-overlay" style="display: none;">
        <div class="hud-modal-content">
          <div class="hud-modal-header">
            <h2 id="hud-modal-title">Select Level</h2>
            <button id="hud-modal-close" class="hud-btn-close">&times;</button>
          </div>
          <div id="hud-modal-body" class="hud-modal-body"></div>
        </div>
      </div>
    `;

    this.parent.appendChild(this.container);

    this.levelTitleEl = document.getElementById('hud-level-title')!;
    this.deathCountEl = document.getElementById('hud-death-count')!;
    this.soundBtnEl = document.getElementById('hud-btn-sound') as HTMLButtonElement;
    this.modalContainer = document.getElementById('hud-modal')!;
    this.syncSoundButtonState();

    // Bind event listeners
    document.getElementById('hud-btn-expand')?.addEventListener('click', () => this.setMenuExpanded(true));
    document.getElementById('hud-btn-collapse')?.addEventListener('click', () => this.setMenuExpanded(false));

    document.getElementById('hud-btn-logo')?.addEventListener('click', () => {
      sounds.playClick();
      this.showWelcomeModal(() => {});
    });

    document.getElementById('hud-btn-hint')?.addEventListener('click', () => {
      sounds.playClick();
      this.handleHintClick();
    });

    document.getElementById('hud-btn-restart')?.addEventListener('click', () => {
      sounds.playClick();
      this.callbacks.onRestart();
    });

    this.soundBtnEl.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      this.syncSoundButtonState();
      this.callbacks.onToggleMute();
      if (!isMuted) {
        sounds.playClick();
      }
    });

    document.getElementById('hud-btn-touch')?.addEventListener('click', () => {
      sounds.playClick();
      this.callbacks.onToggleTouch();
    });

    document.getElementById('hud-btn-editor')?.addEventListener('click', () => {
      sounds.playClick();
      this.setMenuExpanded(false);
      this.callbacks.onOpenEditor();
    });

    document.getElementById('hud-btn-menu')?.addEventListener('click', () => {
      sounds.playClick();
      this.openLevelSelectModal(256);
    });

    document.getElementById('hud-modal-close')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
    });

    this.modalContainer.addEventListener('click', (e) => {
      if (e.target === this.modalContainer) {
        this.closeModal();
      }
    });
  }

  public handleHintClick() {
    if (this.unlockedHints.has(this.currentLevelId)) {
      this.showHintModal(this.currentLevelId, this.currentLevelHint);
    } else {
      this.showRewardedAdModal(this.currentLevelId, this.currentLevelHint);
    }
  }

  public showRewardedAdModal(levelId: number, hintText: string) {
    if (this.adTimerInterval) {
      clearInterval(this.adTimerInterval);
      this.adTimerInterval = null;
    }

    const modalBody = document.getElementById('hud-modal-body')!;
    const modalTitle = document.getElementById('hud-modal-title')!;
    modalTitle.textContent = "📺 Sponsored Reward Ad";

    const ad = PARODY_ADS[Math.floor(Math.random() * PARODY_ADS.length)];
    let countdown = 5;

    modalBody.innerHTML = `
      <div class="ad-modal-content">
        <div class="ad-top-status">
          <div class="ad-reward-badge">🎁 REWARD: Level ${levelId} Hint</div>
          <div class="ad-timer-pill" id="ad-timer-pill">Reward in <span id="ad-countdown-num">${countdown}</span>s</div>
        </div>

        <div class="ad-progress-bar-container">
          <div class="ad-progress-bar-fill" id="ad-progress-fill" style="width: 0%;"></div>
        </div>

        <div class="ad-card" style="border-color: ${ad.color};">
          <div class="ad-card-badge" style="background: ${ad.color};">${ad.badge}</div>
          <div class="ad-icon-hero">${ad.icon}</div>
          <h2 class="ad-sponsor-title" style="color: ${ad.color};">${ad.sponsor}</h2>
          <h3 class="ad-tagline">"${ad.tagline}"</h3>
          <p class="ad-desc">${ad.description}</p>
          <div class="ad-interactive-box">
            <button id="btn-ad-cta" class="hud-btn hud-btn-action ad-cta-pulse">
              ${ad.callToAction} ⚡
            </button>
          </div>
        </div>

        <div class="ad-footer-row">
          <button id="btn-ad-skip" class="hud-btn hud-btn-secondary hud-btn-skip">
            Skip Ad (Lose Reward) ✕
          </button>
          <div class="ad-status-note">Hint unlocks automatically after ${countdown}s</div>
        </div>
      </div>
    `;

    this.modalContainer.style.display = 'flex';

    const fillEl = document.getElementById('ad-progress-fill');
    const timerNumEl = document.getElementById('ad-countdown-num');
    const timerPillEl = document.getElementById('ad-timer-pill');
    const totalDuration = 5;
    let elapsed = 0;

    document.getElementById('btn-ad-cta')?.addEventListener('click', () => {
      sounds.playClick();
      const toast = document.createElement('div');
      toast.className = 'rage-toast';
      toast.textContent = "SPONSOR CLICKED! ⚡";
      this.container.appendChild(toast);
      setTimeout(() => toast.remove(), 900);
    });

    document.getElementById('btn-ad-skip')?.addEventListener('click', () => {
      sounds.playClick();
      if (this.adTimerInterval) {
        clearInterval(this.adTimerInterval);
        this.adTimerInterval = null;
      }
      this.closeModal();
    });

    this.adTimerInterval = window.setInterval(() => {
      elapsed += 0.2;
      const remaining = Math.max(0, Math.ceil(totalDuration - elapsed));
      const pct = Math.min(100, (elapsed / totalDuration) * 100);

      if (fillEl) fillEl.style.width = `${pct}%`;
      if (timerNumEl) timerNumEl.textContent = String(remaining);

      if (elapsed >= totalDuration) {
        if (this.adTimerInterval) {
          clearInterval(this.adTimerInterval);
          this.adTimerInterval = null;
        }

        if (timerPillEl) {
          timerPillEl.textContent = "🎉 REWARD GRANTED!";
          timerPillEl.classList.add('reward-success');
        }

        sounds.playLevelClear();
        this.unlockedHints.add(levelId);
        this.saveStats();

        setTimeout(() => {
          this.showHintModal(levelId, hintText, true);
        }, 700);
      }
    }, 200);
  }

  public showHintModal(levelId: number, hintText: string, justUnlocked: boolean = false) {
    const modalBody = document.getElementById('hud-modal-body')!;
    const modalTitle = document.getElementById('hud-modal-title')!;
    modalTitle.textContent = `💡 Level ${levelId} Hint Unlocked`;

    const mult = getDifficultyMultiplier(levelId);

    modalBody.innerHTML = `
      <div class="hint-modal-content">
        ${justUnlocked ? `<div class="hint-success-badge">✨ AD REWARD GRANTED! ✨</div>` : ''}
        
        <div class="hint-level-meta">
          <span class="hint-pill-diff">${mult} Harder</span>
          <span class="hint-pill-unlocked">🔓 Hint Unlocked</span>
        </div>

        <div class="hint-card-box">
          <div class="hint-bulb-icon">💡</div>
          <h3 class="hint-subtitle">Tactical Solution & Strategy</h3>
          <p class="hint-text-body">${hintText || "Keep moving forward and adapt quickly to the sudden troll mechanics!"}</p>
        </div>

        <div class="hint-footer-actions">
          <button id="btn-hint-continue" class="hud-btn hud-btn-action hud-btn-giant">
            🎮 Got It! Let's Beat Level ${levelId}
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-hint-continue')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
    });

    this.modalContainer.style.display = 'flex';
  }

  public showWelcomeModal(onStart: () => void) {
    const modalBody = document.getElementById('hud-modal-body')!;
    const modalTitle = document.getElementById('hud-modal-title')!;
    modalTitle.textContent = "Welcome to Don't Die 😈";

    modalBody.innerHTML = `
      <div class="welcome-modal-content">
        <div class="welcome-logo-container">
          <img src="/logo.png" alt="Don't Die Logo" class="welcome-logo-img" />
          <div class="logo-glow-ring"></div>
        </div>
        <h1 class="welcome-title">DON'T DIE : TROLL GAME</h1>
        <p class="welcome-developer">DEVELOPED BY <strong>CORE GAMES</strong></p>
        
        <div class="welcome-tagline-badge">
          <span class="pulse-dot">⚡</span>
          <span class="tagline-text">ONLY FOR INTELIGENT PERSON</span>
          <span class="pulse-dot">🧠</span>
        </div>

        <div class="welcome-warning-box">
          <p class="warning-title">⚠️ 10x DIFFICULTY ESCALATION ⚠️</p>
          <p class="warning-desc">
            Every level is <strong>10x HARDER</strong> than the last across <strong>256 procedural troll stages</strong>.
            Watch rewarded ads for strategic hints when you get stuck!
          </p>
        </div>

        <div class="welcome-stats-row">
          <div class="wstat">
            <span class="wstat-num">256</span>
            <span class="wstat-label">Levels</span>
          </div>
          <div class="wstat">
            <span class="wstat-num">10^255x</span>
            <span class="wstat-label">Max Diff</span>
          </div>
          <div class="wstat">
            <span class="wstat-num">💀 ${this.totalDeaths}</span>
            <span class="wstat-label">Total Deaths</span>
          </div>
        </div>

        <div class="welcome-buttons">
          <button id="btn-welcome-play" class="hud-btn hud-btn-action hud-btn-giant">
            🎮 PLAY LEVEL 1
          </button>
          <div class="welcome-secondary-btns">
            <button id="btn-welcome-levels" class="hud-btn hud-btn-secondary">
              ☰ 256 Levels Select
            </button>
            <button id="btn-welcome-editor" class="hud-btn hud-btn-secondary">
              🛠️ Level Editor
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-welcome-play')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
      onStart();
    });

    document.getElementById('btn-welcome-levels')?.addEventListener('click', () => {
      sounds.playClick();
      this.openLevelSelectModal(256);
    });

    document.getElementById('btn-welcome-editor')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
      this.callbacks.onOpenEditor();
    });

    this.modalContainer.style.display = 'flex';
  }

  public updateLevel(title: string, subtitle: string, levelId: number, hintText?: string) {
    this.currentLevelId = levelId;
    this.currentLevelHint = hintText || "";

    this.levelTitleEl.textContent = title;
    this.levelTitleEl.classList.remove('title-bounce');
    void this.levelTitleEl.offsetWidth;
    this.levelTitleEl.classList.add('title-bounce');

    const subEl = document.getElementById('hud-level-sub');
    if (subEl) {
      subEl.textContent = subtitle;
      subEl.classList.remove('sub-fade');
      void subEl.offsetWidth;
      subEl.classList.add('sub-fade');
    }

    const hintBtn = document.getElementById('hud-btn-hint');
    if (hintBtn) {
      if (this.unlockedHints.has(levelId)) {
        hintBtn.classList.add('hint-unlocked');
        hintBtn.setAttribute('title', 'View Unlocked Hint');
      } else {
        hintBtn.classList.remove('hint-unlocked');
        hintBtn.setAttribute('title', 'Watch Ad to Unlock Hint');
      }
    }

    this.updateDeathDisplay(levelId);
  }

  public updateDeathDisplay(levelId: number) {
    const lvlDeaths = this.deathsPerLevel[levelId] || 0;
    this.deathCountEl.textContent = String(lvlDeaths);
    const subDeaths = this.container.querySelector('.hud-death-sub');
    if (subDeaths) {
      subDeaths.textContent = `(Total: ${this.totalDeaths})`;
    }
  }

  public isLevelUnlocked(levelId: number): boolean {
    if (levelId <= 1) return true;
    return this.completedLevels.has(levelId - 1) || this.completedLevels.has(levelId);
  }

  public openLevelSelectModal(totalLevelsCount: number = 256) {
    const modalBody = document.getElementById('hud-modal-body')!;
    const modalTitle = document.getElementById('hud-modal-title')!;
    modalTitle.textContent = "Select Level (256 Stages) 🎮";

    let currentWorld = Math.max(1, Math.min(8, Math.ceil(this.currentLevelId / 32)));
    const levelsPerWorld = 32;
    const totalWorlds = Math.ceil(totalLevelsCount / levelsPerWorld);

    const renderWorld = (worldNum: number) => {
      currentWorld = worldNum;
      const startLevel = (worldNum - 1) * levelsPerWorld + 1;
      const endLevel = Math.min(totalLevelsCount, worldNum * levelsPerWorld);

      let gridHtml = `
        <div class="level-modal-toolbar">
          <div class="world-tabs">
      `;

      for (let w = 1; w <= totalWorlds; w++) {
        gridHtml += `
          <button class="world-tab-btn ${w === currentWorld ? 'active' : ''}" data-world="${w}">
            W${w} (${(w - 1) * levelsPerWorld + 1}-${Math.min(totalLevelsCount, w * levelsPerWorld)})
          </button>
        `;
      }

      gridHtml += `
          </div>
          <div class="level-jump-box">
            <input type="number" id="quick-jump-input" min="1" max="${totalLevelsCount}" placeholder="Lvl #" />
            <button id="quick-jump-btn" class="hud-btn hud-btn-action">GO</button>
          </div>
        </div>
        <div class="level-grid">
      `;

      for (let i = startLevel; i <= endLevel; i++) {
        const isUnlocked = this.isLevelUnlocked(i);
        const isDone = this.completedLevels.has(i);
        const deaths = this.deathsPerLevel[i] || 0;
        const mult = getDifficultyMultiplier(i);
        const hasHint = this.unlockedHints.has(i);

        gridHtml += `
          <button class="level-card ${isDone ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}" data-level="${i}">
            <div class="level-card-number">${i}</div>
            <div class="level-card-diff">${mult}</div>
            <div class="level-card-status">${isDone ? '★ Cleared' : (isUnlocked ? 'Play' : '🔒 Locked')}</div>
            <div class="level-card-deaths">💀 ${deaths} ${hasHint ? '💡' : ''}</div>
          </button>
        `;
      }

      gridHtml += `</div>`;
      modalBody.innerHTML = gridHtml;

      modalBody.querySelectorAll('.world-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sounds.playClick();
          const w = Number(btn.getAttribute('data-world'));
          renderWorld(w);
        });
      });

      const jumpInput = document.getElementById('quick-jump-input') as HTMLInputElement;
      const jumpBtn = document.getElementById('quick-jump-btn');
      const handleJump = () => {
        const val = parseInt(jumpInput?.value, 10);
        if (val >= 1 && val <= totalLevelsCount) {
          if (!this.isLevelUnlocked(val)) {
            sounds.playDeath();
            const toast = document.createElement('div');
            toast.className = 'rage-toast';
            toast.textContent = `🔒 LEVEL ${val} LOCKED! Complete Level ${val - 1} first!`;
            this.container.appendChild(toast);
            setTimeout(() => toast.remove(), 1200);
            return;
          }
          sounds.playClick();
          this.closeModal();
          this.callbacks.onSelectLevel(val);
        }
      };
      jumpBtn?.addEventListener('click', handleJump);
      jumpInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleJump();
      });

      modalBody.querySelectorAll('.level-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          const lvl = Number(btn.getAttribute('data-level'));
          if (!this.isLevelUnlocked(lvl)) {
            sounds.playDeath();
            const toast = document.createElement('div');
            toast.className = 'rage-toast';
            toast.textContent = `🔒 LEVEL ${lvl} LOCKED! Beat Level ${lvl - 1} to unlock!`;
            this.container.appendChild(toast);
            setTimeout(() => toast.remove(), 1200);
            return;
          }
          sounds.playClick();
          this.closeModal();
          this.callbacks.onSelectLevel(lvl);
        });
      });
    };

    renderWorld(currentWorld);
    this.modalContainer.style.display = 'flex';
  }

  public showVictoryModal(levelId: number, nextLevelExists: boolean, onNext: () => void) {
    const modalBody = document.getElementById('hud-modal-body')!;
    const modalTitle = document.getElementById('hud-modal-title')!;
    modalTitle.textContent = "Level Cleared! 🎉";

    const deaths = this.deathsPerLevel[levelId] || 0;

    let compliment = "You survived the troll!";
    if (deaths === 0) compliment = "Flawless psychic clairvoyance! 🧠";
    else if (deaths > 10) compliment = "Your sheer willpower is terrifying. 🔥";
    else if (deaths > 5) compliment = "Fool me once, fool me five times! 😂";

    modalBody.innerHTML = `
      <div class="victory-modal-content">
        <div class="victory-badge">✓</div>
        <p class="victory-compliment">${compliment}</p>
        <div class="victory-stats">
          <div class="stat-item">
            <span class="stat-label">Level Deaths</span>
            <span class="stat-value">💀 ${deaths}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Deaths</span>
            <span class="stat-value">🔥 ${this.totalDeaths}</span>
          </div>
        </div>
        <div class="victory-actions">
          <button id="btn-victory-restart" class="hud-btn hud-btn-secondary">Replay Level</button>
          ${nextLevelExists ? `<button id="btn-victory-next" class="hud-btn hud-btn-action hud-btn-large">Next Level ➔</button>` : `<button id="btn-victory-menu" class="hud-btn hud-btn-action">Return to Menu</button>`}
        </div>
      </div>
    `;

    document.getElementById('btn-victory-restart')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
      this.callbacks.onRestart();
    });

    document.getElementById('btn-victory-next')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
      onNext();
    });

    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
      this.openLevelSelectModal(256);
    });

    this.modalContainer.style.display = 'flex';
  }

  public showGrandEndingModal() {
    const modalBody = document.getElementById('hud-modal-body')!;
    const modalTitle = document.getElementById('hud-modal-title')!;
    modalTitle.textContent = "🏆 YOU BEAT DIE AGAIN! 🏆";

    let titleRank = "Troll Whisperer";
    if (this.totalDeaths < 60) titleRank = "Grandmaster Mind Reader 👑";
    else if (this.totalDeaths < 150) titleRank = "Seasoned Trap Survivor 🛡️";
    else titleRank = "Rage-Proof Demigod 🗿";

    modalBody.innerHTML = `
      <div class="grand-ending-content">
        <div class="trophy-icon">🏆</div>
        <h3>Congratulations!</h3>
        <p>You conquered all 256 treacherous troll gauntlets!</p>
        <div class="final-rank">Rank: <span class="rank-name">${titleRank}</span></div>
        <div class="final-deaths">Total Deaths Across All Levels: <strong>💀 ${this.totalDeaths}</strong></div>
        <p class="final-note">Try making your own devious troll levels in the Level Editor!</p>
        <div class="victory-actions">
          <button id="btn-final-editor" class="hud-btn hud-btn-action">Open Level Editor 🛠️</button>
          <button id="btn-final-menu" class="hud-btn hud-btn-secondary">Level Select</button>
        </div>
      </div>
    `;

    document.getElementById('btn-final-editor')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
      this.callbacks.onOpenEditor();
    });

    document.getElementById('btn-final-menu')?.addEventListener('click', () => {
      sounds.playClick();
      this.closeModal();
      this.openLevelSelectModal(256);
    });

    this.modalContainer.style.display = 'flex';
  }

  public closeModal() {
    if (this.adTimerInterval) {
      clearInterval(this.adTimerInterval);
      this.adTimerInterval = null;
    }
    this.modalContainer.style.display = 'none';
    this.setMenuExpanded(false);
  }

  private setMenuExpanded(expanded: boolean) {
    this.container.classList.toggle('hud-collapsed', !expanded);
    document.getElementById('hud-btn-expand')?.setAttribute('aria-expanded', String(expanded));
  }
}
