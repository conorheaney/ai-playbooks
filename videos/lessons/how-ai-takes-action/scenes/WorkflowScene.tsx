import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {COLORS, rgba} from '../../../shared/theme';
import {Ring} from '../components/Loop';
import {Chip, Layer, Txt} from '../components/Parts';
import {CX} from '../layout';
import {lerp, onCircle, useBeats} from '../lib';
import {FLOW as F} from '../timing';
import {LOOP_CUBE} from './LoopScene';

// Both lanes share one centred grid: rails from 360 to 1560, stops at 560, 960 and 1360.
const RAIL = {left: 360, right: 1560};
const COLS = [560, 960, 1360];
const WF_Y = 380;
const AG_Y = 760;
const MERGED_Y = 540;
const HEADER_DY = -78;
const LABEL_DY = 46;
const TAG_DX = 220; // both lane tags start at the same x, clear of the longer header
const STOPS_A = ['SEARCH', 'CHECK LIMIT', 'BOOK CHEAPEST'];
const STOPS_B = ['TRIP REQUEST', 'FIND A HOTEL', 'SEND ITINERARY'];
const BRANCH = {x: 1160, y: WF_Y - 80}; // a pre-set side route, drawn with the rest of the plan
export const BOUNDED = {x: CX, y: MERGED_Y, r: 90};

// The agent's path runs through the same three columns; the dim nodes are routes it could have taken.
const PATH_LABELS = ['SEARCH', 'READ POLICY', 'CHECK AVAILABILITY'];
const ALTERNATIVES = [
  {x: 760, y: AG_Y - 70},
  {x: 1160, y: AG_Y - 70},
];
const RESULTS = ['Capital Tower $289?', '$250 limit', 'Parkside is free'];

const Shuttle: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 1}) =>
  opacity > 0.001 ? (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={-26} y={-15} width={52} height={30} rx={15} fill={rgba(COLORS.cyan, 0.3)} />
      <rect x={-20} y={-11} width={40} height={22} rx={11} fill={COLORS.cyan} />
    </g>
  ) : null;

const Rails: React.FC<{y: number; opacity: number; gap?: [number, number]}> = ({y, opacity, gap}) => (
  <g opacity={opacity}>
    {(gap ? [[RAIL.left, gap[0]], [gap[1], RAIL.right]] : [[RAIL.left, RAIL.right]]).map(([a, b]) => (
      <rect key={a} x={a} y={y - 3} width={b - a} height={6} rx={3} fill={rgba(COLORS.white, 0.8)} />
    ))}
    {Array.from({length: 31}, (_, i) => RAIL.left + 20 + i * 39)
      .filter((x) => !gap || x < gap[0] || x > gap[1])
      .map((x) => (
        <rect key={x} x={x} y={y - 11} width={5} height={22} rx={2} fill={rgba(COLORS.white, 0.3)} />
      ))}
  </g>
);

