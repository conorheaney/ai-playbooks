import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba} from '../../../shared/theme';
import {Badge, FlowLine, Layer, MarkAt, Note} from '../components/Parts';
import {TicketGlyph, ToolTicket} from '../components/Ticket';
import {CheckLights, GatePanel, WallLine} from '../components/Wall';
import {Dock, PortalCard} from '../components/World';
import {CAPTION_Y, DOCK_W, DOCKS, GATE, MODEL_CUBE, SEARCH, TICKET_AT, TOOL_LIST, TOOL_NAMES, WALL} from '../layout';
import {lerp, useBeats} from '../lib';
import {TOOLS as T} from '../timing';
import {WORDS_CUBE, WORDS_PORTAL} from './WordsScene';

// Inside the gate the ticket becomes a glyph above the check lights, so the gate holds no small text.
export const IN_GATE = {x: GATE.x, y: GATE.y - 95};
const REACH_Y = 820;

// The tool definitions the app gives the model, in the series' tool-definitions style (purple hatch).
export const ToolList: React.FC<{opacity: number; highlight?: number}> = ({opacity, highlight = 0}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: TOOL_LIST.x,
        top: TOOL_LIST.y,
        width: TOOL_LIST.w,
        boxSizing: 'border-box',
        transform: 'translate(-50%, -50%)',
        padding: '14px 24px 16px',
        borderRadius: 18,
        border: `2px solid ${COLORS.purple}`,
        background: `repeating-linear-gradient(45deg, ${rgba(COLORS.purple, 0.16)} 0 6px, transparent 6px 16px), ${rgba(COLORS.charcoal, 0.95)}`,
        opacity,
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: COLORS.purple, marginBottom: 6}}>TOOLS</div>
      {TOOL_NAMES.map((n) => {
        const lit = n === SEARCH.name ? highlight : 0;
        return (
          <div key={n} style={{fontSize: 24, fontWeight: 700, lineHeight: 1.4, padding: '0 10px', margin: '0 -10px', borderRadius: 8, color: lit > 0.5 ? COLORS.charcoal : COLORS.white, background: rgba(COLORS.cyan, lit)}}>
            {n}
          </div>
        );
      })}
    </div>
  ) : null;

// The wall, gate and docks as Scene 2 leaves them, so Scene 3 can pick them up and fade them.
export const WallWorld: React.FC<{frame: number; opacity: number; wallDraw?: number; gear?: number; docks?: [number, number, number]; scan?: number; glow?: number}> = ({
  frame,
  opacity,
  wallDraw = 1,
  gear = 1,
  docks = [1, 1, 1],
  scan = -1,
  glow = 0,
}) =>
  opacity > 0.001 ? (
    <AbsoluteFill style={{opacity}}>
      <Layer>
        <WallLine draw={wallDraw} />
        <GatePanel opacity={Math.min(1, wallDraw * 1.5)} frame={frame} gear={gear} />
      </Layer>
      <Dock {...DOCKS.file} w={DOCK_W} opacity={docks[0]} />
      <Dock {...DOCKS.search} w={DOCK_W} opacity={docks[1]} scan={scan} glow={glow} />
      <Dock {...DOCKS.portal} w={DOCK_W} opacity={docks[2]} />
    </AbsoluteFill>
  ) : null;

