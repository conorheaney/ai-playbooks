import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {clampOpts} from '../../../shared/lib/motion';
import {centredRow} from '../../../shared/lib/row';
import {COLORS, rgba} from '../../../shared/theme';
import {Badge, Chip, FlowLine, Layer, Note, Txt} from '../components/Parts';
import {MiniWindow, Slice, sliceRect} from '../components/MiniWindow';
import {ReceiptGlyph, TicketGlyph, ToolReceipt} from '../components/Ticket';
import {CAPTION_Y, CX, DOCK_W, DOCKS, MODEL_CUBE, SEARCH} from '../layout';
import {lerp, useBeats} from '../lib';
import {CONTEXT as C, TOOLS} from '../timing';
import {WallWorld} from './ToolsScene';

export const CUBE_TOP = {x: CX, y: 200, size: 46};
const WIN = {y: 650, w: 280, h: 420};
const WIN_GAP = 70;
const LABEL_Y = 410;
const RAIL = {top: 368, bottom: 890, band: 20};
// The receipt waits beside the cube, clear of the exit chips that come later.
const WAIT = {x: 1330, y: 210};
// Where the receipt prints once it is back on the model's side: above and left of the gate, clear of the gate's
// outline and ahead of the cube's path up to the top centre. The glyph comes through the gate on the y = 560 axis
// (to GLYPH_TURN), then rises to it.
const RECEIPT_AT = {x: 670, y: 350};
const GLYPH_TURN = {x: 740, y: 560};

const BASE: Slice[] = [
  {kind: 'instructions', h: 54, label: 'INSTRUCTIONS'},
  {kind: 'tools', h: 54, label: 'TOOLS'},
  {kind: 'message', h: 54, label: 'YOUR MESSAGE'},
];
const REQ: Slice = {kind: 'request', h: 50, label: 'REQUEST'};
const RES: Slice = {kind: 'result', h: 50, label: 'RESULT'};
const CALLS: Slice[][] = [BASE, [...BASE, REQ, RES], [...BASE, REQ, RES, REQ, RES]];

