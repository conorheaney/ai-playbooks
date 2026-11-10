import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube, PromptBar} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {clampOpts} from '../../../shared/lib/motion';
import {centredRow} from '../../../shared/lib/row';
import {COLORS, rgba} from '../../../shared/theme';
import {Layer, Note} from '../components/Parts';
import {ReceiptGlyph, TicketGlyph} from '../components/Ticket';
import {PortalCard} from '../components/World';
import {CAPTION_Y, CX, DESCRIPTION, REQUEST, ROW_GAP} from '../layout';
import {lerp, onQuad, useBeats} from '../lib';
import {WORDS as W} from '../timing';

// One centred row: the model, what it writes, and the portal it can't touch.
const Y = 560;
const CUBE_W = 240;
const RESPONSE_W = 520;
const PORTAL_W = 380;
const [CUBE_X, RESPONSE_X, PORTAL_X] = centredRow(
  [
    {w: CUBE_W, p: 1},
    {w: RESPONSE_W, p: 1},
    {w: PORTAL_W, p: 1},
  ],
  ROW_GAP,
);
export const WORDS_CUBE = {x: CUBE_X, y: Y, size: 80};
export const WORDS_PORTAL = {x: PORTAL_X, y: Y, w: PORTAL_W};
const BAR = {x: CX, y: 290, w: 820};

// The agentic loop: out along the top arc, back along the bottom, mirrored about the row.
const L = CUBE_X + CUBE_W / 2 + 20;
const R = PORTAL_X - PORTAL_W / 2 - 20;
const TOP = {a: {x: L, y: Y - 90}, c: {x: CX, y: Y - 330}, b: {x: R, y: Y - 90}};
const BOTTOM = {a: {x: R, y: Y + 90}, c: {x: CX, y: Y + 330}, b: {x: L, y: Y + 90}};
const STEP_T = [0.3, 0.5, 0.7];

export const WordsScene: React.FC = () => {
  const {frame, abs, smooth, ramp, lin, fadeOut, pop} = useBeats('words');

  const cubeIn = smooth(W.cubeIn, 18);
  const barIn = smooth(W.bar[0], 14) * fadeOut(W.write[1] + 10, W.write[1] + 28);
  const typed = interpolate(frame, [W.write[0], W.write[1]], [0, DESCRIPTION.length], clampOpts);
  const generating = interpolate(frame, [W.write[0], W.write[0] + 6, W.write[1], W.write[1] + 10], [0, 1, 1, 0], clampOpts);
  const responseIn = smooth(W.write[0] - 4, 12);
  const portalIn = smooth(W.portal, 14);
  const dissolve = ramp(W.dissolve[0], W.dissolve[1] + 10);
  const pulse = interpolate(frame, [W.dissolve[1] - 2, W.dissolve[1] + 4, W.dissolve[1] + 20], [0, 1, 0], clampOpts);
  const clear = fadeOut(W.clear[0], W.clear[1]);
  const loopDraw = ramp(W.loop[0], W.loop[1]);
  const loopOut = fadeOut(W.out, W.out + 18);
  const act = lin(W.act, W.act + 26);

  // The response's words drift off towards the portal and fade before they reach it.
  const words = DESCRIPTION.split(' ');
  let shown = 0;

  return (
    <AbsoluteFill>
      <Layer>
        <LockedCube id="ta-w-cube" absFrame={abs} {...WORDS_CUBE} appear={cubeIn} glow={generating * (0.35 + 0.3 * Math.sin(frame / 4))} />

        <g opacity={loopOut}>
          {[TOP, BOTTOM].map((arc, i) => {
            const t = Math.max(0, Math.min(1, loopDraw * 2 - i));
            if (t <= 0) {
              return null;
            }
            const mid = {x: lerp(arc.a.x, arc.c.x, t), y: lerp(arc.a.y, arc.c.y, t)};
            const end = onQuad(arc.a, arc.c, arc.b, t);
            return (
              <path key={i} d={`M${arc.a.x} ${arc.a.y} Q${mid.x} ${mid.y} ${end.x} ${end.y}`} fill="none" stroke={COLORS.cyan} strokeWidth={4} strokeDasharray="12 12" strokeDashoffset={-frame * 1.5} strokeLinecap="round" />
            );
          })}
          {act > 0 && act < 1
            ? act < 0.5
              ? (() => {
                  const p = onQuad(TOP.a, TOP.c, TOP.b, act * 2);
                  return <TicketGlyph x={p.x} y={p.y} opacity={Math.min(1, act * 10)} />;
                })()
              : (() => {
                  const p = onQuad(BOTTOM.a, BOTTOM.c, BOTTOM.b, (act - 0.5) * 2);
                  return <ReceiptGlyph x={p.x} y={p.y} opacity={Math.min(1, (1 - act) * 10)} />;
                })()
            : null}
          {W.steps.map((s, i) => {
            const p = onQuad(TOP.a, TOP.c, TOP.b, STEP_T[i]);
            const on = pop(s);
            return on > 0.01 ? (
              <g key={i} transform={`translate(${p.x} ${p.y - 48}) scale(${on})`}>
                <circle r={24} fill={COLORS.cyan} />
                <text y={1} fill={COLORS.charcoal} fontFamily={FONT} fontWeight={800} fontSize={26} textAnchor="middle" dominantBaseline="central">
                  {i + 1}
                </text>
              </g>
            ) : null;
          })}
        </g>
      </Layer>

      <PromptBar x={BAR.x} y={BAR.y - 30 * (1 - smooth(W.bar[0], 14))} width={BAR.w} text={REQUEST} chars={interpolate(frame, [W.bar[0] + 4, W.bar[1]], [0, REQUEST.length], clampOpts)} opacity={barIn} frame={frame} cursor={frame < W.write[0]} />

      {/* The model's answer: words, nothing more. */}
      {responseIn > 0.001 && clear > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: RESPONSE_X,
            top: Y,
            width: RESPONSE_W,
            boxSizing: 'border-box',
            transform: 'translate(-50%, -50%)',
            padding: '24px 30px',
            borderRadius: 22,
            border: `2px solid ${rgba(COLORS.cyan, 1 - dissolve * 0.85)}`,
            background: rgba(COLORS.charcoal, 0.92),
            opacity: responseIn * clear,
            fontFamily: FONT,
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1.35,
            color: COLORS.white,
          }}
        >
          {words.map((w, i) => {
            const start = shown;
            shown += w.length + 1;
            const vis = Math.max(0, Math.min(w.length, typed - start));
            const t = Math.max(0, Math.min(1, dissolve * 1.6 - (1 - i / words.length) * 0.6));
            return (
              <React.Fragment key={i}>
                <span style={{display: 'inline-block', transform: `translateX(${t * 320}px)`, opacity: 1 - t}}>
                  {w.slice(0, vis)}
                  <span style={{opacity: 0}}>{w.slice(vis)}</span>
                </span>{' '}
              </React.Fragment>
            );
          })}
        </div>
      ) : null}

      <PortalCard x={PORTAL_X} y={Y} w={PORTAL_W} opacity={portalIn} pulse={pulse} scale={lerp(0.92, 1, portalIn)} />
      <Note x={CX} y={CAPTION_Y} text="DESCRIBING ISN'T DOING" opacity={smooth(W.dissolve[1] - 6, 12) * clear} />

      <Pinned>
        <SceneTitle text="WORDS AREN'T ACTIONS" mode="hero" holdFrames={W.titleToCorner} />
      </Pinned>
    </AbsoluteFill>
  );
};
