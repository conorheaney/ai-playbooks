// Home positions and the running example's text, shared across scenes.
// The trip from how-ai-responds continues: the viewer is booking Canberra and asks about company travel policy.
// Amounts, section numbers and hotel names are illustrative.

// The model cube's and the context window's resting places, as in how-ai-responds.
export const CUBE_HOME = {x: 520, y: 540, size: 80};
export const TANK_HOME = {x: 1300, y: 560, w: 320, h: 760};

// Illustrative only; the readout always says EXAMPLE CAPACITY.
export const CAPACITY = 200_000;

export const QUESTION = "What's our hotel allowance in Canberra?";

// The policy sections the answer cites in Scenes 6 and 7.
export const POLICY = {
  s31: {ref: '§3.1', text: 'All bookings go through the travel portal.'},
  s42: {ref: '§4.2', text: 'Accommodation: up to $250 a night in capital cities.'},
  s43: {ref: '§4.3', text: 'Taxis: keep receipts over $30.'},
} as const;

// The search index: 6 × 4 slots. Scene 5 files the twelve new chunks into the empty slots;
// Scene 6 searches the whole index. Every slot carries its source reference.
export const INDEX = {x: 1340, y: 560, w: 520, h: 480, cols: 6, rows: 4} as const;
export const INDEX_ASK = {x: 620, y: 520, scale: 0.8} as const;

// The three documents Scene 5 splits, four chunks each, in order.
export const NEW_DOCS = [
  {name: 'travel-policy-2025.pdf', source: 'travel-policy · 2025', refs: ['§3.1', '§3.2', '§4.2', '§4.3']},
  {name: 'expenses-faq.md', source: 'expenses-faq · 2025', refs: ['Q1', 'Q2', 'Q3', 'Q4']},
  {name: 'receipts-guide.pdf', source: 'receipts-guide · 2024', refs: ['p.1', 'p.2', 'p.3', 'p.4']},
] as const;

// Slots already holding older chunks; the rest receive the new ones, in slot order.
const PREFILLED = new Set([0, 2, 3, 7, 8, 10, 13, 15, 16, 19, 21, 23]);
const OLD_REFS = ['§1.1', '§1.4', '§2.1', 'Q7', 'p.9', '§2.3', 'Q5', '§5.1', 'p.6', '§1.2', 'Q9', '§6.2'];

export type IndexSlot = {ref: string; prefilled: boolean; chunk: number}; // chunk: 0..11 for new chunks, -1 otherwise

export const INDEX_SLOTS: IndexSlot[] = (() => {
  const newRefs = NEW_DOCS.flatMap((d) => d.refs);
  let n = 0;
  let o = 0;
  return Array.from({length: INDEX.cols * INDEX.rows}, (_, i) =>
    PREFILLED.has(i) ? {ref: OLD_REFS[o++], prefilled: true, chunk: -1} : {ref: newRefs[n], prefilled: false, chunk: n++},
  );
})();

// Scene 6's candidates: the slots the search lights up, and their relevance scores.
export const CANDIDATES: {ref: string; score: number}[] = [
  {ref: '§4.2', score: 0.92},
  {ref: '§3.1', score: 0.86},
  {ref: '§4.3', score: 0.61},
  {ref: 'Q2', score: 0.47},
  {ref: '§2.1', score: 0.41},
  {ref: 'p.2', score: 0.36},
  {ref: 'Q5', score: 0.29},
  {ref: '§3.2', score: 0.24},
];
export const TOP_N = 2;

// Where Scene 6 leaves the window, so Scene 7 can pick it up.
// A little lower and shorter than home, so its readout clears the status badge.
export const ASK_TANK = {x: 1480, y: 600, w: 320, h: 700};
export const ASK_SEGMENTS = {
  instructions: [0, 0.06],
  retrieved: [
    [0.06, 0.15],
    [0.15, 0.24],
  ],
  message: [0.24, 0.28],
} as const;
