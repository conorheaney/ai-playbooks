# Lesson 3 Reviews: How AI Gets Context

Each review is its own section, newest last. Every review is scored against `videos/practices.md`.

## Review 1: Baseline (2026-11-09)

**Reviewed against:** `videos/practices.md`
**Source:** rendered `out/how-ai-gets-context/how-ai-gets-context-1080p.mp4` (frames 0–2660), `BLUEPRINT.md` and `timing.ts`. Suspect frames were checked at full resolution.
- The render (18:04) is newer than every lesson 3 source file.
- Shared `ContextTank` and `Bubble` have changed since, but only with optional props whose defaults match the old behaviour. The MP4 therefore reflects the current state.

**Note:** this lesson has uncommitted work from another workstream. Coordinate with it before implementing any of these changes.
**Constraint:** the voiceover is fixed, so every suggestion keeps to the existing beats in `timing.ts`. Frame numbers are scene-local unless marked *abs*.

### Summary

| # | Scene | Abs frames | Score | Verdict |
|---|---|---|---|---|
| 1 | Beyond the Weights | 0–282 | **8/10** | Files, rules and news bounce off the locked model, then drop into the window. A strong opener, but the weight values sit on top of the cube. |
| 2 | The Prompt | 282–592 | **8.5/10** | A bare request grows into a five-part brief, one module per spoken word. The bare request disappears, so the before/after contrast is lost. |
| 3 | Vague vs Specific | 592–946 | **7.5/10** | The right comparison, but it's the densest frame in the series. Table text, chips and the answer label are 8–14 px. |
| 4 | Context Engineering | 946–1280 | **8/10** | SELECT, ORDER and FIT through a gate, with LEFT OUT kept in view, is an excellent model. The fit transit is cluttered and the stamps cover card labels. |
| 5 | Retrieval: Prepare | 1280–1580 | **7.5/10** | The pipeline (collection, then split, tag and index) is correct and well timed, but almost every label is 8–12 px. |
| 6 | Retrieval: Ask | 1580–1860 | **8/10** | Search, rank, TOP 2 and retrieved-with-sources is clear and accurate. The index labels are unreadable at 0.8 scale, and chunks cross the ranking list in transit. |
| 7 | Check the Source | 1860–2174 | **8.5/10** | The lesson's sharpest idea: a real citation that doesn't support the claim. Its source-card text is too small to read the mismatch. |
| 8 | Memory | 2174–2660 | **8.5/10** | The app stores, the model proposes, then the memory is retrieved and used or ignored. The finale diagram ties the lesson together. The key caption "THE MODEL CAN'T SAVE ANYTHING ITSELF" is about 16 px. |

**Lesson average: 8.1/10.** This is the most ambitious and accurate of the three lessons.
- It covers prompts, context engineering, retrieval (as two phases), citations and memory.
- Each one keeps the series' rule that the app, not the model, does the work.
- The running travel-policy example works throughout.

**The main weakness is density.** This lesson puts the most objects on screen and has the smallest text in the series. Much of it is 8–14 px: reference chips, index slots, table cells and source cards. The concepts are right, but at 1080p, and especially on a phone, viewers can't read the evidence that makes each point.

---

### Scene 1: Beyond the Weights (8/10)

**VO:** "The model's weights are fixed after training. It can't know your files, your company's rules, or today's news, unless they reach the context."

**What works**
- The locked cube with "v1.0 · LOCKED" and frozen weights calls back to Lesson 1, Scene 9 straight away.
- Three concrete cards (`q3-report.xlsx`, `travel-policy-2025.pdf`, "Airport strike announced") each bounce off the padlock with a red ✕ on their spoken word.
- On "unless they reach the context", the same cards turn cyan and drop into the window, with "THE ONLY WAY IN". The thesis of the lesson lands in one beat.
- The centred-row layout keeps everything balanced as areas join and leave.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The weight values overlap the cube.** "0.94", "−0.32" and "0.45" sit on the cube's faces and padlock (*abs* 60–180). Lessons 1 and 2 both clear values out of the cube's footprint (`CUBE_CLEAR` in Lesson 1's `LockInScene`, the `SHOWN` filter in Lesson 2's `TemporaryScene`). | 4: no overlaps; 7: consistent recurring elements |
| Low | "THE ONLY WAY IN" is about 16 px, and the card labels about 11 px. | 4: legibility |
| Low | The red ✕ for each bounce sits on the cube's edge and overlaps a weight value. | 4 |

