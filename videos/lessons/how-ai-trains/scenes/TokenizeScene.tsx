import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {GlowFilter} from '../../../shared/components/Glow';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {Camera, lerp, mix2, mix3, project, Vec3} from '../../../shared/lib/math';
import {CENTER, COLORS, rgba, VIDEO} from '../../../shared/theme';
import {SCENES, TOKEN} from '../timing';

const BOX_W = 220;
const BOX_H = 124;
const GAP_MAX = 64;
const WORD_SIZE = 84;
const LABEL_SIZE = 34;
const CUT_HALF = 110;

const TOKENS: {text: string; id: number; pos: Vec3}[] = [
  {text: 'The', id: 464, pos: {x: -0.62, y: 0.48, z: 0.42}},
  {text: 'cat', id: 3797, pos: {x: 0.3, y: 0.1, z: -0.3}},
  {text: 'sat', id: 7731, pos: {x: -0.28, y: -0.46, z: -0.52}},
];
const CAT = TOKENS[1].pos;
const KITTEN: Vec3 = {x: 0.66, y: 0.42, z: -0.22};
const CAR_START: Vec3 = {x: 0.08, y: -0.22, z: -0.36};
const CAR_END: Vec3 = {x: 1.7, y: -0.6, z: 0.6}; // deliberately outside the grid

const GRID_STEPS = [-1, -0.5, 0, 0.5, 1];
const AXES: {to: Vec3; label: string}[] = [
  {to: {x: 1, y: -1, z: -1}, label: 'd₁'},
  {to: {x: -1, y: 1, z: -1}, label: 'd₂'},
  {to: {x: -1, y: -1, z: 1}, label: 'd₃'},
];
const ORIGIN: Vec3 = {x: -1, y: -1, z: -1};

