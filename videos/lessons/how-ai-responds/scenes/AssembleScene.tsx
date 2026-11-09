import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, SEGMENT_STYLE, SegKind, segmentRect} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {AppMarker, LockedCube, PromptBar, StatusBadge} from '../../../shared/components/context/Pieces';
import {CUBE_HOME, INPUT, PROMPT, TANK_HOME} from '../layout';
import {ASSEMBLE as A, SCENES} from '../timing';

const BAR = {x: 1190, y: 860, w: 900};
const CARD = {w: 380, h: 136};

// In VO order. Each card flies in from off-screen, then becomes its slice of the context.
const CARDS: {kind: SegKind; text: string; color: string; from: {x: number; y: number}; to: {x: number; y: number}}[] = [
  {kind: 'instructions', text: 'You are a helpful travel assistant.', color: COLORS.purple, from: {x: -300, y: -140}, to: {x: 990, y: 320}},
  {kind: 'history', text: 'Planning a 5-day trip in March…', color: COLORS.white, from: {x: -420, y: 260}, to: {x: 990, y: 500}},
  {kind: 'documents', text: 'trip-plan.md', color: COLORS.cyan, from: {x: 1380, y: 1240}, to: {x: 1390, y: 500}},
  {kind: 'tools', text: 'search_web(query)', color: COLORS.purple, from: {x: 1380, y: -200}, to: {x: 1390, y: 320}},
];

const segFor = (kind: SegKind) => INPUT.find((s) => s.kind === kind)!;

export const AssembleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.assemble.from + frame;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});

  const merge = interpolate(frame, [A.merge, A.mergeEnd], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const handOff = interpolate(frame, [A.segmentsIn, A.labelsOut], [0, 1], clampOpts);

  // Prompt bar: rises and types, then shrinks into the "your message" slice.
  const barRise = smooth(A.promptIn, 15);
  const typed = interpolate(frame, [A.typeStart, A.typeEnd], [0, PROMPT.length], clampOpts);
  const msg = segmentRect(TANK_HOME, segFor('message').from, segFor('message').to);

  // "Not just your message": a direct line from the prompt to the model, struck through.
  const line = interpolate(frame, [A.lineDraw, A.lineDraw + 12], [0, 1], clampOpts);
  const strike = spring({frame: frame - A.strike, fps, config: {damping: 12, stiffness: 180}});
  const strikeOut = interpolate(frame, [A.strikeOut, A.strikeOut + 12], [1, 0], clampOpts);
  const lineFrom = {x: BAR.x - BAR.w / 2 + 10, y: BAR.y - 30};
  const lineTo = {x: CUBE_HOME.x + 130, y: CUBE_HOME.y + 70};
  const mid = {x: (lineFrom.x + lineTo.x) / 2, y: (lineFrom.y + lineTo.y) / 2};

  const app = presence(frame, A.appIn, A.labelsOut + 6, 12, 14);
  const appMarker = presence(frame, A.appIn, A.merge + 10, 12, 10);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <LockedCube id="as-cube" absFrame={abs} {...CUBE_HOME} appear={smooth(A.cubeIn, 18)} />

        <g opacity={strikeOut}>
          <line
            x1={lineFrom.x}
            y1={lineFrom.y}
            x2={lerp(lineFrom.x, lineTo.x, line)}
            y2={lerp(lineFrom.y, lineTo.y, line)}
            stroke={rgba(COLORS.white, 0.6)}
            strokeWidth={3}
            strokeDasharray="10 8"
          />
          {strike > 0.01 ? (
            <g transform={`translate(${mid.x} ${mid.y}) scale(${strike})`}>
              <circle r={26} fill={COLORS.error} />
              <path d="M-9 -9L9 9M9 -9L-9 9" stroke={COLORS.charcoal} strokeWidth={5} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
        <Caption x={BAR.x} y={BAR.y + 90} text="NOT JUST YOUR MESSAGE" color={COLORS.error} size={22} opacity={smooth(A.strike, 10) * strikeOut} />
        <Caption x={BAR.x} y={BAR.y - 78} text="YOUR MESSAGE" color={COLORS.cyan} opacity={barRise * (1 - merge)} />

        <AppMarker x={1080} y={690} opacity={appMarker} frame={frame} />

        {/* The finished bundle: the same slices the context window holds in Scene 2. */}
        <ContextTank id="as-tank" {...TANK_HOME} segments={INPUT} draw={0} opacity={handOff} />
      </svg>

      {/* Cards and the prompt bar morph into their slices, then hand off to the SVG tank. */}
      <div style={{opacity: 1 - handOff}}>
        {CARDS.map((c, i) => {
          const start = A.cards[i];
          if (frame < start) {
            return null;
          }
          const fly = spring({frame: frame - start, fps, config: {damping: 18, stiffness: 90}, durationInFrames: 22});
          const cx = lerp(c.from.x, c.to.x, fly);
          const cy = lerp(c.from.y, c.to.y, fly);
          const seg = segFor(c.kind);
          const r = segmentRect(TANK_HOME, seg.from, seg.to);
          const card = {x: cx - CARD.w / 2, y: cy - CARD.h / 2, w: CARD.w, h: CARD.h};
          const content = interpolate(merge, [0, 0.4], [1, 0], clampOpts);
          return (
            <div
              key={c.kind}
              style={{
                position: 'absolute',
                left: lerp(card.x, r.x, merge),
                top: lerp(card.y, r.y, merge),
                width: lerp(card.w, r.w, merge),
                height: lerp(card.h, r.h, merge),
                boxSizing: 'border-box',
                borderRadius: lerp(20, 4, merge),
                border: `2px solid ${rgba(c.color, 1 - merge * 0.6)}`,
                background: merge > 0 ? SEGMENT_STYLE[c.kind].fill : rgba(COLORS.charcoal, 0.92),
                padding: '16px 22px',
                fontFamily: FONT,
                color: COLORS.white,
                overflow: 'hidden',
              }}
            >
              <div style={{opacity: content}}>
                <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: c.color === COLORS.white ? rgba(COLORS.white, 0.8) : c.color, marginBottom: 10}}>
                  {SEGMENT_STYLE[c.kind].label}
                </div>
                <div style={{fontSize: 24, fontWeight: 500, lineHeight: 1.25}}>{c.text}</div>
              </div>
            </div>
          );
        })}

        {merge <= 0 ? (
          <PromptBar x={BAR.x} y={BAR.y + 40 * (1 - barRise)} width={BAR.w} text={PROMPT} chars={typed} opacity={barRise} frame={frame} cursor={frame < A.cubeIn} />
        ) : (
          <div
            style={{
              position: 'absolute',
              left: lerp(BAR.x - BAR.w / 2, msg.x, merge),
              top: lerp(BAR.y - 48, msg.y, merge),
              width: lerp(BAR.w, msg.w, merge),
              height: lerp(96, msg.h, merge),
              boxSizing: 'border-box',
              borderRadius: lerp(48, 4, merge),
              border: `2px solid ${COLORS.cyan}`,
              background: SEGMENT_STYLE.message.fill,
              display: 'flex',
              alignItems: 'center',
              padding: `0 ${lerp(44, 0, merge)}px`,
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 38,
              color: rgba(COLORS.white, 1 - Math.min(1, merge * 2.5)),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {PROMPT}
          </div>
        )}
      </div>

      <Pinned>

        <StatusBadge kind="app" opacity={app} frame={frame} />

      </Pinned>
      <Pinned>
        <SceneTitle text="STEP 1: CONTEXT" mode="hero" holdFrames={A.titleToCorner} />
      </Pinned>
    </AbsoluteFill>
  );
};