export const WorkflowScene: React.FC = () => {
  const {frame, abs, smooth, ramp, lin, pop, fadeOut} = useBeats('workflow');

  const cubeOut = fadeOut(0, 14);
  const blueprint = ramp(F.blueprint[0], F.blueprint[1]);
  const ink = ramp(F.ink[0], F.ink[1]);
  const shuttle = lin(F.shuttle[0], F.shuttle[1]);
  const agentIn = smooth(F.agentIn[0], 16);
  const agentOut = fadeOut(F.merge[0], F.merge[0] + 16);
  const merge = ramp(F.merge[0], F.merge[1]);
  const relabel = ramp(F.merge[0] + 14, F.merge[1] + 6);
  const bounded = ramp(F.bounded[0], F.bounded[1]);
  const wfY = lerp(WF_Y, MERGED_Y, merge);
  const header = fadeOut(F.merge[0], F.merge[0] + 14);

  // Shuttle: a straight run on the planned route; later, into the bounded agent's loop and out again.
  const run2 = [lin(F.run[0], F.run[0] + 12), lin(F.run[0] + 12, F.run[1] - 8), lin(F.run[1] - 8, F.run[1])];
  let shuttlePos = {x: lerp(RAIL.left, RAIL.right, shuttle), y: WF_Y, opacity: shuttle > 0 && shuttle < 1 ? 1 : 0};
  if (frame >= F.run[0]) {
    if (run2[0] < 1) {
      shuttlePos = {x: lerp(RAIL.left, BOUNDED.x - BOUNDED.r, run2[0]), y: MERGED_Y, opacity: Math.min(1, run2[0] * 6)};
    } else if (run2[1] < 1) {
      shuttlePos = {...onCircle(BOUNDED.x, BOUNDED.y, BOUNDED.r, lerp(180, 1080, run2[1])), opacity: 1};
    } else {
      shuttlePos = {x: lerp(BOUNDED.x + BOUNDED.r, COLS[2], run2[2]), y: MERGED_Y, opacity: 1};
    }
  }

  const nodeLit = (k: number) => pop(F.pick[k]);
  const segDraw = (k: number) => ramp(F.pick[k + 1] - 8, F.pick[k + 1] + 4);
  // One result at a time: each shows above its node and gives way to the next.
  const resultOn = (k: number) => Math.min(1, pop(F.results[k])) * (k < 2 ? fadeOut(F.results[k + 1] - 4, F.results[k + 1] + 4) : 1);

  return (
    <AbsoluteFill>
      <Layer>
        <LockedCube id="ta-f-cube" absFrame={abs} {...LOOP_CUBE} appear={cubeOut} />

        {/* WORKFLOW: the whole route is drawn before anything moves. */}
        <g opacity={blueprint * (1 - ink)}>
          <line x1={RAIL.left} x2={lerp(RAIL.left, RAIL.right, blueprint)} y1={wfY} y2={wfY} stroke={COLORS.purple} strokeWidth={3} strokeDasharray="10 8" />
          <line x1={COLS[1]} y1={wfY} x2={lerp(COLS[1], BRANCH.x, blueprint)} y2={lerp(wfY, BRANCH.y, blueprint)} stroke={COLORS.purple} strokeWidth={3} strokeDasharray="10 8" />
        </g>
        {ink > 0 ? (
          <g>
            <Rails y={wfY} opacity={ink} gap={bounded > 0 ? [BOUNDED.x - BOUNDED.r - 30, BOUNDED.x + BOUNDED.r + 30] : undefined} />
            <g opacity={ink * header}>
              <line x1={COLS[1]} y1={wfY} x2={BRANCH.x} y2={BRANCH.y} stroke={rgba(COLORS.white, 0.8)} strokeWidth={6} strokeLinecap="round" />
              <circle cx={BRANCH.x} cy={BRANCH.y} r={14} fill={COLORS.charcoal} stroke={COLORS.white} strokeWidth={4} />
            </g>
          </g>
        ) : null}
        {bounded > 0 ? (
          <g>
            <circle cx={BOUNDED.x} cy={BOUNDED.y} r={(BOUNDED.r + 30) * bounded} fill="none" stroke={COLORS.purple} strokeWidth={4} strokeDasharray="10 8" />
            <Ring cx={BOUNDED.x} cy={BOUNDED.y} r={BOUNDED.r} draw={bounded} chevrons={bounded > 0.9} />
          </g>
        ) : null}
        {COLS.map((x, i) => (i === 1 && bounded > 0.5 ? null : <circle key={x} cx={x} cy={wfY} r={16 * Math.min(1, blueprint * 2)} fill={COLORS.charcoal} stroke={ink > 0.5 ? COLORS.white : COLORS.purple} strokeWidth={4} />))}
        <Shuttle x={shuttlePos.x} y={shuttlePos.y} opacity={shuttlePos.opacity} />

        {/* AGENT: the path is drawn one step at a time, each after its result. */}
        <g opacity={agentIn * agentOut}>
          {ALTERNATIVES.map((a, i) => (
            <g key={i}>
              <line x1={COLS[i]} y1={AG_Y} x2={a.x} y2={a.y} stroke={rgba(COLORS.white, 0.2)} strokeWidth={3} strokeDasharray="6 8" />
              <line x1={a.x} y1={a.y} x2={COLS[i + 1]} y2={AG_Y} stroke={rgba(COLORS.white, 0.2)} strokeWidth={3} strokeDasharray="6 8" />
              <circle cx={a.x} cy={a.y} r={13} fill={COLORS.charcoal} stroke={rgba(COLORS.white, 0.35)} strokeWidth={3} />
            </g>
          ))}
          {[0, 1].map((k) => {
            const t = segDraw(k);
            return t > 0 ? <line key={k} x1={COLS[k]} y1={AG_Y} x2={lerp(COLS[k], COLS[k + 1], t)} y2={AG_Y} stroke={COLORS.cyan} strokeWidth={5} strokeLinecap="round" /> : null;
          })}
          {COLS.map((x, k) => {
            const lit = nodeLit(k);
            return (
              <g key={x}>
                <circle cx={x} cy={AG_Y} r={16} fill={COLORS.charcoal} stroke={rgba(COLORS.white, 0.4)} strokeWidth={4} />
                {lit > 0.01 ? <circle cx={x} cy={AG_Y} r={16 * Math.min(1, lit)} fill={COLORS.cyan} /> : null}
              </g>
            );
          })}
        </g>
      </Layer>

      {/* Lane headers, both left-aligned to the rails. */}
      <Txt x={RAIL.left} y={WF_Y + HEADER_DY} text="WORKFLOW" size={28} weight={800} anchor="start" opacity={blueprint * header} />
      <Txt x={RAIL.left + TAG_DX} y={WF_Y + HEADER_DY} text="route set in advance" size={26} weight={500} spacing="0.02em" color={rgba(COLORS.white, 0.7)} anchor="start" opacity={ink * header} />
      <Txt x={RAIL.left} y={AG_Y + HEADER_DY - 40} text="AGENT" size={28} weight={800} anchor="start" opacity={agentIn * agentOut} />
      <Txt x={RAIL.left + TAG_DX} y={AG_Y + HEADER_DY - 40} text="next step depends on results" size={26} weight={500} spacing="0.02em" color={rgba(COLORS.white, 0.7)} anchor="start" opacity={agentIn * agentOut} />

      {COLS.map((x, i) => (
        <React.Fragment key={x}>
          <Txt x={x} y={wfY + LABEL_DY} text={STOPS_A[i]} size={24} opacity={Math.min(1, blueprint * 2) * (1 - relabel)} />
          {!(i === 1 && bounded > 0) ? <Txt x={x} y={wfY + LABEL_DY} text={STOPS_B[i]} size={24} opacity={relabel} /> : null}
        </React.Fragment>
      ))}
      <Txt x={BOUNDED.x} y={BOUNDED.y + BOUNDED.r + 62} text={STOPS_B[1]} size={24} opacity={bounded} />
      <Txt x={BOUNDED.x} y={BOUNDED.y - BOUNDED.r - 62} text="BOUNDED AGENT" size={26} color={COLORS.cyan} opacity={bounded} />

      <div style={{position: 'absolute', inset: 0, opacity: agentIn * agentOut}}>
        {COLS.map((x, k) => (
          <Txt key={x} x={x} y={AG_Y + LABEL_DY} text={PATH_LABELS[k]} size={24} opacity={Math.min(1, nodeLit(k))} />
        ))}
        {RESULTS.map((r, k) => (
          <Chip key={r} x={COLS[k]} y={AG_Y - 60} text={r} size={24} weight={500} color={COLORS.cyan} fill={rgba(COLORS.cyan, 0.12)} opacity={resultOn(k)} />
        ))}
      </div>

      <Pinned>
        <SceneTitle text="WORKFLOW VS AGENT" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
