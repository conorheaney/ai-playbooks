// Measures where each frame's main content sits and writes a per-frame horizontal shift that centres it.
//
// Usage: node scripts/measure-centering.mjs <CompositionId> <output .ts file> [--fixed=<from>-<to>:<px> ...]
//   e.g. npm run center:responds
//   --fixed holds a frame range at a set shift, for scenes whose layout is already designed around
//   screen centre (a full-screen effect, or an object that must stay dead centre).
//
// How it works:
// 1. Renders the composition at half size, silent and uncentred (input prop center: false).
// 2. Decodes every frame to greyscale and finds the content's horizontal extent: bright pixels only
//    (the faint dot grid and vignette fall below the threshold), ignoring the top band where the corner
//    title and status badges live, and trimming the outer 3% of content on each side so a stray glyph
//    doesn't drag the centre. Each frame makes room for content shortly before and after it, so things
//    fading in aren't pushed off-screen, and a median filter drops elements that only pass through.
// 3. Converts each frame's content centre into the shift that would put it at screen centre, holds the
//    last value through empty frames, smooths it (about 1 s) so content glides rather than jitters,
//    and writes it as a TypeScript array the lesson imports.
//
// Re-run it whenever a lesson's layout or timing changes.

import {spawn, spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {inflateSync} from 'node:zlib';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const args = process.argv.slice(2);
const [id, outArg] = args.filter((a) => !a.startsWith('--'));
const FIXED = args
  .filter((a) => a.startsWith('--fixed='))
  .map((a) => {
    const m = a.match(/^--fixed=(\d+)-(\d+):(-?\d+)$/);
    if (!m) throw new Error(`Bad option ${a}; expected --fixed=<from>-<to>:<px>`);
    return {from: Number(m[1]), to: Number(m[2]), px: Number(m[3])};
  });
if (!id || !outArg) {
  console.error('Usage: node scripts/measure-centering.mjs <CompositionId> <output .ts file>');
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
const OUT = resolve(ROOT, outArg);

const W = 960; // analysis size: half of 1920 × 1080, so thin outlines on faint panels still register
const H = 540;
const SCALE = 1920 / W;
const TOP_BAND = Math.round((215 / 1080) * H); // title, badges and the lane things fly in along live above this
const THRESHOLD = 55; // grey level that separates content from the background
const MIN_PIXELS = 25; // fewer bright pixels than this counts as an empty frame
const TRIM = 0.03; // share of content ignored on each side
const SMOOTH = 15; // half-width of each box-blur pass, in frames (two passes ≈ 1 s)
const LIMIT = 260; // never shift further than this, in px
const LOOK_BACK = 6; // frames of past content each frame still makes room for
const LOOK_AHEAD = 30; // frames of upcoming content each frame makes room for, so things fading in aren't pushed off-screen
const MARGIN = 60; // content never shifts closer than this to the screen edge, in px
const MEDIAN = 12; // half-width of the median filter that drops brief passers-by, in frames

const tmp = mkdtempSync(join(tmpdir(), 'centering-'));
const video = join(tmp, 'measure.mp4');

console.log(`Rendering ${id} uncentred for measurement…`);
const render = spawnSync(
  process.execPath,
  [CLI, 'render', id, video, '--scale=0.5', '--muted', '--log=error', `--props=${JSON.stringify({sfx: false, voiceover: false, center: false})}`],
  {cwd: ROOT, stdio: 'inherit'},
);
if (render.status !== 0) {
  process.exit(render.status ?? 1);
}

console.log('Measuring content position per frame…');
const centres = await new Promise((done, fail) => {
  // The bundled ffmpeg has no raw-video muxer, so frames arrive as a stream of greyscale PNGs.
  const ff = spawn(
    process.execPath,
    [CLI, 'ffmpeg', '-v', 'error', '-i', video, '-vf', 'format=gray', '-c:v', 'png', '-f', 'image2pipe', '-'],
    {cwd: ROOT},
  );
  const result = [];
  let pending = Buffer.alloc(0);
  ff.stdout.on('data', (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    let end;
    while ((end = pngEnd(pending)) > 0) {
      result.push(measure(decodeGrayPng(pending.subarray(0, end))));
      pending = pending.subarray(end);
    }
  });
  ff.stderr.on('data', (d) => process.stderr.write(d));
  ff.on('close', (code) => (code === 0 ? done(result) : fail(new Error(`ffmpeg exited ${code}`))));
});

// Byte offset just past the first complete PNG in the buffer, or 0 if it isn't complete yet.
function pngEnd(buf) {
  let at = 8; // signature
  while (at + 8 <= buf.length) {
    const len = buf.readUInt32BE(at);
    const type = buf.toString('latin1', at + 4, at + 8);
    const next = at + 12 + len;
    if (next > buf.length) return 0;
    if (type === 'IEND') return next;
    at = next;
  }
  return 0;
}

// Minimal decoder for the 8-bit greyscale, non-interlaced PNGs ffmpeg writes here.
function decodeGrayPng(png) {
  const idat = [];
  let at = 8;
  let width = 0;
  let height = 0;
  while (at < png.length) {
    const len = png.readUInt32BE(at);
    const type = png.toString('latin1', at + 4, at + 8);
    if (type === 'IHDR') {
      width = png.readUInt32BE(at + 8);
      height = png.readUInt32BE(at + 12);
    } else if (type === 'IDAT') {
      idat.push(png.subarray(at + 8, at + 8 + len));
    }
    at += 12 + len;
  }
  if (width !== W || height !== H) throw new Error(`Unexpected frame size ${width}×${height}`);
  const raw = inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const filter = raw[y * (W + 1)];
    const row = raw.subarray(y * (W + 1) + 1, (y + 1) * (W + 1));
    for (let x = 0; x < W; x++) {
      const a = x > 0 ? out[y * W + x - 1] : 0;
      const b = y > 0 ? out[(y - 1) * W + x] : 0;
      const c = x > 0 && y > 0 ? out[(y - 1) * W + x - 1] : 0;
      let v = row[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * W + x] = v & 255;
    }
  }
  return out;
}

function measure(frame) {
  const cols = new Uint32Array(W);
  let total = 0;
  for (let y = TOP_BAND; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (frame[y * W + x] > THRESHOLD) {
        cols[x]++;
        total++;
      }
    }
  }
  if (total < MIN_PIXELS) {
    return null;
  }
  const lo = total * TRIM;
  const hi = total * (1 - TRIM);
  let seen = 0;
  let left = 0;
  let right = W - 1;
  for (let x = 0; x < W; x++) {
    if (seen <= lo && seen + cols[x] > lo) left = x;
    if (seen <= hi && seen + cols[x] > hi) right = x;
    seen += cols[x];
  }
  return {left: left * SCALE, right: (right + 1) * SCALE};
}

