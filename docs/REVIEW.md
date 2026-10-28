# Independent English and gameplay review

Current scope (28 October 2026): a regular 36-level campaign with no grade selector/gate is implemented and verified. All 78 tests and typecheck pass. The lead’s full 36-level browser route and this reviewer’s independent opening/error/recovery/touch checks pass. The earlier five-level signoffs below are historical; the final campaign section records current evidence and resolved findings.

Reviewer owns this file, CURRICULUM.md, tests/recipes.test.ts and the authorized browser regression script. Final integrated-build status (26 October 2026): 24 rule tests, typecheck and the full normal-input browser regression passed with the local rigged cook and bowl. Historical blocked/pending notes below describe earlier builds; the final verification section supersedes them.

## Pre-implementation findings

1. Slicing must preserve source fruit identity/count. Two apples can yield many pieces while remaining two apple-equivalents.
2. A slice of bread is a counted piece; a whole loaf cannot satisfy a slice order. Two concurrent orders must remain distinct at service.
3. The banana for shift 3 must be peeled before sliced. Stirring before the last required addition cannot satisfy the final stir.
4. Cup and tablespoon are distinct measures. If conversion is accepted, the game's labeled volumes must be explicit; never compare raw counts across unequal units.
5. “The pear that you prepared” needs prior player preparation history. A pear spawned prepared by an unseen actor cannot truthfully be described as prepared by the player. A physical prep phase or a precise fixture rewrite must resolve this.
6. “A little” has no exact hidden numeric target. Accept a visible range of small positive amounts. Zero is not a little.
7. “Clean bowl” requires visible condition and a way to clean or select one. Never impose an unseen cleanliness test.
8. Do not reject independent preparation order unless the English or required state imposes a dependency. For example, slicing either of the two apples first is valid.
9. English must determine actions; no correct-station highlights, completing icons or fixed action chain should expose the full solution. General station labels and carried-item state are appropriate.
10. Translation/vocabulary counts as assistance. Retries and recipe hints cannot be scored as first unaided comprehension.

## Pure tests

19 tests passed with `npm test` using `tsx --test tests/*.test.ts`. Coverage: all five complete recipes through Kitchen action methods; reverse concurrent bread order; exact and wrong spoon amounts; cup versus tablespoon; peeled/sliced dependencies; apple source count; prepared pear; a-little amounts 1, 2, 3 and 4; dirty bowl; old ingredient in transfer; remove-and-restir recovery; adding invalidates prior stir; failed service and remake; read/pause time; assistance and restart history. These tests verify rules, not rendered play or learning gains.

## Browser review

Independent real-browser session completed all five shifts using normal station clicks and action buttons, with advanceTime only for deterministic elapsed time. Three tablespoons in shift 1 were rejected; removing one and stirring again succeeded. Both bread orders succeeded. Shift 3 peeled then sliced banana and one cup succeeded. Shift 4 rejected someone else’s prepared pear, then accepted the player-prepared pear with two tablespoons. Shift 5 washed the dirty bowl, sliced two source apples, measured three tablespoons and served successfully in changed layout, without help. Results: 285 tips, 2 deliberate mistakes, 3/5 first unaided completions, transfer unaided; no page errors. At 390×844, touch station→take worked; recipe reading froze time and movement; vocabulary froze time and recorded assistance; reduced motion and restart worked. Hook and shown carried/recipe state agreed. Assets remained explicitly marked as procedural stand-ins, so real Tripo asset/rig requirement is not signed off.

## QA inventory for browser signoff

