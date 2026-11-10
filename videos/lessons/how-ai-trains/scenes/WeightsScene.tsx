import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {GlowFilter} from '../../../shared/components/Glow';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp, mix2, project} from '../../../shared/lib/math';
import {CAT_INDEX, TOKENS, tokenCamera} from '../lib/tokens';
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
import {SCENES, WEIGHTS} from '../timing';

const OUT = LAYERS.length - 1;
const EDGE_BASE = rgba(COLORS.cyan, 0.32);
const INPUT_CHIP = {x: 320, y: nodeAt(0, 0).y + (nodeAt(0, LAYERS[0] - 1).y - nodeAt(0, 0).y) / 2, w: 390, h: 76};
const CHIP = {x: nodeAt(OUT, 0).x + 40, y: nodeAt(OUT, 0).y - 110, w: 320, h: 64};
// The right answer comes from the text itself: it sits below the outputs, mirroring the guess above them.
const ANSWER = {x: CHIP.x, y: nodeAt(OUT, LAYERS[OUT] - 1).y + 110};
const COUNTER = {x: CHIP.x, y: ANSWER.y + 84};
const UPDATE_TOTAL = 2_400_000_000;
const HEADER = rgba(COLORS.white, 0.7);
// Probability the model gives each output (on, car, down), before and after the correction.
const PROBS_BEFORE = [31, 48, 21];
const PROBS_AFTER = [82, 10, 8];
const BAR = {x: nodeAt(OUT, 0).x + 140, max: 130, h: 12};
// Scene 2's token points, where that scene left them, fly into the input chip.
const TOKEN_CAM = tokenCamera(SCENES.tokenize.durationInFrames);
const TOKEN_ARRIVE = 24;

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
  // Two red flashes inside the error window (slower than 3 Hz).
  const flash = errorEnv * (0.5 - 0.5 * Math.cos((2 * Math.PI * (frame - WEIGHTS.error)) / 13));
  const wrongEnv = interpolate(frame, [forwardEnd1, forwardEnd1 + 4, WEIGHTS.backprop, WEIGHTS.backprop + 10], [0, 1, 1, 0], clampOpts);
  const lockEnv = interpolate(frame, [WEIGHTS.lock, WEIGHTS.lock + 6, WEIGHTS.labelsOut + 3, WEIGHTS.labelsOut + 13], [0, 1, 1, 0], clampOpts);
  const lockPop = spring({frame: frame - WEIGHTS.lock, fps, config: {damping: 10, stiffness: 180}});
  const labelsOpacity = interpolate(frame, [WEIGHTS.labelsOut, WEIGHTS.labelsOut + 13], [1, 0], clampOpts);
  const forwardEnd2 = WEIGHTS.forward2 + OUT * WEIGHTS.hop2;
  const answerIn = spring({frame: frame - WEIGHTS.error, fps, config: {damping: 200}, durationInFrames: 12});
  const chipIn = spring({frame: frame - 12, fps, config: {damping: 200}, durationInFrames: 14});
  const barsIn = spring({frame: frame - forwardEnd1, fps, config: {damping: 200}, durationInFrames: 12});
  const flip = interpolate(frame, [forwardEnd2, forwardEnd2 + 12], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const probs = PROBS_BEFORE.map((p, i) => lerp(p, PROBS_AFTER[i], flip));
  const topChoice = flip > 0.5 ? TARGET_INDEX : WRONG_INDEX;
  // Re-weighting tint: strengthened edges glow cyan, weakened ones grey out, until the second pass.
  const tintOut = interpolate(frame, [WEIGHTS.forward2, WEIGHTS.forward2 + 15], [1, 0], clampOpts);

  // Each layer pair re-weights right after the backward pulse has crossed it.
  const adjustFor = (layer: number) =>
    spring({
      frame: frame - (WEIGHTS.backprop + (OUT - 1 - layer) * WEIGHTS.hopBack + WEIGHTS.hopBack),
      fps,
      config: {damping: 200},
      durationInFrames: 20,
    });

  const updates = interpolate(frame, [WEIGHTS.backprop, WEIGHTS.labelsOut + 5], [0, UPDATE_TOTAL], {...clampOpts, easing: Easing.in(Easing.quad)});

  // Forward arrivals flash cyan, backward ones purple. At the output only the chosen word lights up:
  // "car" goes red on the first pass, "on" cyan on the second.
  const forwardGlow = (layer: number, index: number) =>
    Math.max(
      layer < OUT ? flashAt(frame, WEIGHTS.forward1 + layer * WEIGHTS.hop1) : 0,
      layer < OUT || index === TARGET_INDEX ? flashAt(frame, WEIGHTS.forward2 + layer * WEIGHTS.hop2) : 0,
    );
  const backGlow = (layer: number) => (layer < OUT ? flashAt(frame, WEIGHTS.backprop + (OUT - layer) * WEIGHTS.hopBack) : 0);

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

        {/* Scene 2's tokens fly in and become the input. */}
        {frame < TOKEN_ARRIVE + 8
          ? TOKENS.map((t, i) => {
              const from = project(t.pos, TOKEN_CAM);
              const to = {x: INPUT_CHIP.x - 105 + i * 70, y: INPUT_CHIP.y};
              const p = spring({frame: frame - i * 2, fps, config: {damping: 200}, durationInFrames: TOKEN_ARRIVE - 6});
              const pos = mix2(from, to, p);
              const fade = interpolate(frame, [TOKEN_ARRIVE - 4 + i, TOKEN_ARRIVE + 2 + i], [1, 0], clampOpts);
              return (
                <circle key={t.text} cx={pos.x} cy={pos.y} r={12 * from.k} fill={i === CAT_INDEX ? COLORS.purple : COLORS.cyan} opacity={fade} filter="url(#net-glow)" />
              );
            })
          : null}

        {/* Input text feeding the input layer; the next word "on" is in the text but hidden from the model. */}
        <g opacity={labelsOpacity}>
          {Array.from({length: LAYERS[0]}, (_, i) => {
            const n = nodeAt(0, i);
            return (
              <line key={i} x1={INPUT_CHIP.x + INPUT_CHIP.w / 2} y1={INPUT_CHIP.y} x2={n.x - NODE_RADIUS} y2={n.y} stroke={rgba(COLORS.white, 0.18)} strokeWidth={1.5} />
            );
          })}
          <g opacity={chipIn} transform={`translate(${INPUT_CHIP.x} ${INPUT_CHIP.y}) scale(${0.85 + 0.15 * chipIn}) translate(${-INPUT_CHIP.x} ${-INPUT_CHIP.y})`}>
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
          <text x={INPUT_CHIP.x} y={INPUT_CHIP.y} fontFamily={FONT} fontWeight={700} fontSize={30} textAnchor="middle" dominantBaseline="central">
            <tspan fill={COLORS.white}>The cat sprawled</tspan>
            <tspan dx={9} fill={interpolateColors(answerIn, [0, 1], [rgba(COLORS.white, 0.28), COLORS.cyan])}>on</tspan>
          </text>
          </g>
          {text(INPUT_CHIP.x, 210, 'INPUT', 24, HEADER)}
          {text((nodeAt(1, 0).x + nodeAt(2, 0).x) / 2, 210, 'HIDDEN LAYERS', 24, HEADER)}
          {text(nodeAt(OUT, 0).x, 210, 'NEXT WORD', 24, HEADER)}
        </g>

        {/* Weighted connections. */}
        <g strokeLinecap="round">
          {EDGES.map((e, i) => {
            const draw = interpolate(frame, [e.from.layer * 4, e.from.layer * 4 + 16], [0, 1], clampOpts);
            const w = lerp(e.w0, e.w1, adjustFor(e.from.layer));
            const intoWrong = e.to.layer === OUT && e.to.index === WRONG_INDEX;
            const intoTarget = e.to.layer === OUT && e.to.index === TARGET_INDEX;
            const tint = adjustFor(e.from.layer) * tintOut;
            const change = e.w1 - e.w0;
            const tintTo = change > 0.05 ? COLORS.cyan : change < -0.05 ? rgba(COLORS.white, 0.14) : EDGE_BASE;
            const stroke =
              flash > 0
                ? interpolateColors(flash, [0, 1], [EDGE_BASE, intoWrong ? COLORS.error : rgba(COLORS.error, 0.5)])
                : intoTarget && lockEnv > 0
                  ? interpolateColors(lockEnv, [0, 1], [EDGE_BASE, COLORS.cyan])
                  : tint > 0
                    ? interpolateColors(tint, [0, 1], [EDGE_BASE, tintTo])
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
          const glow = forwardGlow(n.layer, n.index);
          const back = backGlow(n.layer);
          const isOut = n.layer === OUT;
          let fill = interpolateColors(glow, [0, 1], [COLORS.charcoal, rgba(COLORS.cyan, 0.85)]);
          if (back > 0) {
            fill = interpolateColors(back, [0, 1], [fill, rgba(COLORS.purple, 0.85)]);
          }
          if (isOut && n.index === WRONG_INDEX && wrongEnv > 0) {
            fill = interpolateColors(wrongEnv, [0, 1], [fill, COLORS.error]);
          }
          if (isOut && n.index === TARGET_INDEX && lockEnv > 0) {
            fill = interpolateColors(lockEnv, [0, 1], [fill, COLORS.cyan]);
          }
          return (
            <g key={`${n.layer}-${n.index}`} transform={`translate(${n.x} ${n.y}) scale(${pop})`}>
              <circle r={NODE_RADIUS} fill={fill} stroke={COLORS.cyan} strokeWidth={2.5} filter={Math.max(glow, back) > 0.05 ? 'url(#net-glow)' : undefined} />
            </g>
          );
        })}

        {/* Output labels + prediction chips. */}
        <g opacity={labelsOpacity}>
          {OUTPUT_LABELS.map((name, i) => {
            const n = nodeAt(OUT, i);
            const hot = (i === WRONG_INDEX && wrongEnv > 0.5) || (i === TARGET_INDEX && lockEnv > 0.5);
            const top = i === topChoice;
            const barColor = top ? (topChoice === TARGET_INDEX ? COLORS.cyan : COLORS.error) : rgba(COLORS.white, 0.35);
            return (
              <React.Fragment key={name}>
                {text(n.x + 36, n.y, name, 30, hot ? COLORS.white : rgba(COLORS.white, 0.55), 'start')}
                {/* How likely the model thinks each word is; its guess is the most likely one. */}
                <g opacity={barsIn}>
                  <rect x={BAR.x} y={n.y - BAR.h / 2} width={BAR.max} height={BAR.h} rx={BAR.h / 2} fill={rgba(COLORS.white, 0.08)} />
                  <rect x={BAR.x} y={n.y - BAR.h / 2} width={(BAR.max * probs[i] * barsIn) / 100} height={BAR.h} rx={BAR.h / 2} fill={barColor} />
                  <text x={BAR.x + BAR.max + 14} y={n.y} fill={top ? COLORS.white : rgba(COLORS.white, 0.6)} fontFamily={FONT} fontWeight={700} fontSize={24} dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
                    {`${Math.round(probs[i])}%`}
                  </text>
                </g>
              </React.Fragment>
            );
          })}

          {/* The answer, taken from the text: the error is guess ≠ answer. */}
          <g opacity={answerIn} transform={`translate(${ANSWER.x} ${ANSWER.y}) scale(${0.9 + 0.1 * answerIn})`}>
            <rect x={-CHIP.w / 2} y={-CHIP.h / 2} width={CHIP.w} height={CHIP.h} rx={CHIP.h / 2} fill={COLORS.charcoal} stroke={COLORS.cyan} strokeWidth={3} strokeDasharray="10 8" />
            {text(0, 0, 'ANSWER: on', 28, COLORS.cyan)}
          </g>

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

        {/* "Billions of times": the guess, check, adjust loop repeats; counted beside the output it improves. */}
        <g opacity={Math.min(labelsOpacity, interpolate(frame, [WEIGHTS.backprop - 6, WEIGHTS.backprop], [0, 1], clampOpts))}>
          {text(COUNTER.x, COUNTER.y, 'TRAINING STEPS', 24, HEADER)}
          <text x={COUNTER.x} y={COUNTER.y + 44} fill={COLORS.purple} fontFamily={FONT} fontWeight={800} fontSize={44} textAnchor="middle" dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
            {Math.round(updates).toLocaleString('en-US')}
          </text>
        </g>
      </svg>

      <div style={{opacity: labelsOpacity}}>
        <Pinned>
          <SceneTitle text="ADJUSTING WEIGHTS" mode="corner" />
        </Pinned>
      </div>
    </AbsoluteFill>
  );
};
