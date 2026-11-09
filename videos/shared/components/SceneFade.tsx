import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

type SceneFadeProps = {
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
};

export const SceneFade: React.FC<SceneFadeProps> = ({durationInFrames, fadeIn = 8, fadeOut = 12, children}) => {
  const frame = useCurrentFrame();
  const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const inOpacity = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], opts) : 1;
  const outOpacity =
    fadeOut > 0 ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], opts) : 1;
  return <AbsoluteFill style={{opacity: Math.min(inOpacity, outOpacity)}}>{children}</AbsoluteFill>;
};
