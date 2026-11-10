# Lesson 1 Reviews: How AI Models Are Trained

Each review is its own section, newest last. Every review is scored against `videos/practices.md`.

## Review 1: Baseline (2026-11-09)


**Reviewed against:** `videos/practices.md`
**Source:** rendered `out/how-ai-trains/how-ai-trains-1080p.mp4` (frames 0–3093), scene code, `timing.ts`, `BLUEPRINT.md`
**Constraint:** the voiceover is fixed, so every suggestion keeps to the existing beats in `timing.ts`. Frame numbers are scene-local unless marked *abs*.

### Summary

| # | Scene | Abs frames | Score | Verdict |
|---|---|---|---|---|
| 1 | Raw Data | 0–230 | **6/10** | Strong mood, weak teaching. "Start completely blank" isn't shown, and nothing sits at the centre after the title leaves. |
| 2 | Tokenize & Map | 230–515 | **7.5/10** | Clear slicing beat and a clever kitten/car contrast. It teaches "token = word", the morph midpoint is cluttered, and labels are small. |
| 3 | Adjusting Weights | 515–825 | **8/10** | A complete guess → error → adjust → retry loop. The correct answer is never shown, and all three outputs light up on the first guess. |
| 4 | Base Model → Fine-Tune | 825–1245 | **8/10** | Same prompt, before and after, is an excellent contrast. The example cards are too small and fast to read, and the cube moves five times. |
| 5 | Learn from Feedback | 1245–1485 | **7.5/10** | The "pick the better answer" beat is clear. One person appears to make 1,000,000 comparisons, the reward model is never introduced, and the counter reads "1 comparisons". |
| 6 | Reinforcement Learning | 1485–1875 | **8/10** | The loop is drawn explicitly and the success-rate chart is a great payoff. In fast cycles the checker shows the *previous* verdict (✓ next to a wrong attempt), and attempt chips cover the ATTEMPT label. |
| 7 | Safety Testing | 1875–2115 | **7/10** | The harmful-vs-everyday contrast works. The shield reads as an external filter rather than trained behaviour, and the model never actually refuses. |
| 8 | Evaluation | 2115–2413 | **7.5/10** | Fail → back to training → pass is clear. Four bars against "thousands of benchmarks", and the approval stamp lands during the fade-out. |
| 9 | Locked In | 2413–2693 | **8.5/10** | The strongest metaphor: spin slows, freezes, locks and a chat bounces off. The frozen numbers end lopsided (5 left, 1 right) and the key caption is 20 px. |
| 10 | Released to the World | 2693–3093 | **7.5/10** | Rich and well paced, with a strong finale. Too many small labels at once, and "feed into the next model" is a tiny ghost cube. |

**Lesson average: 7.6/10.**
- The core training story (Scenes 3, 4, 6 and 9) is strong.
- The weakest points are the opening (Scene 1) and the two scenes whose metaphors slightly mislead (Scene 7's shield, and Scene 2's word-level tokens).
- Two problems run through the whole lesson:
  - **Labels below 24 px.** Almost every caption, column header and chip label is 16–22 px.
  - **Missing "why" beats.** Several scenes show *that* something is wrong but not *what right looks like* (Scenes 3 and 7).

---

### Scene 1: Raw Data (6/10)

**VO:** "AI models don't just 'know' things. They start completely blank, needing massive piles of data to learn."

**What works**
- The hero title over a scrim is a confident, readable open.
- The log-scale counter lands on 1.00 TB exactly on "learn" (frame 200), with no jitter thanks to tabular figures.
- The mixed icons (documents, images, audio, code) signal "all kinds of data" without words.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **"Start completely blank" has no visual.** No model appears until Scene 4, so the scene only says "lots of data". | 1: every claim gets a beat |
| High | **No focal point after frame 70.** The centre is empty, and the only content is a counter at the bottom edge. | 3: one focal point; 5: use the frame |
| Medium | **Icons pass behind the corner title and counter panel** (for example, frame 120 top-left), competing with the dimmed title. | 3: background motion never behind text |
| Medium | **1 TB undersells "massive".** Modern pre-training corpora are tens of terabytes of text (trillions of tokens). | 1: accurate scale |
| Low | Icons fall past the counter rather than into anything, so data never visibly goes anywhere. | 6: motion should explain |
| Low | "DATA INGESTED" is 22 px at 70% opacity. | 4: legibility |

**Suggested changes**
1. **Add an empty model at centre stage (frames 40–200).** Fade in a hollow, ghosted version of Scene 3's network at centre, labelled "BLANK MODEL" on "start completely blank" (about frame 75).
2. **Make the data flow into it.** Bend icon paths towards the centre after frame 90 so they are absorbed, with a faint pulse per hit.
3. **Raise the end value** to around "45 TB" or "15 TRILLION TOKENS". Keep the log tick-up and the landing on frame 200.
4. **Keep icons off text.** Mask icons out of the title band and from under the counter panel, or drop their opacity outside a central lane.
5. Increase "DATA INGESTED" to 24 px.

**After changes:** about 8–8.5.

---

### Scene 2: Tokenize & Map (7.5/10)

**VO:** "First, that data is broken into pieces called tokens, then mapped into a multi-dimensional math grid where similar meanings sit close together."

