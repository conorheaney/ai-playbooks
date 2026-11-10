import React from 'react';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';
import {GATE, WALL} from '../layout';
import {GearMark, MarkAt} from './Parts';

// The wall: the model's side on the left, the world on the right. Only tickets and receipts pass, through the gate.
export const WallLine: React.FC<{draw: number; opacity?: number; flash?: number}> = ({draw, opacity = 1, flash = 0}) =>
  opacity > 0.001 && draw > 0.001 ? (
    <g opacity={opacity}>
      {/* Above and below the gate. */}
      <line x1={WALL.x} x2={WALL.x} y1={WALL.top} y2={WALL.top + (GATE.y - GATE.h / 2 - WALL.top) * Math.min(1, draw * 2)} stroke={COLORS.purple} strokeWidth={4} strokeDasharray="14 10" strokeLinecap="round" />
      {draw > 0.5 ? (
        <line
          x1={WALL.x}
          x2={WALL.x}
          y1={GATE.y + GATE.h / 2}
          y2={GATE.y + GATE.h / 2 + (WALL.bottom - GATE.y - GATE.h / 2) * Math.min(1, (draw - 0.5) * 2)}
          stroke={flash > 0.01 ? COLORS.error : COLORS.purple}
          strokeWidth={4}
          strokeDasharray="14 10"
          strokeLinecap="round"
        />
      ) : null}
    </g>
  ) : null;

// The gate panel (SVG part): outline, faint fill and the gear on its top edge.
export const GatePanel: React.FC<{opacity: number; frame: number; gear: number; label?: string; glow?: number}> = ({opacity, frame, gear, label = 'THE APP', glow = 0}) =>
  opacity > 0.001 ? (
    <g opacity={opacity}>
      <rect
        x={GATE.x - GATE.w / 2}
        y={GATE.y - GATE.h / 2}
        width={GATE.w}
        height={GATE.h}
        rx={22}
        fill={rgba(COLORS.purple, 0.08 + 0.12 * glow)}
        stroke={COLORS.purple}
        strokeWidth={3}
      />
      <circle cx={GATE.x} cy={GATE.y - GATE.h / 2} r={38} fill={COLORS.charcoal} opacity={gear} />
      <GearMark x={GATE.x} y={GATE.y - GATE.h / 2} frame={frame} opacity={gear} label={label} labelAt="above" size={56} />
    </g>
  ) : null;

const CHECKS = ['TOOL EXISTS', 'INPUTS VALID', 'ALLOWED'];

// The gate's check lights (HTML part).
export const CheckLights: React.FC<{lights: number[]; opacity?: number}> = ({lights, opacity = 1}) =>
  opacity > 0.001 ? (
    <>
      {CHECKS.map((c, i) =>
        (lights[i] ?? 0) > 0.01 ? (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: GATE.x - GATE.w / 2 + 22,
              top: GATE.y - 20 + i * 55,
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              opacity: Math.min(1, lights[i] * 1.5) * opacity,
              fontFamily: FONT,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: COLORS.white,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{position: 'relative', width: 34, height: 34}}>
              <MarkAt x={17} y={17} ok scale={lights[i]} size={34} />
            </div>
            {c}
          </div>
        ) : null,
      )}
    </>
  ) : null;
