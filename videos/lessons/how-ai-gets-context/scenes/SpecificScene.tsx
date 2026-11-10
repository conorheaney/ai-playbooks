import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Mark} from '../../../shared/components/Bubble';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {clampOpts, flashAt} from '../../../shared/lib/motion';
import {centredRow} from '../../../shared/lib/row';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {DocIcon, Note, RefChipHtml} from '../components/Parts';
import {CUBE_HOME, CUBE_W, PROMPT_CARD_W, ROW_GAP} from '../layout';
import {SCENES, SPECIFIC as S} from '../timing';

const DOC_NAMES = ['hotel-options.md', 'travel-policy-2025.pdf'];
// One stack of the same documents, between the lanes; both lanes' lines fork from its right side.
const STACK = {y: 540, w: 340};
// The row, left to right: the documents, the prompts, the results. Each area joins the row as it first appears, and
// the documents leave as the results arrive (both prompts have them by then), so whatever is on screen stays
// centred with even gaps.
const CALLOUT = {w: 300, gap: 36}; // the CHECK callout beside the specific result's flagged row
// Where Scene 2 leaves the cube, so it fades out in place.
const [SCENE2_CUBE_X] = centredRow([{w: CUBE_W, p: 1}, {w: PROMPT_CARD_W, p: 1}], ROW_GAP);
const LANES = [
  {key: 'vague', label: 'VAGUE', y: 365, prompt: 'Summarise these.'},
  {key: 'specific', label: 'SPECIFIC', y: 765, prompt: "Compare each hotel with the policy's nightly limit. Table. Cite the section."},
];
const PROMPT = {w: 480};
const RESULT = {w: 640, h: 320, pad: 28};
// The specific result's table: a header row, then one row per hotel.
const TABLE = {head: 28, row: 72};

const QUESTIONS = ['Which ones fit the limit?', 'Says who?', 'Which hotel?'];
const ROWS = [
  {hotel: 'Parkside Hotel', price: '$235', fits: true},
  {hotel: 'Lakeview Suites', price: '$245', fits: true},
  {hotel: 'Capital Tower', price: '$289', fits: false},
];
const CHECK_ROW = 1;
// The flagged row's centre, from the result's centre.
const CHECK_ROW_DY = -RESULT.h / 2 + RESULT.pad + TABLE.head + TABLE.row * (CHECK_ROW + 0.5);

