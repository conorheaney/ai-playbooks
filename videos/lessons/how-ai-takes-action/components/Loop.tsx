import React from 'react';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';
import {onCircle} from '../lib';
import {MarkAt} from './Parts';

// The agent loop: a ring, drawn clockwise from the top, with a station at each compass point.
export const Ring: React.FC<{cx: number; cy: number; r: number; draw: number; opacity?: number; color?: string; stations?: number[]; width?: number; chevrons?: boolean}> = ({
  cx,
  cy,
  r,
  draw,
  opacity = 1,
  color = COLORS.cyan,
  stations = [],
  width = 4,
  chevrons = true,
}) => {
  if (opacity <= 0.001 || draw <= 0.001) {
    return null;
  }
  const start = -90;
  const end = start + 359.9 * draw;
  const a = onCircle(cx, cy, r, start);
  const b = onCircle(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return (
    <g opacity={opacity}>
      <path d={`M${a.x} ${a.y} A${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      {/* Direction chevrons between stations. */}
      {chevrons
        ? [-45, 45, 135, 225].map((deg) => {
            if ((deg + 90) / 360 > draw) {
              return null;
            }
            const p = onCircle(cx, cy, r, deg);
            return (
              <path key={deg} d="M-8 -11L5 0L-8 11" transform={`translate(${p.x} ${p.y}) rotate(${deg + 90})`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            );
          })
        : null}
      {stations.map((s, i) => {
        const deg = -90 + i * 90;
        const p = onCircle(cx, cy, r, deg);
        return s > 0.01 ? <circle key={i} cx={p.x} cy={p.y} r={13 * s} fill={COLORS.charcoal} stroke={color} strokeWidth={4} /> : null;
      })}
    </g>
  );
};

// A glowing comet running around the ring; angle in degrees (clockwise, 0 = right).
export const Runner: React.FC<{cx: number; cy: number; r: number; angle: number; opacity?: number; color?: string}> = ({cx, cy, r, angle, opacity = 1, color = COLORS.cyan}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const head = onCircle(cx, cy, r, angle);
  return (
    <g opacity={opacity}>
      {Array.from({length: 8}, (_, i) => {
        const p = onCircle(cx, cy, r, angle - (i + 1) * 4);
        return <circle key={i} cx={p.x} cy={p.y} r={9 - i} fill={color} opacity={0.5 - i * 0.06} />;
      })}
      <circle cx={head.x} cy={head.y} r={20} fill={rgba(color, 0.25)} />
      <circle cx={head.x} cy={head.y} r={11} fill={color} />
    </g>
  );
};

export type StateRow = {text: React.ReactNode; on: number; strike?: number};

// The agent's state: its goal and what it has learnt so far. White, because it's the agent's own notes.
export const StateCard: React.FC<{x: number; y: number; w: number; goal: string; rows: StateRow[]; opacity?: number; flash?: number; scale?: number}> = ({
  x,
  y,
  w,
  goal,
  rows,
  opacity = 1,
  flash = 0,
  scale = 1,
}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        boxSizing: 'border-box',
        transform: `translate(-50%, -50%) scale(${scale})`,
        padding: '18px 24px 20px',
        borderRadius: 20,
        border: `2px solid ${rgba(COLORS.white, 0.6 + 0.4 * flash)}`,
        background: rgba(COLORS.charcoal, 0.95),
        boxShadow: flash > 0 ? `0 0 ${30 * flash}px ${rgba(COLORS.white, 0.35 * flash)}` : undefined,
        opacity,
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.16em', color: rgba(COLORS.white, 0.7)}}>GOAL</div>
      <div style={{fontSize: 26, fontWeight: 700, lineHeight: 1.25, marginTop: 4}}>{goal}</div>
      <div style={{height: 2, background: rgba(COLORS.white, 0.2), margin: '12px 0 8px'}} />
      {rows.map((r, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, height: 38, opacity: r.on, fontSize: 24, fontWeight: 500, whiteSpace: 'nowrap'}}>
          <div style={{position: 'relative', width: 30, height: 30, flex: 'none'}}>
            <MarkAt x={15} y={15} ok scale={r.on} size={30} />
          </div>
          <div>{r.text}</div>
        </div>
      ))}
    </div>
  ) : null;

// Text with a red strike-through that draws across it.
export const Struck: React.FC<{text: string; strike: number}> = ({text, strike}) => (
  <span style={{position: 'relative', color: strike > 0.5 ? COLORS.error : undefined}}>
    {text}
    <span style={{position: 'absolute', left: -4, top: '52%', height: 3, width: `calc(${strike * 100}% + 8px)`, background: COLORS.error, borderRadius: 2}} />
  </span>
);

// A purple fence (a rounded rectangle of posts) drawn on clockwise from the top-left.
export const Fence: React.FC<{cx: number; cy: number; w: number; h: number; draw: number; opacity?: number; gap?: {side: 'right'; from: number; to: number}}> = ({cx, cy, w, h, draw, opacity = 1, gap}) => {
  if (draw <= 0.001 || opacity <= 0.001) {
    return null;
  }
  const l = cx - w / 2;
  const t = cy - h / 2;
  const per = 2 * (w + h);
  // Posts every 52 px along the perimeter.
  const posts: {x: number; y: number}[] = [];
  for (let d = 0; d < per * draw; d += 52) {
    let x: number;
    let y: number;
    if (d < w) {
      x = l + d;
      y = t;
    } else if (d < w + h) {
      x = l + w;
      y = t + (d - w);
    } else if (d < 2 * w + h) {
      x = l + w - (d - w - h);
      y = t + h;
    } else {
      x = l;
      y = t + h - (d - 2 * w - h);
    }
    if (gap && Math.abs(x - (l + w)) < 1 && y > gap.from && y < gap.to) {
      continue;
    }
    posts.push({x, y});
  }
  const rails = (offset: number) => {
    // Rails between consecutive posts, skipping across the gap.
    const segs: string[] = [];
    for (let i = 1; i < posts.length; i++) {
      const a = posts[i - 1];
      const b = posts[i];
      if (Math.hypot(a.x - b.x, a.y - b.y) > 80) {
        continue;
      }
      segs.push(`M${a.x} ${a.y + offset}L${b.x} ${b.y + offset}`);
    }
    return segs.join('');
  };
  return (
    <g opacity={opacity}>
      <path d={rails(-6)} stroke={COLORS.purple} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d={rails(6)} stroke={COLORS.purple} strokeWidth={3} fill="none" strokeLinecap="round" />
      {posts.map((p, i) => (
        <rect key={i} x={p.x - 4} y={p.y - 14} width={8} height={28} rx={3} fill={COLORS.purple} />
      ))}
    </g>
  );
};

// A sign plate planted on the fence. `anchor` says which end of the plate sits at x: 'end' hangs it to the left,
// 'start' to the right; it pops from that end.
export const Sign: React.FC<{x: number; y: number; text: string; pop: number; color?: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, text, pop, color = COLORS.purple, anchor = 'middle'}) =>
  pop > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${anchor === 'start' ? '0%' : anchor === 'end' ? '-100%' : '-50%'}, -50%) scale(${pop})`,
        transformOrigin: anchor === 'start' ? '0 50%' : anchor === 'end' ? '100% 50%' : '50% 50%',
        padding: '8px 20px',
        borderRadius: 10,
        border: `3px solid ${color}`,
        background: rgba(COLORS.charcoal, 0.96),
        fontFamily: FONT,
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: '0.06em',
        color: COLORS.white,
        whiteSpace: 'nowrap',
        boxShadow: `0 6px 0 ${rgba(color, 0.5)}`,
      }}
    >
      {text}
    </div>
  ) : null;
