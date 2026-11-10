import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba} from '../../../shared/theme';
import {Arrow, Chip, GearMark, Layer, MarkAt} from '../components/Parts';
import {ReceiptGlyph, TicketGlyph} from '../components/Ticket';
import {Dock} from '../components/World';
import {CX} from '../layout';
import {lerp, useBeats} from '../lib';
import {FAILURE as F} from '../timing';
import {COORD} from './DelegationScene';

// A centred column of five failures. Each has a red glyph showing where it went wrong: in the request (ticket)
// or in what came back (receipt).
const ROW_Y = [320, 430, 540, 650, 760];
const GLYPH_X = CX - 190;
const LABEL_X = CX - 130;
const KEPT = 3; // DUPLICATE ACTION stays for the report
const KEPT_Y = 260;
const ROWS: {label: string; glyph: 'ticket' | 'receipt' | 'double'}[] = [
  {label: 'WRONG TOOL', glyph: 'ticket'},
  {label: 'WRONG INPUT', glyph: 'ticket'},
  {label: 'CHANGED STATE', glyph: 'receipt'},
  {label: 'DUPLICATE ACTION', glyph: 'double'},
  {label: 'MISREAD RESULT', glyph: 'receipt'},
];
// The two answers, mirrored about the centre line.
const CARD = {y: 540, w: 460, h: 170, dx: 280};
const TAG_Y = CARD.y + CARD.h / 2 + 50;
const REPORT_TEXT = 'Booked twice. One needs cancelling.';

// Finale, pinned to true screen centre: the whole diagram is centred (the dock is wider than the cube, so the
// gate sits a little left of centre, halfway along the arrows).
const FIN = {y: 440, cube: 545, dock: 1265, dockW: 380, top: 404, bottom: 486};
const ARROW = {from: FIN.cube + 100, to: FIN.dock - FIN.dockW / 2 - 20};
const GATE_X = (ARROW.from + ARROW.to) / 2;

const FailGlyph: React.FC<{kind: 'ticket' | 'receipt' | 'double'; x: number; y: number}> = ({kind, x, y}) =>
  kind === 'ticket' ? (
    <TicketGlyph x={x} y={y} color={COLORS.error} />
  ) : kind === 'receipt' ? (
    <ReceiptGlyph x={x} y={y} color={COLORS.error} />
  ) : (
    <>
      <ReceiptGlyph x={x - 8} y={y - 6} color={COLORS.error} opacity={0.6} />
      <ReceiptGlyph x={x + 8} y={y + 6} color={COLORS.error} />
    </>
  );

