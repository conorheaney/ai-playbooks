import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {GLYPHS} from '../components/Glyphs';
import {SceneTitle, heroToCorner} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {clamp, formatBytes, lerp, seeded} from '../../../shared/lib/math';
import {EDGES, NODES} from '../lib/network';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {RAW} from '../timing';

const ICON_COUNT = 72;
const SPAN = VIDEO.height + 240; // icons wrap through a band 120px beyond each edge
const TINTS = [COLORS.cyan, COLORS.purple, COLORS.white];
const BAR_W = 760;
const BAR_H = 14;
const PANEL = {x: VIDEO.width / 2, top: 840, bottom: 975, w: BAR_W + 64}; // counter panel footprint
const END_BYTES = 45e12; // 45 TB: the scale of a modern pre-training text corpus

// The blank model: Scene 3's network, ghosted and shrunk to sit at centre stage above the counter.
const NET = {cx: VIDEO.width / 2, cy: 470, scale: 0.72, srcCy: 570};
const netPos = (p: {x: number; y: number}) => ({x: NET.cx + (p.x - NET.cx) * NET.scale, y: NET.cy + (p.y - NET.srcCy) * NET.scale});
const NET_NODES = NODES.map(netPos);
const NET_EDGES = EDGES.map((e) => ({a: netPos(e.from), b: netPos(e.to)}));
const NET_BOTTOM = Math.max(...NET_NODES.map((n) => n.y));
const LABEL_Y = NET_BOTTOM + 62;
const ABSORB_FROM = 90; // icons start bending into the model
const ABSORB_SPREAD = 100;
const ABSORB_TRAVEL = 26;

// Text the falling icons must never pass behind: corner title, model label, counter panel.
const KEEP_CLEAR = [
  {x0: 60, x1: 560, y0: 30, y1: 130},
  {x0: VIDEO.width / 2 - 200, x1: VIDEO.width / 2 + 200, y0: LABEL_Y - 34, y1: LABEL_Y + 34},
  {x0: PANEL.x - PANEL.w / 2, x1: PANEL.x + PANEL.w / 2, y0: PANEL.top, y1: PANEL.bottom},
];
const FEATHER = 60;
const clearance = (x: number, y: number) =>
  Math.min(
    1,
    ...KEEP_CLEAR.map((b) => {
      const dx = Math.max(b.x0 - x, 0, x - b.x1);
      const dy = Math.max(b.y0 - y, 0, y - b.y1);
      return clamp(Math.hypot(dx, dy) / FEATHER, 0, 1);
    }),
  );

const r = seeded('raw');
const ICONS = Array.from({length: ICON_COUNT}, (_, i) => ({
  Glyph: GLYPHS[Math.floor(r('kind', i) * GLYPHS.length)],
  x: r('x', i) * VIDEO.width,
  y0: r('y', i) * SPAN,
  speed: 3 + r('speed', i) * 9,
  size: 36 + r('size', i) * 64,
  rot0: r('rot', i) * 360,
  spin: (r('spin', i) - 0.5) * 4,
  sway: 8 + r('sway', i) * 24,
  tint: TINTS[Math.floor(r('tint', i) * TINTS.length)],
  opacity: 0.25 + r('opacity', i) * 0.6,
  // Each icon is pulled into one of the model's nodes at its own moment between frames 90 and 190.
  absorbAt: ABSORB_FROM + r('absorb', i) * ABSORB_SPREAD,
  node: Math.floor(r('node', i) * NODES.length),
}));

