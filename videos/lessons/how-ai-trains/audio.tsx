import React from 'react';
import {Cue, Mixer} from '../../shared/audio';
import {
  EVALS,
  exampleArrive,
  FEEDBACK,
  FINETUNE,
  LOCK,
  RAW,
  REINFORCE,
  RELEASE,
  SAFETY,
  SceneKey,
  SCENES,
  TOKEN,
  WEIGHTS,
} from './timing';

const at = (scene: SceneKey, frame: number) => SCENES[scene].from + frame;
const hit = (src: string, scene: SceneKey, frame: number, volume = 0.5, durationInFrames = 20): Cue => ({
  src,
  from: at(scene, frame),
  durationInFrames,
  volume,
  accent: true,
});

// One narration slot per scene; files live in public/vo/how-ai-trains.
const VO_FILES: [SceneKey, string][] = [
  ['rawData', '01-raw-data'],
  ['tokenize', '02-tokenize'],
  ['weights', '03-weights'],
  ['fineTune', '04-fine-tune'],
  ['feedback', '05-feedback'],
  ['reinforce', '06-reinforcement'],
  ['safety', '07-safety'],
  ['evals', '08-evaluation'],
  ['lockIn', '09-locked-in'],
  ['release', '10-release'],
];
export const VOICEOVER: Cue[] = VO_FILES.map(([scene, name]) => ({
  src: `vo/how-ai-trains/${name}.wav`,
  from: SCENES[scene].from,
  durationInFrames: SCENES[scene].durationInFrames,
  volume: 1,
}));

// Reinforcement-learning cycle outcomes, mirroring TASKS in ReinforceScene.
const RL_RESULT_TO_REWARD = 3;
const RL_OK = [false, true, true, false, true, true, true, false, true, true];

