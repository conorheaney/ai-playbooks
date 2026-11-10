import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {ContextTank, Segment, SEGMENT_STYLE, segmentRect} from '../../../shared/components/context/ContextTank';
import {PromptBar, StatusBadge} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, flashAt, presence} from '../../../shared/lib/motion';
import {centredRow} from '../../../shared/lib/row';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {FlowLine, RefChip} from '../components/Parts';
import {SearchIndex, slotRect, SlotState} from '../components/SearchIndex';
import {ASK_BAR, ASK_INDEX_SCALE, ASK_ROW, ASK_SEGMENTS, ASK_TANK, CANDIDATES, CAPACITY, INDEX, INDEX_SLOTS, QUESTION, ROW_GAP, TOP_N} from '../layout';
import {ASK as A, SCENES} from '../timing';

const RANK = {step: 58, w: 300, h: 46};
const RANK_TOP = ASK_ROW.y - ((CANDIDATES.length - 1) / 2) * RANK.step;
const BAR_H = 96;
const SCORE_W = 110;

// Candidate slots, in the order the scan finds them (left to right), with their sorted rank.
const FOUND = CANDIDATES.map((c, rank) => ({...c, rank, slot: INDEX_SLOTS.findIndex((s) => s.ref === c.ref)})).sort(
  (a, b) => (a.slot % INDEX.cols) - (b.slot % INDEX.cols) || a.slot - b.slot,
);
const rowY = (i: number) => RANK_TOP + i * RANK.step;
// On "only", the rows below the top two slide down to open a gap, and the cut line draws in it.
const CUT_GAP = 32;
const GREY = '#8C8C8C'; // not-used rows are greyed out

