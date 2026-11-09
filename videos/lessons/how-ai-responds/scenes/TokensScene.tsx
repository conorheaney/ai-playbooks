import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, flashAt, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, fillTopY} from '../../../shared/components/context/ContextTank';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube, textWidth} from '../../../shared/components/context/Pieces';
import {CAPACITY, CUBE_HOME, INPUT, INPUT_TOP, PROMPT, TANK_HOME} from '../layout';
import {SCENES, TOKENS as T} from '../timing';

const SMALL = {x: 1640, y: 540, w: 192, h: 456};
const PANEL = {x: 1080, y: 420, w: 580, h: 340};
const LINE_Y = 860;
const CHIP = {font: 36, h: 64, pad: 36, gap: 12};
const SLIVER = 0.015; // window share each new token adds (exaggerated so it can be seen)
const SLIVER_TRAVEL = 12;

// Realistic tokens: "Canberra" is two. Scores are illustrative.
const STEPS: {tok: string; cands: [string, number][]}[] = [
  {tok: 'The', cands: [['The', 0.62], ['A', 0.21], ['Canberra', 0.09], ['It', 0.04]]},
  {tok: ' capital', cands: [[' capital', 0.81], [' Australian', 0.08], [' city', 0.06], [' answer', 0.03]]},
  {tok: ' of', cands: [[' of', 0.93], [' city', 0.04], [' is', 0.02], [' for', 0.01]]},
  {tok: ' Australia', cands: [[' Australia', 0.96], [' the', 0.02], [' AU', 0.01], [' this', 0.01]]},
  {tok: ' is', cands: [[' is', 0.95], [' city', 0.03], [',', 0.01], [' was', 0.01]]},
  {tok: ' Can', cands: [[' Can', 0.71], [' Sydney', 0.19], [' Melbourne', 0.06], [' the', 0.03]]},
  {tok: 'berra', cands: [['berra', 0.98]]},
  {tok: '.', cands: [['.', 0.91]]},
];
const FOCUS = 5; // the step shown in full

const BEATS = STEPS.map((_, i) => {
  if (i < FOCUS) {
    const start = T.fastStart + i * T.fastStep;
    return {start, select: start + 5, fly: start + 7, land: start + 13};
  }
  if (i === FOCUS) {
    return {start: T.focus, select: T.select, fly: T.fly, land: T.flyEnd};
  }
  const start = T.quick[i - FOCUS - 1];
  return {start, select: start + 6, fly: start + 8, land: start + 16};
});

// Response line layout, centred on screen, with the END marker after the last token.
const WIDTHS = STEPS.map((s) => textWidth(s.tok.trim(), CHIP.font) + CHIP.pad);
const END_W = textWidth('END', 22) + 52;
const TOTAL_W = WIDTHS.reduce((a, b) => a + b + CHIP.gap, 0) + END_W;
const SLOTS = WIDTHS.map((w, i) => 960 - TOTAL_W / 2 + WIDTHS.slice(0, i).reduce((a, b) => a + b + CHIP.gap, 0) + w / 2);
const END_X = 960 - TOTAL_W / 2 + TOTAL_W - END_W / 2;
const LINE_END = 960 + TOTAL_W / 2;

const fmtScore = (v: number) => (v < 0.01 ? '<0.01' : v.toFixed(2));

