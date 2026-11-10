import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble} from '../../../shared/components/Bubble';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, Segment, SEGMENT_STYLE, segmentRect} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {AppMarker, LockedCube, StatusBadge, textWidth} from '../../../shared/components/context/Pieces';
import {CAPACITY, COMPACTED, COMPACTED_TOP, CUBE_HOME, TANK_HOME, TANK_TEXT} from '../layout';
import {COMPACT as C, SCENES} from '../timing';

const A_LEFT = 780;
const B_X = 1640;
const CUBE_SIDE = {x: 300, y: 540, size: 60};
// Side by side, both tanks sit a little lower and shorter so their readouts clear the status badge.
const SIDE = {y: 600, h: 700};
const FUNNEL = {mouthX: 980, mouthTop: 250, mouthBottom: 570, neckX: 1420, neckTop: 375, neckBottom: 445};
const FUNNEL_Y = (FUNNEL.neckTop + FUNNEL.neckBottom) / 2;

const START_LEVEL = 0.25;
const OLD_TOP = 0.82; // history below this is compacted; above it is the most recent, kept as is
const STEP = 0.069; // each turn's share of the window
// A few words each: they stream past quickly, so they read as a conversation rather than as text to read.
const TURNS = [
  'Best city for museums?',
  'Canberra.',
  'What about Melbourne?',
  'Long drive away.',
  'Skip Melbourne.',
  'Hotels near Parliament?',
  'Three options…',
  'Dates may change.',
  'Need a visa?',
  'Here’s the visa site.',
];
// Turns appear as a left-aligned transcript in evenly spaced rows between the cube and the window, then
// each slides straight right along its own row and shrinks, so no two turns ever cross or overlap. Each
// turn is fully faded by the time its right edge reaches the window's edge, so none is clipped.
const TURN_ROWS = {left: 640, top: 250, gap: 60, font: 20, endScale: 0.6};
const TURN_HALF = TURNS.map((t) => (textWidth(t, TURN_ROWS.font) + 44) / 2);
// The summary card: popped out of the funnel, centred between the two tanks, readable on its own.
const CARD = {x: 1210, y: 410, w: 440, font: 22};
const SUMMARY = 'Canberra, 5 days in March. Hotel near Parliament.';
const LOST = ['Why not Melbourne', 'Dates may change', 'Visa site link'];
// The lost details pile up centred under the funnel's opening, the first at the bottom.
const PILE = {x: 1200, bottom: 760, step: 56, font: 24};

const funnelLowerY = (x: number) =>
  FUNNEL.mouthBottom + ((x - FUNNEL.mouthX) / (FUNNEL.neckX - FUNNEL.mouthX)) * (FUNNEL.neckBottom - FUNNEL.mouthBottom);

