import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, flashAt, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, fillTopY, Segment, segmentRect} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {AppMarker, LockedCube, PromptBar, StatusBadge} from '../../../shared/components/context/Pieces';
import {CAPACITY, COMPACTED, COMPACTED_TOP, CUBE_HOME, PROMPT, TANK_HOME, TANK_TEXT} from '../layout';
import {SCENES, TEMPORARY as T} from '../timing';

const ICE = '#D8FDFF';
const FRAME = {x: 330, y: 92, w: 1220, h: 920, bar: 56};
const PUSH = {x: 960, y: 500, size: 120};
// After the push-out the cube rests 120 px closer to the new tank, so the pair reads as one group.
const NEW_CUBE = {x: CUBE_HOME.x + 120, y: CUBE_HOME.y, size: CUBE_HOME.size};
const SAVED = 0.08;
const SAVED_LAND = 219; // first touchdown of the bouncing drop (Easing.bounce over TEMPORARY.saved)
const PARTICLES = 28;

// The same frozen weights as how-ai-trains Scene 9, now perfectly still.
const RINGS = [-90, 0, 90];
const PER_RING = 7;
const ORBIT = {rx: 400, ry: 66};
const NUMBERS = RINGS.flatMap((lift, ring) =>
  Array.from({length: PER_RING}, (_, j) => {
    const i = ring * PER_RING + j;
    const a = (j / PER_RING) * Math.PI * 2 + (ring * Math.PI) / PER_RING + 0.4;
    return {a, lift, value: ((random(`weights-value-${i}`) - 0.5) * 4).toFixed(2)};
  }),
);
// Offsets from the cube's centre. Numbers inside the cube's footprint are left out, and where two
// would crowd each other the farther one is left out, so the frozen weights never overlap the cube
// or each other (as in how-ai-trains Scene 9).
const CUBE_CLEAR = 1.75 * PUSH.size + 100;
const OFFSETS = NUMBERS.map((n) => ({dx: Math.cos(n.a) * ORBIT.rx, dy: Math.sin(n.a) * ORBIT.ry + n.lift, depth: Math.sin(n.a)}));
const SHOWN = OFFSETS.map(
  (p, i) =>
    Math.abs(p.dx) >= CUBE_CLEAR &&
    !OFFSETS.some(
      (q, j) => j !== i && Math.abs(q.dx) >= CUBE_CLEAR && (q.depth > p.depth || (q.depth === p.depth && j < i)) && Math.abs(q.dx - p.dx) < 90 && Math.abs(q.dy - p.dy) < 34,
    ),
);

