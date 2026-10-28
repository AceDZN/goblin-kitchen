# Generated target versus real gameplay

## Kitchen restoration — 28 October 2026

The user accepted the new surroundings but rejected the flattened kitchen and changed layout feel. The earlier all-course solver demonstrated solvability; it did not demonstrate preserved visual or play quality. That rejection supersedes the prior visual signoff below.

The current renderer restores the original three-quarter camera direction, separated workstation footprints and walkable gaps while retaining continuous town ground and all authored models. MIX has a substantial cabinet workbench again. Source cabinet materials receive an oak/walnut finish through a scoped renderer shader; geometry, UVs and external scenery remain authored assets. Pantry foods stand visibly above a shallow crate. The foreground house/tree and service frame no longer cover the customer area. The old floating base is not restored.

Readable English gets a reserved margin through camera framing, including portrait and short landscape, instead of forcing the recipe into a tiny card. Station labels are clickable. Preparation knife, blender and stirring contents move during their respective jobs and freeze with pause/reduced motion. The earlier dead `blender-rotor` lookup was removed. These are motions of actual source assets, not replacement appliance shapes.

Visual references are the original `target-01.png` and pre-overhaul `docs/captures/campaign/` for camera/depth, plus the retained `world-overhaul-target.png` for grounded surroundings. Actual current six-venue captures are in `docs/kitchen-restoration/captures/`; their inspected overview is `docs/kitchen-restoration/venues-review.jpg`. The full36-level/60-course normal-input replay and30 focused checks passed on907ca96. The lead inspected all60 detailed course crops and all six venue frames; the independent reviewer inspected restored depth/readability and actual tool motion. Complete instructions for level1 and all three level36 courses are visible at1440×900,960×600,844×390 and390×844. Scope and limits are recorded in PLAYTEST.md and `docs/kitchen-restoration/INDEPENDENT.md`. These are actual game captures; no concept image is presented as software.

## Historical world overhaul — 28 October 2026

The user rejected the isolated platform presentation and simple props. A new built-in-imagegen design target was generated and inspected before the overhaul (`docs/visual-targets/world-overhaul-target.png`; exact prompt beside it). It is a concept reference, not a software screenshot. The renderer now uses seven authored asset atlases, preserving the original rigged Tripo goblin and ceramic bowl. Provenance and preparation-state derivations are in ASSETS.md; file/node/bounds validation is in `docs/art-evidence/source-model-validation.json`.

The lead opened fresh actual browser captures for all six venues at1440×900, then corrected the dominant black checkerboard, off-camera surroundings, hidden water, roof support, initial cart collision, and preparation-state silhouettes. The kitchen has cream ceramic material, continuous counters with matching collision, real sink/faucet and oven models, plates and utensils. Continuous paving reaches the frame edges. Adjacent modeled buildings, seating, plants and customers establish a town rather than a suspended base. Garden Market has stalls/greenery; Harbour Canteen has an actual water surface/quay/boat; Rooftop Lab has a terrace with supporting exterior walls and neighboring roofs; the Royal Feast has castle architecture/banners.

Relative to the generated target, the implementation keeps a wider overhead view and compact note so all playable stations remain reachable. Its authored low-poly scenery is simpler than the concept's dense illustrated detail; exact target fidelity is not claimed. The goblin's generated carrying clip remains at chest height. These are implementation differences, not missing model placeholders. No primitive customer, home-built appliance or primitive ingredient is used as the visible substitute for the acquired assets. Surface meshes, liquid fills, colliders, labels and particles are ordinary engine geometry.

Final-source full-campaign captures are in `docs/captures/campaign-overhaul/`: all36 levels/60 courses passed normal controls with zero browser errors, warnings, failed requests or missing models. The lead opened the final full-frame60-course contact sheet and all five12-course food-detail sheets in `docs/art-evidence/world-overhaul/`, inspecting all60 after the chef-turn correction. Food silhouettes, liquids, multi-bowl/tray separation and the six surroundings agree with the captured state. Fresh portrait royal tools and844×390 controls were also opened: the8px carry/control gap is visible and stations remain clear; short-landscape ingredient text requires card scrolling or the full paused recipe. The true browser focus-loss probe and independent recovery cases passed. Full results are in PLAYTEST.md and the committed JSON reports. Old captures and reviews below are historical only.

## Historical first campaign scene pass — 28 October 2026

The campaign expansion uses the new built-in-imagegen target `docs/visual-targets/campaign-rooftop-target.png`, with exact mode/prompt in `campaign-rooftop-prompt.txt`. The lead generated and inspected it before expanded scene implementation; the art owner also opened it before changing `src/scene.ts`. It remains a generated design target, not a software screenshot. The original local Tripo cook, full-body rig/clips and patterned bowl are retained across the 36-level campaign. No new Tripo generation was needed for this pass.

The art owner opened actual gameplay captures for all six venues at 1440×900. Their physical palettes and backdrop geometry change visibly while the familiar station IDs, real cook and bowl remain consistent:

