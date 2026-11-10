# Best Practices: Reviewing Motion Graphics Learning Videos

Use this checklist to review a scene or a whole lesson. Review the rendered video, not only the code or storyboard. Scrub frame by frame through every transition, and watch at least once at full speed with sound.

**Target: 9.5/10 for every scene.** A score below 9.5 needs at least one specific finding that, once fixed, would raise it.

## 0. Fixed constraints

- **The voiceover is final.** Don't suggest re-recording, rewording, re-timing or padding it with silent holds. Scene lengths follow the narration.
- Find any extra reading time within the existing narration. Show key text earlier, on the word that introduces it, and keep it on screen through transitions instead of removing it early.
- What appears on screen must match what the narrator says. When the visuals and narration disagree, change the visuals.
- Keep content horizontally centred and evenly spaced, including during animation.

## 1. Learning objective

- Each scene teaches one idea, and you can say that idea in one sentence.
- The visual shows the mechanism, not just the topic. A viewer with the sound off should still get the gist.
- Every claim the narrator makes has a visual beat. A concept that is only spoken is easily missed.
- Every visual beat earns its place. Remove decoration that competes with the idea.
- The simplification is honest. It leaves things out without teaching a misconception that a later lesson has to undo.
- Facts, numbers and scale are accurate, or clearly marked as illustrative.

## 2. Narration and sync

- Each visual change lands on the word it illustrates, within about 0.25 s. It must never come before the narrator introduces the idea.
- The viewer has time to read primary text (see section 4) before it changes. As a rule of thumb, allow at least 0.3 s per word plus 0.5 s. Secondary and incidental text doesn't need a full reading window.
- Text on screen doesn't compete with the narration. Use short labels and keywords, never full sentences being spoken at the same time.
- The scene ends on its conclusion and holds it long enough to register before the next scene starts.

## 3. Visual hierarchy and focus

- At any moment there is one obvious focal point. The eye should never have to hunt for it.
- The most important element is the largest, brightest or most saturated thing on screen.
- Motion attracts the eye, so only the thing that matters right now should be moving fast.
- Background motion, such as particles or drifting grids, is low in contrast and never passes behind text.
- Colour carries meaning consistently. For example, red means wrong or error, and cyan means correct or data. Never reuse a semantic colour for something unrelated.

## 4. Legibility

Judge each piece of text by its role. Ask: **does the viewer need to read this to get the idea?**

| Role | Examples | Size at 1080p | Must be readable? |
|---|---|---|---|
| **Primary**: what the viewer is meant to read | Takeaway captions, the label of the focal element, a callout that explains the point, text that is compared or highlighted (for example, a mismatched citation) | Body 24 px or more, key text 28 px or more | Yes, including on a phone, with a full reading window |
| **Secondary**: supporting labels | Component names, axis and lane labels, status tags, file names on cards that aren't the focus | Smaller is fine, typically 16–22 px | Readable when the viewer looks, but it doesn't need to be noticed first |
| **Incidental**: detail that adds realism | Token counts, percentages, readouts, ruler ticks, index slot labels, scores that only show "a number changes" | Can be small | No, as long as the idea doesn't depend on it |

- If the idea depends on the viewer reading a value (for example, "this one is higher"), that value is primary. Make the comparison visible in other ways too, such as size, colour or position.
- Don't mark down secondary or incidental text for being small. Do mark down text whose role is unclear, such as small text that the narration points at.
- Primary text has strong contrast with its background (aim for WCAG AA, 4.5:1). Dimmed secondary labels should still be readable.
- Text never overlaps lines, other text or moving elements, including partway through a transition.
- Numbers use tabular figures so counters don't jitter.
- Primary text still reads on a phone. Check a frame scaled down to 640 px wide.

## 5. Layout and composition

- Content is balanced around the horizontal centre, and stays balanced during animation, not just on key frames.
- Spacing between related elements is consistent, and spacing between groups is larger than spacing within a group.
- Content keeps a safe margin from the frame edges (at least 60–96 px).
- Screen chrome (titles, badges, counters) stays in fixed corners and never collides with content.
- Elements use the frame. A small diagram floating in a large empty field reads as unfinished.

## 6. Motion design

- Motion explains something, such as cause and effect, a transformation, flow or comparison. It isn't just ornament.
- Easing is natural, with no linear starts or stops on objects that represent physical things.
- Timing is consistent: similar actions take similar durations throughout the lesson.
- Transitions have a clean in-between. Check the midpoint frame of every morph for clutter and overlaps.
- Staggered sequences read as a group, not as noise.
- No flashing faster than 3 Hz over large areas, to protect viewers with photosensitive epilepsy.

## 7. Continuity

- Objects that carry meaning between scenes visibly persist or transform. Avoid cuts that make the viewer reconnect ideas on their own.
- Recurring elements keep the same look, position and colour across scenes.
- Each scene's opening frame follows on from the previous scene's closing frame.

## 8. Cognitive load

- Introduce no more than about three new elements at once.
- Label first, then animate. Name a thing before it starts doing something.
- Use one example throughout a scene. Switching examples mid-explanation costs attention.
- Remove labels once they have done their job, so later beats have room.

## 9. Accessibility and production

- Captions or a transcript are available, and caption placement doesn't cover key visuals.
- Audio levels are consistent. SFX support the narration and never mask it.
- Renders have no dropped frames, banding or compression artefacts on gradients and glows.
- Everything is deterministic, so a re-render matches the reviewed version.

## Scoring rubric (out of 10)

**Target: 9.5 for every scene.**

| Score | Meaning |
|---|---|
| 10 | Exemplary. Nothing to change. |
| 9.5 | **Target.** Teaches the idea clearly with the sound off. All primary text is readable for long enough. No overlaps or collisions at any frame, including mid-transition. Styles are consistent with the rest of the lesson and the other lessons. At most one cosmetic note that a viewer wouldn't notice. |
| 9 | Teaches clearly, with a couple of small issues a careful viewer might notice. Examples: a brief overlap while something moves, one caption in an inconsistent style, primary text slightly small. |
| 8–8.5 | Teaches the idea, with several fixable clarity, legibility or polish issues, or one that slows understanding. |
| 7–7.5 | Teaches the idea, but some primary text is hard to read or the focal point is unclear in places. |
| 5–6 | The idea comes mostly from the narration. The visuals are decorative or confusing in places. |
| 3–4 | The visuals mislead or distract from the idea. |
| 1–2 | Broken or unusable. |

Weight the score towards learning (sections 1–3) over polish (sections 4–9). A beautiful scene that teaches the wrong idea scores lower than a plain one that teaches the right one.

### Reviewing for 9.5

- **Watch every scene twice at full speed:** once with the sound off (does the idea come across?) and once with sound (does each visual land on its word?).
- **Scrub every transition**, including entries and exits, and check the midpoint frames. Sampled key frames alone can't support a 9.5.
- **Classify text before judging its size** (section 4). A finding about small text must say why that text is primary.
- **Check consistency across lessons**, including caption style, text sizes, colour meanings and recurring elements.
- **Give every finding** a frame number, a severity (High: misleads or hides the idea; Medium: slows understanding; Low: cosmetic) and a fix that works within the fixed voiceover.
- **Review with fresh eyes.** Preferably, the reviewer hasn't implemented the previous round's fixes.
