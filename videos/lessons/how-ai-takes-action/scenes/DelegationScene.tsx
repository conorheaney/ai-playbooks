import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {clampOpts} from '../../../shared/lib/motion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {COLORS, rgba} from '../../../shared/theme';
import {Runner} from '../components/Loop';
import {MiniWindow} from '../components/MiniWindow';
import {Chip, Layer, MarkAt, Txt} from '../components/Parts';
import {ReceiptGlyph} from '../components/Ticket';
import {CX} from '../layout';
import {lerp, useBeats} from '../lib';
import {DELEGATE as D} from '../timing';
import {BOUNDS_CUBE_END} from './BoundariesScene';

// The coordinating agent at the top centre; three subagents in mirrored columns below it.
export const COORD = {x: CX, y: 210, size: 46};
export const TASK_Y = 335;
export const RESULT_CHIP = 'ORDER PACK';
const COLS = [CX - 400, CX, CX + 400];
const SUBTASKS = ['QUOTES', 'QUALITY CHECK', 'PAPERWORK'];
const CHIP_Y = 450;
const SUB_Y = 600;
const SUB_DX = 55; // mini cube to the left of each column's centre, its own context window to the right
const GROUP_LABEL_Y = 735;
const RESULT_Y = 800;
const PARTITIONS = [CX - 200, CX + 200];
const COST = {y: 890, labelX: CX - 150, left: CX - 130, w: 320};

