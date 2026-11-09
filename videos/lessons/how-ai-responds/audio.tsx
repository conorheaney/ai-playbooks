import React from 'react';
import {Cue, cueHelpers, Mixer} from '../../shared/audio';
import {ASSEMBLE, COMPACT, MIDDLE, SceneKey, SCENES, SETTINGS, STOPPING, TEMPORARY, TOKENS, WINDOW} from './timing';

const {hit, bed} = cueHelpers(SCENES);

// One narration slot per scene; files live in public/vo/how-ai-responds (see BLUEPRINT.md for the lines).
const VO_FILES: [SceneKey, string][] = [
  ['assemble', '01-assemble'],
  ['window', '02-window'],
  ['tokens', '03-tokens'],
  ['settings', '04-settings'],
  ['middle', '05-middle'],
  ['compaction', '06-compaction'],
  ['stopping', '07-stopping'],
  ['temporary', '08-temporary'],
];
export const VOICEOVER: Cue[] = VO_FILES.map(([scene, name]) => ({
  src: `vo/how-ai-responds/${name}.wav`,
  from: SCENES[scene].from,
  durationInFrames: SCENES[scene].durationInFrames,
  volume: 1,
}));

// Mirrors the step beats in TokensScene: five quick tokens, then " Can", "berra", ".".
const TOKEN_LANDS = [
  ...Array.from({length: 5}, (_, i) => TOKENS.fastStart + i * TOKENS.fastStep + 13),
  TOKENS.flyEnd,
  ...TOKENS.quick.map((q) => q + 16),
];
const TURN_LANDS = Array.from({length: 10}, (_, i) => COMPACT.bubblesStart + i * COMPACT.bubbleGap + COMPACT.bubbleTravel);

