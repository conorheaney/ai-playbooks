import React from 'react';
import {getStaticFiles} from '@remotion/studio';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {SceneTimeline} from './lib/timeline';

// accent: short hits that should still cut through narration; everything else is a bed.
export type Cue = {src: string; from: number; durationInFrames: number; volume: number; accent?: boolean};

// Cue builders bound to one lesson's scene timeline: `at` turns (scene, local frame) into an absolute frame.
export const cueHelpers = <K extends string>(scenes: SceneTimeline<K>) => {
  const at = (scene: K, frame: number) => scenes[scene].from + frame;
  const hit = (src: string, scene: K, frame: number, volume = 0.5, durationInFrames = 20): Cue => ({
    src,
    from: at(scene, frame),
    durationInFrames,
    volume,
    accent: true,
  });
  const bed = (src: string, scene: K, frame: number, durationInFrames: number, volume = 0.35): Cue => ({
    src,
    from: at(scene, frame),
    durationInFrames,
    volume,
  });
  return {at, hit, bed};
};

// VO lines are scheduled only once their file exists in public/vo, so they can be recorded one at a time.
const recordedVoiceover = (voiceover: Cue[]) => {
  const present = new Set(getStaticFiles().map((f) => f.name.split('\\').join('/')));
  return voiceover.filter((cue) => present.has(cue.src));
};

// Ducking: SFX drop under narration so speech stays on top (beds about -11 dB, accents about -6 dB).
const BED_DUCK = 0.28;
const ACCENT_DUCK = 0.5;
const DUCK_RAMP = 6;

const duckGain = (frame: number, narration: Cue[], duck: number) =>
  narration.reduce((gain, vo) => {
    const end = vo.from + vo.durationInFrames;
    const under = interpolate(frame, [vo.from - DUCK_RAMP, vo.from, end, end + DUCK_RAMP], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return Math.min(gain, 1 - (1 - duck) * under);
  }, 1);

const Clip: React.FC<{cue: Cue; volume: number | ((frame: number) => number)}> = ({cue, volume}) => (
  <Sequence name={cue.src} from={cue.from} durationInFrames={cue.durationInFrames} layout="none">
    <Audio src={staticFile(cue.src)} volume={volume} />
  </Sequence>
);

// Plays narration on top and ducks every SFX cue under it.
export const Mixer: React.FC<{sfx: Cue[]; voiceover: Cue[]}> = ({sfx, voiceover}) => {
  const narration = recordedVoiceover(voiceover);
  return (
    <>
      {narration.map((cue) => (
        <Clip key={cue.src} cue={cue} volume={cue.volume} />
      ))}
      {sfx.map((cue, i) => (
        <Clip
          key={`${cue.src}-${i}`}
          cue={cue}
          // Audio passes frames relative to the clip's own start.
          volume={(f) => cue.volume * duckGain(cue.from + f, narration, cue.accent ? ACCENT_DUCK : BED_DUCK)}
        />
      ))}
    </>
  );
};
