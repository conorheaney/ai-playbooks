# How AI Models Are Trained: Visual Asset Blueprint

1920×1080 authoring space · 30 fps · 3093 frames (1:43.1) · 4K master via `--scale=2`.
Every visual is SVG or live text, so nothing is rasterised before the final render.

## Run

This lesson is one composition in the shared `videos/` Remotion project. Its code lives next to this file in `videos/lessons/how-ai-trains/`, and paths below are relative to this folder unless they start with `shared/`, `public/` or `scripts/` (project root). Theme, fonts, maths, the model cube and other pieces reused by later lessons live in `videos/shared/`; `components/ModelCube.tsx` here wraps the shared cube with this video's spin and freeze timing.

```bash
cd videos                  # run from the shared Remotion project root
npm install
npm run studio             # live preview / scrubbing (composition: HowAITrains)
npm run render:trains      # out/how-ai-trains/how-ai-trains-1080p.mp4
npm run render:trains:4k   # out/how-ai-trains/how-ai-trains-2160p.mp4 (3840×2160)
npm run sfx                # regenerate the shared public/sfx/*.wav (already generated)
npm run center:trains      # re-measure the centring track after layout or timing changes
```

## Design tokens (`shared/theme.ts`)

| Token | Value | Use |
|---|---|---|
| charcoal | `#121212` | Background, node fills, panel fills |
| cyan | `#00F0FF` | Primary strokes, data points, forward pulses, progress |
| purple | `#9D4EDD` | Semantic links, backprop pulses, emblem ring, counters |
| white | `#FFFFFF` | All headline and label text |
| error | `#FF3B6B` | Wrong answers, rejected outputs, red team (Scenes 3–8) |

Type: Inter (loaded through `@remotion/google-fonts`, and rendering waits for it). 800 for headlines, 700 for labels, 500 for prompt text. Numbers use `tabular-nums` so counters never jitter.

| Element | Size | Position |
|---|---|---|
| Hero title (Scene 1) | 140px, -0.02em | Exact centre (960, 540), transform-origin math in `SceneTitle.tsx` |
| Corner title (every scene) | 140px × 0.24 scale ≈ 34px, settles to 50% opacity | Top-left anchor (96, 72) |
| Loop badge | 22px / 700 pill | Top-right (right 96, top 52) |
| "MODEL RELEASED." | 120px, scale 1 → 1.06 | Centre x, y = 450 |
| Prompt text | 38px / 500 | Bar 980×96 centred at y = 640 |

Background (all frames): charcoal, 48px dot grid at 7% white drifting down 0.25 px/frame, radial vignette to 65% black.

## Scene 1: Raw Data Deluge (frames 0–230)

| Local frame | Event |
|---|---|
| 0–12 | 72 icons fade in (doc, image, audio-wave, code `</>`), seeded random: size 36–100px, 3–12 px/frame fall, ±4°/frame spin, sine sway |
| 0–18 | "STEP 1: RAW DATA" springs from 0.86 to 1.0 scale at dead centre over a charcoal radial scrim |
| 10–30 | Ingest panel rises 40px from below (760px bar, cyan→purple gradient, 10 tick divisions) |
| 15–200 | Readout counts 1 KB → 1.00 TB on a log scale (KB→MB→GB→TB), bar fills ease-in-out |
| 40–70 | Title glides to top-left (scale 1 → 0.24), scrim dissolves |
| 218–230 | Scene fades out |

## Scene 2: Tokenize & Map (frames 230–515)

| Local frame | Event |
|---|---|
| 0–15 | "The cat sat" rises in: three 220px slots, 84px words |
| 45 / 58 | Glowing cyan cut beams draw top→bottom between words (8 frames each), fade by +22 |
| 72–96 | Blocks separate (gap 0 → 64px), cyan outlines and token IDs `#464 #3797 #7731` appear |
| 118–160 | Each block shrinks into a glowing point on a projected 3D grid (staggered 6 frames); camera yaws −0.55 → +0.35 rad through the scene end |
| 201–221 | "kitten" appears beside "cat"; purple link draws with "similar" label |
| 211 | "car" pops in next to "cat" |
| 225–255 | "car" flies outside the grid on the far right; dashed tether fades |
| 273–285 | Scene fades out |