**Suggested changes**
1. **Reuse the clearance filter** from Lesson 2's `TemporaryScene`: hide any value within the cube's half-width plus a label margin, and the farther of any two values that crowd each other.
2. Make "THE ONLY WAY IN" 24–28 px (it's the lesson's thesis) and the card labels 16 px.
3. Place the bounce ✕ just outside the cube's right edge, clear of the values.

---

### Scene 2: The Prompt (8.5/10)

**VO:** "The first pathway is the prompt: the direction you give. An objective, background, constraints, the output you want, and how it will be checked."

**What works**
- "Recommend a hotel." grows into a brief, adding one module per spoken word (OBJECTIVE, BACKGROUND & SOURCES, CONSTRAINTS, OUTPUT, CHECKS).
- The card grows equally up and down, so it stays centred, and each module's coloured edge separates the parts.
- The module content follows the running example and is realistic.
- "Not every task needs every piece." is a responsible caveat.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The bare request vanishes.** "Recommend a hotel." fades as the card forms, so the viewer never sees the vague and full versions side by side. The improvement is shown as a replacement, not a comparison. | 1: show the mechanism; 8: one example |
| Low | Module labels are about 11 px, module text about 18 px, and the "YOUR PROMPT" label about 11 px. | 4: legibility |
| Low | The caption is plain 20 px white. | 3: hierarchy |

**Suggested changes**
1. **Keep the bare request as a ghost.** Shrink "Recommend a hotel." to a dim, struck-through chip above the card ("BEFORE") instead of fading it, or show it in the card's OBJECTIVE row as the seed that the other modules grow around.
2. Make module labels 16 px and module text 22 px. The 760 px card has room.
3. Style the caption like the other takeaways (letter-spaced, 24 px).

---

### Scene 3: Vague vs Specific (7.5/10)

**VO:** "Give the same documents to a vague prompt and a specific one. The specific prompt gets an answer you can review. Structure helps, but it doesn't make it correct."

**What works**
- The same two documents fork into both lanes, so the only variable is the prompt.
- The vague result shows open questions ("Which ones fit the limit?", "Says who?"). The specific one shows a table with ✓/✕ and a `[§4.2]` on every row. "Easy to review" is shown, not just said.
- The final "CHECK" on $245 plus "Clearer to review. Not guaranteed correct." keeps the honesty theme.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **The key evidence can't be read.** Table cells are about 14 px, reference chips about 10 px, the column headers about 9 px, and the ANSWER, PROMPT, VAGUE and SPECIFIC labels about 11 px (*abs* 780–935). The scene's argument is "look how reviewable this is", and it can't be reviewed at 1080p. | 4: legibility |
| Medium | **Too many columns for the frame:** documents, fork, prompt, mini cube, arrow and result, repeated in two lanes. The row spans about 1,700 px, so every element is small. | 5: use the frame; 8: cognitive load |
| Medium | **Why $245 needs checking is never shown.** It's under the $250 limit and marked ✓, so a red "CHECK" on it looks arbitrary, or suggests it's wrong. | 1: show the mechanism |
| Low | The mini cubes (about 50 px) read as icons rather than "the model", and could be dropped. | 3: hierarchy |

**Suggested changes**
1. **Drop columns to gain size.** Remove the mini cubes and their arrows. Merge the two document icons into one "SAME DOCUMENTS" stack that fades out once the forks draw (by about 48). Give the freed width to the prompts and results.
   - Results: 640 × 320.
   - Table text: 22 px.
   - Chips: 16 px.
   - Lane labels: 18 px.
