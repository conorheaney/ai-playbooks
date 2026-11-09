import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {Bubble} from '../../../shared/components/Bubble';
import {GlowFilter} from '../../../shared/components/Glow';
import {ModelCube} from '../components/ModelCube';
import {Caption, LoopBadge, Person} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {Camera, lerp, project, seeded, Vec2, Vec3} from '../../../shared/lib/math';
import {clampOpts, flashAt} from '../lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {RELEASE as R, SCENES} from '../timing';
import {LOCK_POSE} from './LockInScene';

const RACKS = {x: 470, y: 520, w: 110, h: 300, gap: 22, count: 3};
const GLOBE = {x: 1340, y: 500, r: 250};
const TEAM = {x: [300, 380, 460], y: 880};
const NEXT = {x: 660, y: 880};
const USERS_TOTAL = 100_000_000;
const PROMPT_TEXT = 'How can I help you today?';
const CHANNELS = [
  {label: 'APPS', ctrl: {x: 880, y: 250}, to: {x: 1170, y: 360}},
  {label: 'API', ctrl: {x: 880, y: 500}, to: {x: GLOBE.x - GLOBE.r, y: 500}},
  {label: 'WEB', ctrl: {x: 880, y: 760}, to: {x: 1170, y: 650}},
];
const ARC_FROM = {x: RACKS.x + 1.5 * RACKS.w + RACKS.gap + 10, y: RACKS.y};
// Users' feedback travels from the globe to the monitoring team, arcing above the next-model cube.
const FEEDBACK_ARC = {from: {x: GLOBE.x - 120, y: GLOBE.y + GLOBE.r - 40}, ctrl: {x: 900, y: 700}, to: {x: TEAM.x[2] + 30, y: TEAM.y - 30}};
const BUBBLES = [
  {x: 1660, y: 250, text: 'Help me write a poem'},
  {x: 1720, y: 650, text: 'Debug this code'},
  {x: 1080, y: 230, text: 'Plan my trip to Japan'},
  {x: 1730, y: 900, text: 'Explain my tax bill'},
];

