import {CENTER} from '../../../shared/theme';
import {clamp, seeded} from '../../../shared/lib/math';

// Shared by Scene 3 (training) and Scene 4 (collapse) so the hand-off is seamless.

export const LAYERS = [4, 6, 6, 3] as const;
// Candidate next words after "The cat sprawled"; the model first guesses "car", then learns "on".
export const OUTPUT_LABELS = ['on', 'car', 'down'] as const;
export const TARGET_INDEX = 0;
export const WRONG_INDEX = 1;

const X0 = 560;
const DX = 800 / (LAYERS.length - 1); // layers span 560..1360, centred on 960
const NET_CY = CENTER.y + 30;
const DY = 118;

export type NetNode = {layer: number; index: number; x: number; y: number};
export type NetEdge = {from: NetNode; to: NetNode; w0: number; w1: number};

export const NODES: NetNode[] = LAYERS.flatMap((count, layer) =>
  Array.from({length: count}, (_, index) => ({
    layer,
    index,
    x: X0 + layer * DX,
    y: NET_CY + (index - (count - 1) / 2) * DY,
  })),
);

export const nodeAt = (layer: number, index: number) => NODES.find((n) => n.layer === layer && n.index === index) as NetNode;

const r = seeded('edge');

// w0 = weights before training, w1 = after the correction step.
export const EDGES: NetEdge[] = LAYERS.slice(0, -1).flatMap((count, layer) =>
  Array.from({length: count}, (_, a) =>
    Array.from({length: LAYERS[layer + 1]}, (_, b) => {
      const key = layer * 100 + a * 10 + b;
      const w0 = 0.15 + 0.85 * r('w0', key);
      const nudge = r('w1', key);
      const isOutputEdge = layer === LAYERS.length - 2;
      const w1 = isOutputEdge
        ? b === TARGET_INDEX
          ? 0.65 + 0.35 * nudge
          : 0.05 + 0.2 * nudge
        : clamp(w0 + (nudge - 0.5) * 0.8, 0.08, 1);
      return {from: nodeAt(layer, a), to: nodeAt(layer + 1, b), w0, w1};
    }),
  ).flat(),
);

export const strokeForWeight = (w: number) => 1 + 7 * w;

export const NODE_RADIUS = 18;
