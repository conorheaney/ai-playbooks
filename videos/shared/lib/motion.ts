import {interpolate} from 'remotion';

export const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Quick 0 -> 1 -> 0 pulse starting at `at`.
export const flashAt = (frame: number, at: number, length = 18) =>
  interpolate(frame, [at, at + 4, at + length], [0, 1, 0], clampOpts);

// 0 -> 1 over the first `inFrames`, 1 -> 0 over the last `outFrames` before `end`.
export const presence = (frame: number, start: number, end: number, inFrames = 10, outFrames = 12) =>
  interpolate(frame, [start, start + inFrames, end - outFrames, end], [0, 1, 1, 0], clampOpts);