**What works**
- Cut beams (frames 45 and 58) land on "broken into pieces", and blocks with IDs land on "tokens".
- "kitten" arrives beside "cat" on "similar meanings" (frame 201) and "car" flies away. This teaches closeness by meaning, not spelling.
- The slow camera yaw sells the 3D space without stealing focus.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **Tokens shown as whole words** reinforce the "token = word" misconception. Real tokenisers split many words into sub-word pieces. | 1: honest simplification |
| Medium | **Cluttered morph midpoint (around frame 130):** "The" crosses the d₂ axis, "cat" is wider than its shrinking box, "sat" is still a full block, and three `#ID`s float over the grid. | 6: clean in-betweens; 4: no overlaps |
| Medium | **"car" is never explained.** Its dashed tether may read as "related". | 8: label first |
| Medium | Token IDs and "similar" are 22 px; axis labels are about 21 px effective. | 4: 24 px floor |
| Low | The grid fills about 35% of the frame width. | 5: use the frame |
| Low | "Multi-dimensional" is drawn as 3D with no hint of the thousands of real dimensions. | 1: honest simplification |

**Suggested changes**
1. **Show one sub-word split**, for example "The cat sprawled" → `sprawl` + `ed`, with an extra cut sharing frame 58. Scene 3's input chip would need to match.
2. **Clean up the morph.**
   - Finish fading the `#ID`s by `TOKEN.morph`.
   - Shrink each word at the same rate as its box.
   - Cut the stagger from 6 frames to 3.
3. **Label the contrast** at frame 255: "close = similar" on the purple link and "far = different" on the tether.
4. **Increase label sizes:** IDs and "similar" to 24–26 px, and axis labels to 28 px at full opacity.
5. **Scale the grid up by about 1.3×** (camera `scale` 250 → 320), then re-run `npm run center:trains`.
6. Optional: a faint "× thousands of dimensions" note on "multi-dimensional" (about frame 135).

**After changes:** about 8.5–9.

---

### Scene 3: Adjusting Weights (8/10)

**VO:** "Next, it practises predicting the next word. It guesses, gets it wrong, and adjusts its internal settings, called weights, billions of times."

**What works**
- The guess → wrong → backprop → retry → correct loop is complete, and each beat is synced to the VO.
- The colour semantics are consistent: cyan forward, purple backward, red wrong, cyan correct.
- The column headers label the diagram before it animates.
- The ending hands off cleanly: the bare network stays, ready for Scene 4 to implode it.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **The right answer is never shown.** "GUESS: car ✕" appears, but nothing shows the target or that it comes from the text itself, which is the key insight of pre-training. | 1: show the mechanism |
| High | **All three outputs light up on the first guess** (frame 125). The arrival flash fills "on" and "down" cyan beside the red "car". | 3: consistent colour meaning |
| Medium | **The counter mixes metaphors.** "WEIGHT UPDATES" races to 2.4 billion within one correction, whereas "billions of times" means the loop repeats. | 1: accurate meaning |
| Medium | **Weight changes are subtle** (stroke `1 + 5w`), except on edges into "on". | 3: the important thing is most visible |
| Medium | **No continuity from Scene 2:** the token points vanish and a fresh "The cat sat" chip appears. | 7: carry meaning across cuts |
| Low | The purple whole-network error flash uses the backprop colour. | 3: colour carries meaning |
| Low | Column headers are 20 px at 50% opacity, and the counter sits in the badge corner. | 4; 5: chrome consistency |

**Suggested changes**
1. **Show the target.** Use "The cat sat **on**…" with "on" ghosted. At the wrong guess, highlight "ANSWER: on" so the error reads as *guess ≠ answer*.
2. **Light up only the guess.** Skip the pass-1 arrival flash on the other outputs. Better still, show probability bars (car 48%, on 31%, down 21%) that flip after training (on 82%).
3. **Make the counter mean repetition.** Rename it "TRAINING STEPS", or start it after frame 273 with a ghosted fast replay of the loop.
4. **Make the adjustment visible.** Tint strengthening edges cyan and weakening edges grey during `adjustFor`, and widen the stroke range to `1 + 7w`.
5. **Bridge from Scene 2:** have three token points fly into the input chip in the first 28 frames.
6. **Fix colours and sizes:**
   - Make the error flash red-tinted.
   - Increase headers to 24 px at 70% opacity.
   - Move the counter beside the output column.

**After changes:** about 9.

---

### Scene 4: Base Model → Fine-Tune on Examples (8/10)

**VO:** "Pre-training creates a base model: it can continue text, but it can't hold a conversation. So it's fine-tuned on thousands of example conversations written by people."

**What works**
- **The same prompt, before and after**, is textbook contrast design. The rambling base model is shown with a red ✕, and "The capital of France is Paris." with a cyan ✓.
- The network implodes into the cube, a clean visual handover from "network" to "the model". The white burst marks the change of representation.
- The "AI" emblem pops on exactly when the model becomes conversational, and the lesson keeps it from then on.
- People, cards and a counter make "written by people" concrete, supported by the "HUMANS IN THE LOOP" badge.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The example cards can't be read.** The text is 20 px, each card is on screen for about 0.6 s before fading, and the cards shrink as they move. They read as purple rectangles, but the *content* of a Q&A pair is the point. | 4: legibility; 2: reading time |
| Medium | **The cube moves five times** (960 → 1215 → 700 → 1215 → 700 → 960). Each move is smooth, but together they make a restless camera in a scene whose point is that the *model* changed, not its position. | 6: consistent, meaningful motion |
| Low | The counter climbs to **25,000** while the VO says "thousands", a small mismatch between voice and screen. | 2: text agrees with narration |
| Low | The "BASE MODEL OUTPUT" / "FINE-TUNED OUTPUT" labels are about 14 px. They carry the comparison, yet they're the smallest text on screen. | 4: key labels ≥ 28 px |
| Low | "PEOPLE WRITE EXAMPLES" and "EXAMPLE CONVERSATIONS" sit at different heights (770 vs 790). | 5: consistent spacing |

