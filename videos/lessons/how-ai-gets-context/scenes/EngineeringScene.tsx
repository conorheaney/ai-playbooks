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
import {centredRow} from '../../../shared/lib/row';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {Stamp} from '../components/Parts';
import {CAPACITY, ROW_GAP, TANK_HOME} from '../layout';
import {ENGINEERING as E, SCENES} from '../timing';

const CARD = {w: 340, h: 90};
// A little lower and shorter than home, so the readout clears the status badge.
const TANK_SIZE = {w: TANK_HOME.w, y: 600, h: 700};
const GATE_SIZE = {y: 560, w: 140, h: 600};
const STOPS = ['SELECT', 'ORDER', 'FIT'];
const STOP_Y = [380, 560, 740];
// The row, left to right: LEFT OUT (opens on "in order"), the cards (a loose pool, then an ordered column that
// empties through the gate), the gate, and the window (wider once its slice labels show on its right).
// Left-out material is vertically centred on the same line as the ordered column and the gate.
const POOL_W = 420;
// Tall enough for each card's reason stamp, which sits on the card's top edge.
const ZONE = {y: 396, w: 380, h: 308};
const LABELS_W = 290;
const POOL_CENTRE = 400; // the pool positions below are laid out around this x

type Item = {
  label: string;
  text: string;
  pool: {x: number; y: number};
  // Selected material: its place in the stack (0 = bottom) and its slice of the window.
  keep?: {stack: number; kind: SegKind; slice: [number, number]; tankLabel: string};
  // Left-out material: why, when it's rejected, and its place in the LEFT OUT column.
  reject?: {reason: string; at: number; y: number};
};

// The pool, top to bottom as it first appears (unsorted).
const ITEMS: Item[] = [
  {label: 'YOUR MESSAGE', text: 'Which hotels fit the policy?', pool: {x: 430, y: 250}, keep: {stack: 4, kind: 'message', slice: [0.54, 0.58], tankLabel: 'YOUR MESSAGE'}},
  {label: 'DOCUMENT', text: 'travel-policy-2019.pdf', pool: {x: 370, y: 350}, reject: {reason: 'OUTDATED', at: E.outdated, y: 485}},
  {label: 'SYSTEM INSTRUCTIONS', text: 'You are a travel assistant.', pool: {x: 420, y: 450}, keep: {stack: 0, kind: 'instructions', slice: [0, 0.06], tankLabel: 'SYSTEM INSTRUCTIONS'}},
  {label: 'EMAIL', text: '"Is the limit $400 now?"', pool: {x: 380, y: 550}, reject: {reason: 'CONFLICTS WITH POLICY', at: E.conflicting, y: 635}},
  {label: 'CHAT HISTORY', text: 'Canberra, 5 days in March…', pool: {x: 440, y: 650}, keep: {stack: 1, kind: 'history', slice: [0.06, 0.2], tankLabel: 'CONVERSATION HISTORY'}},
  {label: 'DOCUMENT', text: 'hotel-options.md', pool: {x: 360, y: 750}, keep: {stack: 3, kind: 'documents', slice: [0.36, 0.54], tankLabel: 'HOTEL OPTIONS'}},
  {label: 'DOCUMENT', text: 'travel-policy-2025.pdf', pool: {x: 410, y: 850}, keep: {stack: 2, kind: 'documents', slice: [0.2, 0.36], tankLabel: 'POLICY 2025'}},
];

const orderedY = (stack: number) => 360 + (4 - stack) * 100;

type Row = {zoneX: number; cardsX: number};
const poolX = (it: Item, row: Row) => row.cardsX + it.pool.x - POOL_CENTRE;

