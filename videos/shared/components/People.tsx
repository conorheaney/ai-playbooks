import React from 'react';
import {FONT} from '../fonts';
import {COLORS, rgba} from '../theme';

// Everywhere a person is part of the process, they appear on screen as this figure.
const HEAD = {cx: 32, cy: 19, r: 12};
const BODY = 'M10 60C10 44 20 35 32 35C44 35 54 44 54 60Z';

export const Person: React.FC<{x: number; y: number; size?: number; color?: string; opacity?: number}> = ({
  x,
  y,
  size = 72,
  color = COLORS.purple,
  opacity = 1,
}) => (
  <g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 64})`} opacity={opacity}>
    <circle {...HEAD} fill={color} />
    <path d={BODY} fill={color} />
  </g>
);

// Small uppercase SVG label.
export const Caption: React.FC<{
  x: number;
  y: number;
  text: string;
  opacity?: number;
  color?: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
}> = ({x, y, text, opacity = 1, color = rgba(COLORS.white, 0.7), size = 20, anchor = 'middle'}) => (
  <text
    x={x}
    y={y}
    fill={color}
    opacity={opacity}
    fontFamily={FONT}
    fontWeight={700}
    fontSize={size}
    letterSpacing="0.16em"
    textAnchor={anchor}
    dominantBaseline="central"
  >
    {text}
  </text>
);

const GEAR_TEETH = Array.from({length: 8}, (_, i) => i * 45);

export const Gear: React.FC<{x: number; y: number; size: number; angle: number; color?: string}> = ({x, y, size, angle, color = COLORS.cyan}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size / 64})`} fill={color}>
    {GEAR_TEETH.map((a) => (
      <rect key={a} x={-5} y={-30} width={10} height={14} rx={2} transform={`rotate(${a})`} />
    ))}
    <circle r={19} />
    <circle r={8} fill={COLORS.charcoal} />
  </g>
);

// Top-right status pill: whether people or automated checks are driving the current stage.
export const LoopBadge: React.FC<{kind: 'human' | 'auto'; opacity: number}> = ({kind, opacity}) => {
  const color = kind === 'human' ? COLORS.purple : COLORS.cyan;
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
        {kind === 'human' ? (
          <>
            <circle {...HEAD} fill={color} />
            <path d={BODY} fill={color} />
          </>
        ) : (
          <Gear x={32} y={32} size={56} angle={0} color={color} />
        )}
      </svg>
      {kind === 'human' ? 'HUMANS IN THE LOOP' : 'AUTOMATED CHECKS'}
    </div>
  );
};
