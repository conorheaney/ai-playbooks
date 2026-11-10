import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mark} from '../../../shared/components/Bubble';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {ContextTank, SEGMENT_STYLE, segmentRect} from '../../../shared/components/context/ContextTank';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {centredRow} from '../../../shared/lib/row';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {FlowLine} from '../components/Parts';
import {CUBE_HOME, CUBE_W, ROW_GAP} from '../layout';
import {SCENES, WEIGHTS as W} from '../timing';

const ICE = '#D8FDFF';
const TANK_SIZE = {y: 560, w: 300, h: 640};
const CARD = {w: 340, h: 110};
const SLICE = 0.14;
// The row: the cube (wider while the frozen weights orbit it), the middle where the blocked cards rest, and the
// context window. The middle keeps its width after the cards drop into the window, so the flow line has room and
// the cube and window stay well apart; the cube never slides back.
const ORBIT_EXTRA = 420; // extra width the orbiting weights add to the cube's area

// Information the frozen weights can't contain, in VO order.
const CARDS = [
  {label: 'YOUR FILES', text: 'batch-records.xlsx', y: 400},
  {label: 'COMPANY RULES', text: 'supplier-policy-2025.pdf', y: 540},
  {label: "TODAY'S NEWS", text: 'New guidance released', y: 680},
];

// The frozen weights from how-ai-trains, perfectly still around the cube.
const RINGS = [-80, 0, 80];
const PER_RING = 7;
const ORBIT = {rx: 330, ry: 56};
const NUMBERS = RINGS.flatMap((lift, ring) =>
  Array.from({length: PER_RING}, (_, j) => {
    const i = ring * PER_RING + j;
    const a = (j / PER_RING) * Math.PI * 2 + (ring * Math.PI) / PER_RING + 0.4;
    return {a, lift, value: ((random(`gc-weights-${i}`) - 0.5) * 4).toFixed(2)};
  }),
);
// The bounce ✕ sits just outside the cube's right edge (its centre this far right of the cube's centre).
const MARK_DX = 150;
// Offsets from the cube's centre, with each value's half-width at its depth's font size. A value is left out if it
// would touch the cube (whose left side reaches further, at this yaw) or the ✕ beside its right edge, and where two
// would crowd each other the farther one is left out, so the frozen weights never overlap the cube, the ✕ or each
// other (the same filter as how-ai-responds Scene 5).
const CLEAR = {left: 160, right: MARK_DX + 24 + 10};
const fontSizeAt = (depth: number) => 18 + 12 * ((depth + 1) / 2);
const OFFSETS = NUMBERS.map((n) => {
  const depth = Math.sin(n.a);
  return {dx: Math.cos(n.a) * ORBIT.rx, dy: depth * ORBIT.ry + n.lift, depth, half: n.value.length * 0.3 * fontSizeAt(depth)};
});
const clearOfCube = (o: (typeof OFFSETS)[number]) => (o.dx >= 0 ? o.dx - o.half >= CLEAR.right : -o.dx - o.half >= CLEAR.left);
const SHOWN = OFFSETS.map(
  (p, i) =>
    clearOfCube(p) &&
    !OFFSETS.some(
      (q, j) =>
        j !== i && clearOfCube(q) && (q.depth > p.depth || (q.depth === p.depth && j < i)) && Math.abs(q.dx - p.dx) < p.half + q.half + 12 && Math.abs(q.dy - p.dy) < 34,
    ),
);

