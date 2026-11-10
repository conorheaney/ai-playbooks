// Single source of truth for every beat. Scenes and the SFX cue sheet both read from here.
import {buildTimeline, timelineLength} from '../../shared/lib/timeline';

// Scene lengths in frames, each sized to its recorded voiceover take (see BLUEPRINT.md).
const DURATIONS = {
  assemble: 336, // VO 10.37 s (recorded), plus the merge into the window
  window: 300, // VO 9.25 s (recorded)
  tokens: 360, // VO 10.92 s (recorded), plus a hold on the caption
  settings: 350, // VO 9.8 s (recorded), plus a 2 s hold on the stamp
  middle: 276, // VO 7.4 s (recorded), plus a hold on the caption
  compaction: 330, // VO 9.4 s (recorded), plus the glide home
  stopping: 280, // VO 7.7 s (recorded), plus a hold on the caption
  temporary: 342, // VO 8.2 s (recorded), plus the finale
} as const;

export type SceneKey = keyof typeof DURATIONS;
export const SCENES = buildTimeline(DURATIONS);
export const TOTAL_FRAMES = timelineLength(SCENES); // 2574 (85.8 s)

// Scene-local frames below.

// Scene 1: the app assembles the context around your message.
// Synced to the recorded VO: "When you send a prompt" 0–1.3 s, "just your message" ~3.0 s,
// "The app assembles a context" 4.0 s, "instructions" 5.8 s, "conversation history" 6.8 s,
// "documents" 8.0 s, "and tool definitions" 9.0–10.1 s.
export const ASSEMBLE = {
  titleToCorner: 24, // early, so the title is clear of the prompt bar rising at screen centre
  promptIn: 30,
  typeStart: 35,
  typeEnd: 75,
  barDown: [154, 178], // the centred prompt bar glides down as the system instructions card arrives
  cubeIn: 70,
  lineDraw: 78,
  strike: 92,
  strikeOut: 125,
  appIn: 120,
  cards: [168, 198, 234, 266], // each card starts ~8 frames before its word, so it lands on it
  textOut: 280, // card and prompt text fades out before anything moves (gone by merge)
  merge: 292, // slices move one at a time, bottom to top, mergeStagger apart
  mergeStagger: 4,
  mergeEnd: 326,
  segmentsIn: 320,
  labelsOut: 334,
} as const;

// Scene 2: the context fills the window, then reasoning and output use what's left.
// Synced to the recorded VO: "context window" ~2.6 s, "measured in tokens" 3.6–4.6 s,
// "The response, and any hidden reasoning" 5.2–7.5 s, "has to fit in what's left" 7.7–9.2 s.
export const WINDOW = {
  outlineEnd: 25,
  fillStart: 25,
  fillEnd: 90,
  tokensPulse: 122,
  inputBracket: 128,
  reasoning: 160,
  reasoningEnd: 200,
  outputEnd: 238,
  remaining: 248,
  drain: 282,
} as const;

// Scene 3: one token at a time. Steps 1–5 are quick; step 6 (" Can") is shown in full.
// Synced to the recorded VO: "one token at a time" ends 3.0 s, "It scores the likely next tokens" 3.4–5.3 s,
// "picks one" 5.5 s, "adds it" 6.3 s, "and repeats" 6.9–7.6 s, "Those scores are patterns" 8.2 s, "not facts" 10.0 s.
export const TOKENS = {
  layout: 25,
  fastStart: 25,
  fastStep: 14,
  focus: 103, // panel grows; candidates stagger in
  select: 166,
  fly: 189,
  flyEnd: 205,
  loopArrow: 196,
  quick: [210, 226], // "berra", "."
  end: 244,
  settle: 242, // "Those scores are patterns": the window clears and the panel slides down beside the cube
  caption: 274, // ...then the caption rises in
  sydneyPulses: [282, 300],
  out: 340,
} as const;