export const ToolsScene: React.FC = () => {
  const {frame, abs, dur, smooth, ramp, pop} = useBeats('tools');

  const move = ramp(T.move[0], T.move[1]);
  const cube = {x: lerp(WORDS_CUBE.x, MODEL_CUBE.x, move), y: lerp(WORDS_CUBE.y, MODEL_CUBE.y, move), size: lerp(WORDS_CUBE.size, MODEL_CUBE.size, move)};
  const wallDraw = ramp(T.wall[0], T.wall[1]);
  const gear = smooth(T.app, 12);
  const docksIn = smooth(T.docks[0], 16);
  // The tool list is read once; after the model picks from it, it steps back.
  const list = smooth(T.list[0], 16) * interpolate(frame, [T.name + 50, T.name + 70], [1, 0.25], clampOpts);
  const printing = ramp(T.print[0], T.print[1]);
  const generating = interpolate(frame, [T.print[0], T.print[0] + 6, T.print[1], T.print[1] + 10], [0, 1, 1, 0], clampOpts);
  const highlight = interpolate(frame, [T.name, T.name + 6, T.name + 40, T.name + 60], [0, 1, 1, 0], clampOpts);
  const toGate = ramp(T.toGate[0], T.toGate[1]);
  const run = ramp(T.run[0], T.run[1]);
  const scan = frame >= T.run[1] - 6 && frame <= T.run[1] + 24 ? interpolate(frame, [T.run[1] - 6, T.run[1] + 24], [0, 1], clampOpts) : -1;
  const dockGlow = interpolate(frame, [T.run[1] - 6, T.run[1], dur], [0, 1, 1], clampOpts);
  const reach = ramp(T.reach[0], T.reach[0] + 12);
  const end = interpolate(frame, [T.out, dur], [1, 0], clampOpts);
  const lights = [0, 1, 2].map((i) => pop(T.checks + i * T.checkStep));
  const portalT = ramp(T.move[0], T.move[1] + 6);

  // The full ticket becomes a glyph where it stands, clear of the gate, so no ticket text ever crosses the gate's
  // outline; the glyph then slides into the gate and later runs out to the supplier search.
  const ticketX = TICKET_AT.x;
  const ticketOpacity = interpolate(toGate, [0, 0.35], [1, 0], clampOpts);
  const glyphIn = interpolate(toGate, [0.15, 0.4], [0, 1], clampOpts);
  const slide = interpolate(toGate, [0.35, 1], [0, 1], clampOpts);
  const glyph = run > 0 ? {x: lerp(IN_GATE.x, DOCKS.search.x - DOCK_W / 2 - 40, run), y: lerp(IN_GATE.y, DOCKS.search.y, run)} : {x: lerp(TICKET_AT.x, IN_GATE.x, slide), y: lerp(TICKET_AT.y, IN_GATE.y, slide)};
  // The model's own reach: down from the cube, then across to the wall, where it stops.
  const REACH_DOWN = REACH_Y - (MODEL_CUBE.y + 80);
  const REACH_ACROSS = WALL.x - 28 - MODEL_CUBE.x;
  const reachLen = reach * (REACH_DOWN + REACH_ACROSS);
  const reachPts = [
    [MODEL_CUBE.x, MODEL_CUBE.y + 80],
    [MODEL_CUBE.x, MODEL_CUBE.y + 80 + Math.min(reachLen, REACH_DOWN)],
    ...(reachLen > REACH_DOWN ? [[MODEL_CUBE.x + (reachLen - REACH_DOWN), REACH_Y]] : []),
  ]
    .map((p) => p.join(','))
    .join(' ');

  return (
    <AbsoluteFill>
      {/* The portal card shrinks towards its dock and is gone before the dock fades in, so the two never overlap. */}
      <WallWorld frame={frame} opacity={1} wallDraw={wallDraw} gear={gear} docks={[docksIn, docksIn, interpolate(portalT, [0.65, 1], [0, 1], clampOpts)]} scan={scan} glow={dockGlow} />
      <PortalCard x={lerp(WORDS_PORTAL.x, DOCKS.portal.x, portalT)} y={lerp(WORDS_PORTAL.y, DOCKS.portal.y, portalT)} w={WORDS_PORTAL.w} scale={lerp(1, 0.6, portalT)} opacity={interpolate(portalT, [0.25, 0.6], [1, 0], clampOpts)} />

      <Layer>
        <LockedCube id="ta-t-cube" absFrame={abs} {...cube} glow={generating * (0.35 + 0.3 * Math.sin(frame / 4))} />
        <FlowLine from={{x: GATE.x + GATE.w / 2 + 10, y: DOCKS.search.y}} to={{x: DOCKS.search.x - DOCK_W / 2 - 10, y: DOCKS.search.y}} frame={frame} opacity={interpolate(frame, [T.run[0] - 4, T.run[0] + 4], [0, 1], clampOpts) * end} />
        <TicketGlyph x={glyph.x} y={glyph.y} opacity={glyphIn * interpolate(run, [0.8, 1], [1, 0], clampOpts)} />
        {/* The model can't reach across the wall itself. */}
        {reach > 0 ? <polyline points={reachPts} fill="none" stroke={rgba(COLORS.white, 0.75)} strokeWidth={4} strokeDasharray="10 10" strokeLinecap="round" strokeLinejoin="round" opacity={end} /> : null}
      </Layer>

      <ToolList opacity={list} highlight={highlight} />
      <ToolTicket
        x={ticketX}
        y={TICKET_AT.y}
        w={TICKET_AT.w}
        print={printing}
        opacity={ticketOpacity}
        glow={generating}
        name={SEARCH.name}
        nameOn={smooth(T.name, 10)}
        inputs={SEARCH.inputs}
        inputsOn={SEARCH.inputs.map((_, i) => smooth(T.inputs + i * T.inputStep, 8))}
      />
      <CheckLights lights={lights} opacity={end} />
      <MarkAt x={WALL.x} y={REACH_Y} ok={false} scale={pop(T.reach[0] + 12) * end} />
      {/* On "runs the tool"; it holds through the cut and Scene 3 fades it, for a 2.7 s reading window. */}
      <Note x={WALL.x} y={CAPTION_Y} text="THE MODEL ASKS. THE APP RUNS." opacity={smooth(T.run[0], 12)} />

      <Pinned>
        <Badge kind="app" opacity={smooth(T.app, 12)} frame={frame} />
        <SceneTitle text="TOOL CALLING" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