2. **Explain the check.** At 255, show a tiny source tooltip beside the red price, such as "hotel-options.md says $254", so the viewer sees why the structured answer can still be wrong. It's the same beat, just with a visible reason.
3. Make the question bubbles in the vague lane 18 px.

---

### Scene 4: Context Engineering (8/10)

**VO:** "Context engineering decides what else goes in. The app selects instructions, history and sources, puts them in order, and leaves out what's outdated or conflicting."

**What works**
- **The gate with SELECT, ORDER and FIT steps** is a clear, memorable model of something usually explained in prose.
- LEFT OUT material stays in view, in a red dashed zone with a reason stamp (**OUTDATED**, **CONFLICTS WITH POLICY**). "The app chose to leave it out" is shown, not implied.
- The ordered column stacks in window order (instructions at the bottom, prompt at the top), so the slices land in the right place.
- The gear and APP ACTION badge keep the series rule.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The FIT transit is cluttered** (*abs* 1200). A card passes over the gate's ORDER and FIT pills while a large cyan landing box sits in the window, and the gear label crowds the gate's top. | 6: clean in-betweens; 4: no overlaps |
| Medium | **The stamps cover their own cards' labels.** "CONFLICTS WITH POLICY" sits over "EMAIL" and the struck-through text (*abs* 1230), and "OUTDATED" clips the DOCUMENT label. | 4: no overlaps |
| Low | **Naming drift.** The card reads "YOUR PROMPT", but its slice lands as "YOUR MESSAGE". | 7: consistent naming |
| Low | Card labels about 10 px, card text about 15 px, gate pill labels about 12 px. | 4 |
| Low | The SELECT step's cyan outlines are subtle against cyan-bordered cards. | 3 |

**Suggested changes**
1. **Fade the gate pills not in use** to 40% during FIT, and drop the in-window landing box (let each slice appear as the card arrives). Move "THE APP" 30 px further above the gate.
2. **Put the stamps above their cards**, overlapping only the top border, or to the right of the card, rather than over its text.
3. **Use one name.** Either label the slice "YOUR PROMPT", or the card "YOUR MESSAGE", to match Lesson 2.
4. Make card labels 14 px, card text 18 px and gate pills 16 px. During SELECT, fill the selected cards at 15% cyan as well as outlining them.

---

### Scene 5: Retrieval, Part 1: Prepare (7.5/10)

**VO:** "For large or changing collections, there's retrieval. Ahead of time, documents are split into chunks, tagged with their source, and added to a search index."

**What works**
- **The AHEAD OF TIME badge** (and PER QUESTION in Scene 6) cleanly separates retrieval's two phases. Most explainers blur them.
- The document counter ticking up and back (+ NEW / − OLD) is a neat, accurate picture of "changing collections".
- Chunks gain source chips and versions (`travel-policy · 2025`), so provenance is attached before indexing. That's correct, and it pays off in Scene 7.
- The index starts half-full with older chunks, so the viewer sees an existing index being added to rather than built from nothing.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **Nearly everything is unreadable.** At *abs* 1500, chunk strips have about 9 px text and about 10 px chips. Index slot labels are about 8 px. "+ NEW" and "− OLD" are about 9 px. "Tagged with their source" is the beat, and the tags can't be read. | 4: legibility |
| Medium | **The left third is mostly empty** while the action sits in a narrow middle column: a single document icon and a counter at x = 260. | 5: use the frame |
| Low | Twelve chunk strips in three groups are more than needed to show splitting. | 8: cognitive load |

**Suggested changes**
1. **Show fewer, bigger chunks.**
   - Split only `travel-policy-2025.pdf` into four chunks, at 280 × 44 with 18 px text and 16 px chips (`[§3.1]` `[§3.2]` `[§4.2]` `[§4.3]`).
   - Have the other two documents split off-screen-small, as a quick flicker that keeps the beat.
   - The four §-chips are the ones Scene 6 retrieves, so viewers can track them.
