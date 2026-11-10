// Single source of truth for every beat. Scenes and the SFX cue sheet both read from here.
import {buildTimeline, timelineLength} from '../../shared/lib/timeline';

// Scene lengths in frames, planned from the script at about 2.7 words per second (11 frames a word) plus about a
// second of hold. Once the voiceover is recorded, size each scene to its take and move its beats onto the words
// (see BLUEPRINT.md). Comments give the word each beat is planned against.
const DURATIONS = {
  words: 336, // VO 25 words
  tools: 312, // VO 25 words
  context: 300, // VO 24 words
  loop: 324, // VO 26 words
  workflow: 312, // VO 25 words
  harness: 348, // VO 28 words
  boundaries: 336, // VO 24 words, plus the order payoff
  delegation: 312, // VO 25 words
  failure: 495, // VO 24 words, the silent finale and a 3 s fade to black
} as const;

export type SceneKey = keyof typeof DURATIONS;
export const SCENES = buildTimeline(DURATIONS);
export const TOTAL_FRAMES = timelineLength(SCENES); // 3075 (1:42.5)

// Scene 1: a model alone only writes text; describing isn't doing.
export const WORDS = {
  titleToCorner: 14,
  cubeIn: 20,
  bar: [24, 50],
  write: [52, 140], // "writes text" ... "describe"
  portal: 137, // "order" (in "placing an order")
  dissolve: [159, 190], // "can't place one"
  clear: [200, 222], // "An agentic system"
  caption: 236, // DESCRIBING ISN'T DOING holds from 184 to 250 (2.2 s)
  loop: [222, 255],
  act: 255, // "act"
  steps: [266, 277, 288], // "step by step"
  out: 310,
} as const;

// Scene 2: the model writes a request; the app checks it and runs the tool.
export const TOOLS = {
  move: [0, 30],
  wall: [8, 40],
  app: 19, // "app"
  docks: [30, 60], // "lists the tools"
  list: [36, 66],
  print: [93, 126], // "replies with a request"
  name: 150, // "tool name"
  inputs: 181, // "inputs"
  inputStep: 6,
  toGate: [200, 220],
  checks: 222, // "checks it"
  checkStep: 8,
  run: [255, 275], // "runs the tool"
  reach: [277, 295], // "itself"
  out: 296,
} as const;

// Scene 3: the result goes into the context and the model is called again, from a rebuilt context.
export const CONTEXT = {
  receipt: [0, 24], // "The result": a glyph back through the gate (0-18), then the full receipt prints (14-26)
  relayout: [20, 50],
  strip: [34, 60], // starts once Scene 2's wall and gate have faded (20-34)
  call2: [63, 90], // "into the context"
  again: [96, 129], // "the model is called again"
  away: [129, 142],
  back: [142, 158],
  call3: [162, 190], // "whole context rebuilt"
  exits: 195,
  answer: 217, // "answers"
  another: 239, // "requests another tool"
  ghost: [245, 265],
  out: 282,
} as const;

// Scene 4: the agent loop.
export const LOOP = {
  titleIn: 0,
  move: [0, 24],
  ring: [8, 60], // "An agent is a decision loop"
  card: [30, 50],
  recap: [48, 80], // two fast laps replay Scenes 2 and 3
  check: [82, 137], // "check the goal and current state"
  strike: 137, // "state"
  pick: [148, 181], // "pick a next step"
  run: [181, 192],
  see: [192, 214], // "see the result"
  repeat: 225, // "repeat"
  done: [244, 266], // "until it's done"
  help: [280, 299], // "needs help"
  out: 300,
} as const;

// Scene 5: workflow vs agent.
export const FLOW = {
  blueprint: [19, 60], // "A workflow follows steps designed in advance"
  ink: [52, 74],
  shuttle: [74, 96],
  agentIn: [93, 110], // "An agent"
  pick: [104, 126, 159], // each node lights after the last result
  results: [116, 148, 181], // "finds"
  merge: [200, 230], // "Many systems"
  bounded: [244, 270], // "bounded agent"
  run: [266, 304], // "inside a workflow"
} as const;

// Scene 6: the harness.
export const HARNESS = {
  emblem: [0, 40], // "Both run"
  gear: 44, // "harness"
  bloom: [60, 100], // "the software around the model"
  rename: [82, 100],
  modules: [145, 178, 200, 266], // "builds each request", "keeps state", "runs tools", "enforces limits"
  key: 244, // "its own access"
  tape: [299, 321], // "records what happened"
  footnote: 280, // the caveat pill, after the last module; it holds into Scene 7 (2.9 s)
  out: 330,
} as const;

// Scene 7: boundaries, and an instruction vs an enforced gate.
export const BOUNDS = {
  enter: [0, 20],
  fence: [30, 50], // "boundaries"
  signs: [60, 93, 126, 170], // "tools", "steps", "confirm", "done"
  ticket: [202, 216], // the signs hold until 186, then phase 2 takes the screen
  paint: [204, 216], // "Instructions alone"
  cross: [218, 238], // "won't hold them"
  rewind: [238, 252],
  gate: [254, 270], // "The harness enforces them"
  confirm: [275, 290],
  approve: 290,
  pass: [292, 302],
  ordered: 300, // ORDERED ✓ holds for about a second before the scene fades
  out: 324,
} as const;

// Scene 8: delegation to subagents.
export const DELEGATE = {
  task: [0, 20],
  split: [52, 80], // "hand subtasks"
  subagents: 85, // "subagents"
  contexts: [129, 150], // "its own context"
  isolate: 181, // "isolate"
  parallel: [203, 240], // "speed up"
  results: [225, 250],
  cost: [258, 290], // "cost"
  coordinate: [280, 300], // "coordination"
  out: 300,
} as const;

// Scene 9: when tools fail, then the finale.
export const FAILURE = {
  calls: 16, // "Tool calls": five plain tool calls appear, 3 frames apart
  rows:[60, 82, 104, 126, 148], // "wrong tool", "wrong input", "changed state", "duplicate actions", "misread results"
  focus: [178, 200], // "A good agent"
  report: [211, 240], // "reports what happened"
  hide: 252, // "instead of hiding it"
  finale: 300,
  fadeOut: 18,
  diagram: 322,
  titleIn: 360,
  outro: 405, // the whole frame fades to black over the last 3 s
} as const;
