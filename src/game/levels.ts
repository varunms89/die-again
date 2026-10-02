import type { LevelData, LevelTheme, Block, Spike, Door, TrollTrigger } from './types';

export const THEMES: Record<string, LevelTheme> = {
  cyber_neon: {
    name: "Cyber Neon",
    skyTop: "#0d091a",
    skyBottom: "#290c3d",
    gridColor: "rgba(236, 72, 153, 0.14)",
    blockBase: "#1f1035",
    blockTop: "#c084fc",
    spikeColor: "#f43f5e",
    spikeGlow: "#fb7185",
    doorFrame: "#facc15",
    doorPortalStart: "#ec4899",
    doorPortalEnd: "#38bdf8",
    ambientDustColor: "#c084fc"
  },
  sunset_inferno: {
    name: "Sunset Inferno",
    skyTop: "#1c070b",
    skyBottom: "#4a1208",
    gridColor: "rgba(249, 115, 22, 0.14)",
    blockBase: "#2e0f0c",
    blockTop: "#fb923c",
    spikeColor: "#ef4444",
    spikeGlow: "#f87171",
    doorFrame: "#fbbf24",
    doorPortalStart: "#f97316",
    doorPortalEnd: "#e11d48",
    ambientDustColor: "#fb923c"
  },
  emerald_matrix: {
    name: "Emerald Matrix",
    skyTop: "#011c15",
    skyBottom: "#04382b",
    gridColor: "rgba(16, 185, 129, 0.14)",
    blockBase: "#032e23",
    blockTop: "#34d399",
    spikeColor: "#f59e0b",
    spikeGlow: "#fde047",
    doorFrame: "#34d399",
    doorPortalStart: "#10b981",
    doorPortalEnd: "#06b6d4",
    ambientDustColor: "#34d399"
  },
  electric_ocean: {
    name: "Electric Ocean",
    skyTop: "#051f33",
    skyBottom: "#093856",
    gridColor: "rgba(56, 189, 248, 0.14)",
    blockBase: "#0b253d",
    blockTop: "#38bdf8",
    spikeColor: "#ec4899",
    spikeGlow: "#f472b6",
    doorFrame: "#38bdf8",
    doorPortalStart: "#0ea5e9",
    doorPortalEnd: "#a855f7",
    ambientDustColor: "#38bdf8"
  },
  candy_pop: {
    name: "Candy Pop",
    skyTop: "#1e092b",
    skyBottom: "#3f0d36",
    gridColor: "rgba(244, 63, 94, 0.14)",
    blockBase: "#2f0d36",
    blockTop: "#f472b6",
    spikeColor: "#fbbf24",
    spikeGlow: "#fde047",
    doorFrame: "#f43f5e",
    doorPortalStart: "#ec4899",
    doorPortalEnd: "#8b5cf6",
    ambientDustColor: "#f472b6"
  },
  kill_screen: {
    name: "8-Bit Glitch",
    skyTop: "#15001c",
    skyBottom: "#350033",
    gridColor: "rgba(255, 0, 128, 0.25)",
    blockBase: "#220025",
    blockTop: "#ff007f",
    spikeColor: "#00ffff",
    spikeGlow: "#70ffff",
    doorFrame: "#ffff00",
    doorPortalStart: "#ff0055",
    doorPortalEnd: "#00ffcc",
    ambientDustColor: "#ff00cc"
  }
};

export const THEME_LIST: LevelTheme[] = [
  THEMES.cyber_neon,
  THEMES.sunset_inferno,
  THEMES.emerald_matrix,
  THEMES.candy_pop,
  THEMES.electric_ocean
];

