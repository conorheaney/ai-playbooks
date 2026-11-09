import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {ContextTank, SEGMENT_STYLE, SegKind, Segment, segmentRect} from '../../../shared/components/context/ContextTank';
import {AppMarker, StatusBadge} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {Stamp} from '../components/Parts';
import {CAPACITY, TANK_HOME} from '../layout';
import {ENGINEERING as E, SCENES} from '../timing';

const CARD = {w: 340, h: 90};
// A little lower and shorter than home, so the readout clears the status badge.
const TANK = {...TANK_HOME, y: 600, h: 700};
const GATE = {x: 860, y: 560, w: 140, h: 600};
const STOPS = ['SELECT', 'ORDER', 'FIT'];
const STOP_Y = [380, 560, 740];
const ORDER_X = 600;
const REJECT_X = 260;
const TRAY = {x: 90, y: 885, w: 660, h: 110};

type Item = {
  label: string;
  text: string;
  pool: {x: number; y: number};
  // Selected material: its place in the stack (0 = bottom) and its slice of the window.
  keep?: {stack: number; kind: SegKind; slice: [number, number]; tankLabel: string};
  // Left-out material: why, and where it rests in the tray.
  reject?: {reason: string; at: number; tray: {x: number; y: number}};
};

// The pool, top to bottom as it first appears (unsorted).
const ITEMS: Item[] = [
  {label: 'YOUR PROMPT', text: 'Which hotels fit the policy?', pool: {x: 430, y: 250}, keep: {stack: 4, kind: 'message', slice: [0.54, 0.58], tankLabel: 'YOUR MESSAGE'}},
  {label: 'DOCUMENT', text: 'travel-policy-2019.pdf', pool: {x: 370, y: 350}, reject: {reason: 'OUTDATED', at: E.outdated, tray: {x: 260, y: 940}}},
  {label: 'SYSTEM INSTRUCTIONS', text: 'You are a travel assistant.', pool: {x: 420, y: 450}, keep: {stack: 0, kind: 'instructions', slice: [0, 0.06], tankLabel: 'SYSTEM INSTRUCTIONS'}},
  {label: 'EMAIL', text: '"Is the limit $400 now?"', pool: {x: 380, y: 550}, reject: {reason: 'CONFLICTS WITH POLICY', at: E.conflicting, tray: {x: 580, y: 940}}},
  {label: 'CHAT HISTORY', text: 'Canberra, 5 days in March…', pool: {x: 440, y: 650}, keep: {stack: 1, kind: 'history', slice: [0.06, 0.2], tankLabel: 'CONVERSATION HISTORY'}},
  {label: 'DOCUMENT', text: 'hotel-options.md', pool: {x: 360, y: 750}, keep: {stack: 3, kind: 'documents', slice: [0.36, 0.54], tankLabel: 'HOTEL OPTIONS'}},
  {label: 'DOCUMENT', text: 'travel-policy-2025.pdf', pool: {x: 410, y: 850}, keep: {stack: 2, kind: 'documents', slice: [0.2, 0.36], tankLabel: 'POLICY 2025'}},
];

const orderedY = (stack: number) => 360 + (4 - stack) * 100;

