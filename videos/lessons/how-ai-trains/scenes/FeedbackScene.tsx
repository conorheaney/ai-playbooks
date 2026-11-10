import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {Bubble} from '../../../shared/components/Bubble';
import {GlowFilter} from '../../../shared/components/Glow';
import {ModelCube} from '../components/ModelCube';
import {Caption, LoopBadge, Person} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp, mix2, Vec2} from '../../../shared/lib/math';
import {clampOpts, cubePose, flashAt} from '../lib/motion';
import {COLORS, VIDEO} from '../../../shared/theme';
import {FEEDBACK as F, SCENES} from '../timing';

const POSE = {x: 960, y: 470, size: 80};
const QUESTION = 'Explain gravity to a 10-year-old.';
const ANSWER_A = 'Gravity is the curvature of spacetime described by general relativity.';
const ANSWER_B = 'Gravity is an invisible pull that makes things fall to the ground!';
const CARD_A = {x: 410, y: 470};
const CARD_B = {x: 1510, y: 470};
const RATER = {x: 960, y: 800};
// More people join once the comparisons start streaming: it's many people, not one.
const CROWD = [
  {x: 840, y: 790},
  {x: 1080, y: 790},
];
const STREAM_DOTS = 15;
const DOT_TRAVEL = 18;
const COMPARISONS = 1_000_000;

// Quadratic Bézier point.
const bez = (a: Vec2, c: Vec2, b: Vec2, t: number): Vec2 => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});
const SOURCES = [RATER, ...CROWD];
// Each preference dot leaves one of the people and lands in the model.
const DOTS = Array.from({length: STREAM_DOTS}, (_, i) => ({
  start: F.streamStart + i * ((F.streamEnd - F.streamStart - DOT_TRAVEL) / (STREAM_DOTS - 1)),
  from: SOURCES[i % SOURCES.length],
}));
const FIRST_ARRIVAL = DOTS[0].start + DOT_TRAVEL;

export const FeedbackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.feedback.from + frame;
  const dur = SCENES.feedback.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const pop = (start: number) => (frame >= start ? spring({frame: frame - start, fps, config: {damping: 10, stiffness: 180}}) : 0);

  const pose = cubePose(frame, fps, dur, POSE);
  const content = interpolate(frame, [F.contentOut, F.contentOut + 12], [1, 0], clampOpts);
  const badge = interpolate(frame, [0, 10, dur - 12, dur], [0, 1, 1, 0], clampOpts);

  // The person picks B; A dims, and the preferred answer goes straight into the model.
  const picked = smooth(F.pick, 10);
  const toModel = interpolate(frame, [F.toReward, F.rewardIn], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const bPos = mix2(CARD_B, pose, toModel);
  const crowd = smooth(F.streamStart, 12);
  const counterIn = smooth(FIRST_ARRIVAL, 8);
  const comparisons = Math.round(interpolate(frame, [FIRST_ARRIVAL, F.streamEnd], [1, COMPARISONS], {...clampOpts, easing: Easing.in(Easing.quad)}));

  // The model takes on their preferences: it glows as each one lands, then once more as it settles.
  const dotGlow = Math.max(0, ...DOTS.map((d) => flashAt(frame, d.start + DOT_TRAVEL, 10)));
  const learnGlow = Math.max(flashAt(frame, F.rewardIn, 16), dotGlow * 0.6, flashAt(frame, F.signalEnd, 26));
  const learnedLabel = interpolate(frame, [F.signal, F.signal + 10, F.contentOut, F.contentOut + 12], [0, 1, 1, 0], clampOpts);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <GlowFilter id="fb-glow" blur={5} />
        </defs>
        <ModelCube id="fb-cube" absFrame={abs} {...pose} emblem={1} glow={learnGlow} glowColor={COLORS.purple} />

        <g opacity={content}>
          {/* People comparing answers: one picks first, then many more join. */}
          <g opacity={crowd * 0.55}>
            {CROWD.map((p) => (
              <Person key={p.x} {...p} size={72} />
            ))}
          </g>
          <g opacity={smooth(F.rater)}>
            <Person {...RATER} size={96} />
            <Caption x={RATER.x} y={RATER.y + 80} text="A PERSON PICKS THE BETTER ANSWER" size={24} opacity={1 - Math.min(1, crowd * 2)} />
            <Caption x={RATER.x} y={RATER.y + 80} text="PEOPLE PICK THE BETTER ANSWER" size={24} opacity={Math.max(0, crowd * 2 - 1)} />
            <text x={RATER.x} y={RATER.y + 124} fill={COLORS.white} opacity={counterIn * 0.85} fontFamily={FONT} fontWeight={700} fontSize={26} textAnchor="middle" dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
              {`${comparisons.toLocaleString('en-US')} ${comparisons === 1 ? 'comparison' : 'comparisons'}`}
            </text>
            {picked > 0 ? (
              <line
                x1={RATER.x + 40}
                y1={RATER.y - 30}
                x2={lerp(RATER.x + 40, CARD_B.x - 230, picked)}
                y2={lerp(RATER.y - 30, CARD_B.y + 70, picked)}
                stroke={COLORS.purple}
                strokeWidth={4}
                strokeDasharray="10 10"
                opacity={1 - toModel}
              />
            ) : null}
          </g>

          {/* Preferences stream from all the people straight into the model. */}
          {DOTS.map((d, i) => {
            const t = (frame - d.start) / DOT_TRAVEL;
            if (t < 0 || t > 1) {
              return null;
            }
            const from = {x: d.from.x, y: d.from.y - 50};
            const to = {x: pose.x, y: pose.y + 120};
            const p = bez(from, {x: (from.x + to.x) / 2 + 40, y: (from.y + to.y) / 2}, to, Easing.inOut(Easing.quad)(t));
            return <circle key={i} cx={p.x} cy={p.y} r={7} fill={COLORS.purple} filter="url(#fb-glow)" />;
          })}
          <Caption x={RATER.x + 190} y={665} text="PREFERENCES" anchor="start" color={COLORS.purple} size={24} opacity={crowd * (1 - learnedLabel)} />
          <Caption x={RATER.x + 190} y={665} text="LEARNS THEIR PREFERENCES" anchor="start" color={COLORS.purple} size={24} opacity={learnedLabel} />
        </g>
      </svg>

      <div style={{opacity: content}}>
        <Bubble x={POSE.x} y={240} width={640} label="PROMPT" text={QUESTION} opacity={smooth(F.question)} fontSize={28} />
        <Bubble {...CARD_A} width={460} label="ANSWER A" text={ANSWER_A} opacity={smooth(F.cards) * (1 - 0.65 * picked)} fontSize={26} />
        <Bubble
          {...bPos}
          width={460}
          label="ANSWER B"
          text={ANSWER_B}
          opacity={smooth(F.cards) * (1 - toModel)}
          scale={1 - 0.85 * toModel}
          fontSize={26}
          mark="ok"
          markScale={pop(F.pick)}
        />
        <Pinned>
          <SceneTitle text="LEARN FROM FEEDBACK" mode="corner" />
        </Pinned>
      </div>
      <Pinned>
        <LoopBadge kind="human" opacity={badge} />
      </Pinned>
    </AbsoluteFill>
  );
};