// 1. Median-filter each frame's left and right content edges, so elements that only pass through
//    (a card flying in, a chat pill crossing the screen) don't count.
const medianOf = (values, i) => {
  const win = values.slice(Math.max(0, i - MEDIAN), i + MEDIAN + 1).filter((v) => v !== null).sort((x, y) => x - y);
  return win.length ? win[win.length >> 1] : null;
};
const lefts = centres.map((c) => (c ? c.left : null));
const rights = centres.map((c) => (c ? c.right : null));
const steady = centres.map((_, i) => {
  const left = medianOf(lefts, i);
  const right = medianOf(rights, i);
  return left === null || right === null ? null : {left, right};
});

// 2. Each frame centres the combined extent of steady content from a little before it to a little after
//    it, so elements that are fading in are already accounted for. The shift is then limited so that
//    combined extent stays inside the screen margins. Empty frames hold the last value.
let last = 0;
const raw = steady.map((_, f) => {
  const fixed = FIXED.find((r) => f >= r.from && f < r.to);
  if (fixed) return (last = fixed.px);
  let left = Infinity;
  let right = -Infinity;
  for (let j = Math.max(0, f - LOOK_BACK); j <= Math.min(steady.length - 1, f + LOOK_AHEAD); j++) {
    if (steady[j]) {
      left = Math.min(left, steady[j].left);
      right = Math.max(right, steady[j].right);
    }
  }
  if (!Number.isFinite(left)) return last;
  let shift = 960 - (left + right) / 2;
  shift = Math.min(shift, 1920 - MARGIN - right); // keep the right edge on screen
  shift = Math.max(shift, MARGIN - left); // ...and the left edge, which wins if both can't fit
  return (last = Math.max(-LIMIT, Math.min(LIMIT, shift)));
});

// 3. Smooth so content glides rather than jitters.
const blur = (values) =>
  values.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let j = i - SMOOTH; j <= i + SMOOTH; j++) {
      sum += values[Math.max(0, Math.min(values.length - 1, j))];
      n++;
    }
    return sum / n;
  });
const shift = blur(blur(raw)).map((v) => Math.round(v));

const rows = [];
for (let i = 0; i < shift.length; i += 30) rows.push(`  ${shift.slice(i, i + 30).join(', ')},`);
writeFileSync(
  OUT,
  `// Generated by scripts/measure-centering.mjs for ${id}. Do not edit by hand: re-run \`npm run center:*\`.\n` +
    `// Horizontal shift in px for each frame that keeps the main content centred on screen.\n` +
    `export const CENTERING: readonly number[] = [\n${rows.join('\n')}\n];\n`,
);
rmSync(tmp, {recursive: true, force: true});

const secs = (f) => (f / 30).toFixed(1).padStart(5);
console.log(`Wrote ${shift.length} frames to ${outArg}`);
for (let f = 0; f < shift.length; f += 60) console.log(`  ${secs(f)} s  ${String(shift[f]).padStart(5)} px`);