const BASE_LEVELS: LevelData[] = [
  // LEVEL 1: First Steps
  {
    id: 1,
    title: "Level 1",
    subtitle: "Just a normal walk",
    theme: THEMES.cyber_neon,
    width: 800,
    height: 450,
    playerStart: { x: 70, y: 350 },
    door: {
      x: 700,
      y: 336,
      w: 32,
      h: 44,
      initialX: 700,
      initialY: 336
    },
    blocks: [
      { id: 'b_ground_left', type: 'solid', x: 0, y: 380, w: 550, h: 70, initialX: 0, initialY: 380 },
      { id: 'b_drop_1', type: 'solid', x: 550, y: 380, w: 90, h: 70, initialX: 550, initialY: 380 },
      { id: 'b_ground_door', type: 'solid', x: 640, y: 380, w: 160, h: 70, initialX: 640, initialY: 380 }
    ],
    spikes: [
      { id: 's_pit_1', direction: 'up', x: 560, y: 426, w: 24, h: 24, initialX: 560, initialY: 426 },
      { id: 's_pit_2', direction: 'up', x: 590, y: 426, w: 24, h: 24, initialX: 590, initialY: 426 },
      { id: 's_pit_3', direction: 'up', x: 615, y: 426, w: 24, h: 24, initialX: 615, initialY: 426 }
    ],
    triggers: [
      {
        id: 't_drop_floor',
        condition: 'player_x_gt',
        action: 'drop_blocks',
        params: { x: 480, blockIds: ['b_drop_1'], delay: 0.1 }
      }
    ],
    gravityDirection: 1,
    initialHint: "Walk right to enter the door",
    hint: "The ground right before the exit door drops as you cross x:480! Jump early from the left platform across the opening."
  },

  // LEVEL 2: Collapsing Bridge
  {
    id: 2,
    title: "Level 2",
    subtitle: "Don't look down",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b2_left', type: 'solid', x: 0, y: 380, w: 160, h: 70, initialX: 0, initialY: 380 },
      { id: 'b2_c1', type: 'crumble', x: 190, y: 380, w: 80, h: 70, initialX: 190, initialY: 380 },
      { id: 'b2_c2', type: 'crumble', x: 300, y: 380, w: 80, h: 70, initialX: 300, initialY: 380 },
      { id: 'b2_c3', type: 'crumble', x: 410, y: 380, w: 80, h: 70, initialX: 410, initialY: 380 },
      { id: 'b2_c4', type: 'crumble', x: 520, y: 380, w: 80, h: 70, initialX: 520, initialY: 380 },
      { id: 'b2_right', type: 'solid', x: 630, y: 380, w: 170, h: 70, initialX: 630, initialY: 380 }
    ],
    spikes: [
      { id: 's2_1', direction: 'up', x: 190, y: 426, w: 24, h: 24, initialX: 190, initialY: 426 },
      { id: 's2_2', direction: 'up', x: 260, y: 426, w: 24, h: 24, initialX: 260, initialY: 426 },
      { id: 's2_3', direction: 'up', x: 340, y: 426, w: 24, h: 24, initialX: 340, initialY: 426 },
      { id: 's2_4', direction: 'up', x: 430, y: 426, w: 24, h: 24, initialX: 430, initialY: 426 },
      { id: 's2_5', direction: 'up', x: 520, y: 426, w: 24, h: 24, initialX: 520, initialY: 426 }
    ],
    triggers: [
      {
        id: 't2_collapse',
        condition: 'player_x_gt',
        action: 'drop_blocks',
        params: { x: 320, blockIds: ['b2_c2', 'b2_c3'], delay: 0.15 }
      }
    ],
    gravityDirection: 1,
    initialHint: "A stable bridge... or is it?",
    hint: "Every orange platform will crumble instantly upon touch. Keep sprinting and hop continuously across the bridge without stopping!"
  },

  // LEVEL 3: Jumping Spikes
  {
    id: 3,
    title: "Level 3",
    subtitle: "Copycats",
    width: 800,
    height: 450,
    playerStart: { x: 80, y: 350 },
    door: {
      x: 710,
      y: 336,
      w: 32,
      h: 44,
      initialX: 710,
      initialY: 336
    },
    blocks: [
      { id: 'b3_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 }
    ],
    spikes: [
      { id: 's3_1', direction: 'up', x: 380, y: 356, w: 24, h: 24, initialX: 380, initialY: 356, jumpsWithPlayer: true },
      { id: 's3_2', direction: 'up', x: 410, y: 356, w: 24, h: 24, initialX: 410, initialY: 356, jumpsWithPlayer: true },
      { id: 's3_3', direction: 'up', x: 440, y: 356, w: 24, h: 24, initialX: 440, initialY: 356, jumpsWithPlayer: true }
    ],
    triggers: [
      {
        id: 't3_jump',
        condition: 'player_jump',
        action: 'jump_spikes',
        params: { minX: 250, maxX: 500, spikeIds: ['s3_1', 's3_2', 's3_3'], force: 480 }
      }
    ],
    gravityDirection: 1,
    initialHint: "Jump over the spikes... if they let you",
    hint: "These spikes copy your jump! Bait them by jumping from far away (x:260), then walk underneath while they are up in the air!"
  },

  // LEVEL 4: Shy Door
  {
    id: 4,
    title: "Level 4",
    subtitle: "Where are you going?",
    width: 800,
    height: 450,
    playerStart: { x: 70, y: 350 },
    door: {
      x: 520,
      y: 336,
      w: 32,
      h: 44,
      initialX: 520,
      initialY: 336
    },
    blocks: [
      { id: 'b4_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 },
      { id: 'b4_wall_left', type: 'solid', x: 0, y: 0, w: 30, h: 380, initialX: 0, initialY: 0 },
      { id: 'b4_wall_right', type: 'solid', x: 770, y: 0, w: 30, h: 380, initialX: 770, initialY: 0 }
    ],
    spikes: [
      { id: 's4_1', direction: 'up', x: 300, y: 356, w: 24, h: 24, initialX: 300, initialY: 356 }
    ],
    triggers: [
      {
        id: 't4_flee1',
        condition: 'distance_to_door',
        action: 'flee_door',
        params: { distance: 130, targetX: 720, speed: 400, message: "NOPE! 🏃‍♂️" }
      },
      {
        id: 't4_flee2',
        condition: 'player_x_gt',
        action: 'flee_door',
        params: { x: 620, targetX: 100, speed: 450, message: "SIKE! 👋" }
      }
    ],
    gravityDirection: 1,
    initialHint: "The door is playing hard to get",
    hint: "The door flees right, and then runs all the way back to the left wall (x:100). Chase it right, then turn around to catch it on the left!"
  },

  // LEVEL 5: Ceiling Smash
  {
    id: 5,
    title: "Level 5",
    subtitle: "Watch your head",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b5_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 },
      { id: 'b5_ceil_left', type: 'solid', x: 0, y: 0, w: 200, h: 60, initialX: 0, initialY: 0 },
      { id: 'b5_ceil_trap', type: 'solid', x: 220, y: 0, w: 360, h: 90, initialX: 220, initialY: 0 },
      { id: 'b5_ceil_right', type: 'solid', x: 600, y: 0, w: 200, h: 60, initialX: 600, initialY: 0 }
    ],
    spikes: [
      { id: 's5_down1', direction: 'down', x: 250, y: 90, w: 24, h: 24, initialX: 250, initialY: 90 },
      { id: 's5_down2', direction: 'down', x: 340, y: 90, w: 24, h: 24, initialX: 340, initialY: 90 },
      { id: 's5_down3', direction: 'down', x: 440, y: 90, w: 24, h: 24, initialX: 440, initialY: 90 }
    ],
    triggers: [
      {
        id: 't5_jump_crush',
        condition: 'player_jump',
        action: 'crush_ceiling',
        params: { minX: 200, maxX: 580, blockIds: ['b5_ceil_trap'], speed: 650 }
      }
    ],
    gravityDirection: 1,
    initialHint: "Maybe you shouldn't jump here...",
    hint: "DO NOT JUMP in the middle hallway! Jumping triggers the crushing ceiling to smash down. Simply walk on the floor to the exit."
  },

  // LEVEL 6: The Fake Exit
  {
    id: 6,
    title: "Level 6",
    subtitle: "Too good to be true",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 400,
      y: 336,
      w: 32,
      h: 44,
      initialX: 400,
      initialY: 336
    },
    blocks: [
      { id: 'b6_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 },
      { id: 'b6_high_plat', type: 'solid', x: 140, y: 300, w: 120, h: 24, initialX: 140, initialY: 300 }
    ],
    spikes: [],
    triggers: [
      {
        id: 't6_fake_door',
        condition: 'distance_to_door',
        action: 'fake_door_reveal',
        params: { distance: 45, realDoorX: 95, realDoorY: 176 }
      }
    ],
    gravityDirection: 1,
    initialHint: "That was easy... wait a minute",
    hint: "Jump right onto the raised ledge, then touch the center door. Return to the ledge and jump left into the real portal!"
  },

  // LEVEL 7: Upside Down
  {
    id: 7,
    title: "Level 7",
    subtitle: "Gravity has left the chat",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 70,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 70
    },
    blocks: [
      { id: 'b7_floor', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 },
      { id: 'b7_ceil', type: 'solid', x: 0, y: 0, w: 800, h: 70, initialX: 0, initialY: 0 }
    ],
    spikes: [
      { id: 's7_c1', direction: 'down', x: 480, y: 70, w: 24, h: 24, initialX: 480, initialY: 70 },
      { id: 's7_c2', direction: 'down', x: 510, y: 70, w: 24, h: 24, initialX: 510, initialY: 70 }
    ],
    triggers: [
      {
        id: 't7_flip',
        condition: 'player_x_gt',
        action: 'flip_gravity',
        params: { x: 320 }
      }
    ],
    gravityDirection: 1,
    initialHint: "Keep your feet on the... ceiling?",
    hint: "Crossing x:320 flips gravity to the ceiling! Once on the ceiling, jump downwards to dodge the hanging spikes at x:480."
  },

  // LEVEL 8: Brain Glitch
  {
    id: 8,
    title: "Level 8",
    subtitle: "Brain lag",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b8_ground_1', type: 'solid', x: 0, y: 380, w: 320, h: 70, initialX: 0, initialY: 380 },
      { id: 'b8_plat_mid', type: 'solid', x: 380, y: 340, w: 100, h: 30, initialX: 380, initialY: 340 },
      { id: 'b8_ground_2', type: 'solid', x: 540, y: 380, w: 260, h: 70, initialX: 540, initialY: 380 }
    ],
    spikes: [
      { id: 's8_1', direction: 'up', x: 320, y: 426, w: 24, h: 24, initialX: 320, initialY: 426 },
      { id: 's8_2', direction: 'up', x: 490, y: 426, w: 24, h: 24, initialX: 490, initialY: 426 }
    ],
    triggers: [
      {
        id: 't8_invert',
        condition: 'player_x_gt',
        action: 'invert_controls',
        params: { x: 280 }
      }
    ],
    gravityDirection: 1,
    initialHint: "Your keyboard might feel weird soon",
    hint: "At x:280, left & right arrow keys are flipped! Press LEFT to move right and safely leap across the middle stone island."
  },

  // LEVEL 9: Ghost Bridge
  {
    id: 9,
    title: "Level 9",
    subtitle: "Seeing is not believing",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b9_start', type: 'solid', x: 0, y: 380, w: 180, h: 70, initialX: 0, initialY: 380 },
      { id: 'b9_fake', type: 'fake', x: 260, y: 360, w: 110, h: 25, initialX: 260, initialY: 360, color: '#334155' },
      { id: 'b9_invis1', type: 'invisible', x: 240, y: 395, w: 130, h: 25, initialX: 240, initialY: 395, visible: false },
      { id: 'b9_invis2', type: 'invisible', x: 420, y: 370, w: 130, h: 25, initialX: 420, initialY: 370, visible: false },
      { id: 'b9_end', type: 'solid', x: 620, y: 380, w: 180, h: 70, initialX: 620, initialY: 380 }
    ],
    spikes: [
      { id: 's9_1', direction: 'up', x: 190, y: 426, w: 24, h: 24, initialX: 190, initialY: 426 },
      { id: 's9_2', direction: 'up', x: 380, y: 426, w: 24, h: 24, initialX: 380, initialY: 426 },
      { id: 's9_3', direction: 'up', x: 560, y: 426, w: 24, h: 24, initialX: 560, initialY: 426 }
    ],
    triggers: [
      {
        id: 't9_hint',
        condition: 'player_x_gt',
        action: 'troll_message',
        params: { x: 140, text: "Trust the invisible path! 👻", color: '#38bdf8' }
      }
    ],
    gravityDirection: 1,
    initialHint: "The solid platform is a lie",
    hint: "The upper platform at x:260 is fake and you will fall through. Land directly onto the invisible ledge slightly lower down!"
  },

  // LEVEL 10: Rocket Door
  {
    id: 10,
    title: "Level 10",
    subtitle: "To infinity and beyond",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 700,
      y: 336,
      w: 32,
      h: 44,
      initialX: 700,
      initialY: 336
    },
    blocks: [
      { id: 'b10_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 },
      { id: 'b10_pillar', type: 'solid', x: 180, y: 330, w: 70, h: 50, initialX: 180, initialY: 330 }
    ],
    spikes: [
      { id: 's10_1', direction: 'up', x: 320, y: 356, w: 24, h: 24, initialX: 320, initialY: 356 },
      { id: 's10_2', direction: 'up', x: 450, y: 356, w: 24, h: 24, initialX: 450, initialY: 356 }
    ],
    triggers: [
      {
        id: 't10_rocket',
        condition: 'distance_to_door',
        action: 'rocket_door',
        params: { distance: 90, newX: 200, newY: 256 }
      }
    ],
    gravityDirection: 1,
    initialHint: "Reach the launchpad",
    hint: "Approaching the door launches it like a rocket. It lands on top of the left stone pillar at x:200. Jump on top of the pillar to enter!"
  },

  // LEVEL 11: Slippery Ice Rush
  {
    id: 11,
    title: "Level 11",
    subtitle: "Ice, ice, baby",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b11_start', type: 'solid', x: 0, y: 380, w: 120, h: 70, initialX: 0, initialY: 380 },
      { id: 'b11_ice', type: 'ice', x: 120, y: 380, w: 560, h: 70, initialX: 120, initialY: 380, color: '#38bdf8' },
      { id: 'b11_end', type: 'solid', x: 680, y: 380, w: 120, h: 70, initialX: 680, initialY: 380 }
    ],
    spikes: [
      { id: 's11_pop', direction: 'up', x: 640, y: 356, w: 24, h: 24, initialX: 640, initialY: 356, hidden: true }
    ],
    triggers: [
      {
        id: 't11_spike_pop',
        condition: 'player_x_gt',
        action: 'raise_spikes',
        params: { x: 500, spikeIds: ['s11_pop'], speed: -450 }
      }
    ],
    gravityDirection: 1,
    icePhysics: true,
    initialHint: "Zero friction! Brake early!",
    hint: "You are on frictionless ice and a hidden spike will thrust upward at x:640. Jump before the end of the ice track to clear the pop-up spike!"
  },

  // LEVEL 12: Falling Stalactites
  {
    id: 12,
    title: "Level 12",
    subtitle: "Watch above",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b12_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 },
      { id: 'b12_ceil', type: 'solid', x: 0, y: 0, w: 800, h: 50, initialX: 0, initialY: 0 },
      { id: 'b12_rock1', type: 'solid', x: 260, y: 50, w: 40, h: 40, initialX: 260, initialY: 50, color: '#64748b' },
      { id: 'b12_rock2', type: 'solid', x: 420, y: 50, w: 40, h: 40, initialX: 420, initialY: 50, color: '#64748b' },
      { id: 'b12_rock3', type: 'solid', x: 580, y: 50, w: 40, h: 40, initialX: 580, initialY: 50, color: '#64748b' }
    ],
    spikes: [],
    triggers: [
      {
        id: 't12_drop1',
        condition: 'player_x_gt',
        action: 'drop_blocks',
        params: { x: 210, blockIds: ['b12_rock1'], delay: 0.1 }
      },
      {
        id: 't12_drop2',
        condition: 'player_x_gt',
        action: 'drop_blocks',
        params: { x: 370, blockIds: ['b12_rock2'], delay: 0.1 }
      },
      {
        id: 't12_drop3',
        condition: 'player_x_gt',
        action: 'drop_blocks',
        params: { x: 530, blockIds: ['b12_rock3'], delay: 0.1 }
      }
    ],
    gravityDirection: 1,
    initialHint: "The ceiling is crumbling",
    hint: "Ceiling boulders fall at x:210, x:370, and x:530. Inch forward to trigger each drop, step back, and then walk past safely."
  },

  // LEVEL 13: Bouncy Trap
  {
    id: 13,
    title: "Level 13",
    subtitle: "High voltage trampoline",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 200,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 200
    },
    blocks: [
      { id: 'b13_start', type: 'solid', x: 0, y: 380, w: 190, h: 70, initialX: 0, initialY: 380 },
      { id: 'b13_step', type: 'solid', x: 200, y: 330, w: 70, h: 25, initialX: 200, initialY: 330 },
      { id: 'b13_bounce', type: 'bouncy', x: 330, y: 366, w: 90, h: 20, initialX: 330, initialY: 366, color: '#ec4899' },
      { id: 'b13_ceil', type: 'solid', x: 290, y: 0, w: 170, h: 54, initialX: 290, initialY: 0 },
      { id: 'b13_landing', type: 'solid', x: 550, y: 260, w: 120, h: 22, initialX: 550, initialY: 260 },
      { id: 'b13_dest', type: 'solid', x: 640, y: 228, w: 160, h: 220, initialX: 640, initialY: 228 }
    ],
    spikes: [
      { id: 's13_c1', direction: 'down', x: 315, y: 54, w: 24, h: 24, initialX: 315, initialY: 54 },
      { id: 's13_c2', direction: 'down', x: 350, y: 54, w: 24, h: 24, initialX: 350, initialY: 54 }
    ],
    triggers: [
      {
        id: 't13_msg',
        condition: 'player_x_gt',
        action: 'troll_message',
        params: { x: 210, text: "Pop off the pad and steer right! ↗️", color: '#ec4899' }
      }
    ],
    gravityDirection: 1,
    initialHint: "Pop the bounce pad, then drift right onto the ledge.",
    hint: "The bounce pad sits just beyond the first safe step. Hit it, then steer to the right and land on the mid-air ledge before going for the exit door."
  },

  // LEVEL 14: Dark Room Flashlight
  {
    id: 14,
    title: "Level 14",
    subtitle: "Lights out",
    width: 800,
    height: 450,
    playerStart: { x: 60, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b14_ground', type: 'solid', x: 0, y: 380, w: 800, h: 70, initialX: 0, initialY: 380 },
      { id: 'b14_step1', type: 'solid', x: 250, y: 320, w: 70, h: 60, initialX: 250, initialY: 320 },
      { id: 'b14_step2', type: 'solid', x: 450, y: 270, w: 70, h: 110, initialX: 450, initialY: 270 }
    ],
    spikes: [
      { id: 's14_1', direction: 'up', x: 340, y: 356, w: 24, h: 24, initialX: 340, initialY: 356 },
      { id: 's14_2', direction: 'up', x: 550, y: 356, w: 24, h: 24, initialX: 550, initialY: 356 }
    ],
    triggers: [
      {
        id: 't14_msg',
        condition: 'player_x_gt',
        action: 'troll_message',
        params: { x: 180, text: "Watch your step in the dark! 🔦", color: '#facc15' }
      }
    ],
    gravityDirection: 1,
    darkRoom: true,
    initialHint: "Use your flashlight carefully",
    hint: "In the dark, floor spikes lurk at x:340 and x:550. Jump onto the elevated platforms at x:250 and x:450 to pass over them safely."
  },

  // LEVEL 15: The Ultimate Troll Marathon
  {
    id: 15,
    title: "Level 15",
    subtitle: "The Final Gauntlet",
    width: 800,
    height: 450,
    playerStart: { x: 50, y: 350 },
    door: {
      x: 720,
      y: 336,
      w: 32,
      h: 44,
      initialX: 720,
      initialY: 336
    },
    blocks: [
      { id: 'b15_s1', type: 'solid', x: 0, y: 380, w: 140, h: 70, initialX: 0, initialY: 380 },
      { id: 'b15_drop1', type: 'solid', x: 140, y: 380, w: 80, h: 70, initialX: 140, initialY: 380 },
      { id: 'b15_s2', type: 'solid', x: 260, y: 380, w: 120, h: 70, initialX: 260, initialY: 380 },
      { id: 'b15_s3', type: 'solid', x: 420, y: 380, w: 160, h: 70, initialX: 420, initialY: 380 },
      { id: 'b15_ceil_trap', type: 'solid', x: 420, y: 0, w: 160, h: 80, initialX: 420, initialY: 0 },
      { id: 'b15_end', type: 'solid', x: 620, y: 380, w: 180, h: 70, initialX: 620, initialY: 380 }
    ],
    spikes: [
      { id: 's15_pit1', direction: 'up', x: 150, y: 426, w: 24, h: 24, initialX: 150, initialY: 426 },
      { id: 's15_jump', direction: 'up', x: 310, y: 356, w: 24, h: 24, initialX: 310, initialY: 356, jumpsWithPlayer: true },
      { id: 's15_pit2', direction: 'up', x: 590, y: 426, w: 24, h: 24, initialX: 590, initialY: 426 }
    ],
    triggers: [
      {
        id: 't15_drop',
        condition: 'player_x_gt',
        action: 'drop_blocks',
        params: { x: 100, blockIds: ['b15_drop1'], delay: 0.1 }
      },
      {
        id: 't15_jump',
        condition: 'player_jump',
        action: 'jump_spikes',
        params: { minX: 240, maxX: 380, spikeIds: ['s15_jump'], force: 460 }
      },
      {
        id: 't15_crush',
        condition: 'player_jump',
        action: 'crush_ceiling',
        params: { minX: 410, maxX: 560, blockIds: ['b15_ceil_trap'], speed: 600 }
      },
      {
        id: 't15_door',
        condition: 'distance_to_door',
        action: 'flee_door',
        params: { distance: 100, targetX: 750, speed: 200, message: "ONE LAST STEP! 🏆" }
      }
    ],
    gravityDirection: 1,
    initialHint: "Everything you've learned. Do not panic.",
    hint: "Jump early across the dropping ground, trigger the jumping spike by hopping in place, walk without jumping under the ceiling, and corner the door!"
  }
];