export const AskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = SCENES.ask.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const out = interpolate(frame, [A.out, dur], [1, 0], clampOpts);
  const mv = interpolate(frame, [A.move[0], A.move[1]], [0, 1], ease);
  // The window draws once the index has mostly slid aside, so the two never overlap.
  const tankDraw = interpolate(frame, [A.move[0] + 14, A.move[1] + 14], [0, 1], ease);
  // The row: the index, the ranked list (which opens as the candidates lift out) and the window.
  const rankedIn = interpolate(frame, [A.scan[1] - 8, A.lift[0] + 6], [0, 1], ease);
  const [indexX, rankX, tankX] = centredRow(
    [
      {...ASK_ROW.index, p: 1},
      {...ASK_ROW.ranked, p: rankedIn},
      {...ASK_ROW.tank, p: tankDraw},
    ],
    ROW_GAP,
  );
  const TANK = {...ASK_TANK, x: tankX};
  const geom = {x: lerp(INDEX.x, indexX, mv), y: lerp(INDEX.y, ASK_ROW.y, mv), scale: lerp(1, ASK_INDEX_SCALE, mv)};
  // Once typed, a copy of the question drops into the window as its own slice.
  const asked = interpolate(frame, [A.bar[1] + 4, A.bar[1] + 20], [0, 1], ease);
  const scan = interpolate(frame, [A.scan[0], A.scan[1]], [0, 1], clampOpts);
  const sort = interpolate(frame, [A.sort[0], A.sort[1]], [0, 1], ease);
  const notUsed = interpolate(frame, [A.notUsed, A.notUsed + 14], [0, 1], ease);
  const split = interpolate(frame, [A.cut, A.cut + 12], [0, 1], ease);
  const cutY = rowY(TOP_N) - RANK.step / 2 + CUT_GAP / 2;

  const lift = (i: number) => interpolate(frame, [A.lift[0] + i * 2, A.lift[0] + i * 2 + 14], [0, 1], ease);
  const into = (rank: number) => interpolate(frame, [A.intoTank[0] + rank * 10, A.intoTank[0] + rank * 10 + 22], [0, 1], ease);
  const arrived = (rank: number) => (into(rank) >= 1 ? 1 : 0);

  const slotCol = (slot: number) => ((slot % INDEX.cols) + 0.5) / INDEX.cols;
  const slots: SlotState[] = INDEX_SLOTS.map((s, i) => {
    const found = FOUND.find((c) => c.slot === i);
    const hl = found && scan >= slotCol(i) ? interpolate(frame, [A.lift[0], A.lift[0] + 12], [1, 0.4], clampOpts) : 0;
    return {fill: 1, fresh: !s.prefilled, highlight: hl};
  });

  // The question moves up the window as the retrieved chunks slot in below it.
  const msgShift = (into(0) * 0.5 + into(1) * 0.5) * (ASK_SEGMENTS.message[0] - ASK_SEGMENTS.retrieved[0][0]);
  const segments: Segment[] = [
    {kind: 'instructions', from: ASK_SEGMENTS.instructions[0], to: ASK_SEGMENTS.instructions[1], label: 'INSTRUCTIONS', labelOpacity: 1},
    ...ASK_SEGMENTS.retrieved.map(([from, to], rank) => ({
      kind: 'retrieved' as const,
      from,
      to,
      opacity: arrived(rank),
      label: `RETRIEVED · ${CANDIDATES[rank].ref}`,
      labelOpacity: smooth(A.intoTank[0] + rank * 10 + 22, 10),
      outline: COLORS.cyan,
      outlineOpacity: flashAt(frame, A.sources + rank * 4, 24),
    })),
    {
      kind: 'message',
      from: ASK_SEGMENTS.retrieved[0][0] + msgShift,
      to: ASK_SEGMENTS.retrieved[0][0] + msgShift + (ASK_SEGMENTS.message[1] - ASK_SEGMENTS.message[0]),
      opacity: asked >= 1 ? 1 : 0,
      label: 'YOUR QUESTION',
      labelOpacity: smooth(A.bar[1] + 20, 10),
    },
  ];
  const tokens = (0.1 + 0.18 * (interpolate(into(0), [0.7, 1], [0, 0.5], clampOpts) + interpolate(into(1), [0.7, 1], [0, 0.5], clampOpts))) * CAPACITY;

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* The question goes to the search index. */}
        <g opacity={out}>
          <FlowLine from={{x: ASK_BAR.x - ASK_BAR.w / 2 + 120, y: ASK_BAR.y + BAR_H / 2 + 8}} to={{x: indexX, y: ASK_ROW.y - 250}} frame={frame} opacity={presence(frame, A.scan[0] - 8, A.lift[0] + 10, 8, 12)} bend={-30} />
        </g>
        <g opacity={out}>
          <SearchIndex geom={geom} slots={slots} scan={scan} />
        </g>

        <ContextTank id="gc-a-tank" {...TANK} draw={tankDraw} opacity={tankDraw > 0 ? 1 : 0} segments={segments} labels={tankDraw} readout={{tokens, capacity: CAPACITY, opacity: tankDraw}} />

        <g opacity={out}>
          {/* Candidates lift out of the index, rank themselves, and the best two enter the window. */}
          {/* Rows that climb the ranking are drawn last, so they pass over the rows they overtake. */}
          {FOUND.map((c, i) => ({c, i}))
            .sort((a, b) => Number(a.c.rank < a.i) - Number(b.c.rank < b.i))
            .map(({c, i}) => {
            const l = lift(i);
            if (l <= 0) {
              return null;
            }
            const top = c.rank < TOP_N;
            const t = top ? into(c.rank) : 0;
            if (t >= 1) {
              return null;
            }
            const from = slotRect(geom, c.slot);
            const rankY = lerp(rowY(i), rowY(c.rank), sort) + (top ? 0 : CUT_GAP * split);
            // While sorting, climbing rows swing right and sinking rows swing left (and dim), so rows passing
            // each other sit side by side rather than stacked text on text.
            const swing = Math.sin(Math.PI * sort) * Math.sign(i - c.rank);
            const rowX = rankX + 80 * swing;
            let x = lerp(from.cx, rowX, l);
            let y = lerp(from.cy, rankY, l);
            let w = lerp(from.w, RANK.w, l);
            let h = lerp(from.h, RANK.h, l);
            let fill = rgba(COLORS.charcoal, 0.95);
            if (t > 0) {
              // Out to the right along its own row first (the top two sit above the cut, so this never crosses the
              // rest of the list or the cut line), then down inside the window into its slice.
              const r = segmentRect(TANK, ASK_SEGMENTS.retrieved[c.rank][0], ASK_SEGMENTS.retrieved[c.rank][1]);
              const across = interpolate(t, [0, 0.5], [0, 1], ease);
              const down = interpolate(t, [0.45, 1], [0, 1], ease);
              x = lerp(x, r.x + r.w / 2, across);
              y = lerp(y, r.y + r.h / 2, down);
              w = lerp(w, r.w, across);
              h = lerp(h, r.h, down);
              fill = SEGMENT_STYLE.retrieved.fill;
            }
            const content = l * (1 - interpolate(t, [0, 0.4], [0, 1], clampOpts));
            const grey = top ? 0 : notUsed;
            const dim = (top ? 1 : lerp(1, 0.7, notUsed)) * (1 - 0.5 * Math.max(0, -swing));
            // On the cut, the top two are ringed and held in place before they fly.
            const ring = top ? presence(frame, A.cut, A.intoTank[0] + 4, 6, 6) : 0;
            return (
              <g key={c.ref} opacity={dim}>
                {ring > 0.001 ? (
                  <rect x={x - w / 2 - 6} y={y - h / 2 - 6} width={w + 12} height={h + 12} rx={16} fill="none" stroke={COLORS.cyan} strokeWidth={3} opacity={ring} style={{filter: `drop-shadow(0 0 8px ${rgba(COLORS.cyan, 0.6)})`}} />
                ) : null}
                <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={lerp(8, 12, l)} fill={fill} stroke={top && frame >= A.cut ? COLORS.cyan : grey > 0 ? rgba(GREY, 0.6 - 0.2 * grey) : rgba(COLORS.cyan, 0.6)} strokeWidth={2} />
                <g opacity={content}>
                  {/* The cyan chip cross-fades to a grey one as the row is greyed out. */}
                  <RefChip x={x - w / 2 + 50} y={y} text={c.ref} opacity={1 - grey} />
                  <RefChip x={x - w / 2 + 50} y={y} text={c.ref} color={GREY} opacity={grey} />
                  <rect x={x - 34} y={y - 6} width={SCORE_W} height={12} rx={6} fill={rgba(COLORS.white, 0.12)} />
                  <rect x={x - 34} y={y - 6} width={SCORE_W * c.score} height={12} rx={6} fill={top ? COLORS.cyan : grey > 0.5 ? GREY : rgba(COLORS.cyan, 0.55)} />
                  <text x={x + w / 2 - 14} y={y + 1} fill={grey > 0.5 ? GREY : COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={18} textAnchor="end" dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {c.score.toFixed(2)}
                  </text>
                </g>
              </g>
            );
          })}
          <Caption x={rankX} y={RANK_TOP - 52} text="RANKED" color={rgba(COLORS.white, 0.7)} size={20} opacity={smooth(A.lift[0], 12)} />
          {frame >= A.cut ? (
            <g opacity={smooth(A.cut + 6, 10)}>
              <line x1={rankX - RANK.w / 2 - 14} x2={rankX + RANK.w / 2 + 14} y1={cutY} y2={cutY} stroke={COLORS.cyan} strokeWidth={3} strokeDasharray="10 8" />
            </g>
          ) : null}
          <Caption x={rankX} y={rowY(CANDIDATES.length) + 6 + CUT_GAP} text="NOT USED" color={GREY} size={18} opacity={notUsed} />
        </g>
      </svg>

      <AbsoluteFill style={{opacity: out}}>
        <PromptBar
          x={ASK_BAR.x}
          y={ASK_BAR.y - 30 * (1 - smooth(A.bar[0], 15))}
          width={ASK_BAR.w}
          text={QUESTION}
          chars={interpolate(frame, [A.bar[0] + 4, A.bar[1]], [0, QUESTION.length], clampOpts)}
          opacity={smooth(A.bar[0], 15)}
          frame={frame}
          cursor={frame < A.bar[1] + 4}
        />
        {asked > 0 && asked < 1
          ? (() => {
              const r = segmentRect(TANK, ASK_SEGMENTS.retrieved[0][0], ASK_SEGMENTS.retrieved[0][0] + (ASK_SEGMENTS.message[1] - ASK_SEGMENTS.message[0]));
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: lerp(ASK_BAR.x, r.x + r.w / 2, asked) - lerp(ASK_BAR.w, r.w, Math.min(1, asked * 2.5)) / 2,
                    top: lerp(ASK_BAR.y, r.y + r.h / 2, asked) - lerp(BAR_H, r.h, Math.min(1, asked * 2.5)) / 2,
                    width: lerp(ASK_BAR.w, r.w, Math.min(1, asked * 2.5)), // shrinks first, then travels
                    height: lerp(BAR_H, r.h, Math.min(1, asked * 2.5)),
                    boxSizing: 'border-box',
                    borderRadius: lerp(48, 4, Math.min(1, asked * 2.5)),
                    border: `2px solid ${COLORS.cyan}`,
                    background: SEGMENT_STYLE.message.fill,
                    opacity: interpolate(asked, [0, 0.2], [0, 1], clampOpts),
                  }}
                />
              );
            })()
          : null}
      </AbsoluteFill>

      <Pinned>
        <StatusBadge kind="question" opacity={smooth(0, 12)} frame={frame} />
      </Pinned>
      <Pinned>
        <SceneTitle text="RETRIEVAL: ASK" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