| Claim/control | Functional check | Visual state/evidence |
| --- | --- | --- |
| Five finite shifts | Cook each dish through actual controls; reach final completion | One play capture per shift; final results |
| Move/carry/collision | Walk all routes; attempt wall/counter crossing; carry item through route | Cook position, held item, reachable stations |
| Ingredient prep | Peel banana; peel then slice banana; prepare pear; slice apples | Whole/peeled/sliced shapes and held labels |
| Exact and non-exact amounts | Serve wrong spoon amount; remove excess; restir; compare cup | Portion display, wobble, explanation |
| Service and recovery | Launch valid dish; reject wrong dish; recover without reload | Dish arc/customer reaction; wrong recipe phrase |
| Two bread orders | Fill slices and loaves separately, also reverse order | Two pinned orders, active dish status |
| Pause/read/help | Move/timer stop on read/help/pause, resume afterwards | Paused overlay and unchanged hook time/position |
| Restart | Return to shift 1; no carried item; prior assistance not erased | Read mode and fresh bowl |
| Transfer | Changed nouns/layout; dirty bowl can be washed; no answer hint | Shift-5 instruction, visibly changed layout |
| Mute/reduced motion | Toggle each off/on and observe effect | Current button state; restrained motion |
| Fullscreen/focus loss | Enter/exit; switch focus and resume | Canvas fits and pause state |
| Touch/responsive | Tap to move/interact at narrow viewport | Entire playfield, recipe and essential buttons fit |
| English/Hebrew | Recipe LTR, Hebrew help RTL, text readable | Dense shift-3/5 order and help states |
| Text hook agreement | Read before/after each meaningful action | Same inventory, dish, mode and success as image |
| Real 3D/Tripo assets | Inspect loaded goblin/prop and animation | Gameplay capture includes actual rig/prop |

Exploratory scenarios: (1) change active order while hands are occupied, try serving an unfinished bowl, then recover; (2) pause with a key held and resume, resize mid-carry, then verify no stuck movement or clipped recipe.


## Implementation review findings sent to lead

- Header controls must not change intro/between/complete into play, which would permit duplicate service/tips/results. Lead notified before browser signoff.
- Restart now preserves per-shift assistance/attempt history, and the restart test passes.
- Shift 4 exposes a whole pear the player can prepare and a pear prepared by someone else. Only player preparation qualifies.
- Transfer begins with a visibly dirty bowl; washing is part of the physical task.
- Rejected service keeps the current bowl so excess yogurt can be removed and stirred again; a rejected order still records a mistake.


## Actual browser evidence

Captures in `docs/captures`: reviewer-shift1-peel.png, reviewer-wrong-amount.png, reviewer-shift3-cup.png, reviewer-transfer-read.png, reviewer-transfer-ready.png, reviewer-five-shifts-complete.png and reviewer-mobile-before.png. These are real gameplay/browser captures, not generated targets. The reviewer visually inspected peeled gameplay, wrong-amount feedback, transfer-ready and narrow touch layout. The reproducible normal-input script is committed as `scripts/browser-playtest.cjs`.

Material visual issues found and sent to lead: pantry decoration remains banana even when pickup becomes apple/pear; bowl contents and amount are too small to read; old error phrase persists into later shift toasts. Lead is correcting these, so later captures should be taken after fixes. The portrait UI fits, but small station labels require close attention.

Not established: child playtest engagement, learning gains, audio quality through actual speakers, Tripo rig/prop rendering, or physical device performance. Browser success is evidence of solvability and working interactions.


## Post-fix verification (26 October 2026, Asia/Jerusalem)

`node scripts/browser-playtest.cjs` passed on the updated build. This committed portable script reproduces the complete normal-input route, two deliberate rejected services and recovery, changed-layout transfer, completed-state header guard, touch pickup, reading/vocabulary pause and restart. It uses `advanceTime` only for deterministic elapsed time, never inventory or outcome injection. Fresh captures replace the earlier desktop evidence and add `reviewer-mobile.png`; machine-readable results are in `work/reviewer-browser-results.json`. No page errors occurred.

Separate normal-input exploration verified KeyD movement, collision with the service counter, a repeated prolonged KeyW stop at z=-4.67, a mute off/on label cycle and F fullscreen enter/exit. This verifies controls and bounds, not audible sound quality.

