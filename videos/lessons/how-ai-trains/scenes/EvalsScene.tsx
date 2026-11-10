import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {Mark} from '../../../shared/components/Bubble';
import {GlowFilter} from '../../../shared/components/Glow';
import {ModelCube} from '../components/ModelCube';
import {Caption, LoopBadge, Person} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {Vec2} from '../../../shared/lib/math';
import {clampOpts, cubePose, flashAt} from '../lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {EVALS as E, SCENES} from '../timing';

const POSE = {x: 500, y: 480, size: 85};
const PANEL = {x: 880, y: 230, w: 900, h: 500};
const BAR = {x: 1150, w: 460, h: 22};
const PASS = 0.75;
const ROWS = [
  {name: 'REASONING', run1: 0.86, run2: 0.88},
  {name: 'CODING', run1: 0.62, run2: 0.84},
  {name: 'KNOWLEDGE', run1: 0.81, run2: 0.83},
  {name: 'SAFETY', run1: 0.9, run2: 0.93},
];
const ROW_Y = (i: number) => PANEL.y + 150 + i * 85;
const STAGGER = 8;
const FILL = 40;
// Run 2 fills faster, so the approval can land early and hold before the scene ends.
const STAGGER_2 = 4;
const FILL_2 = 24;
const GHOSTS = [2, 1]; // stacked scorecards behind the panel: four rows stand in for thousands of benchmarks
const GHOST_STEP = 14;
const LOOP = {from: {x: PANEL.x, y: ROW_Y(1)}, ctrl: {x: 740, y: 740}, to: {x: POSE.x + 60, y: POSE.y + 150}};
const REVIEWERS = [1150, 1250];

const bez = (a: {from: Vec2; ctrl: Vec2; to: Vec2}, t: number): Vec2 => ({
  x: (1 - t) * (1 - t) * a.from.x + 2 * (1 - t) * t * a.ctrl.x + t * t * a.to.x,
  y: (1 - t) * (1 - t) * a.from.y + 2 * (1 - t) * t * a.ctrl.y + t * t * a.to.y,
});

