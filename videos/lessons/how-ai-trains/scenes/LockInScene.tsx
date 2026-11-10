import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {Bubble} from '../../../shared/components/Bubble';
import {ModelCube} from '../components/ModelCube';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp, seeded} from '../../../shared/lib/math';
import {clampOpts, cubePose} from '../lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {LOCK as L, SCENES} from '../timing';

export const LOCK_POSE = {x: 960, y: 480, size: 130};
const ORBIT = {rx: 420, ry: 70};
const SPIN_RATE = 0.05; // rad per frame before the slow-down
const r = seeded('weights');
const RINGS = [-90, 0, 90]; // vertical offset of each ring
const PER_RING = 7;
const NUMBERS = RINGS.flatMap((lift, ring) =>
  Array.from({length: PER_RING}, (_, j) => {
    const i = ring * PER_RING + j;
    return {
      phase: (j / PER_RING) * Math.PI * 2 + (ring * Math.PI) / PER_RING,
      lift,
      value: ((r('value', i) - 0.5) * 4).toFixed(2),
    };
  }),
);
const CHAT = 'Remember: my name is Sam.';
const CHAT_W = 330;
// Bubble centre when its left edge touches the cube (cube half-width ≈ 1.75 × size).
const CHAT_HIT_X = LOCK_POSE.x + 1.75 * LOCK_POSE.size + CHAT_W / 2 + 10;
const ICE = '#D8FDFF';
// Horizontal distance from the cube's centre inside which numbers would overlap it (half-width ≈ 1.75 × size, plus a label).
const CUBE_CLEAR = 1.75 * LOCK_POSE.size + 100;
// The chat bubble flies in and bounces back above this line, to the right of the cube.
const CHAT_LANE_BOTTOM = 540;

// Integral of a spin rate that decays linearly to zero between slowStart and freeze.
const orbitAngle = (frame: number) => {
  const T = L.freeze - L.slowStart;
  const u = Math.min(Math.max(frame - L.slowStart, 0), T);
  return Math.min(frame, L.slowStart) * SPIN_RATE + SPIN_RATE * (u - (u * u) / (2 * T));
};

