import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba} from '../../../shared/theme';
import {Ring} from '../components/Loop';
import {GearMark, Layer, Note, Txt} from '../components/Parts';
import {CAPTION_Y, CX} from '../layout';
import {TicketGlyph} from '../components/Ticket';
import {lerp, useBeats} from '../lib';
import {HARNESS as H} from '../timing';
import {BOUNDED} from './WorkflowScene';

// Everything is mirrored about the centre: the frame, the emblem, and the four job modules at its corners.
export const HARNESS_CUBE = {x: CX, y: 540, size: 50};
const FRAME = {x: CX, y: 540, w: 1400, h: 660};
const GEAR_AT = {x: CX, y: 300};
const EMBLEM_R = 110;
const MOD = {w: 380, h: 116};
const MODULES = [
  {x: CX - 360, y: 360, label: 'BUILDS EACH REQUEST', icon: 'build'},
  {x: CX + 360, y: 360, label: 'KEEPS STATE', icon: 'state'},
  {x: CX + 360, y: 720, label: 'RUNS TOOLS', icon: 'tools'},
  {x: CX - 360, y: 720, label: 'ENFORCES LIMITS', icon: 'limits'},
] as const;
const TAPE = {y: 830, left: 420, right: 1620};
const TRACE = ['12:01  search_hotels ✓', '12:01  read_policy ✓', '12:02  check_availability ✓'];

// Live mini demos inside each module's icon box (64 × 64).
const ModuleIcon: React.FC<{kind: (typeof MODULES)[number]['icon']; frame: number}> = ({kind, frame}) => {
  const c = COLORS.purple;
  if (kind === 'build') {
    const n = Math.floor(frame / 10) % 4; // slices fill one by one, then start again
    return (
      <g>
        <rect x={16} y={4} width={32} height={56} rx={5} fill="none" stroke={COLORS.cyan} strokeWidth={3} />
        {[0, 1, 2].map((i) => (i < n ? <rect key={i} x={20} y={46 - i * 13} width={24} height={10} rx={2} fill={i === 0 ? rgba(c, 0.8) : rgba(COLORS.cyan, 0.7)} /> : null))}
      </g>
    );
  }
  if (kind === 'state') {
    const n = Math.floor(frame / 12) % 4;
    return (
      <g>
        <rect x={8} y={6} width={48} height={52} rx={6} fill="none" stroke={COLORS.white} strokeWidth={3} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={18} cy={20 + i * 13} r={3.5} fill={i < n ? COLORS.cyan : rgba(COLORS.white, 0.3)} />
            <line x1={26} x2={48} y1={20 + i * 13} y2={20 + i * 13} stroke={rgba(COLORS.white, 0.6)} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  }
  if (kind === 'tools') {
    const t = (frame % 40) / 40;
    return (
      <g>
        <rect x={29} y={4} width={6} height={56} rx={3} fill={c} />
        <TicketGlyph x={lerp(2, 62, t)} y={32} w={30} h={20} opacity={Math.sin(Math.PI * t)} />
      </g>
    );
  }
  const a = interpolate(Math.sin(frame / 12), [-1, 1], [0.25, 0.4]);
  const ang = Math.PI * (1 + a);
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M8 46A24 24 0 0 1 56 46" stroke={rgba(COLORS.white, 0.4)} strokeWidth={6} />
      <path d="M48 26A24 24 0 0 1 56 46" stroke={COLORS.error} strokeWidth={6} />
      <line x1={32} y1={46} x2={32 + 20 * Math.cos(ang)} y2={46 + 20 * Math.sin(ang)} stroke={COLORS.white} strokeWidth={4} />
    </g>
  );
};