**Suggested changes**
1. **Hold one card.** Let the first card ("Q: Capital of France? A: Paris.") pause at full size at about x 960 for about 15 frames before flying in. Then let the rest stream past faster as a montage. This uses the existing `examples[0]` beat (222). Increase card text to 24 px.
2. **Cut the cube moves to two.** Park the cube right of centre (about 1215) for the whole scene. Have both prompts arrive from the left and both outputs appear *below* the cube instead of to its right. Return to home only at the end. Re-run centring afterwards.
3. Have the counter stop at about **10,000**, or label it "THOUSANDS OF EXAMPLES", to match the VO.
4. Increase the output-bubble labels to 22–24 px, and put the two captions on one baseline.

**After changes:** about 9.

---

### Scene 5: Learn from Feedback / RLHF (7.5/10)

**VO:** "Then people compare its answers and pick the better one, and it learns their preferences." (5.5 s in an 8 s scene)

**What works**
- The prompt is at the top, the two candidate answers flank the model, and the person sits below. It's a clean, symmetric, centred composition.
- The answers are well chosen: "spacetime curvature" against "an invisible pull" makes the human preference obvious without explanation.
- The selection line with ✓, and the losing answer dimming, read instantly.
- The reward signal returning to the cube closes the loop.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **One person streams 1,000,000 comparisons.** The VO says "people", but the dots come from a single figure, implying one person did it all. | 1: accurate meaning |
| Medium | **The "reward model" is never introduced.** It's a new concept that isn't in the VO, appears in a small panel with a 14 px label, and does the key work. Viewers will see a box, not an idea. | 8: label first; 1: one idea per scene |
| Medium | **"1 comparisons"**: the counter starts at 1 with a plural noun (`FeedbackScene.tsx:94`). | Production polish |
| Low | Answer text is about 18 px and the answer labels about 12 px. Both answers must be read to understand the choice. | 4: legibility |
| Low | The visuals keep going for 2.5 s after the VO ends. The reward-signal beat lands in silence. | 2: sync |

**Suggested changes**
1. **Show several people.** Add two more faint figures behind the first when the stream starts (frame 128), and send the dots from all three.
2. **Either simplify or explain the reward model.**
   - Simpler: remove the panel and send the dots straight to the cube as "PREFERENCES".
   - Explain: keep the panel, but label it "REWARD MODEL: learns what people prefer" at 22 px.
   - Given the fixed VO, the simpler option matches better.
3. Fix the label to `comparison` / `comparisons` (pluralise when the count is not 1), or start the counter at 0 and hide it until the first dot arrives.
4. Increase the answer text to 22–24 px. The bubbles have room.

**After changes:** about 8.5.

---

### Scene 6: Reinforcement Learning (8/10)

**VO:** "On maths and code, it practises on problems where the answer can be checked automatically. This is reinforcement learning: correct answers are rewarded, so it does more of what works."

**What works**
- **The loop is drawn explicitly** (cube → ATTEMPT → AUTOMATIC CHECKER → REWARD → cube), with dashes flowing in the loop direction. The diagram *is* the definition.
- Cycle 1 (398 ✕ 0) then cycle 2 (408 ✓ +1) on the same problem shows learning from reward.
- The success-rate chart climbing from 30% to 90% is the payoff of "does more of what works".
- The "AUTOMATED CHECKS" badge with a gear correctly distinguishes this from the human-in-the-loop scenes.
- The problems mix maths and code, matching the VO.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **In the fast cycles the checker shows the previous verdict while the next attempt is in flight.** At *abs* 1700, "True" for `is_prime(91)` (correctly marked wrong in code) sits next to the checker's ✓ +1 left over from `√144`. Likewise at *abs* 1780, "9" for `gcd(48, 18)` sits beside a ✓. A paused or attentive viewer sees wrong answers being rewarded. | 2: sync; 1: accuracy |
| Medium | **Attempt chips cover the "ATTEMPT" label** as they ride the top arc (*abs* 1560, 1740). | 4: no overlaps |
| Medium | **The fast cycles change every 18 frames (0.6 s)**, too fast to read the problems. That's fine as a montage, but they're drawn at the same weight as the two teaching cycles, so viewers try to read them. | 2: reading time; 3: hierarchy |
| Low | The chart is wide but short, and the percentage sits far from the line's end. The "SUCCESS RATE" label is about 14 px. | 4; 5 |
| Low | The chart dips 30% → 28% after cycle 1. That's accurate, but it reads as a glitch on the first frame the chart is seen. | 6 |