export const TemporaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.temporary.from + frame;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  // Session window draws, its close button flashes, and it folds away.
  const frameDraw = interpolate(frame, [T.frame, T.frame + 16], [0, 1], ease);
  const close = interpolate(frame, [T.close, T.close + 4, T.close + 10], [0, 1, 0.6], clampOpts);
  const fold = interpolate(frame, [T.fold, T.fold + 14], [0, 1], {...clampOpts, easing: Easing.in(Easing.cubic)});

  // The context drains away.
  const level = interpolate(frame, [T.drain[0], T.drain[1]], [1, 0], {...clampOpts, easing: Easing.in(Easing.quad)});
  const oldTank = interpolate(frame, [T.pushIn, T.pushIn + 12], [1, 0], clampOpts) * interpolate(frame, [0, 10], [0, 1], clampOpts);
  const drained: Segment[] = COMPACTED.map((s) => ({...s, from: s.from * level, to: s.to * level}));

  // Push in on the unchanged model, then back out.
  const pushIn = smooth(T.pushIn, 22);
  const pushOut = smooth(T.pushOut, 22);
  const push = pushIn * (1 - pushOut);
  const rest = {x: lerp(CUBE_HOME.x, NEW_CUBE.x, pushOut), y: CUBE_HOME.y, size: CUBE_HOME.size};
  const cube = {x: lerp(rest.x, PUSH.x, push), y: lerp(rest.y, PUSH.y, push), size: lerp(rest.size, PUSH.size, push)};
  const savedGlow = flashAt(frame, SAVED_LAND, 24);
  const savedRect = segmentRect(TANK_HOME, 0, SAVED);
  const weights = presence(frame, T.pushIn + 6, T.pushOut + 6, 16, 14);

  // A new request starts with only what the app adds.
  const newDraw = interpolate(frame, [T.newTank, T.newTank + 20], [0, 1], ease);
  const drop = interpolate(frame, [T.saved[0], T.saved[1]], [0, 1], {...clampOpts, easing: Easing.bounce});
  const dropOffset = (1 - drop) * (1 - SAVED);
  const app = presence(frame, T.appIn, T.finale + 10, 12, 12);
  // Finale: everything fades out first, then the closing title springs in on an empty background.
  const finale = interpolate(frame, [T.finale, T.finale + T.fadeOut], [0, 1], clampOpts);
  const title = spring({frame: frame - T.titleIn, fps, config: {damping: 12, stiffness: 120}});
  const promptChars = interpolate(frame, [T.prompt[0] + 8, T.prompt[1]], [0, PROMPT.length], clampOpts);

  const renderNumber = (n: (typeof NUMBERS)[number], i: number) => {
    if (!SHOWN[i]) {
      return null;
    }
    const depth = Math.sin(n.a);
    const near = (depth + 1) / 2;
    return (
      <text
        key={i}
        x={cube.x + Math.cos(n.a) * ORBIT.rx}
        y={cube.y + Math.sin(n.a) * ORBIT.ry + n.lift}
        fill={ICE}
        opacity={(0.35 + 0.65 * near) * weights}
        fontFamily={FONT}
        fontWeight={700}
        fontSize={20 + 14 * near}
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
      {/* Scene content fades out completely before the finale title. */}
      <AbsoluteFill style={{opacity: 1 - finale}}>
        <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
          <defs>
            <filter id="tp-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={8} />
            </filter>
          </defs>
          {NUMBERS.map((n, i) => (Math.sin(n.a) < 0 ? renderNumber(n, i) : null))}
          <LockedCube id="tp-cube" absFrame={abs} {...cube} />
          {NUMBERS.map((n, i) => (Math.sin(n.a) >= 0 ? renderNumber(n, i) : null))}
          <g opacity={weights}>
            <Caption x={cube.x} y={cube.y - 215} text="WEIGHTS UNCHANGED" color={ICE} size={22} />
            <g transform={`translate(${cube.x} ${cube.y + 300})`}>
              <rect x={-180} y={-32} width={360} height={64} rx={32} fill={COLORS.charcoal} stroke={ICE} strokeWidth={3} />
              <text x={0} y={0} fill={ICE} fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing="0.08em" textAnchor="middle" dominantBaseline="central">
                v1.0 · LOCKED
              </text>
            </g>
          </g>

          <ContextTank
            id="tp-old" textSizes={TANK_TEXT}
            {...TANK_HOME}
            opacity={oldTank}
            segments={drained}
            readout={{tokens: COMPACTED_TOP * level * CAPACITY, capacity: CAPACITY, opacity: interpolate(frame, [T.fold + 14, T.fold + 22], [0, 1], clampOpts)}} // after the session frame has folded away
          />
          {/* Drained context dissolves into particles below the window. */}
          {frame >= T.drain[0] && frame < T.drain[1] + 30
            ? Array.from({length: PARTICLES}, (_, i) => {
                const start = T.drain[0] + (i / PARTICLES) * (T.drain[1] - T.drain[0]);
                const t = interpolate(frame, [start, start + 28], [0, 1], clampOpts);
                if (t <= 0 || t >= 1) {
                  return null;
                }
                const x = TANK_HOME.x - 140 + random(`drain-x-${i}`) * 280;
                const y0 = fillTopY(TANK_HOME, 0) + 10;
                return <circle key={i} cx={x} cy={y0 + t * 150} r={3 + 3 * random(`drain-r-${i}`)} fill={i % 3 === 0 ? COLORS.purple : COLORS.cyan} opacity={(1 - t) * 0.8} />;
              })
            : null}

          <ContextTank
            id="tp-new" textSizes={TANK_TEXT}
            {...TANK_HOME}
            opacity={newDraw > 0 ? 1 : 0}
            draw={newDraw}
            segments={frame >= T.saved[0] ? [{kind: 'instructions', from: dropOffset, to: dropOffset + SAVED, label: 'SAVED INSTRUCTIONS', labelOpacity: drop}] : []}
            labels={1}
            readout={{tokens: SAVED * drop * CAPACITY, capacity: CAPACITY, opacity: newDraw}}
          />
          {/* A brief purple glow as the saved instructions land. */}
          {savedGlow > 0.001 ? (
            <g opacity={savedGlow}>
              <rect x={savedRect.x - 4} y={savedRect.y - 4} width={savedRect.w + 8} height={savedRect.h + 8} rx={8} fill="none" stroke={COLORS.purple} strokeWidth={10} filter="url(#tp-glow)" />
              <rect x={savedRect.x} y={savedRect.y} width={savedRect.w} height={savedRect.h} rx={4} fill={rgba(COLORS.purple, 0.35)} stroke={COLORS.purple} strokeWidth={3} />
            </g>
          ) : null}
          {/* Between the cube and the new tank, clear of the saved-instructions label as it drops down the right side. */}
          <AppMarker x={870} y={300} opacity={app} frame={frame} />
          <Caption x={TANK_HOME.x} y={TANK_HOME.y + TANK_HOME.h / 2 + 46} text="ONLY WHAT THE APP ADDS" color={COLORS.white} size={26} opacity={presence(frame, T.saved[1], T.finale + 10, 12, 12)} />

          {/* Session window. */}
          {fold < 1 ? (
            <g opacity={1 - fold} transform={`translate(${FRAME.x + FRAME.w / 2} ${FRAME.y + FRAME.h / 2}) scale(${1 - 0.15 * fold}) translate(${-(FRAME.x + FRAME.w / 2)} ${-(FRAME.y + FRAME.h / 2)})`}>
              <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx={20} fill="none" stroke={rgba(COLORS.white, 0.6)} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - frameDraw} />
              <g opacity={frameDraw}>
                <line x1={FRAME.x} x2={FRAME.x + FRAME.w} y1={FRAME.y + FRAME.bar} y2={FRAME.y + FRAME.bar} stroke={rgba(COLORS.white, 0.3)} strokeWidth={2} />
                <Caption x={FRAME.x + 28} y={FRAME.y + FRAME.bar / 2} text="SESSION" anchor="start" color={COLORS.white} size={20} />
                <g transform={`translate(${FRAME.x + FRAME.w - 38} ${FRAME.y + FRAME.bar / 2})`}>
                  <circle r={21} fill={close > 0 ? rgba(COLORS.error, 0.4 + 0.6 * close) : rgba(COLORS.white, 0.15)} />
                  <path d="M-7.5 -7.5L7.5 7.5M7.5 -7.5L-7.5 7.5" stroke={COLORS.white} strokeWidth={3.5} strokeLinecap="round" />
                </g>
              </g>
            </g>
          ) : null}
        </svg>

        <Pinned>

          <StatusBadge kind="app" opacity={app} frame={frame} />

        </Pinned>
        <Sequence from={T.fold + 14} layout="none">
          <Pinned>
            <SceneTitle text="AFTER THE SESSION" mode="corner" />
          </Pinned>
        </Sequence>
      </AbsoluteFill>

      <Pinned>
        {/* Finale. */}
        {frame >= T.titleIn ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 450,
              textAlign: 'center',
              transform: `translateY(-50%) scale(${interpolate(frame, [T.titleIn, SCENES.temporary.durationInFrames], [1, 1.06], clampOpts) * lerp(0.86, 1, title)})`,
              opacity: Math.min(1, title * 1.3),
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 110,
              letterSpacing: '-0.02em',
              color: COLORS.white,
              textShadow: `0 0 40px ${rgba(COLORS.cyan, 0.45)}`,
              whiteSpace: 'nowrap',
            }}
          >
            CONTEXT IS TEMPORARY.
          </div>
        ) : null}
        <PromptBar x={960} y={640} text={PROMPT} chars={promptChars} opacity={smooth(T.prompt[0], 14)} frame={frame} />
      </Pinned>
    </AbsoluteFill>
  );
};
