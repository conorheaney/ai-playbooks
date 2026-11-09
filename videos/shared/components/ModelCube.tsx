import React from 'react';
import {interpolateColors} from 'remotion';
import {FONT} from '../fonts';
import {project, rotate, toPoints, Vec3} from '../lib/math';
import {COLORS, rgba} from '../theme';
import {GlowFilter} from './Glow';

const CAM_DISTANCE = 4.2;

// Unit cube: vertex i has x/y/z = +1 where bit 0/1/2 of i is set.
const VERTS: Vec3[] = Array.from({length: 8}, (_, i) => ({
  x: i & 1 ? 1 : -1,
  y: i & 2 ? 1 : -1,
  z: i & 4 ? 1 : -1,
}));
const FACES: {normal: Vec3; idx: [number, number, number, number]}[] = [
  {normal: {x: 1, y: 0, z: 0}, idx: [1, 3, 7, 5]},
  {normal: {x: -1, y: 0, z: 0}, idx: [0, 4, 6, 2]},
  {normal: {x: 0, y: 1, z: 0}, idx: [2, 6, 7, 3]},
  {normal: {x: 0, y: -1, z: 0}, idx: [0, 1, 5, 4]},
  {normal: {x: 0, y: 0, z: 1}, idx: [4, 5, 7, 6]},
  {normal: {x: 0, y: 0, z: -1}, idx: [0, 2, 3, 1]},
];

// Brain emblem, left hemisphere; the right one is its mirror.
const LOBE = 'M-8 -40C-26 -48 -46 -40 -48 -24C-60 -18 -62 2 -52 10C-58 24 -46 40 -30 38C-24 48 -10 48 -8 40';
const SULCI = 'M-30 -26C-22 -24 -20 -16 -24 -8M-44 14C-36 12 -30 18 -30 26';
const ICE = '#D8FDFF';

// Size at which the emblem and padlock are drawn 1:1.
const REFERENCE_SIZE = 130;

export type ModelCubeProps = {
  id: string; // unique prefix for this instance's filter ids
  absFrame: number;
  yaw: number; // camera yaw in radians; the lesson decides how the cube turns
  still?: number; // 0..1: 1 stops the idle float and wobble (frozen weights)
  x: number;
  y: number;
  size: number; // projection scale; 100 ≈ 350px tall on screen
  appear?: number; // 0..1 spring-in
  emblem?: number; // 0..1 "AI" badge: the model can hold a conversation
  glow?: number; // 0..1 face tint, e.g. while learning
  glowColor?: string;
  frost?: number; // 0..1 frozen look
  lock?: number; // 0..1 padlock drops on
};

export const ModelCube: React.FC<ModelCubeProps> = ({
  id,
  absFrame,
  yaw,
  still = 0,
  x,
  y,
  size,
  appear = 1,
  emblem = 0,
  glow = 0,
  glowColor = COLORS.cyan,
  frost = 0,
  lock = 0,
}) => {
  if (appear <= 0.001) {
    return null;
  }
  const float = Math.sin(absFrame / 25) * 6 * (1 - still);
  const cy = y + float;
  const cam = {
    yaw,
    pitch: -0.5 + 0.04 * Math.sin(absFrame / 30) * (1 - still),
    distance: CAM_DISTANCE,
    scale: size * appear,
    cx: x,
    cy,
  };
  const k = (size / REFERENCE_SIZE) * appear;
  const edge = interpolateColors(frost, [0, 1], [COLORS.cyan, ICE]);

  return (
    <g>
      <defs>
        <GlowFilter id={`${id}-glow`} blur={8} />
        <GlowFilter id={`${id}-soft`} blur={3} />
      </defs>

      {/* Back faces culled against the camera at z = -distance; a unit cube's face centre equals its normal. */}
      <g strokeLinejoin="round">
        {FACES.map((face, f) => {
          const n = rotate(face.normal, cam.yaw, cam.pitch);
          if (1 + n.z * CAM_DISTANCE >= 0) {
            return null;
          }
          const light = Math.min(1, 0.35 + 0.65 * Math.max(0, -n.z) + 0.3 * Math.max(0, n.y));
          const outer = toPoints(face.idx.map((i) => project(VERTS[i], cam)));
          const inner = toPoints(
            face.idx.map((i) =>
              project(
                {
                  x: face.normal.x + (VERTS[i].x - face.normal.x) * 0.55,
                  y: face.normal.y + (VERTS[i].y - face.normal.y) * 0.55,
                  z: face.normal.z + (VERTS[i].z - face.normal.z) * 0.55,
                },
                cam,
              ),
            ),
          );
          return (
            <g key={f}>
              <polygon points={outer} fill={COLORS.charcoal} />
              <polygon points={outer} fill={rgba(COLORS.cyan, 0.06 + 0.2 * light)} stroke={edge} strokeWidth={2.5} filter={`url(#${id}-soft)`} />
              {glow > 0 ? <polygon points={outer} fill={rgba(glowColor, 0.4 * glow)} /> : null}
              {frost > 0 ? <polygon points={outer} fill={rgba(COLORS.white, 0.22 * frost)} /> : null}
              <polygon points={inner} fill="none" stroke={COLORS.purple} strokeWidth={2} opacity={0.8} />
            </g>
          );
        })}
      </g>

      {emblem > 0.001 ? (
        <g transform={`translate(${x} ${cy}) scale(${emblem * k})`}>
          <circle r={78} fill={rgba(COLORS.charcoal, 0.92)} stroke={COLORS.purple} strokeWidth={3} filter={`url(#${id}-glow)`} />
          <g fill="none" stroke={edge} strokeWidth={4} strokeLinecap="round">
            <path d={LOBE} />
            <path d={SULCI} />
            <g transform="scale(-1 1)">
              <path d={LOBE} />
              <path d={SULCI} />
            </g>
          </g>
          <text x={0} y={0} fill={COLORS.white} fontFamily={FONT} fontWeight={800} fontSize={34} textAnchor="middle" dominantBaseline="central">
            AI
          </text>
        </g>
      ) : null}

      {lock > 0.001 ? (
        <g transform={`translate(${x} ${cy + 150 * k - (1 - lock) * 140}) scale(${k})`} opacity={Math.min(1, lock * 1.5)}>
          <path d="M-22 -6V-24A22 22 0 0 1 22 -24V-6" stroke={ICE} strokeWidth={9} fill="none" strokeLinecap="round" />
          <rect x={-36} y={-8} width={72} height={56} rx={10} fill={ICE} filter={`url(#${id}-glow)`} />
          <circle cx={0} cy={14} r={7} fill={COLORS.charcoal} />
          <rect x={-3} y={16} width={6} height={16} rx={2} fill={COLORS.charcoal} />
        </g>
      ) : null}
    </g>
  );
};
