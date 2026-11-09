import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {StatusBadge} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {DocIcon, RefChip} from '../components/Parts';
import {SearchIndex, slotRect, SlotState} from '../components/SearchIndex';
import {INDEX, INDEX_SLOTS, NEW_DOCS} from '../layout';
import {PREPARE as P, SCENES} from '../timing';

const STACK = {x: 260, y: 520};
const STACK_SIZE = 5;
const SPLIT_X = 700;
const DOC_Y = [380, 560, 740];
const STRIP = {w: 190, h: 32, gap: 40};
const GEOM = {x: INDEX.x, y: INDEX.y, scale: 1};

const stackPos = (k: number) => ({x: STACK.x + k * 12, y: STACK.y - k * 12});
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export const PrepareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = SCENES.prepare.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const out = interpolate(frame, [P.out, dur], [1, 0], clampOpts);
  const indexDraw = interpolate(frame, [P.index[0], P.index[1]], [0, 1], ease);
  const newDoc = smooth(P.newDoc, 14);
  const oldDoc = interpolate(frame, [P.oldDoc, P.oldDoc + 16], [0, 1], ease);
  const count = interpolate(frame, [P.stack[0], P.stack[1]], [0, 1240], clampOpts) + (frame >= P.newDoc + 6 ? 1 : 0) - (frame >= P.oldDoc + 8 ? 1 : 0);

  // Each of the three documents moves to the splitter, then breaks into four chunks.
  const move = (d: number) => interpolate(frame, [P.split[0] + d * 6, P.split[0] + d * 6 + 20], [0, 1], ease);
  const split = (d: number) => interpolate(frame, [P.split[0] + 22 + d * 8, P.split[0] + 40 + d * 8], [0, 1], ease);
  const tagAt = (n: number) => P.tags[0] + n * 3.5;
  const fileT = (n: number) => interpolate(frame, [P.file + n * P.fileStep, P.file + n * P.fileStep + P.fileTravel], [0, 1], ease);

  const slots: SlotState[] = INDEX_SLOTS.map((s) =>
    s.prefilled ? {fill: 1} : {fill: s.chunk >= 0 && fileT(s.chunk) >= 1 ? 1 : 0, fresh: true},
  );

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <SearchIndex geom={GEOM} slots={slots} draw={indexDraw} />

        <g opacity={out}>
          {/* A large, changing collection. */}
          {Array.from({length: STACK_SIZE}, (_, k) => {
            const p = stackPos(k);
            const leaving = k === 0 ? oldDoc : 0;
            return (
              <DocIcon
                key={k}
                x={p.x - 140 * leaving}
                y={p.y}
                // The top two stacked documents (plus the new one) are the three that get split.
                opacity={smooth(P.stack[0] + k * 6, 12) * (1 - leaving) * (STACK_SIZE - k <= 2 ? 1 - Math.ceil(move(STACK_SIZE - k)) : 1)}
                color={rgba(COLORS.cyan, 0.8)}
              />
            );
          })}
          <DocIcon x={stackPos(STACK_SIZE).x} y={lerp(stackPos(STACK_SIZE).y - 160, stackPos(STACK_SIZE).y, newDoc)} opacity={newDoc * (1 - Math.ceil(move(0)))} />
          <Caption x={STACK.x + 24} y={STACK.y + 130} text={`${fmt(count)} DOCUMENTS`} color={COLORS.white} size={20} opacity={smooth(P.stack[0], 12)} />
          <Caption x={stackPos(STACK_SIZE).x + 90} y={stackPos(STACK_SIZE).y - 70} text="+ NEW" anchor="start" color={COLORS.cyan} size={18} opacity={newDoc * interpolate(frame, [P.newDoc + 40, P.newDoc + 52], [1, 0], clampOpts)} />
          <Caption x={stackPos(0).x - 150} y={stackPos(0).y + 90} text="− OLD" color={rgba(COLORS.white, 0.7)} size={18} opacity={oldDoc * interpolate(frame, [P.oldDoc + 30, P.oldDoc + 42], [1, 0], clampOpts)} />

          {/* Documents travelling to the splitter, then splitting. */}
          {NEW_DOCS.map((doc, d) => {
            const m = move(d);
            const s = split(d);
            if (m <= 0 || s >= 1) {
              return null;
            }
            const from = stackPos(STACK_SIZE - d);
            return <DocIcon key={doc.name} x={lerp(from.x, SPLIT_X, m)} y={lerp(from.y, DOC_Y[d], m)} name={m > 0.9 ? doc.name : undefined} opacity={1 - s} />;
          })}

          {/* Chunks, tagged with their source, then filed into the index. */}
          {NEW_DOCS.flatMap((doc, d) =>
            doc.refs.map((ref, k) => {
              const n = d * 4 + k;
              const s = split(d);
              const f = fileT(n);
              if (s <= 0 || f >= 1) {
                return null;
              }
              const home = {x: SPLIT_X, y: DOC_Y[d] + (k - 1.5) * STRIP.gap * s};
              const slot = INDEX_SLOTS.findIndex((x) => x.chunk === n);
              const r = slotRect(GEOM, slot);
              const cx = lerp(home.x, r.cx, f);
              const cy = lerp(home.y, r.cy, f);
              const w = lerp(STRIP.w * (0.5 + 0.5 * s), r.w, f);
              const h = lerp(STRIP.h, r.h, f);
              const tag = smooth(tagAt(n), 10);
              return (
                <g key={ref} opacity={Math.min(1, s * 1.5)}>
                  <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={6} fill={rgba(COLORS.cyan, 0.14 + 0.14 * f)} stroke={rgba(COLORS.cyan, 0.8)} strokeWidth={2} />
                  <text x={cx} y={cy + 1} fill={rgba(COLORS.white, 0.75)} opacity={tag * (1 - f)} fontFamily={FONT} fontWeight={500} fontSize={14} textAnchor="middle" dominantBaseline="central">
                    {doc.source}
                  </text>
                  <RefChip x={lerp(home.x + STRIP.w / 2 + 48, r.cx, f)} y={lerp(home.y, r.cy, f)} text={ref} opacity={tag * (1 - f)} scale={(0.7 + 0.3 * tag) * (1 - 0.5 * f)} />
                </g>
              );
            }),
          )}
        </g>
      </svg>

      <Pinned>
        <StatusBadge kind="ahead" opacity={smooth(P.badge, 12) * interpolate(frame, [dur - 12, dur], [1, 0], clampOpts)} frame={frame} />
      </Pinned>
      <Pinned>
        <SceneTitle text="RETRIEVAL: PREPARE" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
