import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {GlowFilter} from '../../../shared/components/Glow';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp, mix2} from '../../../shared/lib/math';
import {
  EDGES,
  LAYERS,
  NODE_RADIUS,
  NODES,
  OUTPUT_LABELS,
  TARGET_INDEX,
  WRONG_INDEX,
  nodeAt,
  strokeForWeight,
} from '../lib/network';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {WEIGHTS} from '../timing';

const OUT = LAYERS.length - 1;
const EDGE_BASE = rgba(COLORS.cyan, 0.32);
const INPUT_CHIP = {x: 330, y: nodeAt(0, 0).y + (nodeAt(0, LAYERS[0] - 1).y - nodeAt(0, 0).y) / 2, w: 250, h: 76};
const CHIP = {x: nodeAt(OUT, 0).x + 40, y: nodeAt(OUT, 0).y - 110, w: 320, h: 64};
const UPDATE_TOTAL = 2_400_000_000;

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Fraction of the way a pulse is across a hop; outside [0, 1] means no pulse on that hop.
const hopT = (frame: number, start: number, hop: number, step: number) => (frame - (start + step * hop)) / hop;

const flashAt = (frame: number, arrive: number) => interpolate(frame, [arrive, arrive + 4, arrive + 18], [0, 1, 0], clampOpts);

const CheckPath = 'M-12 0L-4 9L12 -9';
const CrossPath = 'M-10 -10L10 10M10 -10L-10 10';

