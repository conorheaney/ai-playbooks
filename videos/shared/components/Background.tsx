import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, VIDEO} from '../theme';

const DOT_PITCH = 48;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.25) % DOT_PITCH;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.charcoal}}>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
        <defs>
          <pattern
            id="bg-dots"
            width={DOT_PITCH}
            height={DOT_PITCH}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(0 ${drift})`}
          >
            <circle cx={DOT_PITCH / 2} cy={DOT_PITCH / 2} r={1.5} fill={COLORS.white} fillOpacity={0.07} />
          </pattern>
          <radialGradient id="bg-vignette" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#000000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.65} />
          </radialGradient>
        </defs>
        <rect width={VIDEO.width} height={VIDEO.height} fill="url(#bg-dots)" />
        <rect width={VIDEO.width} height={VIDEO.height} fill="url(#bg-vignette)" />
      </svg>
    </AbsoluteFill>
  );
};
