import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';

// How far the Stage is currently shifted, so Pinned children can cancel it.
const ShiftContext = createContext(0);

// Shifts all of a video's content horizontally, to keep the main content centred on screen.
// The shift comes from the lesson's measured centring track (see scripts/measure-centering.mjs).
export const Stage: React.FC<{x: number; children: React.ReactNode}> = ({x, children}) => (
  <ShiftContext.Provider value={x}>
    <AbsoluteFill style={{transform: `translateX(${x}px)`}}>{children}</AbsoluteFill>
  </ShiftContext.Provider>
);

// Cancels the Stage shift: for screen chrome (corner title, status badges, counters), full-frame
// overlays, and anything that must stay at true screen centre (finale titles, closing prompt bars).
export const Pinned: React.FC<{children: React.ReactNode}> = ({children}) => {
  const x = useContext(ShiftContext);
  return <AbsoluteFill style={{transform: `translateX(${-x}px)`}}>{children}</AbsoluteFill>;
};

// The shift for a frame from a per-frame track; empty or short tracks fall back to no shift.
export const trackAt = (track: readonly number[], frame: number) =>
  track.length === 0 ? 0 : track[Math.max(0, Math.min(track.length - 1, Math.round(frame)))];
