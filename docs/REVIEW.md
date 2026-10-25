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

18 tests passed with `npm test` using `tsx --test tests/*.test.ts`. Coverage: all five complete recipes through Kitchen action methods; reverse concurrent bread order; exact and wrong spoon amounts; cup versus tablespoon; peeled/sliced dependencies; apple source count; prepared pear; a-little amounts 1, 2, 3 and 4; dirty bowl; old ingredient in transfer; remove-and-restir recovery; adding invalidates prior stir; failed service and remake; read/pause time; assistance and restart history. These tests verify rules, not rendered play or learning gains.

## Browser review

Pending playable implementation. Required checks: all shifts; wrong amount and physical recovery; pause/read freeze; restart and assisted flags; transfer without answer hints; mobile controls; visible preparation changes; hook/render agreement; console errors.

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
