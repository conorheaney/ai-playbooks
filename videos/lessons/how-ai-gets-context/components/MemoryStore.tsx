import React from 'react';
import {Caption} from '../../../shared/components/People';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';

const DRAWER_H = 88;
const DRAWER_GAP = 12;
const PAD = 20;
export const STORE = {w: 380, h: PAD * 2 + DRAWER_H * 3 + DRAWER_GAP * 2};

// What the store already holds, by drawer. The last drawer receives the new memory.
export const STORED = ['Home airport: Sydney', 'Prefers aisle seats'];
export const NEW_MEMORY = 'Prefers hotels near Parliament House';

// Centre of drawer i for a store centred on (x, y) at the given scale.
export const drawerCenter = (x: number, y: number, scale: number, i: number) => ({
  x,
  y: y - (STORE.h * scale) / 2 + (PAD + i * (DRAWER_H + DRAWER_GAP) + DRAWER_H / 2) * scale,
});

// The app's memory store: a purple cabinet of three drawers, each holding one memory.
export const MemoryStore: React.FC<{
  x: number;
  y: number;
  scale?: number;
  draw?: number;
  opacity?: number;
  newMemory?: number; // 0..1 the new memory showing in the last drawer
  open?: number; // 0..1 the last drawer pulled out
  lifted?: number; // 0..1 the new memory lifted out of its drawer (hidden here)
}> = ({x, y, scale = 1, draw = 1, opacity = 1, newMemory = 0, open = 0, lifted = 0}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const w = STORE.w * scale;
  const h = STORE.h * scale;
  const left = x - w / 2;
  const top = y - h / 2;
  const texts = [...STORED, NEW_MEMORY];
  return (
    <g opacity={opacity}>
      <rect x={left} y={top} width={w} height={h} rx={18 * scale} fill={rgba(COLORS.purple, 0.06)} stroke={COLORS.purple} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
      <Caption x={x} y={top - 30} text="MEMORY STORE" color={COLORS.purple} size={22 * Math.max(0.85, scale)} opacity={draw} />
      <g opacity={draw}>
        {texts.map((text, i) => {
          const c = drawerCenter(x, y, scale, i);
          const isNew = i === texts.length - 1;
          const dx = isNew ? 40 * scale * open : 0;
          const textOpacity = isNew ? newMemory * (1 - lifted) : 0.55;
          return (
            <g key={i} transform={`translate(${dx} 0)`}>
              <rect x={left + 16 * scale} y={c.y - (DRAWER_H * scale) / 2} width={w - 32 * scale} height={DRAWER_H * scale} rx={10 * scale} fill={rgba(COLORS.charcoal, 0.95)} stroke={rgba(COLORS.purple, isNew && open > 0 ? 1 : 0.6)} strokeWidth={2} />
              <rect x={x - 26 * scale} y={c.y + (DRAWER_H * scale) / 2 - 16 * scale} width={52 * scale} height={6 * scale} rx={3 * scale} fill={rgba(COLORS.purple, 0.7)} />
              {textOpacity > 0.001 ? (
                <text x={x} y={c.y - 6 * scale} fill={isNew ? COLORS.white : rgba(COLORS.white, 1)} opacity={textOpacity} fontFamily={FONT} fontWeight={500} fontSize={Math.max(16, 18 * scale)} textAnchor="middle" dominantBaseline="central">
                  {text}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </g>
  );
};
