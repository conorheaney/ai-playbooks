import React from 'react';
import {Composition} from 'remotion';
import {VIDEO} from '../../shared/theme';
import {AIContextVideo} from './AIContextVideo';
import {TOTAL_FRAMES} from './timing';

// Authored in a 1920x1080 coordinate space. Everything is SVG / live text,
// so `--scale=2` renders a pixel-perfect 3840x2160 master.
export const HowAIGetsContext: React.FC = () => (
  <Composition
    id="HowAIGetsContext"
    component={AIContextVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
    defaultProps={{sfx: true, voiceover: true, center: true}}
  />
);