// Scene 4: same prompt, different answers. Synced to the recorded VO:
// "Ask the same question twice and you can get different answers" 0–3.4 s,
// "Apps can turn that variation up or down" 3.9–6.3 s, "but a fluent answer still isn't proof it's correct" 6.7–9.5 s.
export const SETTINGS = {
  // Three runs at each knob position: medium (varied but right), low (near identical), high (one fluent mistake).
  phases: [
    {knob: 0.5, type: [[20, 70], [28, 80], [36, 88]], marks: [74, 84, 92], clear: 118},
    {knob: 0.1, type: [[148, 182], [148, 182], [148, 182]], marks: [186, 186, 186], clear: 192},
    {knob: 0.9, type: [[215, 255], [221, 258], [227, 264]], marks: [258, 261, 268], clear: Infinity},
  ],
  knobMoves: [
    [120, 145],
    [192, 215],
  ],
  stamp: 272, // on "correct" (~9.1 s)
  out: 340, // content fades over the last 10 frames, after a 2 s hold on the stamp
} as const;

// Scene 5: a bigger window, a detail buried in the middle.
// Synced to the recorded VO: "A bigger window doesn't guarantee better use" 0–2.7 s,
// "Details buried in the middle of a long context" 3.2–6.1 s, "can be overlooked" 6.3–7.4 s.
export const MIDDLE = {
  stretch: [10, 60],
  rowsStart: 10,
  highlight: 92, // "Details"
  attention: [105, 150], // "buried in the middle"
  questionIn: 128, // the question shows and holds before it flies into the model
  question: [150, 172],
  answer: [176, 202],
  missed: 207, // "overlooked"
  caption: 215,
  reset: 262,
} as const;

// Scene 6: the conversation nears the limit and the app compacts it.
// Synced to the recorded VO: "When a long conversation nears the limit" 0.1–2.2 s,
// "the app may compact it into a summary" 2.4–4.3 s, "That frees space" 4.8–5.7 s,
// "but decisions, caveats and sources" 6.0–8.2 s, "can be lost" 8.3–9.2 s.
export const COMPACT = {
  bubblesStart: 14,
  bubbleGap: 4,
  bubbleTravel: 18, // last of 10 bubbles lands at 68; the warning trips at 90% full (~frame 64, "limit")
  slide: 72,
  appIn: 74, // "the app"
  appOut: 120, // the gear leaves before the summary card, so the card is the only new thing; the badge stays
  funnel: [78, 100],
  tankB: [82, 104],
  keepCopy: [100, 125], // instructions + tools copied across as they are
  squeeze: [94, 128], // old history squeezed through the funnel on "compact it into a summary"
  aDim: [114, 128], // tank A dims before the card pops, so the card is the only bright thing
  card: 128, // the summary card pops out, centred between the tanks, and holds until cardLand (~1.1 s)
  cardLand: [162, 178],
  recentCopy: [158, 176],
  freed: 178, // once the summary slice has landed, at the end of "That frees space"
  leaks: [182, 208, 230], // "decisions", "caveats", "sources"
  funnelOut: [272, 290], // the funnel is gone before tank B glides home
  home: 292,
} as const;

// Scene 7: one response ends naturally, the other hits the output limit.
// Synced to the recorded VO: "Generation stops at a natural end" 0–2.2 s, "or when it hits a limit" 2.9–4.1 s,
// "sometimes mid-sentence" 4.3–5.6 s, "The finish reason tells you which" 6.0–7.6 s.
export const STOPPING = {
  laneA: [8, 54],
  endChip: 58, // "natural end"
  laneB: [14, 114],
  wall: 110,
  wallHit: 114, // "limit"
  incomplete: [138, 158], // "mid-sentence"
  tagA: 190, // "finish reason"
  tagB: 205, // "tells you which"
} as const;

// Scene 8: the session ends, the weights are untouched, a new request starts almost empty.
// Synced to the recorded VO: "And when the session ends" 0.2–1.6 s, "the context is gone" 1.7–2.9 s,
// "Nothing was added to the weights" 3.5–4.9 s, "Each new request starts" 5.3–6.6 s,
// "with only what the app puts in" 6.8–8.1 s.
export const TEMPORARY = {
  frame: 0,
  close: 30, // "ends"
  fold: 36,
  drain: [50, 92], // "the context is gone"
  pushIn: 104, // "Nothing was added"
  pushOut: 152,
  newTank: 158, // "Each new request"
  appIn: 210,
  saved: [212, 234], // "only what the app puts in"
  finale: 250, // the scene fades out completely...
  fadeOut: 18,
  titleIn: 270, // ...before the closing title appears
  prompt: [288, 326],
} as const;