Visual inspection of the updated desktop wrong-amount, transfer-ready and completion captures confirms larger MIX bowl, readable current contents/unit/cleanliness, apple pantry props, correctly placed hatch customers, and cleared stale error phrases. The updated portrait capture was also reviewed. The real Tripo asset/rig requirement remains unverified/blocked. The final fruit-surface correction was visually confirmed in the refreshed transfer-ready capture: slices now remain visible above yogurt. A second full `node scripts/browser-playtest.cjs` run passed after that correction, including actual PREP relocation after shift 2; the refreshed shift-3 capture shows the relocated station and successful one-cup dish.


The final mobile screenshot (`reviewer-mobile.png`) was inspected after the second complete regression: header, recipe, full kitchen, touch movement and contextual controls fit the 390×844 viewport. Labels are small at portrait scale, while the English recipe remains readable. No real Tripo model, rig or animation was available; that acceptance criterion remains blocked and is not represented as satisfied by the procedural characters.

The compact landscape recipe fix was independently captured and inspected at 1280×720 in `reviewer-1280-bread.png`: recipe bounds x=24,width=300; the BREAD label and counter are fully visible, normal pointer movement reaches BREAD, and the Take loaf action remains visible. Header, recipe, context and controls fit. The short repeat capture used `work/reviewer-viewport.cjs` and closed its browser successfully.

## Renewed gameplay/art pass — 26 October 2026

The resumed commission keeps the real Tripo model/rig requirement open. This reviewer does not operate Chrome/Tripo; the designated root asset owner does. The existing target and prior captures remain historical evidence.

A new normal-input baseline play completed shift 1 on dev port 5201. Scratch captures `work/resume-review-carry.png` and `work/resume-review-serve.png` were visually inspected. The result overlay and tips appeared immediately at service, before a visible catch. The old toss path targets a fixed point behind the kitchen rather than the actual service hatch, and paused rendering conceals the arc after final service. Carrying the dish also projects the bowl over the chef's head. These observations motivate a visible hand carry pose and a toss that reaches the actual hatch before awarding success/showing the intermission.

Recommended mechanics retain English as the source of preparation and quantities: a MIX tray to park leftover bread and juggle the two order bowls; a satisfying hatch catch with recoverable rejected dishes; and a visible consequence for choosing the PREP location, such as action time/route length after reading. No correct-food beacons or grammar gates are recommended.

The default pear/transfer reading panels are neutral, and optional vocabulary marks assistance. Guided first-shift route instructions are useful onboarding, but the old result incorrectly counted this as unaided comprehension. The agreed correction labels shift 1 guided practice, uses four later shifts as the unaided denominator, and shares a `firstUnaided` definition between events, results and the text hook. Prior help, mistakes and repeat exposure must remain disqualifying across restart/reload. The lead implemented this shared rule and guided result flag. Targeted tests specify first-shift practice, shift-2 help, restart/repeated exposure and post-mistake event consistency; all 21 rule tests pass after the correction.

The transfer fixture also has a grouping ambiguity: “First, slice two apples. Put the slices...” can imply both are sliced before any slices enter the bowl, while the baseline accepts interleaved prep/add. The reviewer recommended clarifying the original scenario to “Slice two apples and put the slices in a clean bowl. Add three tablespoons of yogurt. Then stir and serve.” unless staging/group-order is actually implemented. This preserves the intended count/state/quantity transfer without inventing a hidden dependency.

Post-integration success, error/recovery, transfer and touch verification remains pending. Prior browser passes do not establish the behavior of newly integrated models or mechanics.

## Focused mechanics verification — renewed pass

24 rule tests and typecheck passed after adding three tray regressions: parked leftover count is conserved per order while another order is cooked; an occupied tray refuses overwrite without deleting either ingredient; putting a carried dish down preserves its contents and next/restart clears parked stock.

`node scripts/browser-playtest.cjs --focused` passed with normal pointer/keyboard input. It now checks that a toss heads to the actual hatch at x=5.85,z=0.5, awards no tips/result before arrival, freezes projectile coordinates and action time during midair pause, returns an invalid three-tablespoon dish to MIX without losing contents, permits remove-one/restir recovery, and shows a catch before the completion overlay. It also parks two leftover bread slices, fills the other order, retrieves/parks the leftovers, and serves both dishes without discarding that bread. No page errors occurred. Machine-readable evidence is `work/reviewer-focused-results.json`.

