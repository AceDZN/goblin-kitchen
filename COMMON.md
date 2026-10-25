# English 3D game crews — shared build contract

25 October 2026. Read this and your own BUILD_HANDOFF.md. The human user explicitly commissioned ten researched concepts, the best three to be built now, one builder crew per separate chat, browser-playable real 3D games for Hebrew-speaking Israeli grade-7/8 students. Workbook is their own curriculum project and content authority. They explicitly authorized public repositories under **AceDZN**, regular commits to **main**, gameplay target images through the **imagegen skill**, and finding/generating models through **their Chrome in Tripo Studio**, including rigging for animated characters. This is direct authorization to begin the scoped build; do not stop at a plan or ask for kickoff permission.

The user said:

> Don't forget to build it as real 3d fun games. Before starting development - generate 'game screenshots' images (real gameplay images using gpt-image through the imagegen skill) - then use tripo 3d to search/find or generate models, create the game, then review it in front of the 'screenshots' to really build the same gameplay ui/ux as it is in the planning and mockups.
> use my chrome browser tripo.ai to search for 3d models or create new 3d models. if the 3d model needs animation (like characters) - make sure to rig them in tripo (simple mixamo rigs for full body animation, more complicated rigs for stuff like rigging face animations - Tripo has many rigging options and pre-defined animation but also 'ai animations' for custom stuff).
> create it as a new public repo on my github (AceDZN). ... don't forget to commit your changes from time to time all to the same main branch for now (or open prs for side-tracks)

Generated images are **gameplay design targets**, not real screenshots of existing software. Label them truthfully. Final proof includes real browser captures of implemented gameplay.

## Isolation and ownership

| Crew | Standalone repository | Dev / preview |
|---|---|---|
| Goblin Kitchen | /Users/acedzn/dev/AceDZN-exp/goblin-kitchen | 5201 / 4201 |
| Clockwork Alibi | /Users/acedzn/dev/AceDZN-exp/clockwork-alibi | 5202 / 4202 |
| Rule Rascals | /Users/acedzn/dev/AceDZN-exp/rule-rascals | 5203 / 4203 |

Work only in your assigned repo, specifying that absolute workdir in shell calls. The Idea Plotter checkout is read-only research context. Do not edit its spec, web app, datasets, other handoffs, or existing prototypes. Do not use another crew's repo. Each repository has its own origin and main; verify before writing/pushing. Commit meaningful checkpoints and push main without force. Public-source assets and original content only; never commit secrets, browser sessions, node_modules, build/test output or vendor caches. The repository publication is authorized. Production deployment is future work.

Use strictPort and your assigned ports. Never kill a process you did not start. If the port is occupied, select an unused fallback and document it. Leave a dev server running for the user's playtest.

## Actual crew

The user asked for builder teams, so each lead should use two helper agents with clear ownership:

1. **Art and asset owner:** imagegen reference(s), Tripo acquisition/rigging in their own Chrome tab, ASSETS.md, model optimization and visual review. Own art/assets and agreed scene modules. This is the only role in your crew driving Tripo. The lead must complete and inspect a first imagegen target before implementation begins; delegates may produce a complementary target later.
2. **Independent English and gameplay reviewer:** read saved Workbook snapshots, validate sentence meaning, solvability, ambiguity and language-bypass risks, then exercise real browser success, failure and transfer cases. Own content fixtures/tests or review docs, not overlapping implementation files.

Lead owns gameplay integration, scheduling and Git commits. Assign non-overlapping files and serialize integration. Use inherited model settings unless the user asks otherwise. Keep all results in this chat and repo. Do not message other user chats; the parent will inspect your progress through app tools.

## Workflow order — required

1. Read your curriculum snapshots. Write GAME_IDENTITY.md: core verbs, 60-second action sequence, player decision, changing state, failure/recovery, win, camera, silhouette, materials, color and sound. The three commissions must stay mechanically and visually distinct.
2. Read `/Users/acedzn/.codex/skills/.system/imagegen/SKILL.md`. Use the built-in `image_gen` tool (discover through ALL_TOOLS if necessary), **not** another image generator or a one-off API runner. Generate at least one 16:9 gameplay UI target using your provided prompt **before implementation**. Inspect it. Copy final images from the tool-returned location into `docs/visual-targets/`, save exact prompts and mode. Prefer two shots covering the core interaction and a later state, but a good first target is enough to start. If built-in generation fails, document it and report the blocker; do not silently substitute CLI, nano-banana, SVG or a screenshot of an empty scaffold.
3. In **the user's Chrome**, inspect Tripo assets or discovery, then generate when an appropriate owned/permitted model is unavailable. URLs: https://studio.tripo3d.ai/assets ; https://studio.tripo3d.ai/?category=featured&model_type=all&page_type=1.2&recommended=recommended&use_case=all ; https://studio.tripo3d.ai/workspace/generate/ . Use `mcp__cua_repl` browser control and current documentation. Do not use raw Tripo APIs, token extraction, hidden browser state, or a different modeling service.
4. Start with a small Tripo asset set, acquire GLBs normally and integrate them. Only then implement a complete first playable challenge; expand after it works. Character deformation/full-body animation must use a Tripo rig and suitable animation. Use existing auto-rig options/Mixamo-style full-body rigs where supported. Facial rigging is needed only if facial animation is part of the design. A static prop may be rigid-body animated; don't call that a rigged character.
5. Build and play the full slice. Capture real gameplay and compare directly with the imagegen target: camera, scene occupancy, scale, materials, light, HUD hierarchy and visible verbs. Fix material mismatches and describe deliberate differences in VISUAL_REVIEW.md.

