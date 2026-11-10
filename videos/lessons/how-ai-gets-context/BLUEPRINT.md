# How AI Gets Context: Visual Asset Blueprint

The third video in the series. `how-ai-trains` ends with the model's weights locked, and `how-ai-responds` shows that the model only works from what is in its context window. This video answers the question that leaves open: **how does the right information get into that window?** It follows the four pathways from `00-ai-concepts.md`: the prompt, context engineering, retrieval-augmented generation (RAG) and memory.

Source material: `00-ai-concepts.md` §4 **Information Pathways**.

1920×1080 authoring space · 30 fps · 2660 frames (1:28.7): every scene timed to its take, ending in a 4 s ease to black · 4K master via `--scale=2`.
Every visual is SVG or live text, so nothing is rasterised before the final render.

Scene lengths were first estimated from the script at about 2.5 words per second; every scene is now re-timed to its recorded take, and the finished video runs 1:28.7.

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

**Centred rows (Scenes 1–4).** Each scene lays its areas out as one horizontal row centred on x = 960 with a uniform 110 px gap (`ROW_GAP`), using `centredRow` from `shared/lib/row.ts`. An area joins the row as it appears and leaves as it goes, and the rest re-space smoothly, so whatever is on screen stays centred with even gaps throughout. The measured centring track is held at 0 for these scenes (`--fixed=0-1280:0` in `center:context`).

All the conventions in `how-ai-responds/BLUEPRINT.md` apply: corner chrome and centred content (the `Stage`/`Pinned` centring track; Scenes 1–4 centre themselves instead, see below), one window drawn by `ContextTank`, the locked cube as the model, and the purple **THE APP** gear and **APP ACTION** badge whenever the app (not the model) acts. This lesson adds:

- **Two new segment kinds** in `ContextTank`, each with its own fill pattern so colour isn't the only difference:

  | Segment | Fill |
  |---|---|
  | Retrieved chunk | Cyan at 28% with a fine dot pattern; its label carries a source chip, e.g. `RETRIEVED · §4.2` |
  | Memory | Purple at 22% with a dot pattern and a dashed purple outline |

  The prompt uses the existing **Your message** style (cyan at 60%, solid), and documents chosen by context engineering use the existing **Documents** style.
- **Reference chips.** A source reference is always a small cyan chip in square brackets, e.g. `[§4.2]`, 18px / 700 on a cyan-outlined pill. The same chip appears on chunks, retrieved slices and answer claims, so viewers can follow one reference through the whole pipeline.
- **Left-out material** stays in view, vertically centred in a red dashed **LEFT OUT** zone, with a red stamp naming the reason. It never just vanishes, because the point is that the app chose to leave it out.
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

## Scene 1: Beyond the Weights (frames 0–282)

Timed to the recorded take `01-weights.wav` (8.4 s).

