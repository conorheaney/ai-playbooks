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

**Label sizes.** Information-bearing labels are at least 24 px and key takeaways 28 px. This lesson passes `size` to the shared `Caption` on every call rather than relying on its 20 px default, because lessons 2 and 3 lay out around that default. The shared `Bubble` takes an optional `labelSize` (default 16); Scene 4 uses 22.

## Scene 1: Raw Data Deluge (frames 0–230)

| Local frame | Event |
|---|---|
| 0–12 | 72 icons fade in (doc, image, audio-wave, code `</>`), seeded random: size 36–100px, 3–12 px/frame fall, ±4°/frame spin, sine sway. Falling icons fade out within 60 px of text (corner title, "BLANK MODEL", counter panel) |
| 0–18 | "RAW DATA" springs from 0.86 to 1.0 scale at dead centre over a charcoal radial scrim |
| 10–30 | Ingest panel rises 40px from below (760px bar, cyan→purple gradient, 10 tick divisions); "DATA INGESTED" 24px |
| 15–200 | Readout counts 1 KB → 45.00 TB on a log scale (KB→MB→GB→TB), bar fills ease-in-out, lands on "learn" |
| 40–70 | Title glides to top-left (scale 1 → 0.24), scrim dissolves |
| 52–76 | **Blank model** fades in at centre: Scene 3's network at 72% scale (centred on x 960, y 470), hollow grey nodes, uniform faint edges. Once it appears, falling icons fade as they pass over its footprint, so only icons being absorbed are drawn on top of it |
| 75 | "BLANK MODEL" (28px) under it, on "start completely blank" |
| 90–216 | Each icon, at its own seeded moment between 90 and 190, bends into one of the model's nodes over 26 frames (shrinking; it starts from its falling opacity and brightens as it heads in, then fades); the node pulses cyan as it lands. The rain thins out as the data is absorbed |
| 218–230 | Scene fades out |

## Scene 2: Tokenize & Map (frames 230–515)

| Local frame | Event |
|---|---|
| 0–15 | "The cat sprawled" rises in: four token slots (200/200/290/140px), 80px words. "sprawl" and "ed" sit flush so they read as one word |
| 45 / 58 / 58 | Glowing cyan cut beams draw top→bottom (8 frames each), fade by +22: The \| cat, cat \| sprawled, and a **sub-word cut** sprawl \| ed sharing frame 58 |
| 72–96 | Blocks separate (gap 0 → 64px), cyan outlines and 26px token IDs `#464 #3797 #87214 #276` appear |
| 108–118 | IDs fade out, so they are gone before the morph starts |
| 118–157 | Each block shrinks into a glowing point on a projected 3D grid (staggered 3 frames). The box outlines fade out before any block moves (110–120), and each word fades out while its point travels and back in once it lands, so no two words or blocks cross mid-morph. Camera yaws −0.55 → +0.35 rad through the scene end |
| 135 | Faint "+ 1,000s MORE DIMENSIONS" (22px) beside the d₁ axis label, clear of every token: three axes stand in for thousands of dimensions. Axis labels 28px, full opacity |
| 201–221 | "kitten" appears beside "cat"; purple link draws with "similar" (26px) |
| 211 | "car" pops in next to "cat" |
| 225–255 | "car" flies outside the grid on the far right; dashed tether stays faintly visible |
| 250 | Contrast labels: "close = similar" (purple, replaces "similar") and "far = different" on the tether |
| 273–285 | Scene fades out |

3D math is in `shared/lib/math.ts` (yaw → pitch rotation, pinhole projection with distance 4.2). Token data and the camera (scale 310, centred at y 480) live in `lib/tokens.ts`, shared with Scene 3.

## Scene 3: Adjusting Weights (frames 515–825)

Pre-training as **next-word prediction**: given "The cat sprawled", the model guesses the next word, is wrong, adjusts, and tries again. The right answer ("on") comes from the text itself.

Network 4-6-6-3 (`lib/network.ts`), layers at x = 560/827/1093/1360, nodes spaced 118px around y = 570. Edge stroke = 1 + 7·weight; weights are seeded and deterministic. Output candidates: `on` (correct), `car` (wrong guess), `down`.