export const WeightsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.weights.from + frame;
  const dur = SCENES.weights.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const cubeIn = smooth(W.cubeIn, 18);
  const frozen = presence(frame, W.frozen[0], W.tank[1], W.frozen[1] - W.frozen[0], W.tank[1] - W.frozenOut);
  const out = interpolate(frame, [W.out, dur], [1, 0], clampOpts);
  const tankDraw = interpolate(frame, [W.tank[0], W.tank[1]], [0, 1], ease);
  const toCyan = interpolate(frame, [W.intoTank[0], W.intoTank[0] + 10], [0, 1], clampOpts);
  const landed = (i: number) => interpolate(frame, [W.intoTank[0] + i * 8, W.intoTank[0] + i * 8 + 22], [0, 1], ease);

  // The middle opens as the first card flies in and the window joins as it draws; both close as the scene fades,
  // so the cube ends centred for Scene 2.
  const closing = interpolate(frame, [W.out, dur], [1, 0], ease);
  const middle = interpolate(frame, [W.cards[0] - W.flight - 10, W.cards[0] + 10], [0, 1], ease) * closing;
  const [cubeX, middleX, tankX] = centredRow(
    [
      {w: CUBE_W + ORBIT_EXTRA * frozen, p: 1},
      {w: CARD.w, p: middle},
      {w: TANK_SIZE.w, p: tankDraw * closing},
    ],
    ROW_GAP,
  );
  const cube = {...CUBE_HOME, x: cubeX};
  const TANK = {...TANK_SIZE, x: tankX};
  const IMPACT_X = cubeX + 140 + CARD.w / 2 + 10; // card's left edge meets the padlock side
  const REST_X = middleX;

  const renderNumber = (n: (typeof NUMBERS)[number], i: number) => {
    if (!SHOWN[i]) {
      return null;
    }
    const near = (Math.sin(n.a) + 1) / 2;
    return (
      <text
        key={i}
        x={cubeX + Math.cos(n.a) * ORBIT.rx}
        y={CUBE_HOME.y + Math.sin(n.a) * ORBIT.ry + n.lift}
        fill={ICE}
        opacity={(0.3 + 0.6 * near) * frozen}
        fontFamily={FONT}
        fontWeight={700}
        fontSize={fontSizeAt(Math.sin(n.a))}
        textAnchor="middle"
        dominantBaseline="central"
        style={{fontVariantNumeric: 'tabular-nums'}}
      >
        {n.value}
      </text>
    );
  };

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {NUMBERS.map((n, i) => (Math.sin(n.a) < 0 ? renderNumber(n, i) : null))}
        <LockedCube id="gc-w-cube" absFrame={abs} {...cube} appear={cubeIn} />
        {NUMBERS.map((n, i) => (Math.sin(n.a) >= 0 ? renderNumber(n, i) : null))}
        <g opacity={cubeIn} transform={`translate(${cubeX} ${CUBE_HOME.y + 200})`}>
          <rect x={-150} y={-26} width={300} height={52} rx={26} fill={COLORS.charcoal} stroke={ICE} strokeWidth={3} />
          <text x={0} y={0} fill={ICE} fontFamily={FONT} fontWeight={800} fontSize={24} letterSpacing="0.08em" textAnchor="middle" dominantBaseline="central">
            v1.0 · LOCKED
          </text>
        </g>

        <g opacity={out}>
          {/* Blocked at the padlock. */}
          {CARDS.map((c, i) => {
            const hit = W.cards[i];
            const s = spring({frame: frame - hit, fps, config: {damping: 12, stiffness: 180}});
            const fade = interpolate(frame, [hit + 34, hit + 46], [1, 0], clampOpts);
            return s > 0.01 && fade > 0 ? (
              <g key={i} transform={`translate(${cubeX + MARK_DX} ${c.y}) scale(${s})`} opacity={fade}>
                <Mark ok={false} />
              </g>
            ) : null;
          })}

          <ContextTank
            id="gc-w-tank"
            {...TANK}
            draw={tankDraw}
            opacity={tankDraw > 0 ? 1 : 0}
            segments={CARDS.map((_, i) => ({kind: 'documents' as const, from: i * SLICE, to: (i + 1) * SLICE, opacity: landed(i) >= 1 ? 1 : 0}))}
          />
          <FlowLine from={{x: TANK.x - TANK.w / 2 - 10, y: TANK.y + 120}} to={{x: cubeX + 150, y: CUBE_HOME.y + 20}} frame={frame} opacity={smooth(W.intoTank[1] - 6, 12)} bend={80} />
          <Caption x={TANK.x} y={TANK.y + TANK.h / 2 + 44} text="THE ONLY WAY IN" color={COLORS.cyan} size={26} opacity={smooth(W.intoTank[1] - 4, 12)} />
        </g>
      </svg>

      {/* Cards fly at the model, bounce off the padlock, then drop into the context window instead. */}
      <AbsoluteFill style={{opacity: out}}>
        {CARDS.map((c, i) => {
          const hit = W.cards[i];
          const start = hit - W.flight;
          if (frame < start) {
            return null;
          }
          const inbound = interpolate(frame, [start, hit], [0, 1], {...clampOpts, easing: Easing.in(Easing.quad)});
          const back = spring({frame: frame - hit, fps, config: {damping: 14, stiffness: 120}, durationInFrames: 24});
          const cx = frame < hit ? lerp(2150, IMPACT_X, inbound) : lerp(IMPACT_X, REST_X, back);
          const flash = interpolate(frame, [hit, hit + 3, hit + 24], [0, 1, 0], clampOpts);
          const t = landed(i);
          if (t >= 1) {
            return null;
          }
          const r = segmentRect(TANK, i * SLICE, (i + 1) * SLICE);
          const box = {x: cx - CARD.w / 2, y: c.y - CARD.h / 2};
          const content = interpolate(t, [0, 0.4], [1, 0], clampOpts);
          const color = toCyan > 0 ? COLORS.cyan : flash > 0.01 ? COLORS.error : rgba(COLORS.white, 0.6);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: lerp(box.x, r.x, t),
                top: lerp(box.y, r.y, t),
                width: lerp(CARD.w, r.w, t),
                height: lerp(CARD.h, r.h, t),
                boxSizing: 'border-box',
                borderRadius: lerp(20, 4, t),
                border: `2px solid ${color}`,
                background: t > 0 ? SEGMENT_STYLE.documents.fill : rgba(COLORS.charcoal, 0.92),
                boxShadow: flash > 0.01 ? `0 0 ${30 * flash}px ${rgba(COLORS.error, 0.6 * flash)}` : undefined,
                padding: '16px 22px',
                fontFamily: FONT,
                color: COLORS.white,
                overflow: 'hidden',
              }}
            >
              <div style={{opacity: content}}>
                <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: toCyan > 0 ? COLORS.cyan : rgba(COLORS.white, 0.75), marginBottom: 8, whiteSpace: 'nowrap'}}>{c.label}</div>
                <div style={{fontSize: 24, fontWeight: 500, whiteSpace: 'nowrap'}}>{c.text}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      <Pinned>
        <SceneTitle text="BEYOND THE WEIGHTS" mode="hero" holdFrames={W.titleToCorner} />
      </Pinned>
    </AbsoluteFill>
  );
};
