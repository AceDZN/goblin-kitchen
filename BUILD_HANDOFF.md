# Goblin Kitchen — מטבח הגובלינים

Read COMMON.md first. Your repo: `/Users/acedzn/dev/AceDZN-exp/goblin-kitchen`. Dev 5201, preview 4201. Public origin is AceDZN/goblin-kitchen; verify it. You own this game only. Start building the playable slice in this chat with the screenshot-first and Chrome/Tripo workflow; two helper agents make your crew.

## The game

A fast, tactile 3D cooking game in a crooked goblin street kitchen. Player verbs: grab, carry, portion, peel/chop, stir, throw, serve, rearrange. An English recipe controls actual preparation state and quantities. Between shifts, move one station to improve the route. Keep a single-player path with no AI teammate necessary. Steam seeds: Overcooked! 2 (728880) and PlateUp! (1599600); abstract cooking chaos/layout optimization only, no copied content. Seed pair cosine .665; centroid NN .912, isolation 2.7%, crowded blend. Our design proposition is consequential English recipe use, not measured market novelty.

The first 60 seconds: freely inspect an English order while time is paused; pick up fruit with clear hand animation; peel at a station; move to a bowl; use a spoon twice; stir; throw the bowl through the service hatch; see goblins cheer and hear a satisfying service chime. An extra spoon turns the dish into an amusing wobble rather than a question popup; player can remove a portion or remake it. Beginning players can keep the action clock untimed; optional medal time measures cooking after reading.

## Visual identity

Warm burnt orange, deep aubergine, cream enamel and herb green; wood, brass and glazed ceramic. Oblique overhead camera at roughly 45 degrees, a rectangular kitchen filling most of the viewport. Chunky but textured food, visible prep changes and steam; strong directional lighting. The goblin has an expressive silhouette and a Tripo full-body rig for locomotion/holding. Avoid the other crews' teal station diorama and bright outdoor garden. Scene readability beats decorative props. HUD: tiny score and shift marker, one pinned English order, small contextual action prompt; Hebrew assistance can expand on request.

## Exact curriculum

Primary grade 7:

- https://english.workbook.co.il/grade-7/chapter-4/read-and-explain-a-recipe
- https://english.workbook.co.il/grade-7/chapter-4/how-much-do-we-need

Snapshots are in docs/curriculum. Learn imperative action/object, first/next/then/finally, prepared/unprepared state, counted food versus measured contents and containers. Measuring yogurt with spoons counts spoonfuls, not yogurt objects. “Some” does not specify an exact quantity; never fail a player for an unstated amount. Vocabulary is deliberately small. Do not claim much/many production has been taught just because the player counts food. If implementing supply questions, use meaningful answers such as taking the requested count of bottles versus measuring their contents, without turning the level into a grammar quiz.

## Five shifts, one level architecture

These are original scenario fixtures. Food state/amounts should be deterministic game units; do not present fantasy cooking as health advice.

1. **First bowl.** “Peel one banana. Put it in the bowl. Add two tablespoons of yogurt. Stir gently. Serve.” State: banana prepared before mixing; exactly two spoon portions. Guided first shift. Explain one phrase at a time while paused.
2. **Two of what?** Two concurrent orders: “Add two slices of bread” versus “Add two loaves of bread.” Loaves can be sliced at the board; a slice is not a loaf. Teach the countable head noun with a real, different object state. If too much modeled food is needed, use “two bottles of water” versus “two cups of water” with visibly labeled equal-size containers, and record the change.
3. **Order matters.** “First, peel the banana. Next, slice it. Then add one cup of yogurt. Finally, stir.” Unpeeled fruit cannot become the prepared ingredient; the board produces the state. Introduce an amusing moving counter/conveyor and one repositionable station, keeping language simple.
4. **Prepared ingredient.** Two pears: one washed/cored/sliced, one whole. “Use the pear that you prepared. Add a little yogurt. Stir gently.” No exact yogurt amount is required here; distinguish prepared fruit and instruction. A gentle stir can be a brief hold, not dexterity inaccessible to beginners. Use yogurt amount variation visually without scoring an unspecified exact number.
5. **Transfer shift, no answer hint.** New ingredient/order and changed station layout. “First, slice two apples. Put the slices in a clean bowl. Add three tablespoons of yogurt. Then stir and serve.” All necessary tools are present, and slicing does not change the intended apple-equivalent quantity. Vary an alternate valid order to prevent memorized item routes. No default highlighted correct ingredient; English specifies the goal. Ordinary vocabulary help can remain available but marks the attempt assisted.

