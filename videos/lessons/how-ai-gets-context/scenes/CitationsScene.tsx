import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mark} from '../../../shared/components/Bubble';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {Pinned} from '../../../shared/components/Stage';
import {ContextTank, Segment} from '../../../shared/components/context/ContextTank';
import {LockedCube, StatusBadge} from '../../../shared/components/context/Pieces';
import {FONT} from '../../../shared/fonts';
import {lerp} from '../../../shared/lib/math';
import {clampOpts} from '../../../shared/lib/motion';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {FlowLine, Note, RefChipHtml} from '../components/Parts';
import {ASK_SEGMENTS, ASK_TANK, CUBE_HOME, POLICY} from '../layout';
import {CITATIONS as C, SCENES} from '../timing';

const CARD = {x: 990, y: 560, w: 600, h: 330};
const ROW_Y = [470, 560, 650];
const SOURCE = {x: 1630, w: 450, h: 124, y: [400, 560, 720]};

// Each claim cites a real section; the third section doesn't support its claim.
const CLAIMS = [
  {text: 'Hotel limit: $250 a night.', source: POLICY.s42, ok: true},
  {text: 'Book through the travel portal.', source: POLICY.s31, ok: true},
  {text: 'Breakfast is included.', source: POLICY.s43, ok: false},
];

// Scene 6's window, as it hands its context to the model.
const HANDED: Segment[] = [
  {kind: 'instructions', from: ASK_SEGMENTS.instructions[0], to: ASK_SEGMENTS.instructions[1]},
  ...ASK_SEGMENTS.retrieved.map(([from, to]) => ({kind: 'retrieved' as const, from, to})),
  {kind: 'message', from: ASK_SEGMENTS.message[0], to: ASK_SEGMENTS.message[1]},
];

