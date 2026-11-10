import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {GlowFilter} from '../../../shared/components/Glow';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp, mix2, mix3, project, Vec3} from '../../../shared/lib/math';
import {CENTER, COLORS, rgba, VIDEO} from '../../../shared/theme';
import {TOKEN} from '../timing';
import {CAT_INDEX, TOKENS, WORD_SIZE, tokenCamera} from '../lib/tokens';

const BOX_H = 124;
const GAP_MAX = 64;
const LABEL_SIZE = 34;
const CUT_HALF = 110;
const ID_SIZE = 26;
const STAGGER = 3; // frames between each token starting its morph
const SUBWORD = 2; // "sprawl" + "ed": butted together until the cut

const CAT = TOKENS[CAT_INDEX].pos;
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
  const contrast = smooth(TOKEN.contrast, 12);
  const dims = smooth(TOKEN.dimensions, 20);
  // IDs are gone by the time the blocks start shrinking, so the morph stays clean.
  const idsOut = interpolate(frame, [TOKEN.morph - 10, TOKEN.morph], [1, 0], clampOpts);

  const cam = tokenCamera(frame);
  const P = (v: Vec3) => project(v, cam);

  const catP = P(CAT);
  const kittenP = P(KITTEN);
  const carP = P(mix3(CAR_START, CAR_END, carFly));
  const linkEnd = mix2(catP, kittenP, kitten);
  // Labels sit on the links' lower-right normals, clear of the word labels.
  const normalAt = (a: {x: number; y: number}, b: {x: number; y: number}, d: number) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return {x: (a.x + b.x) / 2 - ((b.y - a.y) / len) * d, y: (a.y + b.y) / 2 + ((b.x - a.x) / len) * d};
  };
  const similarAt = normalAt(catP, kittenP, 44);
  const closeAt = normalAt(catP, kittenP, 70);
  const farAt = normalAt(catP, carP, 34);

  // Block centres in a row; widths differ per token.
  const total = TOKENS.reduce((sum, t) => sum + t.w, 0) + gap * (TOKENS.length - 1);
  const boxes = TOKENS.reduce<{x: number; left: number; right: number}[]>((acc, t, i) => {
    const left = i === 0 ? CENTER.x - total / 2 : acc[i - 1].right + gap;
    acc.push({left, right: left + t.w, x: left + t.w / 2});
    return acc;
  }, []);

  const label = (x: number, y: number, text: string, size: number, opacity: number, fill: string = COLORS.white, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text
      x={x}
      y={y}
      fill={fill}
      opacity={opacity}
      fontFamily={FONT}
      fontWeight={700}
      fontSize={size}
      textAnchor={anchor}
      dominantBaseline="central"
    >
      {text}
    </text>
  );

  const d1 = P(AXES[0].to);
  const origin = P(ORIGIN);

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
                {label(end.x + (end.x - o.x) * 0.07, end.y + (end.y - o.y) * 0.07, axis.label, 28, 1, COLORS.cyan)}
              </g>
            );
          })}
          {/* "multi-dimensional": three axes stand in for thousands. Beside the d₁ label, clear of every token. */}
          {label(d1.x + (d1.x - origin.x) * 0.07 + 30, d1.y + (d1.y - origin.y) * 0.07, '+ 1,000s MORE DIMENSIONS', 22, 0.6 * dims, COLORS.cyan, 'start')}
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
            opacity={0.45 * (1 - carFly * 0.4)}
          />
          <circle cx={carP.x} cy={carP.y} r={12 * carP.k * carIn} fill={COLORS.white} filter="url(#tok-glow)" />
          {label(carP.x, carP.y + 40 * carP.k, 'car', LABEL_SIZE * carP.k, 1)}
          {label(farAt.x, farAt.y, 'far = different', 24, 0.85 * contrast)}
        </g>

        {/* cat <-> kitten: near neighbours in meaning. */}
        <g opacity={kitten}>
          <line x1={catP.x} y1={catP.y} x2={linkEnd.x} y2={linkEnd.y} stroke={COLORS.purple} strokeWidth={4} filter="url(#tok-glow)" />
          <circle cx={kittenP.x} cy={kittenP.y} r={12 * kittenP.k * kitten} fill={COLORS.purple} filter="url(#tok-glow)" />
          {label(kittenP.x + 8, kittenP.y - 40 * kittenP.k, 'kitten', LABEL_SIZE * kittenP.k, 1)}
          {label(similarAt.x, similarAt.y, 'similar', 26, 1 - contrast, COLORS.purple)}
          {label(closeAt.x + 40, closeAt.y, 'close = similar', 24, contrast, COLORS.purple)}
        </g>

        {/* Tokens: sentence -> sliced blocks -> glowing points in the grid. */}
        {TOKENS.map((t, i) => {
          const m = smooth(TOKEN.morph + i * STAGGER, 30);
          const target = P(t.pos);
          const box = {x: boxes[i].x, y: CENTER.y};
          const pos = mix2(box, target, m);
          // Word and block shrink together, so the word never outgrows its box.
          const s = lerp(1, (LABEL_SIZE * target.k) / WORD_SIZE, m);
          const labelPos = {x: pos.x, y: pos.y + lerp(0, -40 * target.k, m)};
          // Sub-word pieces sit flush ("sprawled") until the cut, then centre in their blocks.
          const flush = i === SUBWORD ? boxes[i].right - 1 - t.textW / 2 : i === SUBWORD + 1 ? boxes[i].left + 1 + t.textW / 2 : box.x;
          const textX = m > 0 ? labelPos.x : lerp(flush, box.x, split);
          const w = t.w * s;
          const h = BOX_H * s;
          // Box outlines are gone before any block moves, and each word fades out while its point travels
          // and back in once it has landed, so no two words or blocks cross mid-morph.
          const boxOut = interpolate(frame, [TOKEN.morph - 8, TOKEN.morph + 2], [1, 0], clampOpts);
          const wordOpacity = interpolate(m, [0, 0.25, 0.75, 1], [1, 0, 0, 1], clampOpts);
          return (
            <g key={t.text} opacity={sentenceIn} transform={`translate(0 ${(1 - sentenceIn) * 30})`}>
              <rect
                x={labelPos.x - w / 2}
                y={labelPos.y - h / 2}
                width={w}
                height={h}
                rx={18 * s}
                fill={rgba(COLORS.cyan, 0.08 * split * boxOut)}
                stroke={COLORS.cyan}
                strokeOpacity={split * boxOut}
                strokeWidth={3}
              />
              {label(textX, labelPos.y, t.text, WORD_SIZE * s, wordOpacity)}
              {label(box.x, box.y + BOX_H / 2 + 36, `#${t.id}`, ID_SIZE, split * idsOut, COLORS.cyan)}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={12 * target.k * m}
                fill={i === CAT_INDEX ? COLORS.purple : COLORS.cyan}
                filter="url(#tok-glow)"
              />
            </g>
          );
        })}

        {/* Slicing beams between the tokens; the last one splits "sprawled" into sub-word pieces. */}
        {TOKEN.cuts.map((cut, c) => {
          const draw = interpolate(frame, [cut, cut + 8], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
          const fade = interpolate(frame, [cut + 10, cut + 22], [1, 0], clampOpts);
          const x = boxes[c].right + gap / 2;
          return (
            <line
              key={c}
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
