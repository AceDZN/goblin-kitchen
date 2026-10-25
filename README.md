# Goblin Kitchen · מטבח הגובלינים

A real 3D, single-player browser cooking game for Hebrew-speaking grade-7/8 learners. English recipes determine ingredient preparation, quantities and serving. Five finite shifts: banana/spoons, two concurrent slice/loaf orders, banana sequence/cup, player-prepared pear, and a new apple recipe in a changed kitchen.

**Playable locally:** http://localhost:5201 · Public source: https://github.com/AceDZN/goblin-kitchen

## Run

```sh
npm ci
npm run dev
```

Dev uses strict port **5201**; `npm run preview` uses **4201**. Vite serves on the local network too. No backend, API key or external runtime assets are required. `npm run build` creates `dist/` with relative asset paths. `vercel.json` supplies the static build/output settings; deployment is prepared, not performed.

## Controls

Click/tap a station to walk there, then choose its contextual action. WASD/arrow keys move; **E** uses the first nearby action; **Space** tosses a carried dish at SERVE; **P/Esc** pauses; **F** toggles fullscreen. Touch also has directional buttons.

FRUIT/BREAD/PEAR supply ingredients. PREP peels/slices or washes/cores/slices pears. MIX adds a carried ingredient; with empty hands, stir, lift the dish or remove one yogurt portion. YOGURT measures one portion with the selected tablespoon/cup. SERVE checks the recipe. WASH/RESET first discards a held item; with empty hands it empties and washes the bowl. A sliced loaf makes four slices: add two separately and discard leftovers at WASH before lifting the order.

Read the recipe freely while action is paused. Hebrew vocabulary help pauses too and marks assistance. There is no failure timer. Cooking time and repairs are shown separately from first-attempt unassisted comprehension. The last shift withholds recipe solution hints. English speech uses the browser's available English voice; visible text always remains. Mute and reduced motion are in the controls/pause menu. Events/results stay only in this browser's localStorage; no personal information or remote analytics.

## Status and evidence

The five-shift cooking loop is implemented with real WebGL geometry, movement/collision, preparation states, carrying, measuring, stirring, toss effects, recoverable errors, pause/restart and touch controls. All 19 semantic/regression tests pass, and independent normal-input browser playthroughs completed all five shifts with deliberate errors and recovery.

**A mandatory art requirement remains blocked:** Chrome control failed before Tripo could be inspected. The cook/customers and props currently use original procedural stand-ins. There are **no acquired Tripo GLBs, rig or animation clips**. The on-screen build note states this. The runtime model loader can read local paths from `public/models/manifest.json` once acquisition is possible. This is not a completed Tripo art integration or a faithful textured match to the target.

- `docs/visual-targets/target-01.png`: generated design target, created before implementation; exact built-in imagegen prompt alongside it.
- `ASSETS.md`: acquisition failures, ownership/provenance plan and missing asset ledger.
- `CURRICULUM.md`: exact Workbook source links, original scenarios and limitations.
- `PLAYTEST.md`, `docs/REVIEW.md`: verification evidence and remaining limits.
- `VISUAL_REVIEW.md`, `docs/captures/`: target/actual comparison and real browser captures.

```sh
npm test
npm run typecheck
npm run build
```

The game is a curriculum-informed practice slice. No learning-gain, speaking-assessment or Ministry-approval claim is made.