export const CitationsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.citations.from + frame;
  const dur = SCENES.citations.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const ease = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

  const out = interpolate(frame, [C.out, dur], [1, 0], clampOpts);
  const hand = interpolate(frame, [C.handOff[0], C.handOff[1]], [0, 1], ease);
  const tank = {
    x: lerp(ASK_TANK.x, CUBE_HOME.x + 200, hand),
    y: lerp(ASK_TANK.y, CUBE_HOME.y, hand),
    w: lerp(ASK_TANK.w, 60, hand),
    h: lerp(ASK_TANK.h, 140, hand),
  };
  const writing = interpolate(frame, [C.answer[0], C.answer[0] + 6, C.answer[1], C.answer[1] + 8], [0, 1, 1, 0], clampOpts);
  const claimChars = (i: number) => {
    const span = (C.answer[1] - C.answer[0]) / CLAIMS.length;
    return interpolate(frame, [C.answer[0] + i * span, C.answer[0] + (i + 1) * span], [0, CLAIMS[i].text.length], clampOpts);
  };
  const threadDraw = (i: number) => interpolate(frame, [C.threads[0] + i * 8, C.threads[0] + i * 8 + 24], [0, 1], ease);
  const verdictAt = (i: number) => (CLAIMS[i].ok ? C.supported[0] + i * 12 : C.unsupported);
  const revealAt = (i: number) => (CLAIMS[i].ok ? C.supported[0] + i * 12 - 6 : C.reveal3);
  const failed = frame >= C.unsupported;

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <LockedCube id="gc-c-cube" absFrame={abs} {...CUBE_HOME} appear={smooth(0, 14)} glow={writing * (0.35 + 0.3 * Math.sin(frame / 4))} />
        {/* The assembled context feeds the model, which writes the answer. */}
        <ContextTank id="gc-c-tank" {...tank} segments={HANDED} opacity={1 - hand} />
        <FlowLine from={{x: CUBE_HOME.x + 150, y: CUBE_HOME.y - 10}} to={{x: CARD.x - CARD.w / 2 - 10, y: CARD.y}} frame={frame} opacity={writing * out} />

        <g opacity={out}>
          {/* Threads from each claim's reference to its source. */}
          {CLAIMS.map((c, i) => {
            const bad = !c.ok && failed;
            const draw = threadDraw(i);
            if (draw <= 0) {
              return null;
            }
            const from = {x: CARD.x + CARD.w / 2 + 4, y: ROW_Y[i]};
            const to = {x: SOURCE.x - SOURCE.w / 2 - 4, y: SOURCE.y[i]};
            const jitter = bad ? Math.sin(frame * 1.7) * 3 : 0;
            return (
              <path
                key={i}
                d={`M${from.x} ${from.y} C ${from.x + 70} ${from.y + jitter}, ${to.x - 70} ${to.y - jitter}, ${to.x} ${to.y}`}
                fill="none"
                stroke={bad ? COLORS.error : COLORS.cyan}
                strokeWidth={3}
                pathLength={1}
                strokeDasharray={bad ? '0.06 0.05' : '1 1'}
                strokeDashoffset={bad ? 0 : 1 - draw}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </svg>

      <AbsoluteFill style={{opacity: out}}>
        {/* The answer, with a reference on every claim. */}
        <div
          style={{
            position: 'absolute',
            left: CARD.x - CARD.w / 2,
            top: CARD.y - CARD.h / 2,
            width: CARD.w,
            height: CARD.h,
            boxSizing: 'border-box',
            borderRadius: 22,
            border: `2px solid ${COLORS.cyan}`,
            background: rgba(COLORS.charcoal, 0.92),
            fontFamily: FONT,
            color: COLORS.white,
            opacity: smooth(C.answer[0] - 6, 12),
          }}
        >
          <div style={{position: 'absolute', left: 28, top: 20, fontSize: 15, fontWeight: 700, letterSpacing: '0.18em', color: COLORS.cyan}}>ANSWER</div>
          {CLAIMS.map((c, i) => {
            const typed = Math.floor(claimChars(i));
            const mark = spring({frame: frame - verdictAt(i), fps, config: {damping: 12, stiffness: 180}});
            const bad = !c.ok && failed;
            return (
              <div key={i} style={{position: 'absolute', left: 24, right: 24, top: ROW_Y[i] - (CARD.y - CARD.h / 2) - 24, height: 48, display: 'flex', alignItems: 'center'}}>
                <div style={{width: 46, flexShrink: 0}}>
                  {frame >= verdictAt(i) ? (
                    <svg width={36} height={36} viewBox="-26 -26 52 52" style={{transform: `scale(${mark})`}}>
                      <Mark ok={c.ok} />
                    </svg>
                  ) : null}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 25,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    textDecorationLine: bad ? 'underline' : 'none',
                    textDecorationStyle: 'wavy',
                    textDecorationColor: COLORS.error,
                    textUnderlineOffset: 6,
                  }}
                >
                  {c.text.slice(0, typed)}
                </div>
                <div style={{opacity: typed >= c.text.length ? 1 : 0}}>
                  <RefChipHtml text={c.source.ref} color={bad ? COLORS.error : COLORS.cyan} />
                </div>
              </div>
            );
          })}
        </div>

        {/* The cited sections: real sections of the real document. */}
        {CLAIMS.map((c, i) => {
          const shown = smooth(C.sources[0] + i * 6, 12);
          const reveal = smooth(revealAt(i), 12);
          const verdict = smooth(verdictAt(i), 10);
          const bad = !c.ok && failed;
          return shown > 0.001 ? (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: SOURCE.x - SOURCE.w / 2,
                top: SOURCE.y[i] - SOURCE.h / 2,
                width: SOURCE.w,
                height: SOURCE.h,
                boxSizing: 'border-box',
                padding: '14px 20px',
                borderRadius: 18,
                border: `2px solid ${bad ? COLORS.error : rgba(COLORS.cyan, 0.7)}`,
                background: rgba(COLORS.charcoal, 0.94),
                fontFamily: FONT,
                color: COLORS.white,
                opacity: shown,
                transform: `translateX(${(1 - shown) * 30}px)`,
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <RefChipHtml text={c.source.ref} color={bad ? COLORS.error : COLORS.cyan} />
                <span style={{fontSize: 14, fontWeight: 500, color: rgba(COLORS.white, 0.6), whiteSpace: 'nowrap'}}>travel-policy-2025.pdf</span>
                <span style={{marginLeft: 'auto', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: c.ok ? COLORS.cyan : COLORS.error, opacity: verdict, whiteSpace: 'nowrap'}}>
                  {c.ok ? 'SUPPORTED' : 'NOT SUPPORTED'}
                </span>
              </div>
              <div style={{position: 'relative', marginTop: 12, height: 52}}>
                <div style={{position: 'absolute', inset: 0, opacity: 1 - reveal}}>
                  {[0.9, 0.6].map((w, k) => (
                    <div key={k} style={{height: 10, width: `${w * 100}%`, borderRadius: 5, background: rgba(COLORS.white, 0.18), marginBottom: 14}} />
                  ))}
                </div>
                <div style={{position: 'absolute', inset: 0, opacity: reveal, fontSize: 20, fontWeight: 500, lineHeight: 1.3}}>{c.source.text}</div>
              </div>
            </div>
          ) : null;
        })}

        <Note x={(CUBE_HOME.x - 140 + SOURCE.x + SOURCE.w / 2) / 2} y={880} text="A real citation isn't proof." opacity={smooth(C.caption, 14)} />
      </AbsoluteFill>

      <Pinned>
        <StatusBadge kind="review" opacity={smooth(0, 12) * out} frame={frame} />
      </Pinned>
      <Pinned>
        <SceneTitle text="CHECK THE SOURCE" mode="corner" />
      </Pinned>
    </AbsoluteFill>
  );
};