export function getDifficultyMultiplier(id: number): string {
  if (id === 1) return '1x';
  if (id === 2) return '10x';
  if (id === 3) return '100x';
  if (id === 4) return '1,000x';
  if (id === 5) return '10,000x';
  if (id === 6) return '100,000x';
  if (id === 7) return '1,000,000x';
  return `10^${id - 1}x`;
}

const PROCEDURAL_TITLES = [
  "Pixel Precision",
  "The Quantum Gap",
  "Do Not Hesitate",
  "Reverse Thinking",
  "The Floor is a Lie",
  "Lightning Reflexes",
  "Ceiling Guillotine",
  "Paranoia Corridor",
  "Subzero Reaction",
  "Dark Matter Steps",
  "Trust Nobody",
  "Anti-Gravity Hazard",
  "Calculated Madness",
  "Neural Overload",
  "Fleeing Mirage",
  "Velocity Gauntlet",
  "Double Inversion",
  "The Invisible Trial",
  "Chamber of Regret",
  "Cognitive Strain",
  "Dimensional Warp",
  "Zero Second Reflex",
  "Hyperdrive Obstacle",
  "Fractured Reality"
];

function generateProceduralLevel(id: number): LevelData {
  const mult = getDifficultyMultiplier(id);
  const archetype = id === 256 ? 999 : ((id - 16) % 15);
  const theme = id === 256 
    ? THEMES.kill_screen 
    : THEME_LIST[(id - 1) % THEME_LIST.length];

  const titleName = id === 256 
    ? "THE 8-BIT OVERFLOW KILL SCREEN" 
    : PROCEDURAL_TITLES[(id - 16) % PROCEDURAL_TITLES.length];
  
  const subtitle = `${titleName} | ${mult} Harder`;

  // 10x progressive scaling factors
  const trapDelay = Math.max(0.012, +(0.20 * Math.pow(0.975, id - 15)).toFixed(3));
  const crushSpeed = Math.min(1050, Math.round(520 + (id - 15) * 2.8));
  const spikeJumpForce = Math.min(640, Math.round(440 + (id - 15) * 1.1));
  const doorFleeSpeed = Math.min(520, Math.round(220 + (id - 15) * 1.4));
  const isIce = (archetype === 5 || (id % 9 === 0 && id !== 256));
  const isDark = (archetype === 9 || (id % 13 === 0 && id !== 256));
  const isGravityInverted = archetype === 4;

  const width = 800;
  const height = 450;
  const groundY = 380;
  const playerStartY = isGravityInverted ? 100 : 350;
  const doorY = isGravityInverted ? 70 : 336;

  const blocks: Block[] = [];
  const spikes: Spike[] = [];
  const triggers: TrollTrigger[] = [];
  let hintText = "";

  // Starting solid ground
  blocks.push({
    id: `b${id}_start`,
    type: 'solid',
    x: 0,
    y: isGravityInverted ? 0 : groundY,
    w: 130,
    h: 70,
    initialX: 0,
    initialY: isGravityInverted ? 0 : groundY
  });

  // Goal landing ground
  blocks.push({
    id: `b${id}_end`,
    type: 'solid',
    x: 670,
    y: isGravityInverted ? 0 : groundY,
    w: 130,
    h: 70,
    initialX: 670,
    initialY: isGravityInverted ? 0 : groundY
  });

  const door: Door = {
    x: 730,
    y: doorY,
    w: 32,
    h: 44,
    initialX: 730,
    initialY: doorY
  };

  const pitY = 426;
  spikes.push(
    { id: `s${id}_pit1`, direction: 'up', x: 200, y: pitY, w: 24, h: 24, initialX: 200, initialY: pitY },
    { id: `s${id}_pit2`, direction: 'up', x: 340, y: pitY, w: 24, h: 24, initialX: 340, initialY: pitY },
    { id: `s${id}_pit3`, direction: 'up', x: 480, y: pitY, w: 24, h: 24, initialX: 480, initialY: pitY },
    { id: `s${id}_pit4`, direction: 'up', x: 600, y: pitY, w: 24, h: 24, initialX: 600, initialY: pitY }
  );

  switch (archetype) {
    case 0: { // Collapsing Cascade
      const platformWidth = Math.max(55, Math.round(90 - ((id - 15) * 0.12)));
      blocks.push(
        { id: `b${id}_c1`, type: 'crumble', x: 160, y: 360, w: platformWidth, h: 25, initialX: 160, initialY: 360 },
        { id: `b${id}_c2`, type: 'crumble', x: 290, y: 340, w: platformWidth, h: 25, initialX: 290, initialY: 340 },
        { id: `b${id}_c3`, type: 'crumble', x: 420, y: 320, w: platformWidth, h: 25, initialX: 420, initialY: 320 },
        { id: `b${id}_drop`, type: 'solid', x: 550, y: 340, w: platformWidth, h: 25, initialX: 550, initialY: 340 }
      );
      triggers.push({
        id: `t${id}_drop`,
        condition: 'player_x_gt',
        action: 'drop_blocks',
        params: { x: 510, blockIds: [`b${id}_drop`], delay: trapDelay }
      });
      hintText = `Tactical Clue: The platforms crumble rapidly in ${trapDelay}s! Full sprint and continuous hopping is required to cross before the drop block at x:550 vanishes.`;
      break;
    }
    case 1: { // Jumping Spikes
      blocks.push(
        { id: `b${id}_m1`, type: 'solid', x: 150, y: groundY, w: 140, h: 70, initialX: 150, initialY: groundY },
        { id: `b${id}_m2`, type: 'solid', x: 330, y: groundY, w: 140, h: 70, initialX: 330, initialY: groundY },
        { id: `b${id}_m3`, type: 'solid', x: 510, y: groundY, w: 140, h: 70, initialX: 510, initialY: groundY }
      );
      spikes.push(
        { id: `s${id}_j1`, direction: 'up', x: 210, y: groundY - 24, w: 24, h: 24, initialX: 210, initialY: groundY - 24, jumpsWithPlayer: true },
        { id: `s${id}_j2`, direction: 'up', x: 390, y: groundY - 24, w: 24, h: 24, initialX: 390, initialY: groundY - 24, jumpsWithPlayer: true }
      );
      triggers.push({
        id: `t${id}_jump`,
        condition: 'player_jump',
        action: 'jump_spikes',
        params: { minX: 160, maxX: 500, spikeIds: [`s${id}_j1`, `s${id}_j2`], force: spikeJumpForce }
      });
      hintText = `Tactical Clue: The spikes will jump with ${spikeJumpForce} force whenever you hop! Bait them by jumping in place from a distance, then walk underneath while they are in mid-air.`;
      break;
    }
    case 2: { // Crushing Ceiling
      blocks.push(
        { id: `b${id}_p1`, type: 'solid', x: 130, y: groundY, w: 540, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_ceil`, type: 'solid', x: 280, y: -20, w: 220, h: 120, initialX: 280, initialY: -20 }
      );
      spikes.push({
        id: `s${id}_c_spk`,
        direction: 'down',
        x: 350,
        y: 100,
        w: 24,
        h: 24,
        initialX: 350,
        initialY: 100
      });
      triggers.push({
        id: `t${id}_crush`,
        condition: 'player_x_gt',
        action: 'crush_ceiling',
        params: { x: 250, blockIds: [`b${id}_ceil`], speed: crushSpeed }
      });
      hintText = `Tactical Clue: A massive ceiling crusher slams down at ${crushSpeed}px/s at x:250. Step forward to trigger it, back up immediately, and then walk over the landed crusher.`;
      break;
    }
    case 3: { // Fleeing Portal
      blocks.push(
        { id: `b${id}_f1`, type: 'solid', x: 130, y: groundY, w: 540, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_elev`, type: 'solid', x: 690, y: 260, w: 90, h: 25, initialX: 690, initialY: 260 }
      );
      triggers.push({
        id: `t${id}_flee`,
        condition: 'distance_to_door',
        action: 'flee_door',
        params: { distance: 130, targetX: 690, speed: doorFleeSpeed, message: "NOT SO FAST! 😈" }
      });
      hintText = `Tactical Clue: The door flees to the upper-right ledge (x:690) at ${doorFleeSpeed}px/s when approached. Follow it and jump onto the upper pedestal to exit.`;
      break;
    }
    case 4: { // Anti-Gravity Ceiling
      blocks.push(
        { id: `b${id}_g1`, type: 'solid', x: 130, y: 0, w: 180, h: 70, initialX: 130, initialY: 0 },
        { id: `b${id}_g2`, type: 'solid', x: 350, y: 0, w: 180, h: 70, initialX: 350, initialY: 0 },
        { id: `b${id}_g3`, type: 'solid', x: 550, y: 0, w: 140, h: 70, initialX: 550, initialY: 0 }
      );
      spikes.push(
        { id: `s${id}_g_spk1`, direction: 'down', x: 250, y: 70, w: 24, h: 24, initialX: 250, initialY: 70 },
        { id: `s${id}_g_spk2`, direction: 'down', x: 450, y: 70, w: 24, h: 24, initialX: 450, initialY: 70 }
      );
      hintText = `Tactical Clue: Gravity is completely inverted! You run across the ceiling. Use short downward hops to clear the ceiling spikes.`;
      break;
    }
    case 5: { // Subzero Popup
      blocks.push(
        { id: `b${id}_ice1`, type: 'ice', x: 130, y: groundY, w: 540, h: 70, initialX: 130, initialY: groundY }
      );
      spikes.push(
        { id: `s${id}_ice_spk`, direction: 'up', x: 620, y: groundY - 24, w: 24, h: 24, initialX: 620, initialY: groundY - 24, hidden: true }
      );
      triggers.push({
        id: `t${id}_popup`,
        condition: 'player_x_gt',
        action: 'raise_spikes',
        params: { x: 500, spikeIds: [`s${id}_ice_spk`] }
      });
      hintText = `Tactical Clue: High-speed icy runway! A hidden popup spike will emerge at x:620 when you reach x:500. Jump before x:580 while sliding to soar over it.`;
      break;
    }
    case 6: { // Phantom Invisible Path
      blocks.push(
        { id: `b${id}_fake1`, type: 'fake', x: 150, y: groundY, w: 150, h: 70, initialX: 150, initialY: groundY },
        { id: `b${id}_inv1`, type: 'invisible', x: 320, y: 340, w: 90, h: 25, initialX: 320, initialY: 340 },
        { id: `b${id}_inv2`, type: 'invisible', x: 450, y: 310, w: 90, h: 25, initialX: 450, initialY: 310 },
        { id: `b${id}_inv3`, type: 'invisible', x: 570, y: 340, w: 90, h: 25, initialX: 570, initialY: 340 }
      );
      triggers.push({
        id: `t${id}_ctrl`,
        condition: 'player_x_gt',
        action: 'invert_controls',
        params: { x: 440, duration: 4.5, message: "CONTROLS REVERSED! 🧠" }
      });
      hintText = `Tactical Clue: The ground block at x:150 is a fake hologram! Jump above into the air to land on the invisible staircase steps (x:320, 450, 570), and remember controls invert at x:440!`;
      break;
    }
    case 7: { // Multi-Hazard Gauntlet
      blocks.push(
        { id: `b${id}_cc1`, type: 'crumble', x: 150, y: 360, w: 80, h: 25, initialX: 150, initialY: 360 },
        { id: `b${id}_cc2`, type: 'ice', x: 260, y: 340, w: 90, h: 25, initialX: 260, initialY: 340 },
        { id: `b${id}_cc3`, type: 'crumble', x: 380, y: 320, w: 80, h: 25, initialX: 380, initialY: 320 },
        { id: `b${id}_cc4`, type: 'solid', x: 490, y: 340, w: 90, h: 25, initialX: 490, initialY: 340 },
        { id: `b${id}_ceil_c`, type: 'solid', x: 240, y: -40, w: 140, h: 100, initialX: 240, initialY: -40 }
      );
      spikes.push(
        { id: `s${id}_cc_j`, direction: 'up', x: 520, y: 316, w: 24, h: 24, initialX: 520, initialY: 316, jumpsWithPlayer: true }
      );
      triggers.push(
        {
          id: `t${id}_crush2`,
          condition: 'player_x_gt',
          action: 'crush_ceiling',
          params: { x: 200, blockIds: [`b${id}_ceil_c`], speed: crushSpeed }
        },
        {
          id: `t${id}_jump2`,
          condition: 'player_jump',
          action: 'jump_spikes',
          params: { minX: 450, maxX: 580, spikeIds: [`s${id}_cc_j`], force: spikeJumpForce }
        },
        {
          id: `t${id}_flee2`,
          condition: 'distance_to_door',
          action: 'flee_door',
          params: { distance: 120, targetX: 750, speed: doorFleeSpeed, message: "SURPRISE! 🤡" }
        }
      );
      hintText = `Tactical Clue: Triple trap! Hop across the crumbling ice platforms, bait the ceiling drop early, watch for the jumping spike at x:520, and run down the fleeing exit!`;
      break;
    }
    case 8: { // Trampoline Air-Strafe
      blocks.push(
        { id: `b${id}_t1`, type: 'solid', x: 130, y: groundY, w: 100, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_trampoline`, type: 'bouncy', x: 260, y: 370, w: 80, h: 20, initialX: 260, initialY: 370, color: '#ec4899' },
        { id: `b${id}_t_ceil`, type: 'solid', x: 230, y: 0, w: 140, h: 50, initialX: 230, initialY: 0 },
        { id: `b${id}_t_landing`, type: 'solid', x: 480, y: 260, w: 120, h: 22, initialX: 480, initialY: 260 },
        { id: `b${id}_t_dest`, type: 'solid', x: 650, y: 240, w: 150, h: 210, initialX: 650, initialY: 240 }
      );
      door.y = 196;
      door.initialY = 196;
      spikes.push(
        { id: `s${id}_t_spk`, direction: 'down', x: 270, y: 50, w: 24, h: 24, initialX: 270, initialY: 50 }
      );
      hintText = `Tactical Clue: Jump onto the trampoline and steer right to land on the mid-air platform at x:480. Jump again to reach the high exit ledge.`;
      break;
    }
    case 9: { // Dark Room Precision
      blocks.push(
        { id: `b${id}_d_ground`, type: 'solid', x: 130, y: groundY, w: 540, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_d_s1`, type: 'solid', x: 270, y: 310, w: 75, h: 70, initialX: 270, initialY: 310 },
        { id: `b${id}_d_s2`, type: 'solid', x: 470, y: 260, w: 75, h: 120, initialX: 470, initialY: 260 }
      );
      spikes.push(
        { id: `s${id}_d_spk1`, direction: 'up', x: 360, y: 356, w: 24, h: 24, initialX: 360, initialY: 356 },
        { id: `s${id}_d_spk2`, direction: 'up', x: 560, y: 356, w: 24, h: 24, initialX: 560, initialY: 356 }
      );
      hintText = `Tactical Clue: Dark Room mode! Floor spikes are hidden in the shadows at x:360 and x:560. Jump onto the elevated steps at x:270 and x:470 to clear them safely.`;
      break;
    }
    case 10: { // Falling Stalactite Minefield
      blocks.push(
        { id: `b${id}_st_ground`, type: 'solid', x: 130, y: groundY, w: 540, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_st1`, type: 'solid', x: 250, y: 40, w: 45, h: 45, initialX: 250, initialY: 40, color: '#64748b' },
        { id: `b${id}_st2`, type: 'solid', x: 410, y: 40, w: 45, h: 45, initialX: 410, initialY: 40, color: '#64748b' },
        { id: `b${id}_st3`, type: 'solid', x: 570, y: 40, w: 45, h: 45, initialX: 570, initialY: 40, color: '#64748b' }
      );
      triggers.push(
        { id: `t${id}_st1`, condition: 'player_x_gt', action: 'drop_blocks', params: { x: 200, blockIds: [`b${id}_st1`], delay: 0.08 } },
        { id: `t${id}_st2`, condition: 'player_x_gt', action: 'drop_blocks', params: { x: 360, blockIds: [`b${id}_st2`], delay: 0.08 } },
        { id: `t${id}_st3`, condition: 'player_x_gt', action: 'drop_blocks', params: { x: 520, blockIds: [`b${id}_st3`], delay: 0.08 } }
      );
      hintText = `Tactical Clue: Heavy rocks fall as you run underneath. Bait each rock by inching forward, backing off a step, and then continuing forward.`;
      break;
    }
    case 11: { // Inverted Controls Gauntlet
      blocks.push(
        { id: `b${id}_ic_g1`, type: 'solid', x: 130, y: groundY, w: 180, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_ic_m`, type: 'solid', x: 370, y: 340, w: 100, h: 30, initialX: 370, initialY: 340 },
        { id: `b${id}_ic_g2`, type: 'solid', x: 530, y: groundY, w: 150, h: 70, initialX: 530, initialY: groundY }
      );
      triggers.push({
        id: `t${id}_ic_inv`,
        condition: 'player_x_gt',
        action: 'invert_controls',
        params: { x: 260 }
      });
      hintText = `Tactical Clue: Controls flip at x:260! When crossing the first gap, immediately press LEFT to jump rightward onto the middle island.`;
      break;
    }
    case 12: { // Rocket Launch Door
      blocks.push(
        { id: `b${id}_rk_g`, type: 'solid', x: 130, y: groundY, w: 540, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_rk_pil`, type: 'solid', x: 190, y: 250, w: 80, h: 130, initialX: 190, initialY: 250 }
      );
      spikes.push(
        { id: `s${id}_rk_spk`, direction: 'up', x: 350, y: 356, w: 24, h: 24, initialX: 350, initialY: 356 }
      );
      triggers.push({
        id: `t${id}_rk_trig`,
        condition: 'distance_to_door',
        action: 'rocket_door',
        params: { distance: 95, newX: 215, newY: 206 }
      });
      hintText = `Tactical Clue: The door launches like a rocket when approached and drops onto the pillar at x:190. Jump onto the stone pillar to catch it!`;
      break;
    }
    case 13: { // Sike Floor & High Ledge
      blocks.push(
        { id: `b${id}_sk_drop`, type: 'solid', x: 130, y: groundY, w: 540, h: 70, initialX: 130, initialY: groundY },
        { id: `b${id}_sk_high`, type: 'solid', x: 80, y: 210, w: 120, h: 25, initialX: 80, initialY: 210 }
      );
      triggers.push({
        id: `t${id}_sk_fake`,
        condition: 'distance_to_door',
        action: 'fake_door_reveal',
        params: { distance: 50, realDoorX: 120, realDoorY: 166 }
      });
      hintText = `Tactical Clue: The door in front is a fake! Touch it to spawn the genuine portal on the high ledge at x:80 behind you.`;
      break;
    }
    case 14: { // Precision Micro-Pillars
      blocks.push(
        { id: `b${id}_mp1`, type: 'solid', x: 170, y: 350, w: 60, h: 30, initialX: 170, initialY: 350 },
        { id: `b${id}_mp2`, type: 'solid', x: 290, y: 330, w: 60, h: 30, initialX: 290, initialY: 330 },
        { id: `b${id}_mp3`, type: 'solid', x: 410, y: 310, w: 60, h: 30, initialX: 410, initialY: 310 },
        { id: `b${id}_mp4`, type: 'solid', x: 530, y: 330, w: 60, h: 30, initialX: 530, initialY: 330 }
      );
      triggers.push({
        id: `t${id}_mp_msg`,
        condition: 'player_x_gt',
        action: 'troll_message',
        params: { x: 200, text: "Micro precision required! 🎯", color: '#facc15' }
      });
      hintText = `Tactical Clue: Narrow 60px stepping stones! Release the jump key early for short controlled hops so you don't overshoot the platforms.`;
      break;
    }
    default: {
      // Level 256 Kill Screen Special
      blocks.push(
        { id: `b256_floor1`, type: 'crumble', x: 130, y: 360, w: 70, h: 25, initialX: 130, initialY: 360 },
        { id: `b256_floor2`, type: 'ice', x: 230, y: 330, w: 70, h: 25, initialX: 230, initialY: 330 },
        { id: `b256_floor3`, type: 'invisible', x: 330, y: 300, w: 70, h: 25, initialX: 330, initialY: 300 },
        { id: `b256_floor4`, type: 'crumble', x: 430, y: 270, w: 70, h: 25, initialX: 430, initialY: 270 },
        { id: `b256_floor5`, type: 'ice', x: 530, y: 300, w: 70, h: 25, initialX: 530, initialY: 300 },
        { id: `b256_ceil`, type: 'solid', x: 310, y: -20, w: 180, h: 100, initialX: 310, initialY: -20 }
      );
      spikes.push(
        { id: `s256_boss1`, direction: 'up', x: 250, y: 306, w: 24, h: 24, initialX: 250, initialY: 306, jumpsWithPlayer: true },
        { id: `s256_boss2`, direction: 'up', x: 550, y: 276, w: 24, h: 24, initialX: 550, initialY: 276, jumpsWithPlayer: true }
      );
      triggers.push(
        {
          id: `t256_crush`,
          condition: 'player_x_gt',
          action: 'crush_ceiling',
          params: { x: 270, blockIds: [`b256_ceil`], speed: 999 }
        },
        {
          id: `t256_ctrl`,
          condition: 'player_x_gt',
          action: 'invert_controls',
          params: { x: 320, duration: 6, message: "SYSTEM GLITCH: CONTROLS FLIPPED! ⚠️" }
        },
        {
          id: `t256_door`,
          condition: 'distance_to_door',
          action: 'flee_door',
          params: { distance: 110, targetX: 750, speed: 450, message: "FINAL TROLL! 🏆" }
        }
      );
      hintText = `GRAND 256th TRIAL CLUE: Controls invert at x:320, ceiling slams at 999px/s, and the door flees! Sprint across the crumble, land on the invisible platform at x:330, reverse your inputs instantly, and chase the door into the exit portal!`;
      break;
    }
  }

  return {
    id,
    title: `Level ${id}`,
    subtitle,
    theme,
    width,
    height,
    playerStart: { x: 50, y: playerStartY },
    door,
    blocks,
    spikes,
    triggers,
    gravityDirection: isGravityInverted ? -1 : 1,
    icePhysics: isIce,
    darkRoom: isDark,
    initialHint: id === 256 
      ? "THE FINAL 256th TRIAL. ONLY FOR INTELIGENT PERSON." 
      : `Difficulty escalated: ${mult} Harder.`,
    hint: hintText
  };
}

export const LEVELS: LevelData[] = (() => {
  const all: LevelData[] = [];
  BASE_LEVELS.forEach(lvl => {
    all.push({
      ...lvl,
      subtitle: `${lvl.subtitle} | ${getDifficultyMultiplier(lvl.id)} Harder`
    });
  });
  for (let i = 16; i <= 256; i++) {
    all.push(generateProceduralLevel(i));
  }
  return all;
})();
