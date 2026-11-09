import React from 'react';
import {FONT} from '../fonts';
import {COLORS, rgba} from '../theme';

export const CHECK_PATH = 'M-10 0L-3 7L10 -7';
export const CROSS_PATH = 'M-8 -8L8 8M8 -8L-8 8';

// Round ✓ / ✕ badge, drawn in a -26..26 box.
export const Mark: React.FC<{ok: boolean}> = ({ok}) => (
  <>
    <circle r={24} fill={ok ? COLORS.cyan : COLORS.error} />
    <path d={ok ? CHECK_PATH : CROSS_PATH} stroke={COLORS.charcoal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

type BubbleProps = {
  x: number;
  y: number;
  width: number;
  text: string;
  chars?: number; // typewriter progress; omitted = full text
  label?: string;
  color?: string;
  opacity?: number;
  scale?: number;
  mark?: 'ok' | 'bad';
  markScale?: number;
  fontSize?: number;
};

// HTML text card centred on (x, y). The untyped remainder is laid out invisibly, so the card
// keeps its final size while typing instead of growing line by line.
export const Bubble: React.FC<BubbleProps> = ({
  x,
  y,
  width,
  text,
  chars,
  label,
  color = COLORS.cyan,
  opacity = 1,
  scale = 1,
  mark,
  markScale = 0,
  fontSize = 30,
}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const typed = chars === undefined ? text.length : Math.max(0, Math.floor(chars));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        boxSizing: 'border-box',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        padding: '18px 26px',
        borderRadius: 24,
        border: `2px solid ${color}`,
        background: rgba(COLORS.charcoal, 0.92),
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      {label ? (
        <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color, marginBottom: 8}}>{label}</div>
      ) : null}
      <div style={{fontSize, fontWeight: 500, lineHeight: 1.3}}>
        {text.slice(0, typed)}
        <span style={{opacity: 0}}>{text.slice(typed)}</span>
      </div>
      {mark ? (
        <svg
          width={52}
          height={52}
          viewBox="-26 -26 52 52"
          style={{position: 'absolute', right: -18, top: -18, transform: `scale(${markScale})`}}
        >
          <Mark ok={mark === 'ok'} />
        </svg>
      ) : null}
    </div>
  );
};
