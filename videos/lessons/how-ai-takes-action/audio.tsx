import React from 'react';
import {Cue, cueHelpers, Mixer} from '../../shared/audio';
import {BOUNDS, CONTEXT, DELEGATE, FAILURE, FLOW, HARNESS, LOOP, SceneKey, SCENES, TOOLS, WORDS} from './timing';

const {hit, bed} = cueHelpers(SCENES);

// One narration slot per scene; files live in public/vo/how-ai-takes-action (see BLUEPRINT.md for the lines).
const VO_FILES: [SceneKey, string][] = [
  ['words', '01-words'],
  ['tools', '02-tools'],
  ['context', '03-context'],
  ['loop', '04-loop'],
  ['workflow', '05-workflow'],
  ['harness', '06-harness'],
  ['boundaries', '07-boundaries'],
  ['delegation', '08-delegation'],
  ['failure', '09-failure'],
];
export const VOICEOVER: Cue[] = VO_FILES.map(([scene, name]) => ({
  src: `vo/how-ai-takes-action/${name}.wav`,
  from: SCENES[scene].from,
  durationInFrames: SCENES[scene].durationInFrames,
  volume: 1,
}));

// Absolute frames, derived from the same beats the visuals use. Files live in public/sfx.
export const SFX: Cue[] = [
  // 1 · Words aren't actions
  hit('sfx/pop.wav', 'words', WORDS.cubeIn, 0.4, 8),
  bed('sfx/rapid-typing.wav', 'words', WORDS.bar[0] + 4, WORDS.bar[1] - WORDS.bar[0] - 4, 0.3),
  bed('sfx/rapid-typing.wav', 'words', WORDS.write[0], WORDS.write[1] - WORDS.write[0], 0.3),
  hit('sfx/pop.wav', 'words', WORDS.portal, 0.35, 8),
  hit('sfx/shield-hit.wav', 'words', WORDS.dissolve[1] - 2, 0.25, 25),
  bed('sfx/data-pulse.wav', 'words', WORDS.loop[0], 34, 0.25),
  ...WORDS.steps.map((s) => hit('sfx/pop.wav', 'words', s, 0.35, 8)),
  // 2 · Tool calling
  bed('sfx/data-pulse.wav', 'tools', TOOLS.wall[0], 32, 0.2),
  hit('sfx/power-up.wav', 'tools', TOOLS.app - 4, 0.25, 40),
  hit('sfx/pop.wav', 'tools', TOOLS.docks[0], 0.3, 8),
  hit('sfx/absorb-whoosh.wav', 'tools', TOOLS.list[0] - 10, 0.15, 30),
  hit('sfx/print.wav', 'tools', TOOLS.print[0] + 6, 0.45, 16),
  hit('sfx/pop.wav', 'tools', TOOLS.name, 0.35, 8),
  ...[0, 1, 2].map((i) => hit('sfx/pop.wav', 'tools', TOOLS.inputs + i * TOOLS.inputStep, 0.25, 8)),
  ...[0, 1, 2].map((i) => hit('sfx/lock-click.wav', 'tools', TOOLS.checks + i * TOOLS.checkStep, 0.35, 15)),
  hit('sfx/scan.wav', 'tools', TOOLS.run[1] - 8, 0.4, 34),
  hit('sfx/shield-hit.wav', 'tools', TOOLS.reach[0] + 12, 0.35, 25),
  // 3 · Back into context
  hit('sfx/print.wav', 'context', CONTEXT.receipt[0], 0.4, 16),
  hit('sfx/file.wav', 'context', CONTEXT.receipt[1] - 8, 0.3, 10),
  bed('sfx/pour.wav', 'context', CONTEXT.call2[0] + 10, 22, 0.35),
  hit('sfx/print.wav', 'context', CONTEXT.again[0] + 8, 0.4, 16),
  hit('sfx/absorb-whoosh.wav', 'context', CONTEXT.away[0] - 14, 0.2, 30),
  hit('sfx/file.wav', 'context', CONTEXT.back[1] - 8, 0.3, 10),
  bed('sfx/pour.wav', 'context', CONTEXT.call3[0] + 10, 22, 0.35),
  hit('sfx/rating-ding.wav', 'context', CONTEXT.answer, 0.3),
  hit('sfx/pop.wav', 'context', CONTEXT.another, 0.35, 8),
  // 4 · The agent loop
  bed('sfx/data-pulse.wav', 'loop', LOOP.ring[0], LOOP.ring[1] - LOOP.ring[0], 0.3),
  bed('sfx/data-rush.wav', 'loop', LOOP.recap[0], LOOP.recap[1] - LOOP.recap[0], 0.2),
  hit('sfx/error-buzzer.wav', 'loop', LOOP.strike, 0.12, 20),
  hit('sfx/print.wav', 'loop', LOOP.pick[0] + 6, 0.4, 16),
  hit('sfx/lock-click.wav', 'loop', LOOP.run[1] - 4, 0.35, 15),
  hit('sfx/pop.wav', 'loop', LOOP.see[0] + 8, 0.35, 8),
  hit('sfx/file.wav', 'loop', LOOP.repeat, 0.3, 10),
  hit('sfx/rating-ding.wav', 'loop', LOOP.done[1], 0.3),
  hit('sfx/pop.wav', 'loop', LOOP.help[1], 0.35, 8),
  // 5 · Workflow vs agent
  bed('sfx/data-pulse.wav', 'workflow', FLOW.blueprint[0], FLOW.blueprint[1] - FLOW.blueprint[0], 0.2),
  bed('sfx/data-rush.wav', 'workflow', FLOW.shuttle[0], FLOW.shuttle[1] - FLOW.shuttle[0], 0.25),
  ...FLOW.results.map((r) => hit('sfx/pop.wav', 'workflow', r, 0.3, 8)),
  hit('sfx/lock-click.wav', 'workflow', FLOW.bounded[0], 0.3, 15),
  bed('sfx/data-rush.wav', 'workflow', FLOW.run[0], FLOW.run[1] - FLOW.run[0], 0.25),
  // 6 · The harness
  hit('sfx/pop.wav', 'harness', HARNESS.gear, 0.35, 8),
  hit('sfx/power-up.wav', 'harness', HARNESS.bloom[0] - 6, 0.35, 45),
  ...HARNESS.modules.map((m) => hit('sfx/pop.wav', 'harness', m, 0.3, 8)),
  hit('sfx/lock-click.wav', 'harness', HARNESS.key, 0.4, 15),
  bed('sfx/tick-up.wav', 'harness', HARNESS.tape[0], HARNESS.tape[1] - HARNESS.tape[0] + 10, 0.2),
  // 7 · Boundaries
  hit('sfx/lock-click.wav', 'boundaries', BOUNDS.fence[1], 0.35, 15),
  ...BOUNDS.signs.map((s) => hit('sfx/pop.wav', 'boundaries', s, 0.35, 8)),
  hit('sfx/print.wav', 'boundaries', BOUNDS.ticket[0], 0.4, 16),
  hit('sfx/error-buzzer.wav', 'boundaries', BOUNDS.cross[0] + 6, 0.18, 25),
  hit('sfx/rewind.wav', 'boundaries', BOUNDS.rewind[0], 0.35, 18),
  hit('sfx/lock-click.wav', 'boundaries', BOUNDS.gate[0], 0.45, 15),
  hit('sfx/shield-hit.wav', 'boundaries', BOUNDS.gate[1], 0.3, 25),
  hit('sfx/pop.wav', 'boundaries', BOUNDS.confirm[0], 0.3, 8),
  hit('sfx/rating-ding.wav', 'boundaries', BOUNDS.approve, 0.3),
  hit('sfx/rating-ding.wav', 'boundaries', BOUNDS.booked, 0.4),
  // 8 · Delegation
  hit('sfx/slice.wav', 'delegation', DELEGATE.split[0], 0.3, 15),
  ...[0, 1, 2].map((i) => hit('sfx/pop.wav', 'delegation', DELEGATE.subagents + i * 4, 0.3, 8)),
  bed('sfx/pour.wav', 'delegation', DELEGATE.contexts[0], DELEGATE.contexts[1] - DELEGATE.contexts[0], 0.25),
  bed('sfx/data-rush.wav', 'delegation', DELEGATE.parallel[0], DELEGATE.parallel[1] - DELEGATE.parallel[0], 0.25),
  bed('sfx/tick-up.wav', 'delegation', DELEGATE.cost[0], DELEGATE.cost[1] - DELEGATE.cost[0], 0.25),
  bed('sfx/data-pulse.wav', 'delegation', DELEGATE.coordinate[0], 26, 0.25),
  hit('sfx/pop.wav', 'delegation', DELEGATE.coordinate[1] - 4, 0.35, 8),
  // 9 · When tools fail
  ...FAILURE.rows.map((r) => hit('sfx/error-buzzer.wav', 'failure', r, 0.1, 14)),
  bed('sfx/rapid-typing.wav', 'failure', FAILURE.report[0], FAILURE.report[1] - FAILURE.report[0], 0.3),
  hit('sfx/rating-ding.wav', 'failure', FAILURE.report[1] + 2, 0.35),
  hit('sfx/error-buzzer.wav', 'failure', FAILURE.hide, 0.18, 25),
  bed('sfx/synth-swell.wav', 'failure', FAILURE.diagram, SCENES.failure.durationInFrames - FAILURE.diagram, 0.4),
  hit('sfx/chime.wav', 'failure', FAILURE.titleIn, 0.45, 36),
];

export const SoundTrack: React.FC<{sfx: boolean; voiceover: boolean}> = ({sfx, voiceover}) => (
  <Mixer sfx={sfx ? SFX : []} voiceover={voiceover ? VOICEOVER : []} />
);
