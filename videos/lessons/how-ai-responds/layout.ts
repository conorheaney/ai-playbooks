import type {Segment, TankTextSizes} from '../../shared/components/context/ContextTank';

// The model cube's resting place in every scene.
export const CUBE_HOME = {x: 520, y: 540, size: 80};

// The context window's resting place: centre (1300, 560), 320 × 760.
export const TANK_HOME = {x: 1300, y: 560, w: 320, h: 760};

// Text sizes for every tank in this lesson: larger than ContextTank's defaults, for the 1080p legibility floor.
export const TANK_TEXT: TankTextSizes = {label: 20, labelGap: 28, ruler: 18, readoutSub: 18, segment: 18, remaining: 22};

// Illustrative only; the readout always says EXAMPLE CAPACITY.
export const CAPACITY = 200_000;

export const PROMPT = "What's the capital of Australia?";

// The assembled input from Scene 1, bottom to top (fractions of the window).
export const INPUT: Segment[] = [
  {kind: 'instructions', from: 0, to: 0.06},
  {kind: 'tools', from: 0.06, to: 0.14},
  {kind: 'history', from: 0.14, to: 0.32},
  {kind: 'documents', from: 0.32, to: 0.54},
  {kind: 'message', from: 0.54, to: 0.56},
];
export const INPUT_TOP = 0.56;

// The compacted context at the end of Scene 6.
export const COMPACTED: Segment[] = [
  {kind: 'instructions', from: 0, to: 0.06},
  {kind: 'tools', from: 0.06, to: 0.14},
  {kind: 'summary', from: 0.14, to: 0.22},
  {kind: 'history', from: 0.22, to: 0.34},
];
export const COMPACTED_TOP = 0.34;
