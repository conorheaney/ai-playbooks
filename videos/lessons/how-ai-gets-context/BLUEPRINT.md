# How AI Gets Context: Visual Asset Blueprint

The third video in the series. `how-ai-trains` ends with the model's weights locked, and `how-ai-responds` shows that the model only works from what is in its context window. This video answers the question that leaves open: **how does the right information get into that window?** It follows the four pathways from `00-ai-concepts.md`: the prompt, context engineering, retrieval-augmented generation (RAG) and memory.

Source material: `00-ai-concepts.md` §4 **Information Pathways**.

1920×1080 authoring space · 30 fps · 2796 frames (1:33.2) planned · 4K master via `--scale=2`.
Every visual is SVG or live text, so nothing is rasterised before the final render.

Scene lengths are estimates from the script at about 2.5 words per second, plus room for each scene's hand-off. Once the takes are recorded, re-time every scene to its take, as with `how-ai-responds`. That video's takes ran about 10% shorter than planned, so expect a finished length of about 1:25.

## Run

This lesson is the `HowAIGetsContext` composition in the shared `videos/` Remotion project. Its code lives next to this file. Paths below are relative to this folder unless they start with `shared/`, `public/` or `scripts/` (project root).

```bash
cd videos
npm run studio               # live preview / scrubbing (composition: HowAIGetsContext)
npm run render:context       # out/how-ai-gets-context/how-ai-gets-context-1080p.mp4
npm run render:context:4k    # out/how-ai-gets-context/how-ai-gets-context-2160p.mp4 (3840×2160)
npm run sfx                  # regenerate the shared public/sfx/*.wav
npm run center:context       # re-measure the centring track after layout or timing changes
```

| File | Contents |
|---|---|
| `timing.ts` | Scene lengths and every beat (scene-local frames); scenes and the cue sheet both read it |
| `layout.ts` | Home positions, the running example's text, the search index's slots and candidates, and Scene 6's window (which Scene 7 picks up) |
| `components/Parts.tsx` | `DocIcon`, `RefChip` / `RefChipHtml` (reference chips), `InfoCard` (labelled card), `Stamp`, `Note` (sentence-case caption) and `FlowLine` (dashed "feeds into" line) |
| `components/SearchIndex.tsx` | The search index grid of chunk slots, with the scan line; `slotRect` gives a slot's position |
| `components/MemoryStore.tsx` | The app's memory store: a purple cabinet of three drawers |
| `centering.ts` | Generated per-frame horizontal shift that keeps content centred (`npm run center:context`) |
| `scenes/*.tsx` | One file per scene |
| `audio.tsx` | Voiceover slots and the SFX cue sheet |

### Shared with `how-ai-responds`

The context pieces now live in `shared/components/context/`, and both lessons import them from there:

- `ContextTank.tsx`: the context window, with the two new segment kinds below.
- `Pieces.tsx`: `LockedCube`, `StatusBadge`, `AppMarker`, `PromptBar` and `textWidth`. `StatusBadge` gained three kinds for this lesson: **AHEAD OF TIME** (clock), **PER QUESTION** (magnifier) and **REVIEW** (check); **APP ACTION** and **STREAMING** are unchanged.

