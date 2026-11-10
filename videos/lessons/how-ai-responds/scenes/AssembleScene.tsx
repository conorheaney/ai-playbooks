import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption, Gear} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, SEGMENT_STYLE, SegKind, segmentRect} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube, PromptBar, StatusBadge} from '../../../shared/components/context/Pieces';
import {CUBE_HOME, INPUT, PROMPT, TANK_HOME, TANK_TEXT} from '../layout';
import {ASSEMBLE as A, SCENES} from '../timing';

const BAR = {x: 1190, y: 760, w: 900};
const BAR_CENTRED_Y = 560; // the bar and its "YOUR MESSAGE" label, centred together on screen
const CARD = {w: 380, h: 136};
// The app's assembly tray: a dashed purple frame around the message and the four card slots, so the app reads as
// the thing that gathers everything, rather than as a label floating above the message.
const TRAY = {x: 1190, y: 520, w: 960, h: 640};

// In VO order. Each card glides a short way in from its side while fading in (always inside the app's tray),
// then becomes its slice of the context.
const CARDS: {kind: SegKind; text: string; color: string; from: {x: number; y: number}; to: {x: number; y: number}}[] = [
  {kind: 'instructions', text: 'You are a quality assistant.', color: COLORS.purple, from: {x: 908, y: 320}, to: {x: 978, y: 320}},
  {kind: 'history', text: 'Preparing for the March audit…', color: COLORS.white, from: {x: 908, y: 500}, to: {x: 978, y: 500}},
  {kind: 'documents', text: 'qms-manual.pdf', color: COLORS.cyan, from: {x: 1472, y: 500}, to: {x: 1402, y: 500}},
  {kind: 'tools', text: 'search_docs(query)', color: COLORS.purple, from: {x: 1472, y: 320}, to: {x: 1402, y: 320}},
];

const segFor = (kind: SegKind) => INPUT.find((s) => s.kind === kind)!;
// Slices move one at a time from the bottom of the window up (the order of INPUT), so they stack
// instead of crossing. Each move takes the same time; the last one ends at mergeEnd.
const MOVE = A.mergeEnd - (A.merge + (INPUT.length - 1) * A.mergeStagger);
const ORDER = (kind: SegKind) => INPUT.findIndex((s) => s.kind === kind);

