# Verification · 28 October 2026

## Current campaign

The game now has **36 regular progressive levels, 60 orders, six venues, ten foods and five processing tools**. There is no school-grade selector or grade-based content limit. Success unlocks the next level; local progress stores completed levels, best stars and the last played level. Retry keeps the current level. A validated Workbook `?level=N` link can open any level 1–36 directly.

## Rule and progression tests

`npm test`: **78/78 pass**. Each of the 36 levels is solved through actual Kitchen actions, and a continuous 1→36 run ends only after the final feast. Coverage includes:

- All 60 courses have available ingredients, tools, liquids and units; counts are bounded, and all six venues have six levels.
- The five opening English fixtures are preserved; level 5 now continues to level 6.
- Ingredient identity, source counts, preparation, player-prepared referents and raw/toasted/roasted states remain consequential.
- Exact measures distinguish volumes/units and liquid identity; multiple liquids retain separate requirements.
- “A little” accepts small positive volume in available units, including teaspoons and equivalent mixed small units, without an unstated tablespoon-only rule. Oversized amounts still fail.
- Layer order, required blending, unwanted blending, additions after blending and explicit course order are tested with near misses and recovery.
- Trays conserve leftovers; rejected service preserves dish contents; restart/pause/help/history and duplicate service remain covered.
- Saved progress round-trips, clamps invalid values, unlocks the next level and preserves better replay records. Soft time targets never block completion.

`npm run typecheck` and `npm run build` pass. Vite continues to warn about the Three.js-containing chunk above 500 KB raw.

## Full browser campaign

`node scripts/campaign-playtest.cjs http://127.0.0.1:5201` **passed every level 1→36 and all 60 orders through normal pointer/keyboard controls**, with zero browser errors. The catalog supplies a cooking plan; no inventory, dish or win state is injected. `advanceTime` advances simulation time only.

The run used every tool and liquid, all six layout permutations and all six venues. It verified the initial 36-button map, the one-level new-save unlock, completion unlocking the next level, save/reload, continuation through the map, all 36 completed records, all unlocked replay buttons and a replay/reload of level 7. Both actual GLBs were loaded, with 65 cook joints. The test profile finished with 36 completed levels and 105 stars; that is a scripted test profile, not a student result.

Evidence: `docs/captures/campaign/` contains new/completed-save maps, ready dishes from levels 1/7/14/17/22/27/33/36 and each chapter's completion. Transient machine-readable results are in ignored `work/campaign-browser-results.json`. The test closes its own browser in `finally`.

After that continuous run, the “a little” volume rule and half-cup cup geometry were refined. The full rule suite and targeted browser/visual checks cover those refinements; the continuous route itself used the earlier strict-unit version and original cup cap. Valid solutions from that route remain accepted.

## Independent recovery and responsive checks

The committed `scripts/browser-playtest.cjs` retains the opening-five deliberate wrong-amount/pear, return flight, pause, recovery, tray and transfer cases while checking continuation to level 6. It also supplies independent normal-input probes for wrong layers (9), wrong service order/current retry (11), an unwanted blend (22), and flexible small yogurt versus exact broth quantity (28). The opening-five/mobile/layer-9 run passed. After correcting the UI retry guard for later host-deep-linked levels, `node scripts/browser-playtest.cjs --probes-only` passed service-order/retry 11, blend recovery 22, and flexible/exact quantity 28 with zero errors. Live half-cup and aggregate labels were asserted and captured. Details are in `docs/REVIEW.md`.

Art checks used normal controls to grate two carrots, slice an apple, measure yogurt, blend a held dish and put it down. The held/plated visuals both refresh to a smooth surface. Full versus half broth measures now have a real open cup interior and different visible liquid heights. Typecheck and the targeted cup capture check pass with zero errors.

At **390×844**, a late three-order recipe note scrolls within a compact cream panel, leaving stations tappable. Actual touch reached PANTRY, MEASURE and MIX in level 36; the header recipe control opened the full paused reading panel. The six venue captures, three visible bowls, food forms/heat, tools and touch evidence are in `docs/art-evidence/campaign/` and described in `VISUAL_REVIEW.md`.

The required installed web-game action client is used via the previously documented ignored `work/client-metal.mjs`, whose import resolution and Metal launch flags adapt the existing client to this host. The final run opened level 36, entered play and moved right; the lead inspected its screenshot/state showing `mode: play`, level36/36 and both real models. Its image is copied to `docs/captures/campaign/skill-client-level-36.png`. The committed campaign script supplies the complete normal-input route.

## Runtime and limitations

The original Tripo cook retains its 65-joint Mixamo skin and idle/walk/carry clips; the ceramic bowl/ladle remains the original local prop. Runtime GLBs are unchanged at **2,760,036 bytes** total. New foods, tools and venue decorations are original procedural geometry. No new Tripo credits or external services were used for the campaign expansion.

`node scripts/static-preview-check.cjs` checked the final built output at levels 1 and 36, both at 1280×720. Each short desktop sample measured approximately **60.3 FPS**, with zero errors and both real models. Initial encoded response bodies totaled **3,033,232 bytes (~3.03 MB)**; the complete static output is **3,798,348 bytes (~3.80 MB)**. Measurements/resources are saved in `docs/performance.json`. Dev 5201 and built preview 4201 remain available locally. Production deployment is separate.

Saved progress is local to this browser/device. Automated solvability and browser completion do not establish child engagement or learning gains. The implemented elevated diorama remains simpler than the generated targets. English speech depends on an installed browser voice; no microphone or speaking assessment is implemented. Physical-speaker audio quality and sustained performance on low-end phones are not established by the desktop checks.