export const CompactionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.compaction.from + frame;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  // Turns stream in and fill the window.
  const lands = TURNS.map((_, i) => C.bubblesStart + i * C.bubbleGap + C.bubbleTravel);
  const level = START_LEVEL + lands.reduce((sum, l) => sum + STEP * interpolate(frame, [l - 2, l + 6], [0, 1], clampOpts), 0);
  const warn = level >= 0.9;

  const slide = smooth(C.slide, 26);
  const home = smooth(C.home, 30);
  const tankA = {...TANK_HOME, x: lerp(TANK_HOME.x, A_LEFT, slide), y: lerp(TANK_HOME.y, SIDE.y, slide), h: lerp(TANK_HOME.h, SIDE.h, slide)};
  const tankB = {...TANK_HOME, x: lerp(B_X, TANK_HOME.x, home), y: lerp(SIDE.y, TANK_HOME.y, home), h: lerp(SIDE.h, TANK_HOME.h, home)};
  const oldGone = frame >= C.squeeze[0];
  const aDim = interpolate(frame, [C.aDim[0], C.aDim[1]], [1, 0.3], clampOpts);
  const aOut = interpolate(frame, [C.home, C.home + 15], [1, 0], clampOpts);
  const segIn = interpolate(frame, [0, 18], [0, 1], clampOpts);

  const aSegments: Segment[] = [
    {kind: 'instructions', from: 0, to: 0.06, opacity: segIn},
    {kind: 'tools', from: 0.06, to: 0.14, opacity: segIn},
    ...(oldGone ? [] : [{kind: 'history' as const, from: 0.14, to: Math.min(level, OLD_TOP), opacity: segIn}]),
    ...(level > OLD_TOP ? [{kind: 'history' as const, from: OLD_TOP, to: level}] : []),
  ];

  // What lands in the new context, and when.
  const keepT = interpolate(frame, [C.keepCopy[0], C.keepCopy[1]], [0, 1], ease);
  const recentT = interpolate(frame, [C.recentCopy[0], C.recentCopy[1]], [0, 1], ease);
  const summaryIn = interpolate(frame, [C.cardLand[0] + 4, C.cardLand[1] - 4], [0, 1], clampOpts);
  // The recent turns fade straight into place rather than crossing the frame, so nothing travels
  // across the summary card's path.
  const bSegments: Segment[] = [
    {...COMPACTED[0], opacity: keepT >= 1 ? 1 : 0},
    {...COMPACTED[1], opacity: keepT >= 1 ? 1 : 0},
    {...COMPACTED[2], opacity: summaryIn, text: 'SUMMARY', textOpacity: summaryIn},
    {...COMPACTED[3], opacity: recentT},
  ];
  const bTokens = (0.14 * (keepT >= 1 ? 1 : 0) + 0.08 * summaryIn + 0.12 * recentT) * CAPACITY;

  // Old history squeezed through the funnel.
  const sq = interpolate(frame, [C.squeeze[0], C.squeeze[1]], [0, 1], ease);
  const oldRect = segmentRect(tankA, 0.14, OLD_TOP);
  const block = {
    x: interpolate(sq, [0, 0.35, 1], [oldRect.x + oldRect.w / 2, FUNNEL.mouthX + 30, FUNNEL.neckX]),
    y: interpolate(sq, [0, 0.35, 1], [oldRect.y + oldRect.h / 2, FUNNEL_Y, FUNNEL_Y]),
    w: interpolate(sq, [0, 0.35, 1], [oldRect.w, 200, 90]),
    h: interpolate(sq, [0, 0.35, 1], [oldRect.h, 300, 56]),
  };

  // The summary card pops out of the funnel to centre stage, holds, then settles into its slice.
  const cardPop = smooth(C.card, 10);
  const cardLand = interpolate(frame, [C.cardLand[0], C.cardLand[1]], [0, 1], ease);
  const sumRect = segmentRect(tankB, COMPACTED[2].from, COMPACTED[2].to);

  const moving = (from: {x: number; y: number; w: number; h: number}, to: typeof from, t: number) => ({
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    w: to.w,
    h: lerp(from.h, to.h, t),
  });

  const app = presence(frame, C.appIn, C.home + 15, 12, 15);
  const gear = presence(frame, C.appIn, C.appOut, 12, 14);
  const funnelOut = interpolate(frame, [C.funnelOut[0], C.funnelOut[1]], [1, 0], clampOpts);
  const funnelDraw = interpolate(frame, [C.funnel[0], C.funnel[1]], [0, 1], ease);
  const bDraw = interpolate(frame, [C.tankB[0], C.tankB[1]], [0, 1], ease);
  const cube = {
    x: lerp(lerp(CUBE_HOME.x, CUBE_SIDE.x, slide), CUBE_HOME.x, smooth(C.home + 5, 30)),
    y: CUBE_HOME.y,
    size: lerp(lerp(CUBE_HOME.size, CUBE_SIDE.size, slide), CUBE_HOME.size, smooth(C.home + 5, 30)),
  };
  const funnelPath = `M${FUNNEL.mouthX} ${FUNNEL.mouthTop} L${FUNNEL.neckX} ${FUNNEL.neckTop} M${FUNNEL.mouthX} ${FUNNEL.mouthBottom} L${FUNNEL.neckX} ${FUNNEL.neckBottom}`;

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <LockedCube id="cp-cube" absFrame={abs} {...cube} />

        <g opacity={aOut}>
          <ContextTank
            id="cp-a" textSizes={TANK_TEXT}
            {...tankA}
            opacity={aDim}
            segments={aSegments}
            outlineColor={warn && !oldGone ? COLORS.error : COLORS.cyan}
            readout={{tokens: level * CAPACITY, capacity: CAPACITY, opacity: interpolate(frame, [C.aDim[0], C.aDim[1]], [1, 0], clampOpts), warn}}
          />
        </g>

        <ContextTank
          id="cp-b" textSizes={TANK_TEXT}
          {...tankB}
          draw={bDraw}
          segments={bSegments}
          readout={{tokens: bTokens, capacity: CAPACITY, opacity: bDraw}}
          remaining={{from: COMPACTED_TOP, opacity: presence(frame, C.freed, C.home + 25, 14, 14), label: 'SPACE FREED'}}
        />

        {/* Funnel, drawn on by the app; gone before tank B glides home. */}
        <g opacity={funnelOut}>
          <path
            d={`M${FUNNEL.mouthX} ${FUNNEL.mouthTop} L${FUNNEL.neckX} ${FUNNEL.neckTop} L${FUNNEL.neckX} ${FUNNEL.neckBottom} L${FUNNEL.mouthX} ${FUNNEL.mouthBottom} Z`}
            fill={rgba(COLORS.purple, 0.08 * funnelDraw)}
          />
          {sq > 0 && sq < 1 ? (
            <rect x={block.x - block.w / 2} y={block.y - block.h / 2} width={block.w} height={block.h} rx={6} fill={SEGMENT_STYLE.history.fill} stroke={rgba(COLORS.white, 0.6)} strokeWidth={2} />
          ) : null}
          <path d={funnelPath} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - funnelDraw} fill="none" stroke={COLORS.purple} strokeWidth={4} strokeLinecap="round" />
          <AppMarker x={1140} y={196} opacity={gear} frame={frame} />
        </g>

        {/* Instructions and tool definitions are kept as they are. */}
        {keepT > 0 && keepT < 1
          ? [COMPACTED[0], COMPACTED[1]].map((s) => {
              const r = moving(segmentRect(tankA, s.from, s.to), segmentRect(tankB, s.from, s.to), keepT);
              return <rect key={s.kind} x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill={SEGMENT_STYLE[s.kind].fill} stroke={rgba(COLORS.purple, 0.7)} strokeWidth={2} />;
            })
          : null}

        {/* Detail that didn't survive the summary drops out of the funnel's lower edge and piles up, centred under
            the funnel: each settles just above the one before, so none falls through another. Struck through and
            dimmed, the pile stays until the funnel fades. */}
        {LOST.map((text, i) => {
          const start = C.leaks[i];
          if (frame < start) {
            return null;
          }
          const t = interpolate(frame, [start, start + 22], [0, 1], {...clampOpts, easing: Easing.out(Easing.quad)});
          const sx = PILE.x - 90 + 90 * i; // where it slips out along the funnel's edge
          const px = lerp(sx, PILE.x, t);
          const py = lerp(funnelLowerY(sx) + 24, PILE.bottom - PILE.step * i, t);
          const strike = interpolate(frame, [start + 24, start + 34], [0, 1], clampOpts); // readable for ~0.6 s first
          const settled = interpolate(frame, [start + 34, start + 44], [1, 0.55], clampOpts);
          const w = textWidth(text, PILE.font);
          return (
            <g key={i} opacity={interpolate(frame, [start, start + 6], [0, 1], clampOpts) * settled * funnelOut}>
              <text x={px} y={py} fill={COLORS.white} fontFamily={FONT} fontWeight={500} fontSize={PILE.font} textAnchor="middle" dominantBaseline="central">
                {text}
              </text>
              {strike > 0 ? <line x1={px - w / 2 - 4} x2={px - w / 2 - 4 + (w + 8) * strike} y1={py + 1} y2={py + 1} stroke={COLORS.error} strokeWidth={3} strokeLinecap="round" /> : null}
            </g>
          );
        })}
      </svg>

      {/* Conversation turns stream in. */}
      {TURNS.map((text, i) => {
        const start = C.bubblesStart + i * C.bubbleGap;
        const t = interpolate(frame, [start, lands[i]], [0, 1], {...clampOpts, easing: Easing.in(Easing.quad)});
        if (frame < start || t >= 1) {
          return null;
        }
        // Linear in t, the right edge moves monotonically and ends exactly at the window's edge.
        const half = TURN_HALF[i];
        const tankLeft = tankA.x - tankA.w / 2;
        const row = {x: TURN_ROWS.left + half, y: TURN_ROWS.top + i * TURN_ROWS.gap};
        const target = {x: tankLeft - half * TURN_ROWS.endScale, y: row.y};
        const user = i % 2 === 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: lerp(row.x, target.x, t),
              top: lerp(row.y, target.y, t),
              transform: `translate(-50%, -50%) scale(${lerp(1, TURN_ROWS.endScale, t)})`,
              opacity: interpolate(frame, [start, start + 4], [0, 1], clampOpts) * interpolate(t, [0.5, 1], [1, 0], clampOpts),
              padding: '10px 20px',
              borderRadius: 22,
              border: `2px solid ${user ? COLORS.cyan : rgba(COLORS.white, 0.7)}`,
              background: rgba(COLORS.charcoal, 0.92),
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: TURN_ROWS.font,
              color: COLORS.white,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        );
      })}

      {frame >= C.card ? (
        <Bubble
          x={lerp(lerp(FUNNEL.neckX, CARD.x, cardPop), sumRect.x + sumRect.w / 2, cardLand)}
          y={lerp(lerp(FUNNEL_Y, CARD.y, cardPop), sumRect.y + sumRect.h / 2, cardLand)}
          width={CARD.w}
          text={SUMMARY}
          fontSize={CARD.font}
          label="SUMMARY"
          labelSize={18}
          color={COLORS.white}
          scale={lerp(0.4, 1, cardPop) * lerp(1, sumRect.w / CARD.w, cardLand)}
          opacity={interpolate(cardLand, [0.3, 0.65], [1, 0], clampOpts)} // gone before it crosses tank B's outline; the slice fades in under it
        />
      ) : null}

      <Pinned>

        <StatusBadge kind="app" opacity={app} frame={frame} />

      </Pinned>
      <div style={{opacity: interpolate(frame, [SCENES.compaction.durationInFrames - 15, SCENES.compaction.durationInFrames], [1, 0], clampOpts)}}>
        <Pinned>
          <SceneTitle text="COMPACTION" mode="corner" />
        </Pinned>
      </div>
    </AbsoluteFill>
  );
};