Visually inspected actual captures: `reviewer-toss-midair.png`, `reviewer-toss-paused.png`, `reviewer-return-flight.png`, `reviewer-hatch-catch.png` and `reviewer-tray-juggle.png`. The arc, caught bowl, two dishes and parked bread are now visible. The pause panel's secondary buttons have insufficient contrast; reported to lead. Capture helper now waits for the brief CSS feedback fade while the deterministic game clock is stopped, so feedback remains legible in saved captures.

This is a mechanics check with the current procedural cook. Real-model/animation integration and its full success/error/transfer/touch regression are still pending and are not covered by this pass.

## Base Tripo cook and UI corrections — focused verification

A further `node scripts/browser-playtest.cjs --focused` run passed after loading the real local Tripo cook base on desktop and mobile. The script now waits for `assets.realCook` before captures. Runtime evidence explicitly reports `realCook: true`, `riggedCook: false`, `joints: 0`, `clips: []`, `realProp: false`; this confirms the acquired static base, not a rig or animated export. The full model/prop requirement remains pending.

The run repeated hatch timing, midair pause, rejected-dish return/recovery and two-order tray juggling, and verified the corrected “2 slices of bread” carry/tray labels. The updated desktop peel/tray captures visibly include the real cook. At 390×844, normal touch movement and park/retrieve worked; all four wrapped tray buttons fit, the carry label no longer overlaps the controls, and reading/help/restart passed. The updated pause capture confirms readable secondary button contrast. There were no page errors. Captures include `reviewer-shift1-peel.png`, `reviewer-tray-juggle.png`, `reviewer-toss-paused.png`, `reviewer-mobile-tray.png` and `reviewer-mobile.png`.

These captures show the current static base pose. They do not establish animation playback, hand binding, or final art fidelity; full success/error/transfer/touch regression is reserved for the downloaded rig/animation and prop integration.


## Final integrated rig, prop and complete slice verification — 26 October 2026

Commands: `npm test`, `npm run typecheck`, `node scripts/browser-playtest.cjs`. All 24 rule tests passed, typecheck passed, and the final full browser regression passed with no page errors or console errors. It used normal keyboard, pointer and touch inputs; `advanceTime` controlled elapsed time only. The browser closed successfully after the run. Machine-readable results and captured hook states are saved in `work/reviewer-browser-results.json`.

Desktop and mobile runtime assertions confirmed the actual local assets: `realCook: true`, `riggedCook: true`, 65 joints, `realProp: true`, and exactly three clips: `idle`, `walk`, and `Goblin Kitchen carrying motion: walk steadily in place, holding`. Normal movement selected walk, carrying selected the carry clip, and stopping selected idle. A rendered-canvas hash changed during running movement/animation, then stayed exactly equal across two seconds of paused stepping; action time also froze. This checks the displayed rig/scene rather than trusting only the active-animation label.

The full route completed all five shifts, including both bread orders with parked leftovers and station relocation. Three tablespoons in shift 1 were rejected at the hatch, visibly returned to MIX, then corrected by remove-one/restir. The wrong prepared pear was rejected; the player-prepared pear succeeded. The changed-layout transfer washed the dirty bowl, sliced two source apples, added three tablespoons, stirred and served without help. The clarified transfer fixture is now implemented and mapped in CURRICULUM.md. Final results were 285 tips, two deliberate mistakes, guided first-shift practice, three first-unaided completions out of the four later shifts, and an unaided transfer.

Hatch timing assertions confirmed no reward/result before arrival, midair pause preserved projectile coordinates, and the caught dish remained visible before the results overlay. Touch pickup, MIX park/retrieve, all four wrapped action buttons, non-overlapping carry text, reading/help pause and restart passed at 390×844. Bread carry/bowl/tray labels use slices/loaves correctly.

