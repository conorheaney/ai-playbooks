import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Pinned} from '../../../shared/components/Stage';
import {Bubble} from '../../../shared/components/Bubble';
import {ModelCube} from '../components/ModelCube';
import {Caption, LoopBadge, Person} from '../../../shared/components/People';
import {SceneTitle} from '../../../shared/components/SceneTitle';
import {FONT} from '../../../shared/fonts';
import {mix2} from '../../../shared/lib/math';
import {clampOpts, CUBE_HOME, flashAt} from '../lib/motion';
import {EDGES, NODE_RADIUS, NODES, strokeForWeight} from '../lib/network';
import {COLORS, rgba, VIDEO} from '../../../shared/theme';
import {EXAMPLE_TRAVEL, FINETUNE as F, SCENES} from '../timing';

const QUESTION = 'What’s the capital of France?';
const RAMBLE = 'What’s the capital of Germany? What’s the capital of Spain? What’s the capital of Italy? What’s the…';
const ANSWER = 'The capital of France is Paris.';
const LEFT = {x: 420, y: 500};
const RIGHT = {x: 1490, y: 500};
const PEOPLE_X = 230;
const PEOPLE_Y = [360, 520, 680];
const CARD = {w: 270, h: 76};
const EXAMPLES: [string, string][] = [
  ['Q: Capital of France?', 'A: Paris.'],
  ['Q: Fix this bug…', 'A: Change line 4 to…'],
  ['Q: Summarise this…', 'A: In short, …'],
  ['Q: Translate “hello”', 'A: “Bonjour”'],
  ['Q: Write a haiku', 'A: Autumn moonlight…'],
  ['Q: What is 12 × 4?', 'A: 48.'],
  ['Q: Plan a weekend trip', 'A: Day 1: …'],
];
const EXAMPLE_TOTAL = 25_000;