export const TokenizeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const smooth = (start: number, duration = 30) =>
    spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});

  const sentenceIn = smooth(0, 15);
  const split = smooth(TOKEN.split, 24);
  const gap = GAP_MAX * split;
  const space = smooth(TOKEN.morph, 30);
  const kitten = smooth(TOKEN.kittenIn, 20);
  const carIn = smooth(TOKEN.carIn, 14);
  const carFly = smooth(TOKEN.carFly, 30);

  const cam: Camera = {
    yaw: interpolate(frame, [TOKEN.morph, SCENES.tokenize.durationInFrames], [-0.55, 0.35], clampOpts),
    pitch: -0.38,
    distance: 4.2,
    scale: 250,
    cx: CENTER.x,
    cy: CENTER.y + 10,
  };
  const P = (v: Vec3) => project(v, cam);

  const catP = P(CAT);
  const kittenP = P(KITTEN);
  const carP = P(mix3(CAR_START, CAR_END, carFly));
  const linkEnd = mix2(catP, kittenP, kitten);
  // "similar" sits on the link's lower-right normal, clear of the cat/kitten labels.
  const linkLen = Math.hypot(kittenP.x - catP.x, kittenP.y - catP.y) || 1;
  const similarAt = {
    x: (catP.x + kittenP.x) / 2 - ((kittenP.y - catP.y) / linkLen) * 40,
    y: (catP.y + kittenP.y) / 2 + ((kittenP.x - catP.x) / linkLen) * 40,
  };

  const label = (x: number, y: number, text: string, size: number, opacity: number, fill: string = COLORS.white) => (
    <text
      x={x}
      y={y}
      fill={fill}
      opacity={opacity}
      fontFamily={FONT}
      fontWeight={700}
      fontSize={size}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {text}
    </text>
  );

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <GlowFilter id="tok-glow" blur={6} canvas />
          <GlowFilter id="tok-glow-soft" blur={3} canvas />
        </defs>

        {/* 3D vector space: floor grid + three axes, re-projected every frame. */}
        <g opacity={space} strokeLinecap="round">
          {GRID_STEPS.map((v) => {
            const a = P({x: v, y: -1, z: -1});
            const b = P({x: v, y: -1, z: 1});
            const c = P({x: -1, y: -1, z: v});
            const d = P({x: 1, y: -1, z: v});
            return (
              <g key={v} stroke={rgba(COLORS.cyan, 0.18)} strokeWidth={1.5}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} />
              </g>
            );
          })}
          {AXES.map((axis) => {
            const o = P(ORIGIN);
            const end = P(axis.to);
            return (
              <g key={axis.label}>
                <line x1={o.x} y1={o.y} x2={end.x} y2={end.y} stroke={COLORS.cyan} strokeWidth={3} filter="url(#tok-glow-soft)" />
                {label(end.x + (end.x - o.x) * 0.06, end.y + (end.y - o.y) * 0.06, axis.label, 26, 0.8, COLORS.cyan)}
              </g>
            );
          })}
        </g>

        {/* "car" starts beside "cat", then flies to the far corner of the space. */}
        <g opacity={carIn}>
          <line
            x1={catP.x}
            y1={catP.y}
            x2={carP.x}
            y2={carP.y}
            stroke={COLORS.white}
            strokeWidth={2}
            strokeDasharray="6 10"
            opacity={0.45 * (1 - carFly * 0.6)}
          />
          <circle cx={carP.x} cy={carP.y} r={12 * carP.k * carIn} fill={COLORS.white} filter="url(#tok-glow)" />
          {label(carP.x, carP.y + 40 * carP.k, 'car', LABEL_SIZE * carP.k, 1)}
        </g>

        {/* cat <-> kitten: near neighbours in meaning. */}
        <g opacity={kitten}>
          <line x1={catP.x} y1={catP.y} x2={linkEnd.x} y2={linkEnd.y} stroke={COLORS.purple} strokeWidth={4} filter="url(#tok-glow)" />
          <circle cx={kittenP.x} cy={kittenP.y} r={12 * kittenP.k * kitten} fill={COLORS.purple} filter="url(#tok-glow)" />
          {label(kittenP.x + 8, kittenP.y - 40 * kittenP.k, 'kitten', LABEL_SIZE * kittenP.k, 1)}
          {label(similarAt.x, similarAt.y, 'similar', 22, 0.85, COLORS.purple)}
        </g>

        {/* Tokens: sentence -> sliced blocks -> glowing points in the grid. */}
        {TOKENS.map((t, i) => {
          const m = smooth(TOKEN.morph + i * 6, 30);
          const target = P(t.pos);
          const box = {x: CENTER.x + (i - 1) * (BOX_W + gap), y: CENTER.y};
          const pos = mix2(box, target, m);
          const w = BOX_W * (1 - m);
          const h = BOX_H * (1 - m);
          const isCat = i === 1;
          return (
            <g key={t.text} opacity={sentenceIn} transform={`translate(0 ${(1 - sentenceIn) * 30})`}>
              <rect
                x={pos.x - w / 2}
                y={pos.y - h / 2}
                width={w}
                height={h}
                rx={18 * (1 - m)}
                fill={rgba(COLORS.cyan, 0.08 * split)}
                stroke={COLORS.cyan}
                strokeOpacity={split * (1 - m)}
                strokeWidth={3}
              />
              {label(pos.x, pos.y + lerp(0, -40 * target.k, m), t.text, lerp(WORD_SIZE, LABEL_SIZE * target.k, m), 1)}
              {label(box.x, box.y + BOX_H / 2 + 34, `#${t.id}`, 22, split * (1 - m), COLORS.cyan)}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={12 * target.k * m}
                fill={isCat ? COLORS.purple : COLORS.cyan}
                filter="url(#tok-glow)"
              />
            </g>
          );
        })}

        {/* Slicing beams between the words. */}
        {TOKEN.cuts.map((cut, c) => {
          const draw = interpolate(frame, [cut, cut + 8], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
          const fade = interpolate(frame, [cut + 10, cut + 22], [1, 0], clampOpts);
          const x = CENTER.x + (c === 0 ? -1 : 1) * (BOX_W + gap) / 2;
          return (
            <line
              key={cut}
              x1={x}
              y1={CENTER.y - CUT_HALF}
              x2={x}
              y2={CENTER.y - CUT_HALF + 2 * CUT_HALF * draw}
              stroke={COLORS.cyan}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={draw > 0 ? fade : 0}
              filter="url(#tok-glow)"
            />
          );
        })}
      </svg>

      <Pinned>

        <SceneTitle text="TOKENIZE & MAP" mode="corner" />

      </Pinned>
    </AbsoluteFill>
  );
};
