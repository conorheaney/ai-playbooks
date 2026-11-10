import React from 'react';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';

// A context window drawn with fixed-height slices (heights here are illustrative, not proportional to tokens).
// The existing kinds keep the series' segment styles; this lesson adds the tool request and tool result.
export type SliceKind = 'instructions' | 'tools' | 'message' | 'request' | 'result' | 'brief';

const STYLE: Record<SliceKind, {fill: string; pattern?: 'hatch' | 'barcode'; stroke?: string; dashed?: boolean; perforated?: boolean}> = {
  instructions: {fill: rgba(COLORS.purple, 0.35)},
  tools: {fill: rgba(COLORS.purple, 0.1), pattern: 'hatch', stroke: COLORS.purple},
  message: {fill: rgba(COLORS.cyan, 0.6)},
  request: {fill: rgba(COLORS.cyan, 0.4), stroke: COLORS.cyan, dashed: true, perforated: true},
  result: {fill: rgba(COLORS.cyan, 0.22), pattern: 'barcode', stroke: COLORS.cyan},
  brief: {fill: rgba(COLORS.white, 0.18)},
};

export type Slice = {kind: SliceKind; h: number; label?: string; opacity?: number; dx?: number; dy?: number};

export const SLICE_PAD = 8;
export const SLICE_GAP = 5;

// Top-left corner and size of slice i (slices stack bottom up).
export const sliceRect = (x: number, y: number, w: number, h: number, slices: {h: number}[], i: number) => {
  let bottom = y + h / 2 - SLICE_PAD;
  for (let j = 0; j < i; j++) {
    bottom -= slices[j].h + SLICE_GAP;
  }
  return {x: x - w / 2 + SLICE_PAD, y: bottom - slices[i].h, w: w - SLICE_PAD * 2, h: slices[i].h};
};

export const MiniWindow: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  slices: Slice[];
  draw?: number;
  opacity?: number;
  dashed?: boolean;
  outline?: string;
  glow?: number;
}> = ({id, x, y, w, h, slices, draw = 1, opacity = 1, dashed = false, outline = COLORS.cyan, glow = 0}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const left = x - w / 2;
  const top = y - h / 2;
  return (
    <g opacity={opacity}>
      <defs>
        <pattern id={`${id}-hatch`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={14} stroke={rgba(COLORS.purple, 0.75)} strokeWidth={4} />
        </pattern>
        <pattern id={`${id}-barcode`} width={22} height={10} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={3} height={10} fill={rgba(COLORS.cyan, 0.55)} />
          <rect x={6} y={0} width={1.5} height={10} fill={rgba(COLORS.cyan, 0.55)} />
          <rect x={10} y={0} width={4} height={10} fill={rgba(COLORS.cyan, 0.55)} />
          <rect x={17} y={0} width={1.5} height={10} fill={rgba(COLORS.cyan, 0.55)} />
        </pattern>
      </defs>
      {glow > 0.01 ? <rect x={left - 6} y={top - 6} width={w + 12} height={h + 12} rx={22} fill="none" stroke={rgba(COLORS.cyan, 0.5 * glow)} strokeWidth={8} /> : null}
      <rect x={left} y={top} width={w} height={h} rx={18} fill={rgba(COLORS.charcoal, 0.85)} stroke="none" />
      {slices.map((s, i) => {
        const r = sliceRect(x, y, w, h, slices, i);
        const st = STYLE[s.kind];
        const o = s.opacity ?? 1;
        if (o <= 0.001) {
          return null;
        }
        return (
          <g key={i} opacity={o} transform={`translate(${s.dx ?? 0} ${s.dy ?? 0})`}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={5} fill={st.fill} />
            {st.pattern ? <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={5} fill={`url(#${id}-${st.pattern})`} /> : null}
            {st.stroke ? <rect x={r.x + 1} y={r.y + 1} width={r.w - 2} height={r.h - 2} rx={5} fill="none" stroke={rgba(st.stroke, 0.8)} strokeWidth={2} strokeDasharray={st.dashed ? '7 5' : undefined} /> : null}
            {st.perforated ? <line x1={r.x + 10} x2={r.x + r.w - 10} y1={r.y + 7} y2={r.y + 7} stroke={COLORS.cyan} strokeWidth={3} strokeDasharray="2 6" strokeLinecap="round" /> : null}
            {s.label ? (
              <text
                x={r.x + r.w / 2}
                y={r.y + r.h / 2 + (st.perforated ? 3 : 0)}
                fill={COLORS.white}
                fontFamily={FONT}
                fontWeight={800}
                fontSize={24}
                letterSpacing="0.1em"
                textAnchor="middle"
                dominantBaseline="central"
                style={{paintOrder: 'stroke', stroke: rgba(COLORS.charcoal, 0.75), strokeWidth: 5}}
              >
                {s.label}
              </text>
            ) : null}
          </g>
        );
      })}
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        rx={18}
        fill="none"
        stroke={outline}
        strokeWidth={3}
        pathLength={1}
        strokeDasharray={dashed ? '0.02 0.015' : '1 1'}
        strokeDashoffset={dashed ? 0 : 1 - draw}
        opacity={dashed ? draw : 1}
      />
    </g>
  );
};
