// Synthesises every SFX cue used by the lessons (e.g. lessons/how-ai-trains/audio.tsx) into public/sfx/*.wav.
// Pure Node (no dependencies), seeded, so output is identical on every run.
// Usage: npm run sfx

import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 48000;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sfx');
const TAU = Math.PI * 2;

// Keep in step with src/timing.ts.
const SCENE1_SECONDS = 230 / 30; // SCENES.rawData.durationInFrames
const COUNTER_SECONDS = (200 - 15) / 30; // RAW.counterEnd - RAW.counterStart
const SPACE_HUM_SECONDS = (285 - 118) / 30; // SCENES.tokenize.durationInFrames - TOKEN.morph

// ---------- primitives ----------

const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buffer = (seconds) => new Float32Array(Math.round(seconds * SR));

const noise = (rand) => rand() * 2 - 1;

// RBJ biquad band-pass (constant 0 dB peak gain). Centre frequency may change per sample.
const bandpass = (q) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, freq) => {
    const w = (TAU * Math.min(freq, SR * 0.45)) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    const y = ((alpha * x) - (alpha * x2) - (-2 * Math.cos(w)) * y1 - (1 - alpha) * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};

const lowpass = () => {
  let y = 0;
  return (x, freq) => {
    const a = 1 - Math.exp((-TAU * freq) / SR);
    y += a * (x - y);
    return y;
  };
};

const highpass = (freq) => {
  const lp = lowpass();
  return (x) => x - lp(x, freq);
};

// Band-limited-ish saw: additive harmonics below Nyquist.
const saw = (phase, freq, maxHarmonics = 10) => {
  let s = 0;
  const n = Math.min(maxHarmonics, Math.floor((SR * 0.45) / Math.max(freq, 1)));
  for (let k = 1; k <= n; k++) s += Math.sin(phase * k) / k;
  return s * 0.6;
};

// Odd harmonics only: soft square for the buzzer.
const square = (phase, freq, maxHarmonics = 9) => {
  let s = 0;
  for (let k = 1; k <= maxHarmonics * 2; k += 2) {
    if (freq * k > SR * 0.45) break;
    s += Math.sin(phase * k) / k;
  }
  return s * 0.8;
};

// Inharmonic bell partials with exponential decay.
const addBell = (out, start, freq, amp, decay) => {
  const partials = [[1, 1], [2.76, 0.45], [5.4, 0.22], [8.93, 0.1]];
  const i0 = Math.round(start * SR);
  for (let i = i0; i < out.length; i++) {
    const t = (i - i0) / SR;
    let s = 0;
    for (const [ratio, a] of partials) s += a * Math.sin(TAU * freq * ratio * t) * Math.exp((-t * ratio ** 0.5) / decay);
    out[i] += amp * s * Math.min(1, t / 0.002);
  }
};

// Short sine blip with optional pitch drop.
const addBlip = (out, start, freq, amp, decay, drop = 0) => {
  const i0 = Math.round(start * SR);
  let phase = 0;
  const len = Math.min(out.length - i0, Math.round(decay * 8 * SR));
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    phase += (TAU * freq * (1 - drop * Math.min(1, t / (decay * 3)))) / SR;
    out[i0 + j] += amp * Math.sin(phase) * Math.exp(-t / decay) * Math.min(1, t / 0.0015);
  }
};

const fade = (out, inSec, outSec) => {
  const fi = Math.round(inSec * SR);
  const fo = Math.round(outSec * SR);
  for (let i = 0; i < fi && i < out.length; i++) out[i] *= i / fi;
  for (let i = 0; i < fo && i < out.length; i++) out[out.length - 1 - i] *= i / fo;
  return out;
};

const normalize = (out, peak = 0.89) => {
  let max = 0;
  for (const v of out) max = Math.max(max, Math.abs(v));
  if (max > 0) for (let i = 0; i < out.length; i++) out[i] *= peak / max;
  return out;
};

