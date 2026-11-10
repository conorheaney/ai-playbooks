# How AI Takes Action: Visual Asset Blueprint

The fourth video in the series, and the first of two on agentic systems. `how-ai-gets-context` ends with everything reaching the model through its context window. This video answers the next question: **how does a model that only writes text get anything done?** It covers tool calling, the agent loop, workflows versus agents, the harness, boundaries and delegation.

Source material: `00-ai-concepts.md` §5 **Agentic Systems**: the chapter introduction, **Agents**, **Harnesses** and **Tools**. The second agentic video covers **Integrations**, **Skills**, **Permissions** and **Capabilities**.

1920×1080 authoring space · 30 fps · 3075 frames (1:42.5), ending in a 3 s fade to black · 4K master via `--scale=2`.
Every visual is SVG or live text, so nothing is rasterised before the final render.

**Status: built, awaiting voiceover.** Every scene is implemented and renders; no takes are recorded yet. All nine scenes were rebuilt after a first pass rated 60% for spacing, alignment, focus and on-screen text (see [Layout rules and text budget](#layout-rules-and-text-budget)). They were then moved onto the series' new medical-device running example and reviewed against the 9.5 target (see `REVIEW_LESSON4.md`). Scene lengths are estimated from the script at about 2.7 words per second, the pace of the recorded takes in lessons 2 and 3, plus about a second of hold, so every frame number below is an estimate. Re-time each scene to its recorded take (see [Voiceover script](#voiceover-script)).

## Run

This lesson is the `HowAITakesAction` composition in the shared `videos/` Remotion project. Its code lives next to this file. Paths below are relative to this folder unless they start with `shared/`, `public/` or `scripts/` (project root).

```bash
cd videos
npm run studio              # live preview / scrubbing (composition: HowAITakesAction)
npm run render:action       # out/how-ai-takes-action/how-ai-takes-action-1080p.mp4
npm run render:action:4k    # out/how-ai-takes-action/how-ai-takes-action-2160p.mp4 (3840×2160)
npm run sfx                 # regenerate the shared public/sfx/*.wav
```

| File | Contents |
|---|---|
| `timing.ts` | Scene lengths and every beat (scene-local frames); scenes and the cue sheet both read it |
| `layout.ts` | The running example's text (tools, inputs, results), the wall, gate and dock positions, and Scene 4's ring |
| `lib.ts` | `useBeats` (per-scene spring and easing helpers) and small geometry helpers |
| `components/Parts.tsx` | `Layer` (full-frame SVG), `Txt`, `Chip`, `MarkAt`, `PersonIcon`, `GearMark` (the purple gear with any label), `Badge`, `Note` (the series' takeaway caption), `Caveat` (the series' caveat pill), `FlowLine` and `Arrow` |
| `components/Ticket.tsx` | `ToolTicket` (the model's request), `ToolReceipt` (the observed result), and text-free `TicketGlyph` / `ReceiptGlyph` for diagrams |
| `components/Wall.tsx` | `WallLine`, `GatePanel` (with the gear on its top edge) and `CheckLights` |
| `components/World.tsx` | `Dock` (a system in the world, with a scan line while it runs) and `PortalCard` (NOT ORDERED / ORDERED) |
| `components/MiniWindow.tsx` | A context window with fixed-height slices, including the two new slice kinds |
| `components/Loop.tsx` | `Ring`, `Runner`, `StateCard`, `Struck`, `Fence` and `Sign` (which can hang left or right of its anchor) |
| `centering.ts` | The centring track: empty, because every layout is designed around screen centre (see below) |
| `scenes/*.tsx` | One file per scene. Scene 5's rails and Scene 6's harness frame are drawn in their scene files |
| `audio.tsx` | Voiceover slots and the SFX cue sheet |

### Kept local, not in `shared/`

The plan was to extend `ContextTank`, `StatusBadge` and `AppMarker` in `shared/`. `ContextTank.tsx` and `Bubble.tsx` have uncommitted work from another workstream, so this lesson leaves `shared/` untouched and keeps its versions local:

- **The tool request and tool result slices** live in `components/MiniWindow.tsx`, which reuses the series' fills for the existing kinds.
- **The badges** (`AGENT LOOP · STEP n / max`, `WAITING FOR YOU` and `APP ACTION`) are `Badge` in `components/Parts.tsx`, in the shared badge's style at 24 px.
- **The relabelled gear** (THE APP, then HARNESS) is `GearMark` in `components/Parts.tsx`.

Once the other workstream lands, these can move into `shared/` if a later lesson needs them.

### Centring

Every layout in this lesson is designed around screen centre, so `centering.ts` is an empty track (no shift) and there is no `center:action` script. If a layout change leaves a scene off-centre, generate a measured track with `scripts/measure-centering.mjs`, as the other lessons do.

## Design tokens (`shared/theme.ts`)

These are unchanged from the first three videos.

| Token | Value | Use |
|---|---|---|
| charcoal | `#121212` | Background, node fills, panel fills |
| cyan | `#00F0FF` | Model output, tool requests, tool results, the agent loop, completed actions |
| purple | `#9D4EDD` | The app and harness, the wall and gate, tool definitions, fences and limits |
| white | `#FFFFFF` | All headline and label text, the agent's state, the user |
| error | `#FF3B6B` | Failed or ignored checks, wrong tools and inputs, hidden failures |

Type: Inter, as before. 800 for headlines, 700 for labels, 500 for ticket, receipt and response text, `tabular-nums` for every counter. Same corner-title anchor (96, 72), badge position (right 96, top 52) and background.

## Layout rules and text budget

All three earlier lesson reviews found text too small to read, and the lesson 3 review also found too many objects on screen at once. A first build of this lesson was rated 60% for spacing, alignment, focus and on-screen text, so every scene was rebuilt to these rules. They are written into `layout.ts`:

- **Symmetric about screen centre.** Every composition is mirrored about x = 960, so it stays centred without a centring track. Rows of areas are laid out with `centredRow` (`shared/lib/row.ts`) and a uniform `ROW_GAP` of 100 px. Paired elements sit the same distance either side of the centre line:
  - the model side and the world side of the wall (Scene 2): the docks are wider than the tool list, so their outer edge mirrors the tool list's (x = 190 and 1730) rather than their centre mirroring the cube's;
  - PICK A STEP and SEE THE RESULT either side of the ring (Scene 4);
  - DONE and ASK FOR HELP either side of the top station (Scene 4);
  - the four job modules in the harness (Scene 6);
  - the fence and the portal either side of the gate (Scene 7);
  - the three subagent columns (Scene 8);
  - the two answer cards (Scene 9).
- **One content band.** Content sits between y = 180 and y = 880. Each scene's takeaway caption sits at `CAPTION_Y` (y = 950), the same place every time.
- **Captions match lessons 1–3.** A takeaway is a spaced uppercase caption (`Note`: 26 px / 700, 0.16em letter-spacing, white), and a caveat is the series' rounded caveat pill (`Caveat`: 26 px / 500, white 7% fill, 35% white border). A takeaway that lands late in a scene holds through the cut and fades in the next scene, so it gets a full reading window.
- **Shared grids.** Elements that compare line up on the same grid. In Scene 5 the workflow's stations and the agent's path share the same three columns (x = 560, 960 and 1360). In Scene 2 the cube, the ticket, the gate and the supplier-search dock share one horizontal axis.
- **No text crosses an outline.** A ticket or receipt that passes through the gate does so as a glyph, a status that changes swaps out one label before the next appears, and labels that a moving piece would cover fade first.
- **No informative text under 24 px, and no scaled-down text.** Body text is 24 px; labels and captions are 26–28 px. A ticket or receipt that has to travel small becomes a text-free glyph (`TicketGlyph`, `ReceiptGlyph`) instead of a shrunken card.
- **Minimal text, removed once it has done its job:**
  - the prompt bar leaves once the answer is written (Scene 1);
  - the tool list dims to 25% once the model has picked from it (Scene 2);
  - only the newest film frame labels its slices (Scene 3);
  - one result chip shows at a time (Scene 5);
  - the boundary signs leave before the gate demonstration (Scene 7);
  - each failure is a short label, with no snippet or note (Scene 9).
- **Every "wrong" shows what right looks like.** The ghost crossing in Scene 7 is followed by the gate, and Scene 9's hidden failure sits beside the report.
- **Nothing sits on the cube.** Labels, tickets and lines keep clear of its footprint.
- **Check the phone frame.** Before review, check a frame from every scene scaled down to 640 px wide.

## Visual approach

Agents, harnesses and tools are abstract, and the words for them overlap. The lesson gives each idea one physical device and keeps it for the whole video, so viewers learn the system by watching parts they recognise interact.

| Idea | Device | Why it works |
|---|---|---|
| The model can't act | **The wall.** The model side is on the left, the world is on the right, and a purple dashed wall divides them with the harness's gate in the middle. The cube never crosses it. | It turns "the model doesn't run tools" into a spatial rule viewers can see, rather than a sentence they have to remember. |
| Tool call | **Ticket out, receipt back.** The model prints a ticket (tool name and inputs, with a perforated edge). A result comes back as a receipt (zigzag edge and barcode). | A request and an observed result are different kinds of paper. A receipt is proof that something happened, which is the point of an "observed result". |
| Context across calls | **Film strip.** Each model call is one frame, holding a fresh copy of the context plus the latest ticket and receipt. | It shows that each call is rebuilt from scratch, which a single growing tank would hide. |
| Agent | **Racetrack loop.** A ring with four stations and a runner, a step counter, and two exit ramps (done, ask for help). | A loop with laps and exits is the decision loop: repetition, progress and stopping conditions all at once. |
| Workflow | **Rails.** The track is drawn in full before anything moves. | "Designed in advance" becomes visible: the route exists before the run starts. |
| Harness | **The gear opens into a frame.** The purple gear that meant "the app" in lessons 2 and 3 opens up into the frame that holds everything. | It ties a new word to a familiar symbol: the harness is what the gear always was. |
| Boundaries | **A fence with signs, and a painted line versus a gate.** | It separates "told not to" from "can't": an instruction is paint on the ground, while enforcement is a physical gate. |

## Series conventions

All the conventions in `how-ai-responds/BLUEPRINT.md` and `how-ai-gets-context/BLUEPRINT.md` apply. That includes:

- corner chrome and centred content (the `Stage`/`Pinned` centring track, or `centredRow` where a scene lays out as one row);
- one window drawn by `ContextTank`;
- the locked cube as the model;
- the purple gear whenever the app or harness acts.

This lesson adds:

- **The wall (Scenes 2 and 3).** It is a purple dashed vertical line at x = 960 from y = 200 to 880, with a 260 × 340 gate panel centred on it at y = 560. The model side (cube, tool list) is always to its left, and the world (tool docks) always to its right, mirrored. Tickets and receipts are the only things that pass through the gate. Scene 7 reuses the idea as a single gate on the centre line.
- **Tickets and receipts.** These keep the same look everywhere:

  | Piece | Look |
  |---|---|
  | `ToolTicket` | 300–320 wide, charcoal fill, cyan outline, perforated left edge. Header **TOOL REQUEST** 24 px / 700, tool name 28 px / 700 in cyan, and at most two `key: value` inputs at 24 px / 500. Always shown at full size |
  | `ToolReceipt` | 300 wide, cyan at 12% fill, zigzag bottom edge, a thin barcode strip down the left. Header **RESULT** 24 px / 700, rows at 24 px / 500. Always shown at full size |
  | `TicketGlyph` / `ReceiptGlyph` | The same papers with no text, about 60 × 44. Used whenever a ticket or receipt travels small, and in red in Scene 9 |

- **Two new segment kinds** in `ContextTank`, each with its own fill pattern:

  | Segment | Fill |
  |---|---|
  | Tool request | Cyan at 40%, dashed cyan outline and a perforation line across its top edge |
  | Tool result | Cyan at 22% with vertical barcode stripes |

  In this lesson, segment heights are illustrative, not proportional to tokens. Every slice is at least 50 px tall so its 24 px in-slice label fits, and only the newest frame's new slices carry labels.
- **The user is a white person icon.** It only appears when the harness stops for a human (Scene 7 and the ASK FOR HELP exit in Scene 4).
- **The gear's label.** It reads **THE APP** in Scenes 2–5, so it matches lessons 2 and 3, and changes to **HARNESS** in Scene 6.

## Running example

The flow-sensor order from lesson 3 continues. The viewer works at a generic medical device company and needs **500 flow sensors by June**. In lesson 3 they asked about the supplier policy (`supplier-policy-2025.pdf`: §3.1 "All orders go through the purchasing portal.", §4.2 "Lead time: up to 30 days for critical parts.") and the supplier quotes (`supplier-quotes.md`: Northfield Sensors 25 days, Brookway Parts 29 days, Apex Precision 40 days), and the app remembered that they prefer ISO 13485 certified suppliers. Now they ask the AI to **place the order**. A model can describe placing a purchase order but can't place one, so the task needs tools. The examples stay non-clinical: no patients, diagnoses or results.

| Item | Text |
|---|---|
| Request | "Order 500 flow sensors by June." |
| The model's description (Scene 1) | "I'd order 500 from Northfield Sensors on the purchasing portal." |
| Goal (Scene 4's state card) | "Order sensors within policy" |
| Order (portal card) | "500 flow sensors · by June", **NOT ORDERED**, then **ORDERED** ✓ PO-20417 |
| Confirmation (Scene 7) | "Place order? £9,750" (500 × £19.50) with **APPROVE** |

The agent has four tools, which reach three systems:

| Tool | System (dock) | Example input | Example result |
|---|---|---|---|
| `search_suppliers` | SUPPLIER SEARCH | part: flow sensor · qty: 500 | Northfield · 25 days / Apex · 40 days |
| `read_policy` | READ FILE | (glyph only on screen) | "Lead-time limit: 30 days" (§4.2), so Apex is struck out |
| `check_stock` | PURCHASING PORTAL | (named on a chip in Scene 4) | "Northfield: 500 in stock" |
| `place_order` | PURCHASING PORTAL | (name only; the price is on the confirmation card) | ORDERED · PO-20417 |

Apex Precision, the supplier over the 30-day limit in lesson 3, is the option the agent rejects. Two tools reaching one system (the purchasing portal, which §3.1 says every order goes through) quietly sets up the next lesson, where one integration exposes several tools. The delegation scene splits "PREPARE THE ORDER" into three subtasks, **QUOTES**, **QUALITY CHECK** and **PAPERWORK**, which combine into an **ORDER PACK**.

As in lesson 3, all supplier names, prices, lead times, section numbers and PO references are invented, and the video never presents them as real policy, real businesses or real orders.

## Scene 1: Words Aren't Actions (frames 0–336)

**Teaches:** a model on its own only produces text. Describing an action is not doing it.

Layout: one centred row (`centredRow`, 100 px gaps) of the cube (size 80), the response card (520 wide) and the purchasing portal card (460 wide), all on y = 560. The prompt bar sits above the row at (960, 290).

| Local frame | Event |
|---|---|
| 0–18 | "WORDS AREN'T ACTIONS" springs from 0.86 to 1.0 scale at dead centre |
| 14–44 | Title glides to the top-left corner |
| 20–44 | The cube springs in |
| 24–50 | The prompt bar drops in and types "Order 500 flow sensors by June." |
| 52–140 | On "writes text", the cube glows and the response card types (30 px, no label): "I'd order 500 from Northfield Sensors on the purchasing portal." |
| 137 | On "order" (in "placing an order"), the **PURCHASING PORTAL** card fades in: "500 flow sensors · by June" and **NOT ORDERED** |
| 150–168 | The prompt bar fades out: it has done its job |
| 159–190 | On "can't place one", the response's words drift towards the portal and vanish at the response card's own edge (the card clips them), so they never reach the portal. The status chip pulses once but stays **NOT ORDERED** |
| 184 | Takeaway caption at y = 950: "DESCRIBING ISN'T DOING". It holds until 250 (2.2 s) |
| 200–222 | On "An agentic system", the response card fades |
| 222–255 | A dashed cyan loop draws between the cube and the portal, mirrored about the row: out along a top arc, back along a bottom arc |
| 255 | On "act", a ticket glyph rides the top arc to the portal and a receipt glyph rides the bottom arc back |
| 266 / 277 / 288 | On "step by step", three numbered step dots (26 px) pop along the top arc |
| 310–336 | The loop and dots fade. The cube and portal card stay for Scene 2 |

## Scene 2: Tool Calling (frames 336–648)

**Teaches:** the model writes a structured request. The app checks it and runs the tool, and the model never reaches the tool itself.

Layout: the wall at x = 960 (y 200–880), with a 260 × 340 gate panel centred at y = 560. The cube (370 → 360, size 70) and the tool list sit left of the wall; the docks (x = 1500, 460 × 120, wide enough for PURCHASING PORTAL at 26 px) sit right of it, their outer edge (x = 1730) mirroring the tool list's (x = 190). The cube, the ticket (at x = 645), the gate and the **SUPPLIER SEARCH** dock share the y = 560 axis. The **TOOLS** list (340 wide) sits above the cube at y = 285. **READ FILE** and **PURCHASING PORTAL** sit 160 px above and below **SUPPLIER SEARCH**. The wall has a gap behind the gate's "THE APP" label, so the dashed line never runs through it.

| Local frame | Event |
|---|---|
| 0–16 | Corner title becomes "TOOL CALLING" |
| 0–30 | The cube glides into place. The portal card shrinks towards its dock and has faded out by frame 18; the dock fades in from 20, so the two never overlap |
| 8–40 | The wall draws top to bottom, with its gate panel |
| 19 | On "app", the gear + "THE APP" on top of the gate; badge: **APP ACTION** |
| 30–60 | On "lists the tools", the **READ FILE** and **SUPPLIER SEARCH** docks fade in, and the **TOOLS** list fades in: `read_policy` · `search_suppliers` · `check_stock` · `place_order` |
| 93–126 | On "replies with a request", the cube glows and a ticket (320 wide, so `search_suppliers` fits at 28 px) prints beside it |
| 150 | On "tool name", the ticket shows `search_suppliers`, and the same name lights cyan in the tools list |
| 181–187 | On "inputs", two inputs pop in: "part: flow sensor" · "qty: 500" |
| 200–220 | The ticket turns into a ticket glyph where it stands (200–207), clear of the gate, and the glyph slides into the gate (207–220), so no ticket text crosses the gate's outline. The tools list dims to 25% (200–220) |
| 222–238 | On "checks it", three check lights pop down the gate panel, 8 frames apart: **TOOL EXISTS** ✓ · **INPUTS VALID** ✓ · **ALLOWED** ✓ |
| 255 | On "runs the tool", the takeaway caption fades in: "THE MODEL ASKS. THE APP RUNS." It holds through the cut and fades in Scene 3 (2.7 s in all) |
| 255–275 | The glyph runs along a dashed line to the **SUPPLIER SEARCH** dock, which glows while its scan line sweeps |
| 277–295 | On "tool itself", a dashed line runs down from the cube and across towards the tools, and stops at the wall (y = 820) with a red ✕ |
| 296–312 | The check lights and ✕ fade. The wall, gate, docks and caption carry into Scene 3 |

## Scene 3: Back Into Context (frames 648–948)

**Teaches:** the tool's result goes into the context, and the model is called again from a rebuilt context, until it answers.

Layout: the cube rises to (960, 200), size 46. Below it, film frames (280 × 420, centred at y = 650) form a centred row with 70 px gaps. Each new frame pushes the others apart, so the strip is always centred. Sprocket bands run above and below the frames, spanning exactly the frames on screen, and "CALL n" labels (26 px) sit above each frame. The exit chips sit either side of the cube, mirrored.

| Local frame | Event |
|---|---|
| 0–18 | On "The result", a receipt glyph leaves the supplier search, comes back through the gate along the y = 560 axis (as in Scene 2, only glyphs cross the gate), then rises to (670, 350) |
| 14–26 | The receipt prints at full size at (670, 350), above and left of the gate, clear of its outline and ahead of the cube's path: **RESULT** "Northfield · 25 days" · "Apex · 40 days" |
| 14–26 | Scene 2's caption "THE MODEL ASKS. THE APP RUNS." fades |
| 20–34 | The wall, gate and docks fade, and are gone before the film strip draws in their place. The cube rises to the top centre (20–50) |
| 26–44 | The receipt moves up to wait beside the cube, ahead of the cube's own path |
| 34–60 | **CALL 1** draws at centre with its three slices labelled in-slice: **INSTRUCTIONS**, **TOOLS**, **YOUR MESSAGE** |
| 59–65 | CALL 1's slice labels fade as CALL 2's copies start to slide out from on top of them |
| 57–90 | On "into the context", **CALL 2** joins the row and the strip re-centres. CALL 1's slices copy across (unlabelled), then a ticket glyph drops from the cube into a **REQUEST** slice and the receipt lands as a **RESULT** slice; both are labelled |
| 96–129 | On "the model is called again", a dashed line runs from CALL 2 to the cube and the cube glows. A ticket glyph leaves to the right; a receipt glyph comes back and waits |
| 156–190 | On "whole context rebuilt", **CALL 3** joins and the strip re-centres. CALL 2's labels fade first (158–164), then its slices copy across, and the new request and result land, labelled |
| 186 | Takeaway caption: "REBUILT FOR EVERY CALL" |
| 195 | Exit chips fade in, dashed, either side of the cube: **ANSWER** (left) and **ANOTHER TOOL** (right) |
| 217 | On "answers", **ANSWER** lights cyan |
| 239–265 | On "requests another tool", **ANOTHER TOOL** lights and a dashed **CALL 4?** frame joins the row, which re-centres to four frames |
| 282–300 | The strip, chips and caption fade; the cube stays |

## Scene 4: The Agent Loop (frames 948–1272)

**Teaches:** an agent is a goal-directed loop. It brings its goal and current state, picks a next step, checks the result, and repeats until it is done or needs help.

Layout: a ring (radius 270) centred at (960, 570) with four stations. The cube (size 50) sits on the right station. The labels are mirrored: **GOAL & STATE** just inside the top of the ring, **RUN IT** below the purple gear at the bottom, and **PICK A STEP** / **SEE THE RESULT** level with each other, the same distance right and left of the ring. A 390-wide state card sits inside the ring, nudged left to clear the cube. Badge: **AGENT LOOP · STEP n**.

| Local frame | Event |
|---|---|
| 0–24 | Corner title "THE AGENT LOOP". The cube glides from the top centre to the right station |
| 8–60 | On "An agent is a decision loop", the ring draws clockwise and each station pops as the line passes it. The **GOAL & STATE** label waits until the cube has glided past it (16–24) |
| 30–50 | The state card fades in: **GOAL** "Order sensors within policy" |
| 48–80 | Two fast recap laps (dim runner) replay Scenes 2 and 3. Each adds a row: "Northfield, Apex" ✓, then "Lead-time limit: 30 days" ✓. The badge counts **STEP 2**, then **STEP 3** |
| 82–137 | On "check the goal and current state", the runner slows at the top and the card flashes. On "state", "Apex" (40 days, over the limit) strikes through in red |
| 148–181 | On "pick a next step", the runner reaches the cube, which glows; a chip names the step, `check_stock`, below **PICK A STEP** |
| 181–192 | The chip fades and a ticket glyph rides the ring down to the gear, which turns |
| 192–225 | On "see the result", a receipt glyph pops at the left station and flies into the card. On "repeat" it becomes the row "Northfield: 500 in stock" ✓; the badge ticks to **STEP 4** |
| 244–266 | On "until it's done", a ramp draws up and right from the top station to **DONE**, which lights cyan |
| 280–299 | On "needs help", the mirror ramp draws up and left to **ASK FOR HELP** (with the person icon), which lights white |
| 300–324 | Everything except the cube fades |

## Scene 5: Workflow vs Agent (frames 1272–1584)

**Teaches:** a workflow's route is designed in advance, while an agent chooses each step from what it finds. Real systems often combine them.

Layout: two lanes on one centred grid. The rails run from x = 360 to 1560, and both lanes use the same three columns (x = 560, 960, 1360). **WORKFLOW** is at y = 380 and **AGENT** at y = 760. Each lane has a header (28 px / 800) left-aligned to the rails, with a short sentence-case tag (26 px) starting at the same x on both lanes.

| Local frame | Event |
|---|---|
| 0–14 | Corner title "WORKFLOW VS AGENT". The cube fades out |
| 19–74 | On "A workflow follows steps designed in advance", the whole route draws as dashed purple blueprint lines, then inks in as rails, before anything moves. Stops: **SEARCH**, **CHECK LIMIT**, **ORDER CHEAPEST**, plus an unlabelled pre-set side route. Tag: "route set in advance" |
| 74–96 | A cyan shuttle runs the rails at constant speed |
| 93–110 | On "An agent", the agent lane fades in: three nodes on the same columns, plus two dim alternative nodes between them. Tag: "next step depends on results" |
| 104–181 | On "picks each step from what it finds", each node lights only after the last result. Its label appears under it, and the path draws to it. One result chip at a time shows under the latest node's label (y = 860), clear of the dashed routes to the dim alternatives above the lane: "Apex: 40 days?", then "30-day limit", then "Northfield in stock". The path runs **SEARCH** → **READ POLICY** → **CHECK STOCK**; the alternatives stay dim |
| 200–230 | On "Many systems", the agent lane fades. The workflow glides to y = 540 and relabels: **PART REQUEST** · **FIND A SUPPLIER** · **SEND FOR SIGN-OFF** |
| 244–270 | On "bounded agent", the middle stop opens into a small ring (radius 90) inside a dashed purple fence, labelled **BOUNDED AGENT** |
| 266–304 | On "inside a workflow", the shuttle runs into the ring, does two laps, and continues to **SEND FOR SIGN-OFF** |

## Scene 6: The Harness (frames 1584–1932)

**Teaches:** both run inside a harness, the software around the model. It builds each request, keeps state, runs tools with its own access, enforces limits and records what happened.

Layout: the harness frame (1400 × 660) is centred at (960, 540) with a tab on its top-left edge. The cube is at the centre on a small ring (radius 110), on the rail line from Scene 5. Four job modules (380 × 116) sit at the frame's corners, mirrored at x = 960 ± 360 and y = 360 / 720. Each has a small live icon and a 26 px label. A trace tape runs along the inside bottom edge (y = 830).

| Local frame | Event |
|---|---|
| 0–40 | On "Both run", Scene 5's rail and bounded loop shrink into an emblem around the cube, keeping the same centre |
| 44 | On "harness", the purple gear pops in above the cube, labelled **THE APP** |
| 60–100 | The gear opens out into the harness frame; its label fades early. The frame is drawn beneath the emblem, so its edge sweeps behind the ring, not across it. On "software around the model", the tab reads **THE APP**, which fades out (82–90) before **HARNESS** fades in (92–100), so the two never overlap |
| 145 | On "builds each request": **BUILDS EACH REQUEST** (icon: a window filling slice by slice) |
| 178 | On "keeps state": **KEEPS STATE** (icon: a card ticking its rows) |
| 200 | On "runs tools": **RUNS TOOLS** (icon: a ticket passing a gate); a port opens in the frame's right edge |
| 244 | On "its own access", a key drops onto **RUNS TOOLS** and a second line reads **WITH ITS OWN ACCESS** (purple) |
| 266 | On "enforces limits": **ENFORCES LIMITS** (icon: a gauge with a red zone) |
| 280 | After the last module, the caveat pill at y = 950: 'Many products call all of this "the agent".' It holds through the cut and fades in Scene 7 (2.9 s in all) |
| 299–331 | On "records what happened", the trace tape (starting at x = 460, clear of its label) scrolls in: **RECORDS** · "12:01 search_suppliers ✓ · 12:01 read_policy ✓ · 12:02 check_stock ✓" |
| 330–348 | Everything except the cube and the caveat fades |

## Scene 7: Boundaries (frames 1932–2268)

**Teaches:** an agent needs boundaries, and the harness, not an instruction, enforces them.

Layout, in two phases:

1. **Signs** (0–200): the fenced loop (radius 150, fence 470 × 470) at the centre of the screen, with a sign on each corner. Each sign overlaps its corner by 60 px and hangs outward (left signs to the left, right signs to the right), so the two long bottom signs never meet in the middle.
2. **Gate** (from 186): the fenced loop slides left and shrinks to 0.62. The painted line, then the gate, sit on the centre line (x = 960). The **PURCHASING PORTAL** card (460 wide) mirrors the fence at x = 960 + 560.

Badge: **AGENT LOOP · STEP 5 / 10**.

| Local frame | Event |
|---|---|
| 0–20 | Corner title "BOUNDARIES". The loop draws at the centre and the cube takes its right station. Scene 6's caveat pill fades (6–20) |
| 30–50 | On "boundaries", the fence draws around the loop |
| 60 / 93 / 126 / 170 | One sign per boundary pops on the fence's corners, on its word: **4 TOOLS ONLY** · **MAX 10 STEPS** · **CONFIRM BEFORE ORDERING** · **DONE = ORDERED + REPORTED** |
| 186–198 | The signs fade; the fenced loop slides left and shrinks; the portal fades in on the right |
| 202–216 | The cube prints a ticket, `place_order` (300 wide, no inputs), outside the fence |
| 204–216 | On "Instructions alone", a dashed purple line is painted on the centre line, with a speech bubble above it: "Please ask before ordering." |
| 218–238 | On "won't hold them", the ticket (ghosted) slides over the painted line without slowing. The line turns red and **NOTHING STOPS IT** appears below; it holds until the gate replaces the paint (1.2 s). The ghost stops 60 px short of the portal card |
| 238–252 | Everything rewinds to the line |
| 248–256 | The painted line and its bubble clear, before the gate's **HARNESS** label rises into the same space |
| 254–270 | On "The harness enforces them", the paint becomes a solid purple gate with the gear on top (**HARNESS**). The ticket bumps into it and stops. Badge: **WAITING FOR YOU** |
| 275–290 | A confirmation card (600 wide) drops above the gate: the person icon, "Place order? £9,750" and **APPROVE** |
| 290–302 | **APPROVE** presses (✓), the gate lowers and the ticket passes towards the portal, fading before it reaches the card |
| 300–314 | The portal flips from **NOT ORDERED** to **ORDERED** ✓ with "PO-20417", which pays off Scene 1. **NOT ORDERED** clears before **ORDERED** appears, so the two never overlap |
| 324–336 | Everything except the cube fades |

## Scene 8: Delegation (frames 2268–2580)

**Teaches:** a harness can hand bounded subtasks to subagents with their own contexts. That isolates or parallelises work, but adds cost and coordination.

Layout: the coordinating cube is at the top centre (960, 210). Three mirrored columns sit at x = 560, 960 and 1360. Each has a subtask chip (y = 450), a small cube with its own small context window beside it (y = 600), and a result glyph (y = 800). A single label line under the row (y = 735) carries **SUBAGENTS**, then **IN PARALLEL**. A **COST** meter is centred at y = 890.

| Local frame | Event |
|---|---|
| 0–20 | Corner title "DELEGATION". The cube rises to the top centre; a chip reads "PREPARE THE ORDER" |
| 52–80 | On "hand subtasks", the chip splits into three that slide to their columns: **QUOTES** · **QUALITY CHECK** · **PAPERWORK**. The parent chip clears at once, and the three only fade in once they have moved apart, so no two chips overlap |
| 85–100 | On "subagents", a small cube pops into each column, with a bracket and **SUBAGENTS** under the row |
| 129–150 | On "its own context", each gets a small, nearly empty context window |
| 171–197 | On "isolate", **SUBAGENTS** fades and dashed partitions drop between the columns |
| 203–250 | On "speed up", all three glow with a runner circling each, and **IN PARALLEL** replaces the label. A receipt glyph with a ✓ rises under each column |
| 252–290 | On "cost", the **COST** meter fills from 30% to 90% |
| 270–300 | On "coordination", the subagents dim to 20% and their subtask chips clear (the threads run up through them), purple threads draw from each result up to the coordinating cube, and they merge into **ORDER PACK** |
| 300–312 | Everything fades except the coordinating cube and **ORDER PACK**, which carry into Scene 9 and fade there (1.1 s in all) |

## Scene 9: When Tools Fail (frames 2580–3075)

**Teaches:** tool calls can fail in several ways, and a good agent reports what happened instead of hiding it. The finale ties the lesson together: the model proposes, and the harness acts.

Layout: a centred column of five failures (rows at y = 320–760, 110 px apart). Each row has a red glyph showing where it went wrong (a ticket for the request, a receipt for what came back) and a red label chip (28 px), left-aligned to the same x. The two answer cards (460 × 170) then sit mirrored at x = 960 ± 280.

| Local frame | Event |
|---|---|
| 0–18 | Corner title "WHEN TOOLS FAIL". The coordinating cube and Scene 8's **ORDER PACK** fade (4–18) |
| 16–28 | On "Tool calls", the five calls appear as plain cyan glyphs in the column (tickets and receipts, 3 frames apart, at 70%), so the opening isn't an empty frame |
| 60 / 82 / 104 / 126 / 148 | On "can fail", one row per word: each glyph turns red and its label pops: **WRONG TOOL** (ticket) · **WRONG INPUT** (ticket) · **CHANGED STATE** (receipt) · **DUPLICATE ACTION** (two receipts) · **MISREAD RESULT** (receipt) |
| 178–204 | On "A good agent", every row except **DUPLICATE ACTION** fades first (178–188); then that row glides to the top centre (y = 260, 186–204); then the two cards fade in (196–212): a dashed ghost card, "All done! ✓" (left), and a cyan report card (right). Nothing moves through text that is still on screen |
| 211–240 | On "reports what happened", the report types: "Ordered twice. One needs cancelling." **REPORTED** ✓ pops under it |
| 252 | On "instead of hiding it", the ghost card turns red with a ✕, and **HIDES THE FAILURE** pops under it |
| 300–318 | Finale: everything in the scene fades out completely |
| 322–346 | On the empty background, pinned to true screen centre, a diagram builds: the cube (x = 520), the purple gate with the gear (**HARNESS**), and the **PURCHASING PORTAL** dock (x = 1250, 460 wide), centred as a group. A ticket glyph travels out along the top arrow and a receipt glyph back along the bottom one, on a loop |
| 360 | "THE MODEL PROPOSES. THE HARNESS ACTS." (56 px, one line) springs in at y = 760, then scales from 1 to 1.04 |
| 405–495 | The whole frame fades to black over 3 s |

## Voiceover script

| # | File | Line | Words / scene length (estimated) |
|---|---|---|---|
| 1 | `01-words.wav` | "A model alone only writes text. It can describe placing an order, but can't place one. An agentic system lets it act, step by step." | 25 / 11.2 s |
| 2 | `02-tools.wav` | "The app lists the tools. The model replies with a request: a tool name and inputs. The app checks it, then runs the tool itself." | 25 / 10.4 s |
| 3 | `03-context.wav` | "The result goes into the context, and the model is called again, with the whole context rebuilt, until it answers or requests another tool." | 24 / 10 s |
| 4 | `04-loop.wav` | "An agent is a decision loop: check the goal and current state, pick a next step, see the result, repeat. Until it's done, or needs help." | 26 / 10.8 s |
| 5 | `05-workflow.wav` | "A workflow follows steps designed in advance. An agent picks each step from what it finds. Many systems put a bounded agent inside a workflow." | 25 / 10.4 s |
| 6 | `06-harness.wav` | "Both run in a harness: the software around the model. It builds each request, keeps state, runs tools with its own access, enforces limits and records what happened." | 28 / 11.6 s |
| 7 | `07-boundaries.wav` | "Agents need boundaries: which tools, how many steps, when to confirm, what counts as done. Instructions alone won't hold them. The harness enforces them." | 24 / 11.2 s |
| 8 | `08-delegation.wav` | "The harness can also hand subtasks to subagents, each with its own context. That can isolate or speed up work, but adds cost and coordination." | 25 / 10.4 s |
| 9 | `09-failure.wav` | "Tool calls can fail: wrong tool, wrong input, changed state, duplicate actions, misread results. A good agent reports what happened, instead of hiding it." | 24 / 16.5 s (about a 10 s take, a 3.5 s silent finale and a 3 s fade to black) |

### ElevenLabs v3 lines

The same lines with emotion tags, ready to paste:

1. `[calm, matter-of-fact]` A model alone only writes text. `[slight emphasis]` It can describe placing an order… `[pause]` but can't place one. `[warmly, building]` An agentic system lets it act, step by step.
2. `[clear, explanatory]` The app lists the tools. `[methodical]` The model replies with a request: a tool name and inputs. `[firm]` The app checks it, then runs the tool itself.
3. `[steady]` The result goes into the context, and the model is called again, `[emphasis]` with the whole context rebuilt, `[lightly]` until it answers or requests another tool.
4. `[engaged]` An agent is a decision loop: `[rhythmic, listing]` check the goal and current state, pick a next step, see the result, repeat. `[pause]` `[thoughtful]` Until it's done… or needs help.
5. `[explanatory]` A workflow follows steps designed in advance. `[curious]` An agent picks each step from what it finds. `[matter-of-fact]` Many systems put a bounded agent inside a workflow.
6. `[revealing]` Both run in a harness: `[pause]` the software around the model. `[brisk, listing]` It builds each request, keeps state, runs tools with its own access, enforces limits, `[softly]` and records what happened.
7. `[clear, measured]` Agents need boundaries: which tools, how many steps, when to confirm, what counts as done. `[cautionary]` Instructions alone won't hold them. `[pause]` `[firm]` The harness enforces them.
8. `[explanatory]` The harness can also hand subtasks to subagents, each with its own context. `[balanced]` That can isolate or speed up work, `[slight emphasis]` but adds cost and coordination.
9. `[serious, listing]` Tool calls can fail: wrong tool, wrong input, changed state, duplicate actions, misread results. `[pause]` `[warmly, direct]` A good agent reports what happened, `[firm]` instead of hiding it.

Put recorded takes in `public/vo/how-ai-takes-action/`; each plays automatically once its file exists. After recording:

1. Measure each take's phrase times with ffmpeg `silencedetect`.
2. Change each scene's length in `timing.ts`.
3. Move each scene's beats onto the words they're marked against.
4. Re-run `npm run center:action`.

Scene 9's five failure rows are read as a quick list. If the take puts them closer together than about 20 frames, keep each row's entrance on its word, but make sure the rows are all on screen and still for at least 1.5 s before "A good agent".

## Audio

- **SFX** come from the shared library generated by `scripts/generate-sfx.mjs`. This lesson added two sounds; the existing 22 files stayed byte-identical:

  | Sound | Used for |
  |---|---|
  | `print.wav` | A short ratchet as a ticket or receipt prints (Scenes 2, 3, 4 and 7) |
  | `rewind.wav` | The reverse sweep when Scene 7 rewinds the ticket over the painted line |

  Reuse from the library:

  | Sound | Used for |
  |---|---|
  | shield-hit | Words reaching the portal; the cube's line stopping at the wall; the ticket hitting the gate |
  | lock-click | Check lights, the gear turning, the fence closing, the key and the gate dropping |
  | scan | Docks running a tool |
  | pour | Slices entering a frame |
  | data-pulse | Ring and loop paths drawing |
  | data-rush | The runner and shuttle laps |
  | rapid-typing | Prompts, responses and the report |
  | pop | Chips and modules |
  | slice | The task splitting into subtasks |
  | tick-up | Step and model-call counters |
  | power-up | The gear opening into the harness |
  | rating-ding | **ORDERED**, **APPROVE** and **REPORTED** |
  | error-buzzer | Red ✕s and **NOTHING STOPS IT** |
  | chime | The finale title |
  | synth-swell | The finale diagram |
- **Cue sheet** is `SFX` in `audio.tsx`. Every cue is written as (scene, local frame) from `timing.ts`, so re-timing a scene moves its sounds with it.
- **Ducking:** the shared mixer drops beds about 11 dB and accents about 6 dB under narration, as in the earlier videos.

## Review checklist for this lesson

Use `videos/practices.md` as usual. These points are the ones most likely to go wrong in this lesson:

- **The model never crosses the wall or touches a tool.** It only ever produces tickets. Check every frame of Scenes 2, 3 and 7.
- **The app or harness is the only thing that runs a tool, holds a key or writes to the portal.**
- **The film strip reads as separate calls, not one growing tank.** Check that each frame's copy-across is visible.
- **Scene 7's painted line says "could", not "will".** The ghost ticket crosses it, but no order is ever shown without approval.
- **Every red state has its correct counterpart on screen:** the dim notes in Scene 9 and the report card.
- **The layout rules hold**: symmetric about the centre line, captions at y = 950, nothing under 24 px, and labels gone once they have done their job. Check the mid-transition frames of the film strip, the harness bloom and the Scene 7 phase change.

## Out of scope

These topics from §5 are left out to keep the video near 100 seconds. Most belong in the second agentic video:

- **Integrations and MCP** (one connection exposing several tools, resources and prompt templates), **skills** (progressive disclosure, what a skill can't do), **permissions** (available versus allowed versus confirmed) and **capabilities** (the layered sum). These are the second agentic video. The two tools on one purchasing portal in this lesson set it up.
- **The same model seeming cautious in one harness and autonomous in another.** This fits the second video's capability scene, where harness behaviour is one layer.
- **Client-side versus provider-side tools**, and web search versus web fetch: too fine-grained for this level.
- **The tool category table** (search, files, commands, data, external services) and its operating-system analogues. The four example tools stand in for it.
- **Orchestration techniques** (plans and checklists, critique-and-revise, validating intermediate results) and poor orchestration causing loops. These would make a short of their own.
- **Multi-agent independence:** agents using the same model and sources aren't automatically independent. It's a good follow-up to Scene 8, but it needs its own beat.
- **Read operations exposing sensitive information,** and the cost of simple queries. This belongs in the second video's permissions scene.
- **A harness supporting a single response.** Scene 6 implies that a harness need not be agentic (the workflow runs in it too), but it doesn't show the single-response mode from the playbook's operating-modes illustration.
