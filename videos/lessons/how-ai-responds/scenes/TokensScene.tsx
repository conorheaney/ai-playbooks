import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts, flashAt, presence} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {ContextTank, fillTopY} from '../../../shared/components/context/ContextTank';
import {Pinned, useStageShift} from '../../../shared/components/Stage';
import {LockedCube, PromptBar, textWidth} from '../../../shared/components/context/Pieces';
import {CAPACITY, CUBE_HOME, INPUT, INPUT_TOP, PROMPT, TANK_HOME, TANK_TEXT} from '../layout';
import {SCENES, TOKENS as T} from '../timing';

const SMALL = {x: 1640, y: 540, w: 192, h: 456};
const PANEL = {x: 1080, y: 420, w: 580, h: 340};
const LINE_Y = 860;
const CHIP = {font: 36, h: 64, pad: 36, gap: 12};
const SLIVER = 0.015; // window share each new token adds (exaggerated so it can be seen)
const SLIVER_TRAVEL = 12;
const QUESTION_W = textWidth(PROMPT, 38) + 100;
const DIMMED = 0.4; // earlier tokens once a newer one is on its way

// Realistic tokens: "13485" is two ("134" + "85"). Scores are illustrative. The runner-up " 900" (ISO 9001,
// the general quality standard) is the plausible-but-wrong pattern shown in red.
const STEPS: {tok: string; cands: [string, number][]}[] = [
  {tok: 'The', cands: [['The', 0.62], ['ISO', 0.21], ['It', 0.09], ['A', 0.04]]},
  {tok: ' QMS', cands: [[' QMS', 0.81], [' standard', 0.08], [' device', 0.06], [' answer', 0.03]]},
  {tok: ' standard', cands: [[' standard', 0.93], [' for', 0.04], [' is', 0.02], [' here', 0.01]]},
  {tok: ' is', cands: [[' is', 0.95], [' for', 0.03], [',', 0.01], [' was', 0.01]]},
  {tok: ' ISO', cands: [[' ISO', 0.96], [' IEC', 0.02], [' EN', 0.01], [' the', 0.01]]},
  {tok: ' 134', cands: [[' 134', 0.71], [' 900', 0.19], [' 149', 0.06], [' the', 0.03]]},
  {tok: '85', cands: [['85', 0.98]]},
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
  const shift = useStageShift();
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

  // The panel follows the quick steps, then stays on " 134" for the rest of the scene.
  const panelStep = BEATS.reduce((cur, b, i) => (i <= FOCUS && frame >= b.start ? i : cur), 0);
  const panelIn = presence(frame, T.fastStart, T.out + 18, 10, 18);
  const panelScale = interpolate(frame, [T.focus - 5, T.focus + 11], [0.8, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
  // The quick steps are a montage: dimmed, so the full-size panel at the focus step reads as "now look closely".
  const panelDim = interpolate(frame, [T.focus - 5, T.focus + 5], [0.7, 1], clampOpts);
  const beat = BEATS[panelStep];
  const ring = panelStep === FOCUS ? spring({frame: frame - beat.select, fps, config: {damping: 14, stiffness: 160}}) : interpolate(frame, [beat.select, beat.select + 3], [0, 1], clampOpts);
  const sydney = Math.max(...T.sydneyPulses.map((p) => flashAt(frame, p, 26)));

  const generating = presence(frame, T.fastStart, T.end + 6, 6, 10);
  const loopArrow = interpolate(frame, [T.loopArrow, T.loopArrow + 25], [0, 1], clampOpts);
  // On "Those scores are patterns" the generation scaffolding clears away (window, feed line, loop arrow, question)
  // and the response dims, so the score panel and the closing caption have the screen to themselves.
  // The panel also slides down to line up with the cube; the closing caption waits until all of this has settled.
  const settle = interpolate(frame, [T.settle, T.settle + 20], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
  const feed = presence(frame, T.layout, T.settle + 18, 12, 18);
  const response = out * lerp(1, 0.4, settle);
  // The scene's tail holds a fixed centring shift that centres the cube and panel; the response line cancels it as
  // things settle, so both rows finish centred on screen.
  const lineX = -shift * settle;
  // The question shows in a prompt box on the response line, then fades out as the first answer token flies in.
  const question = smooth(T.layout, 12) * interpolate(frame, [BEATS[0].fly - 8, BEATS[0].fly + 4], [1, 0], clampOpts);
  // As each new token starts its flight, everything already written dims, so the newest token stands out.
  const dimFor = (i: number) => {
    const next = BEATS[i + 1];
    return next ? interpolate(frame, [next.fly - 6, next.fly], [1, DIMMED], clampOpts) : 1;
  };

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
          opacity={0.3 * feed}
        />
        <LockedCube id="tk-cube" absFrame={abs} {...CUBE_HOME} glow={generating * (0.3 + 0.3 * Math.sin(frame / 4))} />

        <ContextTank
          id="tk-tank" textSizes={TANK_TEXT}
          {...tank}
          opacity={out * (1 - settle)}
          segments={[...INPUT, {kind: 'output', from: INPUT_TOP, to: level}]}
          readout={{tokens: INPUT_TOP * CAPACITY, capacity: CAPACITY, opacity: interpolate(frame, [0, 12], [1, 0], clampOpts)}}
        />

        {/* Score panel. */}
        <g opacity={panelIn * panelDim} transform={`translate(0 ${(CUBE_HOME.y - PANEL.y) * settle}) translate(${PANEL.x} ${PANEL.y}) scale(${panelScale}) translate(${-PANEL.x} ${-PANEL.y})`}>
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
                  {fmtScore(v)}
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


        <g opacity={response} transform={`translate(${lineX} 0)`}>

          {/* Response line: each chip flies from the model to its slot, then a sliver flies on into the window. */}
          {STEPS.map((s, i) => {
            const b = BEATS[i];
            if (frame < b.fly) {
              return null;
            }
            const t = interpolate(frame, [b.fly, b.land], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.quad)});
            // Down to a lane between the scores panel and the response line, across along it, then into its slot,
            // so the chip never passes over the panel's rows or the tokens already in the line.
            const LANE_Y = LINE_Y - 80;
            const x = lerp(CUBE_HOME.x + 120, SLOTS[i], interpolate(t, [0.15, 0.8], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.quad)}));
            const y = lerp(CUBE_HOME.y, LANE_Y, interpolate(t, [0, 0.4], [0, 1], {...clampOpts, easing: Easing.out(Easing.quad)})) + 80 * interpolate(t, [0.8, 1], [0, 1], clampOpts);
            const sliver = interpolate(frame, [b.land, b.land + SLIVER_TRAVEL], [0, 1], clampOpts);
            const tankTop = {x: tank.x, y: fillTopY(tank, level)};
            return (
              <g key={i}>
                {sliver > 0 && sliver < 1 ? (
                  <circle cx={lerp(SLOTS[i], tankTop.x, sliver)} cy={lerp(LINE_Y, tankTop.y, sliver) - 120 * Math.sin(Math.PI * sliver)} r={7} fill={COLORS.cyan} />
                ) : null}
                <g transform={`translate(${x} ${y}) scale(${lerp(0.6, 1, t)})`} opacity={dimFor(i)}>
                  <rect x={-WIDTHS[i] / 2} y={-CHIP.h / 2} width={WIDTHS[i]} height={CHIP.h} rx={14} fill={rgba(COLORS.cyan, 0.12)} stroke={COLORS.cyan} strokeWidth={2.5} />
                  <text x={0} y={0} fill={COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={CHIP.font} textAnchor="middle" dominantBaseline="central">
                    {s.tok.trim()}
                  </text>
                </g>
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
            <g opacity={presence(frame, T.loopArrow, T.settle + 14, 6, 14)}>
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
              <Caption x={1520} y={LINE_Y + 96} text="EACH TOKEN BECOMES CONTEXT" color={COLORS.purple} size={22} />
            </g>
          ) : null}
        </g>
      </svg>

      <PromptBar x={960} y={LINE_Y} width={QUESTION_W} text={PROMPT} chars={PROMPT.length} opacity={question} frame={frame} cursor={false} />

      <Pinned>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 250, // just above the panel once it has settled beside the cube
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 48,
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
