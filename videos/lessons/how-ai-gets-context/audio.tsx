import React from 'react';
import {Cue, cueHelpers, Mixer} from '../../shared/audio';
import {ASK, CITATIONS, ENGINEERING, MEMORY, PREPARE, PROMPT_BEATS, SceneKey, SCENES, SPECIFIC, WEIGHTS} from './timing';

const {hit, bed} = cueHelpers(SCENES);

// One narration slot per scene; files live in public/vo/how-ai-gets-context (see BLUEPRINT.md for the lines).
const VO_FILES: [SceneKey, string][] = [
  ['weights', '01-weights'],
  ['prompt', '02-prompt'],
  ['specific', '03-specific'],
  ['engineering', '04-engineering'],
  ['prepare', '05-prepare'],
  ['ask', '06-ask'],
  ['citations', '07-citations'],
  ['memory', '08-memory'],
];
export const VOICEOVER: Cue[] = VO_FILES.map(([scene, name]) => ({
  src: `vo/how-ai-gets-context/${name}.wav`,
  from: SCENES[scene].from,
  durationInFrames: SCENES[scene].durationInFrames,
  volume: 1,
}));

const KEPT = 5; // cards that pass through the gate in Scene 4
const CHUNKS = 12; // chunks filed into the index in Scene 5

