import React from 'react';
import {Mark} from '../../../shared/components/Bubble';
import {Gear} from '../../../shared/components/People';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';

// Legibility budget (see BLUEPRINT.md): nothing informative under 24px.

// Full-frame SVG layer, for lines and shapes drawn in the 1920 × 1080 design space.
export const Layer: React.FC<{children: React.ReactNode; opacity?: number}> = ({children, opacity = 1}) =>
  opacity > 0.001 ? (
    <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity}}>
      {children}
    </svg>
  ) : null;

type Anchor = 'start' | 'middle' | 'end';
const anchorShift = (a: Anchor) => (a === 'start' ? '0%' : a === 'end' ? '-100%' : '-50%');

// HTML text placed at (x, y), vertically centred.
export const Txt: React.FC<{
  x: number;
  y: number;
  text?: React.ReactNode;
  size?: number;
  weight?: 500 | 700 | 800;
  color?: string;
  opacity?: number;
  anchor?: Anchor;
  spacing?: string;
  scale?: number;
  shadow?: boolean;
  children?: React.ReactNode;
}> = ({x, y, text, size = 24, weight = 700, color = COLORS.white, opacity = 1, anchor = 'middle', spacing = '0.1em', scale = 1, shadow = false, children}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchorShift(anchor)}, -50%) scale(${scale})`,
        transformOrigin: anchor === 'start' ? '0 50%' : anchor === 'end' ? '100% 50%' : '50% 50%',
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: spacing,
        whiteSpace: 'nowrap',
        opacity,
        fontVariantNumeric: 'tabular-nums',
        textShadow: shadow ? `0 0 24px ${rgba(COLORS.cyan, 0.4)}` : undefined,
      }}
    >
      {text ?? children}
    </div>
  ) : null;

// Rounded pill with a border: tags, chips and exit labels.
export const Chip: React.FC<{
  x: number;
  y: number;
  text: React.ReactNode;
  color?: string;
  textColor?: string;
  size?: number;
  weight?: 500 | 700 | 800;
  fill?: string;
  dashed?: boolean;
  opacity?: number;
  scale?: number;
  anchor?: Anchor;
  icon?: React.ReactNode;
  glow?: number;
}> = ({x, y, text, color = COLORS.cyan, textColor, size = 24, weight = 700, fill, dashed = false, opacity = 1, scale = 1, anchor = 'middle', icon, glow = 0}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchorShift(anchor)}, -50%) scale(${scale})`,
        transformOrigin: anchor === 'start' ? '0 50%' : anchor === 'end' ? '100% 50%' : '50% 50%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.35}px ${size * 0.8}px`,
        borderRadius: size * 1.2,
        border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        background: fill ?? rgba(COLORS.charcoal, 0.94),
        boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${rgba(color, 0.5 * glow)}` : undefined,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: '0.08em',
        color: textColor ?? COLORS.white,
        whiteSpace: 'nowrap',
        opacity,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {icon}
      {text}
    </div>
  ) : null;

// Round ✓ / ✕ badge as an HTML element centred on (x, y).
export const MarkAt: React.FC<{x: number; y: number; ok: boolean; scale: number; size?: number; color?: string}> = ({x, y, ok, scale, size = 48, color}) =>
  scale > 0.01 ? (
    <svg width={size} height={size} viewBox="-26 -26 52 52" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `scale(${scale})`, overflow: 'visible'}}>
      {color ? (
        <>
          <circle r={24} fill={color} />
          <path d={ok ? 'M-10 0L-3 7L10 -7' : 'M-8 -8L8 8M8 -8L-8 8'} stroke={COLORS.charcoal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <Mark ok={ok} />
      )}
    </svg>
  ) : null;

// Person icon as inline SVG (the user, whenever the harness stops for a human).
export const PersonIcon: React.FC<{size?: number; color?: string}> = ({size = 32, color = COLORS.white}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{flex: 'none'}}>
    <circle cx={32} cy={19} r={12} fill={color} />
    <path d="M10 60C10 44 20 35 32 35C44 35 54 44 54 60Z" fill={color} />
  </svg>
);

// The purple gear: the app (later the harness) doing the work. SVG, centred on (x, y).
export const GearMark: React.FC<{x: number; y: number; frame: number; opacity: number; label?: string; labelAt?: 'right' | 'above' | 'below'; size?: number; spin?: number}> = ({
  x,
  y,
  frame,
  opacity,
  label,
  labelAt = 'right',
  size = 52,
  spin = 2,
}) =>
  opacity > 0.001 ? (
    <g opacity={opacity}>
      <Gear x={x} y={y} size={size} angle={frame * spin} color={COLORS.purple} />
      {label ? (
        <text
          x={labelAt === 'right' ? x + size * 0.75 : x}
          y={labelAt === 'above' ? y - size * 0.95 : labelAt === 'below' ? y + size * 0.95 : y}
          fill={COLORS.purple}
          fontFamily={FONT}
          fontWeight={700}
          fontSize={24}
          letterSpacing="0.16em"
          textAnchor={labelAt === 'right' ? 'start' : 'middle'}
          dominantBaseline="central"
        >
          {label}
        </text>
      ) : null}
    </g>
  ) : null;

export type BadgeKind = 'app' | 'loop' | 'wait';

// Top-right status pill, in the series style. "app": the app acting; "loop": the agent loop and its step count;
// "wait": the harness has paused for a human.
export const Badge: React.FC<{kind: BadgeKind; opacity: number; frame: number; step?: number; max?: number}> = ({kind, opacity, frame, step = 1, max}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const color = kind === 'app' ? COLORS.purple : kind === 'wait' ? COLORS.white : COLORS.cyan;
  const text = kind === 'app' ? 'APP ACTION' : kind === 'wait' ? 'WAITING FOR YOU' : `AGENT LOOP · STEP ${step}${max ? ` / ${max}` : ''}`;
  return (
    <div
      style={{
        position: 'absolute',
        right: 96,
        top: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 24px 10px 14px',
        borderRadius: 40,
        border: `2px solid ${color}`,
        background: rgba(COLORS.charcoal, 0.9),
        opacity,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: '0.12em',
        color: COLORS.white,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <svg width={40} height={40} viewBox="0 0 64 64">
        {kind === 'app' ? (
          <Gear x={32} y={32} size={56} angle={frame * 2} color={color} />
        ) : kind === 'wait' ? (
          <>
            <circle cx={32} cy={19} r={12} fill={color} />
            <path d="M10 60C10 44 20 35 32 35C44 35 54 44 54 60Z" fill={color} />
          </>
        ) : (
          // Circular arrow: the loop.
          <g fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${frame * 3} 32 32)`}>
            <path d="M52 32A20 20 0 1 1 40 13.7" />
            <path d="M40 4L41 14L31 16" />
          </g>
        )}
      </svg>
      {text}
    </div>
  );
};

