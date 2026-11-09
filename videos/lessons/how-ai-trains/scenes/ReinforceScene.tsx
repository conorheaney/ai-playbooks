import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {Mark} from '../../../shared/components/Bubble';
import {GlowFilter} from '../../../shared/components/Glow';
import {ModelCube} from '../components/ModelCube';
import {Caption, Gear, LoopBadge} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp, Vec2} from '../../../shared/lib/math';
import {clampOpts, cubePose, flashAt} from '../lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {REINFORCE as R, SCENES} from '../timing';

const POSE = {x: 640, y: 490, size: 85};
const CHECKER = {x: 1290, y: 490, w: 300, h: 230};
const ATTEMPT_ARC = {from: {x: 760, y: 420}, ctrl: {x: 965, y: 240}, to: {x: CHECKER.x - CHECKER.w / 2, y: 420}};
const REWARD_ARC = {from: {x: CHECKER.x - CHECKER.w / 2, y: 560}, ctrl: {x: 965, y: 720}, to: {x: 760, y: 560}};
const CHART = {x: 520, y: 810, w: 900, h: 140};
const RESULT_TO_REWARD = 3; // frames between the verdict and the reward setting off

// One row per cycle in REINFORCE.cycles. Verifiable tasks: the checker knows the right answer.
const TASKS: {problem: string; attempt: string; ok: boolean}[] = [
  {problem: '17 × 24 = ?', attempt: '398', ok: false},
  {problem: '17 × 24 = ?', attempt: '408', ok: true},
  {problem: '√144 = ?', attempt: '12', ok: true},
  {problem: 'is_prime(91)', attempt: 'True', ok: false},
  {problem: 'sort([3, 1, 2])', attempt: '[1, 2, 3]', ok: true},
  {problem: '15% of 80 = ?', attempt: '12', ok: true},
  {problem: 'reverse("abc")', attempt: '"cba"', ok: true},
  {problem: 'gcd(48, 18) = ?', attempt: '9', ok: false},
  {problem: 'fib(10) = ?', attempt: '55', ok: true},
  {problem: '2ⁿ = 64, n = ?', attempt: '6', ok: true},
];
// Success rate before the first cycle, then after each one.
const RATES = [30, 28, 42, 47, 45, 55, 63, 70, 68, 79, 90];

const bez = (a: {from: Vec2; ctrl: Vec2; to: Vec2}, t: number): Vec2 => ({
  x: (1 - t) * (1 - t) * a.from.x + 2 * (1 - t) * t * a.ctrl.x + t * t * a.to.x,
  y: (1 - t) * (1 - t) * a.from.y + 2 * (1 - t) * t * a.ctrl.y + t * t * a.to.y,
});
const arcPath = (a: {from: Vec2; ctrl: Vec2; to: Vec2}) => `M${a.from.x} ${a.from.y}Q${a.ctrl.x} ${a.ctrl.y} ${a.to.x} ${a.to.y}`;

