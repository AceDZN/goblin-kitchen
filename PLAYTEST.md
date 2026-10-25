# Verification · 26 October 2026

## Result

Five finite shifts are playable through the real 3D kitchen. The independent reviewer completed two full browser regressions using normal station clicks, action buttons, keyboard and touch. No inventory, recipe outcome or win state was injected. `advanceTime` only advanced the simulation clock, with the automatic clock disabled for deterministic runs.

**Required Tripo art is still blocked.** No actual GLB, Tripo rig or animation clip has been acquired. The visible cook/customers/props are original procedural stand-ins, with an explicit in-game note. This prevents full acceptance of the commissioned art workflow. See ASSETS.md and VISUAL_REVIEW.md.

## Commands and checks

- `npm test`: **19 / 19 passed**. All five solutions; both bread-order sequences; counted heads; whole/peeled/sliced state; tablespoons versus cup; two apple-equivalents after slicing; clean bowl; the player-prepared pear; multiple valid small yogurt amounts; wrong amount, remove/restir and wash recovery; pause time; assistance/restart history; duplicate-service regression.
- `npm run build`: **passed**, including TypeScript. Relative Vite base and static `dist` output. Vite warns that the Three.js-containing JS chunk exceeds 500 KB uncompressed; actual compressed initial traffic is below 0.25 MB on the measured local preview.
- `node scripts/browser-playtest.cjs http://127.0.0.1:5201`: **passed** during two complete final-verification regressions; the last includes relocated PREP and raised fruit. Requires installed Chrome, local Playwright dependency and Metal-capable macOS for the script's explicit hardware flags. The script closes its own browser. It saves captures in docs/captures and transient state in ignored work/.
- `npm run preview`: **running on strict port 4201**. A separate browser opened the built output, entered play, checked resources and console, and captured `static-desktop.png`. **Zero JavaScript or console errors** after adding a local favicon to fix observed 404s.
- Dev remains running on strict port **5201** for user playtesting. Production deployment was not performed.

## Actual browser cases

The reviewer walked to each station and prepared every dish. Three tablespoons were rejected for the two-tablespoon recipe, quoting “2 tablespoons”; removing one portion, stirring again and serving recovered the existing bowl. Two slices and two whole loaves satisfied separate concurrent orders. Banana peeling then slicing plus one cup completed shift 3. The prep station was physically relocated before that shift and the route remained solvable. A pear prepared by someone else was rejected; the reviewer washed/remade it using a whole pear they personally prepared and two tablespoons. The transfer shift changed pantry ingredients and station locations, started with a visibly dirty bowl, and accepted two sliced apples with three tablespoons after washing and stirring. Transfer completed without vocabulary help.

One scripted run recorded 285 tips, two intentional errors, three first-attempt unassisted shift results and an unassisted final transfer. Simulated cooking times were 84 / 74 / 44 / 99 / 94 seconds (395 seconds total); these are deterministic test times, not a measured student completion-time study.

Exploration covered keyboard movement, counter/wall collision, mute off/on, fullscreen enter/exit, reading and vocabulary freezing action time, assistance marking, pause/reduced motion/restart, and preventing header controls from reopening completed shifts. Restart preserves prior attempt history so a replay cannot mint first-attempt credit. A final copy review removed default Hebrew wording that disclosed the pear-selection answer.

Touch tests at **390×844** tapped FRUIT and took a banana; recipe, current contents, actions and directional controls fit. Portrait station labels remain small, with larger contextual actions. **1440×900** and **1280×720** captures were inspected; the compact recipe panel no longer hides BREAD. Both English task text and Hebrew support were checked visually. Fruit portions were raised above yogurt after a real capture revealed that they were submerged.

## Skill action client

The required installed client was run directly twice:

```sh
node /Users/acedzn/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js \
  --url http://127.0.0.1:5201 --click-selector '#start-btn' \
  --actions-json '{"steps":[{"buttons":[],"frames":1}]}' \
  --iterations 1 --pause-ms 250 --screenshot-dir work/client-02
```

Its hardcoded SwiftShader launch stalled, with 5-second click timeouts and no completed capture; those runs were stopped through their own sessions. A local copy in ignored `work/client-metal.mjs` retained the existing client and changed only its Playwright import resolution and launch flags to `--use-angle=metal --enable-gpu --ignore-gpu-blocklist`. It then produced inspected screenshot/text pairs, including `work/client-metal-play` and `work/client-final` in play mode with movement/collision. One late run warned that the initial click took longer than five seconds, but its saved state and screenshot confirmed it entered play. The complete browser flow uses the separately committed normal-input regression script.

## Measured size and performance

A built-preview browser at 1280×720, desktop Chrome with Metal, counted **151 actual animation frames in 2.504 seconds: 60.3 FPS**. A repeat sample was approximately 60 FPS. This is a short desktop sample, not a mobile or low-end benchmark. DPR is capped at 1.5, shadows at 1024, and floor tiles are instanced. Paused scenes render only when necessary.

The measured initial encoded response bodies totaled **248,691 bytes** (including duplicated favicon fetch and local fonts); HTML adds about 0.5 KB. Main JS: approximately **687 KB raw / 178 KB gzip**. Complete `dist` is about **1.0 MB**, including unused font fallbacks. Generated target images and QA screenshots are repository documentation and are not loaded by the game. Runtime GLB bytes: **0 because acquisition failed**, not because models were optimized.

## Captures and limits

Final real captures: `reviewer-shift1-peel.png`, `reviewer-wrong-amount.png`, `reviewer-shift3-cup.png`, `reviewer-transfer-ready.png`, `reviewer-five-shifts-complete.png`, `reviewer-mobile.png`, `reviewer-1280-bread.png`, `static-desktop.png` in docs/captures. The generated target and exact prompt are in docs/visual-targets and are labeled as a mockup.

No clipping of essential controls, JavaScript errors, stuck movement or duplicate-service scoring was found in the successful final checks. Tripo integration, detailed character animation, target-level art richness, sustained low-end/mobile performance, and child engagement/learning gains remain unverified or unfinished. Browser English speech depends on an installed English voice; visible text is always present. No microphone or speaking assessment is implemented.
