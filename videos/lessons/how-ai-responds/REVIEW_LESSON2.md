# Lesson 2 Reviews: How AI Responds

Each review is its own section, newest last. Every review is scored against `videos/practices.md`.

## Review 1: Baseline (2026-11-09)

**Reviewed against:** `videos/practices.md`
**Source:** rendered `out/how-ai-responds/how-ai-responds-1080p.mp4` (frames 0–2544), scene code, `timing.ts`, `BLUEPRINT.md`. Suspect frames were checked at full resolution.
**Constraint:** the voiceover is fixed, so every suggestion keeps to the existing beats in `timing.ts`. Frame numbers are scene-local unless marked *abs*.

### Summary

| # | Scene | Abs frames | Score | Verdict |
|---|---|---|---|---|
| 1 | Assemble the Context | 0–336 | **8/10** | Clear "not just your message" setup, with each card landing on its word. The merge into the tank is a muddle of overlapping, half-faded text. |
| 2 | The Context Window | 336–636 | **8.5/10** | The tank metaphor is excellent and carries the rest of the lesson. The label stack beside the tank is tight, and the labels are about 14 px. |
| 3 | One Token at a Time | 636–996 | **9/10** | The best scene in the lesson: realistic tokens (Can + berra), real-looking scores, and "each token becomes context". Only small-text polish remains. |
| 4 | Same Prompt, Different Answers | 996–1316 | **8/10** | The slider and three runs teach variation cleanly. The only error appears at HIGH, which implies that randomness causes wrong answers. |
| 5 | Lost in the Middle | 1316–1592 | **8/10** | Strong concept: the passport rule is buried and then MISSED. The tank breaks the screen margins, and the attention fade is too subtle. |
| 6 | Compaction | 1592–1922 | **7.5/10** | The right story, but the busiest scene. The summary card, which is its key output, is unreadable at about 8 px. |
| 7 | Stopping Generation | 1922–2202 | **8.5/10** | END against MAX OUTPUT, with finish-reason tags, is a precise and practical lesson. The cut-off wall sits at the lane edge rather than where the text stopped. |
| 8 | Context Is Temporary | 2202–2544 | **8.5/10** | Session closes, context drains, the weights callback, and a fresh tank: a strong ending loop. The key caption is dim purple and the saved-instructions slice is tiny. |

**Lesson average: 8.3/10.**
- My earlier quick rating was 8.5. This review scores against the stricter `practices.md` rubric, which is why it's lower.
- The lesson's biggest strength is **continuity**. One tank metaphor runs through all eight scenes, and the readout's "EXAMPLE CAPACITY" caveat is honest about the numbers.
- Its biggest weakness is **small text**:
  - tank labels, slider labels, transcript pills and badges sit at 12–16 px;
  - the `Bubble` labels default to 16 px;
  - Scene 6's summary card is about 8 px.

---

### Scene 1: Assemble the Context (8/10)

**VO:** "When you send a prompt, the model doesn't see just your message. The app assembles a context: instructions, conversation history, documents and tool definitions."

**What works**
- The hero title, then the message typing in, then a red ✕ on the line to the model with "NOT JUST YOUR MESSAGE", sets up the misconception and knocks it down in 3 s.
- Each card lands on its spoken word (168 / 198 / 234 / 266), into an even 2 × 2 grid with 44 px gaps.
- The gear and "THE APP", plus the **APP ACTION** badge, attribute the assembly to the app, not the model. That's an important and often-missed distinction.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The merge midpoint is a muddle** (around local 305). Four cards and the prompt bar overlap while their text is half-faded. "YOUR MESSAGE" crosses the prompt text, and the card labels stack on top of each other. | 6: clean in-betweens; 4: no overlaps |
| Medium | **"NOT JUST YOUR MESSAGE" is about 14 px** in red under the bar, and the ✕ sits on a faint dashed line. The scene's key correction is its smallest text. | 4: key labels ≥ 28 px |
| Low | Card labels are about 12 px and card body text about 18 px. | 4: legibility |
| Low | Nothing shows the cards *going to the model* in this scene. The connection is made only when the tank appears in Scene 2. | 1: show the mechanism |

