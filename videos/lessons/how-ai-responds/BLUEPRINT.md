# How AI Responds: Visual Asset Blueprint

The sequel to `how-ai-trains`. That video ends with a locked model released to the world. This one follows a single prompt through that model: how the context is assembled, how it fills the context window, how the response is generated one token at a time, and what happens to it all afterwards.

Source material: `00-ai-concepts.md` §3 **Context** and **Generation**.

1920×1080 authoring space · 30 fps · 2544 frames (1:24.8) · 4K master via `--scale=2`.
Every visual is SVG or live text, so nothing is rasterised before the final render.

Every scene is timed to its recorded voiceover take (see [Voiceover script](#voiceover-script)).

## Run

This lesson is the `HowAIResponds` composition in the shared `videos/` Remotion project. Its code lives next to this file. Paths below are relative to this folder unless they start with `shared/`, `public/` or `scripts/` (project root).

```bash
cd videos
npm run studio               # live preview / scrubbing (composition: HowAIResponds)
npm run render:responds      # out/how-ai-responds/how-ai-responds-1080p.mp4
npm run render:responds:4k   # out/how-ai-responds/how-ai-responds-2160p.mp4 (3840×2160)
npm run sfx                  # regenerate the shared public/sfx/*.wav
npm run center:responds      # re-measure the centring track after layout or timing changes
```

| File | Contents |
|---|---|
| `timing.ts` | Scene lengths and every beat (scene-local frames); scenes and the cue sheet both read it |
| `layout.ts` | Cube and tank home positions, example capacity, the prompt, and the segment stacks reused across scenes |
| `shared/components/context/ContextTank.tsx` | The context window: segments, patterns, labels, ruler, readout, dashed "remaining" region |
| `centering.ts` | Generated per-frame horizontal shift that keeps content centred (`npm run center:responds`) |
| `shared/components/context/Pieces.tsx` | `LockedCube`, `StatusBadge`, `AppMarker`, `PromptBar`, and `textWidth` for sizing token chips |
| `scenes/*.tsx` | One file per scene |
| `audio.tsx` | Voiceover slots and the SFX cue sheet |

Shared with `how-ai-trains` (in `shared/`): theme, fonts, background, scene title, bubbles and marks, captions and gear, glow filter, the model cube (`shared/components/ModelCube.tsx`, which takes its yaw and stillness as props), maths and motion helpers, the scene timeline builder, and the narration-ducking mixer (`shared/audio.tsx`).

The context window (`ContextTank`) and `Pieces` moved to `shared/components/context/` when `how-ai-gets-context` started reusing them.

## Design tokens (`shared/theme.ts`)

These are the same as `how-ai-trains`, so the two videos read as one series.

| Token | Value | Use |
|---|---|---|
| charcoal | `#121212` | Background, node fills, panel fills |
| cyan | `#00F0FF` | Primary strokes, user input, generated output, progress |
| purple | `#9D4EDD` | Instructions, tool definitions, the app, feedback loops |
| white | `#FFFFFF` | All headline and label text |
| error | `#FF3B6B` | Wrong tokens, cut-off output, near-limit warnings, lost detail |

Type: Inter, as in `how-ai-trains`. 800 for headlines, 700 for labels, 500 for prompt and response text, `tabular-nums` for every counter. Same corner-title anchor (96, 72), badge position (right 96, top 52), and background (48px dot grid at 7% white drifting down 0.25 px/frame, radial vignette to 65% black).

## Series conventions

- **Screen chrome stays in the corners; content leads in the centre.** The scene title sits top-left and status badges top-right. Corner titles are small (24% of the 140px hero size, about 34px) and settle to 50% opacity 15 frames after they land, so they never compete with the content; this is the shared `SceneTitle` default. The main content is kept centred horizontally at all times: the whole video sits in a shared `Stage` (`shared/components/Stage.tsx`) that slides content left or right using a per-frame track in `centering.ts`. Screen chrome, full-frame overlays and anything that must sit at true screen centre are wrapped in `Pinned`, so they don't move. Positions given in the scene tables below are design positions, before this shift.
- **The centring track is measured, not hand-set.** `npm run center:<lesson>` (`scripts/measure-centering.mjs`) renders the video uncentred at half size and finds each frame's content extent. It ignores the title/badge band and the faint background, filters out elements that only pass through, and looks ahead so things fading in aren't pushed off-screen. It keeps content at least 60 px from the screen edges, smooths the result over about 1 s and writes `centering.ts`. Re-run it after any layout or timing change. `--fixed=<from>-<to>:<px>` holds a frame range at a set shift.
- **One window, one tank.** `ContextTank` draws the context window in every scene that needs it. Its home is centred at (1300, 560), 320 × 760 px. It has an optional 0–100% ruler on its left edge, 18px / 700 segment labels on its right edge (pushed apart so thin neighbours never overlap), and a token readout above it. The readout always says `EXAMPLE CAPACITY` (200,000 tokens) because real limits vary by model and product, and switches to `NEAR LIMIT` in error red at 90%.
- **Segment styles.** Colours alone don't tell the segments apart, so each type also gets its own fill pattern:

  | Segment | Fill |
  |---|---|
  | System instructions | Purple at 35%, solid |
  | Tool definitions | Purple at 10% with a purple 45° hatch and outline |
  | Conversation history | White at 18%, solid |
  | Documents | Cyan at 18%, horizontal ruled lines |
  | Your message | Cyan at 60%, solid |
  | Reasoning (hidden) | White at 6%, diagonal hatch the other way |
  | Output | Cyan at 85%, solid |
  | Summary | White at 32%, dashed white outline |

- **The model is the cube from video 1.** `LockedCube` shows the shared `ModelCube` frozen at the angle `how-ai-trains` stopped it at, with ice-white edges, padlock and "AI" emblem. Its home is (520, 540) at size 80. It never changes in this video, which is the point of Scene 8. It glows cyan while it is generating.
- **The app is shown when it acts.** When the AI product (not the model) does something (assembling context, compacting, adding saved instructions), a purple gear with the label **THE APP** appears, and the top-right badge reads **APP ACTION**. While output streams, the badge reads **STREAMING**.
- **One running example.** The prompt throughout is "What's the capital of Australia?", asked inside a trip-planning conversation, so every scene builds on the one before.

## Scene 1: Assemble the Context (frames 0–336)

| Local frame | Event |
|---|---|
| 0–18 | "STEP 1: CONTEXT" springs from 0.86 to 1.0 scale at dead centre |
| 40–70 | Title glides to top-left (scale 1 → 0.34) |
| 30–75 | Prompt bar (900 × 96, centred at (1190, 860)) rises 40px and types "What's the capital of Australia?"; label "YOUR MESSAGE" |
| 70–90 | Locked cube springs in at home; a dashed line draws from the prompt toward the model |
| 92 | Red ✕ snaps onto the line on "just your message"; "NOT JUST YOUR MESSAGE" in red under the bar |
| 120 | Gear + "THE APP" at (1080, 690) on "The app assembles"; badge: **APP ACTION** |
| 168 / 198 / 234 / 266 | Cards (380 × 136) fly in, each landing on its word: **SYSTEM INSTRUCTIONS** "You are a helpful travel assistant." (top-left), **CONVERSATION HISTORY** "Planning a 5-day trip in March…" (left), **DOCUMENTS** `trip-plan.md` (bottom), **TOOL DEFINITIONS** `search_web(query)` (top) |
| 292–326 | Cards and the prompt bar morph straight into their slices at the tank's home position; text fades, borders and fills become segment styles |
| 320–334 | Hand-off from the HTML cards to the SVG tank segments; badge fades |

## Scene 2: The Context Window (frames 336–636)

| Local frame | Event |
|---|---|
| 0–25 | Tank outline draws around the stacked input; ruler and readout fade in |
| 25–90 | Readout counts 0 → 112,000; each slice's label appears as the counter passes it (instructions 6%, tools 8%, history 18%, documents 22%, message 2%) |
| 122 | The readout pulses cyan on "measured in tokens" |
| 128–168 | **INPUT** bracket draws on the left, 0–56% |
| 160–200 | On "The response, and any hidden reasoning": cube glows; a dashed stream flows from the cube into the tank; hatched **REASONING (HIDDEN)** grows 56 → 63% |
| 200–238 | **OUTPUT** grows 63 → 74%; readout reaches 148,000 |
| 248 | Dashed **REMAINING** region outlines 74–100% on "what's left" |
| 282–300 | Labels, ruler and bracket fade; reasoning and output drain away so the tank holds input only |

## Scene 3: One Token at a Time (frames 636–996)

Layout: cube at home, tank shrinks to 192 × 456 at (1640, 540), score panel 580 × 340 centred at (1080, 420), response line along y = 860. A dashed cyan line flows from the tank back into the cube the whole time: the whole context feeds every step.

The answer is split into realistic tokens, with "Canberra" as two: `The` · ` capital` · ` of` · ` Australia` · ` is` · ` Can` · `berra` · `.`

| Local frame | Event |
|---|---|
| 0–25 | Layout transition; readout fades; "Q: What's the capital of Australia?" appears above the response line |
| 25–95 | First five tokens, 14 frames each: the panel (at 0.8 scale) shows that step's four candidates, the top one is ringed, its chip flies from the cube to the response line, and a cyan dot carries a sliver into the tank |
| 103–165 | On "It scores the likely next tokens", generation slows. The panel grows to full size with candidates for the next token: ` Can` 0.71, ` Sydney` 0.19, ` Melbourne` 0.06, ` the` 0.03 (bars stagger in 8 frames apart) |
| 166 | Selection ring springs onto ` Can` on "picks one" |
| 189–205 | ` Can` flies to the response line on "adds it" |
| 196–221 | Purple arrow draws from the response line into the tank: "EACH TOKEN BECOMES CONTEXT" |
| 210 / 226 | On "and repeats", two quick steps: `berra` and `.`, each with a small score tag (0.98, 0.91) above its chip; the panel stays on ` Can` |
| 244 | Dashed `END` chip appears after the full stop |
| 246 | On "Those scores are patterns", "SCORES ARE PATTERNS, NOT FACTS" (56px / 800) rises in above the panel |
| 262 / 300 | The ` Sydney` row pulses error red (the second on "not facts") |
| 340–358 | Everything except the cube fades, including the tank |

## Scene 4: Same Prompt, Different Answers (frames 996–1316)

The same prompt runs three times at each setting of a **VARIATION** slider (LOW ↔ HIGH, cyan → purple track) above three 980 × 96 lanes, **RUN 1–3**. This is about how much randomness the app allows when the model picks each token, not about reasoning.

| Local frame | Event |
|---|---|
| 0–20 | Slider and lanes appear; the knob sits in the middle |
| 20–92 | Staggered typing, all correct but worded differently: "Canberra is Australia's capital." · "Australia's capital city is Canberra." · "The capital of Australia is Canberra."; ✓ on each |
| 108–118 | Lanes clear |
| 120–145 | Knob glides to LOW |
| 148–186 | All three lanes type the same answer, "The capital of Australia is Canberra."; ✓ ✓ ✓ |
| 182–192 | Lanes clear |
| 192–215 | Knob glides to HIGH |
| 215–268 | "Canberra is the capital of Australia." ✓ · "Australia's capital? Canberra." ✓ · "The capital of Australia is Sydney." with "Sydney" typed in red |
| 268 | Red ✕ on run 3; its border turns red |
| 272 | On "correct", stamp "FLUENT ≠ CORRECT" slams in (scale 1.6 → 1, rotated −4°) |
| 305–320 | Content fades; cube stays |

## Scene 5: Lost in the Middle (frames 1316–1592)

| Local frame | Event |
|---|---|
| 0–12 | Empty tank fades in at home |
| 10–60 | On "A bigger window", the tank stretches to 980px tall with a **BIGGER WINDOW** double arrow; 16 document rows fill it to 92% |
| 92–110 | On "Details", row 8 lights purple ("PASSPORT RULE"), with a callout: **IN THE DOCUMENTS** "Passport must be valid for 6 months after arrival." |
| 105–150 | On "buried in the middle", attention beams fan out from the cube: rows near the top and bottom brighten, middle rows dim to 30%, the passport row and callout dim with them |
| 150–172 | **YOUR QUESTION** "Any document rules for my trip?" flies into the cube |
| 176–202 | **RESPONSE** types: "Just bring your booking confirmation." |
| 207 | On "overlooked": red ✕ on the response; the passport row pulses a red outline and reads **MISSED**; the callout turns red |
| 215 | Caption (28px): "Not a fixed zone. It varies by model, task and position." |
| 256–276 | Rows, beams and callouts fade; tank shrinks back to its home size |

## Scene 6: Compaction (frames 1592–1922)

The old and new contexts sit side by side: tank A moves to x = 780 and tank B sits at x = 1640, both 700 tall centred at y = 600 so their readouts clear the badge. The cube moves aside to (300, 540) at size 60.

| Local frame | Event |
|---|---|
| 0–18 | Tank at home fades in a quarter full (instructions, tools, early history) |
| 14–68 | Ten conversation turns stream in from the left as pills (4 frames apart) and drop in as history; readout climbs to 94% |
| ~64 | On "limit", the outline and readout turn error red at 90%: **NEAR LIMIT** |
| 72–98 | Tank A and the cube slide aside |
| 74 | On "the app", gear + "THE APP" above the funnel; badge: **APP ACTION** |
| 78–100 | A purple funnel draws between the tanks |
| 82–104 | Tank B's outline and readout draw on |
| 94–128 | On "compact it into a summary", the oldest history (14–82%) lifts out of tank A and squeezes through the funnel |
| 100–125 | Instructions and tool definitions copy across unchanged |
| 128 | A **SUMMARY** card pops out of the funnel: "Trip: Canberra, 5 days, March. Chose a hotel near Parliament."; tank A dims to 30% |
| 146–164 | The most recent turns copy across unchanged |
| 150–166 | The summary card shrinks into an 8% **SUMMARY** slice; tank B reads 68,000 tokens (34%) |
| 150 | On "That frees space", a dashed **SPACE FREED** region outlines 34–100% |
| 182 / 208 / 230 | On "decisions", "caveats" and "sources", detail leaks from the funnel's lower edge and is struck through in red as it falls: "Why we ruled out Melbourne" · "Dates still tentative" · "Link to visa rules" |
| 292–322 | Tank B glides to the home position; tank A, funnel and gear fade; the cube returns home |

## Scene 7: Stopping Generation (frames 1922–2202)

Two 1080 × 110 lanes centred at x = 1290; top-right badge: **STREAMING**.

| Local frame | Event |
|---|---|
| 0–14 | The compacted tank from Scene 6 fades away |
| 0–15 | Lanes **A** and **B** appear |
| 8–54 | Lane A streams "Pack warm layers. Canberra nights get cold in March." |
| 58 | On "natural end", a dashed `END` chip springs on after lane A's text |
| 14–114 | Lane B streams a structured record: `{"day": 3, "plan": "Visit Parliament House and the` |
| 110–114 | On "limit", a red **MAX OUTPUT** wall drops onto the lane's right edge (lane shakes ±4px for 6 frames); the cursor stops |
| 138–158 | On "mid-sentence", lane B turns red; the unfinished string gets a wavy red underline; a dashed red `"}` ghost shows what's missing; **INCOMPLETE** |
| 190 | On "finish reason", a tag under lane A: `FINISH REASON: STOP` cyan ✓ |
| 205 | On "tells you which", a tag under lane B: `FINISH REASON: LENGTH` red ✕ |
| 224 | Caption: "Check the finish reason, not just the text." |
| 265–280 | Content fades |

## Scene 8: Context Is Temporary (frames 2202–2544)

| Local frame | Event |
|---|---|
| 0–16 | The compacted tank fades back in; a window frame labelled **SESSION** draws around the cube and tank |
| 30–40 | On "ends", the close button flashes red |
| 36–50 | The frame folds away; the corner title "AFTER THE SESSION" and the readout appear |
| 50–92 | On "the context is gone", the tank drains from the top; 28 particles fall away below it; readout counts to 0 |
| 104–126 | On "Nothing was added to the weights", push in on the cube (to (960, 500), size 120); the empty tank fades |
| 110–158 | Frozen weight values sit around the cube, perfectly still, with **WEIGHTS UNCHANGED** above and the "v1.0 · LOCKED" tag below (callback to video 1 Scene 9) |
| 152–174 | Push back out to home |
| 158–178 | On "Each new request", a new, empty tank draws at home |
| 210 | Gear + "THE APP"; badge: **APP ACTION** |
| 212–234 | On "only what the app puts in", a **SAVED INSTRUCTIONS** slice (5%) drops in and bounces; readout 10,000; caption "ONLY WHAT THE APP ADDS" |
| 250–268 | Finale: everything in the scene (cube, tank, labels, badge, corner title) fades out completely, leaving only the background |
| 270 | On the empty background, "CONTEXT IS TEMPORARY." (110px) springs in at centre x, y = 450, then scales 1 → 1.06 to the end |
| 288–326 | Prompt bar types "What's the capital of Australia?" with a blinking cursor, looping back to Scene 1 |

## Voiceover script

| # | File | Line | Words / scene length |
|---|---|---|---|
| 1 | `01-assemble.wav` | "When you send a prompt, the model doesn't see just your message. The app assembles a context: instructions, conversation history, documents and tool definitions." | 25 / 11.2 s (recorded: 10.4 s) |
| 2 | `02-window.wav` | "That context fills a fixed space called the context window, measured in tokens. The response, and any hidden reasoning, has to fit in what's left." | 25 / 10 s (recorded: 9.2 s) |
| 3 | `03-tokens.wav` | "The model then writes its answer one token at a time. It scores the likely next tokens, picks one, adds it, and repeats. Those scores are patterns, not facts." | 30 / 12 s (recorded: 10.9 s) |
| 4 | `04-settings.wav` | "Ask the same question twice and you can get different answers. Apps can turn that variation up or down, but a fluent answer still isn't proof it's correct." | 28 / 10.7 s (recorded: 9.8 s) |
| 5 | `05-middle.wav` | "A bigger window doesn't guarantee better use. Details buried in the middle of a long context can be overlooked." | 19 / 9.2 s (recorded: 7.4 s) |
| 6 | `06-compaction.wav` | "When a long conversation nears the limit, the app may compact it into a summary. That frees space, but decisions, caveats and sources can be lost." | 27 / 11 s (recorded: 9.4 s) |
| 7 | `07-stopping.wav` | "Generation stops at a natural end, or when it hits a limit, sometimes mid-sentence. The finish reason tells you which." | 20 / 9.3 s (recorded: 7.7 s) |
| 8 | `08-temporary.wav` | "And when the session ends, the context is gone. Nothing was added to the weights. Each new request starts with only what the app puts in." | 27 / 11.4 s (recorded: 8.2 s) |

Put recorded takes in `public/vo/how-ai-responds/`; each plays automatically once its file exists. Every scene is synced to its recorded take; the phrase times are noted in `timing.ts`. To swap in a new take, measure its phrase timings, change the scene's length in `timing.ts`, and move its beats to match.

## Audio

- **SFX** come from the shared library generated by `scripts/generate-sfx.mjs`. This lesson added four sounds to it:

  | Sound | Used for |
  |---|---|
  | `pour.wav` | Input filling the window (Scene 2) |
  | `squeeze.wav` | History squeezed through the funnel (Scene 6) |
  | `cut-off.wav` | The MAX OUTPUT wall (Scene 7) |
  | `drain.wav` | Generated output draining (Scene 2) and the session's context draining (Scene 8) |

  It also reuses rapid-typing, tick-up, data-pulse, error-buzzer, lock-click, power-up, rating-ding, absorb-whoosh, chime, synth-swell, shield-hit, slice, space-hum, freeze and pop.
- **Cue sheet** is `SFX` in `audio.tsx`. Every cue is written as (scene, local frame) from `timing.ts`, so re-timing a scene moves its sounds with it.
- **Ducking:** the shared mixer drops beds about 11 dB and accents about 6 dB under narration, as in `how-ai-trains`.

## Out of scope

These Context and Generation topics are left out to keep the video under 90 seconds. They could appear in a later video:

- **Prompt caching:** fits a future video on cost and speed.
- **Structured output validation** (shape versus truth): Scene 7 touches on it, and it could be a short of its own.
- **Context across requests in multi-step tool use:** this belongs in the planned **Agentic Systems** video, which can reuse `ContextTank` to show tool calls going out and tool results coming in.