export const ReinforceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.reinforce.from + frame;
  const dur = SCENES.reinforce.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});

  const pose = cubePose(frame, fps, dur, POSE);
  const content = interpolate(frame, [R.contentOut, R.contentOut + 12], [1, 0], clampOpts);
  const badge = interpolate(frame, [0, 10, dur - 12, dur], [0, 1, 1, 0], clampOpts);
  const arcs = interpolate(frame, [R.arcs, R.arcs + 25], [0, 1], clampOpts);

  const timing = R.cycles.map((c) => {
    const launch = c.start + 5;
    const verdict = launch + c.travel;
    const rewardArrive = verdict + RESULT_TO_REWARD + c.travel;
    return {...c, launch, verdict, rewardArrive};
  });
  const current = timing.reduce((idx, c, i) => (frame >= c.start ? i : idx), -1);
  const lastVerdict = timing.reduce((idx, c, i) => (frame >= c.verdict ? i : idx), -1);
  const learned = timing.reduce((n, c) => (frame >= c.rewardArrive ? n + 1 : n), 0);

  // Model lights up cyan when a reward lands, dims red-purple when it gets nothing.
  const rewardGlow = Math.max(0, ...timing.map((c, i) => (TASKS[i].ok ? flashAt(frame, c.rewardArrive, 20) : 0)));
  const missGlow = Math.max(0, ...timing.map((c, i) => (!TASKS[i].ok ? flashAt(frame, c.rewardArrive, 20) : 0)));

  // Success-rate line, extended smoothly towards the next point while a reward is in flight.
  const pts = RATES.map((r, i) => ({x: CHART.x + (CHART.w * i) / (RATES.length - 1), y: CHART.y + CHART.h - (CHART.h * r) / 100}));
  const shownIdx = Math.min(learned, RATES.length - 1);
  const nextGrow =
    learned < timing.length
      ? interpolate(frame, [timing[learned].rewardArrive - 8, timing[learned].rewardArrive], [0, 1], clampOpts)
      : 0;
  const linePts = pts.slice(0, shownIdx + 1);
  if (nextGrow > 0 && shownIdx + 1 < pts.length) {
    const a = pts[shownIdx];
    const b = pts[shownIdx + 1];
    linePts.push({x: lerp(a.x, b.x, nextGrow), y: lerp(a.y, b.y, nextGrow)});
  }
  const shownRate = Math.round(lerp(RATES[shownIdx], RATES[Math.min(shownIdx + 1, RATES.length - 1)], nextGrow));

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <GlowFilter id="rl-glow" blur={5} />
        </defs>
        <ModelCube
          id="rl-cube"
          absFrame={abs}
          {...pose}
          emblem={1}
          glow={Math.max(rewardGlow, missGlow * 0.6)}
          glowColor={rewardGlow >= missGlow ? COLORS.cyan : COLORS.error}
        />

        <g opacity={content}>
          {/* The loop: attempt goes out over the top, reward comes back underneath. Dashes flow in loop direction. */}
          <g opacity={arcs} fill="none" strokeWidth={3} strokeDasharray="12 12">
            <path d={arcPath(ATTEMPT_ARC)} stroke={rgba(COLORS.white, 0.45)} strokeDashoffset={-frame * 1.5} />
            <path d={arcPath(REWARD_ARC)} stroke={rgba(COLORS.cyan, 0.6)} strokeDashoffset={-frame * 1.5} />
          </g>
          <Caption x={965} y={308} text="ATTEMPT" opacity={arcs} />
          <Caption x={965} y={694} text="REWARD" opacity={arcs} color={COLORS.cyan} />

          {/* Automatic checker. */}
          <g opacity={smooth(R.arcs)}>
            <rect x={CHECKER.x - CHECKER.w / 2} y={CHECKER.y - CHECKER.h / 2} width={CHECKER.w} height={CHECKER.h} rx={22} fill={COLORS.charcoal} stroke={COLORS.cyan} strokeWidth={3} />
            <Gear x={CHECKER.x} y={CHECKER.y - 58} size={54} angle={frame * 3} />
            <Caption x={CHECKER.x} y={CHECKER.y + CHECKER.h / 2 + 32} text="AUTOMATIC CHECKER" color={COLORS.cyan} />
            {lastVerdict >= 0 ? (
              <g transform={`translate(${CHECKER.x - 40} ${CHECKER.y + 30})`}>
                <g transform={`scale(${spring({frame: frame - timing[lastVerdict].verdict, fps, config: {damping: 10, stiffness: 200}})})`}>
                  <Mark ok={TASKS[lastVerdict].ok} />
                </g>
                <text x={44} y={0} fill={TASKS[lastVerdict].ok ? COLORS.cyan : COLORS.error} fontFamily={FONT} fontWeight={800} fontSize={40} dominantBaseline="central">
                  {TASKS[lastVerdict].ok ? '+1' : '0'}
                </text>
              </g>
            ) : null}
          </g>

          {/* Current problem above the model. */}
          {current >= 0 ? (
            <g opacity={smooth(timing[current].start, 6)}>
              <rect x={POSE.x - 170} y={210} width={340} height={64} rx={16} fill={COLORS.charcoal} stroke={rgba(COLORS.white, 0.5)} strokeWidth={2} />
              <text x={POSE.x} y={242} fill={COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={30} textAnchor="middle" dominantBaseline="central">
                {TASKS[current].problem}
              </text>
              <Caption x={POSE.x} y={186} text="PRACTICE PROBLEM" size={16} />
            </g>
          ) : null}

          {/* Attempts and rewards in flight. */}
          {timing.map((c, i) => {
            const ta = (frame - c.launch) / c.travel;
            const tr = (frame - (c.verdict + RESULT_TO_REWARD)) / c.travel;
            const a = bez(ATTEMPT_ARC, Math.min(1, Math.max(0, ta)));
            const r = bez(REWARD_ARC, Math.min(1, Math.max(0, tr)));
            const color = TASKS[i].ok ? COLORS.cyan : COLORS.error;
            return (
              <g key={i}>
                {ta >= 0 && ta <= 1 ? (
                  <g transform={`translate(${a.x} ${a.y})`}>
                    <rect x={-70} y={-26} width={140} height={52} rx={26} fill={COLORS.charcoal} stroke={COLORS.white} strokeWidth={2} />
                    <text x={0} y={0} fill={COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={24} textAnchor="middle" dominantBaseline="central">
                      {TASKS[i].attempt}
                    </text>
                  </g>
                ) : null}
                {tr >= 0 && tr <= 1 ? (
                  <g transform={`translate(${r.x} ${r.y})`}>
                    <circle r={26} fill={color} filter="url(#rl-glow)" />
                    <text x={0} y={0} fill={COLORS.charcoal} fontFamily={FONT} fontWeight={800} fontSize={22} textAnchor="middle" dominantBaseline="central">
                      {TASKS[i].ok ? '+1' : '0'}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Success rate climbs as rewarded behaviour is reinforced. */}
          <g opacity={smooth(R.arcs + 20)}>
            <line x1={CHART.x} y1={CHART.y + CHART.h} x2={CHART.x + CHART.w} y2={CHART.y + CHART.h} stroke={rgba(COLORS.white, 0.25)} strokeWidth={2} />
            <Caption x={CHART.x} y={CHART.y - 22} text="SUCCESS RATE" anchor="start" />
            <polyline points={linePts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={COLORS.cyan} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" filter="url(#rl-glow)" />
            <text x={CHART.x + CHART.w + 30} y={CHART.y + CHART.h / 2} fill={COLORS.cyan} fontFamily={FONT} fontWeight={800} fontSize={52} dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
              {`${shownRate}%`}
            </text>
          </g>
        </g>
      </svg>

      <div style={{opacity: content}}>
        <Pinned>
          <SceneTitle text="REINFORCEMENT LEARNING" mode="corner" />
        </Pinned>
      </div>
      <Pinned>
        <LoopBadge kind="auto" opacity={badge} />
      </Pinned>
    </AbsoluteFill>
  );
};