**Suggested changes**
1. **Clean up the merge.**
   - Fade all card text, including labels, out *before* the cards move (finish by `merge`, 292).
   - Move the cards one at a time from bottom to top (stagger of 4 frames), so they stack into slices instead of crossing.
2. **Make "NOT JUST YOUR MESSAGE" 24–28 px.** Make the ✕ line solid at 60% opacity, so the strike reads.
3. Make card labels 18 px and body text 22 px. The 380 × 136 cards have room.
4. Optional: as the merge ends, draw a short dashed arrow from the assembled stack to the cube ("all of this goes to the model").

---

### Scene 2: The Context Window (8.5/10)

**VO:** "That context fills a fixed space called the context window, measured in tokens. The response, and any hidden reasoning, has to fit in what's left."

**What works**
- **The tank is the lesson's central idea, and it's well built.** It has an outline, a ruler, a readout with "EXAMPLE CAPACITY", and labelled slices.
- The readout pulses on "measured in tokens", and the labels appear as the counter passes each slice.
- Hatched **REASONING (HIDDEN)**, then solid **OUTPUT**, then a dashed **REMAINING** region shows exactly "has to fit in what's left".
- Draining the generated part at the end so Scene 3 starts with input only is a thoughtful hand-off.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The labels crowd at the top of the input.** "REASONING (HIDDEN)" and "YOUR MESSAGE" sit about 16 px apart (*abs* 560), because the message slice is only 2% tall. | 4: no overlaps / crowding |
| Low | Slice labels are about 14 px and the ruler figures about 11 px. | 4: legibility |
| Low | The "EXAMPLE CAPACITY" caveat is about 10 px, so it's honest but invisible. | 4; 1: accurate scale |

**Suggested changes**
1. **Give the 2% message slice a leader line.** Offset the "YOUR MESSAGE" label down about 20 px, with a short tick back to its slice, so it can't crowd the reasoning label above. Or put the input labels on the left and the generated labels on the right.
2. Make slice labels 18 px and "EXAMPLE CAPACITY" 14 px.

---

### Scene 3: One Token at a Time (9/10)

**VO:** "The model then writes its answer one token at a time. It scores the likely next tokens, picks one, adds it, and repeats. Those scores are patterns, not facts."

**What works**
- **Realistic tokenisation:** leading-space tokens and " Can" + "berra" teach the sub-word idea without saying it.
- The score panel slows on "scores", rings " Can" on "picks one", and flies the chip on "adds it". Every verb in the VO has its beat.
- The **"EACH TOKEN BECOMES CONTEXT"** arrow back into the tank is a subtle, accurate point that most explainers skip.
- "SCORES ARE PATTERNS, NOT FACTS" at 56 px, with " Sydney" pulsing red, is the right size for a takeaway.
- The `END` chip sets up Scene 7.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Low | The fast first-five-token panel (at 0.8 scale) has about 10 px text. That's fine as a montage, but viewers try to read it. | 2: reading time; 3: hierarchy |
| Low | "EACH TOKEN BECOMES CONTEXT" (about 14 px) and the "Q: What's the capital…" line (about 14 px grey) are small. | 4: legibility |
| Low | Scores visibly count while the bars stagger in (*abs* 760: Sydney 0.18 → 0.19, Melbourne 0.03 → 0.06). Changing numbers on a "score" can read as uncertainty. | 6: motion should explain |

**Suggested changes**
1. Dim the fast-step panel to 70% opacity, so the full-size panel at 103 reads as "now look closely".
2. Make "EACH TOKEN BECOMES CONTEXT" 22 px, and the question line 18 px.
3. Show final score values immediately and animate only the bar lengths.

---

### Scene 4: Same Prompt, Different Answers (8/10)

**VO:** "Ask the same question twice and you can get different answers. Apps can turn that variation up or down, but a fluent answer still isn't proof it's correct."

**What works**
- Three lanes typing the same prompt, worded differently, prove "different answers" visually.
- The slider at LOW gives three identical lines (a very clear contrast). At HIGH it gives variety and one wrong answer.
- "Sydney" types in red before the ✕, and the "FLUENT ≠ CORRECT" stamp lands on "correct".

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The error only appears at HIGH, which implies that randomness causes wrong answers and LOW is safe.** The VO says a fluent answer is never proof, and a low-variation model can be consistently wrong. The visual teaches a narrower, partly wrong lesson. | 1: honest simplification |
| Low | VARIATION, LOW, HIGH and RUN 1–3 are 12–14 px, and LOW and HIGH are grey. | 4: legibility |
| Low | The stamp slightly overlaps the bottom lane's border on the frame it slams in (*abs* 1270). | 4: no overlaps |