| Local frame | Event |
|---|---|
| 0–28 | Scene 2's four token points fly from where that scene left them into the input chip (arrive by 24); the chip "The cat sprawled **on**" pops in with "on" ghosted (hidden from the model). Edges draw on layer by layer, nodes spring in. Column headers 24px at 70% |
| 60–120 | Forward pass: cyan pulses hop each layer in 20 frames; hidden nodes flash on arrival, outputs don't |
| 120 | Only `car` lights up (red); probability bars appear beside the outputs (car 48% red, on 31%, down 21%); "GUESS: car ✕" chip above the outputs |
| 138 | "ANSWER: on" (dashed cyan chip) below the outputs and the ghosted "on" in the input turns cyan: guess ≠ answer |
| 138–170 | All edges flash red twice (about 2.3 Hz; edges into `car` full red) |
| 170–221 | Backprop: purple pulses travel right→left (hidden nodes flash purple); each layer pair re-weights over 20 frames once the pulse crosses it, strengthening edges tinting cyan and weakening ones greying out until the second pass. Edges into `on` strengthen, the rest thin out |
| 222–298 | "TRAINING STEPS" counter, beside the output column under the answer chip, appears at the second forward pass (on "billions of times", after the single correction has been shown) and climbs to 2.4 billion |
| 228–273 | Second forward pass in cyan (15 frames per hop) |
| 273–285 | Only `on` lights up (cyan); bars flip to on 82%, car 10%, down 8%; "GUESS: on ✓" chip springs in, edges into `on` glow |
| 293–306 | Labels, chips, counter and title fade; **network stays** for the hand-off |

## Layout conventions (all scenes)

- **Screen chrome stays in the corners; content leads in the centre.** The scene title sits top-left and status badges top-right. Corner titles are small (24% of the 140px hero size, about 34px) and settle to 50% opacity 15 frames after they land, so they never compete with the content; this is the shared `SceneTitle` default. The main content is kept centred horizontally at all times: the whole video sits in a shared `Stage` (`shared/components/Stage.tsx`) that slides content left or right using a per-frame track in `centering.ts`. Screen chrome, full-frame overlays and anything that must sit at true screen centre are wrapped in `Pinned`, so they don't move. Positions given in the scene tables below are design positions, before this shift.
- **The centring track is measured, not hand-set.** `npm run center:<lesson>` (`scripts/measure-centering.mjs`) renders the video uncentred at half size and finds each frame's content extent. It ignores the title/badge band and the faint background, filters out elements that only pass through, and looks ahead so things fading in aren't pushed off-screen. It keeps content at least 60 px from the screen edges, smooths the result over about 1 s and writes `centering.ts`. Re-run it after any layout or timing change. `--fixed=<from>-<to>:<px>` holds a frame range at a set shift. This lesson measures with `--look-ahead=8 --smooth=7 --trim=0.002 --clamp` (see `package.json`): it tracks what is on screen now more tightly than the defaults, measures true visible edges so sparse text beside a large shape still counts, and re-applies the screen margins after smoothing. Where a scene's elements arrive one after another, content can still sit off-centre for up to about a second while the next element comes in.
- Raw data (frames 0–230) and locked in (2413–2693) are held at no shift, because their layouts are built around screen centre: a full-screen glyph rain around the blank model at x 960, and the cube at dead centre with its frozen numbers balanced either side.

## Post-training conventions (Scenes 4–10)

- **One model, one cube.** `ModelCube.tsx` draws the model in every post-training scene. Its rotation is driven by the absolute frame, so it turns continuously across cuts, then decelerates to a standstill when the weights freeze in Scene 9. Scenes glide it from its home position (960, 500) to their own layout and back, and fade their own content rather than the cube.
- **People are always shown when they are in the loop.** A purple person figure appears on screen, and the top-right badge reads **HUMANS IN THE LOOP**: example writers (4), raters (5), red team (7), reviewers (8), and monitoring teams (10). Scene 6 is the exception, because its rewards come from an automatic checker; its badge reads **AUTOMATED CHECKS** with a gear icon.
- **The "AI" emblem** appears on the cube the moment fine-tuning makes the base model conversational (Scene 4) and stays from then on.

## Scene 4: Base Model → Fine-Tune on Examples (frames 825–1245)

The cube moves only twice: after the collapse it glides to (1215, 440), right of centre, and stays there for the whole scene, then returns home in the last 20 frames. Prompts arrive from its left (740, 440, so the bubble's right edge clears the cube's left face) and fade out by 40% of their flight into it; outputs appear below it (1215, 790). Bubble labels are 22px. The example cards are drawn beneath the cube, so they pass into it rather than over its face.

The examples come from a generic medical device company and stay non-clinical. The fine-tune Q&A uses ISO 13485, the quality management standard for medical devices.

