# Goblin Kitchen · מטבח הגובלינים

A real 3D, single-player browser cooking game for Hebrew-speaking grade-7/8 learners. English recipes determine ingredient preparation, quantities and serving. Five finite shifts: banana/spoons, two concurrent slice/loaf orders, banana sequence/cup, player-prepared pear, and a new apple recipe in a changed kitchen.

**[Play locally](http://localhost:5201)** · [Public source](https://github.com/AceDZN/goblin-kitchen)

## Run

```sh
npm ci
npm run dev
```

Dev uses strict port **5201**; `npm run preview` uses **4201**. Vite serves on the local network too. No backend, API key or external runtime assets are required. `npm run build` creates `dist/` with relative asset paths. `vercel.json` supplies the static build/output settings; deployment is prepared, not performed.

## Controls

Click/tap a station to walk there, then choose its contextual action. WASD/arrow keys move; **E** uses the first nearby action; **Space** tosses a carried dish at SERVE; **P/Esc** pauses; **F** toggles fullscreen. Touch also has directional buttons.

FRUIT/BREAD/PEAR supply ingredients. PREP peels/slices or washes/cores/slices pears. MIX adds a carried ingredient; with empty hands, stir, lift the dish or remove one yogurt portion. YOGURT measures one portion with the selected tablespoon/cup. SERVE tosses the dish through the hatch and checks the recipe when it arrives. Rejected dishes return to MIX with their contents intact. WASH/RESET first discards a held item; with empty hands it empties and washes the bowl. A sliced loaf makes four slices: add two separately, park the leftovers on the MIX tray, and lift the dish. The two bread orders have separate bowls and trays. Retrieve parked ingredients or put a carried dish down at MIX to free your hands.

Read the recipe freely while action is paused. Hebrew vocabulary help pauses too and marks assistance. There is no failure timer. Cooking time and repairs are shown separately from first-attempt unassisted comprehension. Shift 1 is guided practice; the four later shifts form the unaided denominator. Help, mistakes and prior exposure remain recorded across restart. The last shift withholds recipe solution hints. English speech uses the browser's available English voice; visible text always remains. Mute and reduced motion are in the controls/pause menu. Events/results stay only in this browser's localStorage; no personal information or remote analytics.

## Status and evidence

The five-shift cooking loop uses real WebGL movement/collision, preparation states, measuring, stirring, order trays, visible toss/catch and recoverable mistakes. Reading/help/pause freeze the action, including airborne dishes.

The original Tripo cook and ceramic bowl are bundled locally. The cook has a **65-joint Mixamo skin** and three full-body clips: idle, walk and a custom carrying motion. Carried items follow the actual hand bones. The two GLBs total **2.76 MB**; no Tripo connection is needed to play. Architecture, exact portions and background customers use original procedural geometry. The final view preserves the warm kitchen palette while remaining simpler and more elevated than the generated target.

24 semantic/regression tests cover quantities, preparation, bread heads, transfer, recovery, assistance history and tray conservation. Browser verification and limits are recorded in `PLAYTEST.md` and `docs/REVIEW.md`.

- `docs/visual-targets/target-01.png`: generated design target, created before implementation; exact built-in imagegen prompt alongside it.
- `ASSETS.md`: original prompts, normal UI acquisition, credit records, hashes and actual rig/clip data.
- `CURRICULUM.md`: exact Workbook source links, original scenarios and limitations.
- `PLAYTEST.md`, `docs/REVIEW.md`: verification evidence and remaining limits.
- `VISUAL_REVIEW.md`, `docs/captures/`: target/actual comparison and real browser captures.

```sh
npm test
npm run typecheck
npm run build
```

The game is a curriculum-informed practice slice. No learning-gain, speaking-assessment or Ministry-approval claim is made.