| Venue / actual capture | Visible chapter identity |
|---|---|
| `docs/art-evidence/campaign/venue-level-1.png` | Ember Alley: amber lanterns, brick hearth and striped awning |
| `docs/art-evidence/campaign/venue-level-10.png` | Bread Yard: bakery oven arch, flour sacks/wheat and warm ochre surfaces |
| `docs/art-evidence/campaign/venue-level-18.png` | Garden Market: green backdrop, leafy trellis and planter boxes; three separate order bowls |
| `docs/art-evidence/campaign/venue-level-23.png` | Harbour Canteen: blue/slate palette, dock posts, rope, sail and harbour-water edge; three bowls |
| `docs/art-evidence/campaign/venue-level-27.png` | Rooftop Lab: purple evening palette, orange skyline blocks, brass telescope-like vent and planters |
| `docs/art-evidence/campaign/venue-level-36.png` | Royal Feast: purple/cream palette, columns, crown relief and royal banners; three bowls |

### Functional visual states checked

Food geometry now distinguishes ten pantry foods, plus whole/peeled/sliced/prepared/diced/grated forms and toasted/roasted marks. MEASURE shows the currently available yogurt, broth and oil vessels; held cup, half-cup, tablespoon and teaspoon shapes differ. TOOLS gains a compact oven, grater, knife/dicing board and blender as those actions unlock. These are original procedural geometry, not additional acquired GLBs. Quantities, preparation and tool availability remain authoritative engine state rather than inferred mesh appearance.

A normal-input rooftop action check prepared two grated carrots and one sliced apple, added a cup of yogurt, lifted the actual bowl, blended it while held and put it down. The inspected `rooftop-before-blend.png`, `rooftop-blended-in-hands.png` and `rooftop-blended-plated.png` in `docs/art-evidence/campaign/` show visible pieces changing to a smooth surface, including refresh while the same dish remains held. `held-grated-carrot.png` shows the grater/tools context and carried preparation state. The renderer supports all three order bowls and each order's parked inventory independently, rather than assuming only two bowls. Machine-readable art evidence is `action-visuals.json`; no page or console errors occurred.

The cup mesh was subsequently refined to an open lathed wall with a bottom and brass rim. Full/half fill planes now sit at different visible interior depths, rather than hiding the half fill under a closed cylinder cap. A targeted normal-input broth-measure check passed and its browser closed with no errors; typecheck passed after this geometry-only change. Both full frames and native browser detail crops, `measure-cup*.png` and `measure-half-cup*.png`, were opened and inspected: the full amber surface sits near the rim, while the half measure exposes more cream interior wall. This refinement did not alter unit validation or campaign state. The art reviewer reported the ambiguous pre-correction inventory wording `1 ½ cup` to the lead for a separate text fix; the geometry captures preserve that pre-correction label.

After the portrait recipe adjustment, a fresh 390×844 touch check verified PANTRY, MEASURE and MIX taps at level 36. Computed `overflowY` was `auto`, maximum note height 202.56 pixels, client height 199 and scroll height 280: the long note scrolls within its background. The header's מתכון control opened the full paused reading panel. `royal-touch-fruit.png`, `royal-touch-yogurt.png`, `royal-touch-bowl.png` and `royal-mobile-full-recipe.png` were captured; `mobile-touch.json` records the CSS and touch results with no errors. This is browser touch emulation, not a physical-phone performance claim.

### Rooftop target comparison and limits

The actual rooftop preserves the target's purple/orange skyline cues, brass vent, planters, warm counters, ceramic bowl and visible tools. The generated target is much closer to the chef and more detailed; the implemented scene retains a wider orthographic kitchen overview, simpler procedural architecture/customers, brighter broad illumination and smaller tools. Exact target fidelity is not claimed. The final authored level 27 recipe uses grated carrot, apple and yogurt rather than the concept image's diced-carrot/broth sentence; the live recipe and engine agree, and the concept text is not presented as a gameplay fixture.

Typecheck passed after the scene expansion. The supplied develop-web-game client was executed against level 27; its SwiftShader `#cook` click timed out while waiting for stability and the resulting inspected capture remained in paused reading mode. The separate Metal browser art checks above reached gameplay and exercised the physical prep/blend and portrait paths. The lead subsequently reported a complete normal-input pass of all 36 levels / 60 orders, plus save/reload/replay/unlock checks with zero errors. That complete pass preceded the cup mesh-only refinement, which received its own focused capture/typecheck pass. Independent gameplay recovery probes are separate evidence. The following 26 October review is preserved as historical evidence of the initial five-shift slice, not proof of the entire expanded campaign.

## Historical initial integration — 26 October 2026

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

Final lead verification (28 October): the required Metal-adapted skill client reached active play at level 36; `docs/captures/campaign/skill-client-level-36.png` and its state were inspected. The final `reviewer-half-cup-carry-label.png` visibly reads “½ cup of broth” with a “Measure ½ cup” action, correcting the earlier ambiguous label. Built-preview screenshots at levels 1/36 show the final local models and venues; both short desktop samples measured about 60.3 FPS with zero errors. The implemented wider overview and simpler scenery remain deliberate differences from the generated target.
