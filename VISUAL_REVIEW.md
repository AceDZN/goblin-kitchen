# Generated target versus real gameplay

Independent art review, 26 October 2026. Updated after final scene fixes and fresh captures. The reviewer opened the actual PNGs below with the image viewer and compared the pixels; the generated target is not represented as an implemented-game screenshot.

## Evidence inspected

| Type | File | Visible state |
|---|---|---|
| Generated target | `docs/visual-targets/target-01.png` | Close oblique kitchen view, cook carrying a peeled banana, large cream bowl, far service counter/customer row, sparse recipe strip |
| Actual browser capture | `docs/captures/reviewer-shift1-peel.png` | Shift 1 at PREP, a pale/yellow carried banana, contextual preparation control and held-item line |
| Actual browser capture | `docs/captures/reviewer-wrong-amount.png` | Shift 1 near SERVE, wrong-amount feedback quoting `2 tablespoons`, Hebrew recovery explanation |
| Actual browser capture | `docs/captures/reviewer-shift3-cup.png` | Shift 3 at MIX, moving counter visible, three contextual bowl actions, accepted cup scenario captured by gameplay reviewer |
| Final actual browser capture | `docs/captures/reviewer-transfer-ready.png` | Shift 5 with changed station layout and red apple pantry; two sliced apple equivalents, three tablespoons and stirred state visible in bowl-state text; food geometry above yogurt |
| Final portrait browser capture | `docs/captures/reviewer-mobile.png` | Whole kitchen fits portrait view, readable recipe, touch directions, action area and settings visible |

This review is based on these saved browser captures, not a separate live-browser run by the art reviewer. Gameplay correctness is documented by the independent gameplay reviewer and tests; a still image alone cannot prove animation, interactivity, semantic correctness or sustained performance.

## What carries across

The actual game has a real 3D oblique orthographic kitchen with visible depth, cast shadows, a walkable tiled floor, raised counters and recognizable food/tool props. Aubergine surrounds, warm wood/counter colors, cream bowls and green goblins preserve the intended palette. The center remains open enough to read routes. English recipe text is legible and explicitly LTR; the shift readout remains compact at the upper right, and contextual actions remain near the lower edge. The captured wrong-amount feedback connects an exact English phrase to a Hebrew recovery explanation.

The actual peeled banana has a pale curved body and yellow peel pieces. Whole fruit, prepared pieces, bread and measuring utensils use distinct silhouettes. A cream mixing bowl, yogurt vessel, prep board and service hatch are all visible. These are useful gameplay forms, although they remain simple procedural meshes.

## Material mismatches and unfinished requirements

| Area | Generated target | Actual inspected captures | Assessment |
|---|---|---|---|
| Cook and customers | Detailed expressive game-character meshes, clothing, full-body action silhouette | Simple primitive goblins, rigid visual forms and plain clothing shapes | Severe art gap. Required local Tripo cook, rig, deformation and suitable clips are missing. Procedural bobbing is not a substitute for a full-body rig. |
| Tripo kitchen prop | Textured ceramic/metal/wood objects | Procedural bowl, spoon and counters | Required real Tripo prop GLB is missing. Source geometry does not satisfy acquisition. |
| Materials | Worn plank grain, irregular cobbles, glazed ceramic and brass variation | Final captures show visible wood grain on tops and counter faces, varied dark floor blocks, cream bowls and brass trim | Clear improvement over the first review. Materials remain simpler and more regular than the generated target. |
| Camera and composition | Close, immersive crop with kitchen running to frame edges; big foreground bowl | More elevated, fully framed detached diorama; visible empty aubergine surround | Deliberate elevated gameplay camera improves route visibility, but target immersion and scene occupancy are not matched. |
| Bowl/action scale | Bowl and held banana dominate the foreground action | Final bowl is enlarged, MIX label sits above its rim, and apple/banana pieces stand above yogurt | Earlier overlap/readability problem is improved. The scene still favors a full kitchen overview rather than the target’s close foreground action. |
| Service destination | Customers directly behind a continuous rear counter | Final customers line up immediately behind the near-right SERVE hatch | Earlier disconnected placement is fixed. The side hatch differs deliberately from the target’s rear counter but now reads as one destination. |
| Light | Orange fire/lantern pools, warm depth and textured shadow breakup | Broad warm directional illumination with strong uniform shadows; simple glowing lamps | Readable and within the palette, but less atmospheric. No target-fidelity claim is justified. |
| HUD | Slim single-line recipe strip | Larger multi-line cream recipe panel, brand at left and bottom actions | Intentional readability/accessibility tradeoff for the full task text and Hebrew support. It occupies more space than the target. |
| Quantity feedback | Visible measured spoonfuls staged beside the bowl | Final cream recipe panel contains a live `IN BOWL` line with cleanliness, items, measured quantity and stirred state; food remains visible above yogurt | Explicit quantities and visible ingredient geometry substantially improve state legibility. Exact quantity is carried by readable state text, rather than individually countable spoonfuls in the bowl. |

The required Chrome/Tripo workflow remains blocked by the unavailable child tool and repeated root bridge timeouts/kernel resets. The lead’s second root `getState` attempt timed out after about 43 seconds; a final retry after host load recovered also timed out after about 32 seconds. No Tripo login state, credit balance or service error was observed, and no credits were spent. See `ASSETS.md` for exact acquisition evidence and queued prompts.

## Final visual pass

The reviewer reopened the fresh shift-1 peel, wrong-amount, transfer-ready and mobile captures after the scene changes. The three initially recommended improvements are visible: wood grain gives the counters a material read; the enlarged bowl and raised food surface make its contents legible; and customers now wait directly behind SERVE. The transfer capture shows a different route/layout and red apples at FRUIT, rather than the earlier banana-only pantry. The wrong-amount capture now pairs `3 tablespoons` in the live bowl state with feedback quoting the required `2 tablespoons`.

Portrait fitting now uses a more direct elevated view, keeping every station inside the screen. English recipe text, touch directions and the contextual action region remain legible. World-space station labels are very small at this portrait scale; the larger contextual station/action text is the more useful reading surface. The scene occupies a smaller fraction of portrait height than the generated landscape target, a practical fitting tradeoff rather than a fidelity match.

The lead then inspected refreshed `static-desktop.png` and `reviewer-1280-bread.png` at 1280×720. The recipe is now 300 pixels wide; the BREAD label is fully visible and the take-loaf control fits. The independent gameplay reviewer also verified the normal pointer route to BREAD in that viewport. This resolves the earlier recipe-panel occlusion.

## Deliberate differences versus acceptance gaps

An elevated orthographic view, simplified authored colliders, larger reading text, Hebrew help and no action timer are deliberate gameplay/accessibility decisions. Detailed Tripo character and prop acquisition and rig/animation integration remain unmet requirements. Final captures resolve the earlier bowl, pantry and customer-placement problems, while the diorama, lighting and character detail remain substantially simpler than the target. The final inspected captures do not match the generated target’s art quality and do not satisfy the minimum Tripo integration requirement.
