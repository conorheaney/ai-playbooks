import React from 'react';
import {Composition} from 'remotion';
import {VIDEO} from '../../shared/theme';
import {TakesActionVideo} from './TakesActionVideo';
import {TOTAL_FRAMES} from './timing';

// Authored in a 1920x1080 coordinate space. Everything is SVG / live text,
// so `--scale=2` renders a pixel-perfect 3840x2160 master.
export const HowAITakesAction: React.FC = () => (
  <Composition
    id="HowAITakesAction"
    component={TakesActionVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
    defaultProps={{sfx: true, voiceover: true, center: true}}
  />
);