Visually inspected final captures include `reviewer-rig-walk.png`, `reviewer-rig-pause.png`, `reviewer-carry-banana.png`, `reviewer-carry-dish.png`, `reviewer-transfer-ready.png`, `reviewer-five-shifts-complete.png` and `reviewer-mobile-tray.png`. They show the real cook, visible carry posture with ingredient/dish in front of the body, the acquired ceramic bowl, prepared fruit above yogurt, readable recipe/current-contents text and the completed finite slice. The generated target remains conceptual evidence; these files are actual browser captures.

No remaining blocker was found in the tested gameplay/asset paths. This review does not establish child engagement, learning gains, audible sound quality through physical speakers, performance on a physical low-end phone, or every possible animation pose. Portrait station labels remain small. The decorative customers and kitchen architecture are intentionally procedural; the cook and bowl are the actual local Tripo assets verified above.

Final text/artifact correction: the Hebrew completion paragraph originally reversed the visual order of the unaided ratio. The lead wrapped it in `<bdi dir="ltr">`; the final full browser run passed again with explicit `dir="ltr"` and exact `3 / 4` text assertions. The refreshed `reviewer-five-shifts-complete.png` was visually inspected and now displays the ratio correctly. The initial asset note also describes loading rather than the obsolete blocked state. No further blocker was found; this last run again completed all five shifts, rig/prop assertions, error recovery and touch checks with zero browser errors, then closed its browser.


## 36-level campaign review — 28 October 2026

Authored `src/levels.ts`: 36 distinct levels, six venues of six, 60 courses, bounded 1–3 food counts and at most three concurrent orders. The opening five exact recipes remain unchanged; only level 1 is guided, and level 5 retains its dirty-bowl transfer. Every recipe ingredient/extra is stocked, every needed measure/liquid/tool is available, and no pantry exceeds five foods (bread uses its separate station). New forms, heat, multiple liquids, layers and explicitly ordered service are combined progressively rather than repeated with giant counts. CURRICULUM.md maps every original fixture to the exact Workbook sources and marks new vocabulary as project extensions.

The initial combined suite passed 76 tests and typecheck. This includes independent actual-action solutions for every level, one continuous 1→36 campaign finish, exact opening fixtures, process/heat/unit/liquid/layer/blend/service near misses, current-level restart, soft-pace completion and persistence bounds/best replay merging. The rule solver uses Kitchen actions and control selections, never injected dish/win state.

The independent opening/error browser regression was updated for the new UI and campaign continuation, with additional normal-input deep-link probes for wrong layers at 9, service order at 11 and wrongly blended chunky soup at 22. Initial navigation encountered a load timeout while the lead's full campaign browser was also active. To avoid competing GPU jobs, this browser was stopped through its own SIGINT cleanup and exited; no gameplay failure is inferred from that load timeout. Browser re-verification is pending the lead's campaign run finishing.

One additional semantic issue was found in pure review: level 28 says only “a little yogurt” but offers teaspoons as well as tablespoons. The validator's exact-unit check rejected a small positive teaspoon amount even though no unit was stated. Targeted regressions specify acceptance of 1, 3 and 12 teaspoons plus an equivalent mixed-unit boundary, and rejection of 13 teaspoons, half a cup and a cup. The lead queued and then implemented the volume-based correction after the campaign browser run. The earlier 76-pass count predates this new failing case and is not presented as a current all-pass result until it is fixed.


The lead reports the full normal-input 36-level/60-course campaign route passed, including map unlock/save/reload/replay and zero browser errors. That is lead evidence; this reviewer is independently checking consequential error/recovery paths. The volume correction for a little yogurt and the half-cup visual update are being verified serially to avoid GPU contention. The independent script now also serves a valid teaspoon yogurt portion at level 28, then checks that the separate exact half-cup broth course rejects a full cup and can be repaired.


After the volume correction, the lead reports 78/78 tests and typecheck pass. The flexible yogurt requirement now compares small positive tablespoon-equivalent volume with numeric tolerance, while exact liquid/unit requirements remain exact. The independent level-28 probe is prepared; browser execution remains queued until the art browser closes.