export const EvalsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.evals.from + frame;
  const dur = SCENES.evals.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const pop = (start: number) => (frame >= start ? spring({frame: frame - start, fps, config: {damping: 10, stiffness: 180}}) : 0);

  // The cube glides home in the last 14 frames, only once the scorecard has fully faded, so it never
  // passes over the scorecard's text. The stamp still holds for about 1 s before the fade.
  const HOME_FRAMES = 14;
  const pose = cubePose(frame, fps, dur, POSE, {homeFrames: HOME_FRAMES});
  const content = interpolate(frame, [dur - HOME_FRAMES - 6, dur - HOME_FRAMES], [1, 0], clampOpts);
  // The humans-in-the-loop badge arrives with the reviewers.
  const badge = interpolate(frame, [E.approve, E.approve + 10, dur - 12, dur], [0, 1, 1, 0], clampOpts);
  const secondRun = frame >= E.run2 - 6;
  const reset = interpolate(frame, [E.run2 - 6, E.run2], [1, 0], clampOpts);

  const loopDraw = interpolate(frame, [E.loopBack, E.loopBack + 14], [0, 1], clampOpts);
  const loopT = interpolate(frame, [E.loopBack + 6, E.loopArrive], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.quad)});
  const loopDot = bez(LOOP, loopT);
  const loopFade = interpolate(frame, [E.run2, E.run2 + 10], [1, 0], clampOpts);
  // "More training": the Scene 6 loop echoes around the model, in purple, as the path arrives.
  const retrain = interpolate(frame, [E.loopArrive - 8, E.loopArrive, E.loopArrive + 12, E.loopArrive + 20], [0, 1, 1, 0], clampOpts);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <GlowFilter id="ev-glow" blur={5} />
        </defs>
        <g opacity={content}>
          {/* Benchmark scorecard, with more stacked behind it. */}
          <g opacity={smooth(E.panel)}>
            {GHOSTS.map((g) => (
              <rect
                key={g}
                x={PANEL.x + g * GHOST_STEP}
                y={PANEL.y - g * GHOST_STEP}
                width={PANEL.w}
                height={PANEL.h}
                rx={24}
                fill={COLORS.charcoal}
                stroke={rgba(COLORS.white, 0.1 + 0.05 * (GHOSTS.length - g))}
                strokeWidth={2}
              />
            ))}
            <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={24} fill={rgba(COLORS.charcoal, 0.92)} stroke={rgba(COLORS.white, 0.25)} strokeWidth={2} />
            <Caption x={PANEL.x + 40} y={PANEL.y + 55} text="BENCHMARKS" anchor="start" color={COLORS.white} size={24} />
            <Caption x={PANEL.x + PANEL.w - 40} y={PANEL.y + 55} text={secondRun ? 'RUN 2' : 'RUN 1'} anchor="end" size={22} />
            <Caption x={PANEL.x + PANEL.w / 2} y={PANEL.y + PANEL.h + 40} text="4 OF THOUSANDS OF BENCHMARKS" size={22} color={rgba(COLORS.white, 0.6)} />
            <line
              x1={BAR.x + BAR.w * PASS}
              y1={ROW_Y(0) - 35}
              x2={BAR.x + BAR.w * PASS}
              y2={ROW_Y(ROWS.length - 1) + 35}
              stroke={rgba(COLORS.white, 0.6)}
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <Caption x={BAR.x + BAR.w * PASS} y={ROW_Y(0) - 54} text="PASS" size={22} />

            {ROWS.map((row, i) => {
              const y = ROW_Y(i);
              const runStart = secondRun ? E.run2 + i * STAGGER_2 : E.run1 + i * STAGGER;
              const fillFrames = secondRun ? FILL_2 : FILL;
              const fill = interpolate(frame, [runStart, runStart + fillFrames], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
              const score = (secondRun ? row.run2 : row.run1) * fill * (secondRun ? 1 : reset);
              const done = frame >= runStart + fillFrames;
              const passed = (secondRun ? row.run2 : row.run1) >= PASS;
              const color = done && !passed ? COLORS.error : COLORS.cyan;
              return (
                <g key={row.name}>
                  <Caption x={PANEL.x + 40} y={y} text={row.name} anchor="start" color={COLORS.white} size={24} />
                  <rect x={BAR.x} y={y - BAR.h / 2} width={BAR.w} height={BAR.h} rx={BAR.h / 2} fill={rgba(COLORS.white, 0.08)} />
                  <rect x={BAR.x} y={y - BAR.h / 2} width={BAR.w * score} height={BAR.h} rx={BAR.h / 2} fill={color} />
                  {done && (secondRun || reset > 0) ? (
                    <g transform={`translate(${BAR.x + BAR.w + 50} ${y}) scale(${0.8 * pop(runStart + fillFrames) * (secondRun ? 1 : reset)})`}>
                      <Mark ok={passed} />
                    </g>
                  ) : null}
                </g>
              );
            })}
          </g>

          {/* Falls short: back for more training. */}
          {loopDraw > 0 ? (
            <g opacity={loopFade}>
              <path
                d={`M${LOOP.from.x} ${LOOP.from.y}Q${LOOP.ctrl.x} ${LOOP.ctrl.y} ${LOOP.to.x} ${LOOP.to.y}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - loopDraw}
                stroke={COLORS.purple}
                strokeWidth={3}
                fill="none"
              />
              <Caption x={700} y={712} text="BACK TO TRAINING" color={COLORS.purple} size={24} />
              {loopT > 0 && loopT < 1 ? <circle cx={loopDot.x} cy={loopDot.y} r={12} fill={COLORS.purple} filter="url(#ev-glow)" /> : null}
            </g>
          ) : null}

          {retrain > 0 ? (
            <g opacity={retrain} fill="none" stroke={COLORS.purple} strokeWidth={3} strokeDasharray="12 12" filter="url(#ev-glow)">
              <path d={`M${pose.x - 150} ${pose.y - 80}A190 150 0 0 1 ${pose.x + 150} ${pose.y - 80}`} strokeDashoffset={-frame * 3} />
              <path d={`M${pose.x + 150} ${pose.y + 100}A190 150 0 0 1 ${pose.x - 150} ${pose.y + 100}`} strokeDashoffset={-frame * 3} />
            </g>
          ) : null}

          {/* People review the results and sign off. */}
          <g opacity={smooth(E.approve)}>
            {REVIEWERS.map((x) => (
              <Person key={x} x={x} y={850} size={72} />
            ))}
            <Caption x={(REVIEWERS[0] + REVIEWERS[1]) / 2} y={918} text="REVIEWERS" size={24} />
            <g transform={`translate(1540 850) rotate(-4) scale(${pop(E.approve + 6)})`}>
              <rect x={-210} y={-38} width={420} height={76} rx={12} fill="none" stroke={COLORS.cyan} strokeWidth={4} />
              <text x={0} y={0} fill={COLORS.cyan} fontFamily={FONT} fontWeight={800} fontSize={26} letterSpacing="0.1em" textAnchor="middle" dominantBaseline="central">
                APPROVED FOR RELEASE
              </text>
            </g>
          </g>
        </g>
        {/* Drawn last: on its way home the cube passes in front of the fading scorecard, not behind it. */}
        <ModelCube id="ev-cube" absFrame={abs} {...pose} emblem={1} glow={flashAt(frame, E.loopArrive, 24)} glowColor={COLORS.purple} />
      </svg>

      <div style={{opacity: content}}>
        <Pinned>
          <SceneTitle text="EVALUATION" mode="corner" />
        </Pinned>
      </div>
      <Pinned>
        <LoopBadge kind="human" opacity={badge} />
      </Pinned>
    </AbsoluteFill>
  );
};
