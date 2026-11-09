import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mark} from '../../../shared/components/Bubble';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {ContextTank, Segment, SEGMENT_STYLE, SegKind, segmentRect} from '../../../shared/components/context/ContextTank';
import {AppMarker, LockedCube, PromptBar, StatusBadge} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {FlowLine, InfoCard, Note} from '../components/Parts';
import {drawerCenter, MemoryStore, NEW_MEMORY} from '../components/MemoryStore';
import {CAPACITY, CUBE_HOME, TANK_HOME} from '../layout';
import {MEMORY as M, SCENES} from '../timing';

const STORE_A = {x: 1400, y: 560, scale: 1};
const STORE_B = {x: 1660, y: 560, scale: 0.8};
const PROPOSED = {x: 900, y: 560, w: 300};
const REQUEST = 'Book my hotel for the next Canberra trip.';
const BAR = {x: 800, y: 985, w: 880};
const MSG: [number, number] = [0, 0.05];
const MEM: [number, number] = [0.05, 0.11];
const RESPONSE = {x: 740, y: 290, text: 'Parkside Hotel is a 5-minute walk from Parliament House.'};
const GHOST = {x: 700, y: 810, text: 'The Airport Motel is cheapest.'};

// Finale: the four pathways all lead into one context window at true screen centre.
const FIN = {x: 960, y: 380, w: 180, h: 240};
const PATHWAYS: {label: string; kind: SegKind; color: string; from: {x: number; y: number}; to: {x: number; y: number}; labelAt: {x: number; y: number; anchor: 'start' | 'middle' | 'end'}}[] = [
  {label: 'PROMPT', kind: 'message', color: COLORS.cyan, from: {x: 560, y: FIN.y}, to: {x: FIN.x - FIN.w / 2 - 16, y: FIN.y}, labelAt: {x: 536, y: FIN.y, anchor: 'end'}},
  {label: 'CONTEXT ENGINEERING', kind: 'instructions', color: COLORS.purple, from: {x: FIN.x, y: 150}, to: {x: FIN.x, y: FIN.y - FIN.h / 2 - 16}, labelAt: {x: FIN.x, y: 122, anchor: 'middle'}},
  {label: 'RETRIEVAL', kind: 'retrieved', color: COLORS.cyan, from: {x: 1360, y: FIN.y}, to: {x: FIN.x + FIN.w / 2 + 16, y: FIN.y}, labelAt: {x: 1384, y: FIN.y, anchor: 'start'}},
  {label: 'MEMORY', kind: 'memory', color: COLORS.purple, from: {x: FIN.x, y: 620}, to: {x: FIN.x, y: FIN.y + FIN.h / 2 + 16}, labelAt: {x: FIN.x, y: 650, anchor: 'middle'}},
];
const FIN_SLICE = 0.18;

const Pill: React.FC<{x: number; y: number; text: string; chars?: number; color: string; opacity: number; dashed?: boolean}> = ({x, y, text, chars, color, opacity, dashed}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        opacity,
        padding: '14px 26px',
        borderRadius: 30,
        border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        background: rgba(COLORS.charcoal, 0.94),
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 25,
        color: COLORS.white,
        whiteSpace: 'pre',
      }}
    >
      {chars === undefined ? text : text.slice(0, Math.floor(chars))}
      {chars !== undefined ? <span style={{opacity: 0}}>{text.slice(Math.floor(chars))}</span> : null}
    </div>
  ) : null;

