# How AI Responds: Visual Asset Blueprint

The sequel to `how-ai-trains`. That video ends with a locked model released to the world. This one follows a single prompt through that model: how the context is assembled, how it fills the context window, how the response is generated one token at a time, and what happens to it all afterwards.

Source material: `00-ai-concepts.md` §3 **Context** and **Generation**.

1920×1080 authoring space · 30 fps · 2574 frames (1:25.8) · 4K master via `--scale=2`.
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
- **The centring track is measured, not hand-set.** `npm run center:<lesson>` (`scripts/measure-centering.mjs`) renders the video uncentred at half size and finds each frame's content extent. It ignores the title/badge band and the faint background, filters out elements that only pass through, and looks ahead so things fading in aren't pushed off-screen. It keeps content at least 60 px from the screen edges, smooths the result over about 1 s and writes `centering.ts`. Re-run it after any layout or timing change. `--fixed=<from>-<to>:<px>` holds a frame range at a set shift. This lesson measures with `--look-ahead=8 --smooth=7 --trim=0.002 --clamp` (see `package.json`): it tracks what is on screen now more tightly than the defaults, measures true visible edges so sparse text beside a large shape still counts, and re-applies the screen margins after smoothing. Where a scene's elements arrive one after another, content can still sit off-centre for up to about a second while the next element comes in.
- **One window, one tank.** `ContextTank` draws the context window in every scene that needs it. Its home is centred at (1300, 560), 320 × 760 px. It has an optional 0–100% ruler on its left edge, segment labels on its right edge (pushed apart so thin neighbours never overlap; a segment's `labelNudge` moves its label down onto a short leader tick), and a token readout above it. This lesson passes `TANK_TEXT` (`layout.ts`) to every tank through `ContextTank`'s optional `textSizes` prop: 20px labels at least 28px apart, 18px ruler figures, an 18px "% · EXAMPLE CAPACITY" line, 18px in-segment text and a 22px remaining-region label. Lessons that leave `textSizes` out keep the original sizes. The readout always says `EXAMPLE CAPACITY` (200,000 tokens) because real limits vary by model and product, and switches to `NEAR LIMIT` in error red at 90%.
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
- **One running example.** The viewer works at a medical device company. The prompt throughout is "What's the device QMS standard?", asked inside a conversation about preparing for a quality audit, so every scene builds on the one before. The correct answer is ISO 13485; ISO 9001 (the general quality standard) is the plausible-but-wrong pattern used in Scenes 3 and 4. The examples stay non-clinical: no patients, diagnoses or results.

## Scene 1: Assemble the Context (frames 0–336)

| Local frame | Event |
|---|---|
| 0–18 | "CONTEXT" springs from 0.86 to 1.0 scale at dead centre |
| 24–54 | Title glides to top-left (scale 1 → 0.34), clearing the centre for the prompt bar |
| 30–75 | Prompt bar (900 × 96) rises 40px into the vertical centre of the screen, where it stays until the first card arrives (y = 560, so the bar and its "YOUR MESSAGE" label are centred together) and types "What's the device QMS standard?" |
| 70–92 | The bar stays centred while the cube arrives beside it; the red ✕ lands in the short gap between them |
| 70–90 | Locked cube springs in at home; a solid line (white at 60%) draws from the left end of the prompt bar to the model's side |
| 92 | Red ✕ snaps onto the line on "just your message"; "NOT JUST YOUR MESSAGE" (28px) in red under the bar |
| 120 | On "The app assembles", the app's tray draws around the message: a dashed purple frame (960 × 640, centred at (1190, 520), 5% purple fill) with a small gear + "THE APP" tab on its top edge; badge: **APP ACTION**. The app reads as the container that gathers everything, rather than as a label floating above the message |
| 154–178 | As the system instructions card arrives, the bar glides down to its place at (1190, 760), its label moving with it |
| 168 / 198 / 234 / 266 | Cards (380 × 136) glide 70px in from their side while fading in, always inside the tray, each landing on its word, into a 2 × 2 grid with even 44px gaps centred over the prompt bar: **SYSTEM INSTRUCTIONS** "You are a quality assistant." (top-left), **CONVERSATION HISTORY** "Preparing for the March audit…" (left), **DOCUMENTS** `qms-manual.pdf` (right), **TOOL DEFINITIONS** `search_docs(query)` (right); card labels 18px, body 24px |
| 280–292 | All card text, the prompt text and the "YOUR MESSAGE" label fade out before anything moves; the tray fades with them |
| 292–326 | One at a time, 4 frames apart and bottom slice first (instructions, tools, history, documents, then the prompt bar as the message), each shape moves for 18 frames into its slice at the tank's home position, its border and fill becoming the segment style. Each card first shrinks in place to its slice's size (the first 35% of its move), then the slim slice travels, so the moving boxes stay small and clear of each other. A card that has started moving rides above the ones still waiting, and the prompt bar stays underneath, so slices stack over it and it rises last from behind |
| 320–334 | Hand-off from the HTML cards to the SVG tank segments; badge fades |

## Scene 2: The Context Window (frames 336–636)

| Local frame | Event |
|---|---|
| 0–25 | Tank outline draws around the stacked input; ruler and readout fade in |
| 25–90 | Readout counts 0 → 112,000; each slice's label appears as the counter passes it (instructions 6%, tools 8%, history 18%, documents 22%, message 2%). The thin message slice's label sits 24px below the slice on a short leader, clear of REASONING (HIDDEN) above |
| 122 | The readout pulses cyan on "measured in tokens" |
| 128–168 | **INPUT** bracket draws on the left, 0–56% |
| 160–200 | On "The response, and any hidden reasoning": cube glows; a dashed stream flows from the cube into the tank; hatched **REASONING (HIDDEN)** grows 56 → 63% (output has no height until reasoning finishes) |
| 200–238 | **OUTPUT** grows 63 → 74%; readout reaches 148,000 |
| 248 | Dashed **REMAINING** region outlines 74–100% on "what's left" |
| 282–300 | Labels, ruler and bracket fade; reasoning and output drain away so the tank holds input only |

## Scene 3: One Token at a Time (frames 636–996)

Layout: cube at home, tank shrinks to 192 × 456 at (1640, 540), score panel 580 × 340 centred at (1080, 420), response line along y = 860. A faint dashed cyan line (30%) flows from the tank back into the cube while the answer generates: the whole context feeds every step. As each new token starts its flight, the earlier chips dim to 40%, so the newest token always stands out. From frame 256 (abs 892) the centring track holds a fixed 84px shift that centres the cube and panel together, while the response line glides by the opposite amount, so both rows finish centred on screen.

The answer, "The QMS standard is ISO 13485.", is split into realistic tokens, with the number as two (tokenizers split long numbers): `The` · ` QMS` · ` standard` · ` is` · ` ISO` · ` 134` · `85` · `.`

Each chip drops from the cube to a lane 80px above the response line, travels along it, then drops into its slot, so it never passes over the score panel's rows or the tokens already in the line.

| Local frame | Event |
|---|---|
| 0–25 | Layout transition; readout fades; the question "What's the device QMS standard?" appears in a prompt box on the response line, then fades out as the first answer token flies in (24–36), leaving the line to the answer |
| 25–95 | First five tokens, 14 frames each: the panel (at 0.8 scale and 70% opacity, a montage) shows that step's four candidates, the top one is ringed, its chip flies from the cube to the response line, and a cyan dot carries a sliver into the tank |
| 103–165 | On "It scores the likely next tokens", generation slows. The panel grows to full size with candidates for the next token: ` 134` 0.71, ` 900` 0.19 (as in ISO 9001), ` 149` 0.06, ` the` 0.03 (shown as the token pieces they would be; rows and bars stagger in 8 frames apart; each score shows its final value at once and only the bar grows) |
| 166 | Selection ring springs onto ` 134` on "picks one" |
| 189–205 | ` 134` flies to the response line on "adds it" |
| 196–221 | Purple arrow draws from the response line into the tank: "EACH TOKEN BECOMES CONTEXT" (22px) |
| 210 / 226 | On "and repeats", two quick steps: `85` and `.`; the panel stays on ` 134` |
| 244 | Dashed `END` chip appears after the full stop |
| 242–262 | On "Those scores are patterns", the generation scaffolding clears away: the window, the feed line and the purple loop arrow with its caption all fade, and the response line dims to 40%. At the same time the score panel slides down 120px to line up with the cube, and the cube-and-panel row and the response line each glide to true screen centre |
| 274 | Only once that has settled, "SCORES ARE PATTERNS, NOT FACTS" (48px / 800) rises in just above the panel (top 250) |
| 282 / 300 | The ` 900` row pulses error red (the second on "not facts") |
| 340–358 | Everything except the cube fades |

## Scene 4: Same Prompt, Different Answers (frames 996–1346)

The same prompt runs three times at each setting of a **VARIATION** slider (LOW ↔ HIGH at 22px, full white when active and 50% otherwise; cyan → purple track) above three 980 × 96 lanes, **RUN 1–3** (20px). This is about how much randomness the app allows when the model picks each token, not about reasoning.

| Local frame | Event |
|---|---|
| 0–20 | Slider and lanes appear; the knob sits in the middle |
| 20–92 | Staggered typing, all correct but worded differently: "ISO 13485 is the device QMS standard." · "The device QMS standard is ISO 13485." · "The QMS standard is ISO 13485."; ✓ on each |
| 108–118 | Lanes clear |
| 120–145 | Knob glides to LOW |
| 148–186 | All three lanes type the same answer, "The QMS standard is ISO 13485."; ✓ ✓ ✓ |
| 182–192 | Lanes clear |
| 192–215 | Knob glides to HIGH |
| 215–268 | "ISO 13485 covers device quality systems." ✓ · "Device QMS? ISO 13485." ✓ · "The QMS standard is ISO 9001." with "ISO 9001" typed in red |
| 268 | Red ✕ on run 3; its border turns red |
| 266–278 | As the stamp lands, the slider dims to 30% and runs 1 and 2 to 35%, leaving run 3 and the stamp as the focus |
| 272 | On "correct", stamp "FLUENT ≠ CORRECT" (40px) slams in at y = 880 (scale 1.45 → 1, rotated −4°), clear of run 3 even on its first frame. No caption under it, to keep the ending's text to a minimum |
| 340–350 | After a 2 s hold on the stamp, content fades; cube stays |

## Scene 5: Lost in the Middle (frames 1346–1622)

| Local frame | Event |
|---|---|
| 0–12 | Empty tank fades in at home |
| 10–60 | On "A bigger window", the tank stretches to 900px tall (y 110–1010, inside the screen margins) with a **BIGGER WINDOW** double arrow; 16 document rows fill it to 92% |
| 92–110 | On "Details", row 8 lights purple ("RECORDS RULE", 18px), with a short callout (22px, no label, since the row names it): "Keep for the device's lifetime." |
| 105–150 | On "buried in the middle", attention beams fan out from the cube: thick and bright to the top and bottom rows, thinner and fainter towards the middle, and none at all to rows 6–11. Middle rows dim to 15%; the records row and callout dim with them |
| 128–172 | The question "How long do we keep records?" (no label) appears bottom-left at 128 and holds, then flies into the cube (150–172) |
| 176–202 | The response types (no label): "Just keep them for a year." |
| 207 | On "overlooked": red ✕ on the response; the records row pulses a red outline and reads **MISSED**; the callout turns red (its text stays the same, so MISSED appears only once) |
| 215 | Caption in a dim pill (26px), centred at (560, 985): "It varies by model and task." |
| 256–276 | Rows, beams and callouts fade; tank shrinks back to its home size |

## Scene 6: Compaction (frames 1622–1952)

The old and new contexts sit side by side: tank A moves to x = 780 and tank B sits at x = 1640, both 700 tall centred at y = 600 so their readouts clear the badge. The cube moves aside to (300, 540) at size 60.

| Local frame | Event |
|---|---|
| 0–18 | Tank at home fades in a quarter full (instructions, tools, early history) |
| 14–68 | Ten short conversation turns (a few words each: "Which SOPs need updating?" · "SOP-12 and SOP-15." · "What about SOP-9?" · "Retired last year." · "Skip SOP-9." · "Audit checklist?" · "Three sections…" · "Date may move." · "Need the standard?" · "Here’s the ISO link.") appear as a left-aligned transcript (20px pills, 4 frames apart, left edge x = 640) in evenly spaced rows between the cube and the tank. Each slides right along its own row and shrinks to 60%, fully faded by the time its right edge reaches the tank's edge, so no two ever cross and none is clipped; readout climbs to 94% |
| ~64 | On "limit", the outline and readout turn error red at 90%: **NEAR LIMIT** |
| 72–98 | Tank A and the cube slide aside |
| 74 | On "the app", gear + "THE APP" above the funnel; badge: **APP ACTION**. The gear fades out by 120 (the badge stays), so the summary card is the only new element when it pops |
| 78–100 | A purple funnel draws between the tanks |
| 82–104 | Tank B's outline and readout draw on |
| 94–128 | On "compact it into a summary", the oldest history (14–82%) lifts out of tank A and squeezes through the funnel |
| 100–125 | Instructions and tool definitions copy across unchanged |
| 114–128 | Tank A and its readout dim to 30% before the card pops |
| 128 | A 440px **SUMMARY** card (18px label, 22px text) pops out of the funnel to centre stage at (1210, 410), midway between the tanks: "Audit in March. Update SOP-12 and SOP-15."; it holds until 162 (about 1.1 s) |
| 158–176 | The most recent turns fade into place in tank B (no block crosses the frame, so nothing passes the card) |
| 162–178 | The summary card shrinks to the slice's width early in its flight (the first 30%) and has faded by 40% of it, so it is nearly gone before it crosses tank B's outline; the 8% **SUMMARY** slice fades in under it; tank B reads 68,000 tokens (34%) |
| 178 | At the end of "That frees space", once the summary has landed, a dashed **SPACE FREED** region outlines 34–100% |
| 182 / 208 / 230 | On "decisions", "caveats" and "sources", a detail (24px) slips out of the funnel's lower edge and drops into a pile centred under the funnel's opening (x = 1200), each settling 56px above the one before so none falls through another: "Why skip SOP-9" (bottom) · "Date may move" · "ISO standard link" (top). Each is tagged on its left with the word the narrator uses for it, in red 18px capitals: **DECISION**, **CAVEAT**, **SOURCE**. Each is readable for about 0.6 s before a red strike-through draws across it; it then dims to 55%, and the struck-through pile stays until the funnel fades |
| 272–290 | The funnel fades out completely |
| 292–322 | Tank B glides to the home position; tank A fades; the cube returns home |

## Scene 7: Stopping Generation (frames 1952–2232)

Two 1080 × 110 lanes centred at x = 1290; top-right badge: **STREAMING**.

| Local frame | Event |
|---|---|
| 0–6 | The compacted tank from Scene 6 fades away, clear before the lanes are more than faintly visible |
| 0–15 | Lanes **A** and **B** appear |
| 8–54 | Lane A streams "Calibrate monthly. Log each check in the QMS." |
| 58 | On "natural end", a dashed `END` chip springs on after lane A's text |
| 14–114 | Lane B streams a structured record, cut off mid-word: `{"step": 3, "action": "Replace the filter, then rec` |
| 110–114 | On "limit", a red **MAX OUTPUT** wall drops 60px and fades in (so it never passes over lane A) right after lane B's last character (x = 1582; the limit is a token count, not a width), and the lane's unused width beyond it is hatched red (lane shakes ±4px for 6 frames); the cursor stops |
| 138–158 | On "mid-sentence", lane B turns red; the unfinished string gets a wavy red underline; a dashed red `"}` ghost past the wall shows what's missing (no INCOMPLETE label: the red lane, underline and ghost already say it) |
| 190 | On "finish reason", a tag under lane A: `FINISH REASON: STOP` cyan ✓ |
| 205 | On "tells you which", a tag under lane B: `FINISH REASON: LENGTH` red ✕. The two tags are the scene's conclusion; no caption or footnote is added, so nothing competes with them |
| 265–280 | Content fades |

## Scene 8: Context Is Temporary (frames 2232–2574)

| Local frame | Event |
|---|---|
| 0–16 | The compacted tank fades back in; a window frame labelled **SESSION** (20px, in a 56px title bar) draws around the cube and tank |
| 30–40 | On "ends", the close button (radius 21) flashes red |
| 36–50 | The frame folds away; the corner title "AFTER THE SESSION" appears, then the readout (50–58, once the frame has gone) |
| 50–92 | On "the context is gone", the tank drains from the top; 28 particles fall away below it; readout counts to 0 |
| 104–126 | On "Nothing was added to the weights", push in on the cube (to (960, 500), size 120); the empty tank fades |
| 110–158 | Frozen weight values sit around the cube, perfectly still (none inside the cube's footprint or crowding each other), with **WEIGHTS UNCHANGED** above and the "v1.0 · LOCKED" tag below (callback to video 1 Scene 9) |
| 152–174 | Push back out, to 120px right of home (640, 540), so the cube and the new tank read as one group |
| 158–178 | On "Each new request", a new, empty tank draws at home |
| 210 | Gear + "THE APP" at (870, 300), between the cube and the tank and clear of the dropping slice's label; badge: **APP ACTION** |
| 212–234 | On "only what the app puts in", a **SAVED INSTRUCTIONS** slice (8%) drops in and bounces, with a brief purple glow as it first lands (219); readout 16,000. The caption "ONLY WHAT THE APP ADDS" (26px, white) appears on "only" (204) and holds until the finale fade, about 1.3 s at full opacity |
| 250–268 | Finale: everything in the scene (cube, tank, labels, badge, corner title) fades out completely, leaving only the background |
| 270 | On the empty background, "CONTEXT IS TEMPORARY." (110px) springs in at centre x, y = 450, then scales 1 → 1.06 to the end |
| 288–326 | Prompt bar types "What's the device QMS standard?" with a blinking cursor, looping back to Scene 1 |

## Voiceover script

| # | File | Line | Words / scene length |
|---|---|---|---|
| 1 | `01-assemble.wav` | "When you send a prompt, the model doesn't see just your message. The app assembles a context: instructions, conversation history, documents and tool definitions." | 25 / 11.2 s (recorded: 10.4 s) |
| 2 | `02-window.wav` | "That context fills a fixed space called the context window, measured in tokens. The response, and any hidden reasoning, has to fit in what's left." | 25 / 10 s (recorded: 9.2 s) |
| 3 | `03-tokens.wav` | "The model then writes its answer one token at a time. It scores the likely next tokens, picks one, adds it, and repeats. Those scores are patterns, not facts." | 30 / 12 s (recorded: 10.9 s) |
| 4 | `04-settings.wav` | "Ask the same question twice and you can get different answers. Apps can turn that variation up or down, but a fluent answer still isn't proof it's correct." | 28 / 11.7 s (recorded: 9.8 s, plus a 2 s hold on the stamp) |
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
