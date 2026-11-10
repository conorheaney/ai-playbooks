import React from 'react';
import {FONT} from '../../../shared/fonts';
import {COLORS, rgba} from '../../../shared/theme';

// Ticket out, receipt back: a tool request and an observed result are different kinds of paper.

type PaperProps = {
  x: number;
  y: number;
  w?: number;
  opacity?: number;
  scale?: number;
  print?: number; // 0..1: how much has printed, top down
  glow?: number;
  color?: string;
};

// The model's tool request: perforated left edge, the tool's name and its inputs.
export const ToolTicket: React.FC<
  PaperProps & {
    name: string;
    inputs: React.ReactNode[];
    nameOn?: number; // opacity of the name row
    inputsOn?: number[]; // opacity of each input row
    nameColor?: string;
    header?: string;
    dashed?: boolean;
  }
> = ({x, y, w = 340, opacity = 1, scale = 1, print = 1, glow = 0, color = COLORS.cyan, name, inputs, nameOn = 1, inputsOn, nameColor, header = 'TOOL REQUEST', dashed = false}) => {
  if (opacity <= 0.001 || print <= 0.001) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        boxSizing: 'border-box',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        clipPath: `inset(-40px -40px ${(1 - print) * 100}% -40px)`,
        padding: '14px 20px 16px 42px',
        borderRadius: 14,
        border: `2px ${dashed ? 'dashed' : 'solid'} ${color}`,
        background: rgba(COLORS.charcoal, 0.96),
        boxShadow: glow > 0 ? `0 0 ${34 * glow}px ${rgba(color, 0.5 * glow)}` : undefined,
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      {/* Perforation. */}
      <div style={{position: 'absolute', left: 20, top: 10, bottom: 10, borderLeft: `3px dotted ${rgba(color, 0.7)}`}} />
      <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: rgba(color, 0.85), whiteSpace: 'nowrap'}}>{header}</div>
      <div style={{fontSize: 28, fontWeight: 700, color: nameColor ?? color, marginTop: 6, opacity: nameOn, whiteSpace: 'nowrap'}}>{name}</div>
      {inputs.map((input, i) => (
        <div key={i} style={{fontSize: 24, fontWeight: 500, lineHeight: 1.35, marginTop: i === 0 ? 4 : 0, opacity: inputsOn ? inputsOn[i] ?? 0 : 1, whiteSpace: 'nowrap'}}>
          {input}
        </div>
      ))}
    </div>
  );
};

const TEETH = 14;
const zigzag = (depth: number) => {
  const pts = ['0 0', '100% 0'];
  for (let i = 0; i <= TEETH * 2; i++) {
    const px = 100 - (i * 100) / (TEETH * 2);
    pts.push(`${px}% ${i % 2 === 0 ? `calc(100% - ${depth}px)` : '100%'}`);
  }
  return `polygon(${pts.join(', ')})`;
};

// The observed result: zigzag bottom edge and a barcode strip.
export const ToolReceipt: React.FC<PaperProps & {rows: React.ReactNode[]; header?: string}> = ({x, y, w = 340, opacity = 1, scale = 1, print = 1, glow = 0, color = COLORS.cyan, rows, header = 'RESULT'}) => {
  if (opacity <= 0.001 || print <= 0.001) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        filter: glow > 0 ? `drop-shadow(0 0 ${18 * glow}px ${rgba(color, 0.6 * glow)})` : undefined,
      }}
    >
      <div
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          clipPath: print < 1 ? `inset(0 0 ${(1 - print) * 100}% 0)` : undefined,
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            padding: '14px 20px 26px 46px',
            background: `linear-gradient(${rgba(color, 0.14)}, ${rgba(color, 0.14)}), ${COLORS.charcoal}`,
            borderTop: `3px solid ${color}`,
            clipPath: zigzag(12),
            fontFamily: FONT,
            color: COLORS.white,
          }}
        >
          {/* Barcode strip. */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 14,
              bottom: 26,
              width: 18,
              background: `repeating-linear-gradient(180deg, ${rgba(color, 0.8)} 0 3px, transparent 3px 6px, ${rgba(color, 0.8)} 6px 7px, transparent 7px 11px)`,
            }}
          />
          <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color, whiteSpace: 'nowrap'}}>{header}</div>
          {rows.map((r, i) => (
            <div key={i} style={{fontSize: 24, fontWeight: 500, lineHeight: 1.35, marginTop: i === 0 ? 4 : 0, whiteSpace: 'nowrap'}}>
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Small text-free glyphs of the same papers, for diagrams (SVG, centred on x, y).
export const TicketGlyph: React.FC<{x: number; y: number; w?: number; h?: number; opacity?: number; color?: string}> = ({x, y, w = 64, h = 42, opacity = 1, color = COLORS.cyan}) =>
  opacity > 0.001 ? (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={7} fill={COLORS.charcoal} stroke={color} strokeWidth={3} />
      <line x1={-w / 2 + 12} x2={-w / 2 + 12} y1={-h / 2 + 7} y2={h / 2 - 7} stroke={color} strokeWidth={3} strokeDasharray="2 5" strokeLinecap="round" />
      <line x1={-w / 2 + 22} x2={w / 2 - 10} y1={-4} y2={-4} stroke={rgba(color, 0.7)} strokeWidth={4} strokeLinecap="round" />
      <line x1={-w / 2 + 22} x2={w / 2 - 22} y1={7} y2={7} stroke={rgba(color, 0.5)} strokeWidth={4} strokeLinecap="round" />
    </g>
  ) : null;

export const ReceiptGlyph: React.FC<{x: number; y: number; w?: number; h?: number; opacity?: number; color?: string}> = ({x, y, w = 56, h = 46, opacity = 1, color = COLORS.cyan}) => {
  if (opacity <= 0.001) {
    return null;
  }
  const teeth = 6;
  const l = -w / 2;
  const t = -h / 2;
  let d = `M${l} ${t}H${l + w}V${t + h - 6}`;
  for (let i = 1; i <= teeth * 2; i++) {
    d += `L${l + w - (i * w) / (teeth * 2)} ${t + h - (i % 2 === 1 ? 0 : 6)}`;
  }
  d += 'Z';
  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      <path d={d} fill={`${rgba(color, 0.2)}`} stroke={color} strokeWidth={3} strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={l + 10 + i * 4 + (i > 2 ? 3 : 0)} x2={l + 10 + i * 4 + (i > 2 ? 3 : 0)} y1={t + 9} y2={t + h - 14} stroke={color} strokeWidth={i % 2 === 0 ? 2.5 : 1.5} />
      ))}
      <line x1={l + 34} x2={l + w - 8} y1={t + 14} y2={t + 14} stroke={rgba(color, 0.7)} strokeWidth={4} strokeLinecap="round" />
      <line x1={l + 34} x2={l + w - 12} y1={t + 26} y2={t + 26} stroke={rgba(color, 0.5)} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};