export const TokensScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.tokens.from + frame;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const out = interpolate(frame, [T.out, T.out + 18], [1, 0], clampOpts);

  const lay = smooth(0, T.layout);
  const tank = {
    x: lerp(TANK_HOME.x, SMALL.x, lay),
    y: lerp(TANK_HOME.y, SMALL.y, lay),
    w: lerp(TANK_HOME.w, SMALL.w, lay),
    h: lerp(TANK_HOME.h, SMALL.h, lay),
  };
  // Each landed token sends a sliver into the window: the response becomes context for the next token.
  const level =
    INPUT_TOP + BEATS.reduce((sum, b) => sum + SLIVER * interpolate(frame, [b.land + SLIVER_TRAVEL - 4, b.land + SLIVER_TRAVEL], [0, 1], clampOpts), 0);

  // The panel follows the quick steps, then stays on " Can" for the rest of the scene.
  const panelStep = BEATS.reduce((cur, b, i) => (i <= FOCUS && frame >= b.start ? i : cur), 0);
  const panelIn = presence(frame, T.fastStart, T.out + 18, 10, 18);
  const panelScale = interpolate(frame, [T.focus - 5, T.focus + 11], [0.8, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
  const beat = BEATS[panelStep];
  const ring = panelStep === FOCUS ? spring({frame: frame - beat.select, fps, config: {damping: 14, stiffness: 160}}) : interpolate(frame, [beat.select, beat.select + 3], [0, 1], clampOpts);
  const sydney = Math.max(...T.sydneyPulses.map((p) => flashAt(frame, p, 26)));

  const generating = presence(frame, T.fastStart, T.end + 6, 6, 10);
  const loopArrow = interpolate(frame, [T.loopArrow, T.loopArrow + 25], [0, 1], clampOpts);
  const feed = presence(frame, T.layout, T.out + 18, 12, 18);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* The whole context feeds the model on every step. */}
        <path
          d={`M${SMALL.x - SMALL.w / 2 - 4} 640 C 1300 720, 900 720, ${CUBE_HOME.x + 140} 600`}
          fill="none"
          stroke={COLORS.cyan}
          strokeWidth={3}
          strokeDasharray="4 12"
          strokeDashoffset={-frame * 1.5}
          strokeLinecap="round"
          opacity={0.45 * feed}
        />
        <LockedCube id="tk-cube" absFrame={abs} {...CUBE_HOME} glow={generating * (0.3 + 0.3 * Math.sin(frame / 4))} />

        <ContextTank
          id="tk-tank"
          {...tank}
          opacity={out}
          segments={[...INPUT, {kind: 'output', from: INPUT_TOP, to: level}]}
          readout={{tokens: INPUT_TOP * CAPACITY, capacity: CAPACITY, opacity: interpolate(frame, [0, 12], [1, 0], clampOpts)}}
        />

        {/* Score panel. */}
        <g opacity={panelIn} transform={`translate(${PANEL.x} ${PANEL.y}) scale(${panelScale}) translate(${-PANEL.x} ${-PANEL.y})`}>
          <rect x={PANEL.x - PANEL.w / 2} y={PANEL.y - PANEL.h / 2} width={PANEL.w} height={PANEL.h} rx={24} fill={rgba(COLORS.charcoal, 0.92)} stroke={rgba(COLORS.cyan, 0.5)} strokeWidth={2} />
          <Caption x={PANEL.x} y={PANEL.y - PANEL.h / 2 + 38} text="SCORES FOR THE NEXT TOKEN" size={18} />
          {STEPS[panelStep].cands.map(([tok, v], j) => {
            const y = PANEL.y - PANEL.h / 2 + 100 + j * 62;
            const grow =
              panelStep === FOCUS
                ? interpolate(frame, [T.focus + 8 * j, T.focus + 8 * j + 20], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)})
                : interpolate(frame, [beat.start, beat.start + 5], [0, 1], clampOpts);
            const warn = panelStep === FOCUS && j === 1 ? sydney : 0;
            const color = interpolateColors(warn, [0, 1], [j === 0 ? COLORS.cyan : rgba(COLORS.cyan, 0.55), COLORS.error]);
            return (
              <g key={`${panelStep}-${j}`} opacity={interpolate(grow, [0, 0.3], [0, 1], clampOpts)}>
                <text x={PANEL.x - PANEL.w / 2 + 32} y={y} fill={warn > 0.05 ? COLORS.error : COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={30} dominantBaseline="central">
                  {tok.trim()}
                </text>
                <rect x={PANEL.x - 70} y={y - 10} width={270} height={20} rx={10} fill={rgba(COLORS.white, 0.08)} />
                <rect x={PANEL.x - 70} y={y - 10} width={Math.max(0, 270 * v * grow)} height={20} rx={10} fill={color} />
                <text x={PANEL.x + PANEL.w / 2 - 24} y={y} fill={rgba(COLORS.white, 0.85)} fontFamily={FONT} fontWeight={700} fontSize={24} textAnchor="end" dominantBaseline="central" style={{fontVariantNumeric: 'tabular-nums'}}>
                  {fmtScore(v * grow)}
                </text>
              </g>
            );
          })}
          {ring > 0.01 ? (
            <rect
              x={PANEL.x - PANEL.w / 2 + 14}
              y={PANEL.y - PANEL.h / 2 + 100 - 27}
              width={PANEL.w - 28}
              height={54}
              rx={14}
              fill="none"
              stroke={COLORS.cyan}
              strokeWidth={3}
              opacity={ring}
              transform={`translate(${PANEL.x} ${PANEL.y - PANEL.h / 2 + 100}) scale(${lerp(1.08, 1, ring)}) translate(${-PANEL.x} ${-(PANEL.y - PANEL.h / 2 + 100)})`}
            />
          ) : null}
        </g>

        <g opacity={out}>
          <text x={960} y={LINE_Y - 82} fill={rgba(COLORS.white, 0.55)} fontFamily={FONT} fontWeight={500} fontSize={24} textAnchor="middle" dominantBaseline="central" opacity={smooth(T.layout, 12)}>
            {`Q: ${PROMPT}`}
          </text>

          {/* Response line: each chip flies from the model to its slot, then a sliver flies on into the window. */}
          {STEPS.map((s, i) => {
            const b = BEATS[i];
            if (frame < b.fly) {
              return null;
            }
            const t = interpolate(frame, [b.fly, b.land], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.quad)});
            const x = lerp(CUBE_HOME.x + 120, SLOTS[i], t);
            const y = lerp(CUBE_HOME.y, LINE_Y, t) - 90 * Math.sin(Math.PI * t);
            const sliver = interpolate(frame, [b.land, b.land + SLIVER_TRAVEL], [0, 1], clampOpts);
            const tankTop = {x: tank.x, y: fillTopY(tank, level)};
            const tag = i > FOCUS ? presence(frame, b.land, b.land + 60, 6, 14) : 0;
            return (
              <g key={i}>
                {sliver > 0 && sliver < 1 ? (
                  <circle cx={lerp(SLOTS[i], tankTop.x, sliver)} cy={lerp(LINE_Y, tankTop.y, sliver) - 120 * Math.sin(Math.PI * sliver)} r={7} fill={COLORS.cyan} />
                ) : null}
                <g transform={`translate(${x} ${y}) scale(${lerp(0.6, 1, t)})`}>
                  <rect x={-WIDTHS[i] / 2} y={-CHIP.h / 2} width={WIDTHS[i]} height={CHIP.h} rx={14} fill={rgba(COLORS.cyan, 0.12)} stroke={COLORS.cyan} strokeWidth={2.5} />
                  <text x={0} y={0} fill={COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={CHIP.font} textAnchor="middle" dominantBaseline="central">
                    {s.tok.trim()}
                  </text>
                </g>
                {tag > 0 ? (
                  <text x={SLOTS[i]} y={LINE_Y - 52} fill={COLORS.cyan} opacity={tag} fontFamily={FONT} fontWeight={700} fontSize={20} textAnchor="middle" dominantBaseline="central">
                    {fmtScore(s.cands[0][1])}
                  </text>
                ) : null}
              </g>
            );
          })}
          {frame >= T.end ? (
            <g transform={`translate(${END_X} ${LINE_Y}) scale(${smooth(T.end, 10)})`}>
              <rect x={-END_W / 2} y={-CHIP.h / 2 + 8} width={END_W} height={CHIP.h - 16} rx={10} fill="none" stroke={rgba(COLORS.white, 0.45)} strokeWidth={2} strokeDasharray="6 5" />
              <text x={0} y={0} fill={rgba(COLORS.white, 0.6)} fontFamily={FONT} fontWeight={700} fontSize={22} letterSpacing="0.14em" textAnchor="middle" dominantBaseline="central">
                END
              </text>
            </g>
          ) : null}

          {loopArrow > 0 ? (
            <g opacity={presence(frame, T.loopArrow, T.out + 18, 6, 18)}>
              <path
                d={`M${LINE_END + 18} ${LINE_Y} C ${LINE_END + 120} ${LINE_Y}, ${SMALL.x} ${LINE_Y + 40}, ${SMALL.x} ${SMALL.y + SMALL.h / 2 + 22}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - loopArrow}
                fill="none"
                stroke={COLORS.purple}
                strokeWidth={4}
                strokeLinecap="round"
              />
              <path d={`M${SMALL.x - 12} ${SMALL.y + SMALL.h / 2 + 34} L${SMALL.x} ${SMALL.y + SMALL.h / 2 + 16} L${SMALL.x + 12} ${SMALL.y + SMALL.h / 2 + 34}`} fill="none" stroke={COLORS.purple} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={loopArrow > 0.95 ? 1 : 0} />
              <Caption x={1520} y={LINE_Y + 96} text="EACH TOKEN BECOMES CONTEXT" color={COLORS.purple} size={20} />
            </g>
          ) : null}
        </g>
      </svg>

      <Pinned>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 146,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 56,
            letterSpacing: '-0.01em',
            color: COLORS.white,
            textShadow: `0 0 28px ${rgba(COLORS.cyan, 0.35)}`,
            opacity: presence(frame, T.caption, T.out + 18, 12, 18),
            transform: `translateY(${(1 - smooth(T.caption, 14)) * 20}px)`,
          }}
        >
          SCORES ARE PATTERNS, NOT FACTS
        </div>
      </Pinned>
      <div style={{opacity: out}}>
        <Pinned>
          <SceneTitle text="ONE TOKEN AT A TIME" mode="corner" />
        </Pinned>
      </div>
    </AbsoluteFill>
  );
};