export const LockInScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.lockIn.from + frame;
  const dur = SCENES.lockIn.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});

  const pose = cubePose(frame, fps, dur, LOCK_POSE, {returnHome: false});
  const content = interpolate(frame, [L.contentOut, L.contentOut + 12], [1, 0], clampOpts);
  const frost = interpolate(frame, [L.freeze - 4, L.freeze + 18], [0, 1], clampOpts);
  const lock = spring({frame: frame - L.lock, fps, config: {damping: 9, stiffness: 160}});
  const angle = orbitAngle(frame);
  // Frozen numbers recede as the chat arrives so the bubble and caption read over them.
  const numbersIn = smooth(0, 20);
  const recede = interpolate(frame, [L.chat - 10, L.chat + 10, L.chatGone, L.chatGone + 15], [1, 0.3, 0.3, 0.55], clampOpts);
  const numberColor = interpolateColors(frost, [0, 1], [COLORS.purple, ICE]);

  // A chat message flies in, bounces off the locked model.
  const chatIn = interpolate(frame, [L.chat, L.chatHit], [0, 1], {...clampOpts, easing: Easing.in(Easing.quad)});
  const chatBack = interpolate(frame, [L.chatHit, L.chatHit + 18], [0, 1], {...clampOpts, easing: Easing.out(Easing.quad)});
  const chatX = lerp(1620, CHAT_HIT_X, chatIn) + 150 * chatBack;
  const chatY = lerp(360, 470, chatIn) - 40 * chatBack;
  const ripple = interpolate(frame, [L.chatHit, L.chatHit + 18], [0, 1], clampOpts);

  const orbitPoint = (n: (typeof NUMBERS)[number]) => {
    const a = n.phase + angle;
    return {x: pose.x + Math.cos(a) * ORBIT.rx, y: pose.y + Math.sin(a) * ORBIT.ry + n.lift, depth: Math.sin(a)};
  };
  // Numbers stay clear of the cube's footprint throughout (spinning or frozen), and clear out of the
  // chat's path as it arrives, so they never overlap the cube, padlock, emblem or chat bubble.
  // Crowding is only resolved as the orbit settles; while spinning, numbers just pass each other.
  const crowdMask = interpolate(frame, [L.slowStart, L.freeze], [0, 1], clampOpts);
  // The chat's lane clears as it arrives, and fills back in once it has gone, so the frozen layout ends balanced.
  const chatMask = interpolate(frame, [L.chat - 12, L.chat + 4, L.chatGone, L.chatGone + 15], [0, 1, 1, 0], clampOpts);
  const chatOut = interpolate(frame, [L.chatGone - 15, L.chatGone], [1, 0], clampOpts);
  const clearance = (p: {x: number; y: number}) => {
    const dx = Math.abs(p.x - pose.x);
    const overCube = interpolate(dx, [CUBE_CLEAR - 50, CUBE_CLEAR], [1, 0], clampOpts);
    const inChatLane = p.x > pose.x && p.y < CHAT_LANE_BOTTOM ? interpolate(dx, [CUBE_CLEAR - 50, CUBE_CLEAR], [0, 1], clampOpts) : 0;
    return (1 - overCube) * (1 - chatMask * inChatLane);
  };
  // Where two numbers would crowd each other, the farther one clears out.
  const points = NUMBERS.map(orbitPoint);
  const crowded = points.map((p, i) =>
    points.some((q, j) => j !== i && (q.depth > p.depth || (q.depth === p.depth && j < i)) && Math.abs(q.x - p.x) < 90 && Math.abs(q.y - p.y) < 34),
  );
  const renderNumber = (n: (typeof NUMBERS)[number], i: number) => {
    const p = orbitPoint(n);
    const near = (p.depth + 1) / 2;
    const clear = clearance(p) * (crowded[i] ? 1 - crowdMask : 1);
    if (clear <= 0.01) {
      return null;
    }
    return (
      <text
        key={i}
        x={p.x}
        y={p.y}
        fill={numberColor}
        opacity={(0.35 + 0.65 * near) * numbersIn * recede * clear}
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
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* Weights orbiting behind the model, then in front: they slow, stop and freeze. */}
        <g opacity={content}>{NUMBERS.map((n, i) => (orbitPoint(n).depth < 0 ? renderNumber(n, i) : null))}</g>
        <ModelCube id="lk-cube" absFrame={abs} {...pose} emblem={1} frost={frost} lock={lock} />
        <g opacity={content}>{NUMBERS.map((n, i) => (orbitPoint(n).depth >= 0 ? renderNumber(n, i) : null))}</g>

        <g opacity={content}>
          <Caption x={pose.x} y={pose.y - 215} text={frost > 0.5 ? 'WEIGHTS FROZEN' : 'WEIGHTS'} color={frost > 0.5 ? ICE : COLORS.purple} opacity={numbersIn} size={24} />
          {ripple > 0 && ripple < 1 ? (
            <circle cx={CHAT_HIT_X - CHAT_W / 2} cy={470} r={10 + 70 * ripple} fill="none" stroke={COLORS.cyan} strokeWidth={4} opacity={1 - ripple} filter="url(#lk-cube-glow)" />
          ) : null}
          <g opacity={smooth(L.tag)} transform={`translate(${pose.x} ${pose.y + 300})`}>
            <rect x={-180} y={-32} width={360} height={64} rx={32} fill={COLORS.charcoal} stroke={ICE} strokeWidth={3} />
            <text x={0} y={0} fill={ICE} fontFamily={FONT} fontWeight={800} fontSize={28} letterSpacing="0.08em" textAnchor="middle" dominantBaseline="central">
              v1.0 · LOCKED
            </text>
          </g>
          <Caption x={pose.x} y={pose.y + 384} text="CHATS DON’T CHANGE THE WEIGHTS" color={ICE} size={28} opacity={smooth(L.caption)} />
        </g>
      </svg>

      <div style={{opacity: content}}>
        <Bubble
          x={chatX}
          y={chatY}
          width={CHAT_W}
          text={CHAT}
          fontSize={24}
          color={COLORS.white}
          opacity={frame < L.chat ? 0 : smooth(L.chat, 8) * (1 - 0.5 * chatBack) * chatOut}
        />
        <Pinned>
          <SceneTitle text="LOCKED IN" mode="corner" />
        </Pinned>
      </div>
      {/* Faint frost vignette as the weights freeze. */}
      {/* Full-frame overlay: stays put while content shifts. */}
      <Pinned>
        <AbsoluteFill style={{boxShadow: `inset 0 0 220px ${rgba(COLORS.cyan, 0.18 * frost * content)}`, pointerEvents: 'none'}} />
      </Pinned>
    </AbsoluteFill>
  );
};
