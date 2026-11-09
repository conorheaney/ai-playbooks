import React from 'react';
import {ModelCube} from '../ModelCube';
import {Caption, Gear} from '../People';
import {FONT} from '../../fonts';
import {COLORS, rgba} from '../../theme';

// The released model from how-ai-trains: frozen, locked, never changing. The yaw matches the angle
// that video's cube froze at, so the two videos show the same object.
const FROZEN_YAW = 3.506;

export const LockedCube: React.FC<{
  id: string;
  absFrame: number;
  x: number;
  y: number;
  size: number;
  appear?: number;
  glow?: number;
  glowColor?: string;
}> = ({glow = 0, glowColor = COLORS.cyan, ...rest}) => (
  <ModelCube {...rest} yaw={FROZEN_YAW} still={1} emblem={1} frost={1} lock={1} glow={glow} glowColor={glowColor} />
);

export type BadgeKind = 'app' | 'stream' | 'ahead' | 'question' | 'review';

const BADGE_TEXT: Record<BadgeKind, string> = {
  app: 'APP ACTION',
  stream: 'STREAMING',
  ahead: 'AHEAD OF TIME',
  question: 'PER QUESTION',
  review: 'REVIEW',
};

// Badge icons other than the gear and the streaming bars, drawn in a 64 × 64 box.
const BadgeIcon: React.FC<{kind: 'ahead' | 'question' | 'review'; color: string; frame: number}> = ({kind, color, frame}) => {
  if (kind === 'ahead') {
    // Clock: preparation happens before anyone asks.
    const a = (frame * 6 * Math.PI) / 180;
    return (
      <g fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
        <circle cx={32} cy={32} r={24} />
        <path d={`M32 32L${32 + 15 * Math.sin(a)} ${32 - 15 * Math.cos(a)}`} />
        <path d="M32 32L32 20" />
      </g>
    );
  }
  if (kind === 'question') {
    // Magnifier: a search runs for each question.
    return (
      <g fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
        <circle cx={27} cy={27} r={16} />
        <path d="M39 39L54 54" />
      </g>
    );
  }
  // Review: a check in a circle.
  return (
    <g fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={32} cy={32} r={24} />
      <path d="M21 33L29 41L44 24" />
    </g>
  );
};

// Top-right status pill. "app" marks the AI product acting (not the model); "stream" marks streaming output;
// "ahead" and "question" name the two phases of retrieval; "review" marks checking an answer.
export const StatusBadge: React.FC<{kind: BadgeKind; opacity: number; frame: number}> = ({kind, opacity, frame}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const color = kind === 'app' ? COLORS.purple : COLORS.cyan;
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
        fontSize: 22,
        letterSpacing: '0.14em',
        color: COLORS.white,
        whiteSpace: 'nowrap',
      }}
    >
      <svg width={40} height={40} viewBox="0 0 64 64">
        {kind === 'app' ? (
          <Gear x={32} y={32} size={56} angle={frame * 2} color={color} />
        ) : kind !== 'stream' ? (
          <BadgeIcon kind={kind} color={color} frame={frame} />
        ) : (
          [0, 1, 2].map((i) => {
            const h = 14 + 22 * (0.5 + 0.5 * Math.sin(frame / 4 + i * 1.6));
            return <rect key={i} x={12 + i * 16} y={32 - h / 2} width={9} height={h} rx={4} fill={color} />;
          })
        )}
      </svg>
      {BADGE_TEXT[kind]}
    </div>
  );
};

// Gear + "THE APP": shown whenever the product around the model does the work.
export const AppMarker: React.FC<{x: number; y: number; opacity: number; frame: number}> = ({x, y, opacity, frame}) =>
  opacity > 0.001 ? (
    <g opacity={opacity}>
      <Gear x={x} y={y} size={52} angle={frame * 2} color={COLORS.purple} />
      <Caption x={x + 40} y={y} text="THE APP" anchor="start" color={COLORS.purple} size={22} />
    </g>
  ) : null;

// Rounded prompt bar with a typewriter and a blinking cursor.
export const PromptBar: React.FC<{
  x: number;
  y: number;
  width?: number;
  text: string;
  chars: number;
  opacity: number;
  frame: number;
  cursor?: boolean;
}> = ({x, y, width = 980, text, chars, opacity, frame, cursor = true}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const typed = Math.max(0, Math.floor(chars));
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - 48,
        width,
        height: 96,
        boxSizing: 'border-box',
        borderRadius: 48,
        border: `2px solid ${COLORS.cyan}`,
        background: rgba(COLORS.charcoal, 0.92),
        boxShadow: `0 0 32px ${rgba(COLORS.cyan, 0.25)}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 44px',
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 38,
        color: COLORS.white,
        opacity,
        whiteSpace: 'nowrap',
      }}
    >
      {text.slice(0, typed)}
      {cursor ? <span style={{display: 'inline-block', width: 3, height: 44, marginLeft: 4, background: COLORS.cyan, opacity: blink ? 1 : 0}} /> : null}
    </div>
  );
};

// Rough advance widths for Inter, for sizing token chips around live text. Generous on purpose:
// text is centred in its chip, so a slightly wide estimate only adds padding.
const NARROW = new Set([...'iljtfr.,:;!|\'"()[]{} I']);
export const textWidth = (text: string, size: number) =>
  [...text].reduce((w, c) => {
    if (c === ' ') return w + 0.28 * size;
    if (NARROW.has(c)) return w + 0.34 * size;
    if (c === 'm' || c === 'w' || c === 'M' || c === 'W') return w + 0.86 * size;
    if (c >= 'A' && c <= 'Z') return w + 0.7 * size;
    return w + 0.6 * size;
  }, 0);
