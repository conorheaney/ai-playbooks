import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba} from '../../../shared/theme';
import {Ring, Runner, StateCard, Struck} from '../components/Loop';
import {Arrow, Badge, Chip, GearMark, Layer, PersonIcon, Txt} from '../components/Parts';
import {ReceiptGlyph, TicketGlyph} from '../components/Ticket';
import {AVAILABILITY, GOAL, RING} from '../layout';
import {lerp, onCircle, useBeats} from '../lib';
import {LOOP as L} from '../timing';
import {CUBE_TOP} from './ContextScene';

export const LOOP_CUBE = {x: RING.x + RING.r, y: RING.y, size: 50};
const TOP = onCircle(RING.x, RING.y, RING.r, -90);
const LEFT = onCircle(RING.x, RING.y, RING.r, 180);
// Labels sit mirrored about the centre line: PICK A STEP up and right, SEE THE RESULT up and left.
const SIDE_LABEL_Y = RING.y - 115;
const SIDE_LABEL_DX = RING.r + 70;
const CARD = {x: RING.x - 30, y: RING.y + 20, w: 390}; // nudged left so it clears the cube
const EXIT_Y = 190;

// The runner's angle through the scene (clockwise; -90 is the top station).
const runnerAngle = (frame: number) =>
  interpolate(frame, [L.recap[0], L.recap[1], L.check[1], L.pick[0], L.run[0], L.run[1], L.see[0] + 2, L.see[0] + 14, L.repeat, L.done[0]], [-90, 630, 630, 720, 720, 810, 810, 900, 900, 990], clampOpts);