**Suggested changes**
1. **Decouple error from variation.** Add a small caption under the stamp at about local 285: "Low variation = consistent, not correct." Or, at LOW, make all three runs agree on a subtly wrong detail (for example, "…is Canberra, founded 1913." against a wrong date). The caption is simpler and keeps the beat.
2. Make the slider labels 18 px and the run labels 16 px. Make LOW and HIGH full-white when active.
3. Start the stamp 20 px lower, or end it with a 16 px gap from the lane.

---

### Scene 5: Lost in the Middle (8/10)

**VO:** "A bigger window doesn't guarantee better use. Details buried in the middle of a long context can be overlooked."

**What works**
- The tank stretching under a "BIGGER WINDOW" double arrow ties directly to the VO.
- A specific, consequential detail (the passport validity rule), followed by a plausible wrong answer and **MISSED**, makes the risk concrete.
- The caveat caption "Not a fixed zone. It varies by model, task and position." is accurate and responsible.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The tall tank breaks the screen margins.** At 980 px it runs from about y 50 to 1030, into the title band and within about 50 px of both edges (*abs* 1370–1560). | 5: safe margin |
| Medium | **The attention fade is too subtle.** Middle rows dim to 30%, but against 16 dense teal rows the difference between edge and middle is hard to see. The beams fan evenly to every row, which visually says "attends to everything". | 3: the important thing is most visible |
| Low | "PASSPORT RULE" in the row is about 11 px, and the callout text about 16 px. | 4: legibility |
| Low | The caption is plain 28 px white with no container. It reads like a subtitle rather than a takeaway. | 3: hierarchy |

**Suggested changes**
1. **Cap the tall tank at about 900 px** (y 110–1010), and start the BIGGER WINDOW arrow at the same top.
2. **Make attention visible.**
   - Give the beams varying opacity and width: bright and thick to the top and bottom rows, faint and thin towards the middle, and none to rows 6–11.
   - Dim the middle rows to 15%, not 30%.
3. Make the row label 16 px and the callout text 20 px.
4. Style the caption like the other takeaways (uppercase, letter-spaced, 24 px), or put it in a dim pill.

---

### Scene 6: Compaction (7.5/10)

**VO:** "When a long conversation nears the limit, the app may compact it into a summary. That frees space, but decisions, caveats and sources can be lost."

**What works**
- Turns sliding in as history, then the readout turning red at **NEAR LIMIT**, sets up the pressure.
- The two-tank layout makes the comparison explicit: old context through a funnel to new context, with instructions and recent turns copied across unchanged. That's accurate.
- **SPACE FREED**, then three specific losses ("Why we ruled out Melbourne", "Dates still tentative", "Link to visa rules") struck through in red, each on its spoken word ("decisions", "caveats", "sources").

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **The SUMMARY card is unreadable.** It pops from the funnel at about 140 × 50 px with about 8 px text (*abs* 1720). Its content ("Trip: Canberra, 5 days, March…") is the whole point, because it shows what survives. | 4: legibility; 1: show the mechanism |
| Medium | **The summary collides with its surroundings.** As it shrinks into its slice (*abs* 1750), it overlaps a grey history block mid-transit and sits on the SPACE FREED outline. | 4: no overlaps; 6: clean in-betweens |
| Medium | **It's the busiest scene in the lesson:** two tanks, a funnel, the gear, a badge, two readouts, a cube, a summary card and falling losses, all within about 3 s. | 8: ≤ 3 new elements at once |
| Low | The transcript pills are about 14 px, and they slide into the tank's left edge while still readable, so they clip. | 4 |
| Low | During the glide home (*abs* 1890) tank B passes over the fading funnel. | 6 |

**Suggested changes**
1. **Make the summary a readable moment.**
   - Pop the card at about 420 × 140 with 22 px text, centred between the tanks (frame 128).
   - Hold it for about 18 frames, then shrink it into the slice (keep 150–166).
   - Dim tank A to 30% *before* the card pops, so the card is the only bright thing.
