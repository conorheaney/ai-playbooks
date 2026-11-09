import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, fillTopY, Segment} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {AppMarker, LockedCube, PromptBar, StatusBadge} from '../../../shared/components/context/Pieces';
import {CAPACITY, COMPACTED, COMPACTED_TOP, CUBE_HOME, PROMPT, TANK_HOME} from '../layout';
import {SCENES, TEMPORARY as T} from '../timing';

const ICE = '#D8FDFF';
const FRAME = {x: 330, y: 92, w: 1220, h: 920, bar: 46};
const PUSH = {x: 960, y: 500, size: 120};
const SAVED = 0.05;
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
  const cube = {x: lerp(CUBE_HOME.x, PUSH.x, push), y: lerp(CUBE_HOME.y, PUSH.y, push), size: lerp(CUBE_HOME.size, PUSH.size, push)};
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
          {NUMBERS.map((n, i) => (Math.sin(n.a) < 0 ? renderNumber(n, i) : null))}
          <LockedCube id="tp-cube" absFrame={abs} {...cube} />
          {NUMBERS.map((n, i) => (Math.sin(n.a) >= 0 ? renderNumber(n, i) : null))}
          <g opacity={weights}>
            <Caption x={cube.x} y={cube.y - 290} text="WEIGHTS UNCHANGED" color={ICE} size={22} />
            <g transform={`translate(${cube.x} ${cube.y + 300})`}>
              <rect x={-180} y={-32} width={360} height={64} rx={32} fill={COLORS.charcoal} stroke={ICE} strokeWidth={3} />
              <text x={0} y={0} fill={ICE} fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing="0.08em" textAnchor="middle" dominantBaseline="central">
                v1.0 · LOCKED
              </text>
            </g>
          </g>

          <ContextTank
            id="tp-old"
            {...TANK_HOME}
            opacity={oldTank}
            segments={drained}
            readout={{tokens: COMPACTED_TOP * level * CAPACITY, capacity: CAPACITY, opacity: interpolate(frame, [T.fold + 10, T.fold + 20], [0, 1], clampOpts)}}
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
            id="tp-new"
            {...TANK_HOME}
            opacity={newDraw > 0 ? 1 : 0}
            draw={newDraw}
            segments={frame >= T.saved[0] ? [{kind: 'instructions', from: dropOffset, to: dropOffset + SAVED, label: 'SAVED INSTRUCTIONS', labelOpacity: drop}] : []}
            labels={1}
            readout={{tokens: SAVED * drop * CAPACITY, capacity: CAPACITY, opacity: newDraw}}
          />
          <AppMarker x={1540} y={760} opacity={app} frame={frame} />
          <Caption x={TANK_HOME.x} y={TANK_HOME.y + TANK_HOME.h / 2 + 44} text="ONLY WHAT THE APP ADDS" color={COLORS.purple} size={20} opacity={presence(frame, T.saved[1], T.finale + 10, 12, 12)} />

          {/* Session window. */}
          {fold < 1 ? (
            <g opacity={1 - fold} transform={`translate(${FRAME.x + FRAME.w / 2} ${FRAME.y + FRAME.h / 2}) scale(${1 - 0.15 * fold}) translate(${-(FRAME.x + FRAME.w / 2)} ${-(FRAME.y + FRAME.h / 2)})`}>
              <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx={20} fill="none" stroke={rgba(COLORS.white, 0.6)} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - frameDraw} />
              <g opacity={frameDraw}>
                <line x1={FRAME.x} x2={FRAME.x + FRAME.w} y1={FRAME.y + FRAME.bar} y2={FRAME.y + FRAME.bar} stroke={rgba(COLORS.white, 0.3)} strokeWidth={2} />
                <Caption x={FRAME.x + 28} y={FRAME.y + FRAME.bar / 2} text="SESSION" anchor="start" color={COLORS.white} size={18} />
                <g transform={`translate(${FRAME.x + FRAME.w - 30} ${FRAME.y + FRAME.bar / 2})`}>
                  <circle r={14} fill={close > 0 ? rgba(COLORS.error, 0.4 + 0.6 * close) : rgba(COLORS.white, 0.15)} />
                  <path d="M-5 -5L5 5M5 -5L-5 5" stroke={COLORS.white} strokeWidth={2.5} strokeLinecap="round" />
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