export const MemoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.memory.from + frame;
  const dur = SCENES.memory.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  // Phase 1: now. The model proposes; the app decides and stores.
  const phase1 = interpolate(frame, [M.later[0], M.later[0] + 10], [1, 0], clampOpts);
  const propose = interpolate(frame, [M.propose[0], M.propose[1]], [0, 1], ease);
  const checked = spring({frame: frame - M.check[0], fps, config: {damping: 12, stiffness: 180}});
  const filing = interpolate(frame, [M.file[0], M.file[1]], [0, 1], ease);
  const solid = interpolate(frame, [M.file[0], M.file[0] + 8], [0, 1], clampOpts);
  const drawer3A = drawerCenter(STORE_A.x, STORE_A.y, STORE_A.scale, 2);

  // Phase 2: next week. The store moves aside and a new request starts.
  const later = interpolate(frame, [M.later[0] + 5, M.later[1] + 10], [0, 1], ease);
  const store = {x: lerp(STORE_A.x, STORE_B.x, later), y: STORE_A.y, scale: lerp(STORE_A.scale, STORE_B.scale, later)};
  const tankDraw = interpolate(frame, [M.later[0] + 10, M.later[1] + 10], [0, 1], ease);
  const barIn = smooth(M.bar[0], 14);
  const barDrop = interpolate(frame, [M.barDrop[0], M.barDrop[1]], [0, 1], ease);
  const open = interpolate(frame, [M.retrieve[0], M.retrieve[0] + 10], [0, 1], ease) * interpolate(frame, [M.fly[1], M.fly[1] + 12], [1, 0], clampOpts);
  const lift = interpolate(frame, [M.retrieve[0] + 6, M.retrieve[1]], [0, 1], ease);
  const fly = interpolate(frame, [M.fly[0], M.fly[1]], [0, 1], ease);
  const drawer3B = drawerCenter(store.x, store.y, store.scale, 2);
  const generating = interpolate(frame, [M.response[0], M.response[0] + 6, M.response[1], M.response[1] + 10], [0, 1, 1, 0], clampOpts);
  const used = spring({frame: frame - M.used, fps, config: {damping: 12, stiffness: 180}});
  const ghost = interpolate(frame, [M.ignored[0], M.ignored[0] + 16], [0, 1], clampOpts);
  const app = Math.max(presence(frame, M.appIn, M.later[0] + 10, 12, 10), presence(frame, M.retrieve[0] - 6, M.fly[1] + 20, 10, 12));

  const segments: Segment[] = [
    {kind: 'message', from: MSG[0], to: MSG[1], opacity: barDrop >= 1 ? 1 : 0, text: 'YOUR MESSAGE', textOpacity: 0.9},
    {kind: 'memory', from: MEM[0], to: MEM[1], opacity: fly >= 1 ? 1 : 0, text: 'MEMORY', textOpacity: 0.9},
  ];
  const tokens = ((barDrop >= 1 ? MSG[1] - MSG[0] : 0) + (fly >= 1 ? MEM[1] - MEM[0] : 0)) * CAPACITY;

  // Finale.
  const finale = interpolate(frame, [M.finale, M.finale + M.fadeOut], [0, 1], clampOpts);
  const finTank = interpolate(frame, [M.pathways, M.pathways + 14], [0, 1], ease);
  const pathT = (i: number) => interpolate(frame, [M.pathways + 6 + i * M.pathwayStep, M.pathways + 6 + i * M.pathwayStep + 14], [0, 1], ease);
  const title = spring({frame: frame - M.titleIn, fps, config: {damping: 12, stiffness: 120}});

  const msgRect = segmentRect(TANK_HOME, MSG[0], MSG[1]);
  const memRect = segmentRect(TANK_HOME, MEM[0], MEM[1]);

  return (
    <AbsoluteFill>
      {/* Scene content fades out completely before the finale. */}
      <AbsoluteFill style={{opacity: 1 - finale}}>
        <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
          <LockedCube id="gc-m-cube" absFrame={abs} {...CUBE_HOME} glow={generating * (0.35 + 0.3 * Math.sin(frame / 4))} />
          <MemoryStore x={store.x} y={store.y} scale={store.scale} draw={interpolate(frame, [M.store[0], M.store[1]], [0, 1], ease)} newMemory={filing >= 1 ? 1 : 0} open={open} lifted={lift} />
          <Caption x={STORE_A.x} y={STORE_A.y + 220} text="SCOPE: YOU · KEEP 90 DAYS" color={COLORS.purple} size={18} opacity={smooth(M.file[1] - 6, 12) * phase1} />
          <Caption x={CUBE_HOME.x} y={CUBE_HOME.y + 210} text="THE MODEL CAN'T SAVE ANYTHING ITSELF" color={rgba(COLORS.white, 0.75)} size={18} opacity={smooth(M.notModel, 12) * phase1} />
          <AppMarker x={PROPOSED.x - 40} y={PROPOSED.y + 190} opacity={presence(frame, M.appIn, M.later[0] + 10, 12, 10)} frame={frame} />
          <AppMarker x={STORE_B.x - 60} y={STORE_B.y + 230} opacity={presence(frame, M.retrieve[0] - 6, M.fly[1] + 20, 10, 12)} frame={frame} />

          {/* The app's check before anything is written. */}
          {frame >= M.check[0] && phase1 > 0 && filing < 0.3 ? (
            <g transform={`translate(${PROPOSED.x + PROPOSED.w / 2 + 6} ${PROPOSED.y - 74}) scale(${checked})`} opacity={phase1 * (1 - filing / 0.3)}>
              <circle r={24} fill={COLORS.purple} />
              <path d="M-10 0L-3 7L10 -7" stroke={COLORS.charcoal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <text x={36} y={1} fill={COLORS.purple} fontFamily={FONT} fontWeight={700} fontSize={18} letterSpacing="0.16em" dominantBaseline="central">
                STORE
              </text>
            </g>
          ) : null}

          <ContextTank id="gc-m-tank" {...TANK_HOME} draw={tankDraw} opacity={tankDraw > 0 ? 1 : 0} segments={segments} readout={{tokens, capacity: CAPACITY, opacity: tankDraw}} />
          <FlowLine from={{x: CUBE_HOME.x + 60, y: CUBE_HOME.y - 150}} to={{x: RESPONSE.x - 120, y: RESPONSE.y + 34}} frame={frame} opacity={generating} bend={-30} />

          {frame >= M.used ? (
            <g transform={`translate(${RESPONSE.x + 250} ${RESPONSE.y + 70}) scale(${used})`}>
              <Mark ok />
              <text x={38} y={1} fill={COLORS.cyan} fontFamily={FONT} fontWeight={700} fontSize={20} letterSpacing="0.16em" dominantBaseline="central">
                USED
              </text>
            </g>
          ) : null}
          {ghost > 0 ? (
            <g transform={`translate(${GHOST.x + 236} ${GHOST.y})`} opacity={ghost}>
              <rect x={0} y={-20} width={128} height={40} rx={10} fill={rgba(COLORS.charcoal, 0.9)} stroke={COLORS.error} strokeWidth={3} />
              <text x={64} y={1} fill={COLORS.error} fontFamily={FONT} fontWeight={800} fontSize={18} letterSpacing="0.12em" textAnchor="middle" dominantBaseline="central">
                IGNORED
              </text>
            </g>
          ) : null}
        </svg>

        <Pill x={560} y={330} text="I always prefer hotels near Parliament House." color={COLORS.cyan} opacity={smooth(M.pill[0], 14) * phase1} />

        {/* The model proposes a memory... */}
        {propose > 0 && filing < 1 ? (
          <InfoCard
            x={lerp(lerp(CUBE_HOME.x, PROPOSED.x, propose), drawer3A.x, filing)}
            y={lerp(lerp(CUBE_HOME.y, PROPOSED.y, propose), drawer3A.y, filing)}
            w={PROPOSED.w}
            label={solid > 0.5 ? 'MEMORY' : 'PROPOSED'}
            text={NEW_MEMORY}
            color={solid > 0.5 ? COLORS.purple : rgba(COLORS.white, 0.7)}
            dashed={solid < 0.5}
            fill={solid > 0.5 ? rgba(COLORS.purple, 0.25) : undefined}
            scale={lerp(0.3, 1, propose) * lerp(1, 0.4, filing)}
            opacity={Math.min(1, propose * 2) * interpolate(filing, [0.7, 1], [1, 0], clampOpts)}
          />
        ) : null}

        {/* ...next week, the app retrieves it into a new context. */}
        {lift > 0 && fly < 1 ? (
          (() => {
            const startX = drawer3B.x + 40 * store.scale;
            const startY = drawer3B.y - 50 * lift;
            const w = lerp(PROPOSED.w * 0.8, memRect.w, fly);
            const h = lerp(70, memRect.h, fly);
            return (
              <div
                style={{
                  position: 'absolute',
                  left: lerp(startX, memRect.x + memRect.w / 2, fly) - w / 2,
                  top: lerp(startY, memRect.y + memRect.h / 2, fly) - h / 2,
                  width: w,
                  height: h,
                  boxSizing: 'border-box',
                  borderRadius: lerp(16, 4, fly),
                  border: `2px solid ${COLORS.purple}`,
                  background: fly > 0 ? SEGMENT_STYLE.memory.fill : rgba(COLORS.charcoal, 0.94),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: 19,
                  color: rgba(COLORS.white, 1 - Math.min(1, fly * 2.5)),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  opacity: Math.min(1, lift * 2),
                }}
              >
                {NEW_MEMORY}
              </div>
            );
          })()
        ) : null}

        {barDrop <= 0 ? (
          <PromptBar x={BAR.x} y={BAR.y + 40 * (1 - barIn)} width={BAR.w} text={REQUEST} chars={interpolate(frame, [M.bar[0] + 4, M.bar[1]], [0, REQUEST.length], clampOpts)} opacity={barIn} frame={frame} />
        ) : barDrop < 1 ? (
          <div
            style={{
              position: 'absolute',
              left: lerp(BAR.x - BAR.w / 2, msgRect.x, barDrop),
              top: lerp(BAR.y - 48, msgRect.y, barDrop),
              width: lerp(BAR.w, msgRect.w, barDrop),
              height: lerp(96, msgRect.h, barDrop),
              boxSizing: 'border-box',
              borderRadius: lerp(48, 4, barDrop),
              border: `2px solid ${COLORS.cyan}`,
              background: SEGMENT_STYLE.message.fill,
            }}
          />
        ) : null}

        <Pill x={RESPONSE.x} y={RESPONSE.y} text={RESPONSE.text} chars={interpolate(frame, [M.response[0] + 4, M.response[1]], [0, RESPONSE.text.length], clampOpts)} color={COLORS.cyan} opacity={smooth(M.response[0], 10)} />
        <Pill x={GHOST.x} y={GHOST.y} text={GHOST.text} color={rgba(COLORS.white, 0.6)} opacity={ghost * 0.55} dashed />
        <Note x={700} y={930} text="Used, ignored or misapplied. Memory isn't a guarantee." opacity={smooth(M.caption, 14)} />

        <Pinned>
          <StatusBadge kind="app" opacity={app} frame={frame} />
        </Pinned>
        <Pinned>
          <SceneTitle text="MEMORY" mode="corner" />
        </Pinned>
      </AbsoluteFill>

      <Pinned>
        {/* "Next week": a sweep across the whole screen. */}
        {frame >= M.later[0] && frame <= M.later[1] + 4 ? (
          (() => {
            const x = interpolate(frame, [M.later[0], M.later[1]], [-120, VIDEO.width + 120], {...clampOpts, easing: Easing.inOut(Easing.quad)});
            return (
              <>
                <div style={{position: 'absolute', left: x - 2, top: 0, width: 4, height: VIDEO.height, background: rgba(COLORS.purple, 0.8), boxShadow: `0 0 30px ${rgba(COLORS.purple, 0.8)}`}} />
                <div
                  style={{
                    position: 'absolute',
                    left: x,
                    top: VIDEO.height / 2,
                    transform: 'translate(-50%, -50%)',
                    padding: '10px 26px',
                    borderRadius: 30,
                    border: `2px solid ${COLORS.purple}`,
                    background: rgba(COLORS.charcoal, 0.95),
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 26,
                    letterSpacing: '0.14em',
                    color: COLORS.white,
                    whiteSpace: 'nowrap',
                  }}
                >
                  NEXT WEEK
                </div>
              </>
            );
          })()
        ) : null}

        {/* Finale: every pathway arrives in the same place. */}
        {frame >= M.pathways ? (
          <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`} style={{position: 'absolute', inset: 0}}>
            <ContextTank
              id="gc-m-fin"
              {...FIN}
              draw={finTank}
              segments={PATHWAYS.map((p, i) => ({kind: p.kind, from: i * FIN_SLICE, to: (i + 1) * FIN_SLICE, opacity: pathT(i) >= 1 ? 1 : 0}))}
            />
            {PATHWAYS.map((p, i) => {
              const t = pathT(i);
              if (t <= 0) {
                return null;
              }
              const tip = {x: lerp(p.from.x, p.to.x, t), y: lerp(p.from.y, p.to.y, t)};
              const angle = Math.atan2(p.to.y - p.from.y, p.to.x - p.from.x);
              const head = (s: number) => `${tip.x + Math.cos(angle + s) * -18} ${tip.y + Math.sin(angle + s) * -18}`;
              return (
                <g key={p.label} opacity={Math.min(1, t * 2)}>
                  <line x1={p.from.x} y1={p.from.y} x2={tip.x} y2={tip.y} stroke={p.color} strokeWidth={4} strokeLinecap="round" />
                  <path d={`M${head(0.5)}L${tip.x} ${tip.y}L${head(-0.5)}`} fill="none" stroke={p.color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                  <Caption x={p.labelAt.x} y={p.labelAt.y} text={p.label} anchor={p.labelAt.anchor} color={p.color} size={22} />
                </g>
              );
            })}
          </svg>
        ) : null}
        {frame >= M.titleIn ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 830,
              textAlign: 'center',
              transform: `translateY(-50%) scale(${interpolate(frame, [M.titleIn, dur], [1, 1.04], clampOpts) * lerp(0.86, 1, title)})`,
              opacity: Math.min(1, title * 1.3),
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: COLORS.white,
              textShadow: `0 0 40px ${rgba(COLORS.cyan, 0.45)}`,
            }}
          >
            EVERYTHING ARRIVES
            <br />
            THROUGH CONTEXT.
          </div>
        ) : null}
      </Pinned>
    </AbsoluteFill>
  );
};