// Takeaway caption under the main content: spaced uppercase, as in lessons 1–3 (shared Caption, 26 px / 0.16em).
export const Note: React.FC<{x: number; y: number; text: string; opacity: number; color?: string; size?: number}> = ({x, y, text, opacity, color = COLORS.white, size = 26}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - opacity) * 12}px)`,
        opacity,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '0.16em',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : null;

// Sentence-case caveat in the series' caveat pill (as in how-ai-responds and how-ai-gets-context).
export const Caveat: React.FC<{x: number; y: number; text: string; opacity: number; size?: number}> = ({x, y, text, opacity, size = 26}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - opacity) * 12}px)`,
        opacity,
        padding: '12px 30px',
        borderRadius: 32,
        border: `2px solid ${rgba(COLORS.white, 0.35)}`,
        background: rgba(COLORS.white, 0.07),
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: size,
        color: COLORS.white,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : null;

// Animated dashed "feeds into" line along a gentle curve.
export const FlowLine: React.FC<{from: {x: number; y: number}; to: {x: number; y: number}; frame: number; opacity: number; color?: string; bend?: number; draw?: number}> = ({
  from,
  to,
  frame,
  opacity,
  color = COLORS.cyan,
  bend = 0,
  draw = 1,
}) => {
  if (opacity <= 0.001 || draw <= 0.001) {
    return null;
  }
  const c = {x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + bend};
  // Draw-on: trim the end point along the curve.
  const t = draw;
  const mid = {x: (1 - t) * from.x + t * c.x, y: (1 - t) * from.y + t * c.y};
  const end = {x: (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * c.x + t * t * to.x, y: (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * c.y + t * t * to.y};
  return (
    <path
      d={`M${from.x} ${from.y} Q ${mid.x} ${mid.y}, ${end.x} ${end.y}`}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="4 12"
      strokeDashoffset={-frame * 2}
      strokeLinecap="round"
      opacity={opacity * 0.85}
    />
  );
};

// Straight arrow with a head, drawn on from `from` to `to` by `draw`.
export const Arrow: React.FC<{from: {x: number; y: number}; to: {x: number; y: number}; draw?: number; color?: string; opacity?: number; dashed?: boolean; width?: number}> = ({
  from,
  to,
  draw = 1,
  color = COLORS.cyan,
  opacity = 1,
  dashed = false,
  width = 4,
}) => {
  if (draw <= 0.001 || opacity <= 0.001) {
    return null;
  }
  const tip = {x: from.x + (to.x - from.x) * draw, y: from.y + (to.y - from.y) * draw};
  const a = Math.atan2(to.y - from.y, to.x - from.x);
  const head = (s: number) => `${tip.x - Math.cos(a + s) * 16} ${tip.y - Math.sin(a + s) * 16}`;
  return (
    <g opacity={opacity}>
      <line x1={from.x} y1={from.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '10 10' : undefined} />
      <path d={`M${head(0.5)}L${tip.x} ${tip.y}L${head(-0.5)}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