2. **Use the left side.** Make the document stack 1.5× larger, with the counter at 28 px and "+ NEW" / "− OLD" at 18 px.
3. Make index slot labels 14 px, or show labels only on the newly filed slots.

---

### Scene 6: Retrieval, Part 2: Ask (8/10)

**VO:** "When you ask a question, the system searches the index, ranks what it finds, and adds only the best chunks to the context, with their sources."

**What works**
- The question appears as a search bar *and* drops into the window as YOUR QUESTION. That's accurate: the query and the context are separate things.
- A scan line, then a ranked column with scores, then a **TOP 2** cut line, then NOT USED, maps every verb in the VO.
- The retrieved slices are labelled `RETRIEVED · §4.2` and `RETRIEVED · §3.1`, so the sources ride into the context (the "with their sources" beat).
- The row stays centred and gains a column as ranking appears, which is good motion design.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The index is unreadable at 0.8 scale**, with about 7 px slot labels. The viewer can't see which slots the scan matched. | 4: legibility |
| Medium | **The top chunks cross the ranking list as they fly** (*abs* 1770). A slot passes over row 2 and the window's border while the list is still bright. | 6: clean in-betweens |
| Low | "RANKED", "TOP 2" and "NOT USED" are about 11 px, and the ranked chips about 12 px. | 4 |
| Low | The top two ranked rows (§4.2 0.92, §3.1 0.86) leave the list before the viewer can read their scores. The visible list then starts at 0.61. | 2: reading time |

**Suggested changes**
1. Make index slot labels 14 px, or hide the labels on unmatched slots and enlarge the matched ones.
2. **Dim the rest of the list to 35% before the top two fly** (move the NOT USED dimming from 206 to about 168). Route the flight above the list, not through it.
3. Make "TOP 2", "RANKED" and "NOT USED" 18 px and the ranked chips 16 px.
4. Hold the top two in place, ringed, for about 10 frames after the TOP 2 cut (150–160) before they fly at 170.

---

### Scene 7: Check the Source (8.5/10)

**VO:** "References make claims traceable, but not automatically true. A real source can still fail to support what the answer says. Check it."

**What works**
- **The lesson's most valuable idea.** Claim 3, "Breakfast is included. [§4.3]", cites a real section of a real document, which turns out to be about taxi receipts. It's subtle, realistic and memorable.
- Threads from each claim to its source card make "traceable" literal. The red frayed thread on NOT SUPPORTED is a great visual.
- The reveal is timed: claims 1 and 2 are supported on "but not automatically true", and claim 3 fails on "fail to support".
- The REVIEW badge shifts the frame to "your job now".

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The mismatch can't be read.** Source-card text ("Taxis: keep receipts over $30.") is about 13 px, and SUPPORTED / NOT SUPPORTED about 9 px (*abs* 2060–2140). The punchline depends on reading the source. | 4: legibility |
| Low | The source cards' file names (about 9 px) repeat on all three cards and add noise. | 8 |
| Low | The caption "A real citation isn't proof." is plain 20 px. | 3 |

**Suggested changes**
1. **Enlarge the source cards** to 500 × 140, with text at 20 px and status tags at 16 px. Drop the repeated file name, and keep only the `[§x.x]` chip.
2. At 196, briefly highlight "Taxis" in the source and "Breakfast" in the claim (red) so the mismatch is pointed out, not just stated.
3. Style the caption as a takeaway (24–28 px).

---

### Scene 8: Memory (8.5/10)

**VO:** "Memory is stored by the app, not the model. Later, a memory may be retrieved into the context, where the model can use it, or ignore it."