const KeyIcon: React.FC<{size?: number}> = ({size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={COLORS.purple} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={20} cy={32} r={12} />
    <path d="M32 32H58M48 32V42M56 32V40" />
  </svg>
);

export const HarnessScene: React.FC = () => {
  const {frame, abs, dur, smooth, ramp, pop, fadeOut} = useBeats('harness');

  // Scene 5's workflow-with-a-bounded-agent shrinks into an emblem around the cube.
  const emblem = ramp(H.emblem[0], H.emblem[1]);
  const railHalf = lerp(660, 230, emblem);
  const ringR = lerp(BOUNDED.r, EMBLEM_R, emblem);
  const cubeIn = smooth(H.emblem[0] + 12, 16);
  const gear = pop(H.gear);
  const bloom = ramp(H.bloom[0], H.bloom[1]);
  const rename = ramp(H.rename[0], H.rename[1]);
  const out = fadeOut(H.out, dur - 2);
  const box = {
    x: lerp(GEAR_AT.x, FRAME.x, bloom),
    y: lerp(GEAR_AT.y, FRAME.y, bloom),
    w: lerp(70, FRAME.w, bloom),
    h: lerp(70, FRAME.h, bloom),
  };
  const mods = H.modules.map((m) => smooth(m, 14));
  const key = pop(H.key);
  const tape = ramp(H.tape[0], H.tape[1] + 10);
  const port = smooth(H.modules[2] + 6, 12);

  return (
    <AbsoluteFill>
      <Layer>
        {/* The emblem: a rail through a loop, the cube at its heart. */}
        <g opacity={out}>
          <line x1={HARNESS_CUBE.x - railHalf} x2={HARNESS_CUBE.x + railHalf} y1={HARNESS_CUBE.y} y2={HARNESS_CUBE.y} stroke={rgba(COLORS.white, 0.55)} strokeWidth={5} strokeLinecap="round" />
          <circle cx={HARNESS_CUBE.x} cy={HARNESS_CUBE.y} r={ringR + 12} fill={COLORS.charcoal} />
          <circle cx={HARNESS_CUBE.x} cy={HARNESS_CUBE.y} r={BOUNDED.r + 30} fill="none" stroke={COLORS.purple} strokeWidth={4} strokeDasharray="10 8" opacity={1 - emblem} />
          <Ring cx={HARNESS_CUBE.x} cy={HARNESS_CUBE.y} r={ringR} draw={1} />
          {[-1, 1].map((s) => (
            <circle key={s} cx={HARNESS_CUBE.x + s * 400} cy={HARNESS_CUBE.y} r={16} fill={COLORS.charcoal} stroke={COLORS.white} strokeWidth={4} opacity={1 - emblem} />
          ))}
        </g>

        {/* The gear opens out into the harness frame. */}
        <g opacity={out}>
          {bloom > 0.001 ? (
            <rect x={box.x - box.w / 2} y={box.y - box.h / 2} width={box.w} height={box.h} rx={lerp(35, 40, bloom)} fill={rgba(COLORS.purple, 0.05)} stroke={COLORS.purple} strokeWidth={4} />
          ) : null}
          {/* The port where tool requests leave the frame. */}
          {port > 0.01 ? (
            <g opacity={port}>
              <rect x={FRAME.x + FRAME.w / 2 - 6} y={MODULES[2].y - 34} width={12} height={68} fill={COLORS.charcoal} />
              <path d={`M${FRAME.x + FRAME.w / 2 - 20} ${MODULES[2].y}H${FRAME.x + FRAME.w / 2 + 80}`} stroke={COLORS.cyan} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-frame * 2} />
              <path d={`M${FRAME.x + FRAME.w / 2 + 70} ${MODULES[2].y - 12}L${FRAME.x + FRAME.w / 2 + 84} ${MODULES[2].y}L${FRAME.x + FRAME.w / 2 + 70} ${MODULES[2].y + 12}`} fill="none" stroke={COLORS.cyan} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : null}
          {/* Tab on the frame's top-left edge. */}
          {bloom > 0.6 ? (
            <g opacity={interpolate(bloom, [0.6, 1], [0, 1], clampOpts)}>
              <rect x={FRAME.x - FRAME.w / 2 + 40} y={FRAME.y - FRAME.h / 2 - 26} width={250} height={52} rx={14} fill={COLORS.charcoal} stroke={COLORS.purple} strokeWidth={3} />
            </g>
          ) : null}
          {/* Spokes from each module to the emblem. */}
          {MODULES.map((m, i) => {
            const toward = {x: HARNESS_CUBE.x + Math.sign(m.x - HARNESS_CUBE.x) * (EMBLEM_R + 20), y: HARNESS_CUBE.y + Math.sign(m.y - HARNESS_CUBE.y) * 60};
            const from = {x: m.x + Math.sign(HARNESS_CUBE.x - m.x) * (MOD.w / 2), y: m.y + Math.sign(HARNESS_CUBE.y - m.y) * 30};
            return mods[i] > 0.01 ? (
              <path key={i} d={`M${from.x} ${from.y}L${toward.x} ${toward.y}`} stroke={COLORS.purple} strokeWidth={3} strokeDasharray="6 8" strokeDashoffset={-frame} opacity={mods[i] * 0.8} />
            ) : null;
          })}
          <GearMark x={GEAR_AT.x} y={GEAR_AT.y} frame={frame} opacity={gear * Math.max(0, 1 - bloom * 2)} label="THE APP" labelAt="above" size={64 * lerp(1, 1.6, bloom)} spin={2 + 10 * bloom} />
        </g>
      </Layer>

      <Layer>
        <LockedCube id="ta-h-cube" absFrame={abs} {...HARNESS_CUBE} appear={cubeIn} />
      </Layer>

      <AbsoluteFill style={{opacity: out}}>
        {/* The tab's label: THE APP becomes HARNESS. */}
        <Txt x={FRAME.x - FRAME.w / 2 + 165} y={FRAME.y - FRAME.h / 2} text="THE APP" size={28} weight={800} color={COLORS.purple} opacity={interpolate(bloom, [0.6, 1], [0, 1], clampOpts) * (1 - rename)} />
        <Txt x={FRAME.x - FRAME.w / 2 + 165} y={FRAME.y - FRAME.h / 2} text="HARNESS" size={28} weight={800} color={COLORS.purple} opacity={rename} scale={lerp(0.9, 1, rename)} />

        {MODULES.map((m, i) =>
          mods[i] > 0.001 ? (
            <div
              key={m.label}
              style={{
                position: 'absolute',
                left: m.x - MOD.w / 2,
                top: m.y - MOD.h / 2,
                width: MOD.w,
                height: MOD.h,
                boxSizing: 'border-box',
                transform: `scale(${lerp(0.85, 1, mods[i])})`,
                opacity: mods[i],
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '0 22px',
                borderRadius: 18,
                border: `2px solid ${COLORS.purple}`,
                background: rgba(COLORS.charcoal, 0.95),
                fontFamily: FONT,
                color: COLORS.white,
              }}
            >
              <svg width={64} height={64} viewBox="0 0 64 64" style={{flex: 'none', overflow: 'visible'}}>
                <ModuleIcon kind={m.icon} frame={frame} />
              </svg>
              <div>
                <div style={{fontSize: 26, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.15}}>{m.label}</div>
                {m.icon === 'tools' ? (
                  <div style={{fontSize: 24, fontWeight: 700, color: COLORS.purple, marginTop: 4, opacity: key, whiteSpace: 'nowrap'}}>
                    WITH ITS OWN ACCESS
                  </div>
                ) : null}
              </div>
              {m.icon === 'tools' && key > 0.01 ? (
                <div style={{position: 'absolute', right: -18, top: -24, transform: `scale(${key}) rotate(-20deg)`, background: COLORS.charcoal, borderRadius: 30, padding: 4}}>
                  <KeyIcon />
                </div>
              ) : null}
            </div>
          ) : null,
        )}

        {/* The trace tape: a record of what happened. */}
        {tape > 0.001 ? (
          <>
            <Txt x={FRAME.x - FRAME.w / 2 + 40} y={TAPE.y} text="RECORDS" size={24} color={COLORS.purple} anchor="start" opacity={tape} spacing="0.16em" />
            <div style={{position: 'absolute', left: TAPE.left, top: TAPE.y - 22, width: TAPE.right - TAPE.left, height: 44, overflow: 'hidden', borderRadius: 8, background: rgba(COLORS.white, 0.06), opacity: Math.min(1, tape * 3)}}>
              <div style={{position: 'absolute', left: lerp(TAPE.right - TAPE.left, 16, tape), top: 0, height: 44, display: 'flex', alignItems: 'center', gap: 40, fontFamily: FONT, fontSize: 24, fontWeight: 500, color: COLORS.white, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
                {TRACE.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <Note x={CX} y={CAPTION_Y} text='Many products call all of this "the agent".' size={26} color={rgba(COLORS.white, 0.7)} opacity={smooth(H.footnote, 14)} />
      </AbsoluteFill>

      <Pinned>
        <SceneTitle text="THE HARNESS" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};