**Suggested changes**
1. **Clear the checker when each attempt launches.** Show a neutral "…" state until the new verdict lands, so a verdict is never seen beside the wrong attempt.
2. Run the attempt chip **inside** the arc (offset about 30 px towards the loop centre), or move the "ATTEMPT" label above the arc's apex.
3. **Mark the montage as a montage.**
   - Render fast-cycle problem text at 70% opacity and scale.
   - Add a small "× 1,000s" tag beside the problem chip from frame 190, so the speed itself carries the meaning.
4. Make the chart about 40% taller, put the percentage at the line's end, and increase "SUCCESS RATE" to 22 px.
5. Start the chart at 28%, or start it on the cycle-2 reward, so its first visible movement is upwards.

**After changes:** about 9.

---

### Scene 7: Safety Testing (7/10)

**VO:** "Next, red teams try to break it, and it's trained to refuse harmful requests while staying helpful."

**What works**
- **The contrast is the lesson.** Three harmful prompts bounce off, and an everyday one passes through and gets a helpful answer. "Refuse … while staying helpful" is shown, not just said.
- The red team uses the error colour and the everyday user uses cyan, which is consistent with the lesson's colour semantics.
- The single "REFUSED" label (26 px) above the shield, re-shown per hit, is clean.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| High | **The shield reads as an external filter.** Refusal is learned behaviour in the model's weights, but the visual shows a separate barrier that stops prompts before the model sees them. Learners may conclude that safety is a wrapper bolted on afterwards. The VO says "*trained* to refuse", and nothing shows training. | 1: honest simplification |
| Medium | **The model never refuses.** Attacks bounce off and "REFUSED" floats above, but the model gives no reply. The everyday request gets a visible answer, but the harmful ones don't, so the contrast is unbalanced. | 1: show the mechanism |
| Medium | **Attack chips fade as they travel.** The second and third are dim before they hit (*abs* 1955 and 2025), so the threat isn't readable at the moment it matters. | 4: legibility; 2: reading time |
| Low | **The layout spans almost the full width** (red team x 170, user x 1760). Content sits near the edges and the centre is just the cube. | 5: margins |
| Low | The model's answer bubble appears at bottom right, nowhere near the user who asked. | 7: spatial continuity |

**Suggested changes**
1. **Make the shield come from the model.**
   - Draw the shield outwards *from* the cube with a purple training glow ("trained to refuse") at frames 20–40.
   - Tint it as part of the model, not a separate ring, for example by matching the cube's edge glow.
   - Label it "LEARNED SAFETY" (22 px) as it draws.
2. **Give one refusal a voice.** On the first hit (frame 65), have a small model reply bubble, "I can't help with that.", appear beside the shield for about 1 s. Keep "REFUSED" for hits 2 and 3.
3. Keep the attack chips at full opacity until impact, and fade only on rebound (the opacity is currently multiplied by `smooth(start, 6)`; check nothing else is dimming them).
4. Pull the red team and the user in by about 120 px each, and place the answer bubble under the user.

**After changes:** about 8.5.

---

### Scene 8: Evaluation (7.5/10)

**VO:** "Before release, it's tested on thousands of benchmarks. If it falls short, it goes back for more training."

**What works**
- A scorecard with a dashed PASS line is instantly legible as "a test".
- Coding stopping short at 62% with a red ✕, then "BACK TO TRAINING", then all passing on run 2, is a clean narrative arc in 10 s.
- The RUN 1 / RUN 2 label is a nice, quiet detail.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **Four bars against "thousands of benchmarks".** This is a known VO mismatch, but it can be fixed visually. | 2: text agrees with narration |
| Medium | **The approval beat lands in the fade-out.** The reviewers and the "APPROVED FOR RELEASE" stamp appear at frame 264, and the scene fades at about 286. The stamp is readable for under a second and is rotated and dim (*abs* 2405). | 2: hold the conclusion |
| Medium | **"Back to training" is only a line.** A purple path and glow, with no indication of what happens. | 1: show the mechanism |
| Low | The "HUMANS IN THE LOOP" badge is shown from frame 0, but the humans (reviewers) appear only at frame 264. | 3: chrome agrees with content |
| Low | Panel labels (REASONING, CODING…) are about 14 px, and BENCHMARKS / PASS / RUN about 12 px. | 4: legibility |

**Suggested changes**
1. **Suggest scale.** Behind the scorecard, stack 2–3 ghost scorecards offset by about 12 px. Or add a fifth row, "+ 2,000 MORE", whose bar fills as a blur on run 1.
2. **Move the approval earlier.** Start run 2 about 10 frames earlier (220 → 210) and bring the reviewers and stamp in at about 250, so the stamp holds for about 1.2 s at full opacity. Straighten the stamp to about −4° so it reads.
3. **Show the retraining.** As the path reaches the cube (frames 170–196), echo the Scene 6 loop arcs for about 15 frames in purple, a visual callback for "more training".
4. Bring the badge in with the reviewers at frame 264, or relabel it "AUTOMATED + HUMAN REVIEW".
5. Increase the row labels to 22 px.

**After changes:** about 8.5.

---

### Scene 9: Locked In (8.5/10)

**VO:** "Finally, the weights are frozen and the model is released. It doesn't keep learning from your chats; that version is locked in."