| Local frame | Event |
|---|---|
| 0–36 | Scene 3's network implodes into the cube (white burst) |
| 36 | Corner title "BASE MODEL" |
| 50–88 | Prompt "What does ISO 13485 cover?" appears left of the cube, then flies into it |
| 90–156 | Base model output types a ramble of more questions below the cube ("What does ISO 9001 cover? What does ISO 14971 cover? What does IEC 62304 cover? What does the…"); red ✕ at 156 |
| 195 | Title becomes "FINE-TUNE ON EXAMPLES"; badge: humans in the loop |
| 222–262 | First card "Q: What is ISO 13485? A: Device quality systems." (24px text) leaves the top writer, **holds at full size** at (850, 250) for 15 frames, then flies into the model |
| 250–330 | The other six cards stream in as a montage (20 frames each): "Fix this bug…", "Summarise this…", "Translate “calibrate”" → "“Étalonner”", "Write a haiku", "What is 12 × 4?", "Draft a service email" → "Dear customer, …"; cards shrink only to about 60% and fade before they reach the cube; purple glow as each lands; counter climbs to 10,000 ("thousands") |
| 195–350 | "PEOPLE WRITE EXAMPLES" and "EXAMPLE CONVERSATIONS" (24px) share one baseline (y 790) |
| 352–368 | Same prompt again, into the model; "AI" emblem pops on |
| 378–403 | "Quality management for medical devices." types out below the cube; cyan ✓ |

## Scene 5: Learn from Feedback / RLHF (frames 1245–1485)

