# Verification · 26 October 2026

## Result

All five shifts completed through normal browser controls with the final **real Tripo cook, 65-joint Mixamo rig, three motion clips and ceramic bowl** loaded. The independent regression verifies both desktop and touch. No inventory, recipe outcome or win state is injected; `advanceTime` advances simulation time only.

The renewed pass adds order trays, a hatch-targeted toss that awards success only on arrival, recoverable return flights, hand-bound carrying and consistent guided/unaided results. The mandatory Tripo acquisition/integration is complete. Original prompts, UI task URLs, actual file inspection, hashes and credit use are in `ASSETS.md`.

## Commands and checks

- `npm test`: **24/24 pass**. All five solutions, either bread-order sequence, counted heads, preparation states, cup versus tablespoon, source-apple quantities, clean bowl, player-prepared pear, multiple valid “a little” amounts, remove/restir and wash recovery, pause, assistance/restart history, duplicate service, guided-first-shift reporting, and tray conservation/occupied-tray refusal.
- `npm run typecheck` and `npm run build`: **pass**. Static relative-path output. Vite reports a JS chunk above 500 KB raw; measured compressed responses are below.
- `node scripts/browser-playtest.cjs http://127.0.0.1:5201`: **pass** after actual rig/prop integration. The script waits for both models, asserts 65 joints and exact three clip names, and completes the real gameplay route. It uses local Playwright and installed Chrome with Metal flags on macOS. Captures are in `docs/captures`; transient machine-readable results stay in ignored `work/reviewer-browser-results.json`.
- `node scripts/browser-playtest.cjs --focused`: earlier focused checks passed during the mechanics/base-model integration. The later full run supersedes that asset status.
- Built preview **4201** loads both GLBs and enters play with zero JavaScript/console errors. Dev **5201** remains running. Production deployment was not performed.

## Actual browser cases

The reviewer deliberately made the first recipe with three tablespoons. Tips/results remained unchanged during the outward flight. Midair pause froze the projectile and action time. The hatch rejected the dish, quoted “2 tablespoons”, and returned the bowl to MIX preserving its ingredients. Removing one portion invalidated the old stir; restirring and serving succeeded. A caught bowl and customer reaction appeared before the result overlay.

The bread shift used separate order bowls and trays. The reviewer parked two leftover slices, cooked the other order, retrieved the slices and served both orders without discarding the leftovers. Carry/tray labels correctly say “2 slices of bread”. The PREP counter was relocated before shift 3. Peeling then slicing a banana and measuring one cup solved that recipe.

The prepared-pear near miss was rejected; washing/remaking with a whole pear prepared by the player and two tablespoons recovered. The transfer changed station locations and pantry fruit, started with a dirty bowl, and accepted two sliced source apples, three tablespoons and a final stir after washing. Its wording permits preparing/adding each apple independently, without an unstated grouping constraint. The final transfer completed without help.

One final deterministic route recorded 285 tips, two intentional errors, guided shift 1, three first-attempt unaided later shifts out of four, and unaided transfer. Simulation times were approximately 86 / 73 / 45 / 100 / 95 seconds. These are scripted cooking times, not a student timing study.

## Rig, controls and responsive checks

Normal input selected **idle → walk → carrying** clips; the rendered scene was nonblank and changed during motion. Pausing held the canvas pixels and clock exactly unchanged. Separate file inspection establishes a real skin with weights and changing joint tracks. Fresh screenshots show the patterned bowl and carried items meeting the cook’s hands below the face. The AI clip carries at chest height; it does not exactly reproduce the requested waist-height pose.

Touch at **390×844** moved to stations and parked/retrieved ingredients. All four wrapped MIX buttons fit inside the viewport, and the carry label stays above the action area. Reading, vocabulary, pause, reduced motion and restart passed. Vocabulary marks assistance; restart preserves prior exposure. The completed-state header guard prevents reentering a finished shift. Final Hebrew result fractions use an explicit LTR isolation element.

Earlier normal-input exploration also verified keyboard movement, counter/wall collision, mute labels, fullscreen enter/exit and reading/help freezing. Actual audible sound quality and physical-device performance were not measured. English speech depends on an available browser voice; text remains visible.

## Required skill client

The installed `develop-web-game` action client was used. Its initial hardcoded SwiftShader launch stalled on this host. Ignored `work/client-metal.mjs` retains that client, changing only its Playwright import resolution and launch flags to Metal. The final action burst entered cooking and moved right, producing an inspected screenshot/text pair with both real models and 65 joints:

```sh
node work/client-metal.mjs --url http://127.0.0.1:5201 \
  --click-selector '#start-btn' \
  --actions-json '{"steps":[{"buttons":["left_mouse_button"],"frames":2,"mouse_x":790,"mouse_y":525},{"buttons":[],"frames":60},{"buttons":["right"],"frames":20},{"buttons":[],"frames":1}]}' \
  --iterations 1 --pause-ms 750 --screenshot-dir work/final-rig-client
```

The lead opened the resulting pixels and state; no error file was emitted. The committed normal-input script supplies the reproducible full route.

## Size and performance

The two runtime GLBs total **2,760,036 bytes**: cook 1,921,716; bowl 838,320. Each is below 3 MB, so original embedded 1k textures, geometry and animations were retained without a compression decoder. The unused base export is preserved outside the runtime folder.

A built-preview browser at **1280×720** counted **151 animation frames in 2.514 seconds: 60.1 FPS**, with both models loaded. Measured initial encoded response bodies totaled approximately **3.01 MB**, including local fonts and a duplicated favicon fetch; HTML adds about 0.5 KB. Exact resource measurements are saved in `docs/performance.json`. The JS bundle is approximately **694 KB raw / 180 KB gzip**. Complete static output is about **3.7 MB**, including unused font subsets. DPR is capped at 1.5, shadows at 1024, floor tiles are instanced, and paused scenes render only when necessary. This is a short desktop sample, not a sustained/mobile benchmark.

## Evidence and limits

Fresh captures include `reviewer-carry-banana.png`, `reviewer-carry-dish.png`, `reviewer-rig-walk.png`, `reviewer-rig-pause.png`, `reviewer-toss-midair.png`, `reviewer-return-flight.png`, `reviewer-hatch-catch.png`, `reviewer-tray-juggle.png`, `reviewer-transfer-ready.png`, `reviewer-five-shifts-complete.png`, `reviewer-mobile-tray.png` and `static-desktop.png`. Generated images in `docs/visual-targets` remain labeled design targets. `VISUAL_REVIEW.md` compares actual pixels with that target.

The game retains a simpler, more elevated diorama than the generated target. Background customers, architecture and exact food portions are procedural. No child engagement, learning-gain, speaking-assessment or Ministry-approval claim is made. No microphone or remote analytics is used.