export const RawDataScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

  const iconsIn = interpolate(frame, [0, 12], [0, 1], clampOpts);
  const titleP = heroToCorner(frame, fps, RAW.titleToCorner);

  const counterIn = spring({frame: frame - RAW.counterIn, fps, config: {damping: 200}, durationInFrames: 20});
  const progress = interpolate(frame, [RAW.counterStart, RAW.counterEnd], [0, 1], {
    ...clampOpts,
    easing: Easing.inOut(Easing.quad),
  });
  // Log-scale tick-up so the readout races through KB -> MB -> GB -> TB and lands exactly on 45 TB.
  const bytes = Math.pow(10, interpolate(progress, [0, 1], [3, Math.log10(END_BYTES)]));

  // "Start completely blank": a hollow model fades in as the title leaves; its label lands on the words.
  const netIn = spring({frame: frame - RAW.blankModel, fps, config: {damping: 200}, durationInFrames: 24});
  const labelIn = spring({frame: frame - RAW.blankLabel, fps, config: {damping: 200}, durationInFrames: 14});
  // A faint pulse on a node each time an icon lands in it.
  const nodePulse = NET_NODES.map((_, k) =>
    Math.max(0, ...ICONS.filter((icon) => icon.node === k).map((icon) => interpolate(frame, [icon.absorbAt + ABSORB_TRAVEL, icon.absorbAt + ABSORB_TRAVEL + 3, icon.absorbAt + ABSORB_TRAVEL + 16], [0, 1, 0], clampOpts))),
  );

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <radialGradient id="raw-scrim" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.charcoal} stopOpacity={0.92} />
            <stop offset="100%" stopColor={COLORS.charcoal} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="raw-bar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.cyan} />
            <stop offset="100%" stopColor={COLORS.purple} />
          </linearGradient>
        </defs>

        {/* The blank model: uniform, unlearned connections and hollow nodes. */}
        <g opacity={netIn}>
          <g stroke={rgba(COLORS.white, 0.13)} strokeWidth={1.5}>
            {NET_EDGES.map((e, i) => (
              <line key={i} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} />
            ))}
          </g>
          {NET_NODES.map((n, k) => (
            <circle
              key={k}
              cx={n.x}
              cy={n.y}
              r={13 + 4 * nodePulse[k]}
              fill={COLORS.charcoal}
              stroke={nodePulse[k] > 0.02 ? rgba(COLORS.cyan, 0.4 + 0.6 * nodePulse[k]) : rgba(COLORS.white, 0.4)}
              strokeWidth={2.5}
            />
          ))}
        </g>
        <text
          x={NET.cx}
          y={LABEL_Y}
          fill={COLORS.white}
          opacity={labelIn * 0.9}
          fontFamily={FONT}
          fontWeight={700}
          fontSize={28}
          letterSpacing="0.16em"
          textAnchor="middle"
          dominantBaseline="central"
        >
          BLANK MODEL
        </text>

        <g opacity={iconsIn} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          {ICONS.map((icon, i) => {
            const rainY = ((icon.y0 + frame * icon.speed) % SPAN) - 120;
            const rainX = icon.x + Math.sin(frame / 18 + i) * icon.sway;
            // After its moment, the icon bends into its node, shrinking and fading as it is absorbed.
            const u = interpolate(frame, [icon.absorbAt, icon.absorbAt + ABSORB_TRAVEL], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
            if (u >= 1) {
              return null;
            }
            const target = NET_NODES[icon.node];
            const x = lerp(rainX, target.x, u);
            const y = lerp(rainY, target.y, u);
            const rot = icon.rot0 + frame * icon.spin;
            const scale = (icon.size / 64) * (1 - 0.7 * u);
            // Falling icons stay clear of text; absorbed icons fade into the node.
            const opacity = icon.opacity * (u > 0 ? 1 - u * u : clearance(x, y));
            if (opacity <= 0.01) {
              return null;
            }
            return (
              <g
                key={i}
                stroke={icon.tint}
                opacity={opacity}
                transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${scale.toFixed(4)}) translate(-32 -32)`}
              >
                <icon.Glyph />
              </g>
            );
          })}
        </g>

        {/* Legibility scrim behind the hero title; dissolves as the title moves to the corner. */}
        <ellipse cx={VIDEO.width / 2} cy={VIDEO.height / 2} rx={1000} ry={300} fill="url(#raw-scrim)" opacity={1 - titleP} />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 110,
          width: BAR_W + 64,
          padding: '24px 32px',
          boxSizing: 'border-box',
          transform: `translateX(-50%) translateY(${(1 - counterIn) * 40}px)`,
          opacity: counterIn,
          borderRadius: 20,
          background: rgba(COLORS.charcoal, 0.88),
          border: `2px solid ${rgba(COLORS.cyan, 0.35)}`,
          fontFamily: FONT,
          color: COLORS.white,
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16}}>
          <span style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.18em', opacity: 0.75}}>DATA INGESTED</span>
          <span style={{fontSize: 44, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: COLORS.cyan}}>
            {formatBytes(bytes)}
          </span>
        </div>
        <svg width={BAR_W} height={BAR_H} viewBox={`0 0 ${BAR_W} ${BAR_H}`} style={{display: 'block'}}>
          <rect width={BAR_W} height={BAR_H} rx={BAR_H / 2} fill={rgba(COLORS.white, 0.1)} />
          <rect width={Math.max(BAR_H, BAR_W * progress)} height={BAR_H} rx={BAR_H / 2} fill="url(#raw-bar)" opacity={progress > 0 ? 1 : 0} />
          {Array.from({length: 11}, (_, i) => (
            <rect key={i} x={(BAR_W / 10) * i - (i === 10 ? 2 : i === 0 ? 0 : 1)} y={0} width={2} height={BAR_H} fill={COLORS.charcoal} opacity={0.6} />
          ))}
        </svg>
      </div>

      <Pinned>

        <SceneTitle text="RAW DATA" mode="hero" holdFrames={RAW.titleToCorner} />

      </Pinned>
    </AbsoluteFill>
  );
};
