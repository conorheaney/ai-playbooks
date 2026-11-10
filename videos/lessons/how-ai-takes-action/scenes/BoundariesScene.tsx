import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba} from '../../../shared/theme';
import {Fence, Ring, Runner, Sign} from '../components/Loop';
import {Badge, Chip, GearMark, Layer, MarkAt, PersonIcon} from '../components/Parts';
import {ToolTicket} from '../components/Ticket';
import {PortalCard} from '../components/World';
import {BOOKING, CX} from '../layout';
import {lerp, useBeats} from '../lib';
import {BOUNDS as B} from '../timing';
import {HARNESS_CUBE} from './HarnessScene';

// Phase 1: the fenced loop at the centre of the screen, with a sign at each corner.
// Phase 2: the fenced loop moves left and shrinks; the gate sits on the centre line; the portal mirrors the fence.
const Y = 540;
const LOOP_R = 150;
const FENCE_SIZE = 470;
const SIDE = 520; // phase 2: the fence and the portal sit this far either side of the centre line
const SMALL = 0.62;
const SIGNS = [
  {dx: -1, dy: -1, text: '4 TOOLS ONLY'},
  {dx: 1, dy: -1, text: 'MAX 10 STEPS'},
  {dx: -1, dy: 1, text: 'CONFIRM BEFORE BOOKING'},
  {dx: 1, dy: 1, text: 'DONE = BOOKED + REPORTED'},
];
const PORTAL_W = 380;
const TICKET_W = 300;
const TICKET = {start: CX - 200, ghostEnd: CX + 170, bump: CX - TICKET_W / 2 - 26};
const CONFIRM = {y: 250, w: 540};
export const BOUNDS_CUBE_END = {x: CX - SIDE + LOOP_R * SMALL, y: Y, size: 46 * SMALL};