export const AssembleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.assemble.from + frame;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});

  const moveOf = (kind: SegKind) => {
    const start = A.merge + ORDER(kind) * A.mergeStagger;
    return interpolate(frame, [start, start + MOVE], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  };
  // All card and prompt text fades out before anything moves, so no half-faded text ever overlaps.
  const textIn = interpolate(frame, [A.textOut, A.merge], [1, 0], clampOpts);
  const msgMove = moveOf('message');
  const handOff = interpolate(frame, [A.segmentsIn, A.labelsOut], [0, 1], clampOpts);

  // Prompt bar: rises and types, then shrinks into the "your message" slice.
  const barRise = smooth(A.promptIn, 15);
  // It starts vertically centred (with its label) and glides down to make room as the cube springs in.
  const barY = lerp(BAR_CENTRED_Y, BAR.y, interpolate(frame, [A.barDown[0], A.barDown[1]], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)}));
  const typed = interpolate(frame, [A.typeStart, A.typeEnd], [0, PROMPT.length], clampOpts);
  const msg = segmentRect(TANK_HOME, segFor('message').from, segFor('message').to);

  // "Not just your message": a direct line from the prompt to the model, struck through.
  const line = interpolate(frame, [A.lineDraw, A.lineDraw + 12], [0, 1], clampOpts);
  const strike = spring({frame: frame - A.strike, fps, config: {damping: 12, stiffness: 180}});
  const strikeOut = interpolate(frame, [A.strikeOut, A.strikeOut + 12], [1, 0], clampOpts);
  // From the bar's left end straight to the model's side, so the ✕ sits in the gap between them.
  const lineFrom = {x: BAR.x - BAR.w / 2 - 8, y: barY};
  const lineTo = {x: CUBE_HOME.x + 120, y: CUBE_HOME.y + 20};
  const mid = {x: (lineFrom.x + lineTo.x) / 2, y: (lineFrom.y + lineTo.y) / 2};

  const app = presence(frame, A.appIn, A.labelsOut + 6, 12, 14);
  const tray = smooth(A.appIn, 18) * textIn; // gone before any slice moves out of it

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
            strokeWidth={4}
            strokeLinecap="round"
          />
          {strike > 0.01 ? (
            <g transform={`translate(${mid.x} ${mid.y}) scale(${strike})`}>
              <circle r={26} fill={COLORS.error} />
              <path d="M-9 -9L9 9M9 -9L-9 9" stroke={COLORS.charcoal} strokeWidth={5} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
        <Caption x={BAR.x} y={barY + 90} text="NOT JUST YOUR MESSAGE" color={COLORS.error} size={28} opacity={smooth(A.strike, 10) * strikeOut} />
        <Caption x={BAR.x} y={barY - 78} text="YOUR MESSAGE" color={COLORS.cyan} size={22} opacity={barRise * textIn} />

        {tray > 0.001 ? (
          <g opacity={tray} transform={`translate(${TRAY.x} ${TRAY.y}) scale(${lerp(0.96, 1, tray)})`}>
            <rect x={-TRAY.w / 2} y={-TRAY.h / 2} width={TRAY.w} height={TRAY.h} rx={32} fill={rgba(COLORS.purple, 0.05)} stroke={COLORS.purple} strokeWidth={3} strokeDasharray="14 10" strokeDashoffset={-frame * 0.6} />
            <g transform={`translate(${-TRAY.w / 2 + 40} ${-TRAY.h / 2})`}>
              <rect x={0} y={-22} width={178} height={44} rx={22} fill={COLORS.charcoal} stroke={COLORS.purple} strokeWidth={2} />
              <Gear x={28} y={0} size={30} angle={frame * 2} color={COLORS.purple} />
              <Caption x={52} y={0} text="THE APP" anchor="start" color={COLORS.purple} size={18} />
            </g>
          </g>
        ) : null}

        {/* The finished bundle: the same slices the context window holds in Scene 2. */}
        <ContextTank id="as-tank" textSizes={TANK_TEXT} {...TANK_HOME} segments={INPUT} draw={0} opacity={handOff} />
      </svg>

      {/* Cards and the prompt bar morph into their slices, then hand off to the SVG tank. */}
      <div style={{opacity: 1 - handOff}}>
        {/* The prompt bar sits underneath the cards, so slices landing over it stack on top, and it rises last from behind. */}
        {frame < A.textOut ? (
          <PromptBar x={BAR.x} y={barY + 40 * (1 - barRise)} width={BAR.w} text={PROMPT} chars={typed} opacity={barRise} frame={frame} cursor={frame < A.cubeIn} />
        ) : (
          <div
            style={{
              position: 'absolute',
              left: lerp(BAR.x - BAR.w / 2, msg.x, msgMove),
              top: lerp(BAR.y - 48, msg.y, msgMove),
              width: lerp(BAR.w, msg.w, msgMove),
              height: lerp(96, msg.h, msgMove),
              boxSizing: 'border-box',
              borderRadius: lerp(48, 4, msgMove),
              border: `2px solid ${COLORS.cyan}`,
              background: rgba(COLORS.charcoal, 0.92 * (1 - msgMove)),
              boxShadow: `0 0 32px ${rgba(COLORS.cyan, 0.25 * (1 - msgMove))}`,
              display: 'flex',
              alignItems: 'center',
              padding: `0 ${lerp(44, 0, msgMove)}px`,
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 38,
              color: rgba(COLORS.white, textIn),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <div style={{position: 'absolute', inset: 0, background: SEGMENT_STYLE.message.fill, opacity: msgMove}} />
            <span style={{position: 'relative'}}>{PROMPT}</span>
          </div>
        )}
        {CARDS.map((c, i) => {
          const start = A.cards[i];
          if (frame < start) {
            return null;
          }
          const fly = spring({frame: frame - start, fps, config: {damping: 18, stiffness: 90}, durationInFrames: 22});
          const cx = lerp(c.from.x, c.to.x, fly);
          const cy = lerp(c.from.y, c.to.y, fly);
          const fadeIn = interpolate(frame, [start, start + 8], [0, 1], clampOpts);
          const seg = segFor(c.kind);
          const r = segmentRect(TANK_HOME, seg.from, seg.to);
          const card = {x: cx - CARD.w / 2, y: cy - CARD.h / 2, w: CARD.w, h: CARD.h};
          const merge = moveOf(c.kind);
          // Two phases: each card first shrinks in place to its slice's size, then the slim slice travels into
          // the window, so the moving boxes stay small and clear of each other.
          const shrink = interpolate(merge, [0, 0.35], [0, 1], clampOpts);
          const travel = interpolate(merge, [0.25, 1], [0, 1], clampOpts);
          const w = lerp(card.w, r.w, shrink);
          const h = lerp(card.h, r.h, shrink);
          const mx = lerp(card.x + card.w / 2, r.x + r.w / 2, travel);
          const my = lerp(card.y + card.h / 2, r.y + r.h / 2, travel);
          return (
            <div
              key={c.kind}
              style={{
                position: 'absolute',
                left: mx - w / 2,
                top: my - h / 2,
                width: w,
                height: h,
                boxSizing: 'border-box',
                borderRadius: lerp(20, 4, merge),
                border: `2px solid ${rgba(c.color, 1 - merge * 0.6)}`,
                background: rgba(COLORS.charcoal, 0.92 * (1 - merge)),
                padding: '16px 22px',
                fontFamily: FONT,
                color: COLORS.white,
                overflow: 'hidden',
                opacity: fadeIn,
                zIndex: merge > 0 ? 10 + ORDER(c.kind) : 1, // a card that has started moving rides above the ones still waiting
              }}
            >
              <div style={{position: 'absolute', inset: 0, background: SEGMENT_STYLE[c.kind].fill, opacity: shrink}} />
              <div style={{position: 'relative', opacity: textIn}}>
                <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.18em', color: c.color === COLORS.white ? rgba(COLORS.white, 0.8) : c.color, marginBottom: 10}}>
                  {SEGMENT_STYLE[c.kind].label}
                </div>
                <div style={{fontSize: 24, fontWeight: 500, lineHeight: 1.25}}>{c.text}</div>
              </div>
            </div>
          );
        })}

      </div>

      <Pinned>

        <StatusBadge kind="app" opacity={app} frame={frame} />

      </Pinned>
      <Pinned>
        <SceneTitle text="CONTEXT" mode="hero" holdFrames={A.titleToCorner} />
      </Pinned>
    </AbsoluteFill>
  );
};
