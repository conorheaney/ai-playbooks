import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mark} from '../../../shared/components/Bubble';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube, StatusBadge} from '../../../shared/components/context/Pieces';
import {CAPACITY, COMPACTED, COMPACTED_TOP, CUBE_HOME, TANK_HOME, TANK_TEXT} from '../layout';
import {SCENES, STOPPING as S} from '../timing';

const LANE = {x: 1290, w: 1080, h: 110};
const LANE_A_Y = 400;
const LANE_B_Y = 640;
const TEXT_A = 'Pack warm layers. Canberra nights get cold in March.';
const TEXT_B_KEEP = '{"day": 3, "plan": ';
const TEXT_B_OPEN = '"Visit Parliament House and the';
const TEXT_B = TEXT_B_KEEP + TEXT_B_OPEN;
// The output limit is a token count, not a width: the wall drops right after the last character lane B
// produced (measured from a render: the text ends at x = 1564), and the lane's unused width is hatched.
const WALL = {x: 1582, w: 16, h: 160};
const LANE_RIGHT = LANE.x + LANE.w / 2;

const Cursor: React.FC<{frame: number; show: boolean}> = ({frame, show}) => (
  <span style={{display: 'inline-block', width: 3, height: 38, marginLeft: 4, verticalAlign: 'middle', background: COLORS.cyan, opacity: show && Math.floor(frame / 12) % 2 === 0 ? 1 : 0}} />
);

const Tag: React.FC<{text: string; ok: boolean; x: number; y: number; appear: number}> = ({text, ok, x, y, appear}) =>
  appear > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '8px 20px 8px 10px',
        borderRadius: 30,
        border: `2px solid ${ok ? COLORS.cyan : COLORS.error}`,
        background: rgba(COLORS.charcoal, 0.92),
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: '0.12em',
        color: ok ? COLORS.cyan : COLORS.error,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 14}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      <svg width={36} height={36} viewBox="-26 -26 52 52">
        <Mark ok={ok} />
      </svg>
      {text}
    </div>
  ) : null;

