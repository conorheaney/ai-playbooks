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
import {CUBE_HOME, TANK_HOME, TANK_TEXT} from '../layout';
import {MIDDLE as M, SCENES} from '../timing';

const TALL = {h: 900, y: 560}; // y 110–1010: inside the screen margins and below the title band
const ROWS = 16;
const FILL = 0.92;
const KEY_ROW = 7; // mid-tank
const CAPTION = {x: 560, y: 985};
// Short lines, so each can be read in the time it's on screen.
const FACT = "Keep for the device's lifetime."; // the row itself is labelled RECORDS RULE
const QUESTION = 'How long do we keep records?';
const ANSWER = 'Just keep them for a year.';

// Attention is strongest near the start and end of a long context, weakest in the middle.
// Illustrative only: the real pattern varies by model, task and position.
const attention = (i: number) => 0.15 + 0.85 * Math.pow(Math.abs((2 * i) / (ROWS - 1) - 1), 1.6);
// The six middle rows (rows 6–11 counting from 1) get no beam at all.
const BEAMLESS = (i: number) => i >= 5 && i <= 10;

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
      text: key ? (frame >= M.missed ? 'MISSED' : 'RECORDS RULE') : undefined,
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
            if (BEAMLESS(i)) {
              return null;
            }
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
                strokeWidth={1 + 5 * a * a}
                strokeLinecap="round"
                opacity={0.9 * a * a * focus}
              />
            );
          })}
        </g>
        <LockedCube id="md-cube" absFrame={abs} {...CUBE_HOME} glow={thinking * 0.5} />

        <ContextTank id="md-tank" textSizes={TANK_TEXT} {...tank} opacity={tankIn} segments={segments} />

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
          color={COLORS.cyan}
          opacity={frame < M.questionIn ? 0 : smooth(M.questionIn, 10) * interpolate(q, [0.75, 1], [1, 0], clampOpts)}
          scale={lerp(1, 0.3, q)}
        />

        <Bubble
          x={CUBE_HOME.x}
          y={880}
          width={540}
          text={ANSWER}
          chars={answerChars}
          fontSize={26}
          color={interpolateColors(answerMark, [0, 1], [COLORS.cyan, COLORS.error])}
          opacity={frame < M.answer[0] ? 0 : smooth(M.answer[0], 8)}
          mark="bad"
          markScale={frame >= M.missed ? answerMark : 0}
        />

        {/* The caveat, styled as a takeaway pill rather than a subtitle. */}
        <div
          style={{
            position: 'absolute',
            left: CAPTION.x,
            top: CAPTION.y,
            transform: `translate(-50%, calc(-50% + ${lerp(12, 0, smooth(M.caption, 14))}px))`,
            padding: '12px 30px',
            borderRadius: 32,
            border: `2px solid ${rgba(COLORS.white, 0.35)}`,
            background: rgba(COLORS.white, 0.07),
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 26,
            color: COLORS.white,
            whiteSpace: 'nowrap',
            opacity: smooth(M.caption, 14),
          }}
        >
          It varies by model and task.
        </div>
        <Pinned>
          <SceneTitle text="LOST IN THE MIDDLE" mode="corner" />
        </Pinned>
      </div>
    </AbsoluteFill>
  );
};