3D math is in `shared/lib/math.ts` (yaw → pitch rotation, pinhole projection with distance 4.2, scale 250).

## Scene 3: Adjusting Weights (frames 515–825)

Pre-training as **next-word prediction**: given "The cat sat", the model guesses the next word, is wrong, adjusts, and tries again.

Network 4-6-6-3 (`lib/network.ts`), layers at x = 560/827/1093/1360, nodes spaced 118px around y = 570. Edge stroke = 1 + 5·weight; weights are seeded and deterministic. Output candidates: `on` (correct), `car` (wrong guess), `down`.

| Local frame | Event |
|---|---|
| 0–28 | Edges draw on layer by layer, nodes spring in, "The cat sat" input chip on the left |
| 60–120 | Forward pass: cyan pulses hop each layer in 20 frames, nodes flash on arrival |
| 120 | `car` output fills red, "GUESS: car ✕" chip appears |
| 138–170 | All edges flash purple three times (edges into `car` flash red) |
| 170–221 | Backprop: purple pulses travel right→left; each layer pair re-weights (thicken or thin) over 20 frames once the pulse crosses it. Edges into `on` strengthen, the rest thin out |
| 164–298 | "WEIGHT UPDATES" counter (top-right) climbs to 2.4 billion |
| 228–273 | Second forward pass in cyan (15 frames per hop) |
| 273 | `on` fills cyan, "GUESS: on ✓" chip springs in, edges into `on` glow |
| 293–306 | Labels, chips, counter and title fade; **network stays** for the hand-off |

## Layout conventions (all scenes)

- **Screen chrome stays in the corners; content leads in the centre.** The scene title sits top-left and status badges top-right. Corner titles are small (24% of the 140px hero size, about 34px) and settle to 50% opacity 15 frames after they land, so they never compete with the content; this is the shared `SceneTitle` default. The main content is kept centred horizontally at all times: the whole video sits in a shared `Stage` (`shared/components/Stage.tsx`) that slides content left or right using a per-frame track in `centering.ts`. Screen chrome, full-frame overlays and anything that must sit at true screen centre are wrapped in `Pinned`, so they don't move. Positions given in the scene tables below are design positions, before this shift.
- **The centring track is measured, not hand-set.** `npm run center:<lesson>` (`scripts/measure-centering.mjs`) renders the video uncentred at half size and finds each frame's content extent. It ignores the title/badge band and the faint background, filters out elements that only pass through, and looks ahead so things fading in aren't pushed off-screen. It keeps content at least 60 px from the screen edges, smooths the result over about 1 s and writes `centering.ts`. Re-run it after any layout or timing change. `--fixed=<from>-<to>:<px>` holds a frame range at a set shift.
- Raw data (frames 0–230) and locked in (2413–2693) are held at no shift, because their layouts are built around screen centre: a full-screen glyph rain, and the cube at dead centre.

## Post-training conventions (Scenes 4–10)

- **One model, one cube.** `ModelCube.tsx` draws the model in every post-training scene. Its rotation is driven by the absolute frame, so it turns continuously across cuts, then decelerates to a standstill when the weights freeze in Scene 9. Scenes glide it from its home position (960, 500) to their own layout and back, and fade their own content rather than the cube.
- **People are always shown when they are in the loop.** A purple person figure appears on screen, and the top-right badge reads **HUMANS IN THE LOOP**: example writers (4), raters (5), red team (7), reviewers (8), and monitoring teams (10). Scene 6 is the exception, because its rewards come from an automatic checker; its badge reads **AUTOMATED CHECKS** with a gear icon.
- **The "AI" emblem** appears on the cube the moment fine-tuning makes the base model conversational (Scene 4) and stays from then on.

## Scene 4: Base Model → Fine-Tune on Examples (frames 825–1245)