const writeWav = (name, data) => {
  const bytes = Buffer.alloc(44 + data.length * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(36 + data.length * 2, 4);
  bytes.write('WAVE', 8);
  bytes.write('fmt ', 12);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); // PCM
  bytes.writeUInt16LE(1, 22); // mono
  bytes.writeUInt32LE(SR, 24);
  bytes.writeUInt32LE(SR * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) {
    bytes.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i])) * 32767), 44 + i * 2);
  }
  writeFileSync(join(OUT_DIR, name), bytes);
  console.log(`  ${name.padEnd(20)} ${(data.length / SR).toFixed(2)}s`);
};

// ---------- sounds ----------

const SOUNDS = {
  // Scene 1: ambient digital rushing water with sparkling data bits.
  'data-rush.wav': () => {
    const out = buffer(SCENE1_SECONDS);
    const rand = mulberry32(1);
    const bpA = bandpass(0.7);
    const bpB = bandpass(1.4);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const n = noise(rand);
      const sweep = 900 + 600 * Math.sin(TAU * 0.35 * t) + 300 * Math.sin(TAU * 1.3 * t);
      out[i] = 0.6 * bpA(n, sweep) + 0.25 * bpB(n, 3200 + 800 * Math.sin(TAU * 0.6 * t));
    }
    for (let k = 0; k < 280; k++) {
      addBlip(out, 0.2 + rand() * (SCENE1_SECONDS - 0.6), 2400 + rand() * 3600, 0.06 + rand() * 0.06, 0.012);
    }
    return fade(out, 0.4, 0.9);
  },

  // Scene 1: rapid mechanical typing that accelerates as the counter climbs.
  'rapid-typing.wav': () => {
    const out = buffer(COUNTER_SECONDS);
    const rand = mulberry32(2);
    const hp = highpass(1800);
    let t = 0.05;
    while (t < COUNTER_SECONDS - 0.15) {
      const i0 = Math.round(t * SR);
      const heavy = rand() < 0.08;
      const tone = heavy ? 900 : 1700 + rand() * 900;
      for (let j = 0; j < SR * 0.05 && i0 + j < out.length; j++) {
        const s = j / SR;
        const click = noise(rand) * Math.exp(-s / 0.004);
        const body = Math.sin(TAU * tone * s) * Math.exp(-s / (heavy ? 0.02 : 0.01));
        out[i0 + j] += (heavy ? 0.9 : 0.6) * (0.7 * click + 0.4 * body);
      }
      const speed = 1 - (t / COUNTER_SECONDS) * 0.55; // intervals shrink by ~55% over the clip
      t += (0.045 + rand() * 0.065) * speed;
    }
    for (let i = 0; i < out.length; i++) out[i] = hp(out[i]) * 0.6 + out[i] * 0.4;
    return fade(out, 0.02, 0.15);
  },

  // Scene 1: counter tick-up, faster and higher as it approaches 1 TB, landing on a bright final tick.
  'tick-up.wav': () => {
    const out = buffer(COUNTER_SECONDS);
    const last = COUNTER_SECONDS - 0.18;
    let t = 0;
    while (t < last - 0.02) {
      const p = t / COUNTER_SECONDS;
      addBlip(out, t, 800 + 1400 * p * p, 0.5, 0.012);
      t += 0.14 - 0.11 * p;
    }
    addBlip(out, last, 2600, 0.8, 0.05);
    addBlip(out, last, 3900, 0.35, 0.04);
    return fade(out, 0, 0.05);
  },

  // Scene 2: crisp digital slice, a downward noise sweep with a metallic "shing".
  'slice.wav': () => {
    const out = buffer(0.5);
    const rand = mulberry32(3);
    const bp = bandpass(2.5);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const sweep = 9000 * Math.exp(-t / 0.05) + 1400;
      out[i] = 1.4 * bp(noise(rand), sweep) * Math.exp(-t / 0.06) * Math.min(1, t / 0.001);
    }
    addBlip(out, 0.004, 3300, 0.35, 0.08);
    addBlip(out, 0.004, 5150, 0.18, 0.05);
    return fade(out, 0, 0.05);
  },

  // Scene 2: low 3D-space hum under the vector grid.
  'space-hum.wav': () => {
    const out = buffer(SPACE_HUM_SECONDS);
    const rand = mulberry32(4);
    const lp = lowpass();
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const lfo = 0.75 + 0.25 * Math.sin(TAU * 0.3 * t);
      const tone =
        0.5 * Math.sin(TAU * 55 * t) +
        0.35 * Math.sin(TAU * 110 * t) +
        0.3 * Math.sin(TAU * 110.4 * t + 1) +
        0.12 * Math.sin(TAU * 165 * t) +
        0.06 * Math.sin(TAU * 330.7 * t);
      out[i] = lfo * tone + 0.6 * lp(noise(rand), 220);
    }
    return fade(out, 0.6, 0.8);
  },

  // Scene 3: data packets pulsing through the network.
  'data-pulse.wav': () => {
    const out = buffer(1.5);
    const notes = [660, 880, 990, 880, 1100, 990, 1320, 1100, 1320, 1480];
    notes.forEach((f, k) => {
      addBlip(out, k * 0.12, f, 0.55 - k * 0.03, 0.035, 0.25);
      addBlip(out, k * 0.12, f * 2, 0.12, 0.02, 0.25);
    });
    const lp = lowpass();
    for (let i = 0; i < out.length; i++) out[i] = lp(out[i], 6000);
    return fade(out, 0, 0.1);
  },

  // Scene 3: soft digital error buzzer, two short low buzzes.
  'error-buzzer.wav': () => {
    const out = buffer(1);
    const lp = lowpass();
    let phase = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const on = (t < 0.18) || (t > 0.25 && t < 0.45);
      const local = t < 0.25 ? t : t - 0.25;
      const env = on ? Math.min(1, local / 0.008) * Math.min(1, (0.18 + (t < 0.25 ? 0 : 0.02) - local) / 0.02) : 0;
      phase += (TAU * 140) / SR;
      out[i] = lp(square(phase, 140) * Math.max(0, env), 1800);
    }
    return fade(out, 0, 0.05);
  },

  // Scene 3: satisfying click / lock when the correct answer locks in.
  'lock-click.wav': () => {
    const out = buffer(0.5);
    const rand = mulberry32(8);
    const hit = (start, tone, amp) => {
      const i0 = Math.round(start * SR);
      for (let j = 0; j < SR * 0.12 && i0 + j < out.length; j++) {
        const s = j / SR;
        out[i0 + j] += amp * (0.6 * noise(rand) * Math.exp(-s / 0.002) + Math.sin(TAU * tone * s) * Math.exp(-s / 0.03));
      }
    };
    hit(0, 3500, 0.6);
    hit(0.035, 1200, 0.8);
    addBlip(out, 0.035, 420, 0.5, 0.04);
    return fade(out, 0, 0.05);
  },

  // Scene 4: high-tech power-up as the network collapses into the cube.
  'power-up.wav': () => {
    const out = buffer(2);
    const rand = mulberry32(9);
    const lp = lowpass();
    const bp = bandpass(1.2);
    let phase = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const rise = Math.min(1, t / 1.2);
      const freq = 80 * Math.pow(8, rise * rise);
      phase += (TAU * freq) / SR;
      const tone = saw(phase, freq, 8);
      const cutoff = 300 + 5000 * rise;
      const env = Math.min(1, t / 0.05) * (t < 1.2 ? 0.4 + 0.6 * rise : Math.exp(-(t - 1.2) / 0.35));
      const riser = bp(noise(rand), 500 + 6000 * rise) * rise;
      out[i] = env * (lp(tone, cutoff) + 0.5 * riser);
    }
    addBell(out, 1.15, 1760, 0.25, 0.4);
    return fade(out, 0, 0.1);
  },

  // Scene 4: rating badges pop onto the answer cards.
  'rating-ding.wav': () => {
    const out = buffer(0.67);
    addBell(out, 0, 1318.5, 0.7, 0.18);
    addBell(out, 0.06, 1975.5, 0.4, 0.16);
    return fade(out, 0, 0.08);
  },

  // Scene 4: preferred answer is sucked into the model, ending in a soft thump at 0.83 s.
  'absorb-whoosh.wav': () => {
    const out = buffer(1);
    const rand = mulberry32(11);
    const bp = bandpass(1.6);
    const peak = 0.83;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const p = Math.min(1, t / peak);
      const env = t < peak ? p * p * p : Math.exp(-(t - peak) / 0.03);
      out[i] = 1.2 * env * bp(noise(rand), 400 + 4200 * p * p);
    }
    addBlip(out, peak, 90, 0.9, 0.06, 0.4);
    return fade(out, 0.02, 0.05);
  },

  // Scene 4: digital notification chime when the prompt bar appears.
  'chime.wav': () => {
    const out = buffer(1.5);
    addBell(out, 0, 659.25, 0.6, 0.45);
    addBell(out, 0.11, 987.77, 0.6, 0.55);
    return fade(out, 0, 0.2);
  },

  // Scene 4: synth swell to finish (A major pad, opens up, resolves by the last frame).
  'synth-swell.wav': () => {
    const out = buffer(80 / 30);
    const chord = [110, 220, 277.18, 329.63, 440];
    const phases = chord.flatMap(() => [0, 0]);
    const lp = lowpass();
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      let s = 0;
      chord.forEach((f, k) => {
        for (let d = 0; d < 2; d++) {
          const freq = f * (d === 0 ? 0.997 : 1.003);
          phases[k * 2 + d] += (TAU * freq) / SR;
          s += saw(phases[k * 2 + d], freq, 8) * (k === 0 ? 0.7 : 0.4);
        }
      });
      const swell = Math.min(1, t / 1.9);
      out[i] = lp(s, 300 + 3200 * swell * swell) * (0.15 + 0.85 * swell * swell);
    }
    return fade(out, 0.05, 0.6);
  },

  // Scenes 7 & 9: an attack (or a chat) bounces off the shield / lock: electric zap over a low thud.
  'shield-hit.wav': () => {
    const out = buffer(0.6);
    const rand = mulberry32(14);
    const bp = bandpass(3);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const crackle = bp(noise(rand), 2600 + 1800 * Math.sin(TAU * 37 * t)) * Math.exp(-t / 0.09);
      const zap = Math.sin(TAU * (900 - 600 * Math.min(1, t / 0.15)) * t) * Math.exp(-t / 0.07);
      out[i] = 1.2 * crackle + 0.4 * zap;
    }
    addBlip(out, 0, 70, 0.9, 0.08, 0.3);
    return fade(out, 0, 0.08);
  },

  // Scene 9: weights freezing, a descending crystalline shimmer.
  'freeze.wav': () => {
    const out = buffer(1.3);
    const rand = mulberry32(15);
    for (let k = 0; k < 26; k++) {
      const t = (k / 26) * 0.9 + rand() * 0.03;
      addBell(out, t, 4200 - 2600 * (k / 26) + rand() * 200, 0.18, 0.16);
    }
    const bp = bandpass(4);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      out[i] += 0.25 * bp(noise(rand), 7000 - 4000 * Math.min(1, t)) * Math.exp(-t / 0.5);
    }
    return fade(out, 0.01, 0.2);
  },

  // how-ai-responds: context pouring into the window, a filtered rush with bubbles that rise as it fills.
  'pour.wav': () => {
    const out = buffer(2.2);
    const rand = mulberry32(17);
    const bp = bandpass(0.9);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const p = t / 2.2;
      out[i] = 0.7 * bp(noise(rand), 500 + 900 * p) * (0.6 + 0.4 * Math.sin(TAU * 5 * t));
    }
    for (let k = 0; k < 40; k++) {
      const t = (k / 40) * 2 + rand() * 0.04;
      addBlip(out, t, 300 + 700 * (t / 2.2) + rand() * 120, 0.25, 0.02, -0.6);
    }
    return fade(out, 0.15, 0.35);
  },

  // how-ai-responds: compaction, a squeezed downward squelch through the funnel.
  'squeeze.wav': () => {
    const out = buffer(1.4);
    const rand = mulberry32(18);
    const bp = bandpass(3);
    let phase = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const p = Math.min(1, t / 1.2);
      const freq = 420 - 300 * p;
      phase += (TAU * freq) / SR;
      const env = Math.sin(Math.PI * Math.min(1, t / 1.3));
      out[i] = env * (0.5 * saw(phase, freq, 6) * (1 - 0.5 * p) + 0.6 * bp(noise(rand), 2400 - 1800 * p));
    }
    return fade(out, 0.02, 0.1);
  },

  // how-ai-responds: output limit hit, a hard low slam that stops dead.
  'cut-off.wav': () => {
    const out = buffer(0.6);
    const rand = mulberry32(19);
    addBlip(out, 0, 70, 1, 0.09, 0.3);
    addBlip(out, 0, 140, 0.5, 0.04);
    for (let i = 0; i < SR * 0.03; i++) out[i] += noise(rand) * Math.exp(-i / SR / 0.006) * 0.8;
    return fade(out, 0, 0.05);
  },

  // how-ai-responds: the session's context draining away, a falling gurgle.
  'drain.wav': () => {
    const out = buffer(2.4);
    const rand = mulberry32(20);
    const bp = bandpass(1.2);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const p = t / 2.4;
      out[i] = 0.6 * bp(noise(rand), 1400 - 1100 * p) * (1 - p);
    }
    for (let k = 0; k < 30; k++) {
      const t = (k / 30) * 2 + rand() * 0.05;
      addBlip(out, t, 900 - 600 * (t / 2.4) + rand() * 80, 0.22 * (1 - t / 2.4), 0.025, 0.5);
    }
    return fade(out, 0.05, 0.4);
  },

  // how-ai-gets-context: a search sweeping the index, a bright filtered sweep with a fine digital shimmer.
  'scan.wav': () => {
    const out = buffer(1.1);
    const rand = mulberry32(21);
    const bp = bandpass(6);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const p = t / 1.1;
      const shimmer = 0.5 + 0.5 * Math.sin(TAU * 38 * t);
      out[i] = 0.7 * bp(noise(rand), 900 + 4200 * p) * Math.sin(Math.PI * p) * (0.6 + 0.4 * shimmer);
    }
    for (let k = 0; k < 14; k++) addBlip(out, 0.05 + k * 0.07, 1800 + k * 140, 0.12, 0.01);
    return fade(out, 0.02, 0.15);
  },

  // how-ai-gets-context: a card sliding into a slot, a papery swish ending in a soft tap.
  'file.wav': () => {
    const out = buffer(0.32);
    const rand = mulberry32(22);
    const bp = bandpass(1.4);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      const p = Math.min(1, t / 0.2);
      out[i] = 0.55 * bp(noise(rand), 2600 - 1400 * p) * Math.sin(Math.PI * p) * (t < 0.2 ? 1 : 0);
    }
    addBlip(out, 0.19, 240, 0.8, 0.018, 0.4);
    addBlip(out, 0.19, 900, 0.18, 0.008);
    return fade(out, 0.01, 0.04);
  },

  // Bubbles and cards appearing: a short, soft pop.
  'pop.wav': () => {
    const out = buffer(0.25);
    addBlip(out, 0, 520, 0.9, 0.025, -0.9); // negative drop = quick upward chirp
    addBlip(out, 0.004, 1300, 0.25, 0.012);
    return fade(out, 0, 0.03);
  },
};

mkdirSync(OUT_DIR, {recursive: true});
console.log(`Writing ${Object.keys(SOUNDS).length} files to ${OUT_DIR}`);
for (const [name, make] of Object.entries(SOUNDS)) writeWav(name, normalize(make()));
