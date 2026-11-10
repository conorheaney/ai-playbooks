import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube, PromptBar} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {centredRow} from '../../../shared/lib/row';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {FlowLine} from '../components/Parts';
import {CUBE_HOME, CUBE_W, PROMPT_CARD_W, ROW_GAP} from '../layout';
import {PROMPT_BEATS as P, SCENES} from '../timing';

const REQUEST = 'Recommend a hotel.';
// The bar starts at vertical centre and becomes the card in place; the card then grows one row per
// section, equally up and down, so it stays centred on y = 540.
// The row: the cube, then the prompt. The cube starts centred (where Scene 1 leaves it) and makes room as
// the bar rises; the prompt stays in the row through the fade, so the cube is still beside it when Scene 3 begins.
const BAR = {y: 540, w: PROMPT_CARD_W, h: 96};
const CARD = {y: 540, w: PROMPT_CARD_W};
const HEADER_H = 84; // the card with only its YOUR PROMPT label
const ROW_TOP = 64; // first section's top, from the card's top
const ROW = 104; // each section's height plus the gap below it
// The bare request is kept above the card as a dim, struck-through BEFORE chip, so the vague and full versions
// stay side by side; it rides just above the card's top edge as the card grows.
const GHOST = {w: 360, h: 48, above: 42};

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
  const [cubeX, promptX] = centredRow([{w: CUBE_W, p: 1}, {w: PROMPT_CARD_W, p: rise}], ROW_GAP);
  const typed = interpolate(frame, [P.bar[0] + 6, P.bar[1]], [0, REQUEST.length], clampOpts);
  const grow = interpolate(frame, [P.grow[0], P.grow[1]], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const added = MODULES.reduce((sum, _, i) => sum + smooth(P.modules[i], 14), 0);
  const h = lerp(BAR.h, HEADER_H, grow) + ROW * added;
  const box = {x: promptX - CARD.w / 2, y: CARD.y - h / 2, w: CARD.w, h};
  // The request lifts out of the bar into the BEFORE chip as the bar becomes the brief.
  const ghost = interpolate(grow, [0.15, 1], [0, 1], clampOpts);
  const ghostY = lerp(CARD.y, box.y - GHOST.above, ghost);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <LockedCube id="gc-p-cube" absFrame={abs} {...CUBE_HOME} x={cubeX} />
        <FlowLine from={{x: box.x - 12, y: CARD.y}} to={{x: cubeX + 130, y: CUBE_HOME.y}} frame={frame} opacity={smooth(P.grow[1] - 10, 14) * out} />
        <Caption x={promptX} y={CARD.y + h / 2 + 50} text="NOT EVERY TASK NEEDS EVERY PIECE" color={COLORS.white} size={24} opacity={smooth(P.caption, 14) * out} />
      </svg>

      <AbsoluteFill style={{opacity: out}}>
        {grow <= 0 ? (
          <PromptBar x={promptX} y={BAR.y + 40 * (1 - rise)} width={BAR.w} text={REQUEST} chars={typed} opacity={rise} frame={frame} cursor={frame < P.grow[0]} />
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
            {/* The bare request leaves the card as it grows into a brief (it reappears above as BEFORE). */}
            <div style={{position: 'absolute', left: 44, top: 0, height: 96, display: 'flex', alignItems: 'center', fontSize: 38, fontWeight: 500, opacity: interpolate(grow, [0, 0.3], [1, 0], clampOpts), whiteSpace: 'nowrap'}}>
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
                    top: ROW_TOP + i * ROW,
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
                  <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: m.color === COLORS.white ? rgba(COLORS.white, 0.8) : m.color, marginBottom: 8}}>{m.label}</div>
                  <div style={{fontSize: 23, fontWeight: 500, whiteSpace: 'nowrap'}}>{m.text}</div>
                </div>
              );
            })}
          </div>
        )}
        {ghost > 0.001 ? (
          <div
            style={{
              position: 'absolute',
              left: promptX - GHOST.w / 2,
              top: ghostY - GHOST.h / 2,
              width: GHOST.w,
              height: GHOST.h,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 20px',
              borderRadius: GHOST.h / 2,
              border: `2px dashed ${rgba(COLORS.white, 0.4)}`,
              background: rgba(COLORS.charcoal, 0.92),
              fontFamily: FONT,
              opacity: ghost,
              transform: `scale(${lerp(1.25, 1, ghost)})`,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: rgba(COLORS.white, 0.6)}}>BEFORE</span>
            <span style={{fontSize: 22, fontWeight: 500, color: rgba(COLORS.white, 0.6), textDecorationLine: 'line-through', textDecorationColor: rgba(COLORS.white, 0.6), textDecorationThickness: 2}}>{REQUEST}</span>
          </div>
        ) : null}
      </AbsoluteFill>

      <Pinned>
        <SceneTitle text="THE PROMPT" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