After the move, `HowAIResponds` was re-rendered and compared with the previous render. The audio is byte-identical. Every frame is identical except one 20-frame run (frames 980–999, during Scene 3's fade-out), where the frames look the same but differ slightly at the pixel level. The funnel and stamp in `how-ai-responds` stay in that lesson's scenes; this lesson has its own `Stamp` in `components/Parts.tsx`.

## Design tokens (`shared/theme.ts`)

These are unchanged from the first two videos.

| Token | Value | Use |
|---|---|---|
| charcoal | `#121212` | Background, node fills, panel fills |
| cyan | `#00F0FF` | Primary strokes, the user's prompt, sources, retrieved chunks, generated output |
| purple | `#9D4EDD` | The app, instructions, context engineering, memory |
| white | `#FFFFFF` | All headline and label text |
| error | `#FF3B6B` | Blocked information, outdated or conflicting material, unsupported claims |

Type: Inter, as before. 800 for headlines, 700 for labels, 500 for prompt, answer and document text, `tabular-nums` for every counter and score. Same corner-title anchor (96, 72), badge position (right 96, top 52) and background.

## Series conventions

All the conventions in `how-ai-responds/BLUEPRINT.md` apply: corner chrome and centred content (the `Stage`/`Pinned` centring track), one window drawn by `ContextTank`, the locked cube as the model, and the purple **THE APP** gear and **APP ACTION** badge whenever the app (not the model) acts. This lesson adds:

- **Two new segment kinds** in `ContextTank`, each with its own fill pattern so colour isn't the only difference:

  | Segment | Fill |
  |---|---|
  | Retrieved chunk | Cyan at 28% with a fine dot pattern; its label carries a source chip, e.g. `RETRIEVED · §4.2` |
  | Memory | Purple at 22% with a dot pattern and a dashed purple outline |

  The prompt uses the existing **Your message** style (cyan at 60%, solid), and documents chosen by context engineering use the existing **Documents** style.
- **Reference chips.** A source reference is always a small cyan chip in square brackets, e.g. `[§4.2]`, 18px / 700 on a cyan-outlined pill. The same chip appears on chunks, retrieved slices and answer claims, so viewers can follow one reference through the whole pipeline.
- **Left-out material** goes to a **LEFT OUT** tray below where it started, dimmed to 35% with a red tag naming the reason. It never just vanishes, because the point is that the app chose to leave it out.
- **Ahead of time versus per question.** RAG has two separate phases. The top-right badge names the phase: **AHEAD OF TIME** for preparation (Scene 5) and **PER QUESTION** for retrieval (Scene 6).
- **The model never saves anything.** In Scene 8 the model may propose a memory, but only the app's gear ever writes to the store.

## Running example

The series' trip continues. The viewer is now booking the Canberra trip from `how-ai-responds`, and asks the AI about **company travel policy**. That works well here because a private policy document can't be in the model's weights, so every pathway has a reason to exist.

| Item | Text |
|---|---|
| Question | "What's our hotel allowance in Canberra?" |
| Policy source | `travel-policy-2025.pdf`, §3.1 "All bookings go through the travel portal." · §4.2 "Accommodation: up to $250 a night in capital cities." · §4.3 "Taxis: keep receipts over $30." |
| Outdated source | `travel-policy-2019.pdf` |
| Conflicting source | An email: "I think the limit's $400 now?" |
| Hotel list | `hotel-options.md`: Parkside Hotel $235, Lakeview Suites $245, Capital Tower $289 |
| Memory | "Prefers hotels near Parliament House" (a callback to the Scene 6 summary in `how-ai-responds`) |

All amounts, section numbers and hotel names are invented, and the video never presents them as real policy or real businesses.

## Scene 1: Beyond the Weights (frames 0–324)

| Local frame | Event |
|---|---|
| 0–18 | "BEYOND THE WEIGHTS" springs from 0.86 to 1.0 scale at dead centre |
| 40–70 | Title glides to the top-left corner |
| 20–50 | Locked cube springs in at home (520, 540) with the "v1.0 · LOCKED" tag under it |
| 60–94 | On "fixed after training", frozen weight values fade in around the cube, perfectly still (callback to `how-ai-trains` Scene 9) |
| 130 / 180 / 220 | Three cards (340 × 110) fly in from the right toward the cube, each landing on its word: **YOUR FILES** `q3-report.xlsx`, **COMPANY RULES** `travel-policy-2025.pdf`, **TODAY'S NEWS** "Airport strike announced". Each bounces off the padlock with a red ✕ (its border flashes red) and settles at x = 1090, clear of the weight values |
| 240–268 | Weight values fade; an empty context window (300 × 640) draws at (1560, 560) |
| 262–292 | On "unless they reach the context", the three cards turn cyan and drop into the window as slices; a dashed cyan line flows from the window into the cube; caption under the window: "THE ONLY WAY IN" |
| 306–324 | Cards, window and caption fade; the cube stays |

## Scene 2: The Prompt (frames 324–648)

Layout: cube at home; brief card 760 × 600 centred at (1240, 560).

| Local frame | Event |
|---|---|
| 0–16 | Corner title becomes "THE PROMPT" |
| 18–60 | Prompt bar (760 × 96) rises at (1240, 812) and types a bare request: "Recommend a hotel." |
| 96–126 | On "the direction you give", the bar grows upward into the empty brief card; the bare request fades and the label **YOUR PROMPT** appears; a dashed cyan line runs from the card to the cube |
| 150 / 172 / 196 / 226 / 262 | Five modules slide into the card, each on its word, with a coloured left edge, a short label and its text: **OBJECTIVE** "Recommend a hotel for the Canberra trip." · **BACKGROUND & SOURCES** "Canberra, 5 days in March. Source: travel-policy-2025.pdf" · **CONSTRAINTS** "Within the policy's nightly limit." · **OUTPUT** "Top 3, as a table." · **CHECKS** "Cite the policy section for each." |
| 280 | Caption (28px) under the card: "Not every task needs every piece." |
| 306–324 | Card, line and caption fade; the cube stays |

## Scene 3: Vague vs Specific (frames 648–1032)

Two lanes compare the same material. Top lane **VAGUE** at y = 380, bottom lane **SPECIFIC** at y = 780. The cube fades out for this scene; instead, a small copy of the locked cube sits between each prompt and its result, glowing while it writes.

| Local frame | Event |
|---|---|
| 0–20 | Corner title "VAGUE VS SPECIFIC"; two document icons fade in at x = 220: `hotel-options.md` and `travel-policy-2025.pdf` |
| 60–90 | On "same documents", a line from each icon forks into both lanes |
| 110–140 | On "vague", the top prompt chip types "Summarise these." |
| 150–200 | On "specific", the bottom prompt chip types "Compare each hotel with the policy's nightly limit. Table. Cite the section." |
| 200–250 | Results build at x = 1400 (560 × 280 panels). Top: four grey paragraph lines, with three open questions floating beside it: "Which ones fit the limit?", "Says who?", "Which hotel?". Bottom: a three-row table **HOTEL · $/NIGHT · FITS · SOURCE** with ✓ / ✓ / ✕ and a `[§4.2]` chip on every row |
| 262 | On "review", the bottom panel gets a cyan ring and the tag **EASY TO REVIEW**; the top lane's questions pulse |
| 300 | On "doesn't make it correct", the price in row 2 ($245) turns red and a red **CHECK** tag springs in beside that row, outside the panel: the table is clear, but its numbers still need checking |
| 330 | Caption: "Clearer to review. Not guaranteed correct." |
| 366–384 | Everything fades |

## Scene 4: Context Engineering (frames 1032–1380)

Layout: a pool of seven cards (340 × 90) in a loose column centred at x = 400; a purple gate 140 × 600 at x = 860 with three stops, **SELECT**, **ORDER** and **FIT**; the context window at x = 1300, a little lower and shorter than home (y = 600, 700 tall) so its readout clears the badge. The cube is off-screen this scene, because this is the app's work.

| Local frame | Event |
|---|---|
| 0–30 | Corner title "CONTEXT ENGINEERING"; the window outline and readout draw; the seven cards fade in, unsorted: **YOUR PROMPT** "Which hotels fit the policy?", **SYSTEM INSTRUCTIONS** "You are a travel assistant.", **CHAT HISTORY**, `travel-policy-2025.pdf`, `hotel-options.md`, `travel-policy-2019.pdf`, email "Is the limit $400 now?" |
| 40–80 | On "decides what else goes in", the gate draws in purple |
| 118 | Gear + "THE APP" above the gate; badge: **APP ACTION** |
| 130–196 | **SELECT** lights: five cards get a cyan outline one by one; the 2019 policy and the email stay grey |
| 226 | **ORDER** lights: the five selected cards glide into a column at x = 600 in stack order (instructions at the bottom, prompt at the top); the two grey cards move aside to x = 260 |
| 240–284 | **FIT** lights: the cards pass through the gate in order and morph into slices, filling the window to 58%; each slice's label appears as it lands (the two documents read **POLICY 2025** and **HOTEL OPTIONS**) |
| 286 | On "outdated", the 2019 policy is stamped **OUTDATED** in red and slides down to the LEFT OUT tray |
| 310 | On "conflicting", the email is stamped **CONFLICTS WITH POLICY** in red and follows it |
| 330–348 | Pool, gate, gear and tray fade; the window fades last |

## Scene 5: Retrieval, Part 1: Prepare (frames 1380–1716)

Badge: **AHEAD OF TIME**. Layout: a collection of documents at x = 260; the splitter at x = 700; the search index (a 6 × 4 grid of chunk slots, 520 × 480) centred at (1340, 560).

| Local frame | Event |
|---|---|
| 0–20 | Corner title "RETRIEVAL: PREPARE"; the search index outline draws, with half its slots already holding older, dimmer chunks (each showing its reference) and half empty (dashed) |
| 20–80 | On "large or changing collections", a stack of document icons builds at x = 260 while a counter counts up to "1,240 DOCUMENTS"; a new document drops onto the stack (**+ NEW**) and the oldest slides off (**− OLD**), so the counter ticks up and back |
| 106 | Badge **AHEAD OF TIME** fades in |
| 140–190 | On "split into chunks", the top three documents move to x = 700 (y = 380 / 560 / 740) and each splits into four chunk strips (slice sound per document): `travel-policy-2025.pdf`, `expenses-faq.md`, `receipts-guide.pdf` |
| 202–244 | On "tagged with their source", each chunk gains a reference chip beside it (`[§3.1]`… `[Q1]`… `[p.1]`…) and its file and version inside it, e.g. `travel-policy · 2025` |
| 260–308 | On "search index", the chunks file into the empty slots, one every 4 frames (file sound), and show their reference in bright cyan |
| 320–336 | The documents and splitter fade; the index stays for Scene 6 |

## Scene 6: Retrieval, Part 2: Ask (frames 1716–2064)

Badge: **PER QUESTION**. Layout: the index moves to (620, 520) at 0.8 scale; a ranking column 300 wide at x = 1060; the context window at (1480, 600), 700 tall so its readout clears the badge, already holding instructions and the question.

| Local frame | Event |
|---|---|
| 0–30 | The index glides to its new place; the badge changes to **PER QUESTION** (Scene 5's badge fades out first); the window draws with its two slices |
| 30–76 | On "When you ask a question", a prompt bar at (880, 960) types "What's our hotel allowance in Canberra?" |
| 106–136 | On "searches the index", a cyan scan line sweeps across the index; eight slots light up as it passes them |
| 142–190 | On "ranks what it finds", the eight candidates lift out into the ranking column (**RANKED**), each with its chip, a score bar and its score, then sort themselves: §4.2 0.92, §3.1 0.86, §4.3 0.61, then five below 0.5 |
| 196 | A dashed cut line drops under the top two: **TOP 2** |
| 226–262 | On "only the best chunks", the top two fly into the window and become **Retrieved chunk** slices, `RETRIEVED · §4.2` and `RETRIEVED · §3.1`; the question's slice moves up above them; the readout ticks up |
| 262 | The other six dim to 35% and slide 40px back toward the index, with **NOT USED** under them |
| 322 | On "with their sources", the two retrieved slices flash a cyan outline |
| 330–348 | Index and ranking column fade; the window stays |

## Scene 7: Check the Source (frames 2064–2364)

Badge: **REVIEW**. Layout: cube at home; answer card 600 × 330 centred at (990, 560), claims at y = 470 / 560 / 650; three source cards (450 × 124) in a column at x = 1630, y = 400 / 560 / 720.

| Local frame | Event |
|---|---|
| 0–20 | Corner title "CHECK THE SOURCE"; the window from Scene 6 shrinks toward the cube and fades as a dashed line feeds it into the cube; the cube glows |
| 10–50 | A stream from the cube types the answer card's three claims, each ending with its chip: "Hotel limit: $250 a night. `[§4.2]`" · "Book through the travel portal. `[§3.1]`" · "Breakfast is included. `[§4.3]`" |
| 40–60 | The three source cards fade in, showing their chip and file name over placeholder lines |
| 58–100 | On "traceable", cyan threads draw from each claim to its source card |
| 100–130 | The first two source cards reveal their text ("Accommodation: up to $250 a night in capital cities." · "All bookings go through the travel portal.") and read **SUPPORTED**; claims 1 and 2 get a cyan ✓ |
| 142 | On "A real source", the third card reveals its text: "Taxis: keep receipts over $30." It is a real section of the real document |
| 178 | On "fail to support", the third thread turns red and frays into dashes; the third card and both its chips turn red and it reads **NOT SUPPORTED**; claim 3 gets a wavy red underline and a red ✕ |
| 250 | On "Check it.", caption: "A real citation isn't proof." |
| 282–300 | Everything except the cube fades |

## Scene 8: Memory (frames 2364–2796)

Layout: cube at home; the memory store (a purple cabinet 380 × 328 with three drawers) at (1400, 560) in the first half, then (1660, 560) at 0.8 scale beside the context window at home in the second half. Because the store sits right of the window, the window's slices are labelled inside the slices rather than to their right.

| Local frame | Event |
|---|---|
| 0–16 | Corner title "MEMORY"; the memory store draws, already holding "Home airport: Sydney" and "Prefers aisle seats" (dim); the third drawer is empty |
| 0–30 | A chat pill appears above the cube: "I always prefer hotels near Parliament House." |
| 30–60 | A dashed card grows out of the cube to (900, 560): "Prefers hotels near Parliament House", labelled **PROPOSED** |
| 70 | On "stored by the app", gear + "THE APP" under the card; badge: **APP ACTION** |
| 82–96 | The app checks the card: a purple ✓ **STORE** |
| 96–118 | The card goes solid purple (label **MEMORY**) and files into the third drawer; a scope tag appears under the store: "SCOPE: YOU · KEEP 90 DAYS" |
| 118 | On "not the model", a caption under the cube: "THE MODEL CAN'T SAVE ANYTHING ITSELF" |
| 130–150 | On "Later", the chat pill and captions fade; a **NEXT WEEK** divider sweeps across the screen; the store moves to (1660, 560) at 0.8 scale; an empty context window draws at home |
| 146–188 | Prompt bar at (800, 985) types "Book my hotel for the next Canberra trip." (146–174), then drops into the window as a **Your message** slice (176–188) |
| 180–196 | Gear + "THE APP" under the store; the third drawer slides out; only the Parliament House memory lifts out, and the others stay put |
| 196–226 | On "retrieved into the context", the memory flies into the window and becomes a **Memory** slice |
| 240–276 | The cube glows and a response pill at (740, 290) types: "Parkside Hotel is a 5-minute walk from Parliament House." |
| 286 | On "use it", a cyan ✓ **USED** springs in under the response |
| 300–330 | On "or ignore it", a dashed ghost response fades in at (700, 810), at 55%: "The Airport Motel is cheapest." with a red **IGNORED** tag |
| 326 | Caption at (700, 930): "Used, ignored or misapplied. Memory isn't a guarantee." |
| 340–358 | Finale: everything in the scene (cube, window, store, pills, badge, corner title) fades out completely |
| 362–392 | On the empty background, a small context window (180 × 240) draws at (960, 380), pinned to true screen centre; four labelled arrows draw in from the edges and point at it: **PROMPT** (left, cyan), **CONTEXT ENGINEERING** (top, purple), **RETRIEVAL** (right, cyan), **MEMORY** (bottom, purple). Each drops a slice of its own style into the window as it lands |
| 396 | "EVERYTHING ARRIVES / THROUGH CONTEXT." (92px, two lines) springs in at y = 830, then scales 1 → 1.04 to the end |

## Voiceover script

| # | File | Line | Words / scene length |
|---|---|---|---|
| 1 | `01-weights.wav` | "The model's weights are fixed after training. It can't know your files, your company's rules, or today's news, unless they reach the context." | 23 / 10.8 s |
| 2 | `02-prompt.wav` | "The first pathway is the prompt: the direction you give. An objective, background, constraints, the output you want, and how it will be checked." | 24 / 10.8 s |
| 3 | `03-specific.wav` | "Give the same documents to a vague prompt and a specific one. The specific prompt gets an answer you can review. Structure helps, but it doesn't make it correct." | 29 / 12.8 s |
| 4 | `04-engineering.wav` | "Context engineering decides what else goes in. The app selects instructions, history and sources, puts them in order, and leaves out what's outdated or conflicting." | 25 / 11.6 s |
| 5 | `05-prepare.wav` | "For large or changing collections, there's retrieval. Ahead of time, documents are split into chunks, tagged with their source, and added to a search index." | 25 / 11.2 s |
| 6 | `06-ask.wav` | "When you ask a question, the system searches the index, ranks what it finds, and adds only the best chunks to the context, with their sources." | 26 / 11.6 s |
| 7 | `07-citations.wav` | "References make claims traceable, but not automatically true. A real source can still fail to support what the answer says. Check it." | 22 / 10 s |
| 8 | `08-memory.wav` | "Memory is stored by the app, not the model. Later, a memory may be retrieved into the context, where the model can use it, or ignore it." | 27 / 14.4 s (including the 3 s silent finale) |

### ElevenLabs v3 lines

The same lines with emotion tags, ready to paste:

1. `[calm, matter-of-fact]` The model's weights are fixed after training. `[slight emphasis]` It can't know your files, your company's rules, or today's news… `[pause]` `[warmly]` unless they reach the context.
2. `[friendly, explanatory]` The first pathway is the prompt: the direction you give. `[brisk, listing]` An objective, background, constraints, the output you want, `[thoughtful]` and how it will be checked.
3. `[curious]` Give the same documents to a vague prompt and a specific one. `[confident]` The specific prompt gets an answer you can review. `[pause]` `[cautionary]` Structure helps, but it doesn't make it correct.
4. `[clear, measured]` Context engineering decides what else goes in. `[methodical]` The app selects instructions, history and sources, puts them in order, `[firm]` and leaves out what's outdated or conflicting.
5. `[explanatory]` For large or changing collections, there's retrieval. `[steady, step-by-step]` Ahead of time, documents are split into chunks, tagged with their source, and added to a search index.
6. `[engaged]` When you ask a question, the system searches the index, ranks what it finds, `[emphasis]` and adds only the best chunks to the context, `[softly]` with their sources.
7. `[thoughtful]` References make claims traceable, `[pause]` but not automatically true. `[serious]` A real source can still fail to support what the answer says. `[direct]` Check it.
8. `[calm, explanatory]` Memory is stored by the app, not the model. `[pause]` Later, a memory may be retrieved into the context, `[lightly]` where the model can use it… `[pause]` `[wry]` or ignore it.

Put recorded takes in `public/vo/how-ai-gets-context/`; each plays automatically once its file exists. After recording, measure each take's phrase times with ffmpeg `silencedetect`, change the scene's length in `timing.ts`, move its beats onto the words they're marked against in `timing.ts`, then re-run `npm run center:context`.

## Audio

- **SFX** come from the shared library generated by `scripts/generate-sfx.mjs`. This lesson added two sounds to it; the existing 20 files stayed byte-identical:

  | Sound | Used for |
  |---|---|
  | `scan.wav` | The scan line sweeping the search index (Scene 6) |
  | `file.wav` | A card sliding into a slot: chunks into the index (Scene 5) and the memory into the store (Scene 8) |

  Reuse from the library: shield-hit (cards bouncing off the padlock), freeze (frozen weights), rapid-typing (prompt bars and answers), pop (modules, chips), slice (documents splitting), tick-up (scores and readouts), data-pulse (threads drawing), error-buzzer (outdated, conflicting, not supported), rating-ding (supported, used), pour (slices entering the window), lock-click (store check), chime (finale title), synth-swell (finale arrows).
- **Cue sheet** is `SFX` in `audio.tsx`, with every cue written as (scene, local frame) from `timing.ts`, so re-timing a scene moves its sounds with it.
- **Ducking:** the shared mixer drops beds about 11 dB and accents about 6 dB under narration, as in the first two videos.

## Out of scope

These Information Pathways topics are left out to keep the video near 90 seconds. They could appear in a later video:

- **Role-based (perspective) prompting**, and the point that "act as an expert" grants no expertise: a good short of its own.
- **Prompts as versioned assets** (templates, examples, checks): fits a video on running AI in a team.
- **RAG internals:** OCR, metadata filters, embeddings and vector indexes, hybrid search and reranking models. Scene 5 shows chunks and a search index only; "ranks what it finds" stands in for ranking and reranking.
- **Memory scope and retention trade-offs** (conversation, user, workspace, organisation) and inspecting, correcting and deleting memories. Scene 8 shows a single scope tag.
- **Tools and agents fetching information themselves:** belongs in the planned **Agentic Systems** video, which can reuse `ContextTank`, `SearchIndex` and the reference chips.
