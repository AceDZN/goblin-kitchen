# Target 01: implementation art notes

The art owner visually inspected `target-01.png`, generated with built-in imagegen before development. These are scene guidance, not assertions about the implemented game.

The scene's dominant read is a compact U-shaped kitchen around an uninterrupted walkable stone floor. The chopping board anchors the near left, a single large cream bowl the near right, the goblin crosses the central floor, and customers lean over the far service counter. Keep the center uncluttered so carrying, preparation state and the route remain visible.

## Practical Three.js translation

- Use an oblique view around 45 degrees, kitchen width about 14 world units and depth about 10.5. A more elevated orthographic camera than the generated target can improve floor readability but should preserve foreground bowl, left prep board and far hatch relationships.
- Aubergine/gray cobbles and grout should be broad irregular planes or shallow blocks with restrained value variation; avoid a uniform black floor or teal tiles. Suggested material colors: mortar `#45313e`, stone `#68505d`, wood `#80451f`, brass `#b2833b`, cream ceramic `#f2dfb2`, leaf green `#657b38`.
- Lanterns and a low hearth are orange emissive anchors, balanced by warm ambient/hemisphere light. Strong shadows should ground counters and the cook while preserving the floor. Too many hard point-light pools reduce readability and performance; one main warm directional shadow plus emissive accents can carry the look.
- Counters need thick tops and visible legs or aubergine masonry bases. Wood grain can be inexpensive restrained procedural texture; small contrasting strips communicate worn planks more clearly than lots of tiny props.
- The target's bowl is oversized and central to the action. Use a cream outer body, darker inner rim, visible food surface, and spoon/pour animation. Each measured portion should visibly add something. Prepared banana is pale curved flesh with yellow peel flaps; whole banana retains the yellow shell. Apple/pear chunks and whole fruit need different geometry at gameplay scale.
- The cook's long ears, green head, cream apron and short stocky shape must read at the gameplay camera. The required Tripo rig supplies body deformation; a rigid placeholder must remain labeled unfinished.
- The far-edge customers' upper bodies and empty plates create a destination without colored solution beacons. Tiny cheer bounces on accepted service communicate reward. Avoid decorating all four sides so heavily that the actual interactions disappear.

## UI hierarchy

The target uses one cream English recipe strip in the upper left, one tiny dark shift readout in the upper right, and one bottom contextual action. Hebrew help can expand into a paused reading layer. At rest, the scene should occupy at least 80% of the viewport. Task-bearing English must remain LTR; the Hebrew menu shell remains RTL.

## Compare actual captures

Check camera/scene occupancy first, then material palette/light, then goblin and held food silhouettes, then recipe/HUD hierarchy. Compare actual gameplay while carrying or measuring food, not a title screen. A deliberate simpler geometry style can be recorded, but missing local Tripo assets/rig are material unfinished requirements, not a stylistic difference.
