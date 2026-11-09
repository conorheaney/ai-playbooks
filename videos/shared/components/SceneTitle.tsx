import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../fonts';
import {COLORS, rgba, VIDEO} from '../theme';

export const HERO_SIZE = 140;
// Series rule: corner titles are small (about 34px) and settle to half opacity so the main content leads.
export const CORNER_SCALE = 0.24;
export const REST_OPACITY = 0.5;
export const CORNER = {x: 96, y: 72};

export const heroToCorner = (frame: number, fps: number, holdFrames: number) =>
  spring({frame: frame - holdFrames, fps, config: {damping: 200}, durationInFrames: 30});

type SceneTitleProps = {
  text: string;
  // hero: enters massive and centred, then glides to the top-left slot.
  // corner: slides straight into the top-left slot.
  mode: 'hero' | 'corner';
  holdFrames?: number;
  cornerScale?: number; // size in the corner, as a fraction of the hero size
  rest?: number; // opacity the title settles to once it has landed, so it stays out of the way
};

const SETTLE_DELAY = 15;
const SETTLE_FRAMES = 20;

export const SceneTitle: React.FC<SceneTitleProps> = ({text, mode, holdFrames = 40, cornerScale = CORNER_SCALE, rest = REST_OPACITY}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});
  const p = mode === 'hero' ? heroToCorner(frame, fps, holdFrames) : 1;

  const enterScale = mode === 'hero' ? interpolate(enter, [0, 1], [0.86, 1]) : 1;
  const scale = interpolate(p, [0, 1], [1, cornerScale]) * enterScale;
  // Hero titles settle after their glide to the corner; corner titles shortly after they slide in.
  const landed = (mode === 'hero' ? holdFrames + 30 : 18) + SETTLE_DELAY;
  const settle = interpolate(frame, [landed, landed + SETTLE_FRAMES], [1, rest], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const left = interpolate(p, [0, 1], [VIDEO.width / 2, CORNER.x]) + (mode === 'corner' ? (1 - enter) * -48 : 0);
  const top = interpolate(p, [0, 1], [VIDEO.height / 2, CORNER.y]);
  // With transform-origin 0 0, translating by -50% * scale puts the box's exact centre on (left, top).
  const shift = -50 * scale * (1 - p);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transformOrigin: '0 0',
        transform: `translate(${shift}%, ${shift}%) scale(${scale})`,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: HERO_SIZE,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: COLORS.white,
        whiteSpace: 'nowrap',
        opacity: enter * settle,
        textShadow: `0 0 32px ${rgba(COLORS.cyan, 0.35)}`,
      }}
    >
      {text}
    </div>
  );
};
