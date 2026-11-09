import React from 'react';
import {VIDEO} from '../theme';

type GlowFilterProps = {
  id: string;
  blur?: number;
  // Canvas-sized filter region, for straight lines: a bounding-box region collapses to nothing on
  // perfectly vertical or horizontal lines (zero-width/height box). Only valid for elements drawn
  // in untransformed canvas coordinates, since the region is measured in the user's own space.
  canvas?: boolean;
};

// Vector glow: blurred copy merged under the source graphic. Stays sharp at any render scale.
export const GlowFilter: React.FC<GlowFilterProps> = ({id, blur = 6, canvas = false}) => (
  <filter
    id={id}
    {...(canvas
      ? {filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: VIDEO.width, height: VIDEO.height}
      : {x: '-50%', y: '-50%', width: '200%', height: '200%'})}
  >
    <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);
