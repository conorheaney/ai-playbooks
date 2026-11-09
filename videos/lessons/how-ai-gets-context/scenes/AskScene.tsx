import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {ContextTank, Segment, SEGMENT_STYLE, segmentRect} from '../../../shared/components/context/ContextTank';
import {PromptBar, StatusBadge} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, flashAt} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {RefChip} from '../components/Parts';
import {SearchIndex, slotRect, SlotState} from '../components/SearchIndex';
import {ASK_SEGMENTS, ASK_TANK, CANDIDATES, CAPACITY, INDEX, INDEX_ASK, INDEX_SLOTS, QUESTION, TOP_N} from '../layout';
import {ASK as A, SCENES} from '../timing';

const BAR = {x: 880, y: 960, w: 860};
const RANK = {x: 1060, top: 300, step: 58, w: 300, h: 46};
const SCORE_W = 110;

// Candidate slots, in the order the scan finds them (left to right), with their sorted rank.
const FOUND = CANDIDATES.map((c, rank) => ({...c, rank, slot: INDEX_SLOTS.findIndex((s) => s.ref === c.ref)})).sort(
  (a, b) => (a.slot % INDEX.cols) - (b.slot % INDEX.cols) || a.slot - b.slot,
);
const rowY = (i: number) => RANK.top + i * RANK.step;

export const AskScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = SCENES.ask.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const out = interpolate(frame, [A.out, dur], [1, 0], clampOpts);
  const mv = interpolate(frame, [A.move[0], A.move[1]], [0, 1], ease);
  const geom = {x: lerp(INDEX.x, INDEX_ASK.x, mv), y: lerp(INDEX.y, INDEX_ASK.y, mv), scale: lerp(1, INDEX_ASK.scale, mv)};
  const scan = interpolate(frame, [A.scan[0], A.scan[1]], [0, 1], clampOpts);
  const sort = interpolate(frame, [A.sort[0], A.sort[1]], [0, 1], ease);
  const notUsed = interpolate(frame, [A.notUsed, A.notUsed + 14], [0, 1], ease);
  const tankDraw = interpolate(frame, [A.move[0], A.move[1]], [0, 1], ease);

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
      label: 'YOUR QUESTION',
      labelOpacity: 1,
    },
  ];
  const tokens = (0.1 + 0.18 * (interpolate(into(0), [0.7, 1], [0, 0.5], clampOpts) + interpolate(into(1), [0.7, 1], [0, 0.5], clampOpts))) * CAPACITY;

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <g opacity={out}>
          <SearchIndex geom={geom} slots={slots} scan={scan} />
        </g>

        <ContextTank id="gc-a-tank" {...ASK_TANK} draw={tankDraw} opacity={tankDraw > 0 ? 1 : 0} segments={segments} labels={tankDraw} readout={{tokens, capacity: CAPACITY, opacity: tankDraw}} />

        <g opacity={out}>
          {/* Candidates lift out of the index, rank themselves, and the best two enter the window. */}
          {FOUND.map((c, i) => {
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
            const rankY = lerp(rowY(i), rowY(c.rank), sort);
            const rowX = RANK.x - (top ? 0 : 40 * notUsed);
            let x = lerp(from.cx, rowX, l);
            let y = lerp(from.cy, rankY, l);
            let w = lerp(from.w, RANK.w, l);
            let h = lerp(from.h, RANK.h, l);
            let fill = rgba(COLORS.charcoal, 0.95);
            if (t > 0) {
              const r = segmentRect(ASK_TANK, ASK_SEGMENTS.retrieved[c.rank][0], ASK_SEGMENTS.retrieved[c.rank][1]);
              x = lerp(x, r.x + r.w / 2, t);
              y = lerp(y, r.y + r.h / 2, t);
              w = lerp(w, r.w, t);
              h = lerp(h, r.h, t);
              fill = SEGMENT_STYLE.retrieved.fill;
            }
            const content = l * (1 - interpolate(t, [0, 0.4], [0, 1], clampOpts));
            const dim = top ? 1 : lerp(1, 0.35, notUsed);
            return (
              <g key={c.ref} opacity={dim}>
                <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={lerp(8, 12, l)} fill={fill} stroke={top && frame >= A.cut ? COLORS.cyan : rgba(COLORS.cyan, 0.6)} strokeWidth={2} />
                <g opacity={content}>
                  <RefChip x={x - w / 2 + 50} y={y} text={c.ref} scale={0.9} />
                  <rect x={x - 34} y={y - 6} width={SCORE_W} height={12} rx={6} fill={rgba(COLORS.white, 0.12)} />
                  <rect x={x - 34} y={y - 6} width={SCORE_W * c.score} height={12} rx={6} fill={top ? COLORS.cyan : rgba(COLORS.cyan, 0.55)} />
                  <text x={x + w / 2 - 14} y={y + 1} fill={COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={18} textAnchor="end" dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {c.score.toFixed(2)}
                  </text>
                </g>
              </g>
            );
          })}
          <Caption x={RANK.x} y={RANK.top - 52} text="RANKED" color={rgba(COLORS.white, 0.7)} size={20} opacity={smooth(A.lift[0], 12)} />
          {frame >= A.cut ? (
            <g opacity={smooth(A.cut, 10)}>
              <line x1={RANK.x - RANK.w / 2 - 14} x2={RANK.x + RANK.w / 2 + 14} y1={rowY(TOP_N) - RANK.step / 2} y2={rowY(TOP_N) - RANK.step / 2} stroke={COLORS.cyan} strokeWidth={3} strokeDasharray="10 8" />
              <Caption x={RANK.x + RANK.w / 2 + 26} y={rowY(TOP_N) - RANK.step / 2} text={`TOP ${TOP_N}`} anchor="start" color={COLORS.cyan} size={18} />
            </g>
          ) : null}
          <Caption x={RANK.x - 40} y={rowY(CANDIDATES.length) + 6} text="NOT USED" color={rgba(COLORS.white, 0.6)} size={18} opacity={notUsed} />
        </g>
      </svg>

      <AbsoluteFill style={{opacity: out}}>
        <PromptBar
          x={BAR.x}
          y={BAR.y + 40 * (1 - smooth(A.bar[0], 15))}
          width={BAR.w}
          text={QUESTION}
          chars={interpolate(frame, [A.bar[0] + 4, A.bar[1]], [0, QUESTION.length], clampOpts)}
          opacity={smooth(A.bar[0], 15)}
          frame={frame}
          cursor={frame < A.scan[0]}
        />
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
