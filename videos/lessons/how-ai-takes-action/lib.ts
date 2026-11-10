import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clampOpts} from '../../shared/lib/motion';
import {SceneKey, SCENES} from './timing';

const EASE = {...clampOpts, easing: Easing.inOut(Easing.cubic)};

// Per-scene animation helpers, all in scene-local frames.
export const useBeats = (scene: SceneKey) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {
    frame,
    abs: SCENES[scene].from + frame,
    dur: SCENES[scene].durationInFrames,
    // Critically damped spring, 0 -> 1.
    smooth: (start: number, duration = 15) => spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: duration}),
    // Bouncy pop, 0 -> 1 with a little overshoot.
    pop: (start: number) => spring({frame: frame - start, fps, config: {damping: 12, stiffness: 180}}),
    // Eased 0 -> 1 between two frames.
    ramp: (from: number, to: number) => interpolate(frame, [from, to], [0, 1], EASE),
    // Linear 0 -> 1 between two frames.
    lin: (from: number, to: number) => interpolate(frame, [from, to], [0, 1], clampOpts),
    // 1 -> 0 between two frames.
    fadeOut: (from: number, to: number) => interpolate(frame, [from, to], [1, 0], clampOpts),
  };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// A point on a circle; angles in degrees, 0 = right, 90 = down (clockwise on screen).
export const onCircle = (cx: number, cy: number, r: number, deg: number) => ({
  x: cx + r * Math.cos((deg * Math.PI) / 180),
  y: cy + r * Math.sin((deg * Math.PI) / 180),
});

// A point along a quadratic curve.
export const onQuad = (a: {x: number; y: number}, c: {x: number; y: number}, b: {x: number; y: number}, t: number) => ({
  x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
  y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});