export const FineTuneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const abs = SCENES.fineTune.from + frame;
  const dur = SCENES.fineTune.durationInFrames;
  const smooth = (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration});
  const pop = (start: number) => (frame >= start ? spring({frame: frame - start, fps, config: {damping: 10, stiffness: 180}}) : 0);
  const fly = (start: number) => interpolate(frame, [start, start + 16], [0, 1], {...clampOpts, easing: Easing.in(Easing.cubic)});

  // Scene 3's network implodes into the model.
  const collapse = interpolate(frame, [0, F.collapseEnd], [0, 1], {...clampOpts, easing: Easing.in(Easing.cubic)});
  const netOpacity = interpolate(frame, [F.collapseEnd - 8, F.collapseEnd], [1, 0], clampOpts);
  const toCore = (p: {x: number; y: number}) => mix2(p, CUBE_HOME, collapse);
  const burst = interpolate(frame, [F.collapseEnd - 4, F.collapseEnd + 14], [0, 1], clampOpts);
  const cubeIn = spring({frame: frame - F.cubeIn, fps, config: {damping: 12, mass: 0.8}});

  // Part A: the base model just continues text.
  const partA = interpolate(frame, [F.partOut, F.partB], [1, 0], clampOpts);
  const q1Fly = fly(F.questionIn);
  const q1Pos = mix2(LEFT, CUBE_HOME, q1Fly);
  const ramble = interpolate(frame, [F.ramble, F.rambleEnd], [0, RAMBLE.length], clampOpts);

  // Part B: people write example conversations; the model learns to answer.
  const humans = interpolate(frame, [F.partB, F.partB + 12, F.humansOut, F.humansOut + 12], [0, 1, 1, 0], clampOpts);
  const badge = interpolate(frame, [F.partB, F.partB + 10, dur - 12, dur], [0, 1, 1, 0], clampOpts);
  const examplesSeen = interpolate(frame, [F.examples[0], F.examplesEnd], [0, EXAMPLE_TOTAL], {
    ...clampOpts,
    easing: Easing.in(Easing.quad),
  });
  const learnGlow = Math.max(0, ...F.examples.map((s) => flashAt(frame, s + EXAMPLE_TRAVEL)));
  const q2Fly = fly(F.question2In);
  const q2Pos = mix2(LEFT, CUBE_HOME, q2Fly);
  const answer = interpolate(frame, [F.answer, F.answerEnd], [0, ANSWER.length], clampOpts);
  const endFade = interpolate(frame, [dur - 12, dur], [1, 0], clampOpts);

  return (
    <AbsoluteFill>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        {netOpacity > 0 ? (
          <g opacity={netOpacity}>
            {EDGES.map((e, i) => {
              const a = toCore(e.from);
              const b = toCore(e.to);
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={rgba(COLORS.cyan, 0.32)} strokeWidth={strokeForWeight(e.w1)} strokeLinecap="round" />;
            })}
            {NODES.map((n) => {
              const p = toCore(n);
              return <circle key={`${n.layer}-${n.index}`} cx={p.x} cy={p.y} r={NODE_RADIUS * (1 - collapse * 0.7)} fill={COLORS.charcoal} stroke={COLORS.cyan} strokeWidth={2.5} />;
            })}
          </g>
        ) : null}
        {burst > 0 && burst < 1 ? <circle cx={CUBE_HOME.x} cy={CUBE_HOME.y} r={220 * burst} fill={COLORS.white} opacity={0.8 * (1 - burst)} /> : null}

        <ModelCube
          id="ft-cube"
          absFrame={abs}
          {...CUBE_HOME}
          appear={cubeIn}
          emblem={pop(F.emblem)}
          glow={learnGlow * 0.8}
          glowColor={COLORS.purple}
        />

        {/* People writing example conversations, streaming into the model. */}
        <g opacity={humans}>
          {PEOPLE_Y.map((y) => (
            <Person key={y} x={PEOPLE_X} y={y} size={80} />
          ))}
          <Caption x={PEOPLE_X} y={770} text="PEOPLE WRITE EXAMPLES" />
          <Caption x={CUBE_HOME.x} y={790} text="EXAMPLE CONVERSATIONS" />
          <text
            x={CUBE_HOME.x}
            y={840}
            fill={COLORS.purple}
            fontFamily={FONT}
            fontWeight={800}
            fontSize={44}
            textAnchor="middle"
            dominantBaseline="central"
            style={{fontVariantNumeric: 'tabular-nums'}}
          >
            {Math.round(examplesSeen).toLocaleString('en-US')}
          </text>
        </g>
        {EXAMPLES.map(([q, a], i) => {
          const t = (frame - F.examples[i]) / EXAMPLE_TRAVEL;
          if (t < 0 || t > 1) {
            return null;
          }
          const eased = Easing.inOut(Easing.cubic)(t);
          const from = {x: PEOPLE_X + 80 + CARD.w / 2, y: PEOPLE_Y[i % PEOPLE_Y.length]};
          const p = mix2(from, CUBE_HOME, eased);
          const opacity = Math.min(1, t * 6) * (t > 0.8 ? (1 - t) / 0.2 : 1);
          return (
            <g key={q} transform={`translate(${p.x} ${p.y}) scale(${1 - 0.7 * eased})`} opacity={opacity}>
              <rect x={-CARD.w / 2} y={-CARD.h / 2} width={CARD.w} height={CARD.h} rx={14} fill={COLORS.charcoal} stroke={COLORS.purple} strokeWidth={2.5} />
              <text x={-CARD.w / 2 + 16} y={-13} fill={COLORS.white} fontFamily={FONT} fontWeight={700} fontSize={20} dominantBaseline="central">
                {q}
              </text>
              <text x={-CARD.w / 2 + 16} y={15} fill={COLORS.cyan} fontFamily={FONT} fontWeight={500} fontSize={20} dominantBaseline="central">
                {a}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Part A */}
      <div style={{opacity: partA}}>
        <Bubble
          {...q1Pos}
          width={440}
          label="PROMPT"
          text={QUESTION}
          opacity={smooth(F.question1) * (1 - q1Fly)}
          scale={1 - 0.8 * q1Fly}
        />
        <Bubble
          {...RIGHT}
          width={540}
          label="BASE MODEL OUTPUT"
          color={COLORS.error}
          text={RAMBLE}
          chars={ramble}
          opacity={smooth(F.ramble - 4, 12)}
          mark="bad"
          markScale={pop(F.rambleReject)}
        />
      </div>

      {/* Part B: the same question after fine-tuning. */}
      <div style={{opacity: endFade}}>
        <Bubble
          {...q2Pos}
          width={440}
          label="PROMPT"
          text={QUESTION}
          opacity={smooth(F.question2) * (1 - q2Fly)}
          scale={1 - 0.8 * q2Fly}
        />
        <Bubble
          {...RIGHT}
          width={540}
          label="FINE-TUNED OUTPUT"
          text={ANSWER}
          chars={answer}
          opacity={smooth(F.answer - 4, 12)}
          mark="ok"
          markScale={pop(F.answerOk)}
        />
      </div>

      <Sequence from={F.collapseEnd} durationInFrames={F.partB - F.collapseEnd} layout="none">
        <div style={{opacity: partA}}>
          <Pinned>
            <SceneTitle text="BASE MODEL" mode="corner" />
          </Pinned>
        </div>
      </Sequence>
      <Sequence from={F.partB} durationInFrames={dur - F.partB} layout="none">
        <div style={{opacity: endFade}}>
          <Pinned>
            <SceneTitle text="FINE-TUNE ON EXAMPLES" mode="corner" />
          </Pinned>
        </div>
      </Sequence>
      <Pinned>
        <LoopBadge kind="human" opacity={badge} />
      </Pinned>
    </AbsoluteFill>
  );
};
