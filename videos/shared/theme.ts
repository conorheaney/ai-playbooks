export const COLORS = {
  charcoal: '#121212',
  cyan: '#00F0FF',
  purple: '#9D4EDD',
  white: '#FFFFFF',
  // Accent for wrong answers, rejected or cut-off output, and warnings.
  error: '#FF3B6B',
} as const;

export const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

export const VIDEO = {width: 1920, height: 1080, fps: 30} as const;

export const CENTER = {x: VIDEO.width / 2, y: VIDEO.height / 2} as const;
