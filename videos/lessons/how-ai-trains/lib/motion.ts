import {spring} from 'remotion';
import {lerp} from '../../../shared/lib/math';

export {clampOpts, flashAt, presence} from '../../../shared/lib/motion';

// Where the model cube rests between post-training scenes, so it never jumps at a cut.
export const CUBE_HOME = {x: 960, y: 500, size: 100};
export type CubePose = {x: number; y: number; size: number};

// Glide from `from` to the scene's pose at the start, and (optionally) back home before the scene ends.
export const cubePose = (
  frame: number,
  fps: number,
  duration: number,
  target: CubePose,
  {from = CUBE_HOME, returnHome = true, homeFrames = 20}: {from?: CubePose; returnHome?: boolean; homeFrames?: number} = {},
): CubePose => {
  const go = spring({frame, fps, config: {damping: 200}, durationInFrames: 20});
  const back = returnHome ? spring({frame: frame - (duration - homeFrames), fps, config: {damping: 200}, durationInFrames: homeFrames}) : 0;
  const end = returnHome ? CUBE_HOME : target;
  const mid = {x: lerp(from.x, target.x, go), y: lerp(from.y, target.y, go), size: lerp(from.size, target.size, go)};
  return {x: lerp(mid.x, end.x, back), y: lerp(mid.y, end.y, back), size: lerp(mid.size, end.size, back)};
};