// Absolute frames, derived from the same beats the visuals use. Files live in public/sfx.
export const SFX: Cue[] = [
  // 1 · Assemble the context
  hit('sfx/pop.wav', 'assemble', ASSEMBLE.promptIn, 0.45, 8),
  bed('sfx/rapid-typing.wav', 'assemble', ASSEMBLE.typeStart, ASSEMBLE.typeEnd - ASSEMBLE.typeStart, 0.4),
  hit('sfx/error-buzzer.wav', 'assemble', ASSEMBLE.strike, 0.22, 30),
  hit('sfx/power-up.wav', 'assemble', ASSEMBLE.appIn - 4, 0.3, 40),
  ...ASSEMBLE.cards.map((c) => hit('sfx/pop.wav', 'assemble', c + 8, 0.45, 8)),
  hit('sfx/absorb-whoosh.wav', 'assemble', ASSEMBLE.mergeEnd - 25, 0.4, 30),
  // 2 · Context window
  bed('sfx/pour.wav', 'window', WINDOW.fillStart, WINDOW.fillEnd - WINDOW.fillStart, 0.45),
  bed('sfx/tick-up.wav', 'window', WINDOW.fillStart, WINDOW.fillEnd - WINDOW.fillStart, 0.3),
  hit('sfx/rating-ding.wav', 'window', WINDOW.tokensPulse, 0.4),
  bed('sfx/data-pulse.wav', 'window', WINDOW.reasoning, 30, 0.3),
  bed('sfx/rapid-typing.wav', 'window', WINDOW.reasoningEnd, WINDOW.outputEnd - WINDOW.reasoningEnd, 0.3),
  hit('sfx/chime.wav', 'window', WINDOW.remaining, 0.3, 45),
  bed('sfx/drain.wav', 'window', WINDOW.drain - 4, 30, 0.25),
  // 3 · One token at a time
  ...TOKEN_LANDS.map((l) => hit('sfx/pop.wav', 'tokens', l - 2, 0.35, 8)),
  bed('sfx/data-pulse.wav', 'tokens', TOKENS.focus, 45, 0.3),
  hit('sfx/rating-ding.wav', 'tokens', TOKENS.select, 0.45),
  hit('sfx/absorb-whoosh.wav', 'tokens', TOKENS.flyEnd - 22, 0.3, 25),
  hit('sfx/lock-click.wav', 'tokens', TOKENS.end, 0.45, 15),
  ...TOKENS.sydneyPulses.map((p) => hit('sfx/error-buzzer.wav', 'tokens', p, 0.12, 20)),
  // 4 · Same prompt, different answers
  ...SETTINGS.phases.flatMap((p, i) => [
    bed('sfx/rapid-typing.wav', 'settings', p.type[0][0], p.type[2][1] - p.type[0][0], 0.35),
    ...p.marks.map((m, lane) =>
      i === 2 && lane === 2 ? hit('sfx/error-buzzer.wav', 'settings', m, 0.25, 30) : hit('sfx/rating-ding.wav', 'settings', m, 0.25),
    ),
  ]),
  ...SETTINGS.knobMoves.map(([a, b]) => bed('sfx/tick-up.wav', 'settings', a, b - a, 0.3)),
  hit('sfx/shield-hit.wav', 'settings', SETTINGS.stamp, 0.45, 25),
  // 5 · Lost in the middle
  bed('sfx/space-hum.wav', 'middle', 0, 160, 0.2),
  bed('sfx/data-pulse.wav', 'middle', MIDDLE.attention[0], 45, 0.25),
  hit('sfx/absorb-whoosh.wav', 'middle', MIDDLE.question[1] - 25, 0.35, 30),
  bed('sfx/rapid-typing.wav', 'middle', MIDDLE.answer[0], MIDDLE.answer[1] - MIDDLE.answer[0], 0.3),
  hit('sfx/error-buzzer.wav', 'middle', MIDDLE.missed, 0.25, 30),
  // 6 · Compaction
  ...TURN_LANDS.map((l) => hit('sfx/pop.wav', 'compaction', l - 2, 0.25, 8)),
  hit('sfx/error-buzzer.wav', 'compaction', TURN_LANDS[9] - 6, 0.22, 30),
  hit('sfx/power-up.wav', 'compaction', COMPACT.appIn - 4, 0.3, 40),
  hit('sfx/squeeze.wav', 'compaction', COMPACT.squeeze[0], 0.5, 42),
  hit('sfx/pop.wav', 'compaction', COMPACT.card, 0.45, 8),
  hit('sfx/rating-ding.wav', 'compaction', COMPACT.cardLand[1], 0.35),
  ...COMPACT.leaks.map((l) => hit('sfx/slice.wav', 'compaction', l + 18, 0.15, 15)),
  // 7 · Stopping
  bed('sfx/rapid-typing.wav', 'stopping', STOPPING.laneA[0], STOPPING.laneB[1] - STOPPING.laneA[0], 0.35),
  hit('sfx/pop.wav', 'stopping', STOPPING.endChip, 0.45, 8),
  hit('sfx/cut-off.wav', 'stopping', STOPPING.wallHit, 0.7, 18),
  hit('sfx/error-buzzer.wav', 'stopping', STOPPING.incomplete[0], 0.2, 30),
  hit('sfx/rating-ding.wav', 'stopping', STOPPING.tagA, 0.35),
  hit('sfx/error-buzzer.wav', 'stopping', STOPPING.tagB, 0.15, 25),
  // 8 · Context is temporary
  hit('sfx/lock-click.wav', 'temporary', TEMPORARY.close, 0.5, 15),
  bed('sfx/drain.wav', 'temporary', TEMPORARY.drain[0], 72, 0.45),
  hit('sfx/freeze.wav', 'temporary', TEMPORARY.pushIn + 6, 0.4, 40),
  hit('sfx/pop.wav', 'temporary', TEMPORARY.saved[1] - 6, 0.4, 8),
  hit('sfx/chime.wav', 'temporary', TEMPORARY.titleIn, 0.45, 45),
  bed('sfx/rapid-typing.wav', 'temporary', TEMPORARY.prompt[0] + 8, TEMPORARY.prompt[1] - TEMPORARY.prompt[0] - 8, 0.3),
  bed('sfx/synth-swell.wav', 'temporary', SCENES.temporary.durationInFrames - 80, 80, 0.4),
];

export const SoundTrack: React.FC<{sfx: boolean; voiceover: boolean}> = ({sfx, voiceover}) => (
  <Mixer sfx={sfx ? SFX : []} voiceover={voiceover ? VOICEOVER : []} />
);
