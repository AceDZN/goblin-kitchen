# Independent kitchen-restoration check

Status: targeted behavioral/readability checks pass on source checkpoint `907ca96`. Actual captures show cabinet side faces, open gaps and the framed service station again, with the surrounding world preserved. This is distinct from a claim that the user accepts the layout or finds it fun.

`node scripts/kitchen-restoration-check.cjs` uses ordinary pointer, touch, keyboard and action controls. The observation hook supplies state and projected label/prop bounds. `advanceTime` advances elapsed time without injecting ingredients, success or positions. `--only=layout` and `--only=gameplay` allow a failed section to be rerun while preserving completed evidence.

The targeted acceptance checks are:

- At 1440×900, 960×600, 844×390 and 390×844, the complete pinned English instruction is visible by default, at least 14px on compact views/16px on desktop. Levels 1 and all three level-36 orders are checked; innerText alone is insufficient because it includes clipped content. The test measures individual word rectangles against clipping ancestors, viewport and actual DOM hit visibility. Ordinary card scrolling also reaches the ending.
- Every station worktop and actual label center is clear of the HUD. Clicking each of the eight labels must route to that station, including portrait touch taps.
- Keyboard movement crosses the reopened left counter gap at z≈1.5, and the outer boundary still blocks escape. PREP relocation moves its label/interaction, and current-level restart restores its original position.
- Knife, bowl and blender-region pixel pairs show changes during the corresponding jobs; ingredient form/blend state must change only on completion. A paused blender job and dish flight must preserve exact canvas pixels, time and held state. Crops exclude DOM overlays; they are actual canvas readbacks, not generated art.
- An excess yogurt measure causes rejected service and an actual return. Remove/restir and a second toss must succeed, with reward only at catch.

The run completed 30 checks with 49 capture/state records and zero page errors, console warnings/errors, failed requests or HTTP failures. It used normal controls, and the browser exited successfully. There was a brief scheduling overlap with the lead's full campaign browser; both completed, and neither run is used as FPS/performance evidence. No browser was relaunched afterward.

Initially visible words, without scrolling:

| Viewport | Font | Level 1 | Level 36 starter | Level 36 main | Level 36 finish |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | 18px | 16/16 | 26/26 | 36/36 | 22/22 |
| 960×600 | 14px | 16/16 | 26/26 | 36/36 | 22/22 |
| 844×390 | 14px | 16/16 | 26/26 | 36/36 | 22/22 |
| 390×844 | 15px | 16/16 | 26/26 | 36/36 | 22/22 |

Every worktop center and actual sprite-label center was clear of the HUD. All eight label clicks routed correctly on each checked level/viewport, including portrait touch. The keyboard crossed the reopened left gap at z≈1.5; the outer boundary still stopped escape. Relocated PREP and its label routed correctly, and retry restored its original position.

Knife/bowl-region pixels changed during preparation/stir before the logical state changed. Excess yogurt caused a visible toss/rejected return; remove/restir corrected it, and service rewarded only at catch. A midair pause preserved canvas pixels, flight coordinates and time exactly. Blender processing preserved the held dish and ingredient contents until completion, paused without changing raw canvas pixels/time, then completed and served correctly.

The broad blender crop included an independently moving chef/held bowl at its top, so its idle hashes differed. That comparison alone cannot attribute motion to the blender. A separate offline inspection isolated the visible blender base at crop coordinates `[15,56,50,79)` in the 61×89 pixel readbacks: idle frames had **0 changed pixels**, working frames had **590 changed pixels**. The enlarged comparison and original crops show the base tilting. The underlying JSON analysis is `docs/kitchen-restoration/blender-pixel-analysis.json`; no extra browser or game-state mutation was used.

Full-size desktop, short-landscape main-course and portrait dense-order captures were inspected. They show restored diagonal depth/open workstations, legible complete instructions and the retained town/palace environment. Cropped pixels demonstrate visible movement; they do not establish that it is attractive or satisfying. Compact readability here is established for the specified level-1/36 instructions, not every recipe on every device. The lead separately reports a successful 36-level/60-course route, which should be read alongside its own evidence.

Results: `docs/kitchen-restoration/independent-verification.json`. Captures: `docs/kitchen-restoration/independent-captures/`. Source digest over scene/main/style: `00f82ae2c46bb35ee08f40a0cd3a0124017f856f6dd3dfd31b0c33164dfdd4d8`. The checker now asserts full initial visibility at all four sizes (the recorded counts already satisfy that stronger condition). All reviewer browsers are closed; GPU released.

Full-frame screenshots are retained as JPEG evidence to limit repository size. Original motion-region PNG readbacks are preserved byte-for-byte; original full-frame PNGs are kept locally in ignored work/restoration-independent-raw.