**What works**
- **The model proposes, the app stores:** a dashed PROPOSED card, then a ✓ STORE by the gear, then a solid MEMORY in a drawer. It's an accurate and rarely shown division of labour.
- "SCOPE: YOU · KEEP 90 DAYS" hints at memory governance without lecturing.
- NEXT WEEK, then only the relevant memory retrieved, then a response that uses it (USED ✓), plus a ghost response that ignores it (IGNORED), covers "use it, or ignore it".
- The memory ("Prefers hotels near Parliament House") calls back to the Lesson 2 compaction summary, a nice series thread.
- **The finale is excellent.** PROMPT, CONTEXT ENGINEERING, RETRIEVAL and MEMORY arrows all point into one window, with "EVERYTHING ARRIVES THROUGH CONTEXT." It sums up the whole lesson in one picture, then fades to black.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **"THE MODEL CAN'T SAVE ANYTHING ITSELF" is about 16 px** (*abs* 2250), the scene's most important correction at caption size. | 4: key labels ≥ 28 px |
| Low | Memory-store drawer text is about 11 px, and the scope tag about 12 px. | 4 |
| Low | The retrieved drawer slides across the store's border mid-transit (*abs* 2360). | 6 |
| Low | The IGNORED ghost is at 55% with about 16 px text, so it's easy to miss, and it's the "or ignore it" beat. | 3 |
| Low | The finale holds silently for about 3 s, then fades for 3 s. Six seconds without narration is long, though the fade is deliberate. | 2 |

**Suggested changes**
1. Make "THE MODEL CAN'T SAVE ANYTHING ITSELF" 24–28 px.
2. Make drawer text 16 px and the scope tag 16 px.
3. Raise the IGNORED ghost to 75% opacity, with 20 px text.
4. Lift the drawer clear of the store before it travels.
5. Optional: shorten the silent hold before the fade by about 1 s, keeping the scene length by extending the fade.

---

### Cross-lesson findings

1. **Text size is the lesson's main problem**, worse than Lessons 1 and 2. There are more objects and chips, and much of the text is 8–14 px.
   - Apply the same approach as Lessons 1 and 2: set sizes in each call, 16 px minimum for chips and labels, 18–22 px for content, 24–28 px for takeaways.
   - **Also reduce the object count** where text can't grow (Scenes 3 and 5).
2. **Same overlap rule as the other lessons.** Frozen weight values must clear the cube (Scene 1), and stamps must not cover their cards (Scene 4).
3. **Show the reason, not just the verdict.** The red CHECK in Scene 3 and NOT SUPPORTED in Scene 7 both need the viewer to see *why*. Scene 7 nearly does; Scene 3 doesn't.
4. **Naming consistency across the series.** Use "YOUR MESSAGE" (Lesson 2) or "YOUR PROMPT" (Lesson 3), not both for the same slice.
5. **Protect these:**
   - the gate model (4);
   - the two-phase retrieval badges (5, 6);
   - the real-but-irrelevant citation (7);
   - propose → store (8);
   - the finale diagram (8).

### Priority order

| # | Change | Scene | Why first |
|---|---|---|---|
| 1 | Fewer columns, larger table and chips; show why $245 needs checking | 3 | The scene's evidence is unreadable, and its key verdict is unexplained |
| 2 | Fewer, bigger chunks with readable chips | 5 | "Tagged with their source" can't be read |
| 3 | Clear weight values from the cube | 1 | A visible overlap in the opening seconds |
| 4 | Enlarge the source cards and highlight the mismatch | 7 | The lesson's best idea depends on reading it |
| 5 | Larger "THE MODEL CAN'T SAVE ANYTHING ITSELF" | 8 | Key correction at caption size |
| 6 | Clean the FIT transit; move the stamps off the card text | 4 | The two worst overlaps in the scene |
| 7 | Readable index; dim the list before the top two fly | 6 | Transit clutter and legibility |
| 8 | Keep the bare request as a ghost | 2 | Restores the before/after contrast |
| 9 | Text-size floor across the lesson | All | Lesson-wide legibility |
| 10 | Unify "YOUR PROMPT" / "YOUR MESSAGE" | 4 | Series consistency |
| 11 | Everything else | — | — |