export const EngineeringScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = SCENES.engineering.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const out = interpolate(frame, [E.out, dur], [1, 0], clampOpts);
  const tankDraw = interpolate(frame, [E.pool[0], E.pool[1]], [0, 1], ease);
  const gateDraw = interpolate(frame, [E.gate[0], E.gate[1]], [0, 1], ease);
  const order = interpolate(frame, [E.order, E.order + 16], [0, 1], ease);
  const app = presence(frame, E.appIn, dur, 12, 18);
  const stopLit = [presence(frame, E.select, E.order + 4, 6, 8), presence(frame, E.order, E.fit + 4, 6, 8), presence(frame, E.fit, E.fit + 60, 6, 12)];
  const tray = smooth(E.outdated - 6, 14);

  const fitT = (stack: number) => interpolate(frame, [E.fit + stack * E.fitStep, E.fit + stack * E.fitStep + E.fitTravel], [0, 1], ease);
  const kept = ITEMS.filter((it) => it.keep);
  const segments: Segment[] = kept.map((it) => {
    const k = it.keep!;
    const landed = fitT(k.stack) >= 1 ? 1 : 0;
    return {kind: k.kind, from: k.slice[0], to: k.slice[1], opacity: landed, label: k.tankLabel, labelOpacity: smooth(E.fit + k.stack * E.fitStep + E.fitTravel, 10)};
  });
  const used = kept.reduce((sum, it) => sum + (it.keep!.slice[1] - it.keep!.slice[0]) * interpolate(fitT(it.keep!.stack), [0.7, 1], [0, 1], clampOpts), 0);

  return (
    <AbsoluteFill style={{opacity: out}}>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* The context blueprint: select, order, fit. */}
        <g>
          <rect x={GATE.x - GATE.w / 2} y={GATE.y - GATE.h / 2} width={GATE.w} height={GATE.h} rx={22} fill={rgba(COLORS.purple, 0.07 * gateDraw)} stroke={COLORS.purple} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - gateDraw} />
          {STOPS.map((s, i) => (
            <g key={s} opacity={gateDraw}>
              <rect x={GATE.x - 58} y={STOP_Y[i] - 22} width={116} height={44} rx={22} fill={rgba(COLORS.purple, 0.12 + 0.75 * stopLit[i])} stroke={rgba(COLORS.purple, 0.8)} strokeWidth={2} />
              <Caption x={GATE.x} y={STOP_Y[i]} text={s} color={stopLit[i] > 0.5 ? COLORS.white : rgba(COLORS.white, 0.75)} size={17} />
            </g>
          ))}
          {[0, 1].map((i) => (
            <path key={i} d={`M${GATE.x} ${STOP_Y[i] + 28}V${STOP_Y[i + 1] - 28}`} stroke={rgba(COLORS.purple, 0.6)} strokeWidth={3} strokeDasharray="4 6" opacity={gateDraw} />
          ))}
        </g>
        <AppMarker x={GATE.x - 40} y={GATE.y - GATE.h / 2 - 44} opacity={app} frame={frame} />

        <ContextTank
          id="gc-e-tank"
          {...TANK}
          draw={tankDraw}
          opacity={tankDraw > 0 ? 1 : 0}
          segments={segments}
          labels={1}
          readout={{tokens: used * CAPACITY, capacity: CAPACITY, opacity: tankDraw}}
        />

        {tray > 0.001 ? (
          <g opacity={tray}>
            <rect x={TRAY.x} y={TRAY.y} width={TRAY.w} height={TRAY.h} rx={20} fill={rgba(COLORS.white, 0.03)} stroke={rgba(COLORS.white, 0.35)} strokeWidth={2} strokeDasharray="10 8" />
            <Caption x={TRAY.x + TRAY.w + 22} y={TRAY.y + TRAY.h / 2} text="LEFT OUT" anchor="start" color={rgba(COLORS.white, 0.7)} size={20} />
          </g>
        ) : null}
      </svg>

      {ITEMS.map((it, i) => {
        const appear = smooth(E.pool[0] + i * 4, 14);
        let x = it.pool.x;
        let y = it.pool.y;
        let w = CARD.w;
        let h = CARD.h;
        let radius = 18;
        let border = rgba(COLORS.white, 0.5);
        let fill = rgba(COLORS.charcoal, 0.92);
        let opacity = appear;
        let content = 1;

        if (it.keep) {
          const k = it.keep;
          const selected = smooth(E.select + k.stack * E.selectStep, 8);
          border = selected > 0.5 ? COLORS.cyan : border;
          x = lerp(x, ORDER_X, order);
          y = lerp(y, orderedY(k.stack), order);
          // Through the gate, then into its slice of the window.
          const t = fitT(k.stack);
          if (t >= 1) {
            return null;
          }
          if (t > 0) {
            const toGate = interpolate(t, [0, 0.4], [0, 1], clampOpts);
            const morph = interpolate(t, [0.4, 1], [0, 1], clampOpts);
            const r = segmentRect(TANK, k.slice[0], k.slice[1]);
            const gx = lerp(x, GATE.x, toGate);
            x = lerp(gx, r.x + r.w / 2, morph);
            y = lerp(y, r.y + r.h / 2, morph);
            w = lerp(CARD.w, r.w, morph);
            h = lerp(CARD.h, r.h, morph);
            radius = lerp(18, 4, morph);
            fill = morph > 0 ? SEGMENT_STYLE[k.kind].fill : fill;
            content = interpolate(t, [0.3, 0.55], [1, 0], clampOpts);
          }
        } else if (it.reject) {
          const r = it.reject;
          const dim = interpolate(frame, [E.select, E.select + 12], [1, 0.6], clampOpts);
          x = lerp(x, REJECT_X, order);
          const toTray = interpolate(frame, [r.at + 14, r.at + 34], [0, 1], ease);
          x = lerp(x, r.tray.x, toTray);
          y = lerp(y, r.tray.y, toTray);
          border = frame >= r.at ? rgba(COLORS.error, 0.8) : border;
          opacity = appear * dim * interpolate(toTray, [0, 1], [1, 0.58], clampOpts);
        }

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              boxSizing: 'border-box',
              borderRadius: radius,
              border: `2px solid ${border}`,
              background: fill,
              padding: '14px 20px',
              fontFamily: FONT,
              color: COLORS.white,
              overflow: 'hidden',
              opacity,
              transform: `translateX(${(1 - appear) * -30}px)`,
            }}
          >
            <div style={{opacity: content}}>
              <div style={{fontSize: 14, fontWeight: 700, letterSpacing: '0.18em', color: border === COLORS.cyan ? COLORS.cyan : rgba(COLORS.white, 0.7), marginBottom: 6, whiteSpace: 'nowrap'}}>{it.label}</div>
              <div style={{fontSize: 21, fontWeight: 500, whiteSpace: 'nowrap'}}>{it.text}</div>
            </div>
          </div>
        );
      })}

      {/* Stamps ride on the left-out cards, at full strength while the cards dim. */}
      {ITEMS.filter((it) => it.reject).map((it) => {
        const r = it.reject!;
        const toTray = interpolate(frame, [r.at + 14, r.at + 34], [0, 1], ease);
        const x = lerp(lerp(it.pool.x, REJECT_X, order), r.tray.x, toTray);
        const y = lerp(it.pool.y, r.tray.y, toTray);
        return (
          <Stamp key={r.reason} x={x + 30} y={y - 34} text={r.reason} size={19} progress={spring({frame: frame - r.at, fps, config: {damping: 12, stiffness: 170}})} />
        );
      })}

      <Pinned>
        <StatusBadge kind="app" opacity={app} frame={frame} />
      </Pinned>
      <Pinned>
        <SceneTitle text="CONTEXT ENGINEERING" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
