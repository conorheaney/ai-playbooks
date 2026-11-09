import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble} from '../../../shared/components/Bubble';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, fillTopY, Segment, SEGMENT_STYLE, segmentRect} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {AppMarker, LockedCube, StatusBadge, textWidth} from '../../../shared/components/context/Pieces';
import {CAPACITY, COMPACTED, COMPACTED_TOP, CUBE_HOME, TANK_HOME} from '../layout';
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
const TURNS = [
  'Which city has the best museums?',
  'Canberra: National Gallery, War Memorial…',
  'What about Melbourne?',
  'Melbourne is a long drive from Canberra…',
  "Let's skip Melbourne then.",
  'Any hotels near Parliament?',
  'Three options near Parliament House…',
  'Our dates might still change.',
  'Do I need a visa? (visa site link)',
  'Noted: check the visa rules.',
];
const SUMMARY = 'Trip: Canberra, 5 days, March. Chose a hotel near Parliament.';
const LOST = ['Why we ruled out Melbourne', 'Dates still tentative', 'Link to visa rules'];

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
  const aDim = interpolate(frame, [C.card, C.card + 20], [1, 0.3], clampOpts);
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
  const summaryIn = interpolate(frame, [C.cardLand[1] - 10, C.cardLand[1]], [0, 1], clampOpts);
  const bSegments: Segment[] = [
    {...COMPACTED[0], opacity: keepT >= 1 ? 1 : 0},
    {...COMPACTED[1], opacity: keepT >= 1 ? 1 : 0},
    {...COMPACTED[2], opacity: summaryIn, text: 'SUMMARY', textOpacity: summaryIn},
    {...COMPACTED[3], opacity: recentT >= 1 ? 1 : 0},
  ];
  const bTokens = (0.14 * (keepT >= 1 ? 1 : 0) + 0.08 * summaryIn + 0.12 * (recentT >= 1 ? 1 : 0)) * CAPACITY;

  // Old history squeezed through the funnel.
  const sq = interpolate(frame, [C.squeeze[0], C.squeeze[1]], [0, 1], ease);
  const oldRect = segmentRect(tankA, 0.14, OLD_TOP);
  const block = {
    x: interpolate(sq, [0, 0.35, 1], [oldRect.x + oldRect.w / 2, FUNNEL.mouthX + 30, FUNNEL.neckX]),
    y: interpolate(sq, [0, 0.35, 1], [oldRect.y + oldRect.h / 2, FUNNEL_Y, FUNNEL_Y]),
    w: interpolate(sq, [0, 0.35, 1], [oldRect.w, 200, 90]),
    h: interpolate(sq, [0, 0.35, 1], [oldRect.h, 300, 56]),
  };

  // The summary card pops out of the funnel, then settles into its slice.
  const cardPop = smooth(C.card, 16);
  const cardLand = interpolate(frame, [C.cardLand[0], C.cardLand[1]], [0, 1], ease);
  const sumRect = segmentRect(tankB, COMPACTED[2].from, COMPACTED[2].to);

  const moving = (from: {x: number; y: number; w: number; h: number}, to: typeof from, t: number) => ({
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    w: to.w,
    h: lerp(from.h, to.h, t),
  });

  const app = presence(frame, C.appIn, C.home + 15, 12, 15);
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
            id="cp-a"
            {...tankA}
            opacity={aDim}
            segments={aSegments}
            outlineColor={warn && !oldGone ? COLORS.error : COLORS.cyan}
            readout={{tokens: level * CAPACITY, capacity: CAPACITY, opacity: interpolate(frame, [C.card, C.card + 15], [1, 0], clampOpts), warn}}
          />
        </g>

        <ContextTank
          id="cp-b"
          {...tankB}
          draw={bDraw}
          segments={bSegments}
          readout={{tokens: bTokens, capacity: CAPACITY, opacity: bDraw}}
          remaining={{from: COMPACTED_TOP, opacity: presence(frame, C.freed, C.home + 25, 14, 14), label: 'SPACE FREED'}}
        />

        {/* Funnel, drawn on by the app. */}
        <g opacity={aOut}>
          <path
            d={`M${FUNNEL.mouthX} ${FUNNEL.mouthTop} L${FUNNEL.neckX} ${FUNNEL.neckTop} L${FUNNEL.neckX} ${FUNNEL.neckBottom} L${FUNNEL.mouthX} ${FUNNEL.mouthBottom} Z`}
            fill={rgba(COLORS.purple, 0.08 * funnelDraw)}
          />
          {sq > 0 && sq < 1 ? (
            <rect x={block.x - block.w / 2} y={block.y - block.h / 2} width={block.w} height={block.h} rx={6} fill={SEGMENT_STYLE.history.fill} stroke={rgba(COLORS.white, 0.6)} strokeWidth={2} />
          ) : null}
          <path d={funnelPath} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - funnelDraw} fill="none" stroke={COLORS.purple} strokeWidth={4} strokeLinecap="round" />
          <AppMarker x={1140} y={196} opacity={app} frame={frame} />
        </g>

        {/* Instructions and tool definitions are kept as they are. */}
        {keepT > 0 && keepT < 1
          ? [COMPACTED[0], COMPACTED[1]].map((s) => {
              const r = moving(segmentRect(tankA, s.from, s.to), segmentRect(tankB, s.from, s.to), keepT);
              return <rect key={s.kind} x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill={SEGMENT_STYLE[s.kind].fill} stroke={rgba(COLORS.purple, 0.7)} strokeWidth={2} />;
            })
          : null}
        {/* So are the most recent turns. */}
        {recentT > 0 && recentT < 1
          ? (() => {
              const r = moving(segmentRect(tankA, OLD_TOP, OLD_TOP + 0.12), segmentRect(tankB, COMPACTED[3].from, COMPACTED[3].to), recentT);
              return <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill={SEGMENT_STYLE.history.fill} stroke={rgba(COLORS.white, 0.5)} strokeWidth={2} />;
            })()
          : null}

        {/* Detail that didn't survive the summary leaks away. */}
        {LOST.map((text, i) => {
          const start = C.leaks[i];
          if (frame < start || frame > start + C.leakLife) {
            return null;
          }
          const t = interpolate(frame, [start, start + 30], [0, 1], {...clampOpts, easing: Easing.out(Easing.quad)});
          const sx = 1080 + 120 * i;
          const target = {x: 1200, y: 640 + 95 * i};
          const px = lerp(sx, target.x, t);
          const py = lerp(funnelLowerY(sx), target.y, t);
          const fade = interpolate(frame, [start + 38, start + C.leakLife], [1, 0], clampOpts);
          const strike = interpolate(frame, [start + 18, start + 30], [0, 1], clampOpts);
          const w = textWidth(text, 22);
          return (
            <g key={i} opacity={fade}>
              <circle cx={px} cy={py} r={6} fill={COLORS.white} opacity={0.8} />
              <g opacity={interpolate(frame, [start + 8, start + 16], [0, 1], clampOpts)}>
                <text x={px} y={py + 30} fill={rgba(COLORS.white, 0.75)} fontFamily={FONT} fontWeight={500} fontSize={22} textAnchor="middle" dominantBaseline="central">
                  {text}
                </text>
                <line x1={px - w / 2} x2={px - w / 2 + w * strike} y1={py + 31} y2={py + 31} stroke={COLORS.error} strokeWidth={3} />
              </g>
            </g>
          );
        })}
      </svg>

      {/* Conversation turns stream in. */}
      {TURNS.map((text, i) => {
        const start = C.bubblesStart + i * C.bubbleGap;
        const t = interpolate(frame, [start, lands[i]], [0, 1], {...clampOpts, easing: Easing.in(Easing.quad)});
        if (t <= 0 || t >= 1) {
          return null;
        }
        const target = {x: tankA.x, y: fillTopY(tankA, level) - 10};
        const user = i % 2 === 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: lerp(-220, target.x, t),
              top: lerp(190, target.y, t * t * t),
              transform: `translate(-50%, -50%) scale(${lerp(1, 0.25, t * t)})`,
              opacity: interpolate(t, [0.8, 1], [1, 0], clampOpts),
              padding: '10px 20px',
              borderRadius: 22,
              border: `2px solid ${user ? COLORS.cyan : rgba(COLORS.white, 0.7)}`,
              background: rgba(COLORS.charcoal, 0.92),
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 22,
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
          x={lerp(lerp(FUNNEL.neckX + 20, B_X, cardPop), sumRect.x + sumRect.w / 2, cardLand)}
          y={lerp(lerp(FUNNEL_Y, 420, cardPop), sumRect.y + sumRect.h / 2, cardLand)}
          width={320}
          text={SUMMARY}
          fontSize={20}
          label="SUMMARY"
          color={COLORS.white}
          scale={lerp(0.4, 1, cardPop) * lerp(1, 0.3, cardLand)}
          opacity={interpolate(cardLand, [0.6, 1], [1, 0], clampOpts)}
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