export const LoopScene: React.FC = () => {
  const {frame, abs, dur, smooth, ramp, pop, fadeOut} = useBeats('loop');

  const move = ramp(L.move[0], L.move[1]);
  const cube = {x: lerp(CUBE_TOP.x, LOOP_CUBE.x, move), y: lerp(CUBE_TOP.y, LOOP_CUBE.y, move), size: lerp(CUBE_TOP.size, LOOP_CUBE.size, move)};
  const ring = ramp(L.ring[0], L.ring[1]);
  const stations = [0, 1, 2, 3].map((i) => (ring >= i / 4 ? pop(L.ring[0] + Math.round(i * 0.25 * (L.ring[1] - L.ring[0]))) : 0));
  const out = fadeOut(L.out, dur - 2);
  const angle = runnerAngle(frame);
  const runnerOn = frame >= L.recap[0] ? (frame < L.recap[1] ? 0.6 : 1) : 0;

  const lap1 = pop(L.recap[0] + 12);
  const lap2 = pop(L.recap[0] + 28);
  const flash = interpolate(frame, [L.check[0], L.check[0] + 6, L.check[0] + 26], [0, 1, 0], clampOpts);
  const strike = ramp(L.strike, L.strike + 10);
  const generating = interpolate(frame, [L.pick[0], L.pick[0] + 6, L.pick[1], L.pick[1] + 8], [0, 1, 1, 0], clampOpts);
  // The chosen step is named once, beside the cube, then rides the ring as a ticket.
  const stepName = smooth(L.pick[0] + 8, 10) * fadeOut(L.run[0], L.run[0] + 8);
  const riding = ramp(L.run[0], L.run[1]);
  const receiptOut = ramp(L.see[0] + 4, L.repeat);
  const row3 = pop(L.repeat + 6);
  const step = frame < L.recap[0] + 16 ? 1 : frame < L.recap[1] ? 2 : frame < L.repeat ? 3 : 4;

  const done = ramp(L.done[0], L.done[0] + 14);
  const doneLit = interpolate(frame, [L.done[1], L.done[1] + 6], [0, 1], clampOpts);
  const help = ramp(L.help[0], L.help[0] + 12);
  const helpLit = interpolate(frame, [L.help[1], L.help[1] + 6], [0, 1], clampOpts);
  const gearSpin = interpolate(frame, [L.run[1] - 4, L.run[1] + 14], [0, 1], clampOpts);

  const ticket = onCircle(RING.x, RING.y, RING.r, lerp(0, 90, riding));
  const receipt = {x: lerp(LEFT.x, CARD.x - 60, receiptOut), y: lerp(LEFT.y, CARD.y + 70, receiptOut)};

  return (
    <AbsoluteFill>
      <Layer opacity={out}>
        <Ring cx={RING.x} cy={RING.y} r={RING.r} draw={ring} stations={stations} />
        <Runner cx={RING.x} cy={RING.y} r={RING.r} angle={angle} opacity={runnerOn} />
        <GearMark x={RING.x} y={RING.y + RING.r} frame={frame} opacity={stations[2]} spin={2 + 6 * gearSpin} size={56} />
        {riding > 0 && riding < 1 ? <TicketGlyph x={ticket.x} y={ticket.y} /> : null}
        {frame >= L.see[0] && receiptOut < 1 ? <ReceiptGlyph x={receipt.x} y={receipt.y} opacity={pop(L.see[0]) * (1 - receiptOut * receiptOut)} /> : null}
        {/* Exits from the top station: done, or stuck and asking for help. Mirrored about the centre line. */}
        <Arrow from={TOP} to={{x: RING.x + 100, y: EXIT_Y + 22}} draw={done} dashed={doneLit < 0.5} color={doneLit > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.5)} />
        <Arrow from={TOP} to={{x: RING.x - 100, y: EXIT_Y + 22}} draw={help} dashed={helpLit < 0.5} color={helpLit > 0.5 ? COLORS.white : rgba(COLORS.white, 0.5)} />
      </Layer>
      <Layer>
        <LockedCube id="ta-l-cube" absFrame={abs} {...cube} glow={generating * (0.35 + 0.3 * Math.sin(frame / 4))} />
      </Layer>

      <AbsoluteFill style={{opacity: out}}>
        <Txt x={RING.x} y={RING.y - RING.r + 48} text="GOAL & STATE" size={26} opacity={stations[0]} />
        <Txt x={RING.x + SIDE_LABEL_DX} y={SIDE_LABEL_Y} text="PICK A STEP" size={26} anchor="start" opacity={stations[1]} />
        <Txt x={RING.x} y={RING.y + RING.r + 58} text="RUN IT" size={26} opacity={stations[2]} />
        <Txt x={RING.x - SIDE_LABEL_DX} y={SIDE_LABEL_Y} text="SEE THE RESULT" size={26} anchor="end" opacity={stations[3]} />

        <StateCard
          x={CARD.x}
          y={CARD.y}
          w={CARD.w}
          goal={GOAL}
          flash={flash}
          opacity={smooth(L.card[0], 16)}
          rows={[
            {
              on: lap1,
              text: (
                <span>
                  Parkside, <Struck text="Capital Tower" strike={strike} />
                </span>
              ),
            },
            {on: lap2, text: 'Limit: $250 a night'},
            {on: row3, text: 'Parkside is free'},
          ]}
        />

        <Chip x={RING.x + SIDE_LABEL_DX} y={SIDE_LABEL_Y + 230} text={AVAILABILITY.name} anchor="start" color={COLORS.cyan} textColor={COLORS.cyan} opacity={stepName} glow={generating * 0.5} />

        <Chip x={RING.x + 110} y={EXIT_Y} anchor="start" text="DONE" size={26} dashed={doneLit < 0.5} color={doneLit > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.5)} textColor={doneLit > 0.5 ? COLORS.cyan : rgba(COLORS.white, 0.85)} opacity={smooth(L.done[0] + 8, 10)} glow={doneLit * 0.6} />
        <Chip
          x={RING.x - 110}
          y={EXIT_Y}
          anchor="end"
          text="ASK FOR HELP"
          size={26}
          icon={<PersonIcon size={30} color={helpLit > 0.5 ? COLORS.white : rgba(COLORS.white, 0.7)} />}
          dashed={helpLit < 0.5}
          color={helpLit > 0.5 ? COLORS.white : rgba(COLORS.white, 0.5)}
          opacity={smooth(L.help[0] + 6, 10)}
          glow={helpLit * 0.4}
        />
      </AbsoluteFill>

      <Pinned>
        <Badge kind="loop" step={step} opacity={smooth(L.ring[0] + 10, 12) * out} frame={frame} />
        <SceneTitle text="THE AGENT LOOP" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
