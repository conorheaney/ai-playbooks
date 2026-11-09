import React from 'react';
import {Caption} from '../../../shared/components/People';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';
import {INDEX, INDEX_SLOTS} from '../layout';

const PAD = 24;
const GAP = 12;

export type IndexGeom = {x: number; y: number; scale: number};

// Screen rectangle of slot i for an index centred on (x, y) at the given scale.
export const slotRect = (g: IndexGeom, i: number) => {
  const w = INDEX.w * g.scale;
  const h = INDEX.h * g.scale;
  const cw = (w - PAD * 2 * g.scale - GAP * g.scale * (INDEX.cols - 1)) / INDEX.cols;
  const ch = (h - PAD * 2 * g.scale - GAP * g.scale * (INDEX.rows - 1)) / INDEX.rows;
  const col = i % INDEX.cols;
  const row = Math.floor(i / INDEX.cols);
  const x = g.x - w / 2 + PAD * g.scale + col * (cw + GAP * g.scale);
  const y = g.y - h / 2 + PAD * g.scale + row * (ch + GAP * g.scale);
  return {x, y, w: cw, h: ch, cx: x + cw / 2, cy: y + ch / 2};
};

export type SlotState = {
  fill: number; // 0 empty, 1 holding a chunk
  fresh?: boolean; // a newly added chunk (brighter)
  highlight?: number; // 0..1 cyan outline: a search candidate
  opacity?: number;
};

// The search index: a grid of chunk slots, each showing its source reference once it holds a chunk.
export const SearchIndex: React.FC<{
  geom: IndexGeom;
  slots: SlotState[];
  draw?: number;
  opacity?: number;
  scan?: number; // 0..1 across the grid; omitted = no scan line
  label?: number;
}> = ({geom, slots, draw = 1, opacity = 1, scan, label = 1}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const w = INDEX.w * geom.scale;
  const h = INDEX.h * geom.scale;
  const left = geom.x - w / 2;
  const top = geom.y - h / 2;
  return (
    <g opacity={opacity}>
      <rect x={left} y={top} width={w} height={h} rx={22 * geom.scale} fill={rgba(COLORS.charcoal, 0.9)} stroke={COLORS.cyan} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      <Caption x={geom.x} y={top - 30} text="SEARCH INDEX" color={COLORS.cyan} size={22 * Math.max(0.85, geom.scale)} opacity={label * draw} />
      <g opacity={draw}>
        {INDEX_SLOTS.map((slot, i) => {
          const r = slotRect(geom, i);
          const s = slots[i];
          const hl = s.highlight ?? 0;
          const fillA = s.fill * (s.fresh ? 0.32 : 0.14);
          return (
            <g key={i} opacity={s.opacity ?? 1}>
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={8 * geom.scale}
                fill={rgba(COLORS.cyan, fillA + 0.25 * hl)}
                stroke={hl > 0.01 ? COLORS.cyan : rgba(COLORS.white, s.fill > 0.5 ? 0.25 : 0.18)}
                strokeWidth={hl > 0.01 ? 2 + 2 * hl : 1.5}
                strokeDasharray={s.fill > 0.5 ? undefined : '5 5'}
              />
              {s.fill > 0.01 ? (
                <g opacity={s.fill}>
                  {[0, 1, 2].map((k) => (
                    <line
                      key={k}
                      x1={r.x + 10 * geom.scale}
                      x2={r.x + r.w - (k === 2 ? 26 : 10) * geom.scale}
                      y1={r.y + r.h * 0.62 + k * 9 * geom.scale}
                      y2={r.y + r.h * 0.62 + k * 9 * geom.scale}
                      stroke={rgba(COLORS.white, s.fresh ? 0.4 : 0.2)}
                      strokeWidth={3 * geom.scale}
                      strokeLinecap="round"
                    />
                  ))}
                  <text
                    x={r.cx}
                    y={r.y + r.h * 0.3}
                    fill={s.fresh || hl > 0.01 ? COLORS.cyan : rgba(COLORS.white, 0.45)}
                    fontFamily={FONT}
                    fontWeight={700}
                    fontSize={16 * geom.scale}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {slot.ref}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>
      {scan !== undefined && scan > 0 && scan < 1 ? (
        <g>
          <rect x={left + w * scan - 40} y={top + 6} width={40} height={h - 12} fill={rgba(COLORS.cyan, 0.12)} />
          <line x1={left + w * scan} x2={left + w * scan} y1={top - 10} y2={top + h + 10} stroke={COLORS.cyan} strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};