const r = seeded('release');
// User locations on the globe (deterministic), each lighting up at its own moment.
const USERS = Array.from({length: 70}, (_, i) => {
  const lat = Math.asin(r('lat', i) * 1.6 - 0.8);
  const lon = r('lon', i) * Math.PI * 2;
  return {
    p: {x: Math.cos(lat) * Math.cos(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.sin(lon)} as Vec3,
    at: R.usersStart + (i / 70) * (R.usersEnd - R.usersStart - 20),
  };
});
const LEDS = Array.from({length: RACKS.count * 8}, (_, i) => ({phase: r('led', i) * 40, period: 14 + Math.floor(r('per', i) * 20)}));
const LATS = [-60, -30, 0, 30, 60].map((d) => (d * Math.PI) / 180);
const LONS = Array.from({length: 6}, (_, i) => (i * Math.PI) / 6);

const bez = (a: Vec2, c: Vec2, b: Vec2, t: number): Vec2 => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

export const ReleaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.release.from + frame;
  const dur = SCENES.release.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const pop = (start: number) => (frame >= start ? spring({frame: frame - start, fps, config: {damping: 11, stiffness: 170}}) : 0);

  // 1. The locked model is deployed into data centres.
  const racksIn = smooth(R.racks, 20);
  const deploy = interpolate(frame, [R.intoRacks, R.powerOn - 5], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const cube = {x: lerp(LOCK_POSE.x, RACKS.x, deploy), y: lerp(LOCK_POSE.y, RACKS.y - 40, deploy), size: lerp(LOCK_POSE.size, 26, deploy)};
  const cubeVisible = interpolate(frame, [R.powerOn - 12, R.powerOn - 2], [1, 0], clampOpts);
  const powered = frame >= R.powerOn;

  // 2. Served worldwide.
  const globeIn = smooth(R.globe, 25);
  const cam: Camera = {yaw: frame * 0.008, pitch: -0.35, distance: 6, scale: GLOBE.r * globeIn, cx: GLOBE.x, cy: GLOBE.y};
  const users = interpolate(frame, [R.usersStart, R.usersEnd], [0, USERS_TOTAL], {...clampOpts, easing: Easing.in(Easing.cubic)});

  // 3. People monitor usage; feedback feeds the next model.
  const monitor = smooth(R.monitor, 15);
  const nextIn = smooth(R.nextModel, 15);

  // 4. Finale.
  const dim = interpolate(frame, [R.finale, R.finale + 15], [0, 0.78], clampOpts);
  const titleIn = spring({frame: frame - R.titleIn, fps, config: {damping: 14}});
  const titleScale = interpolate(titleIn, [0, 1], [0.7, 1]) * interpolate(frame, [R.titleIn, dur], [1, 1.06], clampOpts);
  const promptIn = smooth(R.promptIn, 20);
  const typed = PROMPT_TEXT.slice(0, Math.floor(interpolate(frame, [R.typeStart, R.typeEnd], [0, PROMPT_TEXT.length], clampOpts)));
  const caretOn = (frame >= R.typeStart && frame < R.typeEnd) || Math.floor(frame / 15) % 2 === 0;

  const sphereLine = (pts: Vec3[], key: string) => {
    const proj = pts.map((p) => project(p, cam));
    const segs: React.ReactNode[] = [];
    for (let i = 0; i < proj.length - 1; i++) {
      const front = proj[i].depth < 0 && proj[i + 1].depth < 0;
      segs.push(
        <line
          key={`${key}-${i}`}
          x1={proj[i].x}
          y1={proj[i].y}
          x2={proj[i + 1].x}
          y2={proj[i + 1].y}
          stroke={front ? rgba(COLORS.cyan, 0.45) : rgba(COLORS.cyan, 0.1)}
          strokeWidth={front ? 1.6 : 1}
        />,
      );
    }
    return segs;
  };

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <GlowFilter id="rl-led" blur={3} />
          <GlowFilter id="rl-dot" blur={4} />
        </defs>

        {/* Data centre racks. */}
        <g opacity={racksIn} transform={`translate(0 ${(1 - racksIn) * 40})`}>
          {Array.from({length: RACKS.count}, (_, k) => {
            const x = RACKS.x + (k - 1) * (RACKS.w + RACKS.gap) - RACKS.w / 2;
            return (
              <g key={k}>
                <rect x={x} y={RACKS.y - RACKS.h / 2} width={RACKS.w} height={RACKS.h} rx={10} fill={COLORS.charcoal} stroke={rgba(COLORS.white, 0.4)} strokeWidth={2} />
                {Array.from({length: 8}, (_, j) => {
                  const led = LEDS[k * 8 + j];
                  const on = powered && Math.floor((frame + led.phase) / led.period) % 3 !== 0;
                  const y = RACKS.y - RACKS.h / 2 + 24 + j * 34;
                  return (
                    <g key={j}>
                      <rect x={x + 14} y={y} width={RACKS.w - 28} height={20} rx={4} fill={rgba(COLORS.white, 0.06)} />
                      <circle cx={x + RACKS.w - 24} cy={y + 10} r={4} fill={on ? COLORS.cyan : rgba(COLORS.white, 0.15)} filter={on ? 'url(#rl-led)' : undefined} />
                    </g>
                  );
                })}
              </g>
            );
          })}
          <Caption x={RACKS.x} y={RACKS.y + RACKS.h / 2 + 36} text="DATA CENTRES" />
          {powered ? <circle cx={RACKS.x} cy={RACKS.y} r={40 + 200 * interpolate(frame, [R.powerOn, R.powerOn + 20], [0, 1], clampOpts)} fill="none" stroke={COLORS.cyan} strokeWidth={3} opacity={interpolate(frame, [R.powerOn, R.powerOn + 20], [0.8, 0], clampOpts)} /> : null}
        </g>
        {cubeVisible > 0 ? (
          <g opacity={cubeVisible}>
            <ModelCube id="rs-cube" absFrame={abs} {...cube} emblem={1} frost={1} lock={1} />
          </g>
        ) : null}

        {/* Distribution channels. */}
        {CHANNELS.map((c, i) => {
          const draw = interpolate(frame, [R.arcs + i * 6, R.arcs + i * 6 + 20], [0, 1], clampOpts);
          if (draw <= 0) {
            return null;
          }
          const mid = bez(ARC_FROM, c.ctrl, c.to, 0.5);
          const packetT = ((frame - R.arcs - i * 9) % 30) / 30;
          const packet = bez(ARC_FROM, c.ctrl, c.to, packetT);
          return (
            <g key={c.label}>
              <path
                d={`M${ARC_FROM.x} ${ARC_FROM.y}Q${c.ctrl.x} ${c.ctrl.y} ${c.to.x} ${c.to.y}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - draw}
                stroke={rgba(COLORS.cyan, 0.55)}
                strokeWidth={3}
                fill="none"
              />
              {draw >= 1 ? <circle cx={packet.x} cy={packet.y} r={6} fill={COLORS.cyan} filter="url(#rl-dot)" /> : null}
              <g transform={`translate(${mid.x} ${mid.y}) scale(${pop(R.channels[i])})`}>
                <rect x={-58} y={-24} width={116} height={48} rx={24} fill={COLORS.charcoal} stroke={COLORS.cyan} strokeWidth={2.5} />
                <text x={0} y={0} fill={COLORS.white} fontFamily={FONT} fontWeight={800} fontSize={20} letterSpacing="0.12em" textAnchor="middle" dominantBaseline="central">
                  {c.label}
                </text>
              </g>
            </g>
          );
        })}

        {/* Rotating globe with users lighting up. */}
        {globeIn > 0.01 ? (
          <g>
            <circle cx={GLOBE.x} cy={GLOBE.y} r={GLOBE.r * globeIn} fill={rgba(COLORS.cyan, 0.04)} stroke={rgba(COLORS.cyan, 0.6)} strokeWidth={2} />
            {LATS.map((lat, i) =>
              sphereLine(
                Array.from({length: 49}, (_, j) => {
                  const lon = (j / 48) * Math.PI * 2;
                  return {x: Math.cos(lat) * Math.cos(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.sin(lon)};
                }),
                `lat${i}`,
              ),
            )}
            {LONS.map((lon, i) =>
              sphereLine(
                Array.from({length: 49}, (_, j) => {
                  const lat = (j / 48) * Math.PI * 2;
                  return {x: Math.cos(lat) * Math.cos(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.sin(lon)};
                }),
                `lon${i}`,
              ),
            )}
            {USERS.map((u, i) => {
              if (frame < u.at) {
                return null;
              }
              const p = project(u.p, cam);
              if (p.depth >= 0) {
                return null;
              }
              const ping = interpolate(frame, [u.at, u.at + 20], [0, 1], clampOpts);
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={5} fill={COLORS.cyan} filter="url(#rl-dot)" />
                  {ping < 1 ? <circle cx={p.x} cy={p.y} r={5 + 22 * ping} fill="none" stroke={COLORS.cyan} strokeWidth={2} opacity={1 - ping} /> : null}
                </g>
              );
            })}
            <Caption x={GLOBE.x} y={GLOBE.y + GLOBE.r + 40} text="PEOPLE USING IT" opacity={smooth(R.usersStart)} />
            <text
              x={GLOBE.x}
              y={GLOBE.y + GLOBE.r + 90}
              fill={COLORS.cyan}
              opacity={smooth(R.usersStart)}
              fontFamily={FONT}
              fontWeight={800}
              fontSize={48}
              textAnchor="middle"
              dominantBaseline="central"
              style={{fontVariantNumeric: 'tabular-nums'}}
            >
              {`${Math.round(users).toLocaleString('en-US')}${frame >= R.usersEnd ? '+' : ''}`}
            </text>
          </g>
        ) : null}

        {/* Monitoring teams, feedback from users, and the next model. */}
        <g opacity={monitor}>
          {TEAM.x.map((x) => (
            <Person key={x} x={x} y={TEAM.y} size={64} />
          ))}
          <Caption x={TEAM.x[1]} y={TEAM.y + 62} text="SAFETY & MONITORING TEAMS" size={16} />
        </g>
        {Array.from({length: 10}, (_, i) => {
          const start = R.feedbackStart + i * 4;
          const t = (frame - start) / 26;
          if (t < 0 || t > 1) {
            return null;
          }
          const p = bez(FEEDBACK_ARC.from, FEEDBACK_ARC.ctrl, FEEDBACK_ARC.to, Easing.inOut(Easing.quad)(t));
          return <circle key={i} cx={p.x} cy={p.y} r={7} fill={COLORS.purple} filter="url(#rl-dot)" />;
        })}
        {frame >= R.feedbackStart ? <Caption x={930} y={735} text="FEEDBACK & REPORTS" color={COLORS.purple} size={16} opacity={monitor} /> : null}
        <g opacity={nextIn}>
          <line x1={TEAM.x[2] + 50} y1={TEAM.y} x2={NEXT.x - 60} y2={NEXT.y} stroke={COLORS.purple} strokeWidth={3} strokeDasharray="8 8" strokeDashoffset={-frame} />
          <g opacity={0.55}>
            <ModelCube id="rs-next" absFrame={abs} x={NEXT.x} y={NEXT.y - 6} size={22} appear={nextIn} />
          </g>
          <Caption x={NEXT.x} y={NEXT.y + 62} text="NEXT MODEL" color={COLORS.purple} size={16} />
        </g>
        {powered ? (
          <circle cx={RACKS.x} cy={RACKS.y} r={6} fill={COLORS.cyan} opacity={flashAt(frame, R.powerOn, 30)} />
        ) : null}
      </svg>

      {BUBBLES.map((b, i) => (
        <Bubble key={b.text} x={b.x} y={b.y} width={300} text={b.text} fontSize={22} opacity={pop(R.bubbles[i])} scale={0.6 + 0.4 * pop(R.bubbles[i])} />
      ))}
      <Pinned>
        <SceneTitle text="RELEASED TO THE WORLD" mode="corner" />
      </Pinned>
      <Pinned>
        <LoopBadge kind="human" opacity={monitor} />
      </Pinned>

      {/* Finale: full-frame dimmer, title and prompt bar stay at true screen centre. */}
      <Pinned>
        <AbsoluteFill style={{backgroundColor: COLORS.charcoal, opacity: dim}} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 450,
            transform: `translate(-50%, -50%) scale(${titleScale})`,
            opacity: Math.min(1, titleIn),
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 120,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: COLORS.white,
            whiteSpace: 'nowrap',
            textShadow: `0 0 36px ${rgba(COLORS.cyan, 0.45)}`,
          }}
        >
          MODEL RELEASED.
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 640,
            width: 980,
            height: 96,
            boxSizing: 'border-box',
            transform: `translate(-50%, -50%) translateY(${(1 - promptIn) * 40}px)`,
            opacity: promptIn,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '0 18px 0 30px',
            borderRadius: 48,
            background: rgba(COLORS.white, 0.04),
            border: `2px solid ${rgba(COLORS.cyan, 0.55)}`,
            boxShadow: `0 0 40px ${rgba(COLORS.cyan, 0.18)}`,
            fontFamily: FONT,
          }}
        >
          <svg width={40} height={40} viewBox="-20 -20 40 40" style={{flexShrink: 0}}>
            <path d="M0 -18C2 -6 6 -2 18 0C6 2 2 6 0 18C-2 6 -6 2 -18 0C-6 -2 -2 -6 0 -18Z" fill={COLORS.purple} />
          </svg>
          <div style={{flex: 1, fontSize: 38, fontWeight: 500, color: COLORS.white, whiteSpace: 'pre', display: 'flex', alignItems: 'center'}}>
            {typed}
            <span style={{display: 'inline-block', width: 3, height: 44, marginLeft: 4, background: COLORS.cyan, opacity: caretOn ? 1 : 0}} />
          </div>
          <svg width={60} height={60} viewBox="-30 -30 60 60" style={{flexShrink: 0}}>
            <circle r={30} fill={COLORS.cyan} />
            <path d="M0 12V-12M-10 -2L0 -12L10 -2" stroke={COLORS.charcoal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </Pinned>
    </AbsoluteFill>
  );
};
