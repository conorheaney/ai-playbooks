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
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {FEEDBACK as F, SCENES} from '../timing';

const POSE = {x: 960, y: 470, size: 80};
const QUESTION = 'Explain gravity to a 10-year-old.';
const ANSWER_A = 'Gravity is the curvature of spacetime described by general relativity.';
const ANSWER_B = 'Gravity is an invisible pull that makes things fall to the ground!';
const CARD_A = {x: 410, y: 470};
const CARD_B = {x: 1510, y: 470};
const RATER = {x: 960, y: 820};
const REWARD = {x: 1510, y: 830, w: 380, h: 130};
const STREAM_DOTS = 12;
const COMPARISONS = 1_000_000;

// Quadratic Bézier point.
const bez = (a: Vec2, c: Vec2, b: Vec2, t: number): Vec2 => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

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

  // The person picks B; A dims, B flies into the reward model.
  const picked = smooth(F.pick, 10);
  const toReward = interpolate(frame, [F.toReward, F.rewardIn], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const bPos = mix2(CARD_B, REWARD, toReward);
  const meter = interpolate(frame, [F.rewardIn - 4, F.rewardIn + 4, F.streamStart + 4, F.streamEnd], [0, 0.35, 0.35, 0.92], clampOpts);
  const comparisons = interpolate(frame, [F.rewardIn, F.streamEnd], [1, COMPARISONS], {...clampOpts, easing: Easing.in(Easing.quad)});

  // Reward signal from the reward model back into the model.
  const sigFrom = {x: REWARD.x - REWARD.w / 2, y: REWARD.y - 30};
  const sigCtrl = {x: 1240, y: 640};
  const sigTo = {x: POSE.x + 110, y: POSE.y + 60};
  const sigDraw = interpolate(frame, [F.signal, F.signal + 12], [0, 1], clampOpts);
  const sigT = interpolate(frame, [F.signal + 4, F.signalEnd], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.quad)});
  const sigDot = bez(sigFrom, sigCtrl, sigTo, sigT);
  const learnGlow = flashAt(frame, F.signalEnd, 26);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <GlowFilter id="fb-glow" blur={5} />
        </defs>
        <ModelCube id="fb-cube" absFrame={abs} {...pose} emblem={1} glow={learnGlow} glowColor={COLORS.purple} />

        <g opacity={content}>
          {/* Person comparing the answers. */}
          <g opacity={smooth(F.rater)}>
            <Person {...RATER} size={96} />
            <Caption x={RATER.x} y={RATER.y + 80} text="A PERSON PICKS THE BETTER ANSWER" />
            {picked > 0 ? (
              <line
                x1={RATER.x + 40}
                y1={RATER.y - 30}
                x2={lerp(RATER.x + 40, CARD_B.x - 230, picked)}
                y2={lerp(RATER.y - 30, CARD_B.y + 70, picked)}
                stroke={COLORS.purple}
                strokeWidth={4}
                strokeDasharray="10 10"
                opacity={1 - toReward}
              />
            ) : null}
          </g>

          {/* Reward model: learns what people prefer. */}
          <g opacity={smooth(F.toReward - 10)}>
            <rect x={REWARD.x - REWARD.w / 2} y={REWARD.y - REWARD.h / 2} width={REWARD.w} height={REWARD.h} rx={20} fill={COLORS.charcoal} stroke={COLORS.purple} strokeWidth={3} filter={flashAt(frame, F.rewardIn) > 0.1 ? 'url(#fb-glow)' : undefined} />
            <Caption x={REWARD.x - REWARD.w / 2 + 28} y={REWARD.y - 36} text="REWARD MODEL" anchor="start" color={COLORS.purple} />
            <rect x={REWARD.x - REWARD.w / 2 + 28} y={REWARD.y - 6} width={REWARD.w - 56} height={14} rx={7} fill={rgba(COLORS.white, 0.1)} />
            <rect x={REWARD.x - REWARD.w / 2 + 28} y={REWARD.y - 6} width={(REWARD.w - 56) * meter} height={14} rx={7} fill={COLORS.purple} />
            <text x={REWARD.x - REWARD.w / 2 + 28} y={REWARD.y + 36} fill={COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={22} dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
              {`${Math.round(comparisons).toLocaleString('en-US')} comparisons`}
            </text>
          </g>

          {/* Many more comparisons streaming from people into the reward model. */}
          {Array.from({length: STREAM_DOTS}, (_, i) => {
            const start = F.streamStart + i * ((F.streamEnd - F.streamStart - 18) / (STREAM_DOTS - 1));
            const t = (frame - start) / 18;
            if (t < 0 || t > 1) {
              return null;
            }
            const p = mix2({x: RATER.x + 60, y: RATER.y}, {x: REWARD.x - REWARD.w / 2, y: REWARD.y}, t);
            return <circle key={i} cx={p.x} cy={p.y} r={7} fill={COLORS.purple} filter="url(#fb-glow)" />;
          })}

          {/* Reward signal back into the model. */}
          {sigDraw > 0 ? (
            <>
              <path
                d={`M${sigFrom.x} ${sigFrom.y}Q${sigCtrl.x} ${sigCtrl.y} ${sigTo.x} ${sigTo.y}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - sigDraw}
                stroke={COLORS.purple}
                strokeWidth={3}
                fill="none"
              />
              <Caption x={1290} y={600} text="REWARD SIGNAL" color={COLORS.purple} size={18} />
              {sigT > 0 && sigT < 1 ? <circle cx={sigDot.x} cy={sigDot.y} r={12} fill={COLORS.purple} filter="url(#fb-glow)" /> : null}
            </>
          ) : null}
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
          opacity={smooth(F.cards) * (1 - toReward)}
          scale={1 - 0.85 * toReward}
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