| Local frame | Event |
|---|---|
| 0–18 | "BEYOND THE WEIGHTS" springs from 0.86 to 1.0 scale at dead centre |
| 14–44 | Title glides up to the top-left corner, clearing the centre for the cube |
| 26–44 | Locked cube springs in at dead centre (960, 540) with the "v1.0 · LOCKED" tag under it. Row: the cube (its area widened by the orbiting weights), then, once the first card flies in, a middle area where the cards rest, then the window when it draws |
| 34–66 | On "fixed after training", frozen weight values fade in around the cube, perfectly still (callback to `how-ai-trains` Scene 9). As in `how-ai-responds` Scene 5, values that would touch the cube (or the bounce ✕ beside its right edge) are left out, and where two would crowd each other the farther one is left out (`SHOWN`) |
| 107 / 138 / 168 | Three cards (340 × 110) fly in from the right toward the cube, each landing on its word: **YOUR FILES** `q3-report.xlsx`, **COMPANY RULES** `travel-policy-2025.pdf`, **TODAY'S NEWS** "Airport strike announced". Each bounces off the padlock with a red ✕ just outside the cube's right edge, clear of the weight values (its border flashes red), and settles in the middle area, one row gap clear of the weight values. Card labels 16px |
| 184–212 | Weight values fade; an empty context window (300 × 640) draws to the right of the resting cards, and the row re-centres. The middle keeps its width after the cards leave, so the cube and window stay well apart with the flow line between them |
| 208–238 | On "unless they reach the context", the three cards turn cyan and drop into the window as slices; a dashed cyan line flows from the window into the cube; caption under the window: "THE ONLY WAY IN" (26px, the lesson's thesis) |
| 264–282 | Cards, window and caption fade; the cube stays |

## Scene 2: The Prompt (frames 282–592)

Timed to the recorded take `02-prompt.wav` (8.3 s).

Layout: row of the cube and the prompt. The cube starts centred, where Scene 1 leaves it, and makes room as the bar rises; the prompt stays vertically centred (y = 540) throughout, growing from a 760 × 96 bar to a 760 × 604 card. The prompt keeps its place in the row through the fade, so Scene 3 can fade the cube out where it stands.

| Local frame | Event |
|---|---|
| 0–16 | Corner title becomes "THE PROMPT" |
| 10–50 | Prompt bar (760 × 96) rises into place at vertical centre and types a bare request: "Recommend a hotel." |
| 58–88 | On "the direction you give", the bar becomes the brief card in place (still 1 row tall); the bare request lifts out of the card into a dim, struck-through **BEFORE** chip ("Recommend a hotel.") that rides just above the card's top edge for the rest of the scene, so the vague and full versions stay side by side; the label **YOUR PROMPT** appears; a dashed cyan line runs from the card to the cube |
| 102 / 126 / 146 / 172 / 230 | Five modules slide into the card, each on its word. The card grows one row (104 px) per module, equally up and down, so it stays vertically centred and the earlier modules ease up. Each module has a coloured left edge, a short label (16px) and its text (23px): **OBJECTIVE** "Recommend a hotel for the Canberra trip." · **BACKGROUND & SOURCES** "Canberra, 5 days in March. Source: travel-policy-2025.pdf" · **CONSTRAINTS** "Within the policy's nightly limit." · **OUTPUT** "Top 3, as a table." · **CHECKS** "Cite the policy section for each." |
| 248 | Takeaway caption (24px, letter-spaced) under the card: "NOT EVERY TASK NEEDS EVERY PIECE" |
| 292–310 | Card, line and caption fade; the cube stays |

## Scene 3: Vague vs Specific (frames 592–946)

Timed to the recorded take `03-specific.wav` (9.6 s).

Two lanes compare the same material. Top lane **VAGUE** at y = 365, bottom lane **SPECIFIC** at y = 765. The cube fades out for this scene, and there is no model in the lanes, so the frame goes to the prompts (480 wide) and the results (640 × 320). Row: one **SAME DOCUMENTS** stack, the prompts, the results; the stack leaves the row as the results join it, and the CHECK callout joins it at 255.

| Local frame | Event |
|---|---|
| 0–20 | Corner title "VAGUE VS SPECIFIC"; one stack of two documents fades in at screen centre, labelled **SAME DOCUMENTS** with both file names under it: `hotel-options.md` and `travel-policy-2025.pdf` |
| 14–42 | On "same documents", a line from the stack forks into both lanes (level at first, curving only once past the stack's captions) |
| 48–70 | On "vague", the top prompt chip types "Summarise these." |
| 76–116 | On "specific", the bottom prompt chip types "Compare each hotel with the policy's nightly limit. Table. Cite the section." |
| 100–120 | The documents' job is done: the stack and its forks fade and leave the row as the results arrive, so the row re-centres on prompts and results |
| 120–165 | Results build (640 × 320 panels) as the last column of the row, each with a dashed arrow from its prompt. Top: four grey paragraph lines, with three open questions (20px) floating at its right: "Which ones fit the limit?", "Says who?", "Which hotel?". Bottom: a three-row table **HOTEL · $/NIGHT · FITS · SOURCE** (headers 16px, cells 22px) with ✓ / ✓ / ✕ and a `[§4.2]` chip on every row |
| 172 | On "review", the bottom panel gets a cyan ring and the tag **EASY TO REVIEW**; the top lane's questions pulse |
| 255 | On "doesn't make it correct", row 2 is tinted red, its price ($245) turns red, and a red **CHECK** callout springs in beside that row, outside the panel, pointing at it: "Price from **hotel-options.md**, not the policy. Is it current?" The table is clear, but its numbers come from a separate source that still needs checking (the example data is unchanged; the callout explains the check without inventing a discrepancy) |
| 290 | Caption: "Clearer to review. Not guaranteed correct." |
| 336–354 | Everything fades |

## Scene 4: Context Engineering (frames 946–1280)

Timed to the recorded take `04-engineering.wav` (9.7 s).

Layout: a row of LEFT OUT (from ORDER), the cards (a loose pool of seven 340 × 90 cards, then an ordered column that closes up once its last card leaves), a purple gate 140 × 600 with three stops, **SELECT**, **ORDER** and **FIT**, and the context window (its area widens as its slice labels appear), a little lower and shorter than home (y = 600, 700 tall) so its readout clears the badge. The cube is off-screen this scene, because this is the app's work.

| Local frame | Event |
|---|---|
| 0–30 | Corner title "CONTEXT ENGINEERING"; the window outline and readout draw; the seven cards fade in, unsorted: **YOUR MESSAGE** "Which hotels fit the policy?" (the same name as its slice, and as in `how-ai-responds`), **SYSTEM INSTRUCTIONS** "You are a travel assistant.", **CHAT HISTORY**, `travel-policy-2025.pdf`, `hotel-options.md`, `travel-policy-2019.pdf`, email "Is the limit $400 now?" |
| 36–70 | On "decides what else goes in", the gate draws in purple |
| 100 | Gear + "THE APP" above the gate (74px above its top, well clear of it); badge: **APP ACTION** |
| 112–176 | **SELECT** lights: five cards get a cyan outline and a 15% cyan fill one by one; the 2019 policy and the email stay grey. Card labels 16px, card text 21px |
| 200 | **ORDER** lights: the five selected cards glide into an ordered column in stack order (instructions at the bottom, prompt at the top); the two grey cards move aside into their own LEFT OUT column to the left, vertically centred on the same line as the ordered column (y = 485 and 635, spaced so each card's stamp fits above it) |
| 212–274 | **FIT** lights and SELECT and ORDER step back to 40%, so the cards crossing the gate don't pass over bright labels. The cards pass through the gate in order and morph into slices, filling the window to 58%; each card fades into its slice as it arrives (no landing box in the window), and the slice's label appears as it lands (the two documents read **POLICY 2025** and **HOTEL OPTIONS**) |
| 240–254 | A red dashed **LEFT OUT** zone (380 × 308) draws around the two grey cards, labelled above |
| 248 | On "outdated", the 2019 policy card flashes red with a glow, shakes, is stamped **OUTDATED** on its top edge (above the card's text, never over it) and its filename is struck through in red; it stays in place |
| 268 | On "conflicting", the email gets the same treatment: red flash, shake, **CONFLICTS WITH POLICY** stamp and a struck-through line |
| 316–334 | Gate, gear and LEFT OUT zone fade; the window fades last |

## Scene 5: Retrieval, Part 1: Prepare (frames 1280–1580)

Timed to the recorded take `05-prepare.wav` (8.6 s).

Badge: **AHEAD OF TIME**. Layout: a collection of documents at x = 300, drawn at 1.5×; the splitter at x = 740; the search index (a 6 × 4 grid of chunk slots, 520 × 480, slot labels never below 16px) centred at (1340, 560).

| Local frame | Event |
|---|---|
| 0–20 | Corner title "RETRIEVAL: PREPARE"; the search index outline draws, with half its slots already holding older, dimmer chunks (each showing its reference) and half empty (dashed) |
| 8–64 | On "large or changing collections", a stack of document icons builds at x = 260 while a counter (28px) counts up to "1,240 DOCUMENTS"; a new document drops onto the stack (**+ NEW**, 20px) and the oldest slides off (**− OLD**), so the counter ticks up and back |
| 100 | Badge **AHEAD OF TIME** fades in |
| 126–166 | On "documents are split into chunks", the top three documents move to x = 740 and each splits into four chunk strips (slice sound per document). `travel-policy-2025.pdf` splits big in the middle (y = 560, four 280 × 44 strips): its chunks are the ones Scene 6 retrieves, so viewers can track them. `expenses-faq.md` and `receipts-guide.pdf` split small above and below it (y = 300 / 820, 120 × 16 strips, no text) as a quick flicker that keeps the beat |
| 178–216 | On "tagged with their source", the policy's four chunks gain, one by one, a reference chip beside them (`[§3.1]` `[§3.2]` `[§4.2]` `[§4.3]`) and their file and version inside (`travel-policy · 2025`, 18px); the small chunks brighten as they are tagged |
| 222–280 | On "added to a search index", the chunks file into the empty slots, one every 4 frames (file sound), and show their reference in bright cyan |
| 284–300 | The documents and splitter fade; the index stays for Scene 6 |

## Scene 6: Retrieval, Part 2: Ask (frames 1580–1860)

Timed to the recorded take `06-ask.wav` (8.6 s).

Badge: **PER QUESTION**. Layout: the question sits in a search bar centred at the top (960, 160), 860 wide. Below it the index (0.8 scale), the ranking column (300 wide, plus room for its **TOP 2** label) and the context window (320 × 620, y = 650, slice labels to its right) form a centred row with the same 110px gaps as Scenes 1–4. The ranking column joins the row as the candidates lift out, pushing the index and window apart. Scene 6 holds the centring track at 0, since the row centres itself; the window's final place is `ASK_TANK`, where Scene 7 picks it up.

| Local frame | Event |
|---|---|
| 0–30 | The index glides to its new place; the badge changes to **PER QUESTION** (Scene 5's badge fades out first) |
| 14–44 | The window draws beside the index, holding only instructions |
| 4–40 | On "When you ask a question", the search bar drops in at the top and types "What's our hotel allowance in Canberra?" |
| 44–60 | A copy of the question shrinks out of the bar and drops into the window as the **YOUR QUESTION** slice; the bar stays as the search query |
| 52–106 | A dashed flow line runs from the search bar down to the index while it is searched |
| 60–92 | On "searches the index", a cyan scan line sweeps across the index; eight slots light up as it passes them |
| 96–140 | On "ranks what it finds", the eight candidates lift out into the ranking column (**RANKED**), each with its chip, a score bar and its score, then sort themselves: §4.2 0.92, §3.1 0.86, §4.3 0.61, then five below 0.5 |
| 150 | On "only", a dashed cut line drops under the top two: **TOP 2**. The top two are ringed in cyan and held in place, scores readable, until they fly |
| 168 | The other six dim to 35% and slide 40px back toward the index, with **NOT USED** under them, before the top two leave |
| 170–206 | On "the best chunks to the context", the top two fly out to the right along their own rows (above the cut, so they never cross the rest of the list or the TOP 2 label), then down inside the window, and become **Retrieved chunk** slices, `RETRIEVED · §4.2` and `RETRIEVED · §3.1`; the question's slice moves up above them; the readout ticks up |
| 232 | On "with their sources", the two retrieved slices flash a cyan outline |
| 262–280 | Index and ranking column fade; the window stays |

## Scene 7: Check the Source (frames 1860–2174)

Timed to the recorded take `07-citations.wav` (9.1 s).

Badge: **REVIEW**. Layout: cube at home; answer card 600 × 330 centred at (990, 560), claims at y = 470 / 560 / 650; three source cards (500 × 140) in a column at x = 1660, y = 400 / 560 / 720.

| Local frame | Event |
|---|---|
| 0–20 | Corner title "CHECK THE SOURCE"; the window from Scene 6 shrinks toward the cube and fades as a dashed line feeds it into the cube; the cube glows |
| 6–36 | A stream from the cube types the answer card's three claims, each ending with its chip: "Hotel limit: $250 a night. `[§4.2]`" · "Book through the travel portal. `[§3.1]`" · "Breakfast is included. `[§4.3]`" |
| 28–44 | The three source cards fade in, showing their chip over placeholder lines (the file name, the same on all three, is left off) |
| 42–66 | On "traceable", cyan threads draw from each claim to its source card |
| 72–100 | On "but not automatically true", the first two source cards reveal their text ("Accommodation: up to $250 a night in capital cities." · "All bookings go through the travel portal.") and read **SUPPORTED** (16px); claims 1 and 2 get a cyan ✓. Source text is 21px |
| 150 | On "A real source", the third card reveals its text: "Taxis: keep receipts over $30." It is a real section of the real document |
| 196 | On "fail to support", the third thread turns red and frays into dashes; the third card and both its chips turn red and it reads **NOT SUPPORTED**; claim 3 gets a wavy red underline and a red ✕. The mismatched words, "Breakfast" in the claim and "Taxis" in the source, turn red and are briefly highlighted (196–262), so the mismatch is pointed out, not just stated |
| 262 | On "Check it.", takeaway caption (26px, letter-spaced): "A REAL CITATION ISN'T PROOF" |
| 296–314 | Everything except the cube fades |

## Scene 8: Memory (frames 2174–2660)

Layout: cube at home; the memory store (a purple cabinet 380 × 328 with three drawers) at (1400, 560) in the first half, then (1690, 560) at 0.88 scale (so its drawer text stays at 16px) beside the context window at home in the second half. Because the store sits right of the window, the window's slices are labelled inside the slices rather than to their right.

| Local frame | Event |
|---|---|
| 0–16 | Corner title "MEMORY"; the memory store draws, already holding "Home airport: Sydney" and "Prefers aisle seats" (dim); the third drawer is empty |
| 0–14 | A chat pill appears above the cube: "I always prefer hotels near Parliament House." |
| 8–30 | A dashed card grows out of the cube to (900, 560): "Prefers hotels near Parliament House", labelled **PROPOSED** |
| 30 | On "stored by the app", gear + "THE APP" under the card; badge: **APP ACTION** |
| 38–50 | The app checks the card: a purple ✓ **STORE** |
| 50–64 | The card goes solid purple (label **MEMORY**) and files into the third drawer; a scope tag (18px) appears under the store: "SCOPE: YOU · KEEP 90 DAYS". Drawer text is 18px at full size, never below 16px |
| 60 | On "not the model", a takeaway caption (26px, two lines so it clears THE APP) under the cube: "THE MODEL CAN'T / SAVE ANYTHING ITSELF" |
| 100–120 | On "Later", the chat pill and captions fade; a **NEXT WEEK** divider sweeps across the screen; the store moves to (1690, 560) at 0.88 scale; an empty context window draws at home |
| 116–150 | A prompt bar above the cube at (640, 330), at 80% so it clears the window and where the first chat message sat, types "Book my hotel for the next Canberra trip." (116–138), then shrinks and drops into the window as a **Your message** slice (140–150) |
| 144–158 | Gear + "THE APP" above the store; the third drawer slides out; only the Parliament House memory drops out of it, clear below the store before it travels, and the others stay put |
| 158–186 | On "retrieved into the context", the memory (opaque, so no border shows through it) flies from below the store into the window and becomes a **Memory** slice |
| 188–218 | The cube glows and a response pill at (740, 290) types: "Parkside Hotel is a 5-minute walk from Parliament House." |
| 220 | On "use it", a cyan ✓ **USED** springs in under the response |
| 242–268 | On "or ignore it", a dashed ghost response fades in at (700, 810), at 75%: "The Airport Motel is cheapest." with a red **IGNORED** tag (20px) |
| 262 | Caption at (700, 930): "Used, ignored or misapplied. Memory isn't a guarantee." |
| 300–318 | Finale: everything in the scene (cube, window, store, pills, badge, corner title) fades out completely |
| 322–352 | On the empty background, a small context window (180 × 240) draws at (960, 380), pinned to true screen centre; four labelled arrows draw in from the edges and point at it: **PROMPT** (left, cyan), **CONTEXT ENGINEERING** (top, purple), **RETRIEVAL** (right, cyan), **MEMORY** (bottom, purple). Each drops a slice of its own style into the window as it lands |
| 356 | "EVERYTHING ARRIVES THROUGH CONTEXT." (56px, one line) springs in at y = 790, then scales 1 → 1.04 to the end |
| 366–486 | The whole frame, background included, eases to black over 4 s (slow at first, so the title still reads for about 2 s); the video ends on black rather than cutting |

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
| 8 | `08-memory.wav` | "Memory is stored by the app, not the model. Later, a memory may be retrieved into the context, where the model can use it, or ignore it." | 27 / 16.2 s (9.3 s take, the silent finale and a 4 s ease to black) |

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
