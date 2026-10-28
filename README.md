# Goblin Kitchen · מטבח הגובלינים

A real 3D cooking game with **36 progressive levels, 60 orders and six kitchens**. English recipes control physical ingredient preparation, quantities, tools, layers and serving. Players advance through the campaign; there is **no grade selector or grade-based level restriction**.

[Play locally](http://localhost:5201/) · [Public source](https://github.com/AceDZN/goblin-kitchen)

## The journey

| Levels | Kitchen | What grows harder |
| --- | --- | --- |
| 1–6 | Ember Alley | Peeling, slicing, counted heads, clean bowls, tablespoons/cups/teaspoons |
| 7–12 | The Bread Yard | Toasting, dicing, grating, mixed ingredients, layers and course order |
| 13–18 | Garden Market | Vegetables, half-cup measures, broth, roasting, blending, three orders |
| 19–24 | Harbour Canteen | Two liquids, three layers, smooth versus chunky, changed service requests |
| 25–30 | Rooftop Lab | Combined tools/forms, multiple dressings, tray planning and longer relays |
| 31–36 | The Royal Feast | Multi-course service combining exact states, heat, quantities, layers and methods |

Success unlocks the next level. The level map lets players replay unlocked levels. Completed levels, best stars and the last level persist on this browser/device. Retry restarts the **current** level and keeps campaign progress. The opening five recipes from the first release are preserved and continue into level 6.

One star is awarded for finishing, one for no corrections, and one for meeting a soft cooking-time target. Time cannot block progression, and reading pauses it. Vocabulary help records assistance separately from action stars. The opening level is guided practice; corrected/helped/repeated attempts do not count as first unaided comprehension.

## Controls and tools

Click/tap a station to walk there, then choose its contextual action. WASD/arrows move; **E** uses the first nearby action; **Space** tosses a carried dish at SERVE; **P/Esc** pauses; **F** toggles fullscreen. Touch has directional buttons.

- **PANTRY / BREAD:** take the food specified in the recipe; pantry choices include distractors.
- **PREP:** peel/slice fruit, prepare pears, slice vegetables or turn a loaf into four slices.
- **TOOLS:** dice/grate prepared food, toast sliced bread, roast sliced/diced vegetables, or blend a carried dish. Tools appear as the campaign introduces them.
- **MEASURE:** choose the liquid and tool, then measure one portion. Yogurt, broth and oil remain different contents; cup, half-cup, tablespoon and teaspoon remain different tools.
- **MIX:** add ingredients, stir, lift a dish, remove a liquid portion or park/retrieve ingredients on that order's tray. Each concurrent order keeps a separate bowl/tray.
- **SERVE:** toss the held dish through the hatch. Validation happens at arrival. Rejected dishes return to MIX for repair.
- **WASH / RESET:** discard a held item; with empty hands, empty/wash the active bowl. Use this to recover from a wrong ingredient, layer or unwanted blend.

The recipe button opens the full paused reading panel. The portrait live note scrolls to keep stations tappable. Hebrew help and replayable English speech support the English task text. Mute and reduced motion are available. No microphone, personal student data or remote analytics is used.

## Run and build

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
```

Dev uses strict port **5201**; `npm run preview` uses **4201**. No backend, API key or runtime model service is required. `dist/` uses relative paths and `vercel.json` supplies static build settings. Production deployment is separate.

The existing Workbook host bridge is preserved. `?level=N` opens any one-based campaign level from **1 to 36**, including a level not yet unlocked in the local save; it posts ready/start/complete events only to the validated host. No school-grade input controls this behavior.

## Art and evidence

The original Tripo cook has a **65-joint Mixamo skin** with idle, walk and custom carrying clips. Carried items follow its actual hand bones. The patterned ceramic bowl/ladle is also an original local Tripo asset. Both GLBs total **2.76 MB**. New foods, tools, colliders and six venue environments use original procedural geometry; Tripo is not needed at runtime.

78 rule/progression tests pass, along with the build and a full normal-input browser run of all 36 levels / 60 orders. Independent recovery, touch and save/replay checks are recorded in `PLAYTEST.md`.

`src/levels.ts` contains all authored tasks. `CURRICULUM.md` documents the original language scenarios and their source basis; advanced tasks extend that practice without claiming a grade-specific assessment. `PLAYTEST.md` records current verification and limits. `ASSETS.md` and `VISUAL_REVIEW.md` document provenance and generated-target versus actual evidence.

The campaign is open to any player progressing through it. Student engagement/learning gains and performance on low-end physical phones need separate playtesting; automated completion does not establish those outcomes.