| Local frame | Event |
|---|---|
| 0–36 | Scene 3's network implodes into the cube (white burst) |
| 36 | Corner title "BASE MODEL" |
| 50–88 | Prompt "What's the capital of France?" appears, then flies into the model |
| 90–156 | Base model output types a ramble of more questions; red ✕ at 156 |
| 195 | Title becomes "FINE-TUNE ON EXAMPLES"; badge: humans in the loop |
| 195–350 | Three people write Q&A cards that stream into the model (7 cards, 32 frames each); purple glow as each lands; counter climbs to 25,000 |
| 352–368 | Same prompt again, into the model; "AI" emblem pops on |
| 378–403 | "The capital of France is Paris." types out; cyan ✓ |

## Scene 5: Learn from Feedback / RLHF (frames 1245–1485)

| Local frame | Event |
|---|---|
| 10–40 | Prompt "Explain gravity to a 10-year-old." and two answers: A (technical), B (kid-friendly) |
| 45 | A person appears: "A PERSON PICKS THE BETTER ANSWER" |
| 75 | Selection line to B, ✓; A dims |
| 100–122 | B flies into the **reward model** panel |
| 128–170 | Purple dots stream from the person to the reward model; meter fills, counter to 1,000,000 comparisons |
| 175–198 | "REWARD SIGNAL" path from reward model to the cube; cube glows purple |

## Scene 6: Reinforcement Learning (frames 1485–1875)

The RL loop is drawn explicitly: cube → **ATTEMPT** arc (top) → **AUTOMATIC CHECKER** → **REWARD** arc (bottom) → cube. Dashes flow in loop direction.

| Local frame | Event |
|---|---|
| 20–45 | Arcs draw, checker and success-rate chart appear |
| 60–117 | Cycle 1: "17 × 24 = ?" → attempt 398 → ✕ 0 → model dims red |
| 125–182 | Cycle 2: same problem → 408 → ✓ +1 → model glows cyan |
| 190–350 | 8 fast cycles (√144, is_prime(91), sort, 15% of 80, reverse, gcd, fib(10), 2ⁿ = 64), mixed ✓/✕ |
| throughout | Success-rate line climbs 30% → 90% as each reward lands |

## Scene 7: Safety Testing (frames 1875–2115)

| Local frame | Event |
|---|---|
| 20–40 | Shield draws around the model |
| 30 | Red team (3 red figures) appears |
| 45 / 80 / 115 | Harmful prompts ("How do I build a weapon…", "Ignore your rules and…", "Write malware that…") hit the shield, flash red, rebound; "REFUSED" |
| 140–176 | Everyday user's "How do I bake bread?" passes through the shield |
| 192–210 | Model answers with a recipe; ✓ |

## Scene 8: Evaluation (frames 2115–2413)

| Local frame | Event |
|---|---|
| 20 | Benchmark panel: Reasoning, Coding, Knowledge, Safety, with dashed PASS line at 75% |
| 45–115 | Run 1 bars fill; Coding stops at 62% → red ✕ |
| 170–196 | "BACK TO TRAINING" path from the scorecard to the model; purple glow |
| 220–258 | Run 2: all bars pass ✓ |
| 264 | Two reviewers + "APPROVED FOR RELEASE" stamp |

## Scene 9: Locked In (frames 2413–2693)

