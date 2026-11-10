import React from 'react';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';
import {BOOKING_REF, PORTAL_ROW} from '../layout';
import {MarkAt} from './Parts';

export type DockIcon = 'file' | 'search' | 'portal';

const Icon: React.FC<{kind: DockIcon; color: string}> = ({kind, color}) => (
  <svg width={56} height={56} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    {kind === 'file' ? (
      <>
        <path d="M14 6H40L52 18V58H14Z" />
        <path d="M40 6V18H52" />
        <path d="M22 32H44M22 42H44M22 50H36" strokeWidth={4} />
      </>
    ) : kind === 'search' ? (
      <>
        <circle cx={27} cy={27} r={17} />
        <path d="M40 40L56 56" />
      </>
    ) : (
      <>
        <rect x={8} y={12} width={48} height={44} rx={6} />
        <path d="M8 26H56M20 6V16M44 6V16" />
        <path d="M22 40L29 47L42 34" strokeWidth={4} />
      </>
    )}
  </svg>
);

// A system in the world that a tool reaches. `scan` (0..1) sweeps a scan line across it while it runs.
export const Dock: React.FC<{x: number; y: number; name: string; icon: DockIcon; w?: number; h?: number; opacity?: number; scan?: number; glow?: number; scale?: number}> = ({
  x,
  y,
  name,
  icon,
  w = 380,
  h = 120,
  opacity = 1,
  scan = -1,
  glow = 0,
  scale = 1,
}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        boxSizing: 'border-box',
        transform: `scale(${scale})`,
        borderRadius: 18,
        border: `2px solid ${glow > 0.05 ? COLORS.cyan : rgba(COLORS.white, 0.55)}`,
        background: rgba(COLORS.charcoal, 0.94),
        boxShadow: glow > 0 ? `0 0 ${34 * glow}px ${rgba(COLORS.cyan, 0.45 * glow)}` : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '0 28px',
        overflow: 'hidden',
        opacity,
        fontFamily: FONT,
      }}
    >
      <Icon kind={icon} color={glow > 0.05 ? COLORS.cyan : rgba(COLORS.white, 0.85)} />
      <div style={{fontSize: 26, fontWeight: 700, letterSpacing: '0.06em', color: COLORS.white, whiteSpace: 'nowrap'}}>{name}</div>
      {scan >= 0 && scan <= 1 ? (
        <div style={{position: 'absolute', top: 0, bottom: 0, left: scan * w - 3, width: 6, background: COLORS.cyan, boxShadow: `0 0 24px ${COLORS.cyan}`}} />
      ) : null}
    </div>
  ) : null;

// The travel portal's booking card: NOT BOOKED until the harness lets a confirmed booking through.
export const PortalCard: React.FC<{x: number; y: number; w?: number; opacity?: number; scale?: number; booked?: number; pulse?: number}> = ({
  x,
  y,
  w = 400,
  opacity = 1,
  scale = 1,
  booked = 0,
  pulse = 0,
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
        padding: '20px 26px 24px',
        borderRadius: 20,
        border: `2px solid ${booked > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.55)}`,
        background: rgba(COLORS.charcoal, 0.95),
        boxShadow: booked > 0 ? `0 0 ${40 * booked}px ${rgba(COLORS.cyan, 0.4 * booked)}` : undefined,
        opacity,
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <Icon kind="portal" color={rgba(COLORS.white, 0.85)} />
        <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: rgba(COLORS.white, 0.85)}}>TRAVEL PORTAL</div>
      </div>
      <div style={{fontSize: 26, fontWeight: 500, marginTop: 14, whiteSpace: 'nowrap'}}>{PORTAL_ROW}</div>
      <div style={{position: 'relative', height: 50, marginTop: 14}}>
        {/* NOT BOOKED */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '6px 18px',
            borderRadius: 26,
            border: `2px solid ${rgba(COLORS.white, 0.6 + 0.4 * pulse)}`,
            transform: `scale(${1 + 0.08 * pulse})`,
            transformOrigin: '0 50%',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: rgba(COLORS.white, 0.75 + 0.25 * pulse),
            opacity: 1 - booked,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{width: 22, height: 22, borderRadius: 4, border: `2px solid ${rgba(COLORS.white, 0.75)}`}} />
          NOT BOOKED
        </div>
        {/* BOOKED */}
        {booked > 0.001 ? (
          <div style={{position: 'absolute', left: 0, top: 0, display: 'flex', alignItems: 'center', gap: 16, opacity: booked, whiteSpace: 'nowrap'}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 18px 6px 10px',
                borderRadius: 26,
                background: rgba(COLORS.cyan, 0.18),
                border: `2px solid ${COLORS.cyan}`,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: COLORS.cyan,
                position: 'relative',
              }}
            >
              <div style={{position: 'relative', width: 30, height: 30}}>
                <MarkAt x={15} y={15} ok scale={booked} size={30} />
              </div>
              BOOKED
            </div>
            <div style={{fontSize: 24, fontWeight: 500, color: rgba(COLORS.white, 0.85)}}>{BOOKING_REF}</div>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
