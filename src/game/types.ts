export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BlockType = 
  | 'solid' 
  | 'crumble' 
  | 'invisible' 
  | 'fake' 
  | 'bouncy' 
  | 'ice' 
  | 'gravity_flip' 
  | 'conveyor_left' 
  | 'conveyor_right';

export interface Block extends Rect {
  id: string;
  type: BlockType;
  initialX: number;
  initialY: number;
  vx?: number;
  vy?: number;
  isFalling?: boolean;
  fallDelay?: number;
  shakeTimer?: number;
  visible?: boolean;
  color?: string;
  borderColor?: string;
  opacity?: number;
}

export type SpikeDirection = 'up' | 'down' | 'left' | 'right';

export interface Spike extends Rect {
  id: string;
  direction: SpikeDirection;
  initialX: number;
  initialY: number;
  vx?: number;
  vy?: number;
  isMoving?: boolean;
  jumpsWithPlayer?: boolean;
  hidden?: boolean;
  popped?: boolean;
  color?: string;
}

export interface Door extends Rect {
  initialX: number;
  initialY: number;
  vx?: number;
  vy?: number;
  isFake?: boolean;
  isFleeing?: boolean;
  fleeDirection?: number;
  targetX?: number;
  targetY?: number;
  isRocket?: boolean;
  rocketVy?: number;
  trollMessage?: string;
  opened?: boolean;
  scale?: number;
}

export type TriggerCondition = 
  | 'player_x_gt' 
  | 'player_x_lt' 
  | 'player_y_gt' 
  | 'player_y_lt' 
  | 'distance_to_door'
  | 'distance_to_point'
  | 'player_jump' 
  | 'player_land' 
  | 'player_touch_block' 
  | 'timer';

export type TrollActionType = 
  | 'drop_blocks' 
  | 'raise_spikes' 
  | 'flee_door' 
  | 'jump_spikes' 
  | 'crush_ceiling' 
  | 'flip_gravity' 
  | 'invert_controls' 
  | 'fake_door_reveal' 
  | 'rocket_door' 
  | 'spawn_spikes' 
  | 'collapse_bridge' 
  | 'shake_camera' 
  | 'troll_message' 
  | 'toggle_lights' 
  | 'custom';

export interface TrollTrigger {
  id: string;
  condition: TriggerCondition;
  action: TrollActionType;
  executed?: boolean;
  params: Record<string, any>;
}

export interface LevelTheme {
  name: string;
  skyTop: string;
  skyBottom: string;
  gridColor: string;
  blockBase: string;
  blockTop: string;
  spikeColor: string;
  spikeGlow: string;
  doorFrame: string;
  doorPortalStart: string;
  doorPortalEnd: string;
  ambientDustColor: string;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  playerStart: Vector2D;
  door: Door;
  blocks: Block[];
  spikes: Spike[];
  triggers: TrollTrigger[];
  gravityDirection?: 1 | -1; // 1 = normal (down), -1 = inverted (up)
  initialHint?: string;
  hint?: string;
  darkRoom?: boolean;
  icePhysics?: boolean;
  theme?: LevelTheme;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity?: number;
  shape?: 'circle' | 'square' | 'confetti';
  rotation?: number;
  rotSpeed?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  lifetime: number;
  vy: number;
}

export type GameScreen = 'menu' | 'level_select' | 'playing' | 'level_clear' | 'game_complete' | 'editor';
