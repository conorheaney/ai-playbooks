import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Bubble, Mark} from '../../../shared/components/Bubble';
import {Caption} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {LockedCube} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {clampOpts, flashAt} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {DocIcon, Note, RefChipHtml} from '../components/Parts';
import {CUBE_HOME} from '../layout';
import {SCENES, SPECIFIC as S} from '../timing';

const DOCS = [
  {name: 'hotel-options.md', y: 480},
  {name: 'travel-policy-2025.pdf', y: 690},
];
const DOC_X = 220;
const LANES = [
  {key: 'vague', label: 'VAGUE', y: 380, prompt: 'Summarise these.'},
  {key: 'specific', label: 'SPECIFIC', y: 780, prompt: "Compare each hotel with the policy's nightly limit. Table. Cite the section."},
];
const PROMPT = {x: 700, w: 400};
const MODEL_X = 1000;
const RESULT = {x: 1400, w: 560, h: 280};

const QUESTIONS = ['Which ones fit the limit?', 'Says who?', 'Which hotel?'];
const ROWS = [
  {hotel: 'Parkside Hotel', price: '$235', fits: true},
  {hotel: 'Lakeview Suites', price: '$245', fits: true},
  {hotel: 'Capital Tower', price: '$289', fits: false},
];
const CHECK_ROW = 1;

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
  const generating = (lane: number) => interpolate(frame, [S.results[0] - 10 + lane * 6, S.results[0], S.results[1] - 10, S.results[1]], [0, 1, 1, 0], clampOpts);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {/* The model from Scene 2 steps aside; each lane shows a small copy of it. */}
        {cubeOut > 0.001 ? <LockedCube id="gc-s-cube" absFrame={abs} {...CUBE_HOME} appear={cubeOut} /> : null}

        <g opacity={out}>
          {DOCS.map((d, i) => (
            <DocIcon key={d.name} x={DOC_X} y={d.y} name={d.name} opacity={smooth(S.docs + i * 6, 14)} />
          ))}
          {/* The same material feeds both prompts. */}
          {DOCS.flatMap((d) =>
            LANES.map((l) => (
              <path
                key={`${d.name}-${l.key}`}
                d={`M${DOC_X + 60} ${d.y} C ${DOC_X + 200} ${d.y}, ${PROMPT.x - PROMPT.w / 2 - 140} ${l.y}, ${PROMPT.x - PROMPT.w / 2 - 12} ${l.y}`}
                fill="none"
                stroke={rgba(COLORS.cyan, 0.55)}
                strokeWidth={3}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - fork}
              />
            )),
          )}

          {LANES.map((l, i) => {
            const shown = smooth(i === 0 ? S.vague[0] - 10 : S.specific[0] - 10, 12);
            return (
              <g key={l.key} opacity={shown}>
                <Caption x={PROMPT.x - PROMPT.w / 2} y={l.y - (i === 0 ? 70 : 110)} text={l.label} anchor="start" color={i === 0 ? rgba(COLORS.white, 0.75) : COLORS.cyan} size={20} />
                <line x1={PROMPT.x + PROMPT.w / 2 + 12} x2={MODEL_X - 56} y1={l.y} y2={l.y} stroke={rgba(COLORS.white, 0.35)} strokeWidth={3} strokeDasharray="8 8" />
                <line x1={MODEL_X + 56} x2={RESULT.x - RESULT.w / 2 - 12} y1={l.y} y2={l.y} stroke={rgba(COLORS.white, 0.35)} strokeWidth={3} strokeDasharray="8 8" />
                <path d={`M${RESULT.x - RESULT.w / 2 - 24} ${l.y - 9}L${RESULT.x - RESULT.w / 2 - 12} ${l.y}L${RESULT.x - RESULT.w / 2 - 24} ${l.y + 9}`} fill="none" stroke={rgba(COLORS.white, 0.5)} strokeWidth={3} />
                <LockedCube id={`gc-s-mini-${i}`} absFrame={abs} x={MODEL_X} y={l.y} size={26} glow={generating(i) * 0.6} />
              </g>
            );
          })}

          {/* Review ring around the specific result. */}
          {review > 0.001 ? (
            <rect
              x={RESULT.x - RESULT.w / 2 - 12}
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
          <Caption x={RESULT.x + RESULT.w / 2} y={LANES[1].y - RESULT.h / 2 - 40} text="EASY TO REVIEW" anchor="end" color={COLORS.cyan} size={20} opacity={review} />
        </g>
      </svg>

      <AbsoluteFill style={{opacity: out}}>
        <Bubble x={PROMPT.x} y={LANES[0].y} width={PROMPT.w} text={LANES[0].prompt} chars={vagueChars} fontSize={24} label="PROMPT" color={rgba(COLORS.white, 0.6)} opacity={smooth(S.vague[0] - 10, 12)} />
        <Bubble x={PROMPT.x} y={LANES[1].y} width={PROMPT.w} text={LANES[1].prompt} chars={specificChars} fontSize={24} label="PROMPT" opacity={smooth(S.specific[0] - 10, 12)} />

        {/* Vague result: a general paragraph that leaves questions open. */}
        <ResultPanel y={LANES[0].y} opacity={smooth(S.results[0], 14)}>
          <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.18em', color: rgba(COLORS.white, 0.6), marginBottom: 18}}>ANSWER</div>
          {[0.92, 0.84, 0.9, 0.55].map((w, i) => (
            <div key={i} style={{height: 12, width: `${w * 62}%`, borderRadius: 6, background: rgba(COLORS.white, 0.22), marginBottom: 20, opacity: smooth(S.results[0] + 4 + i * 8, 10)}} />
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
                left: RESULT.x + RESULT.w / 2 - 150,
                top: LANES[0].y - 80 + i * 72,
                transform: `translate(-50%, -50%) scale(${(0.8 + 0.2 * s) * (1 + 0.1 * pulse)})`,
                opacity: s,
                padding: '8px 18px',
                borderRadius: 22,
                border: `2px dashed ${rgba(COLORS.white, 0.7)}`,
                background: rgba(COLORS.charcoal, 0.95),
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 21,
                color: COLORS.white,
                whiteSpace: 'nowrap',
              }}
            >
              {q}
            </div>
          ) : null;
        })}

        {/* Specific result: a table with a source on every row. */}
        <ResultPanel y={LANES[1].y} opacity={smooth(S.results[0] + 6, 14)} color={COLORS.cyan}>
          <div style={{display: 'grid', gridTemplateColumns: '1.7fr 1fr 0.6fr 0.9fr', columnGap: 10, rowGap: 14, alignItems: 'center'}}>
            {['HOTEL', '$/NIGHT', 'FITS', 'SOURCE'].map((h) => (
              <div key={h} style={{fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', color: COLORS.cyan}}>
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
        {/* Clear structure, but the numbers still need checking. */}
        {check > 0.001 ? (
          <div
            style={{
              position: 'absolute',
              left: RESULT.x + RESULT.w / 2 + 64,
              top: LANES[1].y - 20,
              transform: `translate(-50%, -50%) scale(${1.4 - 0.4 * check})`,
              opacity: Math.min(1, check * 1.4),
              padding: '4px 12px',
              borderRadius: 10,
              border: `3px solid ${COLORS.error}`,
              background: rgba(COLORS.charcoal, 0.9),
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '0.12em',
              color: COLORS.error,
            }}
          >
            CHECK
          </div>
        ) : null}

        <Note x={(DOC_X + RESULT.x + RESULT.w / 2) / 2} y={985} text="Clearer to review. Not guaranteed correct." opacity={smooth(S.caption, 14)} />
      </AbsoluteFill>

      <Pinned>
        <SceneTitle text="VAGUE VS SPECIFIC" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};

const ResultPanel: React.FC<{y: number; opacity: number; color?: string; children: React.ReactNode}> = ({y, opacity, color = rgba(COLORS.white, 0.35), children}) =>
  opacity > 0.001 ? (
    <div
      style={{
        position: 'absolute',
        left: RESULT.x - RESULT.w / 2,
        top: y - RESULT.h / 2,
        width: RESULT.w,
        height: RESULT.h,
        boxSizing: 'border-box',
        padding: '24px 28px',
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
