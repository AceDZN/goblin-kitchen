# Curriculum mapping

Goblin Kitchen uses original English scenarios based on the two saved Workbook lessons below. The sources are grade 7, Chapter 4. The slice is intended for Hebrew-speaking grade-7/8 learners; it does not claim to cover all grade-8 English, Ministry approval, measured learning gains, speaking assessment, or productive mastery of much/many.

- [Reading Recipes and Essential Steps](https://english.workbook.co.il/grade-7/chapter-4/read-and-explain-a-recipe): imperatives and objects; ingredient state; sequence; the referent of “the pear that you prepared.” Saved snapshot: `docs/curriculum/grade-7_chapter-4_read-and-explain-a-recipe.md`.
- [Food Quantities and Containers](https://english.workbook.co.il/grade-7/chapter-4/how-much-do-we-need): countable heads, slice/loaf distinction, measured contents versus containers, and non-exact quantity expressions. Saved snapshot: `docs/curriculum/grade-7_chapter-4_how-much-do-we-need.md`.

| Shift | Original English fixture | Intended interpretation | Consequential world outcome | Misconception checked | Workbook source |
| --- | --- | --- | --- | --- | --- |
| 1 · First bowl | “Peel one banana. Put it in the bowl. Add two tablespoons of yogurt. Stir gently. Serve.” | Follow imperatives; distinguish peeled from whole; measure two spoonfuls of yogurt. | One peeled banana and exactly two tablespoons can become a stirred dish; an extra spoon must be removed or the dish remade. | A food name alone is enough; any amount is acceptable; two tablespoons means two yogurt objects. | Both lessons |
| 2 · Two of what? | “Add two slices of bread. Serve.” / “Add two loaves of bread. Serve.” | The counted head noun controls what two names. | Two cut pieces and two whole loaves produce different valid dishes for the two orders. | Two of bread always means the same object quantity; slice and loaf are interchangeable. | Food Quantities and Containers |
| 3 · Order matters | “First, peel the banana. Next, slice it. Then add the slices and one cup of yogurt to the bowl. Finally, stir and serve.” | Sequence words and preparation states; a cup is a measured unit. | A whole unpeeled banana cannot become valid sliced banana; add yogurt before final stirring. | A sequence can be executed in any order; cup and tablespoon name equal portions. | Both lessons |
| 4 · Prepared ingredient | “Use the pear that you prepared. Put it in the bowl. Add a little yogurt. Stir gently and serve.” | A relative clause identifies a particular pear; a little names a small positive amount without an exact number. | Use the pear whose prior preparation is part of the player's history; accept multiple small yogurt amounts. | “That” refers to yogurt; any pear fits; a little secretly means exactly one spoon. | Both lessons |
| 5 · Transfer | “Slice two apples and put the slices in a clean bowl. Add three tablespoons of yogurt. Then stir and serve.” | Apply familiar verbs and measures to new nouns, changed stations and a clean-bowl condition without a solution hint. | Two source apples remain two apple-equivalents after slicing; three tablespoons and a final stir create the dish. | Count slices as apples; repeat banana route from memory; ignore clean. | Both lessons |

The quantity model uses deterministic fantasy cooking portions. It is not nutritional or health advice. Tablespoons count portions of yogurt, not countable yogurt objects. The bowl state records fruit identities/forms and units so the validator cannot award success for a visually similar wrong preparation.

English task text stays LTR within the Hebrew interface. Hebrew vocabulary/reading help pauses play and marks the attempt assisted. Reading the original English order is free and pauses action pressure. The final shift withholds recipe solution hints; ordinary vocabulary help, if used, records assistance. Skill/tips and language comprehension are separate outcomes. Retries cannot produce first-attempt unaided credit.

## Review status

This document specifies the accepted interpretation of the handoff. The implemented fixture for shift 3 makes the bowl action explicit: “First, peel the banana. Next, slice it. Then add the slices and one cup of yogurt to the bowl. Finally, stir and serve.” This removes an omitted destination without changing the intended sequence. Shift 4 adds “Put it in the bowl” and “serve” to make physical completion explicit. Implementation-level tests and browser evidence are recorded in `docs/REVIEW.md`. All 24 pure-rule tests pass; rendered play requires its own evidence.


## Guided practice and first-attempt evidence

Shift 1 includes default route guidance and is scored as guided practice. It does not count as unaided comprehension. The unaided summary covers the four later shifts. A shared firstUnaided rule requires a later shift, no current help or consequential mistake, and no prior assistance, mistake or repeated exposure for that shift. Events, results and the text hook use the same rule. Restart/reload does not restore first-attempt credit. English recipe audio repeats the source text rather than translating it; vocabulary help records assistance. The transfer retains no solution hint.

Parking an ingredient on its order's MIX tray does not change its count or preparation state. Two leftover bread slices remain two slices when retrieved; they cannot become loaves by switching orders. Tray inventory and both dish states persist independently, while recipe validation remains authoritative.


The final original transfer fixture joins slicing and placing with “and”: “Slice two apples and put the slices in a clean bowl. Add three tablespoons of yogurt. Then stir and serve.” This permits either apple to be prepared and added first without implying that both must be sliced before any slices enter the bowl. It retains two source apples, prepared slices, a clean bowl, three measured tablespoons and a stir after all additions. The route may change; the required food state and quantities do not.
