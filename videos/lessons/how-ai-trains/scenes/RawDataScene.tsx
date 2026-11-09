import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {GLYPHS} from '../components/Glyphs';
import {SceneTitle, heroToCorner} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {formatBytes, seeded} from '../../../shared/lib/math';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {RAW} from '../timing';

const ICON_COUNT = 72;
const SPAN = VIDEO.height + 240; // icons wrap through a band 120px beyond each edge
const TINTS = [COLORS.cyan, COLORS.purple, COLORS.white];
const BAR_W = 760;
const BAR_H = 14;

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
  // Log-scale tick-up so the readout races through KB -> MB -> GB -> TB and lands exactly on 1.00 TB.
  const bytes = Math.pow(10, interpolate(progress, [0, 1], [3, 12]));

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

        <g opacity={iconsIn} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          {ICONS.map((icon, i) => {
            const y = ((icon.y0 + frame * icon.speed) % SPAN) - 120;
            const x = icon.x + Math.sin(frame / 18 + i) * icon.sway;
            const rot = icon.rot0 + frame * icon.spin;
            return (
              <g
                key={i}
                stroke={icon.tint}
                opacity={icon.opacity}
                transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${(icon.size / 64).toFixed(4)}) translate(-32 -32)`}
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
          <span style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.18em', opacity: 0.7}}>DATA INGESTED</span>
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

        <SceneTitle text="STEP 1: RAW DATA" mode="hero" holdFrames={RAW.titleToCorner} />

      </Pinned>
    </AbsoluteFill>
  );
};
