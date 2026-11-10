// Single source of truth for every beat. Scenes and the SFX cue sheet both read from here.
import {buildTimeline, timelineLength} from '../../shared/lib/timeline';

// Scene lengths in frames. These are planned from the script at about 2.5 words per second; once the
// voiceover is recorded, size each scene to its take and move its beats onto the words (see BLUEPRINT.md).
const DURATIONS = {
  weights: 282, // VO 8.4 s (recorded), plus a hold on the caption
  prompt: 310, // VO 8.3 s (recorded), plus a hold on the caption
  specific: 354, // VO 9.6 s (recorded), plus a hold on the caption
  engineering: 334, // VO 9.7 s (recorded), plus a hold on the LEFT OUT cards and the fade
  prepare: 300, // VO 8.6 s (recorded), plus the last chunks filing
  ask: 280, // VO 8.6 s (recorded), plus a short hold
  citations: 314, // VO 9.1 s (recorded), plus a hold on the caption
  memory: 486, // VO 9.3 s, plus the finale and a 3 s fade to black
} as const;

export type SceneKey = keyof typeof DURATIONS;
export const SCENES = buildTimeline(DURATIONS);
export const TOTAL_FRAMES = timelineLength(SCENES); // 2660 (88.7 s)

// Scene-local frames below. Comments give the word each beat is planned against.

// Scene 1: the locked model can't know private or new information unless it reaches the context.
// Timed to the recorded take (01-weights.wav).
export const WEIGHTS = {
  titleToCorner: 14, // the title rises as the cube appears
  cubeIn: 26, // at dead centre (held there by the centring track until frame 72)
  frozen: [34, 66], // "fixed after training" (1.16 s)
  cards: [107, 138, 168], // "files" (3.55 s), "rules" (4.6 s), "news" (5.6 s)
  flight: 16, // frames from off-screen to the padlock
  frozenOut: 184,
  tank: [184, 212], // "unless" (6.52 s)
  intoTank: [208, 238], // "reach the context" (7.0-8.1 s)
  out: 264,
} as const;

// Scene 2: a bare request grows into a full prompt brief.
// Timed to the recorded take (02-prompt.wav).
export const PROMPT_BEATS = {
  bar: [10, 50], // "the first pathway is the prompt"
  grow: [58, 88], // "the direction you give" (1.95-2.88 s)
  modules: [102, 126, 146, 172, 230], // "objective" (3.4 s), "background" (4.2 s), "constraints" (4.9 s), "output" (5.8 s), "checked" (7.8 s)
  caption: 248, // after the take ends (8.1 s)
  out: 292,
} as const;

// Scene 3: the same documents through a vague and a specific prompt.
// Timed to the recorded take (03-specific.wav).
export const SPECIFIC = {
  docs: 0,
  fork: [14, 42], // "same documents" (0.4-1.3 s)
  vague: [48, 70], // "vague" (1.6 s)
  specific: [76, 116], // "specific" (2.6 s)
  results: [120, 165], // "The specific prompt gets an answer"
  review: 172, // "review" (5.8 s)
  check: 255, // "doesn't make it correct" (8.5 s)
  caption: 290, // after the take ends (9.6 s)
  out: 336,
} as const;

// Scene 4: the app selects, orders and fits material, and leaves some out.
// Timed to the recorded take (04-engineering.wav).
export const ENGINEERING = {
  pool: [0, 30],
  gate: [36, 70], // "decides what else goes in" (1.3-2.9 s)
  appIn: 100, // "The app" (3.35 s)
  select: 112, // "selects instructions, history and sources" (3.8-6.1 s)
  selectStep: 16,
  order: 200, // "in order" (6.7 s)
  fit: 212,
  fitStep: 8,
  fitTravel: 22,
  outdated: 248, // "outdated" (8.3 s)
  conflicting: 268, // "conflicting" (8.9 s)
  out: 316, // a beat to read both LEFT OUT cards
} as const;

// Scene 5: ahead of time, documents become tagged chunks in a search index.
// Timed to the recorded take (05-prepare.wav).
export const PREPARE = {
  index: [0, 20],
  stack: [8, 44], // "large or changing collections" (0.5-1.9 s)
  newDoc: 46,
  oldDoc: 56,
  badge: 100, // "Ahead of time" (3.33 s)
  split: [126, 166], // "documents are split into chunks" (4.2-5.75 s); slices land on "split into chunks"
  tags: [178, 216], // "tagged with their source" (5.95-6.96 s)
  file: 222, // "added to a search index" (7.1-8.6 s)
  fileStep: 4,
  fileTravel: 14,
  out: 284, // the last chunk lands at 280
} as const;

// Scene 6: per question, the index is searched and ranked, and the best chunks enter the context.
// Timed to the recorded take (06-ask.wav).
export const ASK = {
  move: [0, 30],
  bar: [4, 40], // "When you ask a question" (0.15-1.28 s)
  scan: [60, 92], // "searches the index" (2.0-3.0 s)
  lift: [96, 118], // "ranks what it finds" (3.2-4.2 s)
  sort: [118, 140],
  cut: 150, // "only" (5.07 s)
  intoTank: [170, 206], // "the best chunks to the context" (5.74-7.25 s)
  notUsed: 168, // the rest dim before the top two fly, so they never cross a bright list
  sources: 232, // "with their sources" (7.7 s)
  out: 262,
} as const;

// Scene 7: references make claims traceable, not automatically true.
// Timed to the recorded take (07-citations.wav).
export const CITATIONS = {
  handOff: [0, 20],
  answer: [6, 36], // "References make claims"
  sources: [28, 44],
  threads: [42, 66], // "traceable" (1.5-2.1 s)
  supported: [72, 100], // "but not automatically true" (2.7-4.4 s)
  reveal3: 150, // "A real source" (5.0 s)
  unsupported: 196, // "fail to support" (6.5 s)
  caption: 262, // "Check it." (8.74 s)
  out: 296,
} as const;

// Scene 8: the app stores a memory; later it may be retrieved into the context, used or ignored.
export const MEMORY = {
  store: [0, 16],
  pill: [0, 14],
  propose: [8, 30],
  appIn: 30, // "stored by the app"
  check: [38, 50],
  file: [50, 64],
  notModel: 60, // "not the model"
  later: [100, 120], // "Later"
  bar: [116, 138],
  barDrop: [140, 150],
  retrieve: [144, 158],
  fly: [158, 186], // "retrieved into the context"
  response: [188, 218],
  used: 220, // "use it"
  ignored: [242, 268], // "or ignore it"
  caption: 262,
  finale: 300, // the scene fades out completely...
  fadeOut: 18,
  pathways: 322, // ...before the four pathways converge
  pathwayStep: 6,
  titleIn: 356,
  outro: 366, // the whole frame eases to black over the last 4 s (slow at first, so the title still reads)
} as const;