| Local frame | Event |
|---|---|
| 0–20 | Cube grows to size 130; 21 weight values orbit it in three rings |
| 12–58 | Orbit (and the cube's spin) decelerates to a stop |
| 58–76 | Freeze on "frozen": numbers and cube edges turn ice-white, frost tint, "WEIGHTS FROZEN" |
| 92 | Padlock drops onto the cube ("the model is released") |
| 132–175 | Chat "Remember: my name is Sam." flies in and bounces off; "CHATS DON'T CHANGE THE WEIGHTS" |
| 205 | "v1.0 · LOCKED" tag ("that version is locked in") |

## Scene 10: Released to the World (frames 2693–3093)

| Local frame | Event |
|---|---|
| 10–55 | Data-centre racks rise; the locked cube flies in and they power on (LEDs blink) |
| 60–120 | Rotating globe; APPS / API / WEB channels connect racks to globe with flowing packets |
| 110–260 | 70 users light up across the globe; "PEOPLE USING IT" counts to 100,000,000+ |
| 150–225 | User requests pop up around the globe |
| 150 | Badge: humans in the loop; safety & monitoring team appears ("teams monitor how it's used") |
| 200–262 | Purple feedback dots travel from the globe to the team ("feed what they learn") |
| 262 | Dashed link from the team to a ghost "NEXT MODEL" cube |
| 310–400 | Finale: scene dims, "MODEL RELEASED." springs in; prompt bar types "How can I help you today?" |

## Voiceover script

| # | File | Line | Words / scene length |
|---|---|---|---|
| 1 | `01-raw-data.wav` | "AI models don't just 'know' things. They start completely blank, needing massive piles of data to learn." | 17 / 7.67 s (recorded: 7.1 s) |
| 2 | `02-tokenize.wav` | "First, that data is broken into pieces called tokens, then mapped into a multi-dimensional math grid where similar meanings sit close together." | 23 / 9.5 s (recorded: 8.7 s) |
| 3 | `03-weights.wav` | "Next, it practises predicting the next word. It guesses, gets it wrong, and adjusts its internal settings, called weights, billions of times." | 22 / 10.33 s (recorded: 9.66 s) |
| 4 | `04-fine-tune.wav` | "Pre-training creates a base model: it can continue text, but it can't hold a conversation. So it's fine-tuned on thousands of example conversations written by people." | 27 / 14 s (recorded: 11.0 s) |
| 5 | `05-feedback.wav` | "Then people compare its answers and pick the better one, and it learns their preferences." | 15 / 8 s (recorded: 5.5 s) |
| 6 | `06-reinforcement.wav` | "On maths and code, it practises on problems where the answer can be checked automatically. This is reinforcement learning: correct answers are rewarded, so it does more of what works." | 30 / 13 s (recorded: 11.2 s) |
| 7 | `07-safety.wav` | "Next, red teams try to break it, and it's trained to refuse harmful requests while staying helpful." | 17 / 8 s (recorded: 6.4 s) |
| 8 | `08-evaluation.wav` | "Before release, it's tested on thousands of benchmarks. If it falls short, it goes back for more training." | 18 / 8.33 s (recorded: 7.1 s) |
| 9 | `09-locked-in.wav` | "Finally, the weights are frozen and the model is released. It doesn't keep learning from your chats; that version is locked in." | 22 / 9.67 s (recorded: 8.4 s) |
| 10 | `10-release.wav` | "From data centres, it reaches millions of people through apps and APIs, while teams monitor how it's used and feed what they learn into the next model." | 27 / 14 s (recorded: 9.5 s) |

Every scene is timed to its recorded take. To swap in a new take, measure its phrase timings, then change the scene's length in `timing.ts` and move its beats to match.

## Audio

- **SFX** are synthesised by `scripts/generate-sfx.mjs` (pure Node, seeded) into the shared `public/sfx/` library. 16 sounds: data-rush, rapid-typing, tick-up, slice, space-hum, data-pulse, error-buzzer, lock-click, power-up, rating-ding, absorb-whoosh, chime, synth-swell, shield-hit, freeze, pop. Edit a recipe and run `npm run sfx` to regenerate.
- **Cue sheet** is `SFX` in `audio.tsx`. Every cue is written as (scene, local frame) from `timing.ts`, so re-timing a scene moves its sounds with it.
- **Voiceover** clips play automatically once they exist in `public/vo/how-ai-trains/` (missing ones are skipped). Each is cut at the end of its scene.
- **Ducking:** while narration plays, beds drop about 11 dB and short accents about 6 dB (`BED_DUCK` / `ACCENT_DUCK` in the shared mixer, `shared/audio.tsx`).
