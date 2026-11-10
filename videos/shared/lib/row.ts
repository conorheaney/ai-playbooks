import {VIDEO} from '../theme';

// One area in a horizontal row: its width, how present it is (0 takes no room, 1 full room), and
// optionally where its reference x sits, measured from its left edge (default: its centre). Use the
// anchor for areas that extend further on one side, such as a context window with labels to its right.
export type RowArea = {w: number; p: number; anchor?: number};

// Lays areas out left to right with a uniform gap, the whole row centred on cx, and returns each
// area's reference x. Presence eases areas in and out: an area growing from 0 to 1 pushes its
// neighbours apart smoothly instead of popping, and one shrinking to 0 lets them close up. An area keeps
// its own reference point relative to its left edge while it grows or shrinks, so one that is leaving
// never slides back over its left-hand neighbour.
export const centredRow = (areas: RowArea[], gap: number, cx = VIDEO.width / 2): number[] => {
  const ps = areas.map((a) => Math.min(1, Math.max(0, a.p)));
  let cursor = 0;
  let seen = 0; // presence of the areas already placed, so the first area that shows has no gap before it
  const lefts = areas.map((a, i) => {
    if (i > 0) {
      cursor += gap * Math.min(ps[i], seen);
    }
    const left = cursor;
    cursor += a.w * ps[i];
    seen = Math.max(seen, ps[i]);
    return left;
  });
  const start = cx - cursor / 2;
  return areas.map((a, i) => start + lefts[i] + (a.anchor ?? a.w / 2));
};