export const StoppingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.stopping.from + frame;
  const dur = SCENES.stopping.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const content = presence(frame, 0, dur, 12, 15);

  const charsA = interpolate(frame, [S.laneA[0], S.laneA[1]], [0, TEXT_A.length], clampOpts);
  const charsB = interpolate(frame, [S.laneB[0], S.laneB[1]], [0, TEXT_B.length], clampOpts);
  const typedB = TEXT_B.slice(0, Math.floor(charsB));
  const end = spring({frame: frame - S.endChip, fps, config: {damping: 12, stiffness: 180}});
  const wall = spring({frame: frame - S.wall, fps, config: {damping: 10, stiffness: 220}});
  const shake = frame >= S.wallHit && frame < S.wallHit + 6 ? (random(`shake-${frame}`) - 0.5) * 8 : 0;
  const underline = interpolate(frame, [S.incomplete[0], S.incomplete[0] + 10], [0, 1], clampOpts);
  const ghost = smooth(S.incomplete[0] + 5, 12);
  const streaming = presence(frame, S.laneA[0], S.wallHit + 4, 4, 6);

  const lane = (y: number, letter: string, border: string, children: React.ReactNode, i: number) => (
    <div
      style={{
        position: 'absolute',
        left: LANE.x - LANE.w / 2,
        top: y - LANE.h / 2,
        width: LANE.w,
        height: LANE.h,
        boxSizing: 'border-box',
        borderRadius: 22,
        border: `2px solid ${border}`,
        background: rgba(COLORS.charcoal, 0.9),
        display: 'flex',
        alignItems: 'center',
        fontFamily: FONT,
        color: COLORS.white,
        opacity: smooth(i * 5, 12),
        overflow: 'hidden',
      }}
    >
      <div style={{width: 56, height: 56, margin: '0 24px', flexShrink: 0, borderRadius: 28, background: rgba(COLORS.white, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800}}>{letter}</div>
      {children}
    </div>
  );

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <LockedCube id="sp-cube" absFrame={abs} {...CUBE_HOME} glow={streaming * (0.3 + 0.3 * Math.sin(frame / 4))} />
        {/* The compacted context from Scene 6 gives way to the lanes. */}
        <ContextTank
          id="sp-tank" textSizes={TANK_TEXT}
          {...TANK_HOME}
          opacity={interpolate(frame, [0, 6], [1, 0], clampOpts)}
          segments={COMPACTED}
          readout={{tokens: COMPACTED_TOP * CAPACITY, capacity: CAPACITY, opacity: 1}}
        />
      </svg>

      <div style={{opacity: content}}>
        {lane(
          LANE_A_Y,
          'A',
          rgba(COLORS.white, 0.25),
          <div style={{fontSize: 32, fontWeight: 500, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center'}}>
            {TEXT_A.slice(0, Math.floor(charsA))}
            <Cursor frame={frame} show={frame < S.endChip} />
            {frame >= S.endChip ? (
              <span style={{marginLeft: 16, padding: '4px 14px', border: `2px dashed ${rgba(COLORS.white, 0.5)}`, borderRadius: 10, fontSize: 20, fontWeight: 700, letterSpacing: '0.14em', color: rgba(COLORS.white, 0.7), transform: `scale(${end})`, display: 'inline-block'}}>
                END
              </span>
            ) : null}
          </div>,
          0,
        )}

        <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
          {lane(
            LANE_B_Y,
            'B',
            frame >= S.incomplete[0] ? COLORS.error : rgba(COLORS.white, 0.25),
            <div style={{fontSize: 30, fontWeight: 500, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center'}}>
              <span style={{whiteSpace: 'pre'}}>{typedB.slice(0, TEXT_B_KEEP.length)}</span>
              <span
                style={{
                  textDecorationLine: underline > 0 ? 'underline' : 'none',
                  textDecorationStyle: 'wavy',
                  textDecorationColor: rgba(COLORS.error, underline),
                  textDecorationThickness: 2,
                  textUnderlineOffset: 8,
                }}
              >
                {typedB.slice(TEXT_B_KEEP.length)}
              </span>
              <Cursor frame={frame} show={frame < S.wallHit} />
            </div>,
            1,
          )}
          {/* The lane's unused width, past the limit, is hatched out once the wall lands. */}
          {frame >= S.wallHit ? (
            <div
              style={{
                position: 'absolute',
                left: WALL.x + WALL.w / 2,
                width: LANE_RIGHT - 2 - (WALL.x + WALL.w / 2),
                top: LANE_B_Y - LANE.h / 2 + 2,
                height: LANE.h - 4,
                borderRadius: '0 20px 20px 0',
                background: `repeating-linear-gradient(135deg, ${rgba(COLORS.error, 0.22)} 0 4px, transparent 4px 14px)`,
                opacity: interpolate(frame, [S.wallHit, S.wallHit + 10], [0, 1], clampOpts),
              }}
            />
          ) : null}
          {/* What's missing: the closing quote and brace, past the limit. */}
          {ghost > 0.01 ? (
            <div
              style={{
                position: 'absolute',
                left: WALL.x + WALL.w + 22,
                top: LANE_B_Y,
                transform: 'translateY(-50%)',
                padding: '0 10px',
                border: `2px dashed ${COLORS.error}`,
                borderRadius: 8,
                background: rgba(COLORS.charcoal, 0.9),
                fontFamily: FONT,
                fontSize: 30,
                fontWeight: 500,
                color: COLORS.error,
                opacity: 0.9 * ghost,
              }}
            >
              {'"}'}
            </div>
          ) : null}
          {/* MAX OUTPUT wall slams down right after the last token. */}
          {frame >= S.wall ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: WALL.x,
                  top: LANE_B_Y - WALL.h / 2 - (1 - wall) * 260,
                  width: WALL.w,
                  height: WALL.h,
                  borderRadius: 6,
                  background: COLORS.error,
                  boxShadow: `0 0 24px ${rgba(COLORS.error, 0.6)}`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: WALL.x + WALL.w / 2 - 150,
                  width: 300,
                  top: LANE_B_Y - 118 - (1 - wall) * 260,
                  textAlign: 'center',
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: '0.16em',
                  color: COLORS.error,
                }}
              >
                MAX OUTPUT
              </div>
            </>
          ) : null}
        </div>

        <div
          style={{
            position: 'absolute',
            left: LANE_RIGHT - 300,
            width: 300,
            top: LANE_B_Y + LANE.h / 2 + 22,
            textAlign: 'right',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '0.16em',
            color: COLORS.error,
            opacity: smooth(S.incomplete[1] - 6, 10),
          }}
        >
          INCOMPLETE
        </div>

        <Tag text="FINISH REASON: STOP" ok x={LANE.x - LANE.w / 2} y={LANE_A_Y + LANE.h / 2 + 16} appear={smooth(S.tagA, 12)} />
        <Tag text="FINISH REASON: LENGTH" ok={false} x={LANE.x - LANE.w / 2} y={LANE_B_Y + LANE.h / 2 + 16} appear={smooth(S.tagB, 12)} />

        <div
          style={{
            position: 'absolute',
            left: LANE.x - LANE.w / 2,
            width: LANE.w,
            top: 880,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 32,
            color: COLORS.white,
            opacity: smooth(S.caption, 14),
            transform: `translateY(${lerp(16, 0, smooth(S.caption, 14))}px)`,
          }}
        >
          Check the finish reason, not just the text.
        </div>
        <div
          style={{
            position: 'absolute',
            left: LANE.x - LANE.w / 2,
            width: LANE.w,
            top: 936,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 22,
            color: rgba(COLORS.white, 0.6),
            opacity: smooth(S.caption + 10, 14),
          }}
        >
          Names vary by API, e.g. stop / end_turn, length / max_tokens.
        </div>
        <Pinned>
          <SceneTitle text="STOPPING" mode="corner" />
        </Pinned>
      </div>
      <Pinned>
        <StatusBadge kind="stream" opacity={presence(frame, 0, dur - 12, 10, 12)} frame={frame} />
      </Pinned>
    </AbsoluteFill>
  );
};
