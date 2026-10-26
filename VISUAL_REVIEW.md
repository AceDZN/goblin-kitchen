# Generated target versus real gameplay

Independent art review, 26 October 2026, updated after actual Tripo model integration. The reviewer opened the image files and compared their pixels. Generated targets are concept evidence; runtime captures are software evidence.

## Evidence inspected

| Type | File | Visible state |
|---|---|---|
| Generated gameplay target | `docs/visual-targets/target-01.png` | Close oblique kitchen, cook carrying peeled banana, large ceramic bowl, rear customer counter, slim recipe strip |
| Actual integrated runtime capture | `docs/art-evidence/runtime-idle.png` | Detailed original Tripo cook standing on the floor; textured ceramic bowl/ladle at MIX |
| Actual integrated runtime capture | `docs/art-evidence/runtime-hold.png` | Cook holding a whole banana near FRUIT, with the real character mesh and changed arm pose |
| Actual integrated runtime capture | `docs/art-evidence/runtime-carry.png` | Cook carrying the banana between stations; prop at the actual hand grip |
| Final actual gameplay capture | `docs/captures/reviewer-carry-banana.png` | Actual rigged cook carrying a peeled banana between stations |
| Final actual gameplay capture | `docs/captures/reviewer-carry-dish.png` | Detailed bowl/ladle and food held in front of the body, below the face |
| Final actual catch capture | `docs/captures/reviewer-hatch-catch.png` | Accepted dish visibly reaches the waiting customer before the intermission |
| Final actual transfer capture | `docs/captures/reviewer-transfer-ready.png` | Real cook and patterned bowl, changed station layout, red apple pantry, two sliced apples above yogurt and readable three-tablespoon state |
| Final actual portrait capture | `docs/captures/reviewer-mobile-tray.png` | Full kitchen fit, real models, readable recipe, touch directions and four wrapped tray actions |
| Final actual completion capture | `docs/captures/reviewer-five-shifts-complete.png` | Five-shift result overlay over the implemented kitchen |

This art review uses saved captures rather than a separate live-browser session. Static images prove appearance at those moments; they cannot alone establish smooth animation, collision, semantic correctness or sustained performance. The independent gameplay reviewer completed the final integrated browser regression; its methods and limits are recorded in `docs/REVIEW.md`.

## Current asset and runtime status

The earlier missing-asset boundary has been resolved. Native Chrome acquisition produced two original local Tripo GLBs, now referenced by the runtime manifest. The cook has one actual skin with **65 Mixamo joints** and **idle, walk and AI carrying clips**. Local file inspection confirms bone tracks and `JOINTS_0` / `WEIGHTS_0`; the bowl/ladle is a textured static prop. Their combined payload is **2,760,036 bytes**, with embedded maps and no runtime Tripo dependency. Provenance, prompts, credits, hashes and exact clip names are in `ASSETS.md` and `docs/art-evidence/`.

Lead runtime hooks report `realCook: true`, `riggedCook: true`, 65 joints, 3 clips and `realProp: true`. The reviewer’s idle/hold/carry images and fresh complete-regression captures visibly confirm the original detailed cook and patterned bowl are in the implemented kitchen. This replaces the earlier primitive cook and procedural mixing-bowl appearance. Architecture, exact portions, colliders and customers remain authored procedural geometry by design.

## Target comparison

