# Curated model library

28 October 2026. These are acquired, creator-supplied model assets. The previous handmade Three.js station/food/customer/venue shapes are superseded by this source library in the new scene integration. The source helper prepares models; composition, camera, lighting and final gameplay verification belong to the scene lead and reviewer.

## Sources and rights

| Asset family | Original creator/source | Acquisition | Rights evidence |
|---|---|---|---|
| Counters, sinks, stove/oven, cabinets, walls/windows/order hatch, tables/chairs, utensils, jars, crates, food states | [KayKit Restaurant Bits 1.0](https://github.com/KayKit-Game-Assets/KayKit-Restaurant-Bits-1.0) by Kay Lousberg | Official repository, commit `153c8a7535b48237854cb54ff6890679f8c574d1` | Original included CC0 text copied to `public/art/licenses/KayKit-Restaurant.txt` |
| Complete homes, taverns, markets, workshops, watermills/windmills, castle/walls/fences, trees and props | [KayKit Medieval Hexagon Pack 1.0](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0) by Kay Lousberg | Official repository, commit `84fa4e91af6a88989be7c99e0891cede11f2ca38` | Original included CC0 text copied to `public/art/licenses/KayKit-Medieval.txt` |
| Fruit/vegetables, loaf/slice forms, cups/spoons/oil bottle | [Kenney Food Kit](https://kenney.nl/assets/food-kit) | Public permitted [Hidencod/tge-assets mirror](https://github.com/Hidencod/tge-assets), commit `d4597ae135b1c2abe272da8f2b0797e10f06cb45` | Creator page states CC0; mirror preserves and dedicates its embedded-texture conversions as CC0 in `public/art/licenses/Kenney-mirror.txt` |
| Blender, toaster, furniture, potted greenery | [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) | Same pinned permitted mirror | Same CC0 evidence; original pack linked by mirror README |
| Lush tree crowns, shrubs, flowers and nature details | [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) | Same pinned permitted mirror | Same CC0 evidence; creator's [support/licensing page](https://kenney.nl/support) confirms asset-page models are public domain |
| Four customer character models | [Kenney Mini Characters](https://kenney.nl/assets/mini-characters) | Same pinned permitted mirror | Creator page states CC0; original skins retained and supplied idle pose applied for static customers |
| Moored rowboat | [Kenney Pirate Kit](https://kenney.nl/assets/pirate-kit) | Same pinned permitted mirror, `boat-row-small.glb` | Creator page explicitly states CC0; same mirror license |
| Whole cucumber and textured sliced pieces | [Grab3D Cucumber](https://grab3d.com/models/food/cucumber/) | Publisher's GLB download, with supplied license and origin manifest retained in ignored source cache | [Publisher license](https://grab3d.com/license/) is CC0; exact supplied text in `public/art/licenses/Grab3D-Cucumber.txt` |
| Box grater | [Innerscene Four Grate](https://www.innerscene.com/tools/library/3d-parts/four-grate-kitchen-tool-22c54bea) | Publisher's public GLB download | Source states original Innerscene model dedicated CC0; source URL/dedication recorded in `public/art/licenses/Innerscene-Four-Grate.txt` |

The three direct official Kenney archive URLs returned HTTP 403 in this session. No login, payment or access boundary was bypassed. The permitted public mirror was used with both creator CC0 evidence and its own conversion/license statement; it is not misrepresented as a direct official archive download. Original source files stay under ignored `work/vendor/` and are not vendor repositories committed to this game.

The cucumber publisher discloses that its detailed mesh/materials were built using Blender scripts with AI-assisted code, rather than generative-AI geometry. That origin is preserved verbatim in its license. It is a downloaded textured 7,228-triangle asset, not a plain runtime tube constructed by this game. The grater likewise is the publisher's detailed original GLB, not the game's former box-and-hole approximation. No new Tripo generation, purchase or upgrade occurred during this curation pass. The original user-owned Tripo cook and patterned bowl remain separate assets documented in `ASSETS.md`.

## Runtime contract

`src/model-library.ts` exports `ModelLibrary` and singleton `modelLibrary`:

```ts
await modelLibrary.load(import.meta.env.BASE_URL);
const instance = modelLibrary.create('kitchen/kitchencounter_straight_A');
const bounds = modelLibrary.bounds('kitchen/kitchencounter_straight_A');
```

`ready`, `names`, `error`, `has(name)` and `metadata(name)` are available. `create` returns a group centered in X/Z and floor-normalized to Y=0, while preserving the source hierarchy inside a placement wrapper. Every instance receives cloned geometry and an independent skeleton where present. Materials and textures are shared immutable data; scene code must not dispose them during instance cleanup. Original bounds and source hashes remain in metadata; normalized `bounds()` returns `{min,max,size}` tuples. For prepared pieces, fit using the maximum of all three dimensions, not only X/Z: grated carrot's long axis is Y in the source.

## Packaging and transformations

`node scripts/prepare-art.mjs` uses pinned glTF Transform 4.5.1 to read the ignored source cache, merge curated categories, deduplicate shared material/texture/accessor data and consolidate buffers. Seven self-contained GLBs and `public/art/manifest.json` are the runtime deliverables. They contain 314 independent templates and 17 explicit aliases, totaling 9,249,100 bytes before HTTP compression. No Draco, Meshopt or KTX2 decoder is required. Each named template remains independent; no whole-scene flattening collapses the kitchen doors or building hierarchy.

Food names preserve their meaning: `food/loaf` is whole bread and `food/bread` is one authored slice; bell pepper is `food/paprika` (`food/pepper` is an explicit alias). Existing authored half/slice/chopped models are used where provided. The cucumber source's whole/stem and three cut-piece components are separated without changing their textured cut surfaces. Banana peeled state is a disclosed cream-flesh recoloring derivative of the original banana mesh, without separately modeled peel flaps. Banana slices and diced/grated pieces are clipped from the source model and closed with cut surfaces derived from the intersection edges; they are not substituted primitive boxes or disks. Each metadata entry identifies its derivation.

Static customer models use the supplied first idle pose; unused motion clips are omitted, while original skin geometry remains. `SkeletonUtils.clone` provides independent instance skeletons. The static grater's detailed components are baked/joined by material to reduce draw calls while retaining the actual holes, handle and PBR surfaces.

## Verification and limits

The build script reopens each written GLB and writes `docs/art-evidence/source-model-validation.json` with checks of every named node, non-empty geometry, finite bounds and final hashes. It rejects changed bounds, missing templates or mismatching binary hashes. `node scripts/prepare-art.mjs --verify-only` runs those checks against the existing runtime files without reading the vendor cache or rebuilding any atlas. The final check passed for all 331 model keys. The source helper also ran TypeScript checking. Scene pixels and cooking/recovery/transfer/touch checks are the lead/reviewer's evidence; packaging success alone does not establish visual fidelity, frame rate or fun. The manifest records actual pack sizes and all source/final SHA-256 hashes. Source provenance is explicit, and final composition should be compared against the lead's new generated full-town target.
