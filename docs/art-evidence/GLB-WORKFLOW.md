# Local Tripo GLB inspection and conservative compression

Prepared 26 October 2026. This does not acquire assets or submit Tripo jobs. The root lead is sole Chrome owner; the helper inspects only UI-downloaded local files supplied by that lead. Goblin Kitchen’s generation allowance remains at most three originals, with zero used before the resumed pass.

Tool: pinned `@gltf-transform/cli@4.5.1` from the official npm package. The installed CLI help was checked. Source documentation: [glTF Transform CLI](https://gltf-transform.dev/cli), [official package](https://www.npmjs.com/package/@gltf-transform/cli). No project dependency or lockfile edit is required for the commands below.

## 1. Preserve and inspect

Keep the normal-UI downloaded original in ignored `work/tripo-originals/` (or a lead-supplied existing download location), without overwriting it. Record source task URL/id, exact prompt, rights basis, shown generation/rig/animation costs, and acquisition date in `ASSETS.md` before claiming provenance. No absent data is inferred from the model.

```sh
npx --yes @gltf-transform/cli@4.5.1 inspect work/tripo-originals/cook-original.glb
shasum -a 256 work/tripo-originals/cook-original.glb
wc -c work/tripo-originals/cook-original.glb
```

Record scene bounds/dimensions, mesh/vertex/triangle/material/texture counts and extensions. Parse the GLB JSON chunk to list `skins`, joint count and names, animation clip names, channel target paths and duration from sampler input-accessor bounds. Confirm that required deformation clips target bones, rather than a single rigid root transform. Separate idle/walk/carry downloads must share a compatible skeleton; preserve clip names and verify their target bindings before merging or playback.

## 2. Produce a conservative first runtime candidate

Start by preserving topology, hierarchy, skinning and animation identity. Disable default simplification, flattening, instancing, mesh joining and palette generation. Resize textures to 1024 and encode WebP; keep an intermediate candidate outside `public` until visual and load checks pass.

```sh
npx --yes @gltf-transform/cli@4.5.1 optimize work/tripo-originals/cook-original.glb work/cook-candidate.glb --compress false --texture-compress webp --texture-size 1024 --simplify false --flatten false --join false --instance false --palette false
npx --yes @gltf-transform/cli@4.5.1 inspect work/cook-candidate.glb
shasum -a 256 work/cook-candidate.glb
wc -c work/cook-candidate.glb
```

`resample` remains enabled: the CLI describes this as lossless keyframe deduplication. Compare all source/candidate clip names, durations, channels, skin/joint counts and scene dimensions. Revert any candidate that loses necessary nodes or animation bindings. Inspect browser playback with the real loader before promoting the model to `public/models/goblin-cook.glb` or `public/models/kitchen-bowl.glb`.

## 3. Only if geometry size still requires it

Target at most 3 MB per asset and 20 MB total initial payload where practical; measure actuals. Draco is a later candidate, never an invisible default:

```sh
npx --yes @gltf-transform/cli@4.5.1 draco work/cook-candidate.glb work/cook-draco.glb --method edgebreaker
```

A Draco asset requires Three.js `DRACOLoader` connected to `GLTFLoader`, with local decoder files and their license copied from the pinned Three package. Available package decoders are `node_modules/three/examples/jsm/libs/draco/`. The lead owns that scene/loader change. Do not promote a Draco or Meshopt asset until its required decoder is present and browser loading is proven. Avoid Meshopt/KTX2 for this first pass unless an explicit local decoder setup is implemented. A larger uncompressed geometry file is preferable to a small asset that cannot load.

## 4. Acceptance evidence

- Actual original and final byte counts plus SHA-256 hashes.
- Tripo source/ownership, prompt, job identity, shown credits and rig/clip state.
- Runtime GLB paths and asset manifest updated only for real files.
- Browser model loads without console errors; bounds/scale/orientation are correct.
- Full-body idle/walk/holding/action playback verified through the real loader; static prop remains correctly described as static.
- Recapture matched gameplay and rerun success/mistake/restart/transfer/touch checks after integration. Optimizer output alone cannot prove animation or visual quality.
