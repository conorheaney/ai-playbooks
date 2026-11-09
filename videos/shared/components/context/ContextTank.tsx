import React from 'react';
import {FONT} from '../../fonts';
import {COLORS, rgba} from '../../theme';

export type SegKind =
  | 'instructions'
  | 'tools'
  | 'history'
  | 'documents'
  | 'message'
  | 'reasoning'
  | 'output'
  | 'summary'
  | 'retrieved'
  | 'memory';

export type Segment = {
  kind: SegKind;
  from: number; // 0..1 of the window, bottom up
  to: number;
  opacity?: number;
  label?: string; // overrides the default label
  labelOpacity?: number;
  tint?: string; // replaces the fill colour, e.g. a highlighted row
  outline?: string;
  outlineOpacity?: number;
  text?: string; // small caps text drawn inside the segment
  textOpacity?: number;
};

type Style = {fill: string; pattern?: 'hatch' | 'ruled' | 'diag' | 'dots' | 'pdots'; ink: string; stroke?: string; dashed?: boolean; label: string};

// Colour alone never tells segments apart: each type also has its own fill pattern.
export const SEGMENT_STYLE: Record<SegKind, Style> = {
  instructions: {fill: rgba(COLORS.purple, 0.35), ink: COLORS.purple, label: 'SYSTEM INSTRUCTIONS'},
  tools: {fill: rgba(COLORS.purple, 0.1), pattern: 'hatch', ink: COLORS.purple, stroke: COLORS.purple, label: 'TOOL DEFINITIONS'},
  history: {fill: rgba(COLORS.white, 0.18), ink: COLORS.white, label: 'CONVERSATION HISTORY'},
  documents: {fill: rgba(COLORS.cyan, 0.18), pattern: 'ruled', ink: COLORS.cyan, label: 'DOCUMENTS'},
  message: {fill: rgba(COLORS.cyan, 0.6), ink: COLORS.cyan, label: 'YOUR MESSAGE'},
  reasoning: {fill: rgba(COLORS.white, 0.06), pattern: 'diag', ink: COLORS.white, label: 'REASONING (HIDDEN)'},
  output: {fill: rgba(COLORS.cyan, 0.85), ink: COLORS.cyan, label: 'OUTPUT'},
  summary: {fill: rgba(COLORS.white, 0.32), ink: COLORS.white, stroke: COLORS.white, dashed: true, label: 'SUMMARY'},
  retrieved: {fill: rgba(COLORS.cyan, 0.28), pattern: 'dots', ink: COLORS.cyan, label: 'RETRIEVED'},
  memory: {fill: rgba(COLORS.purple, 0.22), pattern: 'pdots', ink: COLORS.purple, stroke: COLORS.purple, dashed: true, label: 'MEMORY'},
};

export type TankGeom = {x: number; y: number; w: number; h: number};

const PAD = 6;
const GAP = 2;

// Screen rectangle for the slice [from, to] of a tank, as used to morph things into it.
export const segmentRect = (g: TankGeom, from: number, to: number) => {
  const left = g.x - g.w / 2 + PAD;
  const width = g.w - PAD * 2;
  const bottom = g.y + g.h / 2 - PAD;
  const inner = g.h - PAD * 2;
  const top = bottom - to * inner;
  return {x: left, y: top, w: width, h: Math.max(0, (to - from) * inner - GAP)};
};

export const fillTopY = (g: TankGeom, level: number) => segmentRect(g, 0, level).y;