// Absolute frames, derived from the same beats the visuals use. Files live in public/sfx.
export const SFX: Cue[] = [
  // 1 · Beyond the weights
  hit('sfx/pop.wav', 'weights', WEIGHTS.cubeIn, 0.4, 8),
  hit('sfx/freeze.wav', 'weights', WEIGHTS.frozen[0], 0.4, 40),
  ...WEIGHTS.cards.map((c) => hit('sfx/absorb-whoosh.wav', 'weights', c - WEIGHTS.flight, 0.25, 18)),
  ...WEIGHTS.cards.map((c) => hit('sfx/shield-hit.wav', 'weights', c, 0.4, 25)),
  bed('sfx/pour.wav', 'weights', WEIGHTS.intoTank[0], WEIGHTS.intoTank[1] - WEIGHTS.intoTank[0] + 10, 0.4),
  hit('sfx/chime.wav', 'weights', WEIGHTS.intoTank[1], 0.3, 45),
  // 2 · The prompt
  hit('sfx/pop.wav', 'prompt', PROMPT_BEATS.bar[0], 0.4, 8),
  bed('sfx/rapid-typing.wav', 'prompt', PROMPT_BEATS.bar[0] + 6, PROMPT_BEATS.bar[1] - PROMPT_BEATS.bar[0] - 6, 0.35),
  hit('sfx/absorb-whoosh.wav', 'prompt', PROMPT_BEATS.grow[0], 0.3, 30),
  ...PROMPT_BEATS.modules.map((m) => hit('sfx/pop.wav', 'prompt', m, 0.4, 8)),
  // 3 · Vague vs specific
  bed('sfx/data-pulse.wav', 'specific', SPECIFIC.fork[0], 30, 0.25),
  bed('sfx/rapid-typing.wav', 'specific', SPECIFIC.vague[0], SPECIFIC.vague[1] - SPECIFIC.vague[0], 0.3),
  bed('sfx/rapid-typing.wav', 'specific', SPECIFIC.specific[0], SPECIFIC.specific[1] - SPECIFIC.specific[0], 0.3),
  bed('sfx/tick-up.wav', 'specific', SPECIFIC.results[0], SPECIFIC.results[1] - SPECIFIC.results[0], 0.25),
  hit('sfx/rating-ding.wav', 'specific', SPECIFIC.review, 0.4),
  hit('sfx/error-buzzer.wav', 'specific', SPECIFIC.check, 0.15, 25),
  // 4 · Context engineering
  hit('sfx/power-up.wav', 'engineering', ENGINEERING.appIn - 4, 0.3, 40),
  ...Array.from({length: KEPT}, (_, i) => hit('sfx/pop.wav', 'engineering', ENGINEERING.select + i * ENGINEERING.selectStep, 0.3, 8)),
  hit('sfx/absorb-whoosh.wav', 'engineering', ENGINEERING.order, 0.25, 20),
  bed('sfx/pour.wav', 'engineering', ENGINEERING.fit, KEPT * ENGINEERING.fitStep + ENGINEERING.fitTravel, 0.4),
  hit('sfx/shield-hit.wav', 'engineering', ENGINEERING.outdated, 0.35, 25),
  hit('sfx/shield-hit.wav', 'engineering', ENGINEERING.conflicting, 0.35, 25),
  // 5 · Retrieval: prepare
  bed('sfx/tick-up.wav', 'prepare', PREPARE.stack[0], PREPARE.stack[1] - PREPARE.stack[0], 0.25),
  hit('sfx/pop.wav', 'prepare', PREPARE.newDoc, 0.35, 8),
  ...[0, 1, 2].map((d) => hit('sfx/slice.wav', 'prepare', PREPARE.split[0] + 22 + d * 8, 0.3, 15)),
  ...Array.from({length: CHUNKS}, (_, n) => hit('sfx/pop.wav', 'prepare', Math.round(PREPARE.tags[0] + n * 3.5), 0.15, 8)),
  ...Array.from({length: CHUNKS}, (_, n) => hit('sfx/file.wav', 'prepare', PREPARE.file + n * PREPARE.fileStep + PREPARE.fileTravel - 6, 0.3, 10)),
  // 6 · Retrieval: ask
  bed('sfx/rapid-typing.wav', 'ask', ASK.bar[0] + 4, ASK.bar[1] - ASK.bar[0] - 4, 0.35),
  hit('sfx/scan.wav', 'ask', ASK.scan[0] - 2, 0.45, 34),
  bed('sfx/tick-up.wav', 'ask', ASK.sort[0], ASK.sort[1] - ASK.sort[0], 0.3),
  hit('sfx/lock-click.wav', 'ask', ASK.cut, 0.35, 15),
  bed('sfx/pour.wav', 'ask', ASK.intoTank[0], ASK.intoTank[1] - ASK.intoTank[0], 0.4),
  hit('sfx/rating-ding.wav', 'ask', ASK.sources, 0.3),
  // 7 · Check the source
  bed('sfx/rapid-typing.wav', 'citations', CITATIONS.answer[0], CITATIONS.answer[1] - CITATIONS.answer[0], 0.3),
  bed('sfx/data-pulse.wav', 'citations', CITATIONS.threads[0], 40, 0.3),
  hit('sfx/rating-ding.wav', 'citations', CITATIONS.supported[0], 0.35),
  hit('sfx/rating-ding.wav', 'citations', CITATIONS.supported[0] + 12, 0.35),
  hit('sfx/error-buzzer.wav', 'citations', CITATIONS.unsupported, 0.25, 30),
  // 8 · Memory
  hit('sfx/pop.wav', 'memory', MEMORY.pill[0], 0.4, 8),
  hit('sfx/absorb-whoosh.wav', 'memory', MEMORY.propose[0], 0.25, 25),
  hit('sfx/power-up.wav', 'memory', MEMORY.appIn - 4, 0.3, 40),
  hit('sfx/lock-click.wav', 'memory', MEMORY.check[0], 0.4, 15),
  hit('sfx/file.wav', 'memory', MEMORY.file[1] - 8, 0.45, 10),
  hit('sfx/absorb-whoosh.wav', 'memory', MEMORY.later[0], 0.35, 25),
  bed('sfx/rapid-typing.wav', 'memory', MEMORY.bar[0] + 4, MEMORY.bar[1] - MEMORY.bar[0] - 4, 0.3),
  hit('sfx/file.wav', 'memory', MEMORY.retrieve[0] + 4, 0.4, 10),
  hit('sfx/pop.wav', 'memory', MEMORY.fly[1] - 2, 0.4, 8),
  bed('sfx/rapid-typing.wav', 'memory', MEMORY.response[0] + 4, MEMORY.response[1] - MEMORY.response[0] - 4, 0.3),
  hit('sfx/rating-ding.wav', 'memory', MEMORY.used, 0.35),
  hit('sfx/error-buzzer.wav', 'memory', MEMORY.ignored[0], 0.15, 25),
  ...[0, 1, 2, 3].map((i) => hit('sfx/pop.wav', 'memory', MEMORY.pathways + 20 + i * MEMORY.pathwayStep, 0.35, 8)),
  bed('sfx/synth-swell.wav', 'memory', MEMORY.pathways, SCENES.memory.durationInFrames - MEMORY.pathways, 0.4),
  hit('sfx/chime.wav', 'memory', MEMORY.titleIn, 0.45, 36),
];

export const SoundTrack: React.FC<{sfx: boolean; voiceover: boolean}> = ({sfx, voiceover}) => (
  <Mixer sfx={sfx ? SFX : []} voiceover={voiceover ? VOICEOVER : []} />
);
