# Lesson 4 Reviews: How AI Takes Action

Each review is its own section, newest last. Every review is scored against `videos/practices.md`.

## Review 1: Baseline, rework to the medical-device example, and re-review against the 9.5 target (2026-11-10)

**Reviewed against:** `videos/practices.md` (9.5 target, text judged by role).
**Source:** the render from `npm run render:action` (frames 0–3075) before any change, sampled every 10 frames. Every transition was scrubbed every 2–3 frames, and suspect frames were checked at full resolution. The fixes were then re-rendered and every changed scene and transition re-checked the same way.
**Limits:**
- **No voiceover is recorded yet.** Sync was checked against the planned word timings in `timing.ts` and the script in `BLUEPRINT.md`, not against audio. Every beat is an estimate until the takes exist (see the blueprint's re-timing steps).
- No scene lengths changed. The scene count, mechanics and number of items per beat are unchanged.
- `npx tsc --noEmit` is clean. No shared code changed, so lessons 1–3 render exactly as before.

**Frame numbers** are scene-local unless marked *abs*.

### The running example changed

Lessons 1–3 moved from a Canberra hotel trip to a generic medical device company. This lesson now continues lesson 3's story: the viewer needs **500 flow sensors by June**, and asks the AI to place the order. The examples stay non-clinical: no patients, diagnoses or results.

| Old (travel) | New (medical device) |
|---|---|
| "Book my hotel for the Canberra trip." | "Order 500 flow sensors by June." |
| "I'd book Parkside Hotel for 12–17 March on the travel portal." | "I'd order 500 from Northfield Sensors on the purchasing portal." |
| TRAVEL PORTAL · "Parkside Hotel · 12–17 Mar" · NOT BOOKED / BOOKED · ref PK-0412 | PURCHASING PORTAL · "500 flow sensors · by June" · NOT ORDERED / ORDERED · PO-20417 |
| Tools `read_policy`, `search_hotels`, `check_availability`, `book_hotel` | Tools `read_policy`, `search_suppliers`, `check_stock`, `place_order` |
| Docks READ FILE · HOTEL SEARCH · TRAVEL PORTAL | Docks READ FILE · SUPPLIER SEARCH · PURCHASING PORTAL |
| Inputs "city: Canberra" · "dates: 12–17 Mar" | Inputs "part: flow sensor" · "qty: 500" |
| Result "Parkside · $235" · "Capital Tower · $289" | Result "Northfield · 25 days" · "Apex · 40 days" |
| Goal "Book a hotel within policy"; rows "Parkside, ~~Capital Tower~~" · "Limit: $250 a night" · "Parkside is free" | Goal "Order sensors within policy"; rows "Northfield, ~~Apex~~" · "Lead-time limit: 30 days" · "Northfield: 500 in stock" |
| Workflow SEARCH · CHECK LIMIT · BOOK CHEAPEST; TRIP REQUEST · FIND A HOTEL · SEND ITINERARY | SEARCH · CHECK LIMIT · ORDER CHEAPEST; PART REQUEST · FIND A SUPPLIER · SEND FOR SIGN-OFF |
| Agent results "Capital Tower $289?" · "$250 limit" · "Parkside is free" | "Apex: 40 days?" · "30-day limit" · "Northfield in stock" |
| Signs CONFIRM BEFORE BOOKING · DONE = BOOKED + REPORTED; bubble "Please ask before booking." | CONFIRM BEFORE ORDERING · DONE = ORDERED + REPORTED; "Please ask before ordering." |
| "Book it? $1,175" | "Place order? £9,750" (500 × £19.50) |
| PREPARE THE TRIP → FLIGHTS · TRANSFER · EXPENSES → TRIP PLAN | PREPARE THE ORDER → QUOTES · QUALITY CHECK · PAPERWORK → ORDER PACK |
| "Booked twice. One needs cancelling." | "Ordered twice. One needs cancelling." |

The numbers tie back to lesson 3: §4.2's 30-day lead-time limit rules out Apex Precision (40 days), which lesson 3 already showed as over the limit, and §3.1 ("All orders go through the purchasing portal") is why two of the tools reach the same portal. All names, prices and references are invented.

**Voiceover changes.** Only line 1 named the old story:

- Before: "A model alone only writes text. It can describe booking a hotel, but can't book one. An agentic system lets it act, step by step."
- After: "A model alone only writes text. It can describe placing an order, but can't place one. An agentic system lets it act, step by step."

It is still 25 words, and "order" falls where "hotel" did, so the Scene 1 beats keep their frames (the portal card appears on "order"; the words dissolve on "can't place one"). The ElevenLabs v3 version of line 1 changed to match. Lines 2–9 are generic and are unchanged.

### Baseline summary

| # | Scene | *Abs* frames | Baseline | Verdict |
|---|---|---|---|---|
| 1 | Words Aren't Actions | 0–336 | **8.5** | A clear opener: a description that can't reach the portal. The takeaway is up for only about a second, and the drifting words run into the portal card. |
| 2 | Tool Calling | 336–648 | **8** | The wall-and-gate device teaches the idea well. The takeaway is up for under a second, the ticket's text crosses the gate's outline, and the wall runs through THE APP. |
| 3 | Back Into Context | 648–948 | **8.5** | The film strip shows the rebuild clearly. Transitions are cluttered: the receipt crosses the gate and the cube, and the fading wall overlaps the first frame. |
| 4 | The Agent Loop | 948–1272 | **9** | A strong model of the loop, with exits. The cube glides across GOAL & STATE as the label appears. |
| 5 | Workflow vs Agent | 1272–1584 | **9** | Blueprint versus step-by-step is clear. Result chips sit on the dashed routes to the dimmed alternatives. |
| 6 | The Harness | 1584–1932 | **8.5** | The gear opening into the frame works. The footnote is up for under a second, two tab labels overlap, and RECORDS touches the tape. |
| 7 | Boundaries | 1932–2268 | **8** | Paint versus gate is the lesson's best idea. The bottom signs collide, the ghost ticket overlaps the portal, NOT BOOKED and BOOKED overlap, and the payoff is very short. |
| 8 | Delegation | 2268–2580 | **8.5** | Subagents, isolation, parallel and cost are all shown. The chips overlap mid-split, threads cut through chips, and the result chip shows for half a second. |
| 9 | When Tools Fail | 2580–3075 | **8.5** | Failures, an honest report versus a hidden failure, and a strong finale. The hand-off from the rows to the cards is cluttered, and the scene opens on an empty frame. |

**Baseline average: 8.5/10.** The concepts and devices are right and consistent (the wall, tickets and receipts, the ring, the gate). Most findings are transitions where text crosses text or outlines, and takeaways shown too briefly to read.

### Findings and fixes

| # | Scene | Frames | Severity | Finding | Fix |
|---|---|---|---|---|---|
| 1 | All | — | Medium | Takeaway captions were 28 px with 0.06em spacing. Lessons 1–3 use a 26 px caption with 0.16em spacing, and the Scene 6 caveat was plain grey text, not the series' caveat pill. | `Note` now matches the series' takeaway caption (26 px / 700 / 0.16em, white). A new `Caveat` renders the caveat pill (26 px, white 7% fill, 35% white border). |
| 2 | 1 | 184–222 | Medium | "DESCRIBING ISN'T DOING" was readable for about 1.2 s (it needs 1.4 s). | It holds until 250, while the loop starts to draw well above it (2.2 s). |
| 3 | 1 | 176–188 | Low | The drifting words crossed the response card's border and touched the portal card. | The response card clips its words, so they vanish at its own edge and never reach the portal. |
| 4 | 2 | 284–312 | High | "THE MODEL ASKS. THE APP RUNS." was readable for under a second (six words need 2.3 s). | It now appears on "runs the tool" (255), holds through the cut and fades in Scene 3 (2.7 s). |
| 5 | 2 | 18–24 | Medium | The shrinking portal card faded over its dock as the dock faded in (text on text). | The card has gone by frame 18, and the dock fades in from 20. |
| 6 | 2 | 205–216 | Medium | The full ticket slid into the gate, so its text crossed the gate's outline. | The ticket turns into a glyph where it stands, clear of the gate, and the glyph slides in. |
| 7 | 2 | 19–312 | Low | The wall's dashed line ran through THE APP above the gate. | A gap in the wall behind the label. |
| 8 | 2 | 277–295 | Low | The "can't reach" line started from empty space below the cube. | It runs down from the cube and across to the wall, where it stops at the ✕. |
| 9 | 2 | 150–200 | Medium (new) | `search_suppliers` overflowed the 280-wide ticket. | The ticket is 320 wide. |
| 10 | 3 | 10–30 | Medium | The receipt crossed the gate's outline at full size, then touched the cube. | It crosses the gate as a glyph, prints above and left of the gate (670, 350), 10 px clear of the gate and ahead of the cube's path, then waits by the cube. |
| 11 | 3 | 34–46 | Medium | The fading wall, gate and THE APP overlapped CALL 1 as it drew. | The wall world fades out over 20–34, and the strip starts drawing at 34. |
| 12 | 3 | 63–75, 162–180 | Low | Copied slices slid out from on top of the previous frame's in-slice labels. | Old labels fade just before the copies start. |
| 13 | 4 | 8–16 | Low | The cube glided across GOAL & STATE as the label appeared. | The label waits until the cube has passed (16–24). |
| 14 | 5 | 116–200 | Low | Result chips sat on the dashed routes to the dimmed alternative nodes. | The chips sit under the node labels (y = 860), clear of every route. |
| 15 | 6 | 300–348 | High | The footnote was readable for under a second (eight words need 2.9 s), in a style unlike the series' caveats. | It's a caveat pill from 280, after the last module, and holds into Scene 7 (2.9 s). |
| 16 | 6 | 84–94 | Medium | THE APP and HARNESS overlapped on the tab mid-crossfade. | THE APP fades out before HARNESS fades in. The tab turns opaque quickly, so the frame's edge never shows through it. |
| 17 | 6 | 74–84 | Low | The growing frame's edge cut across the ring and cube. | The frame is drawn beneath the emblem, and the gear's label fades before the frame reaches it. |
| 18 | 6 | 300–348 | Low | RECORDS touched the trace tape's first entry. | The tape starts at x = 460. |
| 19 | 7 | 170–198 | Medium | The two long bottom signs met in the middle; with the new wording they would overlap. | Each sign hangs outward from its corner (left signs left, right signs right). |
| 20 | 7 | 224–238 | Medium | The ghost ticket overlapped the portal card's edge. | The fence and portal sit 560 either side of centre, and the ghost stops 60 px short of the card. |
| 21 | 7 | 306–312 | Medium | NOT BOOKED and BOOKED overlapped mid-crossfade. | NOT ORDERED clears before ORDERED appears. |
| 22 | 7 | 306–336 | Medium | The payoff was readable for about 0.5 s, and the passing ticket covered the card's text. | The pass is 292–302, ORDERED at 300, and the fade at 324 (about 1.1 s). The ticket fades before it reaches the card. |
| 23 | 7 | 252–262 | Low | The fading speech bubble overlapped the rising HARNESS label. | The paint and bubble clear over 248–256. NOTHING STOPS IT holds through the rewind (1.2 s). |
| 24 | 8 | 54–64 | Medium | The parent chip and the three subtask chips sat on top of each other mid-split. | The parent clears at once; the three only fade in once they've moved apart. |
| 25 | 8 | 280–300 | Low | The merge threads ran through the dimmed subtask chips. | The chips clear as the threads draw, and the subagents dim to 20%. |
| 26 | 8 | 296–312 | Medium | TRIP PLAN, the scene's payoff, was readable for about 0.5 s. | ORDER PACK carries into Scene 9 with the coordinating cube and fades there (1.1 s). |
| 27 | 9 | 178–200 | Medium | DUPLICATE ACTION glided up through the fading rows, and the cards faded in over them. | The rows clear first (178–188), then the kept row rises (186–204), then the cards fade in (196–212). |
| 28 | 9 | 14–60 | Low | The scene opened on about 1.5 s of empty frame while the narrator says "Tool calls". | On "Tool calls", the five calls appear as plain cyan glyphs. Each turns red as its failure is named. |
| 29 | 9 | 322–495 | Low (new) | The finale's dock is wider for PURCHASING PORTAL. | The cube and dock moved so the diagram stays centred (x 437–1483). |

### Scores

| # | Scene | Baseline | Final | Remaining note |
|---|---|---|---|---|
| 1 | Words Aren't Actions | 8.5 | **9.5** | As the words dissolve, their spacing widens slightly before they drift. Cosmetic. |
| 2 | Tool Calling | 8 | **9.5** | None. |
| 3 | Back Into Context | 8.5 | **9.5** | Copied slices still slide across the gap between frames, which reads as copying. |
| 4 | The Agent Loop | 9 | **9.5** | The new goal ("Order sensors within policy") wraps to two lines, and the card sits about 20 px from the cube. |
| 5 | Workflow vs Agent | 9 | **9.5** | For about 0.5 s (230–244) only the relabelled rail is on screen before the bounded agent opens. |
| 6 | The Harness | 8.5 | **9.5** | None. |
| 7 | Boundaries | 8 | **9.5** | The ticket's pass through the open gate is quick (10 frames), to give ORDERED its reading window. |
| 8 | Delegation | 8.5 | **9.5** | The subagent cubes are small (30 px), but they are secondary and labelled by their columns. |
| 9 | When Tools Fail | 8.5 | **9.5** | Until the labels pop, the glyph column sits left of centre. |

**Lesson average: 9.5/10** (was 8.5).

**Not fixed, and why:**
- **Sync can't be confirmed without audio.** Every beat is planned against estimated word timings. Once the takes are recorded, re-time each scene to its take and re-check sync, especially where reading windows now depend on a caption carrying across a cut (Scenes 2→3, 6→7 and 8→9).
- **No centring track.** Every layout is still built around screen centre. The wider docks and portal were rebalanced by hand, so the empty `centering.ts` is kept and no `center:action` script was added.