const roundedRectPath = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
  `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export type Readout = {tokens: number; capacity: number; opacity: number; warn?: boolean; pulse?: number};

type ContextTankProps = TankGeom & {
  id: string;
  segments: Segment[];
  opacity?: number;
  draw?: number; // 0..1 outline draw-on
  outlineColor?: string;
  ruler?: number;
  labels?: number; // master opacity for the right-hand labels
  readout?: Readout;
  remaining?: {from: number; opacity: number; label: string};
};

export const ContextTank: React.FC<ContextTankProps> = ({
  id,
  x,
  y,
  w,
  h,
  segments,
  opacity = 1,
  draw = 1,
  outlineColor = COLORS.cyan,
  ruler = 0,
  labels = 0,
  readout,
  remaining,
}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const g = {x, y, w, h};
  const left = x - w / 2;
  const top = y - h / 2;
  const outline = roundedRectPath(left, top, w, h, 18);

  // Labels sit at each segment's middle, pushed apart so thin neighbours never overlap.
  const placed: {y: number; text: string; color: string; opacity: number}[] = [];
  [...segments]
    .filter((s) => (s.labelOpacity ?? 0) > 0.001 && s.to - s.from > 0.0005)
    .sort((a, b) => a.from - b.from)
    .forEach((s) => {
      const r = segmentRect(g, s.from, s.to);
      const want = r.y + r.h / 2;
      const prev = placed[placed.length - 1];
      placed.push({
        y: prev ? Math.min(want, prev.y - 26) : want,
        text: s.label ?? SEGMENT_STYLE[s.kind].label,
        color: SEGMENT_STYLE[s.kind].ink === COLORS.white ? rgba(COLORS.white, 0.85) : SEGMENT_STYLE[s.kind].ink,
        opacity: (s.labelOpacity ?? 0) * (s.opacity ?? 1),
      });
    });

  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={roundedRectPath(left + 3, top + 3, w - 6, h - 6, 15)} />
        </clipPath>
        <pattern id={`${id}-hatch`} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={14} stroke={rgba(COLORS.purple, 0.75)} strokeWidth={4} />
        </pattern>
        <pattern id={`${id}-ruled`} width={20} height={12} patternUnits="userSpaceOnUse">
          <line x1={0} y1={6} x2={20} y2={6} stroke={rgba(COLORS.cyan, 0.4)} strokeWidth={2} />
        </pattern>
        <pattern id={`${id}-diag`} width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1={0} y1={0} x2={0} y2={12} stroke={rgba(COLORS.white, 0.4)} strokeWidth={3} />
        </pattern>
        <pattern id={`${id}-dots`} width={10} height={10} patternUnits="userSpaceOnUse">
          <circle cx={5} cy={5} r={1.8} fill={rgba(COLORS.cyan, 0.7)} />
        </pattern>
        <pattern id={`${id}-pdots`} width={10} height={10} patternUnits="userSpaceOnUse">
          <circle cx={5} cy={5} r={1.8} fill={rgba(COLORS.purple, 0.85)} />
        </pattern>
      </defs>

      {/* Ruler: 0–100% of the window, ticks every 10%. */}
      {ruler > 0.001 ? (
        <g opacity={ruler}>
          {Array.from({length: 11}, (_, i) => {
            const ty = fillTopY(g, i / 10);
            const major = i % 5 === 0;
            return (
              <g key={i}>
                <line x1={left - (major ? 22 : 14)} x2={left - 6} y1={ty} y2={ty} stroke={rgba(COLORS.white, major ? 0.6 : 0.3)} strokeWidth={2} />
                {major ? (
                  <text x={left - 30} y={ty} fill={rgba(COLORS.white, 0.6)} fontFamily={FONT} fontWeight={700} fontSize={16} textAnchor="end" dominantBaseline="central">
                    {i * 10}%
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      ) : null}

      <g clipPath={`url(#${id}-clip)`}>
        {segments.map((s, i) => {
          const r = segmentRect(g, s.from, s.to);
          if (r.h <= 0.2) {
            return null;
          }
          const st = SEGMENT_STYLE[s.kind];
          const fill = s.tint ?? st.fill;
          return (
            <g key={i} opacity={s.opacity ?? 1}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill={fill} />
              {st.pattern && !s.tint ? <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill={`url(#${id}-${st.pattern})`} /> : null}
              {st.stroke ? <rect x={r.x + 1} y={r.y + 1} width={r.w - 2} height={Math.max(0, r.h - 2)} rx={4} fill="none" stroke={rgba(st.stroke, 0.7)} strokeWidth={2} strokeDasharray={st.dashed ? '6 5' : undefined} /> : null}
              {s.outline ? <rect x={r.x + 1} y={r.y + 1} width={r.w - 2} height={Math.max(0, r.h - 2)} rx={4} fill="none" stroke={s.outline} strokeWidth={4} opacity={s.outlineOpacity ?? 1} /> : null}
              {s.text && r.h > 14 ? (
                <text x={r.x + r.w / 2} y={r.y + r.h / 2} fill={COLORS.white} opacity={s.textOpacity ?? 1} fontFamily={FONT} fontWeight={700} fontSize={16} letterSpacing="0.14em" textAnchor="middle" dominantBaseline="central">
                  {s.text}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>

      {remaining && remaining.opacity > 0.001 ? (
        <g opacity={remaining.opacity}>
          {(() => {
            const r = segmentRect(g, remaining.from, 1);
            return (
              <>
                <rect x={r.x + 4} y={r.y + 4} width={r.w - 8} height={Math.max(0, r.h - 8)} rx={10} fill={rgba(COLORS.cyan, 0.05)} stroke={rgba(COLORS.cyan, 0.7)} strokeWidth={2} strokeDasharray="10 8" />
                <text x={x} y={r.y + r.h / 2} fill={COLORS.cyan} fontFamily={FONT} fontWeight={700} fontSize={20} letterSpacing="0.16em" textAnchor="middle" dominantBaseline="central">
                  {remaining.label}
                </text>
              </>
            );
          })()}
        </g>
      ) : null}

      <path d={outline} pathLength={1} fill="none" stroke={outlineColor} strokeWidth={3} strokeDasharray="1 1" strokeDashoffset={1 - draw} strokeLinejoin="round" />

      {labels > 0.001
        ? placed.map((l, i) => (
            <text key={i} x={left + w + 22} y={l.y} fill={l.color} opacity={labels * l.opacity} fontFamily={FONT} fontWeight={700} fontSize={18} letterSpacing="0.14em" dominantBaseline="central">
              {l.text}
            </text>
          ))
        : null}

      {readout && readout.opacity > 0.001 ? (
        <g opacity={readout.opacity}>
          {readout.pulse ? (
            <rect x={x - 200} y={top - 84} width={400} height={44} rx={22} fill={rgba(COLORS.cyan, 0.18 * readout.pulse)} stroke={rgba(COLORS.cyan, 0.8 * readout.pulse)} strokeWidth={2} />
          ) : null}
          <text x={x} y={top - 62} fill={readout.warn ? COLORS.error : COLORS.white} fontFamily={FONT} fontWeight={800} fontSize={26} textAnchor="middle" dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
            {fmt(readout.tokens)} / {fmt(readout.capacity)} <tspan fill={readout.pulse ? COLORS.cyan : undefined}>TOKENS</tspan>
          </text>
          <text x={x} y={top - 28} fill={readout.warn ? COLORS.error : rgba(COLORS.white, 0.55)} fontFamily={FONT} fontWeight={700} fontSize={15} letterSpacing="0.16em" textAnchor="middle" dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
            {Math.round((readout.tokens / readout.capacity) * 100)}% · {readout.warn ? 'NEAR LIMIT' : 'EXAMPLE CAPACITY'}
          </text>
        </g>
      ) : null}
    </g>
  );
};