| Area | Generated target | Current inspected runtime | Assessment |
|---|---|---|---|
| Cook identity | Friendly green goblin, long ears, cap/apron, boots, warm textured fantasy style | Original detailed Tripo cook with those silhouette and material cues | Strong improvement and recognizable intended identity; the acquired model is visually integrated. The target character remains more prominently framed and expressive. |
| Full-body action | Carrying a peeled banana with bent arms | Real skinned idle/walk/carry assets; held banana now meets the midpoint of actual hand bones | The original floating-offset problem is corrected in the inspected ingredient/dish carry frames; the carried bowl stays below the face. The AI motion places hands at chest height, differing from the requested waist-height pose. |
| Kitchen prop | Cream glazed bowl with decorative rim and ladle | Real textured ceramic bowl with dark blue painted motifs, brass rim and wooden ladle at MIX | Required local identity prop is present and recognizable. It is correctly static, not described as rigged. |
| Materials | Worn planks, irregular cobbles, glazed ceramic, brass and rich surface variation | Visible wood grain, varied regular dark tiles, warm textured cook and ceramic bowl | Coherent palette and better material variety. Floor/counter architecture remains simpler and cleaner than the target. |
| Camera and scene occupancy | Close immersive crop, kitchen to frame edges, large foreground cook/bowl | Higher, wider orthographic overview of the complete detached kitchen with aubergine surround | Deliberate route-readability choice. It does not match the target’s close action scale or 80% playfield framing. |
| Bowl/food legibility | Large foreground bowl and clearly staged spoonfuls | Enlarged MIX bowl, label above rim; earlier captures show food raised above yogurt and a live bowl-state line | Preparation state is readable. Exact measured quantity is supplied by text plus fill/ingredient changes rather than individually countable spoonfuls in the bowl. |
| Customers and serving | Detailed customers directly behind a continuous rear counter | Simple goblin customers immediately behind the near-right SERVE hatch | Destination placement now reads as one action. Procedural customers and a side hatch are deliberate scope differences. |
| Lighting | Orange fire/lantern atmosphere, layered shadow and textured depth | Broad warm directional light, clear grounding shadows, simple glowing lamps | Readable and within the intended palette; less atmospheric than the target. |
| HUD | One slim cream recipe strip, tiny shift indicator, one contextual action | Larger LTR cream recipe panel with live bowl state, compact shift/tips, bottom contextual actions and Hebrew help | A deliberate readability/accessibility tradeoff. More screen space is used than in the target. |

## Reading and gameplay clarity

The actual scene preserves the intended open central route, raised stations, cream tools, warm wood and aubergine floor/surround. Whole and prepared food have distinct silhouettes. The refreshed wrong-amount gameplay state connects `3 tablespoons` in bowl state with feedback quoting the required `2 tablespoons` and a Hebrew recovery explanation. The final transfer capture shows changed station layout, a red-apple pantry, and two sliced apples above the yogurt in the acquired patterned bowl. These are concrete gameplay states rather than quiz-answer cards.

The refreshed 1280×720 captures resolved recipe-panel overlap with BREAD by narrowing the recipe to 300 pixels. Final portrait evidence after both real models load keeps every station on screen with a more direct elevated view. The recipe and contextual controls remain readable; all four MIX tray actions wrap within the bottom action area, and the carry label does not overlap them. World-space station labels remain small at portrait scale, so the larger contextual label is the useful reading surface.

## Final verification and remaining differences

The acquired character and prop satisfy the previously missing visual assets; no placeholder is claimed as their substitute. The overall diorama, procedural customers, broad lighting and wider camera remain substantially simpler than the generated target. Exact target fidelity is not claimed. The chest-height carrying pose is retained as a usable generated-motion limitation.

The independent gameplay reviewer records that `npm test` passed all 24 rule tests, typecheck passed, and the full `node scripts/browser-playtest.cjs` regression passed after real rig/prop integration with no page or console errors. Normal movement selected walk, holding selected the carry clip, and stopping selected idle. Runtime assertions confirmed the actual 65-joint rig, three clips and real prop. Rendered pixels changed during movement/animation and remained exactly stable during paused stepping.

That browser route completed all five shifts, both bread orders with parked leftovers, station relocation, wrong-amount hatch rejection/return/remove-one recovery, wrong-prepared-pear recovery, unaided changed-layout transfer, restart and portrait touch/tray controls. The art reviewer separately inspected the final carry, catch, transfer, mobile-tray and completion pixels listed above. The visible catch, transfer food surface and held-bowl grip agree with the intended physical actions.

No blocking visual defect was found in those final integrated captures. The target’s close framing, richer environment detail and more expressive customers remain beyond this finite slice. Portrait labels and the chest-height AI carry pose are known limitations. The minor RTL result-fraction issue was corrected with explicit LTR isolation; the reviewer reopened the refreshed completion capture and confirmed it visibly reads `3 / 4` correctly. Neither screenshots nor automated completion establish child engagement, fun, learning gains, physical-speaker audio quality or low-end physical-phone performance.