export const WeightsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const forwardEnd1 = WEIGHTS.forward1 + OUT * WEIGHTS.hop1;
  const errorEnv = interpolate(
    frame,
    [WEIGHTS.error, WEIGHTS.error + 4, WEIGHTS.backprop - 6, WEIGHTS.backprop],
    [0, 1, 1, 0],
    clampOpts,
  );
  // Three hard flashes inside the error window.
  const flash = errorEnv * (0.5 - 0.5 * Math.cos((2 * Math.PI * (frame - WEIGHTS.error)) / 10));
  const wrongEnv = interpolate(frame, [forwardEnd1, forwardEnd1 + 4, WEIGHTS.backprop, WEIGHTS.backprop + 10], [0, 1, 1, 0], clampOpts);
  const lockEnv = interpolate(frame, [WEIGHTS.lock, WEIGHTS.lock + 6, WEIGHTS.labelsOut + 3, WEIGHTS.labelsOut + 13], [0, 1, 1, 0], clampOpts);
  const lockPop = spring({frame: frame - WEIGHTS.lock, fps, config: {damping: 10, stiffness: 180}});
  const labelsOpacity = interpolate(frame, [WEIGHTS.labelsOut, WEIGHTS.labelsOut + 13], [1, 0], clampOpts);

  // Each layer pair re-weights right after the backward pulse has crossed it.
  const adjustFor = (layer: number) =>
    spring({
      frame: frame - (WEIGHTS.backprop + (OUT - 1 - layer) * WEIGHTS.hopBack + WEIGHTS.hopBack),
      fps,
      config: {damping: 200},
      durationInFrames: 20,
    });

  const updates = interpolate(frame, [WEIGHTS.backprop, WEIGHTS.labelsOut + 5], [0, UPDATE_TOTAL], {...clampOpts, easing: Easing.in(Easing.quad)});

  const nodeGlow = (layer: number) =>
    Math.max(
      flashAt(frame, WEIGHTS.forward1 + layer * WEIGHTS.hop1),
      flashAt(frame, WEIGHTS.backprop + (OUT - layer) * WEIGHTS.hopBack),
      flashAt(frame, WEIGHTS.forward2 + layer * WEIGHTS.hop2),
    );

  const text = (x: number, y: number, value: string, size: number, fill: string, anchor: 'start' | 'middle' = 'middle', weight = 700) => (
    <text x={x} y={y} fill={fill} fontFamily={FONT} fontWeight={weight} fontSize={size} textAnchor={anchor} dominantBaseline="central">
      {value}
    </text>
  );

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <GlowFilter id="net-glow" blur={5} />
        </defs>

        {/* Input token from Scene 2 feeding the input layer. */}
        <g opacity={labelsOpacity}>
          {Array.from({length: LAYERS[0]}, (_, i) => {
            const n = nodeAt(0, i);
            return (
              <line key={i} x1={INPUT_CHIP.x + INPUT_CHIP.w / 2} y1={INPUT_CHIP.y} x2={n.x - NODE_RADIUS} y2={n.y} stroke={rgba(COLORS.white, 0.18)} strokeWidth={1.5} />
            );
          })}
          <rect
            x={INPUT_CHIP.x - INPUT_CHIP.w / 2}
            y={INPUT_CHIP.y - INPUT_CHIP.h / 2}
            width={INPUT_CHIP.w}
            height={INPUT_CHIP.h}
            rx={16}
            fill={rgba(COLORS.cyan, 0.08)}
            stroke={COLORS.cyan}
            strokeWidth={3}
          />
          {text(INPUT_CHIP.x, INPUT_CHIP.y, 'The cat sat', 34, COLORS.white)}
          {text(INPUT_CHIP.x, 210, 'INPUT', 20, rgba(COLORS.white, 0.5))}
          {text((nodeAt(1, 0).x + nodeAt(2, 0).x) / 2, 210, 'HIDDEN LAYERS', 20, rgba(COLORS.white, 0.5))}
          {text(nodeAt(OUT, 0).x, 210, 'NEXT WORD', 20, rgba(COLORS.white, 0.5))}
        </g>

        {/* Weighted connections. */}
        <g strokeLinecap="round">
          {EDGES.map((e, i) => {
            const draw = interpolate(frame, [e.from.layer * 4, e.from.layer * 4 + 16], [0, 1], clampOpts);
            const w = lerp(e.w0, e.w1, adjustFor(e.from.layer));
            const intoWrong = e.to.layer === OUT && e.to.index === WRONG_INDEX;
            const intoTarget = e.to.layer === OUT && e.to.index === TARGET_INDEX;
            const stroke =
              flash > 0
                ? interpolateColors(flash, [0, 1], [EDGE_BASE, intoWrong ? COLORS.error : COLORS.purple])
                : intoTarget && lockEnv > 0
                  ? interpolateColors(lockEnv, [0, 1], [EDGE_BASE, COLORS.cyan])
                  : EDGE_BASE;
            return (
              <path
                key={i}
                d={`M${e.from.x} ${e.from.y}L${e.to.x} ${e.to.y}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - draw}
                stroke={stroke}
                strokeWidth={strokeForWeight(w)}
                fill="none"
              />
            );
          })}
        </g>

        {/* Data pulses: forward (cyan), backward error signal (purple), forward again (cyan). */}
        <g filter="url(#net-glow)">
          {EDGES.map((e, i) => {
            const l = e.from.layer;
            const w = lerp(e.w0, e.w1, adjustFor(l));
            const passes = [
              {t: hopT(frame, WEIGHTS.forward1, WEIGHTS.hop1, l), reverse: false, color: COLORS.cyan},
              {t: hopT(frame, WEIGHTS.backprop, WEIGHTS.hopBack, OUT - 1 - l), reverse: true, color: COLORS.purple},
              {t: hopT(frame, WEIGHTS.forward2, WEIGHTS.hop2, l), reverse: false, color: COLORS.cyan},
            ];
            return passes.map((pass, p) => {
              if (pass.t < 0 || pass.t > 1) {
                return null;
              }
              const pos = pass.reverse ? mix2(e.to, e.from, pass.t) : mix2(e.from, e.to, pass.t);
              return <circle key={`${i}-${p}`} cx={pos.x} cy={pos.y} r={4 + 3 * w} fill={pass.color} opacity={0.35 + 0.65 * w} />;
            });
          })}
        </g>

        {/* Neurons. */}
        {NODES.map((n) => {
          const pop = spring({frame: frame - n.layer * 4, fps, config: {damping: 14, stiffness: 160}});
          const glow = nodeGlow(n.layer);
          const isOut = n.layer === OUT;
          let fill = interpolateColors(glow, [0, 1], [COLORS.charcoal, rgba(COLORS.cyan, 0.85)]);
          if (isOut && n.index === WRONG_INDEX && wrongEnv > 0) {
            fill = interpolateColors(wrongEnv, [0, 1], [fill, COLORS.error]);
          }
          if (isOut && n.index === TARGET_INDEX && lockEnv > 0) {
            fill = interpolateColors(lockEnv, [0, 1], [fill, COLORS.cyan]);
          }
          return (
            <g key={`${n.layer}-${n.index}`} transform={`translate(${n.x} ${n.y}) scale(${pop})`}>
              <circle r={NODE_RADIUS} fill={fill} stroke={COLORS.cyan} strokeWidth={2.5} filter={glow > 0.05 ? 'url(#net-glow)' : undefined} />
            </g>
          );
        })}

        {/* Output labels + prediction chips. */}
        <g opacity={labelsOpacity}>
          {OUTPUT_LABELS.map((name, i) => {
            const n = nodeAt(OUT, i);
            const hot = (i === WRONG_INDEX && wrongEnv > 0.5) || (i === TARGET_INDEX && lockEnv > 0.5);
            return <React.Fragment key={name}>{text(n.x + 36, n.y, name, 30, hot ? COLORS.white : rgba(COLORS.white, 0.55), 'start')}</React.Fragment>;
          })}

          <g opacity={wrongEnv} transform={`translate(${CHIP.x} ${CHIP.y})`}>
            <rect x={-CHIP.w / 2} y={-CHIP.h / 2} width={CHIP.w} height={CHIP.h} rx={CHIP.h / 2} fill={COLORS.charcoal} stroke={COLORS.error} strokeWidth={3} />
            {text(-24, 0, 'GUESS: car', 28, COLORS.white)}
            <path d={CrossPath} transform={`translate(${CHIP.w / 2 - 40} 0)`} stroke={COLORS.error} strokeWidth={4} strokeLinecap="round" fill="none" />
          </g>

          <g opacity={lockEnv > 0 ? 1 : 0} transform={`translate(${CHIP.x} ${CHIP.y}) scale(${frame >= WEIGHTS.lock ? lockPop : 0})`}>
            <rect x={-CHIP.w / 2} y={-CHIP.h / 2} width={CHIP.w} height={CHIP.h} rx={CHIP.h / 2} fill={COLORS.charcoal} stroke={COLORS.cyan} strokeWidth={3} />
            {text(-24, 0, 'GUESS: on', 28, COLORS.white)}
            <path d={CheckPath} transform={`translate(${CHIP.w / 2 - 40} 0)`} stroke={COLORS.cyan} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </g>
      </svg>

      {/* Counter is screen chrome: it stays top-right. */}
      <Pinned>
        <div
          style={{
            position: 'absolute',
            right: 96,
            top: 64,
            textAlign: 'right',
            fontFamily: FONT,
            color: COLORS.white,
            opacity: Math.min(labelsOpacity, interpolate(frame, [WEIGHTS.backprop - 6, WEIGHTS.backprop], [0, 1], clampOpts)),
          }}
        >
          <div style={{fontSize: 20, fontWeight: 700, letterSpacing: '0.18em', opacity: 0.6}}>WEIGHT UPDATES</div>
          <div style={{fontSize: 48, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: COLORS.purple}}>
            {Math.round(updates).toLocaleString('en-US')}
          </div>
        </div>
      </Pinned>

      <div style={{opacity: labelsOpacity}}>
        <Pinned>
          <SceneTitle text="ADJUSTING WEIGHTS" mode="corner" />
        </Pinned>
      </div>
    </AbsoluteFill>
  );
};