export const ContextScene: React.FC = () => {
  const {frame, abs, dur, smooth, ramp, fadeOut} = useBeats('context');

  // Scene 2's world is gone before the film strip draws in its place.
  const world = fadeOut(C.relayout[0], C.strip[0]);
  const relayout = ramp(C.relayout[0], C.relayout[1]);
  const cube = {x: lerp(MODEL_CUBE.x, CUBE_TOP.x, relayout), y: lerp(MODEL_CUBE.y, CUBE_TOP.y, relayout), size: lerp(MODEL_CUBE.size, CUBE_TOP.size, relayout)};
  const out = fadeOut(C.out, dur - 2);

  // One frame per call, always centred as a row: each new frame pushes the others apart.
  const presence = [ramp(C.strip[0], C.strip[0] + 20), ramp(C.call2[0] - 6, C.call2[0] + 10), ramp(C.call3[0] - 6, C.call3[0] + 10), ramp(C.ghost[0] - 6, C.ghost[0] + 10)];
  const xs = centredRow(presence.map((p) => ({w: WIN.w, p})), WIN_GAP);
  const draw = [ramp(C.strip[0] + 6, C.strip[1]), ramp(C.call2[0], C.call2[0] + 14), ramp(C.call3[0], C.call3[0] + 14)];
  const ghost = ramp(C.ghost[0], C.ghost[1]);
  const shown = presence.map((p, i) => (i < 3 ? (draw[i] > 0 ? 1 : 0) : ghost > 0 ? 1 : 0) * Math.min(1, p * 2));
  const leftEdge = Math.min(...xs.filter((_, i) => shown[i] > 0)) - WIN.w / 2 - 30;
  const rightEdge = Math.max(...xs.filter((_, i) => shown[i] > 0)) + WIN.w / 2 + 30;

  const copyStart = [0, C.call2[0], C.call3[0]];
  const copy = (call: number, i: number) => ramp(copyStart[call] + 3 + i * 3, copyStart[call] + 15 + i * 3);
  const reqLand = (call: number) => ramp(copyStart[call] + 16, copyStart[call] + 26);
  const resLand = (call: number) => ramp(copyStart[call] + 20, copyStart[call] + 28);
  // Only the newest frame's new slices carry labels; older labels have done their job. They fade just before the
  // next frame's copies start, because the copies slide out from on top of them.
  const labelsFor = (call: number) => {
    const next = call === 0 ? C.call2[0] : call === 1 ? C.call3[0] : 99999;
    return interpolate(frame, [next - 4, next + 2], [1, 0], clampOpts);
  };

  const windowSlices = (call: number): Slice[] =>
    CALLS[call].map((s, i) => {
      const labelOn = labelsFor(call);
      if (call === 0) {
        return {...s, label: labelOn > 0.5 ? s.label : undefined, opacity: draw[0] > 0.5 ? Math.min(1, (draw[0] - 0.5) * 3) : 0};
      }
      const copied = CALLS[call - 1].length;
      if (i < copied) {
        const t = copy(call, i);
        return {...s, label: undefined, opacity: t > 0 ? Math.min(1, t * 3) : 0, dx: (1 - t) * (xs[call - 1] - xs[call])};
      }
      const isReq = i === copied;
      return {...s, label: labelOn > 0.5 ? s.label : undefined, opacity: (isReq ? reqLand(call) : resLand(call)) >= 1 ? 1 : 0};
    });

  const slot = (call: number, i: number) => {
    const r = sliceRect(xs[call], WIN.y, WIN.w, WIN.h, CALLS[call], i);
    return {x: r.x + r.w / 2, y: r.y + r.h / 2};
  };

  // Receipt 1 comes back through the gate as a glyph (no text crosses the gate's outline), prints at full size on
  // the model's side, clear of the cube, then waits by the cube while the film strip draws.
  const r1Glyph = ramp(C.receipt[0], C.receipt[0] + 18);
  const r1Print = ramp(C.receipt[0] + 14, C.receipt[1] + 2);
  const r1Wait = ramp(C.receipt[1] + 2, C.receipt[1] + 20);
  const r1 = {x: lerp(RECEIPT_AT.x, WAIT.x, r1Wait), y: lerp(RECEIPT_AT.y, WAIT.y, r1Wait)};
  const across = interpolate(r1Glyph, [0, 0.7], [0, 1], clampOpts);
  const rise = interpolate(r1Glyph, [0.7, 1], [0, 1], clampOpts);
  const r1GlyphAt = {
    x: rise > 0 ? lerp(GLYPH_TURN.x, RECEIPT_AT.x, rise) : lerp(DOCKS.search.x - DOCK_W / 2 - 40, GLYPH_TURN.x, across),
    y: lerp(GLYPH_TURN.y, RECEIPT_AT.y, rise),
  };

  // Call 2 asks for another tool: a ticket goes out to the world and a receipt comes back (glyphs only).
  const generating = interpolate(frame, [C.again[0], C.again[0] + 6, C.again[1], C.again[1] + 8], [0, 1, 1, 0], clampOpts);
  const t2 = ramp(C.again[0] + 10, C.away[1]);
  const r2 = ramp(C.back[0], C.back[1]);

  const exits = smooth(C.exits, 12);
  const answer = interpolate(frame, [C.answer, C.answer + 6], [0, 1], clampOpts);
  const another = interpolate(frame, [C.another, C.another + 6], [0, 1], clampOpts);

  const flying = (call: number, kind: 'req' | 'res') => {
    const t = kind === 'req' ? reqLand(call) : resLand(call);
    if (t <= 0 || t >= 1) {
      return null;
    }
    const to = slot(call, CALLS[call - 1].length + (kind === 'req' ? 0 : 1));
    if (kind === 'req') {
      return <TicketGlyph key={`q${call}`} x={lerp(CUBE_TOP.x, to.x, t)} y={lerp(CUBE_TOP.y + 70, to.y, t)} />;
    }
    return call === 2 ? <ReceiptGlyph key={`s${call}`} x={lerp(WAIT.x, to.x, t)} y={lerp(WAIT.y, to.y, t)} /> : null;
  };

  return (
    <AbsoluteFill>
      <WallWorld frame={TOOLS.out + frame} opacity={world} glow={interpolate(frame, [0, 20], [1, 0], clampOpts)} />

      <Layer opacity={out}>
        {/* Film strip: sprocket bands above and below the frames. */}
        {shown[0] > 0
          ? [RAIL.top, RAIL.bottom].map((y) => (
              <g key={y} opacity={shown[0]}>
                <rect x={leftEdge} y={y} width={rightEdge - leftEdge} height={RAIL.band} rx={6} fill={rgba(COLORS.white, 0.08)} />
                {Array.from({length: Math.floor((rightEdge - leftEdge - 24) / 40)}, (_, i) => (
                  <rect key={i} x={leftEdge + 14 + i * 40} y={y + 5} width={18} height={10} rx={3} fill={rgba(COLORS.white, 0.22)} />
                ))}
              </g>
            ))
          : null}
        {[0, 1, 2].map((call) => (draw[call] > 0.001 ? <MiniWindow key={call} id={`ta-c-w${call}`} x={xs[call]} y={WIN.y} w={WIN.w} h={WIN.h} slices={windowSlices(call)} draw={draw[call]} /> : null))}
        {ghost > 0.001 ? <MiniWindow id="ta-c-ghost" x={xs[3]} y={WIN.y} w={WIN.w} h={WIN.h} slices={[]} draw={ghost} dashed outline={rgba(COLORS.cyan, 0.7)} /> : null}
        {flying(1, 'req')}
        {flying(2, 'req')}
        {flying(2, 'res')}
        <FlowLine from={{x: xs[1], y: LABEL_Y - 30}} to={{x: CUBE_TOP.x - 20, y: CUBE_TOP.y + 80}} frame={frame} opacity={interpolate(frame, [C.again[0] - 4, C.again[0] + 4, C.again[1], C.again[1] + 10], [0, 1, 1, 0], clampOpts)} bend={-10} />
        {t2 > 0 && t2 < 1 ? <TicketGlyph x={lerp(CUBE_TOP.x + 80, 1980, t2)} y={CUBE_TOP.y} /> : null}
        {r2 > 0 && resLand(2) <= 0 ? <ReceiptGlyph x={lerp(1980, WAIT.x, r2)} y={WAIT.y} /> : null}
      </Layer>

      <Layer>
        <LockedCube id="ta-c-cube" absFrame={abs} {...cube} glow={generating * (0.35 + 0.3 * Math.sin(frame / 4))} />
      </Layer>

      <AbsoluteFill style={{opacity: out}}>
        {[0, 1, 2].map((call) => (
          <Txt key={call} x={xs[call]} y={LABEL_Y} text={`CALL ${call + 1}`} size={26} opacity={draw[call]} spacing="0.14em" />
        ))}
        <Txt x={xs[3]} y={LABEL_Y} text="CALL 4?" size={26} color={COLORS.cyan} opacity={ghost} spacing="0.14em" />
        <Chip x={CUBE_TOP.x - 110} y={CUBE_TOP.y} text="ANSWER" anchor="end" dashed={answer < 0.5} color={answer > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.55)} textColor={answer > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.85)} opacity={exits} glow={answer * 0.5} />
        <Chip x={CUBE_TOP.x + 110} y={CUBE_TOP.y} text="ANOTHER TOOL" anchor="start" dashed={another < 0.5} color={another > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.55)} textColor={another > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.85)} opacity={exits} glow={another * (0.5 + 0.4 * Math.sin(frame / 5))} />
        <Note x={CX} y={CAPTION_Y} text="REBUILT FOR EVERY CALL" opacity={smooth(C.call3[1] - 4, 14)} />
        {/* Scene 2's takeaway carries across the cut and fades here. */}
        <Note x={CX} y={CAPTION_Y} text="THE MODEL ASKS. THE APP RUNS." opacity={fadeOut(C.relayout[0] - 6, C.relayout[0] + 6)} />
      </AbsoluteFill>

      {/* Receipt 1 crossing the gate as a glyph, then at full size while it is the thing to read. */}
      {r1Glyph > 0 && r1Print < 0.5 ? (
        <Layer>
          <ReceiptGlyph x={r1GlyphAt.x} y={r1GlyphAt.y} opacity={Math.min(1, r1Glyph * 6) * (1 - r1Print * 2)} />
        </Layer>
      ) : null}
      {resLand(1) < 1 && r1Print > 0 ? (
        (() => {
          const land = resLand(1);
          const to = slot(1, 4);
          return <ToolReceipt x={lerp(r1.x, to.x, land)} y={lerp(r1.y, to.y, land)} w={300} scale={lerp(1, 0.25, land)} print={r1Print} opacity={1 - land * land} rows={SEARCH.results} />;
        })()
      ) : null}

      <Pinned>
        <Badge kind="app" opacity={world} frame={TOOLS.out + frame} />
        <SceneTitle text="BACK INTO CONTEXT" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