export const BoundariesScene: React.FC = () => {
  const {frame, abs, dur, smooth, ramp, lin, pop, fadeOut} = useBeats('boundaries');

  const enter = ramp(B.enter[0], B.enter[1]);
  const shift = ramp(B.ticket[0] - 14, B.ticket[0] + 4);
  const loopX = lerp(CX, CX - SIDE, shift);
  const scale = lerp(1, SMALL, shift);
  const cubeHome = {x: loopX + LOOP_R * scale, y: Y, size: 46 * scale};
  const cube = {x: lerp(HARNESS_CUBE.x, cubeHome.x, enter), y: lerp(HARNESS_CUBE.y, cubeHome.y, enter), size: lerp(HARNESS_CUBE.size, cubeHome.size, enter)};
  const out = fadeOut(B.out, dur - 2);
  const fence = ramp(B.fence[0], B.fence[1]);
  // The signs name the boundaries, then step away so phase 2 has the screen.
  const signsOut = fadeOut(B.ticket[0] - 16, B.ticket[0] - 4);
  const signs = B.signs.map((s) => pop(s) * signsOut);

  const print = ramp(B.ticket[0], B.ticket[1]);
  const paint = ramp(B.paint[0], B.paint[1]);
  const cross = ramp(B.cross[0], B.cross[1] - 4);
  const rewind = interpolate(frame, [B.rewind[0], B.rewind[1]], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.quad)});
  const crossing = frame >= B.cross[0] && frame < B.rewind[1];
  const redFlash = interpolate(frame, [B.cross[0] + 6, B.cross[0] + 10, B.rewind[0], B.rewind[1]], [0, 1, 1, 0], clampOpts);

  const gate = ramp(B.gate[0], B.gate[1]) * fadeOut(B.pass[0], B.pass[0] + 10);
  const bump = interpolate(frame, [B.gate[0] + 6, B.gate[1], B.gate[1] + 6], [0, 1, 0.92], clampOpts);
  const confirm = smooth(B.confirm[0], 14) * fadeOut(B.pass[1], B.pass[1] + 10);
  const approve = pop(B.approve);
  const pass = ramp(B.pass[0], B.pass[1]);
  const booked = smooth(B.booked, 14);
  const waiting = frame >= B.gate[1] && frame < B.pass[0];
  const portalIn = smooth(B.ticket[0] - 10, 16);

  let ticketX = TICKET.start;
  let ticketOpacity = 1;
  if (crossing) {
    ticketX = frame < B.rewind[0] ? lerp(TICKET.start, TICKET.ghostEnd, cross) : lerp(TICKET.ghostEnd, TICKET.start, rewind);
    ticketOpacity = 0.5;
  } else if (frame >= B.gate[0]) {
    ticketX = pass > 0 ? lerp(TICKET.bump, CX + SIDE - 40, pass) : lerp(TICKET.start, TICKET.bump, bump);
    ticketOpacity = 1 - pass * pass;
  }
  const lineColor = redFlash > 0.5 ? COLORS.error : COLORS.purple;
  const paintOn = paint * fadeOut(B.gate[0], B.gate[0] + 10);
  const half = (FENCE_SIZE / 2) * scale;

  return (
    <AbsoluteFill>
      <Layer opacity={out}>
        <g transform={`translate(${loopX} ${Y}) scale(${scale})`}>
          <Ring cx={0} cy={0} r={LOOP_R} draw={enter} />
          <Runner cx={0} cy={0} r={LOOP_R} angle={-90 + frame * 2.5} opacity={enter * 0.8} />
          <Fence cx={0} cy={0} w={FENCE_SIZE} h={FENCE_SIZE} draw={fence} gap={{side: 'right', from: -60, to: 60}} />
        </g>
        {/* The path from the fence to the portal. */}
        <line x1={loopX + half + 12} x2={CX + SIDE - PORTAL_W / 2 - 12} y1={Y} y2={Y} stroke={rgba(COLORS.white, 0.25)} strokeWidth={4} strokeDasharray="4 10" opacity={portalIn} />
        {/* An instruction is paint on the ground... */}
        {paintOn > 0.001 ? <line x1={CX} x2={CX} y1={Y - 100} y2={Y - 100 + 200 * paintOn} stroke={lineColor} strokeWidth={6} strokeDasharray="14 12" strokeLinecap="round" opacity={0.9} /> : null}
        {/* ...enforcement is a gate. */}
        {gate > 0.001 ? (
          <g>
            <rect x={CX - 18} y={Y + 100 - 200 * gate} width={36} height={200 * gate} rx={8} fill={COLORS.purple} />
            <GearMark x={CX} y={Y - 136} frame={frame} opacity={gate} label="HARNESS" labelAt="above" size={52} />
          </g>
        ) : null}
      </Layer>

      <Layer>
        <LockedCube id="ta-b-cube" absFrame={abs} {...cube} />
      </Layer>

      <AbsoluteFill style={{opacity: out}}>
        {SIGNS.map((s, i) => (
          <Sign key={s.text} x={CX + s.dx * (FENCE_SIZE / 2)} y={Y + s.dy * (FENCE_SIZE / 2)} text={s.text} pop={signs[i]} />
        ))}

        <PortalCard x={CX + SIDE} y={Y} w={PORTAL_W} opacity={portalIn} booked={booked} />

        {paintOn > 0.001 ? (
          <div
            style={{
              position: 'absolute',
              left: CX,
              top: Y - 160,
              transform: `translate(-50%, -50%) scale(${lerp(0.9, 1, paintOn)})`,
              opacity: paintOn,
              padding: '12px 24px',
              borderRadius: 18,
              border: `2px solid ${lineColor}`,
              background: rgba(COLORS.charcoal, 0.95),
              fontFamily: FONT,
              fontSize: 26,
              fontWeight: 500,
              color: COLORS.white,
              whiteSpace: 'nowrap',
            }}
          >
            "Please ask before booking."
            <div style={{position: 'absolute', left: '50%', bottom: -12, width: 20, height: 20, transform: 'translateX(-50%) rotate(45deg)', background: COLORS.charcoal, borderRight: `2px solid ${lineColor}`, borderBottom: `2px solid ${lineColor}`}} />
          </div>
        ) : null}

        <ToolTicket x={ticketX} y={Y} w={TICKET_W} print={print} opacity={ticketOpacity * (print > 0 ? 1 : 0)} name={BOOKING.name} inputs={[]} dashed={crossing} />
        <Chip x={CX} y={Y + 150} text="NOTHING STOPS IT" color={COLORS.error} textColor={COLORS.error} size={26} weight={800} opacity={redFlash} />

        {confirm > 0.001 ? (
          <div
            style={{
              position: 'absolute',
              left: CX,
              top: CONFIRM.y,
              width: CONFIRM.w,
              boxSizing: 'border-box',
              transform: `translate(-50%, -50%) translateY(${(1 - confirm) * -20}px)`,
              opacity: confirm,
              padding: '18px 24px',
              borderRadius: 20,
              border: `2px solid ${COLORS.white}`,
              background: rgba(COLORS.charcoal, 0.97),
              fontFamily: FONT,
              color: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, fontWeight: 500, whiteSpace: 'nowrap'}}>
              <PersonIcon size={40} />
              Book it? $1,175
            </div>
            <div
              style={{
                padding: '8px 22px',
                borderRadius: 24,
                border: `2px solid ${COLORS.cyan}`,
                background: approve > 0.05 ? COLORS.cyan : 'transparent',
                color: approve > 0.05 ? COLORS.charcoal : COLORS.cyan,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '0.08em',
                transform: `scale(${1 - 0.08 * Math.sin(Math.min(1, lin(B.approve, B.approve + 8)) * Math.PI)})`,
                boxShadow: approve > 0.05 ? `0 0 ${30 * approve}px ${rgba(COLORS.cyan, 0.6)}` : undefined,
              }}
            >
              APPROVE
            </div>
          </div>
        ) : null}
        <MarkAt x={CX + CONFIRM.w / 2 - 6} y={CONFIRM.y - 44} ok scale={approve * confirm} />
      </AbsoluteFill>

      <Pinned>
        <Badge kind={waiting ? 'wait' : 'loop'} step={5} max={10} opacity={smooth(B.enter[0], 14) * out} frame={frame} />
        <SceneTitle text="BOUNDARIES" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
