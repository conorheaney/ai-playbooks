import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mark} from '../../../shared/components/Bubble';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {CUBE_HOME} from '../layout';
import {SCENES, SETTINGS as S} from '../timing';

const LANES_X = 1230;
const LANE_W = 980;
const LANE_Y = [440, 575, 710];
const SLIDER = {x: 1230, y: 262, w: 600};

// What the three runs say at each knob position. Only the last phase has a fluent mistake.
const TEXTS = [
  ["Canberra is Australia's capital.", "Australia's capital city is Canberra.", 'The capital of Australia is Canberra.'],
  ['The capital of Australia is Canberra.', 'The capital of Australia is Canberra.', 'The capital of Australia is Canberra.'],
  ['Canberra is the capital of Australia.', "Australia's capital? Canberra.", 'The capital of Australia is Sydney.'],
];
const WRONG = {phase: 2, lane: 2, word: 'Sydney'};

// Typed text where an optional wrong word turns red as it appears.
const Typed: React.FC<{text: string; chars: number; wrong?: string}> = ({text, chars, wrong}) => {
  const typed = text.slice(0, Math.max(0, Math.floor(chars)));
  const at = wrong ? text.indexOf(wrong) : -1;
  if (at < 0 || typed.length <= at) {
    return <>{typed}</>;
  }
  return (
    <>
      {typed.slice(0, at)}
      <span style={{color: COLORS.error}}>{typed.slice(at, at + wrong!.length)}</span>
      {typed.slice(at + wrong!.length)}
    </>
  );
};

export const SettingsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.settings.from + frame;
  const dur = SCENES.settings.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const content = presence(frame, 0, dur, 12, 15);

  // The knob starts in the middle, goes down, then up.
  const [down, up] = S.knobMoves;
  const knob = interpolate(
    frame,
    [down[0], down[1], up[0], up[1]],
    [S.phases[0].knob, S.phases[1].knob, S.phases[1].knob, S.phases[2].knob],
    {...clampOpts, easing: Easing.inOut(Easing.cubic)},
  );
  const knobX = SLIDER.x - SLIDER.w / 2 + SLIDER.w * knob;

  // The current phase is the last one that has started typing.
  const phase = S.phases.reduce((cur, p, i) => (frame >= p.type[0][0] ? i : cur), 0);
  const P = S.phases[phase];
  // The last phase never clears; the scene's own fade-out removes it.
  const textOpacity = Number.isFinite(P.clear) ? interpolate(frame, [P.clear - 10, P.clear], [1, 0], clampOpts) : 1;
  const typing = S.phases.reduce((max, p) => Math.max(max, presence(frame, p.type[0][0], p.type[2][1] + 4, 4, 6)), 0);
  const stamp = spring({frame: frame - S.stamp, fps, config: {damping: 12, stiffness: 170}});

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <linearGradient id="st-track" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={COLORS.cyan} />
            <stop offset="100%" stopColor={COLORS.purple} />
          </linearGradient>
        </defs>
        <LockedCube id="st-cube" absFrame={abs} {...CUBE_HOME} glow={typing * (0.3 + 0.3 * Math.sin(frame / 4))} />

        <g opacity={content * smooth(0, 14)}>
          <Caption x={SLIDER.x} y={SLIDER.y - 52} text="VARIATION" color={COLORS.white} size={22} />
          <rect x={SLIDER.x - SLIDER.w / 2} y={SLIDER.y - 6} width={SLIDER.w} height={12} rx={6} fill={rgba(COLORS.white, 0.12)} />
          <rect x={SLIDER.x - SLIDER.w / 2} y={SLIDER.y - 6} width={knobX - (SLIDER.x - SLIDER.w / 2)} height={12} rx={6} fill="url(#st-track)" />
          <circle cx={knobX} cy={SLIDER.y} r={20} fill={COLORS.charcoal} stroke={COLORS.cyan} strokeWidth={4} />
          <Caption x={SLIDER.x - SLIDER.w / 2 - 24} y={SLIDER.y} text="LOW" anchor="end" opacity={knob < 0.35 ? 1 : 0.45} />
          <Caption x={SLIDER.x + SLIDER.w / 2 + 24} y={SLIDER.y} text="HIGH" anchor="start" opacity={knob > 0.65 ? 1 : 0.45} />
        </g>
      </svg>

      <div style={{opacity: content}}>
        {LANE_Y.map((y, i) => {
          const [t0, t1] = P.type[i];
          const text = TEXTS[phase][i];
          const chars = interpolate(frame, [t0, t1], [0, text.length], clampOpts);
          const isWrong = phase === WRONG.phase && i === WRONG.lane;
          const markAt = P.marks[i];
          const mark = spring({frame: frame - markAt, fps, config: {damping: 12, stiffness: 180}});
          const flagged = isWrong && frame >= markAt;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: LANES_X - LANE_W / 2,
                top: y - 48,
                width: LANE_W,
                height: 96,
                boxSizing: 'border-box',
                borderRadius: 20,
                border: `2px solid ${flagged ? COLORS.error : rgba(COLORS.white, 0.25)}`,
                background: rgba(COLORS.charcoal, 0.9),
                display: 'flex',
                alignItems: 'center',
                fontFamily: FONT,
                color: COLORS.white,
                opacity: smooth(4 + i * 4, 12),
                transform: `translateY(${(1 - smooth(4 + i * 4, 12)) * 20}px)`,
              }}
            >
              <div style={{width: 130, flexShrink: 0, textAlign: 'center', fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color: rgba(COLORS.white, 0.55)}}>RUN {i + 1}</div>
              <div style={{fontSize: 34, fontWeight: 500, whiteSpace: 'nowrap', opacity: textOpacity}}>
                <Typed text={text} chars={chars} wrong={isWrong ? WRONG.word : undefined} />
              </div>
              {frame >= markAt ? (
                <svg width={52} height={52} viewBox="-26 -26 52 52" style={{position: 'absolute', right: -70, top: 22, transform: `scale(${mark})`, opacity: textOpacity}}>
                  <Mark ok={!isWrong} />
                </svg>
              ) : null}
            </div>
          );
        })}

        {frame >= S.stamp ? (
          <div
            style={{
              position: 'absolute',
              left: LANES_X,
              top: 870,
              transform: `translate(-50%, -50%) rotate(-4deg) scale(${lerp(1.6, 1, stamp)})`,
              opacity: Math.min(1, stamp * 1.4),
              padding: '12px 36px',
              border: `4px solid ${COLORS.error}`,
              borderRadius: 14,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 52,
              letterSpacing: '0.04em',
              color: COLORS.error,
              background: rgba(COLORS.charcoal, 0.85),
              whiteSpace: 'nowrap',
            }}
          >
            FLUENT ≠ CORRECT
          </div>
        ) : null}
        <Pinned>
          <SceneTitle text="SAME PROMPT, DIFFERENT ANSWERS" mode="corner" />
        </Pinned>
      </div>
    </AbsoluteFill>
  );
};
