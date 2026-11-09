import {random} from 'remotion';

export type Vec2 = {x: number; y: number};
export type Vec3 = {x: number; y: number; z: number};
export type Camera = {yaw: number; pitch: number; distance: number; scale: number; cx: number; cy: number};
export type Projected = Vec2 & {depth: number; k: number};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mix2 = (a: Vec2, b: Vec2, t: number): Vec2 => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)});

export const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
});

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Yaw around Y, then pitch around X. Positive z points away from the camera.
export const rotate = (p: Vec3, yaw: number, pitch: number): Vec3 => {
  const x1 = p.x * Math.cos(yaw) + p.z * Math.sin(yaw);
  const z1 = -p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
  return {
    x: x1,
    y: p.y * Math.cos(pitch) - z1 * Math.sin(pitch),
    z: p.y * Math.sin(pitch) + z1 * Math.cos(pitch),
  };
};

// Pinhole projection; k is the perspective factor (1 at the origin plane).
export const project = (p: Vec3, cam: Camera): Projected => {
  const r = rotate(p, cam.yaw, cam.pitch);
  const k = cam.distance / (cam.distance + r.z);
  return {x: cam.cx + r.x * k * cam.scale, y: cam.cy - r.y * k * cam.scale, depth: r.z, k};
};

// Deterministic per-scope randomness so every render is identical.
export const seeded = (scope: string) => (key: string, i: number) => random(`${scope}-${key}-${i}`);

export const toPoints = (pts: Vec2[]) => pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

// Decimal (SI) units: 1 TB = 10^12 bytes.
export const formatBytes = (bytes: number) => {
  const i = clamp(Math.floor(Math.log10(Math.max(bytes, 1)) / 3), 0, BYTE_UNITS.length - 1);
  const value = bytes / Math.pow(1000, i);
  return `${value.toFixed(i === 0 ? 0 : 2)} ${BYTE_UNITS[i]}`;
};
