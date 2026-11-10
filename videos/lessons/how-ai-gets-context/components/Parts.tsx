import React from 'react';
import {Caption} from '../../../shared/components/People';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';

const DOC = {w: 96, h: 120, fold: 26};

// Document icon with a folded corner and ruled lines, centred on (x, y); the file name sits under it.
export const DocIcon: React.FC<{
  x: number;
  y: number;
  name?: string;
  color?: string;
  opacity?: number;
  scale?: number;
}> = ({x, y, name, color = COLORS.cyan, opacity = 1, scale = 1}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const {w, h, fold} = DOC;
  const l = -w / 2;
  const t = -h / 2;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d={`M${l} ${t}H${l + w - fold}L${l + w} ${t + fold}V${t + h}H${l}Z`}
        fill={rgba(COLORS.charcoal, 0.95)}
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d={`M${l + w - fold} ${t}V${t + fold}H${l + w}`} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={l + 16} x2={l + w - (i === 3 ? 40 : 16)} y1={t + 46 + i * 16} y2={t + 46 + i * 16} stroke={rgba(color, 0.55)} strokeWidth={4} strokeLinecap="round" />
      ))}
      {name ? <Caption x={0} y={h / 2 + 28} text={name} color={rgba(COLORS.white, 0.8)} size={17} /> : null}
    </g>
  );
};

// Source reference chip, e.g. [§4.2]: the same chip appears on chunks, retrieved slices and answer claims.
export const chipWidth = (text: string) => 34 + text.length * 12;

export const RefChip: React.FC<{x: number; y: number; text: string; opacity?: number; scale?: number; pulse?: number; color?: string}> = ({
  x,
  y,
  text,
  opacity = 1,
  scale = 1,
  pulse = 0,
  color = COLORS.cyan,
}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const w = chipWidth(text);
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale * (1 + 0.12 * pulse)})`}>
      <rect x={-w / 2} y={-15} width={w} height={30} rx={15} fill={rgba(color, 0.12 + 0.4 * pulse)} stroke={color} strokeWidth={2} />
      <text x={0} y={1} fill={pulse > 0.3 ? COLORS.white : color} fontFamily={FONT} fontWeight={700} fontSize={17} textAnchor="middle" dominantBaseline="central">
        [{text}]
      </text>
    </g>
  );
};

// The same chip as an inline HTML element, for chips inside text cards.
export const RefChipHtml: React.FC<{text: string; color?: string; opacity?: number}> = ({text, color = COLORS.cyan, opacity = 1}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 12px',
      borderRadius: 16,
      border: `2px solid ${color}`,
      background: rgba(color, 0.12),
      color,
      fontSize: 18,
      fontWeight: 700,
      lineHeight: 1.3,
      opacity,
      whiteSpace: 'nowrap',
    }}
  >
    [{text}]
  </span>
);

// Labelled HTML card centred on (x, y), in the style of the how-ai-responds context cards.
export const InfoCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  label?: string;
  text?: React.ReactNode;
  color?: string;
  labelColor?: string;
  opacity?: number;
  scale?: number;
  dashed?: boolean;
  fill?: string;
  fontSize?: number;
  glow?: number;
  children?: React.ReactNode;
}> = ({x, y, w, h, label, text, color = rgba(COLORS.white, 0.6), labelColor, opacity = 1, scale = 1, dashed = false, fill, fontSize = 22, glow = 0, children}) => {
  if (opacity <= 0.001) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: h === undefined ? y : y - h / 2,
        width: w,
        height: h,
        boxSizing: 'border-box',
        transform: `${h === undefined ? 'translateY(-50%) ' : ''}scale(${scale})`,
        opacity,
        padding: '14px 22px',
        borderRadius: 20,
        border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        background: fill ?? rgba(COLORS.charcoal, 0.92),
        boxShadow: glow > 0 ? `0 0 ${36 * glow}px ${rgba(COLORS.cyan, 0.45 * glow)}` : undefined,
        fontFamily: FONT,
        color: COLORS.white,
        overflow: 'hidden',
      }}
    >
      {label ? (
        <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.18em', color: labelColor ?? color, marginBottom: 6, whiteSpace: 'nowrap'}}>{label}</div>
      ) : null}
      {text !== undefined ? <div style={{fontSize, fontWeight: 500, lineHeight: 1.28}}>{text}</div> : null}
      {children}
    </div>
  );
};

// Rubber stamp that slams in: progress is a spring from 0 to 1.
export const Stamp: React.FC<{x: number; y: number; text: string; progress: number; size?: number; color?: string; rotate?: number; opacity?: number}> = ({
  x,
  y,
  text,
  progress,
  size = 26,
  color = COLORS.error,
  rotate = -4,
  opacity = 1,
}) =>
  progress > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${1.6 - 0.6 * progress})`,
        opacity: Math.min(1, progress * 1.4) * opacity,
        padding: `${size * 0.2}px ${size * 0.6}px`,
        border: `${Math.max(3, size * 0.1)}px solid ${color}`,
        borderRadius: size * 0.3,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '0.04em',
        color,
        background: rgba(COLORS.charcoal, 0.88),
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : null;

// Sentence-case caveat, styled as the series' caveat pill (as in how-ai-responds Scenes 5 and 7).
export const Note: React.FC<{x: number; y: number; text: string; opacity: number; color?: string; size?: number}> = ({
  x,
  y,
  text,
  opacity,
  color = COLORS.white,
  size = 26,
}) =>
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
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : null;

// Animated dashed flow line between two points, curving gently; used for "feeds into" links.
export const FlowLine: React.FC<{from: {x: number; y: number}; to: {x: number; y: number}; frame: number; opacity: number; color?: string; bend?: number}> = ({
  from,
  to,
  frame,
  opacity,
  color = COLORS.cyan,
  bend = 0,
}) =>
  opacity > 0.001 ? (
    <path
      d={`M${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 + bend}, ${to.x} ${to.y}`}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeDasharray="4 12"
      strokeDashoffset={-frame * 2}
      strokeLinecap="round"
      opacity={opacity * 0.8}
    />
  ) : null;
