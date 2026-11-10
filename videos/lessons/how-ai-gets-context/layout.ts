import {centredRow} from '../../shared/lib/row';

// Home positions and the running example's text, shared across scenes.
// The running example: the viewer works at a medical device company, ordering a flow sensor under the
// company's supplier policy. Limits, section numbers and supplier names are illustrative.

// The model cube's and the context window's resting places, as in how-ai-responds.
export const CUBE_HOME = {x: 520, y: 540, size: 80};

// Scenes 1-4 lay their areas out in a row centred on screen, with this gap between neighbouring areas
// (see shared/lib/row.ts). The cube's area includes its "v1.0 · LOCKED" tag.
export const ROW_GAP = 110;
export const CUBE_W = 300;
export const PROMPT_CARD_W = 760; // Scene 2's prompt card
export const TANK_HOME = {x: 1300, y: 560, w: 320, h: 760};

// Illustrative only; the readout always says EXAMPLE CAPACITY.
export const CAPACITY = 200_000;

export const QUESTION = "What's our lead-time limit for suppliers?";

// The policy sections the answer cites in Scenes 6 and 7.
export const POLICY = {
  s31: {ref: '§3.1', text: 'All orders go through the purchasing portal.'},
  s42: {ref: '§4.2', text: 'Lead time: up to 30 days for critical parts.'},
  s43: {ref: '§4.3', text: 'Inspect 1 in 50 parts on arrival.'},
} as const;

// The search index: 6 × 4 slots. Scene 5 files the twelve new chunks into the empty slots;
// Scene 6 searches the whole index. Every slot carries its source reference.
export const INDEX = {x: 1340, y: 560, w: 520, h: 480, cols: 6, rows: 4} as const;

// The three documents Scene 5 splits, four chunks each, in order.
export const NEW_DOCS = [
  {name: 'supplier-policy-2025.pdf', source: 'supplier-policy · 2025', refs: ['§3.1', '§3.2', '§4.2', '§4.3']},
  {name: 'quality-faq.md', source: 'quality-faq · 2025', refs: ['Q1', 'Q2', 'Q3', 'Q4']},
  {name: 'inspection-guide.pdf', source: 'inspection-guide · 2024', refs: ['p.1', 'p.2', 'p.3', 'p.4']},
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

// Scene 6: the question sits in a search bar centred at the top. Below it the index, the ranked list and the
// window form a centred row (see shared/lib/row.ts); the ranked list joins the row as the candidates lift out.
export const ASK_BAR = {x: 960, y: 160, w: 860};
export const ASK_INDEX_SCALE = 0.8;
export const ASK_ROW = {
  y: 620, // the index's and the ranked list's vertical centre
  index: {w: 520 * ASK_INDEX_SCALE},
  ranked: {w: 300 + 90, anchor: 150}, // the TOP 2 label hangs off its right side
  tank: {w: 320 + 290, anchor: 160}, // the window's slice labels sit to its right
};
// Where Scene 6 leaves the window, so Scene 7 can pick it up: the row's final place, low enough that its
// readout clears the search bar.
export const ASK_TANK = {
  x: centredRow([{...ASK_ROW.index, p: 1}, {...ASK_ROW.ranked, p: 1}, {...ASK_ROW.tank, p: 1}], ROW_GAP)[2],
  y: 650,
  w: 320,
  h: 620,
};
export const ASK_SEGMENTS = {
  instructions: [0, 0.06],
  retrieved: [
    [0.06, 0.15],
    [0.15, 0.24],
  ],
  message: [0.24, 0.28],
} as const;
