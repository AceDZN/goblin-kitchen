# Asset provenance and acquisition status

## Current acquired assets — 26 October 2026

**Chrome recovery succeeded on root through native normal UI.** The prior access failures below are historical. Root is sole Chrome owner and coordinates the shared native UI lock; this helper performs local inspection only. Two original model generations have now been used out of the three-model allowance. Both required real local GLBs are now acquired: the cook with a real 65-joint skin and three full-body clips, and the original ceramic bowl/ladle prop. Local file inspection and lead integration checks are complete. The manifest points to both real runtime GLBs and the three exact clip names. Lead runtime hooks report `realCook: true`, `riggedCook: true`, 65 joints, 3 clips and `realProp: true`; inspected runtime images show the textured cook and bowl. The independent gameplay reviewer subsequently completed the final normal-input success/mistake/recovery/restart/transfer/touch regression, with all assets loaded and no page/console errors; details and limits are in `docs/REVIEW.md`.

### Original Goblin Kitchen cook generation and base reference

- Acquisition/source: signed-in user’s Tripo Studio, normal native Chrome UI. [Generation task](https://studio.tripo3d.ai/workspace/generate/189e84bb-b317-484b-a787-ac9d72af83aa), UI auto-name **green goblin character**.
- Creation: **H3.1 Best Quality, Image → 3D** from our original built-in-imagegen modeling reference `docs/visual-targets/cook-reference-01.png`. The exact modeling-reference prompt and mode are preserved in `docs/visual-targets/cook-reference-01-prompt.txt`. The older queued text prompt below was not submitted as a separate text-to-3D job.
- Rights/provenance basis: original art commissioned for this game, generated in the user’s own account from an original generated reference; no public-discovery model was reused.
- Shown generation cost: **30 credits**. Root observed account balance **6,705 → 6,675** for this action. Earlier parent balance 6,815 was momentary; intervening account activity is not attributed to this game.
- UI mesh statistics: **18,928 faces / 12,053 vertices**. Exported-file inspection reports the same 18,928 triangles and **12,070 uploaded vertices**, which is the actual local file’s exported count.
- Normal UI export: **GLB, 1k** to `/Users/acedzn/Downloads/goblin-kitchen-cook-base.glb`; preserved unchanged in ignored `work/tripo-originals/goblin-kitchen-cook-base.glb`.
- Base reference location: ignored `work/tripo-originals/goblin-kitchen-cook-base.glb`. The temporary public base candidate was removed after hash-verifying the preserved original. Only the final rigged cook is shipped.
- Bytes: **1,148,140** preserved original (1.15 MB decimal). No compression was needed to meet the 3 MB target, avoiding unnecessary texture/topology changes.
- SHA-256 of preserved base reference: `ab92ff9ad44821b231fc4b01b048f8445076c9917cd687da9575158b839f32cd`.
- Bounds: min `[-0.300262481, 0, -0.137786880]`, max `[0.300262481, 1, 0.137786880]`; dimensions **0.600524962 × 1 × 0.275573761** (x/y/z). No node transforms. Game scale remains the lead’s authored integration decision.
- File contents: glTF 2.0, generator `Tripo`, one mesh and material, three embedded 1024×1024 JPEG maps (base color, normal, metallic/roughness), no required extensions, **0 skins / 0 animation clips**. See `docs/art-evidence/cook-base-inspection.json`.

### Completed cook rig and local animated export

Root completed **Humanoid / Mixamo Auto Rig** at the same asset’s [rigging task](https://studio.tripo3d.ai/workspace/rigging/189e84bb-b317-484b-a787-ac9d72af83aa). Shown rig cost **20 credits**, observed balance **6,675 → 6,655**. Root visibly enabled the skeleton and inspected the full-body rig. The following motions were applied through normal Tripo UI:

- Preset **walk**, displayed duration **2.33 seconds**. Observed balance **6,655 → 6,635** after applying it.
- Preset **idle**, displayed duration **15.33 seconds**. No balance change was observed for this application, so no additional cost is asserted.
- AI carrying motion, explicit button cost **20 credits**. Prompt requested 5 seconds; generated output displayed **4.96 seconds**, UI label **Goblin Kitchen Walk**. Exact prompt:

> Goblin Kitchen carrying motion: walk steadily in place, holding an invisible mixing bowl with both hands in front at waist height. Elbows bent, palms facing up toward each other, arms stay steady, small relaxed steps, friendly cook, no turning, no jumping, no root travel. Seamless full-body loop.

Root selected export **GLB / 1k**, **Export Skeleton ON**, **Number Animations 3** (idle, walk, Goblin Kitchen Walk), **Animation Stay in Place ON**, filename `goblin-kitchen-cook-3anims`. The initial bounded 30-second check found no file. A later normal UI download succeeded to `/Users/acedzn/Downloads/goblin-kitchen-cook-3anims.glb`.

The acquired animated original is preserved unchanged at ignored `work/tripo-originals/goblin-kitchen-cook-3anims.glb`; the exact runtime copy is **`public/models/goblin-kitchen-cook.glb`**. Original and runtime copy are **1,921,716 bytes** each, SHA-256 **`5dab7524aa7723e78f943eb4993b188e78e6c991b6bd0d5fbb7c247d1fd3dca1`**. No compression was needed because this is below the 3 MB target, so topology, textures and animations remain exactly as exported.

Local GLB inspection confirms one `Armature` skin, **65 Mixamo joints**, and a skinned mesh with `JOINTS_0` and `WEIGHTS_0`. All 65 joint names are recorded in `docs/art-evidence/cook-rigged-inspection.json`; the skeleton includes hips, spine, neck/head, both legs/feet, shoulders/arms/hands and fingers. This is an actual skin/deformation asset, not a rigid root-only animation.

| Exact exported clip name | Duration | Channels / joint targets | Joints with varying keyframe output |
|---|---|---|---|
| `idle` | 15.333333 seconds | 195 channels targeting all 65 skin joints | 51 |
| `walk` | 2.333333 seconds | 195 channels targeting all 65 skin joints | 44 |
| `Goblin Kitchen carrying motion: walk steadily in place, holding` | 4.958333 seconds | 195 channels targeting all 65 skin joints | 22 |

Each clip has translation, rotation and scale tracks. “Varying” here means at least one output component differs by more than 0.000001 across keyframes; it distinguishes actual changing joint output from exported constant tracks. These file checks establish animation data and coverage. Lead runtime hooks subsequently confirmed the real rig and clips loaded, and runtime idle/hold/carry captures were inspected. The independent final browser regression subsequently verified clip selection on movement/carry/stop, pixel change during running motion, and frozen pixels/time during pause. It completed the five-shift slice with the real rig and prop; these are software checks, not an assessment of every possible animation pose or loop seam. The UI’s shorter `Goblin Kitchen Walk` label differs from the long exported carrying clip name above; integration should match the exported name.

Rest bounds: min `[-0.300262213, -0.000000262, -0.137786776]`, max `[0.300262451, 1, 0.137786895]`; approximately **0.600525 × 1.000000 × 0.275574** (x/y/z). There is one skinned mesh and material, **18,928 triangles / 12,053 exported vertices**, and three embedded 1024×1024 JPEG maps. No extensions or external texture/decoder dependencies are required. Animated pose bounds may differ from the rest bounds. The lead integrated this asset through the manifest and verified the real rig hook. The art helper did not change scene source or manifest.

### Completed original kitchen identity prop

[Prop generation task](https://studio.tripo3d.ai/workspace/generate/179b7552-48af-4177-8d6b-ca568ebc6a87), **H3.1 text generation**, displayed cost **30 credits**, observed balance **6,615 → 6,585**. After the earlier 43% progress observation, root completed and visually inspected the model in Tripo: cream ceramic bowl with blue painted herb motifs, brass rim and wooden ladle. Exact submitted prompt:

> Goblin Kitchen original game prop: one wide shallow cream glazed ceramic mixing bowl with an open empty interior, thin brass rim and simple hand-painted blue herb motifs. A small wooden ladle rests against the outside of the bowl. Warm worn ceramic, chunky stylized hand-painted fantasy game object, clean readable silhouette, no food, no liquid, no lid, no base, no table, no kitchen, no text, no logos.

Normal UI **GLB / 1k** export downloaded to `/Users/acedzn/Downloads/goblin-kitchen-bowl.glb`, preserved unchanged at ignored `work/tripo-originals/goblin-kitchen-bowl.glb`, exact runtime copy **`public/models/goblin-kitchen-bowl.glb`**. Original and runtime file are **838,320 bytes** each, SHA-256 **`7aa5155b84aac5d36037ade7f50af0d83504064ee0302d3150e78299b5ab97c5`**. No optimization was necessary to meet the size target.

Bounds: min `[-0.500000119, 0, -0.461761534]`, max `[0.500000119, 0.498474121, 0.461761534]`; dimensions **1.000000238 × 0.498474121 × 0.923523068**. No node transforms. File inspection confirms **18,732 triangles / 11,442 exported vertices**, one mesh/material, three embedded 1024×1024 JPEG maps, and no extensions, skins or animation clips. Tripo UI showed 11,133 vertices; the exported count above is the actual local-file count. This prop is correctly treated as static. Detailed file evidence: `docs/art-evidence/bowl-inspection.json`. Rights basis is the original game-specific prompt generated in the user’s own account, not public-discovery reuse.

### Current asset ledger

| Asset | State / local candidate | Rig / clips | Bytes / SHA-256 |
|---|---|---|---|
| Original cook base | Ignored `work/tripo-originals/goblin-kitchen-cook-base.glb`, reference only; not shipped | 0 skins / 0 clips in this base export | 1,148,140 / `ab92ff9ad44821b231fc4b01b048f8445076c9917cd687da9575158b839f32cd` |
| Cook rig/animations | Real acquired `public/models/goblin-kitchen-cook.glb` | 65-joint Mixamo skin + idle/walk/AI carrying clips; file verified and lead runtime hooks/images confirm loading | 1,921,716 / `5dab7524aa7723e78f943eb4993b188e78e6c991b6bd0d5fbb7c247d1fd3dca1` |
| Kitchen identity prop | Real acquired `public/models/goblin-kitchen-bowl.glb` | Static, no skin or clips | 838,320 / `7aa5155b84aac5d36037ade7f50af0d83504064ee0302d3150e78299b5ab97c5` |
| Architecture / exact portions | Original procedural Three.js geometry in source | Rigid authored geometry | In JS bundle |

The two intended runtime models total **2,760,036 bytes (2.76 MB)** before HTTP compression, comfortably below the 20 MB initial asset target. The unrigged base original is preserved only in ignored work data and is not shipped. All maps are embedded; Tripo is not needed at runtime.

Lead runtime images are preserved as `docs/art-evidence/runtime-idle.png`, `runtime-hold.png` and `runtime-carry.png`. The carried prop follows the midpoint of the actual hand bones. The AI carrying animation raises the hands to chest height, rather than the prompt’s waist-height wording; the held object now meets that grip. These are actual software captures, distinct from generated targets. Fresh independent captures in `docs/captures/reviewer-carry-banana.png`, `reviewer-carry-dish.png`, `reviewer-hatch-catch.png`, `reviewer-transfer-ready.png` and `reviewer-mobile-tray.png` were also visually inspected after the complete integrated regression: real cook/prop, bowl at hand grip below the face, visible catch, fruit above yogurt, and portrait tray controls are present.

Known Goblin Kitchen displayed/observed spend in this resumed pass: **30 cook generation + 20 rig + 20 walk application + 20 AI carrying + 30 prop generation = 120 credits**. Overall observed balance **6,705 → 6,585** across these actions. **Two of at most three original model generations used**; rig/animation processing is separate. No purchase, upgrade or other crew’s cancellation was performed.

## Historical initial boundary — 25 October 2026 (recovered on root)

At that initial pass, the required Chrome/Tripo acquisition workflow was **blocked by tool availability**. The following failure record is preserved as history; current acquisition status is above. The art owner attempted exactly this first entry call:

```js
let tab = await cua.createBrowserTab('chrome', 'https://studio.tripo3d.ai/assets', {sessionName:'👨‍🍳 Goblin Kitchen'});
```

It returned `MCP tool cua_repl/js is not available to the model`. The runtime subsequently removed the whole `mcp__cua_repl` namespace. No Chrome tab was created, no signed-in Tripo assets were inspected, no generation/rigging/animation job was submitted, no download occurred, and no credits were spent. Tool discovery showed no replacement Chrome-control tool. The lead retained the namespace and attempted the same required new Chrome-tab entry call; it reached a 40-second timeout and kernel reset. A subsequent root `getState` attempt also timed out after about 43 seconds and reset the kernel. A final root retry after host load recovered also timed out after about 32 seconds. The lead now owns any further Tripo UI attempts if that bridge recovers; the art helper will not drive the shared browser concurrently. This is not a demonstrated Tripo login, service or credit failure; those states could not be observed.

**Required deliverables missing at that point:** a real locally downloaded Tripo goblin GLB, its Tripo full-body rig and suitable animation clips, plus a Tripo kitchen prop GLB. Procedural scene meshes are original local geometry and do not satisfy those requirements. At that point there were no runtime GLBs in `public/models`. Original/optimized byte counts, SHA-256 hashes, task URLs/IDs, displayed credit costs and clip names are unavailable until acquisition succeeds.

## Approved acquisition plan

Only the art owner drives Tripo. Open a new Chrome tab named Goblin Kitchen, inspect My Assets first, and use only assets whose user ownership or reuse permission is established. Public discovery alone is not a license. Never navigate another crew's tab or cancel its job. Up to three new model generations, plus necessary rig/animation processing, are authorized using existing credits; no purchase, subscription or upgrade is authorized.

Priorities:

1. `public/models/goblin-cook.glb` — original full-body humanoid, clean A/T pose, full-body rig and suitable idle/walk/carry clips. Facial rigging is unnecessary because the game does not assess or require face animation.
2. `public/models/kitchen-bowl.glb` — cream ceramic bowl/pot with a ladle, static prop. A rigid prop is not described as rigged.

Initial queued text character prompt (not submitted; actual acquired model used image input):

> Goblin Kitchen original game character: friendly mischievous goblin street cook, single full body humanoid in a neutral A pose, large ears, short apron, bare hands, sturdy feet, stylized hand-painted game-ready mesh, no base, no kitchen, no text, clean separated limbs, animation-ready.

Initial proposed prop prompt (not submitted; superseded by actual submitted prompt above):

> Goblin Kitchen original game prop: one cream glazed ceramic mixing bowl with a brass-handled wooden ladle resting inside, chunky stylized hand-painted game-ready object, warm worn material, no food, no counter, no kitchen, no background mesh, no text, no logos.

Save downloaded originals outside the runtime public folder, preserve provenance, optimize to a target of at most 3 MB per model and 20 MB initial payload where practical, and record actual measurements. Character colliders and recipe quantities remain authored game state rather than generated mesh inference.

## Generated gameplay target

`docs/visual-targets/target-01.png` was generated by the lead with the built-in `image_gen` tool before implementation. The exact prompt and mode are saved next to it in `target-01-prompt.txt`. It is a generated design target, not proof of implemented gameplay and not a Tripo model asset.

## Historical asset ledger before recovery

| Asset | Source / rights basis | Local runtime path | Rig / clips | Bytes / SHA-256 |
|---|---|---|---|---|
| Goblin cook GLB | Pending required Chrome/Tripo acquisition | Missing | Missing | Not available |
| Kitchen prop GLB | Pending required Chrome/Tripo acquisition | Missing | Static prop planned | Not available |
| Kitchen architecture / exact ingredient portions | Original procedural Three.js geometry authored for this game | In source | Rigid geometry | Included in JS bundle |

Lead follow-up: a second independent entry, `await cua.getState()`, also timed out after 43 seconds and reset its kernel. This established an unchanged Chrome-control boundary; acquisition was not repeatedly retried. Still zero observed Tripo jobs, zero known credit use and zero downloaded models.

## Renewed acquisition pass — 26 October 2026

The human renewed this unfinished commissioned work. The parent confirmed native Chrome control can work through `cua.getApp('com.google.Chrome')` even when extension tab creation times out, and reported visibly signed-in My Assets with a momentary balance of 6,815 credits. That observation did not create a model, reserve credits, or fulfill acquisition.

On resumption the art helper still has **no `mcp__cua_repl` namespace**; discovery exposes no CUA/native Chrome tool in that helper. It made no native observation/input, acquired no UI lock and submitted no jobs. Per the renewed ownership handoff, the root lead is now sole Chrome asset owner where that native tool exists; the helper remains available for provenance, local GLB inspection/optimization and art evidence.

Before every root native Chrome observation/input, acquire the shared atomic directory lock `/Users/acedzn/dev/AceDZN-exp/.english-tripo-ui-lock`, write crew/owner and timestamp, and release only the owned lock after bounded work or while generation is processing. Never remove another crew's lock. The original game-specific allowance remains at most three new model generations plus required rig/animation processing, with zero Goblin Kitchen generations used before this resumed pass. No alternate service, raw API or token extraction is authorized.
