# Independent English and gameplay review

Reviewer owns this file, CURRICULUM.md and tests/recipes.test.ts. Source implementation and browser behavior must be checked after the lead provides the game/API.

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
