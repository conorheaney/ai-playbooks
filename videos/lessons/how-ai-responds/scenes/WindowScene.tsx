import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {clampOpts, flashAt, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, fillTopY, Segment} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {CAPACITY, CUBE_HOME, INPUT, INPUT_TOP, TANK_HOME} from '../layout';
import {SCENES, WINDOW as W} from '../timing';

const REASONING_TOP = 0.63;
const OUTPUT_TOP = 0.74;

export const WindowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = SCENES.window.from + frame;
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const draw = interpolate(frame, [0, W.outlineEnd], [0, 1], ease);
  const fill = interpolate(frame, [W.fillStart, W.fillEnd], [0, INPUT_TOP], ease);
  const drain = interpolate(frame, [W.drain, W.drain + 18], [1, 0], ease);
  const reasoningTop = interpolate(frame, [W.reasoning, W.reasoningEnd], [INPUT_TOP, REASONING_TOP], ease);
  const outputTop = interpolate(frame, [W.reasoningEnd, W.outputEnd], [REASONING_TOP, OUTPUT_TOP], ease);
  const labelsOut = interpolate(frame, [W.drain, W.drain + 14], [1, 0], clampOpts);

  // Generated material drains away at the end so Scene 3 starts with input only.
  const used = fill + (reasoningTop - INPUT_TOP + outputTop - REASONING_TOP) * drain;

  const segments: Segment[] = [
    // Each input label appears as the counter passes the top of its slice.
    ...INPUT.map((s) => ({...s, labelOpacity: interpolate(fill, [s.to - 0.015, s.to], [0, 1], clampOpts)})),
    {
      kind: 'reasoning' as const,
      from: INPUT_TOP,
      to: INPUT_TOP + (reasoningTop - INPUT_TOP) * drain,
      labelOpacity: interpolate(frame, [W.reasoning + 6, W.reasoning + 18], [0, 1], clampOpts),
    },
    {
      kind: 'output' as const,
      from: INPUT_TOP + (reasoningTop - INPUT_TOP) * drain,
      to: INPUT_TOP + (outputTop - INPUT_TOP) * drain,
      labelOpacity: interpolate(frame, [W.reasoningEnd + 6, W.reasoningEnd + 18], [0, 1], clampOpts),
    },
  ];

  const left = TANK_HOME.x - TANK_HOME.w / 2;
  const bracketX = left - 100; // clear of the ruler's % labels
  const inputBottom = fillTopY(TANK_HOME, 0);
  const inputTop = fillTopY(TANK_HOME, INPUT_TOP);
  const bracket = presence(frame, W.inputBracket, W.drain + 14, 14, 14);
  const generating = presence(frame, W.reasoning, W.outputEnd + 6, 6, 10);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);
  const streamEnd = {x: left + 6, y: fillTopY(TANK_HOME, frame < W.reasoningEnd ? reasoningTop : outputTop)};

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* The model writes into the space above the input. */}
        {generating > 0.001 ? (
          <path
            d={`M${CUBE_HOME.x + 140} ${CUBE_HOME.y - 20} C ${CUBE_HOME.x + 360} ${CUBE_HOME.y - 160}, ${streamEnd.x - 260} ${streamEnd.y}, ${streamEnd.x} ${streamEnd.y}`}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={3}
            strokeDasharray="4 12"
            strokeDashoffset={-frame * 2}
            strokeLinecap="round"
            opacity={generating * 0.8}
          />
        ) : null}
        <LockedCube id="wi-cube" absFrame={abs} {...CUBE_HOME} glow={generating * (0.35 + 0.35 * pulse)} />

        <ContextTank
          id="wi-tank"
          {...TANK_HOME}
          segments={segments}
          draw={draw}
          ruler={draw * labelsOut}
          labels={labelsOut}
          readout={{tokens: used * CAPACITY, capacity: CAPACITY, opacity: draw, pulse: flashAt(frame, W.tokensPulse, 26)}}
          remaining={{from: OUTPUT_TOP, opacity: presence(frame, W.remaining, W.drain + 10, 14, 12), label: 'REMAINING'}}
        />

        <g opacity={bracket}>
          <path d={`M${bracketX + 14} ${inputTop} H${bracketX} V${inputBottom} H${bracketX + 14}`} fill="none" stroke={rgba(COLORS.white, 0.7)} strokeWidth={3} />
          <Caption x={bracketX - 16} y={(inputTop + inputBottom) / 2} text="INPUT" anchor="end" color={COLORS.white} size={22} />
        </g>
      </svg>
      <Pinned>
        <SceneTitle text="CONTEXT WINDOW" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