export const DelegationScene: React.FC = () => {
  const {frame, abs, dur, smooth, ramp, lin, pop, fadeOut} = useBeats('delegation');

  const move = ramp(0, 20);
  const coord = {x: lerp(BOUNDS_CUBE_END.x, COORD.x, move), y: lerp(BOUNDS_CUBE_END.y, COORD.y, move), size: lerp(BOUNDS_CUBE_END.size, COORD.size, move)};
  const out = fadeOut(D.out, dur - 2);
  const task = smooth(D.task[0] + 8, 14);
  const split = ramp(D.split[0], D.split[1]);
  const subs = COLS.map((_, i) => pop(D.subagents + i * 4));
  const subLabel = smooth(D.subagents + 6, 12) * fadeOut(D.isolate - 10, D.isolate);
  const contexts = ramp(D.contexts[0], D.contexts[1]);
  const isolate = ramp(D.isolate, D.isolate + 16);
  const parallel = ramp(D.parallel[0], D.parallel[0] + 10) * fadeOut(D.parallel[1], D.parallel[1] + 10);
  const parallelLabel = smooth(D.parallel[0], 12) * fadeOut(D.coordinate[0] - 10, D.coordinate[0]);
  const results = COLS.map((_, i) => Math.min(1, pop(D.results[0] + i * 4)));
  const cost = smooth(D.cost[0] - 6, 10);
  const costFill = lerp(0.3, 0.9, lin(D.cost[0], D.cost[1]));
  const coordinate = ramp(D.coordinate[0], D.coordinate[1]);
  // The subagents step back as their results are combined; their chips clear entirely, because the threads to the
  // coordinating agent run up through them.
  const dim = lerp(1, 0.2, ramp(D.coordinate[0] - 10, D.coordinate[0]));
  const chipsOn = 1 - ramp(D.coordinate[0] - 10, D.coordinate[0]);
  const plan = pop(D.coordinate[1] - 4);

  return (
    <AbsoluteFill>
      <Layer opacity={out}>
        {/* Partitions: each subagent works in isolation. */}
        {PARTITIONS.map((x) => (
          <line key={x} x1={x} x2={x} y1={400} y2={400 + 440 * isolate} stroke={rgba(COLORS.white, 0.4)} strokeWidth={3} strokeDasharray="10 10" />
        ))}
        <g opacity={dim}>
          {COLS.map((x, i) => (
            <g key={i}>
              <MiniWindow id={`ta-d-w${i}`} x={x + SUB_DX + 15} y={SUB_Y} w={100} h={150} draw={contexts} opacity={contexts > 0 ? 1 : 0} slices={[{kind: 'brief', h: 30, opacity: contexts >= 1 ? 1 : 0}]} />
              <Runner cx={x - SUB_DX} cy={SUB_Y} r={68} angle={frame * 9 + i * 40} opacity={parallel} />
            </g>
          ))}
          {/* A bracket that groups the three. */}
          <path d={`M${COLS[0] - 120} ${GROUP_LABEL_Y - 40}V${GROUP_LABEL_Y - 28}H${COLS[2] + 120}V${GROUP_LABEL_Y - 40}`} fill="none" stroke={rgba(COLORS.white, 0.5)} strokeWidth={3} opacity={Math.max(subLabel, parallelLabel)} />
        </g>
        {/* Each result comes back, and has to be combined. */}
        {COLS.map((x, i) =>
          coordinate > 0 ? (
            <line key={i} x1={x} y1={RESULT_Y - 30} x2={lerp(x, COORD.x + (i - 1) * 36, coordinate)} y2={lerp(RESULT_Y - 30, TASK_Y - 30, coordinate)} stroke={COLORS.purple} strokeWidth={4} strokeLinecap="round" />
          ) : null,
        )}
        {COLS.map((x, i) => (results[i] > 0.01 ? <ReceiptGlyph key={i} x={x} y={RESULT_Y} opacity={results[i]} /> : null))}
        {/* Cost meter. */}
        <g opacity={cost}>
          <rect x={COST.left} y={COST.y - 8} width={COST.w} height={16} rx={8} fill={rgba(COLORS.white, 0.15)} />
          <rect x={COST.left} y={COST.y - 8} width={COST.w * costFill} height={16} rx={8} fill={COLORS.white} />
        </g>
      </Layer>

      <Layer>
        <LockedCube id="ta-d-coord" absFrame={abs} {...coord} glow={coordinate * 0.4} />
        <g opacity={out * dim}>
          {COLS.map((x, i) => (subs[i] > 0.01 ? <LockedCube key={i} id={`ta-d-sub${i}`} absFrame={abs} x={x - SUB_DX} y={SUB_Y} size={30} appear={subs[i]} glow={parallel * (0.35 + 0.3 * Math.sin(frame / 4 + i))} /> : null))}
        </g>
      </Layer>

      <AbsoluteFill style={{opacity: out}}>
        {/* The task clears at once as it splits, and the subtasks only appear once they have moved apart, so no two
            chips ever sit on top of each other. */}
        <Chip x={COORD.x} y={TASK_Y} text="PREPARE THE ORDER" size={26} color={COLORS.white} opacity={task * interpolate(split, [0, 0.2], [1, 0], clampOpts)} />
        {SUBTASKS.map((s, i) => (
          <Chip key={s} x={lerp(COORD.x, COLS[i], split)} y={lerp(TASK_Y, CHIP_Y, split)} text={s} size={26} color={COLORS.white} opacity={interpolate(split, [0.55, 0.85], [0, 1], clampOpts) * chipsOn} />
        ))}
        <Txt x={CX} y={GROUP_LABEL_Y} text="SUBAGENTS" size={26} opacity={subLabel} />
        <Txt x={CX} y={GROUP_LABEL_Y} text="IN PARALLEL" size={26} color={COLORS.cyan} opacity={parallelLabel} />
        {COLS.map((x, i) => (
          <MarkAt key={i} x={x + 40} y={RESULT_Y - 26} ok size={34} scale={results[i] * dim} />
        ))}
        <Txt x={COST.labelX} y={COST.y} text="COST" size={26} anchor="end" opacity={cost} />
      </AbsoluteFill>

      {/* The combined result stays with the coordinating cube through the cut; Scene 9 fades both together. */}
      <Chip x={COORD.x} y={TASK_Y} text={RESULT_CHIP} size={26} color={COLORS.cyan} textColor={COLORS.cyan} scale={Math.min(1, plan)} opacity={plan > 0.01 ? 1 : 0} glow={plan * 0.6} />

      <Pinned>
        <SceneTitle text="DELEGATION" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