**What works**
- **The best metaphor in the lesson.**
  - The orbiting weights decelerate and freeze to ice-white as "frozen" is spoken.
  - The padlock drops on "released".
  - A chat message *bounces off*.
  - The "v1.0 · LOCKED" tag lands on "that version is locked in".
  - Every VO clause has a beat.
- The cube's spin, driven by the absolute frame, also decelerates to a stop, which ties the freeze to the model itself.
- The frost vignette adds atmosphere without clutter.
- "CHATS DON'T CHANGE THE WEIGHTS" states the single most commonly misunderstood fact in plain words.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **The frozen layout is lopsided.** After clearing the cube's footprint and the chat lane, five numbers remain on the left and one on the right (*abs* 2550–2680). The final frame reads as unbalanced. | 5: balance |
| Medium | **The key caption is small.** "CHATS DON'T CHANGE THE WEIGHTS" is 20 px, and "WEIGHTS FROZEN" is about 18 px. These are the lesson's takeaways. | 4: key labels ≥ 28 px |
| Low | The chat bubble stays on screen dimmed for the rest of the scene, so the eye keeps returning to it. | 8: remove labels once done |
| Low | The bounce ripple is a plain grey circle on charcoal, so it reads as an artefact rather than an impact. | 6 |

**Suggested changes**
1. **Rebalance the frozen numbers.** Choose the frozen orbit angle (the `PER_RING` phase offset, or the `freeze` stop angle) so that roughly equal numbers survive on each side. Or, after the chat bounces away (about frame 195), let 2–3 numbers on the right fade back in.
2. Increase "CHATS DON'T CHANGE THE WEIGHTS" to 28 px and "WEIGHTS FROZEN" to 24 px.
3. Fade the chat bubble out completely by about frame 200.
4. Make the ripple ice-cyan with a short glow, so it reads as frost cracking.

**After changes:** about 9.5.

---

### Scene 10: Released to the World (7.5/10)

**VO:** "From data centres, it reaches millions of people through apps and APIs, while teams monitor how it's used and feed what they learn into the next model."

**What works**
- The racks → channels (APPS / API / WEB) → globe flow maps the VO left to right in reading order.
- Users lighting up and the counter reaching "100,000,000+" sell scale, and the example requests ("Plan my trip to Japan") keep it human.
- The monitoring team and the feedback dots honour "teams monitor how it's used".
- **The finale is excellent.** Everything clears, "MODEL RELEASED." springs in, and "How can I help you today?" types into a prompt bar. It's the perfect bridge to Lesson 2.

**Issues**

| Severity | Issue | Practice |
|---|---|---|
| Medium | **Too much at once.** At *abs* 2950 there are 12+ labelled elements on screen: racks, 3 channels, globe, 70 users, a counter, 4 request bubbles, a team, feedback dots and the FEEDBACK & REPORTS label. | 8: ≤ 3 new elements at once |
| Medium | **"Feed what they learn into the next model" is a tiny ghost cube** (about 40 px) at the bottom left. The lesson's closing idea, that the cycle repeats, is its least visible element. | 3: important = most visible |
| Medium | **Small labels throughout:** DATA CENTRES, PEOPLE USING IT, SAFETY & MONITORING TEAMS, FEEDBACK & REPORTS and NEXT MODEL are all about 14–16 px. Channel pills are about 16 px. | 4: legibility |
| Low | The locked cube flies into the racks and disappears. The model, the protagonist for six scenes, has no presence in its own release scene. | 7: continuity |
| Low | The globe is introduced small and far right (*abs* 2760) before the channels connect, so there's a brief empty middle. | 5: balance during animation |

**Suggested changes**
1. **Stage it in two beats.**
   - Beat 1 (frames 10–150): racks → channels → globe → users. The request bubbles appear only here, then fade by frame 150.
   - Beat 2 (frames 150–300): the monitoring team, feedback dots and next model.
   - Fewer simultaneous elements, with the same VO beats.
2. **Promote "NEXT MODEL".** At frame 262, have the ghost cube appear at about 70% of the main cube's former size, beside the team. Draw a dashed arc back towards the left edge of the frame to suggest the cycle restarting. Label it at 22 px.
3. Increase all captions to 20–22 px and the channel pills to 20 px.
4. Keep a small locked-cube icon on the middle rack (with its padlock), so the model is still visibly "in" the data centre.

**After changes:** about 8.5–9.

---

### Cross-lesson findings

1. **Label floor.** A 24 px minimum for information-bearing text would lift every scene. Most captions are produced by the shared `Caption` component (`shared/components/People.tsx`, default 20 px, often overridden lower, e.g. `size={16}`). They are uppercase with wide letter-spacing, so they read even smaller. Raising its default to 24 px, removing smaller overrides, then checking for overlaps, fixes most of this in one change. Re-run `npm run center:trains` afterwards.
2. **Show "what right looks like".** Scene 3 (target word) and Scene 7 (a refusal reply) both show rejection without the correct behaviour. Adding these two beats is the biggest learning gain per minute of work.
3. **Metaphor accuracy.** Three visuals slightly mislead a careful learner:
   - word-level tokens (Scene 2)
   - one person making 1M comparisons (Scene 5)
   - safety as an external shield (Scene 7)

   Each fix is small and keeps the VO.
