// Single source of truth for every beat. Scenes and the SFX cue sheet both read from here.
import {buildTimeline, timelineLength} from '../../shared/lib/timeline';

// Scene lengths in frames. These are planned from the script at about 2.5 words per second; once the
// voiceover is recorded, size each scene to its take and move its beats onto the words (see BLUEPRINT.md).
const DURATIONS = {
  weights: 324, // VO ~9.6 s planned, plus the hand-off
  prompt: 324, // VO ~9.6 s planned, plus a hold on the caption
  specific: 384, // VO ~11.6 s planned, plus a hold on the caption
  engineering: 348, // VO ~10 s planned, plus the fade
  prepare: 336, // VO ~10 s planned
  ask: 348, // VO ~10.4 s planned
  citations: 300, // VO ~8.8 s planned, plus a hold on the caption
  memory: 432, // VO ~10.8 s planned, plus the finale
} as const;

export type SceneKey = keyof typeof DURATIONS;
export const SCENES = buildTimeline(DURATIONS);
export const TOTAL_FRAMES = timelineLength(SCENES); // 2796 (93.2 s)

// Scene-local frames below. Comments give the word each beat is planned against.

// Scene 1: the locked model can't know private or new information unless it reaches the context.
export const WEIGHTS = {
  titleToCorner: 40,
  cubeIn: 20,
  frozen: [60, 94], // "fixed after training"
  cards: [130, 180, 220], // "files", "rules", "news"
  flight: 16, // frames from off-screen to the padlock
  frozenOut: 240,
  tank: [240, 268],
  intoTank: [262, 292], // "unless they reach the context"
  out: 306,
} as const;

// Scene 2: a bare request grows into a full prompt brief.
export const PROMPT_BEATS = {
  bar: [18, 60],
  grow: [96, 126], // "the direction you give"
  modules: [150, 172, 196, 226, 262], // "objective", "background", "constraints", "output", "checked"
  caption: 280,
  out: 306,
} as const;

// Scene 3: the same documents through a vague and a specific prompt.
export const SPECIFIC = {
  docs: 0,
  fork: [60, 90], // "same documents"
  vague: [110, 140], // "vague"
  specific: [150, 200], // "specific"
  results: [200, 250],
  review: 262, // "review"
  check: 300, // "doesn't make it correct"
  caption: 330,
  out: 366,
} as const;

// Scene 4: the app selects, orders and fits material, and leaves some out.
export const ENGINEERING = {
  pool: [0, 30],
  gate: [40, 80], // "decides what else goes in"
  appIn: 118, // "The app"
  select: 130, // "selects"
  selectStep: 14,
  order: 226, // "in order"
  fit: 240,
  fitStep: 8,
  fitTravel: 22,
  outdated: 286, // "outdated"
  conflicting: 310, // "conflicting"
  out: 330,
} as const;

// Scene 5: ahead of time, documents become tagged chunks in a search index.
export const PREPARE = {
  index: [0, 20],
  stack: [20, 60], // "large or changing collections"
  newDoc: 62,
  oldDoc: 72,
  badge: 106, // "Ahead of time"
  split: [140, 190], // "split into chunks"
  tags: [202, 244], // "tagged with their source"
  file: 260, // "search index"
  fileStep: 4,
  fileTravel: 14,
  out: 320,
} as const;

// Scene 6: per question, the index is searched and ranked, and the best chunks enter the context.
export const ASK = {
  move: [0, 30],
  bar: [30, 76], // "When you ask a question"
  scan: [106, 136], // "searches the index"
  lift: [142, 166], // "ranks what it finds"
  sort: [166, 190],
  cut: 196,
  intoTank: [226, 262], // "only the best chunks"
  notUsed: 262,
  sources: 322, // "with their sources"
  out: 330,
} as const;

// Scene 7: references make claims traceable, not automatically true.
export const CITATIONS = {
  handOff: [0, 20],
  answer: [10, 50],
  sources: [40, 60],
  threads: [58, 100], // "traceable"
  supported: [100, 130],
  reveal3: 142, // "A real source"
  unsupported: 178, // "fail to support"
  caption: 250, // "Check it."
  out: 282,
} as const;

// Scene 8: the app stores a memory; later it may be retrieved into the context, used or ignored.
export const MEMORY = {
  store: [0, 16],
  pill: [0, 30],
  propose: [30, 60],
  appIn: 70, // "stored by the app"
  check: [82, 96],
  file: [96, 118],
  notModel: 118, // "not the model"
  later: [130, 150], // "Later"
  bar: [146, 174],
  barDrop: [176, 188],
  retrieve: [180, 196],
  fly: [196, 226], // "retrieved into the context"
  response: [240, 276],
  used: 286, // "use it"
  ignored: [300, 330], // "or ignore it"
  caption: 326,
  finale: 340, // the scene fades out completely...
  fadeOut: 18,
  pathways: 362, // ...before the four pathways converge
  pathwayStep: 6,
  titleIn: 396,
} as const;
