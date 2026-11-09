import React from 'react';

// 64x64 stroke glyphs. They inherit stroke colour from the parent <g> and use
// non-scaling strokes so line weight stays constant at every icon size.
const S = {vectorEffect: 'non-scaling-stroke' as const};

export const DocGlyph: React.FC = () => (
  <>
    <path {...S} d="M16 6h22l12 12v40H16z" />
    <path {...S} d="M38 6v12h12" />
    <path {...S} d="M23 30h20M23 39h20M23 48h13" />
  </>
);

export const ImageGlyph: React.FC = () => (
  <>
    <rect {...S} x={8} y={12} width={48} height={40} rx={4} />
    <circle {...S} cx={22} cy={25} r={5} />
    <polyline {...S} points="8,46 24,32 36,42 44,34 56,46" />
  </>
);

export const AudioGlyph: React.FC = () => (
  <path {...S} d="M12 28v8M20 20v24M28 12v40M36 22v20M44 16v32M52 26v12" />
);

export const CodeGlyph: React.FC = () => (
  <>
    <polyline {...S} points="22,18 8,32 22,46" />
    <polyline {...S} points="42,18 56,32 42,46" />
    <path {...S} d="M36 12L28 52" />
  </>
);

export const GLYPHS: React.FC[] = [DocGlyph, ImageGlyph, AudioGlyph, CodeGlyph];