// Where a left-out card sits at this frame: aside on "in order", then a damped shake when it's rejected.
const rejectPos = (it: Item, row: Row, order: number, frame: number) => {
  const r = it.reject!;
  const hit = frame - r.at;
  const shake = hit >= 0 ? Math.sin(hit * 1.7) * 16 * Math.exp(-hit / 6) : 0;
  return {x: lerp(poolX(it, row), row.zoneX, order) + shake, y: lerp(it.pool.y, r.y, order)};
};

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
  // During FIT the other two stops step back, so the cards passing the gate don't cross bright labels.
  const fitFocus = presence(frame, E.fit - 4, E.fit + 66, 8, 12);
  const stopOpacity = (i: number) => (i === 2 ? 1 : lerp(1, 0.4, fitFocus));
  const zone = smooth(E.outdated - 8, 14);

  // The card column closes up once its last card has left for the gate.
  const lastLeaves = E.fit + (ITEMS.filter((it) => it.keep).length - 1) * E.fitStep;
  const lastThrough = lastLeaves + E.fitTravel;
  const labelsIn = interpolate(frame, [E.fit + E.fitTravel - 6, E.fit + E.fitTravel + 12], [0, 1], ease);
  const [zoneX, cardsX, gateX, tankX] = centredRow(
    [
      {w: ZONE.w, p: order},
      {w: lerp(POOL_W, CARD.w, order), p: smooth(E.pool[0], 14) * interpolate(frame, [lastLeaves, lastThrough], [1, 0], ease)},
      {w: GATE_SIZE.w, p: gateDraw},
      {w: TANK_SIZE.w + LABELS_W * labelsIn, p: tankDraw, anchor: TANK_SIZE.w / 2},
    ],
    ROW_GAP,
  );
  const row: Row = {zoneX, cardsX};
  const TANK = {...TANK_SIZE, x: tankX};
  const GATE = {...GATE_SIZE, x: gateX};

  const fitT = (stack: number) => interpolate(frame, [E.fit + stack * E.fitStep, E.fit + stack * E.fitStep + E.fitTravel], [0, 1], ease);
  const kept = ITEMS.filter((it) => it.keep);
  const segments: Segment[] = kept.map((it) => {
    const k = it.keep!;
    // The slice appears as its card arrives (the card fades into it), with no landing box in the window.
    const landed = interpolate(fitT(k.stack), [0.72, 0.95], [0, 1], clampOpts);
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
            <g key={s} opacity={gateDraw * stopOpacity(i)}>
              <rect x={GATE.x - 58} y={STOP_Y[i] - 22} width={116} height={44} rx={22} fill={rgba(COLORS.purple, 0.12 + 0.75 * stopLit[i])} stroke={rgba(COLORS.purple, 0.8)} strokeWidth={2} />
              <Caption x={GATE.x} y={STOP_Y[i]} text={s} color={stopLit[i] > 0.5 ? COLORS.white : rgba(COLORS.white, 0.75)} size={17} />
            </g>
          ))}
          {[0, 1].map((i) => (
            <path key={i} d={`M${GATE.x} ${STOP_Y[i] + 28}V${STOP_Y[i + 1] - 28}`} stroke={rgba(COLORS.purple, 0.6)} strokeWidth={3} strokeDasharray="4 6" opacity={gateDraw} />
          ))}
        </g>
        <AppMarker x={GATE.x - 40} y={GATE.y - GATE.h / 2 - 74} opacity={app} frame={frame} />

        <ContextTank
          id="gc-e-tank"
          {...TANK}
          draw={tankDraw}
          opacity={tankDraw > 0 ? 1 : 0}
          segments={segments}
          labels={1}
          readout={{tokens: used * CAPACITY, capacity: CAPACITY, opacity: tankDraw}}
        />

        {zone > 0.001 ? (
          <g opacity={zone}>
            <rect x={zoneX - ZONE.w / 2} y={ZONE.y} width={ZONE.w} height={ZONE.h} rx={22} fill={rgba(COLORS.error, 0.05)} stroke={rgba(COLORS.error, 0.55)} strokeWidth={2} strokeDasharray="10 8" />
            <Caption x={zoneX} y={ZONE.y - 26} text="LEFT OUT" color={COLORS.error} size={20} />
          </g>
        ) : null}
      </svg>

      {ITEMS.map((it, i) => {
        const appear = smooth(E.pool[0] + i * 4, 14);
        let x = poolX(it, row);
        let y = it.pool.y;
        let w = CARD.w;
        let h = CARD.h;
        let radius = 18;
        let border = rgba(COLORS.white, 0.5);
        let fill = rgba(COLORS.charcoal, 0.92);
        let opacity = appear;
        let content = 1;
        let glow: string | undefined;
        let strike = 0;

        if (it.keep) {
          const k = it.keep;
          const selected = smooth(E.select + k.stack * E.selectStep, 8);
          border = selected > 0.5 ? COLORS.cyan : border;
          fill = selected > 0.5 ? `linear-gradient(${rgba(COLORS.cyan, 0.15)}, ${rgba(COLORS.cyan, 0.15)}), ${rgba(COLORS.charcoal, 0.92)}` : fill;
          x = lerp(x, cardsX, order);
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
            opacity = interpolate(t, [0.72, 0.95], [1, 0], clampOpts);
          }
        } else if (it.reject) {
          const r = it.reject;
          ({x, y} = rejectPos(it, row, order, frame));
          // Passed over at SELECT (dimmed); on its word it flashes red, shakes and is struck through.
          const dim = interpolate(frame, [E.select, E.select + 12], [1, 0.6], clampOpts);
          const flash = interpolate(frame, [r.at, r.at + 3, r.at + 26], [0, 1, 0.35], clampOpts);
          if (frame >= r.at) {
            border = COLORS.error;
            fill = rgba(COLORS.error, 0.08);
            glow = `0 0 ${12 + 28 * flash}px ${rgba(COLORS.error, 0.25 + 0.45 * flash)}`;
          }
          strike = interpolate(frame, [r.at + 4, r.at + 14], [0, 1], ease);
          opacity = appear * (frame < r.at ? dim : interpolate(frame, [r.at, r.at + 24], [1, 0.8], clampOpts));
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
              boxShadow: glow,
              padding: '14px 20px',
              fontFamily: FONT,
              color: COLORS.white,
              overflow: 'hidden',
              opacity,
              transform: `translateX(${(1 - appear) * -30}px)`,
            }}
          >
            <div style={{opacity: content}}>
              <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: border === COLORS.cyan ? COLORS.cyan : rgba(COLORS.white, 0.7), marginBottom: 6, whiteSpace: 'nowrap'}}>{it.label}</div>
              <div style={{fontSize: 21, fontWeight: 500, whiteSpace: 'nowrap'}}>
                <span style={{position: 'relative', display: 'inline-block'}}>
                  {it.text}
                  {strike > 0 ? <span style={{position: 'absolute', left: -4, top: '52%', height: 3, width: `calc((100% + 8px) * ${strike})`, borderRadius: 2, background: COLORS.error}} /> : null}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Stamps ride on the left-out cards' top edges, clear of their text, at full strength while the cards dim. */}
      {ITEMS.filter((it) => it.reject).map((it) => {
        const r = it.reject!;
        const {x, y} = rejectPos(it, row, order, frame);
        return (
          <Stamp key={r.reason} x={x + 40} y={y - CARD.h / 2 - 12} text={r.reason} size={19} progress={spring({frame: frame - r.at, fps, config: {damping: 12, stiffness: 170}})} />
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