export const SpecificScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.specific.from + frame;
  const dur = SCENES.specific.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const out = interpolate(frame, [S.out, dur], [1, 0], clampOpts);
  const cubeOut = interpolate(frame, [0, 12], [1, 0], clampOpts);
  const fork = interpolate(frame, [S.fork[0], S.fork[1]], [0, 1], ease);
  const vagueChars = interpolate(frame, [S.vague[0], S.vague[1]], [0, LANES[0].prompt.length], clampOpts);
  const specificChars = interpolate(frame, [S.specific[0], S.specific[1]], [0, LANES[1].prompt.length], clampOpts);
  const review = smooth(S.review, 14);
  const check = spring({frame: frame - S.check, fps, config: {damping: 12, stiffness: 170}});
  const resultsIn = smooth(S.results[0] - 8, 14);
  // The documents hand over to the results: they fade and leave the row as the results join it.
  const docsGone = interpolate(frame, [S.results[0] - 20, S.results[0]], [0, 1], ease);
  const docsShown = smooth(S.docs, 14) * (1 - docsGone);
  const calloutIn = interpolate(frame, [S.check, S.check + 14], [0, 1], ease);
  const [DOC_X, promptX, resultX] = centredRow(
    [
      {w: STACK.w, p: docsShown},
      {w: PROMPT.w, p: interpolate(frame, [S.fork[0], S.fork[0] + 20], [0, 1], ease)},
      {w: RESULT.w + (CALLOUT.gap + CALLOUT.w) * calloutIn, p: resultsIn, anchor: RESULT.w / 2},
    ],
    ROW_GAP,
  );
  const promptLeft = promptX - PROMPT.w / 2;
  const resultLeft = resultX - RESULT.w / 2;

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* The model from Scene 2 steps aside; each lane shows a small copy of it. */}
        {cubeOut > 0.001 ? <LockedCube id="gc-s-cube" absFrame={abs} {...CUBE_HOME} x={SCENE2_CUBE_X} appear={cubeOut} /> : null}

        <g opacity={out}>
          {/* One stack of the same documents feeds both prompts. */}
          <g opacity={docsShown}>
            {DOC_NAMES.map((name, i) => (
              <DocIcon key={name} x={DOC_X - 14 + i * 28} y={STACK.y - 70 + i * 22} opacity={smooth(S.docs + i * 6, 14)} />
            ))}
            <Caption x={DOC_X} y={STACK.y + 46} text="SAME DOCUMENTS" color={COLORS.cyan} size={20} />
            {DOC_NAMES.map((name, i) => (
              <Caption key={name} x={DOC_X} y={STACK.y + 84 + i * 30} text={name} color={rgba(COLORS.white, 0.8)} size={17} />
            ))}
            {LANES.map((l) => (
              <path
                key={l.key}
                // Out level from the icons, then curving to the lane only once past the captions under the stack.
                d={`M${DOC_X + 64} ${STACK.y - 48} H ${DOC_X + 180} C ${DOC_X + 240} ${STACK.y - 48}, ${DOC_X + 220} ${l.y}, ${promptLeft - 12} ${l.y}`}
                fill="none"
                stroke={rgba(COLORS.cyan, 0.55)}
                strokeWidth={3}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - fork}
              />
            ))}
          </g>

          {LANES.map((l, i) => {
            const shown = smooth(i === 0 ? S.vague[0] - 10 : S.specific[0] - 10, 12);
            return (
              <g key={l.key} opacity={shown}>
                <Caption x={promptLeft} y={l.y - (i === 0 ? 70 : 110)} text={l.label} anchor="start" color={i === 0 ? rgba(COLORS.white, 0.75) : COLORS.cyan} size={20} />
                {/* Prompt to result. */}
                <g opacity={resultsIn}>
                  <line x1={promptX + PROMPT.w / 2 + 14} x2={resultLeft - 14} y1={l.y} y2={l.y} stroke={rgba(COLORS.white, 0.35)} strokeWidth={3} strokeDasharray="8 8" />
                  <path d={`M${resultLeft - 26} ${l.y - 9}L${resultLeft - 14} ${l.y}L${resultLeft - 26} ${l.y + 9}`} fill="none" stroke={rgba(COLORS.white, 0.5)} strokeWidth={3} />
                </g>
              </g>
            );
          })}

          {/* Review ring around the specific result. */}
          {review > 0.001 ? (
            <rect
              x={resultLeft - 12}
              y={LANES[1].y - RESULT.h / 2 - 12}
              width={RESULT.w + 24}
              height={RESULT.h + 24}
              rx={30}
              fill="none"
              stroke={COLORS.cyan}
              strokeWidth={3}
              opacity={review * 0.9}
            />
          ) : null}
          <Caption x={resultX + RESULT.w / 2} y={LANES[1].y - RESULT.h / 2 - 40} text="EASY TO REVIEW" anchor="end" color={COLORS.cyan} size={20} opacity={review} />
        </g>
      </svg>

      <AbsoluteFill style={{opacity: out}}>
        <Bubble x={promptX} y={LANES[0].y} width={PROMPT.w} text={LANES[0].prompt} chars={vagueChars} fontSize={24} label="PROMPT" color={rgba(COLORS.white, 0.6)} opacity={smooth(S.vague[0] - 10, 12)} />
        <Bubble x={promptX} y={LANES[1].y} width={PROMPT.w} text={LANES[1].prompt} chars={specificChars} fontSize={24} label="PROMPT" opacity={smooth(S.specific[0] - 10, 12)} />

        {/* Vague result: a general paragraph that leaves questions open. */}
        <ResultPanel x={resultX} y={LANES[0].y} opacity={smooth(S.results[0], 14)}>
          <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.18em', color: rgba(COLORS.white, 0.6), marginBottom: 22}}>ANSWER</div>
          {[0.92, 0.84, 0.9, 0.55].map((w, i) => (
            <div key={i} style={{height: 12, width: `${w * 48}%`, borderRadius: 6, background: rgba(COLORS.white, 0.22), marginBottom: 22, opacity: smooth(S.results[0] + 4 + i * 8, 10)}} />
          ))}
        </ResultPanel>
        {QUESTIONS.map((q, i) => {
          const s = smooth(S.results[0] + 24 + i * 8, 12);
          const pulse = flashAt(frame, S.review + i * 4, 22);
          return s > 0.001 ? (
            <div
              key={q}
              style={{
                position: 'absolute',
                left: resultX + RESULT.w / 2 - 28,
                top: LANES[0].y - 76 + i * 72,
                transform: `translate(-100%, -50%) scale(${(0.8 + 0.2 * s) * (1 + 0.1 * pulse)})`,
                transformOrigin: '100% 50%',
                opacity: s,
                padding: '8px 18px',
                borderRadius: 22,
                border: `2px dashed ${rgba(COLORS.white, 0.7)}`,
                background: rgba(COLORS.charcoal, 0.95),
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 20,
                color: COLORS.white,
                whiteSpace: 'nowrap',
              }}
            >
              {q}
            </div>
          ) : null;
        })}

        {/* Specific result: a table with a source on every row. */}
        <ResultPanel x={resultX} y={LANES[1].y} opacity={smooth(S.results[0] + 6, 14)} color={COLORS.cyan}>
          {/* The flagged row is tinted red when it's marked for checking. */}
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: RESULT.pad + TABLE.head + TABLE.row * CHECK_ROW + 6,
              height: TABLE.row - 12,
              boxSizing: 'border-box',
              borderRadius: 12,
              background: rgba(COLORS.error, 0.12),
              border: `2px solid ${rgba(COLORS.error, 0.6)}`,
              opacity: calloutIn,
            }}
          />
          <div style={{position: 'relative', display: 'grid', gridTemplateColumns: '1.7fr 1fr 0.6fr 0.9fr', gridTemplateRows: `${TABLE.head}px repeat(${ROWS.length}, ${TABLE.row}px)`, columnGap: 10, alignItems: 'center'}}>
            {['HOTEL', '$/NIGHT', 'FITS', 'SOURCE'].map((h) => (
              <div key={h} style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.16em', color: COLORS.cyan, alignSelf: 'start'}}>
                {h}
              </div>
            ))}
            {ROWS.map((r, i) => {
              const s = smooth(S.results[0] + 14 + i * 10, 10);
              const flagged = i === CHECK_ROW && frame >= S.check;
              return (
                <React.Fragment key={r.hotel}>
                  <div style={{fontSize: 22, fontWeight: 500, opacity: s, whiteSpace: 'nowrap'}}>{r.hotel}</div>
                  <div style={{fontSize: 22, fontWeight: 700, opacity: s, color: flagged ? COLORS.error : COLORS.white, fontVariantNumeric: 'tabular-nums'}}>{r.price}</div>
                  <div style={{opacity: s, height: 30}}>
                    <svg width={30} height={30} viewBox="-26 -26 52 52">
                      <Mark ok={r.fits} />
                    </svg>
                  </div>
                  <div style={{opacity: s}}>
                    <RefChipHtml text="§4.2" />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </ResultPanel>
        {/* Clear structure, but the numbers still need checking: the price comes from a separate source. */}
        {check > 0.001 ? (
          <div
            style={{
              position: 'absolute',
              left: resultX + RESULT.w / 2 + CALLOUT.gap,
              top: LANES[1].y + CHECK_ROW_DY,
              width: CALLOUT.w,
              boxSizing: 'border-box',
              transform: `translateY(-50%) scale(${1.25 - 0.25 * check})`,
              transformOrigin: '0% 50%',
              opacity: Math.min(1, check * 1.4),
              padding: '14px 18px 16px 22px',
              borderRadius: 14,
              border: `3px solid ${COLORS.error}`,
              background: rgba(COLORS.charcoal, 0.95),
              fontFamily: FONT,
              color: COLORS.white,
            }}
          >
            {/* A pointer back to the flagged row. */}
            <div style={{position: 'absolute', left: -12, top: '50%', width: 18, height: 18, transform: 'translateY(-50%) rotate(45deg)', background: COLORS.charcoal, borderLeft: `3px solid ${COLORS.error}`, borderBottom: `3px solid ${COLORS.error}`}} />
            <div style={{fontSize: 18, fontWeight: 800, letterSpacing: '0.12em', color: COLORS.error, marginBottom: 6}}>CHECK</div>
            <div style={{fontSize: 18, fontWeight: 500, lineHeight: 1.35}}>
              Price from <span style={{fontWeight: 700}}>hotel-options.md</span>, not the policy. Is it current?
            </div>
          </div>
        ) : null}

        <Note x={VIDEO.width / 2} y={985} text="Clearer to review. Not guaranteed correct." opacity={smooth(S.caption, 14)} />
      </AbsoluteFill>

      <Pinned>
        <SceneTitle text="VAGUE VS SPECIFIC" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};

const ResultPanel: React.FC<{x: number; y: number; opacity: number; color?: string; children: React.ReactNode}> = ({x, y, opacity, color = rgba(COLORS.white, 0.35), children}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: x - RESULT.w / 2,
        top: y - RESULT.h / 2,
        width: RESULT.w,
        height: RESULT.h,
        boxSizing: 'border-box',
        padding: RESULT.pad,
        borderRadius: 22,
        border: `2px solid ${color}`,
        background: rgba(COLORS.charcoal, 0.92),
        fontFamily: FONT,
        color: COLORS.white,
        opacity,
        transform: `translateY(${(1 - opacity) * 16}px)`,
      }}
    >
      {children}
    </div>
  ) : null;
