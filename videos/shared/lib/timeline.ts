export type Slot = {from: number; durationInFrames: number};
export type SceneTimeline<K extends string> = Record<K, Slot>;

// Lays scenes end to end: each one starts where the previous one ends.
export const buildTimeline = <K extends string>(durations: Record<K, number>): SceneTimeline<K> => {
  let from = 0;
  const timeline = {} as SceneTimeline<K>;
  for (const key of Object.keys(durations) as K[]) {
    timeline[key] = {from, durationInFrames: durations[key]};
    from += durations[key];
  }
  return timeline;
};

export const timelineLength = <K extends string>(timeline: SceneTimeline<K>) =>
  Math.max(...(Object.values(timeline) as Slot[]).map((s) => s.from + s.durationInFrames));