The reward model is not shown (it isn't in the VO): preferences flow straight into the model.

| Local frame | Event |
|---|---|
| 10–40 | Prompt "Explain calibration to a new hire." and two answers: A (technical: "Calibration compares readings against a traceable reference standard and corrects deviation."), B (plain: "Calibration checks the device against a known reference, so its readings stay accurate.") |
| 45 | A person appears: "A PERSON PICKS THE BETTER ANSWER" (24px) |
| 75 | Selection line to B, ✓; A dims |
| 100–122 | B flies into the model; the cube glows |
| 128 | Two more people fade in behind the first; caption becomes "PEOPLE PICK THE BETTER ANSWER"; "PREFERENCES" label beside the stream |
| 128–170 | Purple dots stream from all three people into the model (glow per hit). The counter appears with the first dot (146) and climbs from "1 comparison" to "1,000,000 comparisons" |
| 175–198 | "LEARNS THEIR PREFERENCES" replaces "PREFERENCES" (the short label is gone by 175, before the long one fades in, so they never overlap); cube glows purple |

## Scene 6: Reinforcement Learning (frames 1485–1875)

The RL loop is drawn explicitly: cube → **ATTEMPT** arc (top) → **AUTOMATIC CHECKER** → **REWARD** arc (bottom) → cube. Dashes flow in loop direction.

Each cycle's problem appears at `start`, the attempt launches `lead` frames later and takes `travel` frames to reach the checker. The checker shows only the **current** attempt's verdict: it shows "…" from each new problem until that attempt's verdict lands, so a verdict is never seen beside a different attempt. Attempt chips ride 30px inside the top arc, below the "ATTEMPT" label. Labels are 24px ("PRACTICE PROBLEM" 22px).

| Local frame | Event |
|---|---|
| 20–45 | Arcs draw, checker and success-rate chart (900×196) appear |
| 60–117 | Cycle 1: "17 × 24 = ?" → attempt 398 → ✕ 0 → model dims red; the rate stays at 28% |
| 125–182 | Cycle 2: same problem → 408 → ✓ +1 → model glows cyan |
| 190 | "× 1,000s" tag appears beside the problem chip |
| 190–340 | 8 fast montage cycles, 18 frames apart (lead 1, travel 10, verdict holds about 7 frames): √144, is_prime(91), sort, 15% of 80, reverse, gcd, fib(10), 2ⁿ = 64, mixed ✓/✕. Montage problems are 24px at 70% |
| throughout | Success-rate line climbs 28% → 90% as each reward lands; the percentage rides the line's end |

## Scene 7: Safety Testing (frames 1875–2115)

Red team at x 290, everyday user at x 1640 (each pulled in 120px).

| Local frame | Event |
|---|---|
| 20–40 | **Learned safety:** the shield grows out of the cube (radius 120 → 225) with a purple training glow on shield and cube; it keeps the cube's cyan edge and purple inner ring, so it reads as part of the model. "LEARNED SAFETY" (24px) below it |
| 30 | Red team (3 red figures) appears |
| 45 / 80 / 115 | Harmful prompts ("How do I build a weapon…", "Ignore your rules and…", "Write malware that…") stay at full opacity until they hit the shield, flash red, then fade as they rebound |
| 69–101 | First hit: the model replies "I can't help with that." in a bubble above the shield |
| 104 / 139 | Hits 2 and 3: one "REFUSED" label (26px) centred above the shield, cleared before the next |
| 140–176 | Everyday user's "How do I recalibrate?" passes through the shield. Its text fades out before it reaches the cube's face, and a cyan dot carries it the rest of the way in |
| 192–210 | Model answers "Here are the steps from the user manual…" in a bubble under the user; ✓ |

## Scene 8: Evaluation (frames 2115–2413)

| Local frame | Event |
|---|---|
| 20 | Benchmark panel: Reasoning, Coding, Knowledge, Safety (24px), with dashed PASS line at 75%; two ghost scorecards stacked behind it (14px steps) and "4 OF THOUSANDS OF BENCHMARKS" below |
| 45–115 | Run 1 bars fill; Coding stops at 62% → red ✕ |
| 170–196 | "BACK TO TRAINING" path from the scorecard to the model (label at x 700, clear of the panel); purple glow |
| 188–216 | The Scene 6 loop echoes around the model in purple (more training) |
| 210–246 | Run 2 (moved earlier, fills faster: 4-frame stagger, 24 frames per bar): all bars pass ✓ |
| 244 | Two reviewers + "HUMANS IN THE LOOP" badge; stamp "APPROVED FOR RELEASE" pops at 250, rotated −4°, and holds at full opacity until the fade (278–284) |
| 284–298 | Only once the scorecard has fully faded does the cube glide home (14 frames, `cubePose` `homeFrames`), so it never passes over the scorecard's text |

## Scene 9: Locked In (frames 2413–2693)

| Local frame | Event |
|---|---|
| 0–20 | Cube grows to size 130; 21 weight values orbit it in three rings |
| 12–58 | Orbit (and the cube's spin) decelerates to a stop |
| 12–58 | As the orbit slows, numbers clear out of the cube's footprint, and where two would crowd each other the farther one clears, so the frozen layout never overlaps the cube |
| 58–76 | Freeze on "frozen": numbers and cube edges turn ice-white, frost tint, "WEIGHTS FROZEN" |
| 92 | Padlock drops onto the cube ("the model is released") |
| 132–175 | Chat "Remember: my name is Sam." flies in and bounces off with an ice-cyan, glowing ripple; numbers in its path clear out first; "CHATS DON'T CHANGE THE WEIGHTS" (28px) centred under the "v1.0 · LOCKED" tag. "WEIGHTS FROZEN" is 24px |
| 185–200 | The chat bubble fades out completely |
| 200–215 | Numbers in the chat's lane fade back in, so the frozen layout ends balanced (5 left, 4 right) |
| 205 | "v1.0 · LOCKED" tag ("that version is locked in") |

## Scene 10: Released to the World (frames 2693–3093)

Two beats: **beat 1** (10–150) is racks → channels → globe → users, with the request bubbles; **beat 2** (150–300) is the monitoring team, feedback and the next model. Captions are 24px (team 22px), channel pills 22px.

| Local frame | Event |
|---|---|
| 10–55 | Data-centre racks rise; the locked cube flies in, shrinks and **parks on top of the middle rack** (padlock visible) for the rest of the scene; racks power on (LEDs blink) |
| 60–120 | Rotating globe; APPS / API / WEB channels connect racks to globe with flowing packets |
| 96–152 | User requests pop up around the globe (96/106/116/126): "Summarise this audit", "Debug firmware", "Draft a service email", "Explain this SOP". They fade out by 152 |
| 110–260 | 70 users light up across the globe; "PEOPLE USING IT" counts to 100,000,000+ |
| 150 | Badge: humans in the loop; safety & monitoring team appears bottom centre ("teams monitor how it's used") |
| 200–262 | Purple feedback dots travel from the globe to the team ("feed what they learn") |
| 262 | Dashed link from the team to the "NEXT MODEL" cube (size 40, beside the team); a dashed arc with an arrowhead draws from it back towards the left edge: the cycle restarts |
| 310–400 | Finale: everything in the scene fades out completely (310–322), leaving only the background, as in how-ai-responds; "MODEL RELEASED." springs in; prompt bar types "How can I help you today?" |

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