**Projected lesson score with priorities 1–10 done:** about 8.9/10.

---

## Review 2: After implementing Review 1 (2026-11-09)

**Reviewed against:** `videos/practices.md`
**Source:** the re-rendered `out/how-ai-gets-context/how-ai-gets-context-1080p.mp4`. I took 32 fresh sample frames across all scenes and checked the suspect ones at full resolution.
**Scope of changes:**
- Every Review 1 suggestion is implemented, with three deliberate variations (see "Deviations from Review 1").
- No scene lengths changed.
- Only two beats moved, both as the review allowed: Scene 6's NOT USED dim (206 → 168) and Scene 8's fade start (396 → 366).
- The type-check is clean.
- No shared files or lesson 1/2 files were changed.
- The other workstream's uncommitted lesson 3 changes were built on with targeted edits, never reverted.

### Summary

| # | Scene | Review 1 | Review 2 | Change |
|---|---|---|---|---|
| 1 | Beyond the Weights | 8 | **9** | +1 |
| 2 | The Prompt | 8.5 | **9** | +0.5 |
| 3 | Vague vs Specific | 7.5 | **8.5** | +1 |
| 4 | Context Engineering | 8 | **8.5** | +0.5 |
| 5 | Retrieval: Prepare | 7.5 | **8.5** | +1 |
| 6 | Retrieval: Ask | 8 | **8.5** | +0.5 |
| 7 | Check the Source | 8.5 | **9** | +0.5 |
| 8 | Memory | 8.5 | **9** | +0.5 |

**Lesson average: 8.8/10** (was 8.1, projected 8.9).
- Both High-severity legibility issues are resolved. Scene 3's table is now readable, and so are Scene 5's chunk tags.
- Scene 3's red CHECK now has a visible reason, which keeps the lesson's honesty theme without changing the example data.
- What remains is mostly small text in the secondary layers (index slots, ranking chips, the CHECK callout), plus one in-transit overlap.

### Scene by scene

#### Scene 1: Beyond the Weights (9/10)
**Resolved:**
- Weight values now clear the cube and each other, with five on each side, using the same `SHOWN` approach as Lesson 2.
- The bounce ✕ sits just outside the cube's right edge.
- "THE ONLY WAY IN" is 26 px, and the card labels 16 px.

**Remaining:** none of note.

#### Scene 2: The Prompt (9/10)
**Resolved:**
- The bare request stays as a dim, struck-through "BEFORE · Recommend a hotel." chip above the growing card, restoring the before/after comparison.
- The module labels are 16 px.
- The caption is now a letter-spaced takeaway, "NOT EVERY TASK NEEDS EVERY PIECE".

**Remaining:**
- Low: the BEFORE chip is about 14 px at 60% opacity. That's right for a ghost, but it's the faintest text in the scene.

#### Scene 3: Vague vs Specific (8.5/10)
**Resolved:**
- The mini cubes are gone, and the documents merge into one "SAME DOCUMENTS" stack that leaves the row as the results arrive.
- The results are 640 × 320, with 22 px table text and 18 px chips. The table is now readable at 1080p.
- **CHECK now has a reason:** row 2 is tinted red, and a callout reads "Price from hotel-options.md, not the policy. Is it current?"

**Remaining:**
- Low: the CHECK callout text is about 15 px (*abs* 860), smaller than the table it annotates. Increase it to 18 px.
- Low: the caption "Clearer to review. Not guaranteed correct." is still plain 20 px. Scenes 2, 7 and 8 now use the letter-spaced takeaway style, so this is the odd one out.
- Low (by design): when the callout joins the row at 255, the whole row glides about 160 px left over half a second. It's smooth, but it's the largest re-centring move in the lesson.

