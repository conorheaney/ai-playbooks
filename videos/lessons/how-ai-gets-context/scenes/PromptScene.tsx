import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube, PromptBar} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {FlowLine, Note} from '../components/Parts';
import {CUBE_HOME} from '../layout';
import {PROMPT_BEATS as P, SCENES} from '../timing';

const REQUEST = 'Recommend a hotel.';
const BAR = {x: 1240, y: 812, w: 760, h: 96};
const CARD = {x: 1240, y: 560, w: 760, h: 600};

// The pieces of a useful prompt, in VO order.
const MODULES = [
  {label: 'OBJECTIVE', text: 'Recommend a hotel for the Canberra trip.', color: COLORS.cyan},
  {label: 'BACKGROUND & SOURCES', text: 'Canberra, 5 days in March. Source: travel-policy-2025.pdf', color: COLORS.white},
  {label: 'CONSTRAINTS', text: "Within the policy's nightly limit.", color: COLORS.purple},
  {label: 'OUTPUT', text: 'Top 3, as a table.', color: COLORS.cyan},
  {label: 'CHECKS', text: 'Cite the policy section for each.', color: COLORS.purple},
];

export const PromptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.prompt.from + frame;
  const dur = SCENES.prompt.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});

  const out = interpolate(frame, [P.out, dur], [1, 0], clampOpts);
  const rise = smooth(P.bar[0], 15);
  const typed = interpolate(frame, [P.bar[0] + 6, P.bar[1]], [0, REQUEST.length], clampOpts);
  const grow = interpolate(frame, [P.grow[0], P.grow[1]], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const box = {
    x: lerp(BAR.x - BAR.w / 2, CARD.x - CARD.w / 2, grow),
    y: lerp(BAR.y - BAR.h / 2, CARD.y - CARD.h / 2, grow),
    w: lerp(BAR.w, CARD.w, grow),
    h: lerp(BAR.h, CARD.h, grow),
  };

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <LockedCube id="gc-p-cube" absFrame={abs} {...CUBE_HOME} />
        <FlowLine from={{x: CARD.x - CARD.w / 2 - 12, y: CARD.y}} to={{x: CUBE_HOME.x + 150, y: CUBE_HOME.y}} frame={frame} opacity={smooth(P.grow[1] - 10, 14) * out} />
      </svg>

      <AbsoluteFill style={{opacity: out}}>
        {grow <= 0 ? (
          <PromptBar x={BAR.x} y={BAR.y + 40 * (1 - rise)} width={BAR.w} text={REQUEST} chars={typed} opacity={rise} frame={frame} cursor={frame < P.grow[0]} />
        ) : (
          <div
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              boxSizing: 'border-box',
              borderRadius: lerp(48, 24, grow),
              border: `2px solid ${COLORS.cyan}`,
              background: rgba(COLORS.charcoal, 0.92),
              boxShadow: `0 0 32px ${rgba(COLORS.cyan, 0.25)}`,
              fontFamily: FONT,
              color: COLORS.white,
              overflow: 'hidden',
            }}
          >
            {/* The bare request fades as the card grows into a brief. */}
            <div style={{position: 'absolute', left: 44, top: 0, height: 96, display: 'flex', alignItems: 'center', fontSize: 38, fontWeight: 500, opacity: interpolate(grow, [0, 0.4], [1, 0], clampOpts), whiteSpace: 'nowrap'}}>
              {REQUEST}
            </div>
            <div style={{position: 'absolute', left: 32, top: 22, fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: COLORS.cyan, opacity: interpolate(grow, [0.6, 1], [0, 1], clampOpts)}}>
              YOUR PROMPT
            </div>
            {MODULES.map((m, i) => {
              const s = smooth(P.modules[i], 14);
              if (s <= 0.001) {
                return null;
              }
              return (
                <div
                  key={m.label}
                  style={{
                    position: 'absolute',
                    left: 32,
                    right: 32,
                    top: 64 + i * 104,
                    height: 92,
                    boxSizing: 'border-box',
                    padding: '14px 20px 0 24px',
                    borderRadius: 14,
                    background: rgba(m.color, 0.07),
                    borderLeft: `6px solid ${m.color}`,
                    opacity: s,
                    transform: `translateX(${(1 - s) * 40}px)`,
                  }}
                >
                  <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.18em', color: m.color === COLORS.white ? rgba(COLORS.white, 0.8) : m.color, marginBottom: 8}}>{m.label}</div>
                  <div style={{fontSize: 23, fontWeight: 500, whiteSpace: 'nowrap'}}>{m.text}</div>
                </div>
              );
            })}
          </div>
        )}
        <Note x={CARD.x} y={CARD.y + CARD.h / 2 + 50} text="Not every task needs every piece." opacity={smooth(P.caption, 14)} />
      </AbsoluteFill>

      <Pinned>
        <SceneTitle text="THE PROMPT" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