// Absolute frames, derived from the same beats the visuals use. Files live in public/sfx.
export const SFX: Cue[] = [
  // 1 · Raw data
  {src: 'sfx/data-rush.wav', from: at('rawData', 0), durationInFrames: SCENES.rawData.durationInFrames, volume: 0.35},
  {src: 'sfx/rapid-typing.wav', from: at('rawData', RAW.counterStart), durationInFrames: RAW.counterEnd - RAW.counterStart, volume: 0.45},
  {src: 'sfx/tick-up.wav', from: at('rawData', RAW.counterStart), durationInFrames: RAW.counterEnd - RAW.counterStart, volume: 0.45},
  // 2 · Tokenize
  ...[...new Set(TOKEN.cuts)].map((cut) => hit('sfx/slice.wav', 'tokenize', cut, 0.6, 15)),
  {src: 'sfx/space-hum.wav', from: at('tokenize', TOKEN.morph), durationInFrames: SCENES.tokenize.durationInFrames - TOKEN.morph, volume: 0.3},
  // 3 · Weights
  {src: 'sfx/data-pulse.wav', from: at('weights', WEIGHTS.forward1), durationInFrames: 60, volume: 0.4},
  hit('sfx/error-buzzer.wav', 'weights', WEIGHTS.error, 0.3, 30),
  {src: 'sfx/data-pulse.wav', from: at('weights', WEIGHTS.backprop), durationInFrames: 51, volume: 0.35},
  {src: 'sfx/data-pulse.wav', from: at('weights', WEIGHTS.forward2), durationInFrames: 45, volume: 0.4},
  hit('sfx/lock-click.wav', 'weights', WEIGHTS.lock, 0.6, 15),
  // 4 · Base model -> fine-tune
  {src: 'sfx/power-up.wav', from: at('fineTune', 0), durationInFrames: 60, volume: 0.5},
  hit('sfx/pop.wav', 'fineTune', FINETUNE.question1, 0.5, 8),
  hit('sfx/absorb-whoosh.wav', 'fineTune', FINETUNE.questionIn - 9, 0.4, 30),
  {src: 'sfx/rapid-typing.wav', from: at('fineTune', FINETUNE.ramble), durationInFrames: FINETUNE.rambleEnd - FINETUNE.ramble, volume: 0.3},
  hit('sfx/error-buzzer.wav', 'fineTune', FINETUNE.rambleReject, 0.25, 30),
  ...FINETUNE.examples.map((_, i) => hit('sfx/pop.wav', 'fineTune', exampleArrive(i), 0.35, 8)),
  hit('sfx/absorb-whoosh.wav', 'fineTune', FINETUNE.question2In - 9, 0.4, 30),
  hit('sfx/chime.wav', 'fineTune', FINETUNE.emblem, 0.4, 45),
  {src: 'sfx/rapid-typing.wav', from: at('fineTune', FINETUNE.answer), durationInFrames: FINETUNE.answerEnd - FINETUNE.answer, volume: 0.3},
  hit('sfx/rating-ding.wav', 'fineTune', FINETUNE.answerOk),
  // 5 · Feedback (RLHF)
  hit('sfx/pop.wav', 'feedback', FEEDBACK.cards, 0.4, 8),
  hit('sfx/lock-click.wav', 'feedback', FEEDBACK.pick, 0.5, 15),
  hit('sfx/absorb-whoosh.wav', 'feedback', FEEDBACK.toReward, 0.45, 30),
  {src: 'sfx/data-pulse.wav', from: at('feedback', FEEDBACK.streamStart), durationInFrames: FEEDBACK.streamEnd - FEEDBACK.streamStart, volume: 0.3},
  hit('sfx/rating-ding.wav', 'feedback', FEEDBACK.signalEnd),
  // 6 · Reinforcement learning
  ...REINFORCE.cycles.flatMap((c, i) => {
    const verdict = c.start + c.lead + c.travel;
    return [
      hit('sfx/pop.wav', 'reinforce', c.start + c.lead, 0.3, 8),
      RL_OK[i] ? hit('sfx/rating-ding.wav', 'reinforce', verdict, 0.4) : hit('sfx/error-buzzer.wav', 'reinforce', verdict, 0.18, 15),
      ...(RL_OK[i] ? [hit('sfx/lock-click.wav', 'reinforce', verdict + RL_RESULT_TO_REWARD + c.travel, 0.35, 15)] : []),
    ];
  }),
  // 7 · Safety
  hit('sfx/power-up.wav', 'safety', SAFETY.shield, 0.3, 30),
  ...SAFETY.attacks.map((s) => hit('sfx/shield-hit.wav', 'safety', s + SAFETY.attackTravel, 0.5, 25)),
  hit('sfx/absorb-whoosh.wav', 'safety', SAFETY.user + SAFETY.userTravel - 25, 0.35, 30),
  hit('sfx/rating-ding.wav', 'safety', SAFETY.answerOk),
  // 8 · Evaluation
  {src: 'sfx/tick-up.wav', from: at('evals', EVALS.run1), durationInFrames: EVALS.fail - EVALS.run1, volume: 0.35},
  hit('sfx/error-buzzer.wav', 'evals', EVALS.fail, 0.3, 30),
  hit('sfx/absorb-whoosh.wav', 'evals', EVALS.loopArrive - 25, 0.4, 30),
  {src: 'sfx/tick-up.wav', from: at('evals', EVALS.run2), durationInFrames: EVALS.pass - EVALS.run2, volume: 0.35},
  hit('sfx/lock-click.wav', 'evals', EVALS.approve + 6, 0.6, 15),
  hit('sfx/chime.wav', 'evals', EVALS.approve + 8, 0.35, 45),
  // 9 · Locked in
  {src: 'sfx/space-hum.wav', from: at('lockIn', 0), durationInFrames: LOCK.freeze, volume: 0.25},
  hit('sfx/freeze.wav', 'lockIn', LOCK.freeze - 4, 0.5, 40),
  hit('sfx/lock-click.wav', 'lockIn', LOCK.lock + 6, 0.7, 15),
  hit('sfx/rating-ding.wav', 'lockIn', LOCK.tag),
  hit('sfx/shield-hit.wav', 'lockIn', LOCK.chatHit, 0.3, 25),
  // 10 · Release
  hit('sfx/absorb-whoosh.wav', 'release', RELEASE.powerOn - 25, 0.4, 30),
  {src: 'sfx/power-up.wav', from: at('release', RELEASE.powerOn), durationInFrames: 60, volume: 0.4},
  {src: 'sfx/data-pulse.wav', from: at('release', RELEASE.arcs), durationInFrames: 45, volume: 0.3},
  {src: 'sfx/data-rush.wav', from: at('release', RELEASE.usersStart), durationInFrames: RELEASE.usersEnd - RELEASE.usersStart, volume: 0.22},
  ...RELEASE.bubbles.map((s) => hit('sfx/pop.wav', 'release', s, 0.4, 8)),
  {src: 'sfx/data-pulse.wav', from: at('release', RELEASE.feedbackStart), durationInFrames: 40, volume: 0.25},
  hit('sfx/chime.wav', 'release', RELEASE.titleIn, 0.45, 45),
  {src: 'sfx/synth-swell.wav', from: at('release', SCENES.release.durationInFrames - 80), durationInFrames: 80, volume: 0.4},
];

export const SoundTrack: React.FC<{sfx: boolean; voiceover: boolean}> = ({sfx, voiceover}) => (
  <Mixer sfx={sfx ? SFX : []} voiceover={voiceover ? VOICEOVER : []} />
);