4. **Hold the conclusion.** Scenes 8 and 9 land their final beat (approval stamp, chat bubble lingering) too close to or past the fade. Every scene's last idea should hold for at least 1 s at full opacity.
5. **Throughline.** The early scenes use three unrelated visuals (icon rain, 3D grid, network) before the cube unifies everything from Scene 4. A ghost network in Scene 1 (S1.1) and token points flowing into Scene 3's input (S3.5) would make it one continuous story.
6. **The good stuff to protect:**
   - same-prompt before/after (4)
   - the explicit RL loop (6)
   - the freeze-and-bounce (9)
   - the finale (10)

   Don't let polish changes dilute these.

### Priority order

| # | Change | Scene | Why first |
|---|---|---|---|
| 1 | Checker clears per attempt (no ✓ beside a wrong answer) | 6 | It shows incorrect information on screen today |
| 2 | Show the target word | 3 | Biggest learning gain, small change |
| 3 | Light up only the guessed output | 3 | Removes ambiguity at the key moment |
| 4 | Shield drawn from the model, plus one refusal reply | 7 | Fixes a misleading metaphor |
| 5 | Blank model at centre, with data flowing in | 1 | Gives the opening a teaching beat and a focal point |
| 6 | Sub-word token split | 2 | Fixes a misconception |
| 7 | Raise the shared `Caption` default, plus key captions to 28 px | All | One change, lesson-wide legibility |
| 8 | Approval stamp earlier; "thousands" ghost scorecards | 8 | Holds the conclusion and matches the VO |
| 9 | Several people in RLHF; fix "1 comparisons" | 5 | Accuracy and polish |
| 10 | Two-beat staging and a prominent NEXT MODEL | 10 | Reduces load and lands the closing idea |
| 11 | Hold one example card; reduce cube moves | 4 | Legibility and calmer motion |
| 12 | Rebalance frozen numbers; fade the chat bubble | 9 | Polish on the strongest scene |
| 13 | Everything else | — | — |

**Projected lesson score with priorities 1–10 done:** about 8.7/10.

---

## Review 2: After implementing Review 1 (2026-11-09)

**Reviewed against:** `videos/practices.md`
**Source:** the re-rendered `out/how-ai-trains/how-ai-trains-1080p.mp4`, checked frame by frame at the same sample frames as Review 1. Suspect frames were checked at full resolution.
**Scope of changes:**
- Every Review 1 suggestion is implemented, except for three deliberate variations (see "Deviations from Review 1").
- No scene lengths changed. The beats synced to the voiceover are unchanged.
- The type-check is clean.
- The only shared-code change is an optional `labelSize` prop on `Bubble` (default 16), so lessons 2 and 3 render the same.

### Summary

| # | Scene | Review 1 | Review 2 | Change |
|---|---|---|---|---|
| 1 | Raw Data | 6 | **8** | +2 |
| 2 | Tokenize & Map | 7.5 | **8** | +0.5 |
| 3 | Adjusting Weights | 8 | **9** | +1 |
| 4 | Base Model → Fine-Tune | 8 | **8.5** | +0.5 |
| 5 | Learn from Feedback | 7.5 | **8.5** | +1 |
| 6 | Reinforcement Learning | 8 | **9** | +1 |
| 7 | Safety Testing | 7 | **8.5** | +1.5 |
| 8 | Evaluation | 7.5 | **8** | +0.5 |
| 9 | Locked In | 8.5 | **9.5** | +1 |
| 10 | Released to the World | 7.5 | **8.5** | +1 |

**Lesson average: 8.6/10** (was 7.6, projected 8.7).

Every High-severity issue from Review 1 is resolved:
- No wrong answer is shown with a ✓ any more (Scene 6).
- Scene 3 now shows the target word.
- The model now visibly refuses, and the shield grows from the model (Scene 7).
- Scene 1 has its blank-model beat.
- Scene 2 now splits a word into sub-word tokens.

The remaining issues are mostly brief overlaps during transitions.

### Scene by scene

#### Scene 1: Raw Data (8/10)
**Resolved:**
- A ghosted "BLANK MODEL" network sits at centre, giving the scene a focal point and visually setting up Scene 3.
- Icons bend into the nodes, which pulse as they land.
- The counter lands on 45.00 TB at frame 200, still on "learn".
- Icons clear the title and counter.
- The labels are 24–28 px.

**Remaining:**
- Low: from frame 90 to about 150, icons pass over the network's edges as they're absorbed. It reads as busy rather than as "filling up". A brief scale-down of each icon as it nears a node would make the absorption cleaner.

#### Scene 2: Tokenize & Map (8/10)
**Resolved:**
- "The cat sprawled" now splits into `sprawl` + `ed`, so tokens are no longer just words.
- The `#ID`s clear before the morph, and the stagger is shorter.
- "close = similar" and "far = different" now explain the kitten/car contrast.
- The grid is larger, and the axis labels are at full opacity.

**Remaining:**
- **Medium.** The morph midpoint still collides. At *abs* 355 the "cat" box overlaps the "sprawl" box, and "The" sits on the d₂ axis. Because the boxes shrink and move at different rates, neighbouring blocks cross. Fade the box outlines out before the blocks move (by about `TOKEN.morph + 4`), so only the words travel.
- Low: "+ 1,000s MORE" next to d₂ is small and ambiguous. It's not obvious it means dimensions. Use "+ 1,000s MORE DIMENSIONS" at 22 px, or drop it.
- Low: "close = similar" is about 20 px on the purple link.

