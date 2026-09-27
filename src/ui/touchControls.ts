export interface TouchInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  jumpJustReleased: boolean;
  restart: boolean;
}

export class TouchController {
  public state: TouchInputState = {
    left: false,
    right: false,
    jump: false,
    jumpJustPressed: false,
    jumpJustReleased: false,
    restart: false
  };

  private container: HTMLElement | null = null;
  public isTouchDevice: boolean = false;
  public visible: boolean = false;

  constructor() {
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.visible = this.isTouchDevice;
  }

  public init(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.id = 'touch-controls';
    this.container.className = 'touch-controls-container';
    if (!this.visible) {
      this.container.style.display = 'none';
    }

    this.container.innerHTML = `
      <div class="touch-dpad">
        <button id="btn-touch-left" class="touch-btn touch-btn-dpad" aria-label="Move Left">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button id="btn-touch-right" class="touch-btn touch-btn-dpad" aria-label="Move Right">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>

      <div class="touch-actions">
        <button id="btn-touch-jump" class="touch-btn touch-btn-jump" aria-label="Jump">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor">
            <path d="M12 4l-8 8h5v8h6v-8h5z"/>
          </svg>
          <span>JUMP</span>
        </button>
      </div>
    `;

    parent.appendChild(this.container);
    this.bindTouchEvents();
  }

  private bindTouchEvents() {
    const btnLeft = document.getElementById('btn-touch-left');
    const btnRight = document.getElementById('btn-touch-right');
    const btnJump = document.getElementById('btn-touch-jump');

    if (btnLeft) {
      this.attachButton(btnLeft, (pressed) => {
        this.state.left = pressed;
      });
    }

    if (btnRight) {
      this.attachButton(btnRight, (pressed) => {
        this.state.right = pressed;
      });
    }

    if (btnJump) {
      this.attachButton(btnJump, (pressed) => {
        if (pressed && !this.state.jump) {
          this.state.jumpJustPressed = true;
        } else if (!pressed && this.state.jump) {
          this.state.jumpJustReleased = true;
        }
        this.state.jump = pressed;
      });
    }
  }

  private attachButton(el: HTMLElement, onChange: (pressed: boolean) => void) {
    const handleStart = (e: Event) => {
      e.preventDefault();
      el.classList.add('active');
      onChange(true);
    };

    const handleEnd = (e: Event) => {
      e.preventDefault();
      el.classList.remove('active');
      onChange(false);
    };

    el.addEventListener('touchstart', handleStart, { passive: false });
    el.addEventListener('touchend', handleEnd, { passive: false });
    el.addEventListener('touchcancel', handleEnd, { passive: false });

    // Also mouse events for easy testing in browser
    el.addEventListener('mousedown', handleStart);
    el.addEventListener('mouseup', handleEnd);
    el.addEventListener('mouseleave', handleEnd);
  }

  public toggleVisibility(): boolean {
    this.visible = !this.visible;
    if (this.container) {
      this.container.style.display = this.visible ? 'flex' : 'none';
    }
    return this.visible;
  }

  public resetFrameTriggers() {
    this.state.jumpJustPressed = false;
    this.state.jumpJustReleased = false;
  }
}