First prove shift 1 fully including a wrong amount, visible explanation, recovery, serving, next shift and restart. Track recipe progress as states, not an arbitrary checklist that accepts an unprepared item. Avoid forcing an invalid strict ordering when the recipe leaves independent prep actions reorderable. Lead and reviewer may improve fixtures if they preserve the cited distinctions and document why.

## Tripo minimum assets

Use the user's Chrome, your own Tripo tab. Search owned assets first. Prioritize: (1) original goblin cook, one humanoid, neutral A/T pose, rig and suitable walk/idle/hold animation; (2) cooking pot or bowl with ladle; (3) ingredient basket/food prop if useful. At most three new model generations plus needed chosen-character rig processing; no credit purchases. Build counters, exact measuring vessels/colliders, food amounts and readable prep-state markers procedurally as needed. Download GLB, optimize and record in ASSETS.md. One real Tripo prop and a rigged cook are the minimum visual integration goal; don't silently replace either with primitives and call it finished.

Suggested character prompt: “Goblin Kitchen original game character: friendly mischievous goblin street cook, single full body humanoid in a neutral A pose, large ears, short apron, bare hands, sturdy feet, stylized hand-painted game-ready mesh, no base, no kitchen, no text, clean separated limbs, animation-ready.”

## Generate the gameplay target before implementation

Read the imagegen skill. Built-in tool. Copy the result to docs/visual-targets; save this exact prompt plus any revision.

> Use case: ui-mockup. Asset type: gameplay design target for a browser 3D cooking game, not marketing key art. Create a believable 16:9 in-game frame of Goblin Kitchen. An oblique overhead 3D camera shows a compact crooked street kitchen with a clear walkable floor, a chopping board on one side, measured yogurt spoons and a ceramic mixing bowl in the middle, a serving hatch and small goblin customers on the far edge. A friendly goblin cook is visibly carrying a peeled banana toward the bowl; prepared and whole ingredients have distinct shapes. Warm orange lantern light, aubergine shadows, cream enamel, worn wood, brass, green herbs. Strong readable silhouettes, polished browser-game rendering achievable with Three.js and a few game-ready models. One slim cream recipe strip in the upper left reads exactly “Peel one banana. Add two tablespoons of yogurt. Stir. Serve.” A small top-right HUD reads “SHIFT 1” and “2 / 3”. A tiny bottom interaction hint reads “E · Add”. The actual playfield occupies at least 80 percent of the frame. No title screen, browser frame, dashboard, quiz answers or decorative cards. All English text sharp and sparse. Show a real player action with clear spatial route and visible preparation state.

Optional second target: same kitchen later, a conveyor shifted, two dishes waiting and the cook throwing a finished bowl through the hatch. Preserve camera, HUD and palette; show the next mechanical state, not a different art direction. Generated targets must be labeled mockups; later compare with actual browser captures.

## Acceptance evidence

Real 3D kitchen movement and collision; contextual interactions; quantities/food state actually affect result; five shifts with a transfer; satisfying service and recoverable mistake; pause/read/restart and mute; keyboard and touch. Unit tests for quantities/container heads, state transitions and all recipe solutions. Playwright/browser win and wrong-amount/recovery/restart; actual screenshots include cook rig and Tripo prop in gameplay. VISUAL_REVIEW.md compares target and actual. Build/typecheck/tests pass, public main pushed, README states complete versus blocked. Keep working until the slice is playable.