2. **Clear the path.**
   - Hide the grey in-transit block once the card appears.
   - Only draw the SPACE FREED outline after the summary slice lands (it's on "That frees space" at 150, so start it at 166 instead; still within the phrase).
3. **Reduce load.** Drop the gear and "THE APP" here, since the APP ACTION badge already says it, or fade the gear by frame 120.
4. Make the transcript pills 18 px, and fade each one just before it reaches the tank's edge.
5. Fade the funnel out completely before tank B starts its glide (finish by 290).

---

### Scene 7: Stopping Generation (8.5/10)

**VO:** "Generation stops at a natural end, or when it hits a limit, sometimes mid-sentence. The finish reason tells you which."

**What works**
- Two lanes are a clean comparison: natural `END` against a hard **MAX OUTPUT** wall.
- Lane B uses **structured output** (JSON) cut mid-string, with a dashed `"}` ghost. This shows *why* truncation matters in practice: the output is no longer valid.
- `FINISH REASON: STOP` ✓ against `FINISH REASON: LENGTH` ✕, plus "Check the finish reason, not just the text.", is directly actionable.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The MAX OUTPUT wall drops at the lane's right edge, not where the text stopped** (*abs* 2035–2070: the text ends around x 1750, but the wall is at about 1840). It suggests the limit is a width, not a token count. | 1: honest simplification |
| Low | MAX OUTPUT, INCOMPLETE and the finish-reason tags are about 12–14 px. | 4: legibility |
| Low | The finish-reason names `stop` and `length` are one vendor's terms. Others use `end_turn` and `max_tokens`. | 1: accurate |

**Suggested changes**
1. **Drop the wall right after the last character**, and have the lane's remaining width hatch or dim behind it. The limit then reads as "ran out of tokens", not "ran out of room".
2. Make the tags 18 px, and the MAX OUTPUT and INCOMPLETE labels 16 px.
3. Optional: a faint "(names vary by API)" under the caption, at 16 px.

---

### Scene 8: Context Is Temporary (8.5/10)

**VO:** "And when the session ends, the context is gone. Nothing was added to the weights. Each new request starts with only what the app puts in."

**What works**
- The **SESSION** window closes, the tank drains with falling particles, and the readout counts to 0. "The context is gone" is literal.
- The push-in on the cube with frozen weights, "WEIGHTS UNCHANGED" and "v1.0 · LOCKED" is a deliberate callback to Lesson 1, Scene 9. It's excellent cross-lesson continuity.
- The new empty tank, with only a SAVED INSTRUCTIONS slice from the app, answers "so how does it remember my settings?" before anyone asks.
- The finale types the opening question again, looping back to Scene 1.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **"ONLY WHAT THE APP ADDS" is dim purple at 20 px** on charcoal (*abs* 2442). It's the final teaching line before the finale and the lowest-contrast text in the scene. | 4: contrast; 3: hierarchy |
| Low | The SAVED INSTRUCTIONS slice is 5% of a tall tank, a thin strip at the bottom with an about 14 px label. The "drop in and bounce" is easy to miss. | 3: important = most visible |
| Low | The SESSION window frame's label and close button are about 12 px. The close-button flash on "ends" is the cue, but it's tiny. | 4 |
| Low | During the new-request beat, the cube sits far left and the tank right of centre, leaving a wide empty gap between them. | 5: balance |

**Suggested changes**
1. **Make "ONLY WHAT THE APP ADDS" full-white (or light purple at 100%), 24–28 px.**
2. Increase the saved-instructions slice to about 8%, make its label 18 px, and give the drop a brief purple glow as it lands.
3. Make the SESSION label 16 px and the close button about 1.5× larger.
4. In this beat, move the cube about 120 px closer to the tank, or centre the pair. Re-run `npm run center:responds`.

---

### Cross-lesson findings

1. **Text-size floor.** The same issue as Lesson 1. Most tank labels, badges, Bubble labels and Caption calls are 11–16 px. Apply the Lesson 1 approach: set sizes per call to 18–24 px, with 28 px for takeaways, and pass `labelSize` to `Bubble`. Then re-run `npm run center:responds`.
2. **Keep the tank as the backbone.** Every change above preserves it. It's the lesson's best design decision.
3. **Transitions are the weak spots.** Scene 1's merge and Scene 6's summary hand-off are the two places where the frame turns to clutter. Both are fixed by the same rule: fade the text before moving the shapes.
4. **Three accuracy nudges**, each cheap:
   - Error isn't caused by variation (Scene 4).
   - The output limit is in tokens, not width (Scene 7).
   - Attention isn't even (Scene 5).
5. **Strong cross-lesson continuity.** The Lesson 1 cube, lock, emblem, weights callback and badge system all carry over cleanly. Keep that in Lesson 3.

### Priority order

| # | Change | Scene | Why first |
|---|---|---|---|
| 1 | Readable summary card, held centre-stage | 6 | The scene's key output is currently unreadable |
| 2 | Caption: "Low variation = consistent, not correct" | 4 | Fixes an implied misconception |
| 3 | Clean the merge (fade text before moving) | 1 | Worst transition in the lesson |
| 4 | Make attention visible (varied beams, darker middle) | 5 | The concept is currently too subtle to see |
| 5 | MAX OUTPUT wall at the text's end | 7 | Accuracy, small change |
| 6 | Bright, larger "ONLY WHAT THE APP ADDS" | 8 | Final teaching line is low-contrast |
| 7 | Text-size floor across the lesson | All | Lesson-wide legibility |
| 8 | Fit the tall tank within the margins | 5 | Layout rule breach |
| 9 | Clear the Scene 6 path (in-transit block, SPACE FREED timing, gear) | 6 | Reduces the heaviest load |
| 10 | Leader line for the "YOUR MESSAGE" label | 2 | Label crowding |
| 11 | Everything else | — | — |

**Projected lesson score with priorities 1–10 done:** about 9/10.

---

## Review 2: After implementing Review 1 (2026-11-09)

**Reviewed against:** `videos/practices.md`
**Source:** the re-rendered `out/how-ai-responds/how-ai-responds-1080p.mp4`, checked frame by frame at the same sample frames as Review 1, plus the midpoint of every changed transition. Suspect frames were checked at full resolution.
**Scope of changes:**
- Every Review 1 suggestion is implemented, except for the optional Scene 1 arrow and a few deliberate variations (see "Deviations from Review 1").
- No scene lengths changed. The beats synced to the voiceover are unchanged. The only voiceover-adjacent move is the one Review 1 asked for: SPACE FREED now starts at 166, not 150, still within "That frees space".
- The centring track was re-measured (`npm run center:responds`, same flags), and the type-check is clean.
- One shared-code change: `ContextTank` gains an optional `textSizes` prop and an optional per-segment `labelNudge`. Both default to the old behaviour, so lesson 3 renders the same. `Bubble`'s existing `labelSize` and `Caption` sizes are set per call in this lesson.

### Summary

| # | Scene | Review 1 | Review 2 | Change |
|---|---|---|---|---|
| 1 | Assemble the Context | 8 | **8.5** | +0.5 |
| 2 | The Context Window | 8.5 | **9** | +0.5 |
| 3 | One Token at a Time | 9 | **9** | 0 |
| 4 | Same Prompt, Different Answers | 8 | **9** | +1 |
| 5 | Lost in the Middle | 8 | **9** | +1 |
| 6 | Compaction | 7.5 | **8.5** | +1 |
| 7 | Stopping Generation | 8.5 | **9** | +0.5 |
| 8 | Context Is Temporary | 8.5 | **9** | +0.5 |

**Lesson average: 8.8/10** (was 8.3, projected about 9).

Every Medium and High issue from Review 1 is resolved:
- The Scene 6 summary card is readable.
- Scene 4 no longer implies that variation causes errors.
- Scene 5's tank is inside the margins, and attention is visibly uneven.
- The Scene 7 wall marks where the tokens ran out.
- Scene 8's last teaching line is white and larger.

What remains is mostly brief shape overlaps during two transitions, short reading windows that the fixed voiceover imposes, and a lesson-wide text floor that sits at 18–22 px rather than the 24 px in `practices.md`.

### Scene by scene

#### Scene 1: Assemble the Context (8.5/10)
**Resolved:**
- All card text, the prompt text and the "YOUR MESSAGE" label fade out over 280–292, before anything moves. No text overlaps at any point in the merge (*abs* 300, 305, 318).
- The gear fades before the merge, so no slice passes over it.
- Slices move one at a time, 4 frames apart, from the bottom slice up. A moving card rides above the cards still waiting, and the prompt bar stays underneath and rises last.
- "NOT JUST YOUR MESSAGE" is 28 px. The strike line is solid at 60% (*abs* 100).
- Card labels are 18 px.

**Remaining:**
- Low: the empty shapes still cross. At *abs* 300 the instructions slice passes over the history card, and at *abs* 318 the message bar slides up behind the documents slice. With no text, this reads as "stacking", not clutter, but it isn't a clean in-between.
- Low: the optional arrow from the stack to the cube was not added (see Deviations).

#### Scene 2: The Context Window (9/10)
**Resolved:**
- "YOUR MESSAGE" sits 24 px below its 2% slice on a leader tick. At *abs* 560 the labels are evenly spaced: REASONING (HIDDEN), YOUR MESSAGE and DOCUMENTS are each about 25–30 px apart, with no crowding.
- Slice labels are 20 px. The ruler figures and the "72% · EXAMPLE CAPACITY" line are 18 px.

**Remaining:**
- Low: the "EXAMPLE CAPACITY" line is still 55% white. It's legible at 18 px, but it's the dimmest text in the scene.

#### Scene 3: One Token at a Time (9/10)
**Resolved:**
- The fast-step panel is at 70% opacity until the focus step, so the full-size panel at 103 reads as "now look closely".
- Scores show their final values immediately, and only the bars grow (*abs* 760: Sydney 0.19 and Melbourne 0.06 from the first frame).
- "EACH TOKEN BECOMES CONTEXT" is 22 px, and the question line is 24 px at 70% white.

**Remaining:**
- Low (pre-existing): the " Can" chip's flight arc passes over the panel's bottom row (" the") as it leaves the cube (*abs* 830). This lasts about 4 frames.

#### Scene 4: Same Prompt, Different Answers (9/10)
**Resolved:**
- "Low variation = consistent, not correct." (28 px, white) sits under the stamp from local 278 (*abs* 1274). Error is no longer implied to come from variation.
- The stamp lands at y 880 and scales in from 1.45, so even its first frame clears run 3 (*abs* 1270).
- LOW and HIGH are 22 px and fully white when active (50% when not). RUN 1–3 labels are 20 px.

**Remaining:**
- Low: the caption is fully readable for only about 1 s before the scene fades (310–320). This is enough for six words, but tight, and the fixed scene length allows no more.

#### Scene 5: Lost in the Middle (9/10)
**Resolved:**
- The tall tank is 900 px (y 110–1010) and clears the title band and both side margins (*abs* 1370). The BIGGER WINDOW arrow tracks its top.
- Attention is visible. Beams are thick and bright to the ends, thin towards the middle, and absent to rows 6–11. Middle rows dim to about 15%, so the buried passport row visibly fades with them (*abs* 1450, 1530).
- The row label is 18 px. Callout and bubble labels are 18 px, and callout text is 22 px.
- The caveat is a dim pill (26 px), so it reads as a takeaway, not a subtitle (*abs* 1560).

**Remaining:**
- Low: the caveat pill sits about 25 px below the RESPONSE bubble and about 62 px from the bottom edge. It's within the margin, but it's the tightest corner of the scene.

#### Scene 6: Compaction (8.5/10)
**Resolved:**
- The SUMMARY card pops at 440 px wide with 22 px text and an 18 px label, centred midway between the tanks. It is fully readable at *abs* 1740.
- Tank A and its readout dim to 30% over 114–128, before the card pops.
- The gear leaves by 120, while the badge stays.
- No block crosses the frame while the card is up. The recent turns fade into place in tank B instead.
- The card cross-fades into its slice and is mostly gone before it reaches tank B's outline (*abs* 1750).
- SPACE FREED starts at 166, after the summary has landed.
- The funnel is gone by 290, so tank B's glide home is clean (*abs* 1890).
- Transcript pills form a left-aligned column, and each has fully faded by the time its right edge reaches the tank. None is clipped.

**Remaining:**
- Low: the card is readable for about 0.6 s at full size (about 134–150), which is short for 11 words. Its timing is bounded by "compact it into a summary" and "That frees space", and the 150–166 landing was kept as Review 1 asked.
- Low: at *abs* 1750 the fading card (about 40% opacity) still overlaps tank B's left edge for a few frames.
- Low (pre-existing): during the squeeze (*abs* 1700) the grey history block crosses tank A's right edge, and the copied instruction and tool slices pass below the funnel.
- Low: transcript pills are 20 px. The pill column can't grow without crowding the cube or the tank.

#### Scene 7: Stopping Generation (9/10)
**Resolved:**
- The MAX OUTPUT wall drops right after lane B's last character. The lane's unused width beyond it is hatched red, and the `"}` ghost sits past the wall (*abs* 2070, 2160). The limit now reads as tokens, not width.
- A footnote (22 px, 60% white) reads "Names vary by API, e.g. stop / end_turn, length / max_tokens."

**Remaining:**
- Low (pre-existing): while the wall is still dropping (*abs* 2035), the MAX OUTPUT label passes lane A's bottom border for about 3 frames.
- Low: the wall's x is a measured constant (text end at 1564). If lane B's text or font size changes, the constant has to be re-measured.

#### Scene 8: Context Is Temporary (9/10)
**Resolved:**
- "ONLY WHAT THE APP ADDS" is white at 26 px (*abs* 2442; it fades in over 234–246).
- The saved-instructions slice is 8%, with a 20 px label (readout 16,000). A purple glow marks its first touchdown (*abs* 2435).
- The SESSION label is 20 px, and the close button is 1.5× larger.
- The cube rests 120 px closer to the new tank after the push-out, and the pair is re-centred.
- Two issues found in this review's frames are fixed:
  - The gear and "THE APP" had sat where the saved-instructions label drops past (*abs* 2420). The gear now sits between the cube and the tank.
  - The readout had faded in over the folding session frame (*abs* 2250). It now waits until the fold has finished.

**Remaining:**
- Low: the caption is fully visible for only about 0.2 s before the finale fade starts at 250. The VO line "only what the app puts in" carries it, but on screen it's brief.
- Low: the cube–tank gap is smaller but still about 500 px.

### Deviations from Review 1 (accepted)
- **Tank text sizes come from a new optional `textSizes` prop on `ContextTank`**, passed from `TANK_TEXT` in `layout.ts`, not from changed defaults. Lesson 3 omits the prop and renders as before. `labelNudge` (for the Scene 2 leader) is likewise optional.
- **Sizes that Review 1 estimated low were already larger in the code.** For example, the "NOT JUST YOUR MESSAGE" caption was 22 px and card body text was 24 px. Where the code already met or beat a target, it was kept or raised, never lowered. That's why card body text stays at 24 px (not 22) and transcript pills stay at 20 px (not 18).
- **Scene 1: no arrow from the stack to the cube.** Only 10 frames remain after the merge, too few for a new element to read, and Scene 3's feed line already shows the context going to the model.
- **Scene 4: both stamp fixes are used.** The stamp is 10 px lower (not 20) and scales in from 1.45 (not 1.6), which keeps a gap from the lane above and room for the caption below. The caption appears at 278 (not about 285), and the content fade moves from 305 to 310, to give it about 1 s of reading time.
- **Scene 5: the caveat is a pill (mixed case, 26 px)**, not uppercase 24 px. In uppercase the 56-character line would have been about 1,100 px wide and would have broken the left margin.
- **Scene 6:**
  - The gear fades out by 120 rather than being dropped, so "the app" still gets its visual on the spoken word.
  - The recent turns fade into tank B rather than travelling, which is the most direct way to "hide the in-transit block".
- **Scene 7: the footnote is 22 px** (Review 1 suggested 16 px), to stay closer to the legibility floor.

### Remaining actions (priority order)

| # | Change | Scene | Severity |
|---|---|---|---|
| 1 | Raise the lesson's 18–22 px labels (tank labels, ruler, readout line, RUN labels, pills) to the 24 px floor where space allows | All | Low (lesson-wide) |
| 2 | Route the moving slices around the waiting cards (for example, drop vertically after aligning to the tank column) | 1 | Low |
| 3 | Finish the card fade before it reaches tank B's outline (about 2 frames earlier) | 6 | Low |
| 4 | Keep the squeeze block inside the funnel's mouth, and hide the copied slices under the funnel | 6 | Low |
| 5 | Hold the MAX OUTPUT label until the wall settles | 7 | Low |
| 6 | Delay the " Can" chip's flight until it clears the panel | 3 | Low |
| 7 | Brighten the "EXAMPLE CAPACITY" line to 70% white | 2 | Low |

**Projected score with items 1–7 done:** about 9.1/10. The lesson is shippable as is, since no remaining issue misleads the viewer. The two tight reading windows (Scene 6 card, Scene 8 caption) are fixed by the voiceover and are better addressed by a re-record than by layout.

## Review 3: Re-review against the 9.5 target (2026-11-10)

**Reviewed against:** the updated `videos/practices.md` (9.5 target, fixed voiceover, text judged by role).
**Source:** the committed render at frames 0–2574, sampled every 10 frames. Every transition was scrubbed every 2–3 frames, and suspect frames were checked at full resolution. Fixes were then re-rendered and re-checked.
**Limits:**
- Sync was checked against the word timings in `timing.ts` and `BLUEPRINT.md`. The audio itself was not listened to.
- No scene lengths or voiceover beats changed.

### Findings and fixes

| # | Scene | *Abs* frames | Severity | Finding | Fix |
|---|---|---|---|---|---|
| 1 | 8 | 2466–2480 | Medium | "ONLY WHAT THE APP ADDS" was fully visible for about 2 frames. It faded in at 234 and out from 248, so the key takeaway had no reading window. | It appears on "only what the app puts in" (local 204) and holds until the scene fades (local 268), about 1.3 s at full opacity. Under the fixed-voiceover rule, this replaces Review 2's suggestion to re-record. |
| 2 | 6 | 1804–1880 | Medium | The three struck-through details floated with no label, so "decisions, caveats and sources" had no visual beat. | Each detail gets a red tag (DECISION, CAVEAT, SOURCE) on the word that names it. |
| 3 | 1 | 300–315 | Low | Empty card shells crossed each other and the prompt bar on their way into the window. | Each card first shrinks in place to its slice's size, then the slim slice travels. |
| 4 | 6 | 1788–1792 | Low | The summary card crossed tank B's outline at about 50% opacity. | It shrinks to the slice's width early in its flight and has faded by 40% of the flight. |
| 5 | 7 | 2190–2230 | Low → superseded | The caveat was a plain sentence-case subtitle, unlike Scene 5's caveat pill. | First restyled as the pill. Then, at the owner's request (too much text at the end), the caveat, the API-names footnote and the INCOMPLETE label were all removed. The scene now ends on the two finish-reason tags, which carry "The finish reason tells you which". |
| 6 | 7 | 2062–2066 | Medium | The MAX OUTPUT wall and its label dropped 260 px from above, through lane A's text. | The wall now drops 60 px and fades in, so it never enters lane A. |
| 7 | 3 | 830–837 | Low | Each token chip arced across the panel's lower rows (" Can" crossed "the"). | Chips drop to a lane between the panel and the response line, travel along it, then drop into their slots. Verified clear of the panel rows and of the tokens already in the line. |

### Scores

| # | Scene | Review 2 | Review 3 | Remaining note |
|---|---|---|---|---|
| 1 | Assemble the Context | 8.5 | **9.5** | For about 6 frames, the slim slices still pass over the prompt bar. No text is involved. |
| 2 | The Context Window | 9 | **9.5** | None. The tank labels are secondary at 22 px and readable. |
| 3 | One Token at a Time | 9 | **9.5** | Its takeaway is a bold headline above the panel. Other takeaways are spaced capitals under the content, but this one sits where the eye already is. |
| 4 | Same Prompt, Different Answers | 9 | **9.5** | None. |
| 5 | Lost in the Middle | 9 | **9.5** | None. |
| 6 | Compaction | 8.5 | **9.5** | Still the busiest scene, but each beat now has its word. |
| 7 | Stopping Generation | 9 | **9.5** | None. |
| 8 | Context Is Temporary | 9 | **9.5** | None. |

**Lesson average: 9.5/10** (was 8.8).
