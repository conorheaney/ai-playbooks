import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble} from '../../../shared/components/Bubble';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, Segment, segmentRect} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {CUBE_HOME, TANK_HOME} from '../layout';
import {MIDDLE as M, SCENES} from '../timing';

const TALL = {h: 980, y: 550};
const ROWS = 16;
const FILL = 0.92;
const KEY_ROW = 7; // mid-tank
const FACT = 'Passport must be valid for 6 months after arrival.';
const QUESTION = 'Any document rules for my trip?';
const ANSWER = 'Just bring your booking confirmation.';

// Attention is strongest near the start and end of a long context, weakest in the middle.
// Illustrative only: the real pattern varies by model, task and position.
const attention = (i: number) => 0.3 + 0.7 * Math.pow(Math.abs((2 * i) / (ROWS - 1) - 1), 1.6);

export const MiddleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.middle.from + frame;
  const dur = SCENES.middle.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const stretch = interpolate(frame, [M.stretch[0], M.stretch[1]], [0, 1], ease) * interpolate(frame, [M.reset, dur], [1, 0], ease);
  const tank = {x: TANK_HOME.x, w: TANK_HOME.w, h: lerp(TANK_HOME.h, TALL.h, stretch), y: lerp(TANK_HOME.y, TALL.y, stretch)};
  const tankIn = interpolate(frame, [0, 12], [0, 1], clampOpts);
  const rowsOut = interpolate(frame, [M.reset - 6, M.reset + 8], [1, 0], clampOpts);
  const focus = interpolate(frame, [M.attention[0], M.attention[1]], [0, 1], ease);
  const highlight = smooth(M.highlight, 18);
  const missed = frame >= M.missed ? 0.5 + 0.5 * Math.sin((frame - M.missed) / 3) : 0;
  const content = presence(frame, 0, M.reset + 8, 1, 12);

  const segments: Segment[] = Array.from({length: ROWS}, (_, i) => {
    const appear = interpolate(frame, [M.rowsStart + 3 * i, M.rowsStart + 3 * i + 8], [0, 1], clampOpts);
    const bright = lerp(1, attention(i), focus);
    const key = i === KEY_ROW;
    return {
      kind: 'documents',
      from: (i / ROWS) * FILL,
      to: ((i + 1) / ROWS) * FILL,
      opacity: appear * rowsOut * (key && frame >= M.missed ? 1 : bright),
      tint: key && highlight > 0.01 ? rgba(COLORS.purple, 0.55 * highlight) : undefined,
      outline: key && missed > 0 ? COLORS.error : undefined,
      outlineOpacity: 0.4 + 0.6 * missed,
      text: key ? (frame >= M.missed ? 'MISSED' : 'PASSPORT RULE') : undefined,
      textOpacity: highlight,
    };
  });

  const geom = {...tank};
  const keyRect = segmentRect(geom, (KEY_ROW / ROWS) * FILL, ((KEY_ROW + 1) / ROWS) * FILL);
  const keyY = keyRect.y + keyRect.h / 2;
  const keyBright = lerp(1, attention(KEY_ROW), focus);

  // The question flies into the model; the answer misses the buried fact.
  const q = interpolate(frame, [M.question[0], M.question[1]], [0, 1], {...clampOpts, easing: Easing.in(Easing.quad)});
  const answerChars = interpolate(frame, [M.answer[0], M.answer[1]], [0, ANSWER.length], clampOpts);
  const answerMark = spring({frame: frame - M.missed, fps, config: {damping: 12, stiffness: 180}});
  const thinking = presence(frame, M.question[1] - 4, M.answer[1], 4, 8);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* Attention beams: bright to the ends of the context, faint to the middle. */}
        <g opacity={interpolate(frame, [M.attention[0], M.attention[0] + 20], [0, 1], clampOpts) * content}>
          {Array.from({length: ROWS}, (_, i) => {
            const r = segmentRect(geom, (i / ROWS) * FILL, ((i + 1) / ROWS) * FILL);
            const a = attention(i);
            return (
              <line
                key={i}
                x1={CUBE_HOME.x + 140}
                y1={CUBE_HOME.y - 20}
                x2={r.x - 4}
                y2={r.y + r.h / 2}
                stroke={COLORS.cyan}
                strokeWidth={1 + 3 * a * focus}
                opacity={0.06 + 0.5 * Math.pow(a, 2) * focus}
              />
            );
          })}
        </g>
        <LockedCube id="md-cube" absFrame={abs} {...CUBE_HOME} glow={thinking * 0.5} />

        <ContextTank id="md-tank" {...tank} opacity={tankIn} segments={segments} />

        {/* Taller window, same problem. */}
        <g opacity={presence(frame, M.stretch[0], M.attention[0] - 5, 12, 12)}>
          <line x1={tank.x - tank.w / 2 - 40} x2={tank.x - tank.w / 2 - 40} y1={tank.y - tank.h / 2 + 10} y2={tank.y + tank.h / 2 - 10} stroke={rgba(COLORS.white, 0.6)} strokeWidth={3} />
          <path d={`M${tank.x - tank.w / 2 - 52} ${tank.y - tank.h / 2 + 24} L${tank.x - tank.w / 2 - 40} ${tank.y - tank.h / 2 + 8} L${tank.x - tank.w / 2 - 28} ${tank.y - tank.h / 2 + 24}`} fill="none" stroke={rgba(COLORS.white, 0.6)} strokeWidth={3} />
          <path d={`M${tank.x - tank.w / 2 - 52} ${tank.y + tank.h / 2 - 24} L${tank.x - tank.w / 2 - 40} ${tank.y + tank.h / 2 - 8} L${tank.x - tank.w / 2 - 28} ${tank.y + tank.h / 2 - 24}`} fill="none" stroke={rgba(COLORS.white, 0.6)} strokeWidth={3} />
          <Caption x={tank.x - tank.w / 2 - 64} y={tank.y} text="BIGGER WINDOW" anchor="end" color={COLORS.white} size={22} />
        </g>

        {/* Leader from the buried row to its callout. */}
        <line x1={keyRect.x + keyRect.w + 4} y1={keyY} x2={1500} y2={keyY} stroke={frame >= M.missed ? COLORS.error : COLORS.purple} strokeWidth={2} opacity={highlight * lerp(1, 0.6, focus) * rowsOut} />
      </svg>

      <div style={{opacity: content}}>
        <Bubble
          x={1690}
          y={keyY}
          width={380}
          text={FACT}
          fontSize={22}
          label={frame >= M.missed ? 'MISSED' : 'IN THE DOCUMENTS'}
          color={frame >= M.missed ? COLORS.error : COLORS.purple}
          opacity={highlight * (frame >= M.missed ? 1 : lerp(1, 0.4 + 0.6 * keyBright, focus))}
          scale={lerp(0.9, 1, highlight)}
        />

        <Bubble
          x={lerp(360, CUBE_HOME.x, q)}
          y={lerp(900, CUBE_HOME.y, q)}
          width={520}
          text={QUESTION}
          fontSize={26}
          label="YOUR QUESTION"
          color={COLORS.cyan}
          opacity={frame < M.question[0] ? 0 : smooth(M.question[0], 8) * interpolate(q, [0.75, 1], [1, 0], clampOpts)}
          scale={lerp(1, 0.3, q)}
        />

        <Bubble
          x={CUBE_HOME.x}
          y={880}
          width={540}
          text={ANSWER}
          chars={answerChars}
          fontSize={26}
          label="RESPONSE"
          color={interpolateColors(answerMark, [0, 1], [COLORS.cyan, COLORS.error])}
          opacity={frame < M.answer[0] ? 0 : smooth(M.answer[0], 8)}
          mark="bad"
          markScale={frame >= M.missed ? answerMark : 0}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            width: 1120,
            top: 984,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 28,
            color: rgba(COLORS.white, 0.75),
            opacity: smooth(M.caption, 14),
          }}
        >
          Not a fixed zone. It varies by model, task and position.
        </div>
        <Pinned>
          <SceneTitle text="LOST IN THE MIDDLE" mode="corner" />
        </Pinned>
      </div>
    </AbsoluteFill>
  );
};