export const FailureScene: React.FC = () => {
  const {frame, abs, dur, smooth, ramp, pop, fadeOut} = useBeats('failure');

  const coordOut = fadeOut(0, 14);
  const focus = ramp(F.focus[0], F.focus[1]);
  const cards = smooth(F.focus[0] + 10, 16);
  const typed = interpolate(frame, [F.report[0], F.report[1]], [0, REPORT_TEXT.length], clampOpts);
  const reported = Math.min(1, pop(F.report[1] + 2));
  const hide = Math.min(1, pop(F.hide));
  const finale = interpolate(frame, [F.finale, F.finale + F.fadeOut], [0, 1], clampOpts);
  const diagram = ramp(F.diagram, F.diagram + 24);
  const title = pop(F.titleIn);
  const cycle = ((((frame - F.diagram) % 48) + 48) % 48) / 48;

  const rowY = (i: number) => (i === KEPT ? lerp(ROW_Y[i], KEPT_Y, focus) : ROW_Y[i]);
  const rowOpacity = (i: number) => Math.min(1, pop(F.rows[i])) * (i === KEPT ? 1 : 1 - focus);

  return (
    <AbsoluteFill>
      <Layer>
        <LockedCube id="ta-x-coord" absFrame={abs} {...COORD} appear={coordOut} />
      </Layer>

      <AbsoluteFill style={{opacity: 1 - finale}}>
        <Layer>
          {ROWS.map((r, i) =>
            rowOpacity(i) > 0.01 ? (
              <g key={r.label} opacity={rowOpacity(i)}>
                <FailGlyph kind={r.glyph} x={GLYPH_X} y={rowY(i)} />
              </g>
            ) : null,
          )}
        </Layer>
        {ROWS.map((r, i) => (
          <Chip key={r.label} x={LABEL_X} y={rowY(i)} anchor="start" text={r.label} size={28} weight={800} color={COLORS.error} textColor={COLORS.error} opacity={rowOpacity(i)} />
        ))}

        {/* What it could say, and what a good agent says. */}
        {cards > 0.001 ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: CX - CARD.dx - CARD.w / 2,
                top: CARD.y - CARD.h / 2,
                width: CARD.w,
                height: CARD.h,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 22,
                border: `2px dashed ${hide > 0.5 ? COLORS.error : rgba(COLORS.white, 0.6)}`,
                background: rgba(COLORS.charcoal, 0.9),
                opacity: cards * 0.75,
                fontFamily: FONT,
                fontSize: 34,
                fontWeight: 500,
                color: COLORS.white,
              }}
            >
              All done! ✓
            </div>
            <div
              style={{
                position: 'absolute',
                left: CX + CARD.dx - CARD.w / 2,
                top: CARD.y - CARD.h / 2,
                width: CARD.w,
                height: CARD.h,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                borderRadius: 22,
                border: `2px solid ${COLORS.cyan}`,
                background: rgba(COLORS.charcoal, 0.95),
                boxShadow: `0 0 ${30 * reported}px ${rgba(COLORS.cyan, 0.35 * reported)}`,
                opacity: cards,
                fontFamily: FONT,
                fontSize: 32,
                fontWeight: 500,
                lineHeight: 1.3,
                color: COLORS.white,
              }}
            >
              <div>
                {REPORT_TEXT.slice(0, Math.floor(typed))}
                <span style={{opacity: 0}}>{REPORT_TEXT.slice(Math.floor(typed))}</span>
              </div>
            </div>
          </>
        ) : null}
        <MarkAt x={CX - CARD.dx + CARD.w / 2 - 8} y={CARD.y - CARD.h / 2 + 8} ok={false} scale={hide} />
        <Chip x={CX - CARD.dx} y={TAG_Y} text="HIDES THE FAILURE" size={26} weight={800} color={COLORS.error} textColor={COLORS.error} scale={hide} opacity={hide > 0.01 ? 1 : 0} />
        <Chip
          x={CX + CARD.dx}
          y={TAG_Y}
          text="REPORTED"
          size={26}
          weight={800}
          color={COLORS.cyan}
          textColor={COLORS.cyan}
          scale={reported}
          opacity={reported > 0.01 ? 1 : 0}
          icon={
            <svg width={30} height={30} viewBox="-26 -26 52 52">
              <circle r={24} fill={COLORS.cyan} />
              <path d="M-10 0L-3 7L10 -7" stroke={COLORS.charcoal} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          }
        />

        <Pinned>
          <SceneTitle text="WHEN TOOLS FAIL" mode="corner" />
        </Pinned>
      </AbsoluteFill>

      {/* Finale: the model proposes, the harness acts. */}
      <Pinned>
        {frame >= F.diagram ? (
          <>
            <Layer opacity={diagram}>
              <LockedCube id="ta-x-fin" absFrame={abs} x={FIN.cube} y={FIN.y} size={46} />
              <Arrow from={{x: ARROW.from, y: FIN.top}} to={{x: ARROW.to, y: FIN.top}} color={COLORS.cyan} width={3} dashed />
              <Arrow from={{x: ARROW.to, y: FIN.bottom}} to={{x: ARROW.from, y: FIN.bottom}} color={COLORS.cyan} width={3} dashed />
              <rect x={GATE_X - 15} y={FIN.y - 80} width={30} height={160} rx={8} fill={COLORS.purple} />
              <circle cx={GATE_X} cy={FIN.y - 112} r={34} fill={COLORS.charcoal} />
              <GearMark x={GATE_X} y={FIN.y - 112} frame={frame} opacity={1} label="HARNESS" labelAt="above" size={52} />
              <TicketGlyph x={lerp(ARROW.from + 20, ARROW.to - 30, cycle)} y={FIN.top} opacity={Math.sin(Math.PI * cycle)} />
              <ReceiptGlyph x={lerp(ARROW.to - 30, ARROW.from + 20, (cycle + 0.5) % 1)} y={FIN.bottom} opacity={Math.sin(Math.PI * ((cycle + 0.5) % 1))} />
            </Layer>
            <Dock x={FIN.dock} y={FIN.y} w={FIN.dockW} name="TRAVEL PORTAL" icon="portal" opacity={diagram} />
          </>
        ) : null}
        {frame >= F.titleIn ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 760,
              textAlign: 'center',
              transform: `translateY(-50%) scale(${interpolate(frame, [F.titleIn, dur], [1, 1.04], clampOpts) * lerp(0.86, 1, title)})`,
              opacity: Math.min(1, title * 1.3),
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 56,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: COLORS.white,
              textShadow: `0 0 28px ${rgba(COLORS.cyan, 0.4)}`,
            }}
          >
            THE MODEL PROPOSES. THE HARNESS ACTS.
          </div>
        ) : null}
      </Pinned>
    </AbsoluteFill>
  );
};