#### Scene 3: Adjusting Weights (9/10)
**Resolved:**
- The ghosted target "on" shows in the input.
- "ANSWER: on" appears at the error beat.
- Probability bars (car 48 → on 82) teach that the model predicts likelihoods.
- Only the guessed output lights up.
- The red error flash now runs at about 2.3 Hz (under the 3 Hz guideline).
- Edge tinting makes the weight changes visible.
- Token points fly in from Scene 2.
- The headers are 24 px.

**Remaining:**
- Low: "TRAINING STEPS" still starts climbing during the first backprop (32M at *abs* 700), so the counter still partly reads as "one correction = millions of steps". Starting it at the second forward pass (local 228) would separate the two ideas.
- Low: the right-hand column is dense. The guess chip, three bars, the answer chip and the counter stack within about 450 px. It's readable, but it's the busiest area in the scene.

#### Scene 4: Base Model → Fine-Tune (8.5/10)
**Resolved:**
- The cube parks once, and outputs appear below it. The motion is much calmer.
- The first card holds at full size and is readable.
- The counter stops at 10,000, matching "thousands".
- The labels are 22–24 px, and the captions share a baseline.

**Remaining:**
- Low: montage cards are drawn over the cube face as they arrive (*abs* 1100, 1150). Fading them out before they reach the cube's edge (about 80 px earlier) would be cleaner.
- Low: the second prompt touches the cube's left edge as it flies in (*abs* 1200).

#### Scene 5: Learn from Feedback (8.5/10)
**Resolved:**
- Three people now feed the preferences.
- The reward-model panel is replaced by a direct "PREFERENCES" flow into the cube.
- "LEARNS THEIR PREFERENCES" lands at frame 175.
- The counter reads "1 comparison" → "1,000,000 comparisons".

**Remaining:**
- Low: after answer B is absorbed (*abs* 1375–1430), the right side holds only a label while the dimmed answer A remains on the left. Fading answer A at the same time would rebalance the frame.
- Low: the reward beat still lands after the voiceover ends, which the fixed voiceover makes unavoidable.

#### Scene 6: Reinforcement Learning (9/10)
**Resolved:**
- The checker now shows "…" until each verdict lands. At *abs* 1700, `is_prime(91)` → "True" shows "…", then ✕ 0. At 1780, `gcd` → "9" shows ✕ 0. **No wrong answer is ever shown with a ✓.**
- The montage is dimmed, with a "× 1,000s" tag.
- The chart is taller, with its percentage riding the line's end, and it starts flat at 28%.
- The labels are 24 px.

**Remaining:**
- Low: the attempt chip lands across the checker's left border (*abs* 1740, "12"). End its path about 40 px short of the box, and let it fade there.

#### Scene 7: Safety Testing (8.5/10)
**Resolved:**
- The shield grows from the cube with a purple training glow and a "LEARNED SAFETY" label, so it now reads as learned behaviour.
- On the first hit the model says "I can't help with that." aloud on screen.
- Attack chips are readable until impact.
- The layout is pulled in from the edges, and the answer bubble sits under the user.

**Remaining:**
- Low: the refusal bubble sits close to the title band (about y 180). It's fine at 1080p, but it's the closest content comes to the screen chrome in the lesson.

#### Scene 8: Evaluation (8/10)
**Resolved:**
- Ghost scorecards and "4 OF THOUSANDS OF BENCHMARKS" match the voiceover.
- The reviewers and a straightened stamp now hold at full opacity before the fade.
- The badge arrives with the reviewers.
- The labels are 22–24 px.

**Remaining:**
- **Medium.** The cube glides home *over* the fading scorecard (*abs* 2395–2410), cutting through "REASONING", "CODING" and "KNOWLEDGE" while they're still visible. Finish the panel fade before the cube's glide starts, or delay the glide by about 8 frames.
- Low: the "BACK TO TRAINING" label runs into the scorecard's left border (*abs* 2290). Move it about 40 px left, or under the path's midpoint.
- Low: the Scene 6 loop echo around the cube is too faint to notice in the sampled frames. Either raise its opacity or drop it.

#### Scene 9: Locked In (9.5/10)
**Resolved:**
- The chat bubble fades out by local 200, and the numbers in its lane return, ending 5 left and 4 right.
- "CHATS DON'T CHANGE THE WEIGHTS" is 28 px.
- The ripple is ice-cyan.

**Remaining:** none of note. This is the reference scene for the lesson.

#### Scene 10: Released to the World (8.5/10)
**Resolved:**
- The scene is staged in two beats, with the request bubbles fading before the team arrives.
- "FEEDBACK & REPORTS" is removed.
- NEXT MODEL is larger, with a dashed arc back towards the start.
- The locked cube stays on the middle rack.
- The captions are 22–24 px.

**Remaining:**
- Low: during the opening (*abs* 2760) the globe is small and far right, leaving the middle of the frame empty for about half a second before the channels draw.
- Low: NEXT MODEL is still smaller than the team caption beside it. The closing idea is now visible, but it's not the most prominent element.

### Deviations from Review 1 (accepted)
- **Caption sizes were set in each lesson 1 call, not by changing the shared `Caption` default.** Lessons 2 and 3 use `Caption` 29 times, laid out around 20 px. This is the right call, but those lessons will need the same pass later.
- **The NEXT MODEL cube is about twice its old size, not 70% of the main cube**, because the bottom row has no room for more.
- **The first example card holds at x 850, not 960**, to avoid overlapping the cube.