If a required external step blocks, continue useful independent work (content, tests, procedural level geometry) and clearly label missing assets. Do not claim the finished requirement is met with placeholders. Do not keep retrying an unchanging login/credit/error boundary.

## Shared Chrome and Tripo constraints

Other crews are using the same signed-in account. Open **your own tab** with a descriptive session name; only interact with tabs you created/claimed. Never navigate someone else's tab or cancel an existing generation. My Assets was accessible during planning; it showed existing assets and 7,855 credits, a momentary observation rather than a reserved balance. Existing unrelated generations were running; leave them alone.

Use existing available credits for the requested model generation. Planning limit: at most **three new model generations per game**, plus required rig/animation processing for those chosen characters. Read and record the displayed credit use. Never purchase credits, subscribe, upgrade or accept unexpected legal agreements. A credit/login blocker is a real limitation to report, not a reason to skip modeling silently. Existing assets must have usable provenance/rights; public discoverability alone is not a license.

Unique asset prompts start with your game name. Record task URL/id when exposed, acquisition path, prompt, license/ownership basis, original and optimized bytes/hash, rig/animation status, credits shown and actual runtime model path in ASSETS.md. Download through normal browser UI. Put runtime assets in public/models; target ≤3 MB per model and ≤20 MB initial download where possible; measure actual sizes. Optimize with reputable registry tools if needed. Procedural architecture, colliders, interaction markers, particles and HUD are appropriate; do not use generated mesh geometry as precise colliders or as authoritative game state.

## Technical scope

Vite + TypeScript + Three.js is the default real 3D engine. One main WebGL canvas, actual perspective/orthographic 3D geometry, depth, lighting, raycasting and shadows. Add a physics library only where needed; kinematic patrols and authored interactions are sufficient for the MVP. Pin/install from reputable registries and commit the lockfile. Relative Vite base and a static `npm run build` suitable for Vercel. No backend, authentication, runtime LLM, analytics or keys needed. Bundle fonts and models locally; don't require Tripo at runtime.

6–10-minute vertical slice: first useful action in 30 seconds, five authored escalating challenges, a final unaided transfer challenge with changed nouns/layout/facts, satisfying feedback and replay. A title screen, model viewer, quiz with a 3D background, or ten disconnected answer doors is not the requested game. Get one complete win/mistake/retry loop working before increasing scope. Online multiplayer is later; single-player must be fun now.

Keyboard and pointer controls plus usable touch, pause/resume/restart, mute and reduced motion, responsive resize, DPR cap ≤2, focus-loss pause, clear WebGL failure. Minimal HUD, readable scene; useful sound after a gesture. Measure FPS and download/bundle sizes before reporting them. Avoid CSS card dashboards around the game canvas.

Keep authoritative English content and game rules in pure TS modules independent of rendering; real tests cover sentence semantics, solvability and consequential mistakes. Do not build tests that just mirror code. Expose `window.render_game_to_text()` with current mode, objective, world state, learning facts, selected target and outcomes; expose deterministic `window.advanceTime(ms)` respecting pause. Do not test by injecting a win state.

Read `/Users/acedzn/.codex/skills/develop-web-game/SKILL.md`; use its existing Playwright action client after meaningful changes, inspect the actual screenshots, and repair console errors. Also play through the browser: complete success, recoverable mistake, pause/restart, hint, transfer level, mobile layout and visible Tripo model. Confirm shown state and text hook agree. Compare generated targets with actual gameplay, not just with your source code. Automation cannot establish fun or learning gains; report what it actually verified.

## English and Hebrew

Menus/onboarding/explanations in Hebrew; the task-bearing language in English. `lang=he dir=rtl` on Hebrew shells, explicit LTR/bdi for English text, numbers and controls. Use a bundled Hebrew font and keyboard controls that work with Hebrew keyboard layout (`event.code` when appropriate). Vocabulary meaning on demand, replayable audio with visible text; do not add a microphone requirement. No claim of speaking assessment without such an implemented and validated task.

Pause action pressure during reading and translation. Wrong actions should create visible, funny and recoverable consequences. Award action skill and language comprehension separately. Preserve English as essential information: no colored target beacons, complete answer icons, identical order every round or trial-until-green with no consequence. Check near-miss instructions and shuffled surface details. Hints and repeated successes cannot be counted as first unaided decisions.

Create CURRICULUM.md mapping each challenge to exact Workbook URL, intended skill, original English fixture, world outcome and misconception. Do not invent module IDs or claim Ministry approval. Ministry alignment is through Workbook's grade-specific scope and the 2020 junior-high action-oriented framework; A2 is junior-high exit level. New scenario sentences are ours. Content can be simplified for the slice, but semantic distinctions must stay accurate.

Log minimal local-only events (challenge, action, success, hint, retries, unaided flag); no personal student data or remote analytics. The final transfer level changes the context and withholds solution hints. A brief Hebrew explanation after an error can connect the visible event to the exact English phrase.

## Delivery

Keep progress.md with Original prompt and real progress; GAME_IDENTITY.md; docs/visual-targets with exact prompt(s) and built-in mode; ASSETS.md; CURRICULUM.md; VISUAL_REVIEW.md with target vs actual; PLAYTEST.md with commands/results/limits; README with run/controls/build status and Vercel instructions; committed lockfile, meaningful tests, real gameplay captures. Commit/push main at checkpoints. Final report: playable URL, public repo, what's complete, test evidence and remaining blockers. Keep working through the vertical slice; do not stop after research, a scaffold or first screenshot.