## Final 36-level campaign evidence — 28 October 2026

The independent combined unit suite passed **78/78 tests** and typecheck after the a-little volume correction. Every one of the 36 levels is solved through Kitchen actions, and a continuous run finishes only at 36. The authored catalog contains six venues of six levels and 60 courses; the opening five fixture texts remain exact. The three changed legacy expectations now correctly cover campaign continuation at 5, current-level restart, and clearing trays for the current course count rather than resetting the whole journey.

The lead’s separate normal-input `scripts/campaign-playtest.cjs` result (`work/campaign-browser-results.json`) reports all 36 levels/60 orders, map unlock/save/reload/replay, zero browser errors, every completed ID from 1 through 36, and 105 stars. This is lead browser evidence, distinct from the reviewer’s independent runs. Missing some optional pace stars did not block completion.

The reviewer’s updated `scripts/browser-playtest.cjs` passed the opening five cooking solutions into level 6, rig idle/walk/carry and pause checks, wrong-amount toss/return/recovery, tray juggling, prepared-pear rejection/recovery, dirty-bowl transfer, and 390×844 touch/read/help/restart. Level 9 also rejected correct quantities in the wrong layer order and accepted a rebuild reusing the parked toasted bread. These checks completed before a genuine host-deep-link restart defect was reached at 11: the UI’s unlock guard blocked retrying the already-open host level. The lead fixed current-level restart to retain that allowed access.

After that fix, `node scripts/browser-playtest.cjs --probes-only` passed independent normal-input probes for:

- Level 11: Pause→Restart stays on 11, opens its read card, and does not restore first-unaided credit. A valid main served before the stated starter is rejected; serving the starter and then the retained main succeeds.
- Level 22: a chunky soup with correct ingredients/amount but an unwanted blend is rejected. Remaking the chunky course and then blending the smooth course completes both orders.
- Level 28: one teaspoon of yogurt is accepted for a little with zero errors. The separate exact half-cup broth course rejects a full cup, then accepts remove/remeasure/restir recovery. Its button and carried label show **½ cup**, and two half-cup measures show **2 × ½ cup**, avoiding the misleading 1½ reading.

The final probe run had no page or console errors and closed its browser in `finally`. State/capture evidence is in `work/reviewer-probes-results.json`. The script also preserves partial failure evidence for future regressions. Direct rule feedback for the bread-form near miss now says “2 slices of bread.”

Actually inspected current captures include `reviewer-opening-transfer-ready.png`, `reviewer-opening-mobile-tray.png`, `reviewer-layers-recovered.png`, `reviewer-wrong-service-order.png`, `reviewer-chunky-wrongly-blended.png`, `reviewer-chunky-and-smooth-recovered.png`, `reviewer-little-yogurt-teaspoon-accepted.png`, `reviewer-half-cup-carry-label.png`, `reviewer-two-half-cup-measures.png` and `reviewer-little-and-exact-recovered.png`. They show the acquired rigged cook/bowl, new venue landmarks, visible diced/roasted food and smooth blended output, task-bearing English/service briefs, correct measure labels, and recoverable outcomes. Runtime assertions still verify the 65-joint cook, exactly three clips and actual local prop.

No known functional or curriculum blocker remains in these tested paths. Browser coverage uses desktop normal-input campaign/error routes and opening-level touch controls; it does not establish every advanced layout on a physical phone, child engagement, learning gains, or audible sound quality through speakers. Station labels remain small at portrait scale. Full static-build/client measurements are owned by the lead and are reported separately.

Lead delivery verification: the final required web-game client reached active level 36 and its screenshot/state were inspected. Built-preview checks at levels 1 and 36 reported both local GLBs loaded, no browser errors, approximately 60.3 FPS and approximately 3.03 MB of initial responses on the tested desktop setup. Those measurements belong to the lead's static-build checks rather than this reviewer's phone-performance claim. All reviewer browsers are closed; final reviewer status is passed with 78 rule tests/typecheck and the independent normal-input recovery probes above.