### Remaining actions (priority order)

| # | Change | Scene | Severity |
|---|---|---|---|
| 1 | Finish the scorecard fade before the cube glides home | 8 | Medium |
| 2 | Fade box outlines before the morph so the blocks don't collide | 2 | Medium |
| 3 | Move "BACK TO TRAINING" clear of the panel | 8 | Low |
| 4 | Stop the attempt chip short of the checker border | 6 | Low |
| 5 | Start "TRAINING STEPS" at the second forward pass | 3 | Low |
| 6 | Fade montage cards before they reach the cube | 4 | Low |
| 7 | Fade answer A as answer B is absorbed | 5 | Low |
| 8 | Clarify or drop "+ 1,000s MORE" | 2 | Low |
| 9 | Apply the 24 px caption floor to lessons 2 and 3 | — | Follow-up |

**Projected score with items 1–8 done:** about 8.9/10. The lesson is shippable as is, since no remaining issue misleads the viewer.

## Review 3: Re-review against the 9.5 target (2026-11-10)

**Reviewed against:** the updated `videos/practices.md` (9.5 target, fixed voiceover, text judged by role).
**Source:** the committed render at frames 0–3093, sampled every 10 frames. Every transition was scrubbed every 2–3 frames, and suspect frames were checked at full resolution. Fixes were then re-rendered and the same frames re-checked.
**Limits:**
- Sync was checked against the word timings in `timing.ts` and `BLUEPRINT.md`. The audio itself was not listened to.
- No scene lengths or voiceover beats changed.

### Findings and fixes

| # | Scene | *Abs* frames | Severity | Finding | Fix |
|---|---|---|---|---|---|
| 1 | 2 | 350–366 | Medium | The morph still collided. Box outlines overlapped mid-shrink, and "ed" passed over "cat" and "sprawl". | Box outlines fade out before any block moves. Each word fades out while its point travels and fades back in once it lands. |
| 2 | 2 | 365–370 | Low | "+ 1,000s MORE" was ambiguous. Once renamed, it touched "The" as it faded in. | The label is now "+ 1,000s MORE DIMENSIONS", placed beside the d₁ label, clear of every token. |
| 3 | 3 | 685–740 | Low | TRAINING STEPS started counting during the first correction, before "billions of times", so it read as "one correction = millions of steps". | The counter appears and starts counting at the second forward pass (local 228). |
| 4 | 4 | 1085–1145, 905, 1200 | Low | Montage cards were drawn over the cube's face, and both prompts slid into its left face. | Cards are drawn beneath the cube, so they pass into it. The prompts start 40 px further left and fade out by 40% of their flight. |
| 5 | 5 | 1420–1428 | Low | "PREFERENCES" and "LEARNS THEIR PREFERENCES" cross-faded on the same baseline, so the text overlapped. | The short label is gone before the long one fades in. |
| 6 | 7 | 2034–2042 | Low | "How do I bake bread?" was drawn across the cube's AI badge. | The request's text clears before the cube's face, and a cyan dot carries it the rest of the way in. |
| 7 | 8 | 2393–2402 | Medium | The cube glided home over the fading scorecard, cutting through its labels. | The scorecard fades out completely first (local 278–284), then the cube glides home in the last 14 frames. The stamp still holds for about 1 s. `cubePose` gains an optional `homeFrames`. |
| 8 | 8 | 2290 | Low | "BACK TO TRAINING" ran into the scorecard's left border. | Moved 90 px left. |
| 9 | 1 | 90–150 | Low | Falling icons were drawn on top of the blank network. | Once the network appears, falling icons fade over its footprint. Only icons being absorbed into a node show on top of it, brightening as they head in. |

### Scores

| # | Scene | Review 2 | Review 3 | Remaining note |
|---|---|---|---|---|
| 1 | Raw Data | 8 | **9.5** | None. |
| 2 | Tokenize & Map | 8 | **9.5** | Words disappear for about 10 frames mid-morph, but the dots carry continuity. |
| 3 | Adjusting Weights | 9 | **9.5** | The right-hand column is dense, but readable. |
| 4 | Base Model → Fine-Tune | 8.5 | **9.5** | Card text faintly shows through the translucent cube as it enters, which reads as absorption. |
| 5 | Learn from Feedback | 8.5 | **9.5** | The reward beat lands after the voiceover ends, which the fixed voiceover makes unavoidable. |
| 6 | Reinforcement Learning | 9 | **9.5** | The fast-cycle attempt chips briefly touch the checker's border. They're incidental, and the verdicts are always correct. |
| 7 | Safety Testing | 8.5 | **9.5** | The last REFUSED label is still fading (local 163–171) as the everyday request crosses the shield. They don't overlap. |
| 8 | Evaluation | 8 | **9.5** | The glide home is quicker (14 frames, not 20). |
| 9 | Locked In | 9.5 | **9.5** | None. |
| 10 | Released to the World | 8.5 | **9.5** | For about 0.4 s after the racks appear (local 50–62), the right half is empty until the globe draws. This is the centring track making room for it. |

**Lesson average: 9.5/10** (was 8.6).