#### Scene 4: Context Engineering (8.5/10)
**Resolved:**
- The OUTDATED and CONFLICTS WITH POLICY stamps sit on each card's top edge, clear of the text.
- During FIT, the inactive gate pills drop to 40%, and the in-window landing box is gone.
- THE APP is higher.
- The card is now "YOUR MESSAGE", matching its slice and Lesson 2.
- Selected cards get a cyan fill.

**Remaining:**
- Low: cards still pass over the gate in transit (*abs* 1200). The YOUR MESSAGE card covers the dimmed SELECT pill as it enters. It's brief and expected for "passing through a gate", but a fade-through effect (card at 60% while inside the gate) would read more cleanly.

#### Scene 5: Retrieval: Prepare (8.5/10)
**Resolved:**
- Only `travel-policy-2025.pdf` splits large, into four readable chunks with 16–18 px text and the §3.1, §3.2, §4.2 and §4.3 chips that Scene 6 retrieves.
- The document stack is 1.5× larger, with a 28 px counter.
- "+ NEW" and "− OLD" are 20 px.

**Remaining:**
- Low: the other two documents' chunks show as unlabelled strip stacks above and below (*abs* 1460–1500). They read as decoration rather than "other documents being split". A faint file-name label on each would fix it.
- Low: index slot labels are about 12–14 px at render size.

#### Scene 6: Retrieval: Ask (8.5/10)
**Resolved:**
- The top two are ringed and held over 150–170, and NOT USED dims at 168.
- The top two now fly along their own rows into the window, so they no longer cross the list.
- The slot labels and ranked chips are larger.

**Remaining:**
- Low: at 0.8 scale the index slot labels are still about 12 px (*abs* 1770). The "which slots matched" detail is still hard to see. Brightening the matched slots more than the unmatched ones would help more than size alone.
- Low: as each top chunk drops into the window, it briefly overlaps the window's top border (*abs* 1770).

#### Scene 7: Check the Source (9/10)
**Resolved:**
- The source cards are 500 × 140, with 21 px text and 16 px status tags, and the repeated file names are gone.
- **"Breakfast" and "Taxis" are highlighted red** at 196, so the mismatch can be read.
- The caption is now a letter-spaced takeaway, "A REAL CITATION ISN'T PROOF".

**Remaining:** none of note. This is now the lesson's reference scene.

#### Scene 8: Memory (9/10)
**Resolved:**
- "THE MODEL CAN'T SAVE ANYTHING ITSELF" is 26 px, on two lines.
- Drawer text is 16–18 px, with a slightly larger store.
- The retrieved memory drops clear of the store before travelling.
- The IGNORED ghost is at 75%.
- The final fade starts 1 s earlier and eases in, so the long silent tail is shorter.

**Remaining:**
- Low: the caption "Used, ignored or misapplied. Memory isn't a guarantee." is still plain 20 px, unlike the styled takeaways elsewhere.

### Deviations from Review 1 (accepted)
- **Scene 3: the documents leave the row at about 100–120, not "by about 48".** Removing them at 48 would hide them while the narrator is still saying "same documents". The width is only needed once the results arrive, so the change is correct.
- **Scene 3: CHECK explains the price's source rather than showing a different price.** This was your decision, and it keeps the example data unchanged.
- **Scene 7: the caption is now uppercase with no full stop** ("A REAL CITATION ISN'T PROOF"), to match the takeaway style.

### Remaining actions (priority order)

| # | Change | Scene | Severity |
|---|---|---|---|
| 1 | Make the CHECK callout text 18 px | 3 | Low |
| 2 | Style the remaining plain captions as takeaways | 3, 8 | Low |
| 3 | Brighten matched index slots more than unmatched ones | 6 | Low |
| 4 | Label the two flicker-split documents | 5 | Low |
| 5 | Fade cards to 60% while they pass through the gate | 4 | Low |
| 6 | Stop the top chunks short of the window border | 6 | Low |

**Projected score with items 1–6 done:** about 9/10. The lesson is shippable as is, since no remaining issue misleads the viewer.
