// Single source of truth for every beat. Scenes and the SFX cue sheet both read from here.

// Scene lengths in frames, each sized to its recorded voiceover (Scenes 1–3 also allow for the fade-out).
const DURATIONS = {
  rawData: 230, // VO 7.1 s
  tokenize: 285, // VO 8.7 s
  weights: 310, // VO 9.66 s
  fineTune: 420, // VO 11.0 s
  feedback: 240, // VO 5.5 s
  reinforce: 390, // VO 11.2 s
  safety: 240, // VO 6.4 s
  evals: 298, // VO 7.1 s
  lockIn: 280, // VO 8.4 s
  release: 400, // VO 9.5 s
} as const;

export type SceneKey = keyof typeof DURATIONS;
type Slot = {from: number; durationInFrames: number};

// Each scene starts where the previous one ends.
export const SCENES = (Object.keys(DURATIONS) as SceneKey[]).reduce(
  (acc, key, i, keys) => {
    const prev = i === 0 ? undefined : acc[keys[i - 1]];
    acc[key] = {from: prev ? prev.from + prev.durationInFrames : 0, durationInFrames: DURATIONS[key]};
    return acc;
  },
  {} as Record<SceneKey, Slot>,
);

export const TOTAL_FRAMES = SCENES.release.from + SCENES.release.durationInFrames; // 3093 (103.1 s)

// Scene-local frames below.

export const RAW = {
  titleToCorner: 40,
  counterIn: 10,
  counterStart: 15,
  counterEnd: 200, // lands on 1.00 TB as the voiceover says "learn"
} as const;

// Synced to the Scene 2 VO: "broken into pieces" ~1.5 s, "tokens" ~2.6 s, "then mapped" 3.9 s, "where similar meanings" 6.7 s.
export const TOKEN = {
  cuts: [45, 58],
  split: 72,
  morph: 118,
  kittenIn: 201,
  carIn: 211,
  carFly: 225,
} as const;

// Synced to the Scene 3 VO: "It guesses" 3.3 s, "gets it wrong" 4.6 s, "and adjusts…" 5.6 s, ends 9.66 s.
export const WEIGHTS = {
  forward1: 60,
  hop1: 20, // forward pass 1 reaches the output at 60 + 3 * 20 = 120
  error: 138,
  backprop: 170,
  hopBack: 17, // backward pass reaches the input at 170 + 3 * 17 = 221
  forward2: 228,
  hop2: 15, // forward pass 2 reaches the output at 228 + 3 * 15 = 273
  lock: 273,
  labelsOut: 293,
} as const;

// Scene 4: base model rambles, people write example conversations, the model learns to answer.
export const FINETUNE = {
  collapseEnd: 36,
  cubeIn: 30,
  question1: 50,
  questionIn: 72,
  ramble: 90,
  rambleEnd: 150,
  rambleReject: 156,
  partOut: 185,
  partB: 195,
  examples: [222, 240, 258, 276, 292, 306, 318], // each card takes EXAMPLE_TRAVEL frames to reach the model
  examplesEnd: 350,
  humansOut: 338,
  question2: 352,
  question2In: 366,
  emblem: 366,
  answer: 378,
  answerEnd: 400,
  answerOk: 403,
} as const;
export const EXAMPLE_TRAVEL = 32;

// Scene 5: RLHF. A person compares two answers; a reward model learns their preferences.
export const FEEDBACK = {
  question: 10,
  cards: 25,
  rater: 45,
  pick: 75,
  toReward: 100,
  rewardIn: 122,
  streamStart: 128,
  streamEnd: 170,
  signal: 175,
  signalEnd: 198,
  contentOut: 222,
} as const;

// Scene 6: reinforcement learning on checkable problems. Each cycle: attempt -> automatic check -> reward.
export const REINFORCE = {
  arcs: 20,
  cycles: [
    {start: 60, travel: 26},
    {start: 125, travel: 26},
    ...[190, 208, 226, 244, 262, 280, 298, 316].map((start) => ({start, travel: 12})),
  ],
  contentOut: 372,
} as const;

// Scene 7: red team attacks bounce off; an everyday request gets through and is answered.
export const SAFETY = {
  shield: 20,
  team: 30,
  attacks: [45, 80, 115],
  attackTravel: 24,
  user: 140,
  userTravel: 36,
  answer: 192,
  answerOk: 210,
  contentOut: 226,
} as const;

// Scene 8: benchmarks; one fails, the model goes back for training, then everything passes and people sign off.
export const EVALS = {
  panel: 20,
  run1: 45,
  fail: 115,
  loopBack: 170,
  loopArrive: 196,
  run2: 220,
  pass: 258,
  approve: 264,
  contentOut: 280,
} as const;

// Scene 9: weights spin down and freeze, the lock snaps on, chats bounce off.
export const LOCK = {
  slowStart: 12,
  freeze: 58,
  lock: 92,
  tag: 205,
  chat: 132,
  chatHit: 157,
  caption: 164,
  contentOut: 262,
} as const;

// Scene 10: served from data centres to the world, monitored by people, then the finale.
export const RELEASE = {
  racks: 10,
  intoRacks: 20,
  powerOn: 55,
  globe: 60,
  arcs: 80,
  channels: [95, 105, 115],
  usersStart: 110,
  usersEnd: 260,
  bubbles: [150, 175, 200, 225],
  monitor: 150,
  feedbackStart: 200,
  nextModel: 262,
  finale: 310,
  titleIn: 322,
  promptIn: 330,
  typeStart: 345,
  typeEnd: 385,
} as const;
