import test from 'node:test';
import assert from 'node:assert/strict';
import { Kitchen, freshDish, prepare, shifts, validateDish, type Dish } from '../src/recipes.ts';

function recipe(shift: number, order = 0) { return shifts[shift].recipes[order]; }
function bananaBowl(k: Kitchen) {
  k.take('banana'); k.board(); k.add();
}
function addYogurt(k: Kitchen, amount: number, unit: 'tablespoon'|'cup' = 'tablespoon') {
  k.tool = unit;
  for (let i = 0; i < amount; i++) { k.yogurt(); k.add(); }
}
function serve(k: Kitchen) { k.lift(); return k.serve(); }
function next(k: Kitchen) { k.next(); k.start(); }
function finishFirst(k: Kitchen) { bananaBowl(k); addYogurt(k, 2); k.stir(); assert.equal(serve(k), true); }
function finishBread(k: Kitchen) {
  k.take('bread'); k.board(); k.add(); k.add(); k.wash(); assert.equal(serve(k), true);
  k.take('bread'); k.add(); k.take('bread'); k.add(); assert.equal(serve(k), true);
}
function oneDish(form: 'whole'|'peeled'|'sliced'|'prepared', food: 'banana'|'apple'|'pear'|'bread' = 'banana', count = 1): Dish {
  return { ...freshDish(), items: [{ food, form, count }], stirred: true };
}

test('all five shifts can be completed by cooking actions, including the two different bread orders', () => {
  const k = new Kitchen(); k.begin(); k.start();
  bananaBowl(k); addYogurt(k, 2); k.stir(); assert.equal(serve(k), true); assert.equal(k.mode, 'between');
  next(k);
  k.take('bread'); k.board(); k.add(); k.add();
  assert.deepEqual(k.held, { food: 'bread', form: 'sliced', count: 2, preparedByPlayer: true });
  k.wash(); // discard the two carried leftovers, preserving the two plated slices
  assert.equal(k.dish.items.length, 2); assert.equal(serve(k), true);
  assert.equal(k.order, 1); assert.equal(k.mode, 'play');
  k.take('bread'); k.add(); k.take('bread'); k.add(); assert.equal(serve(k), true);
  next(k);
  k.take('banana'); k.board(); k.board(); k.add(); addYogurt(k, 1, 'cup'); k.stir(); assert.equal(serve(k), true);
  next(k);
  k.take('pear'); k.board(); k.add(); addYogurt(k, 3); k.stir(); assert.equal(serve(k), true);
  next(k);
  assert.equal(k.dish.clean, false); k.wash();
  for (let i = 0; i < 2; i++) { k.take('apple'); k.board(); k.add(); }
  addYogurt(k, 3); k.stir(); assert.equal(serve(k), true);
  assert.equal(k.mode, 'complete'); assert.equal(k.results.length, 5);
  assert.deepEqual(k.results.map(r => r.unaided), [false, true, true, true, true]);
});

test('exact spoon count rejects one and three tablespoons but accepts two', () => {
  const d = oneDish('peeled');
  for (const [amount, accepted] of [[1, false], [2, true], [3, false]] as const) {
    d.yogurt = [{ unit: 'tablespoon', amount }];
    assert.equal(validateDish(d, recipe(0)).ok, accepted, `${amount} tablespoons`);
  }
});

test('cup and tablespoon measures cannot be swapped by matching their raw counts', () => {
  const d = oneDish('sliced'); d.yogurt = [{ unit: 'tablespoon', amount: 1 }];
  assert.equal(validateDish(d, recipe(2)).ok, false);
  d.yogurt = [{ unit: 'cup', amount: 1 }];
  assert.equal(validateDish(d, recipe(2)).ok, true);
  d.yogurt.push({ unit: 'tablespoon', amount: 1 });
  assert.equal(validateDish(d, recipe(2)).ok, false);
});

test('a whole banana fails the peeled recipe, and a merely peeled banana fails the sliced recipe', () => {
  const d = oneDish('whole'); d.yogurt = [{ unit: 'tablespoon', amount: 2 }];
  assert.equal(validateDish(d, recipe(0)).ok, false);
  const peeled = oneDish('peeled'); peeled.yogurt = [{ unit: 'cup', amount: 1 }];
  assert.equal(validateDish(peeled, recipe(2)).ok, false);
});

test('banana prep requires peeling before slicing; apple slicing preserves source apple count', () => {
  const banana = { food: 'banana', form: 'whole', count: 1 } as const;
  const peeled = prepare(banana)!; assert.equal(peeled.form, 'peeled');
  const sliced = prepare(peeled)!; assert.equal(sliced.form, 'sliced'); assert.equal(sliced.count, 1);
  assert.equal(prepare(sliced), undefined);
  const apples = prepare({ food: 'apple', form: 'whole', count: 2 })!;
  assert.equal(apples.count, 2); assert.equal(apples.form, 'sliced');
});

test('two slices and two loaves are different counted objects', () => {
  const slices = oneDish('sliced', 'bread', 2);
  const loaves = oneDish('whole', 'bread', 2);
  assert.equal(validateDish(slices, recipe(1, 0)).ok, true);
  assert.equal(validateDish(slices, recipe(1, 1)).ok, false);
  assert.equal(validateDish(loaves, recipe(1, 0)).ok, false);
  assert.equal(validateDish(loaves, recipe(1, 1)).ok, true);
  const prepared = prepare({ food: 'bread', form: 'whole', count: 1 })!;
  assert.equal(prepared.count, 4); assert.equal(prepared.form, 'sliced');
});

test('two bread orders can be fulfilled in either order', () => {
  const k = new Kitchen(); k.begin(); k.start(); bananaBowl(k); addYogurt(k, 2); k.stir(); serve(k); next(k);
  k.selectOrder(1); k.take('bread'); k.add(); k.take('bread'); k.add(); assert.equal(serve(k), true);
  assert.equal(k.order, 0); assert.equal(k.mode, 'play');
  k.take('bread'); k.board(); k.add(); k.add(); k.wash(); assert.equal(serve(k), true);
  assert.equal(k.mode, 'between');
});

test('pear clause requires the player-prepared pear and a little permits multiple small positive amounts', () => {
  const d = oneDish('prepared', 'pear'); d.items[0].preparedByPlayer = true;
  for (const amount of [1, 2, 3, 4]) {
    d.yogurt = [{ unit: 'tablespoon', amount }];
    assert.equal(validateDish(d, recipe(3)).ok, true, `${amount} is not an exact hidden target`);
  }
  d.yogurt = []; assert.equal(validateDish(d, recipe(3)).ok, false);
  d.yogurt = [{ unit: 'tablespoon', amount: 5 }]; assert.equal(validateDish(d, recipe(3)).ok, false);
  d.yogurt = [{ unit: 'tablespoon', amount: 1 }]; d.items[0].preparedByPlayer = false;
  assert.equal(validateDish(d, recipe(3)).ok, false);
});

test('whole pear cannot substitute for the prepared pear even with correct yogurt', () => {
  const d = oneDish('whole', 'pear'); d.yogurt = [{ unit: 'tablespoon', amount: 2 }];
  assert.equal(validateDish(d, recipe(3)).ok, false);
});

test('transfer counts two source apples rather than an arbitrary number of slices', () => {
  const d = oneDish('sliced', 'apple', 2); d.yogurt = [{ unit: 'tablespoon', amount: 3 }];
  assert.equal(validateDish(d, recipe(4)).ok, true);
  d.items[0].count = 1; assert.equal(validateDish(d, recipe(4)).ok, false);
  d.items[0].count = 8; assert.equal(validateDish(d, recipe(4)).ok, false);
  d.items[0].count = 2; d.clean = false; assert.equal(validateDish(d, recipe(4)).ok, false);
});

test('the original fruit cannot be replaced by an old recipe ingredient in transfer', () => {
  const d = oneDish('sliced', 'banana', 2); d.yogurt = [{ unit: 'tablespoon', amount: 3 }];
  assert.equal(validateDish(d, recipe(4)).ok, false);
});

test('an excess spoon can be removed physically, then the dish must be stirred again', () => {
  const k = new Kitchen(); k.begin(); k.start(); bananaBowl(k); addYogurt(k, 3); k.stir();
  assert.equal(validateDish(k.dish, k.recipe).ok, false);
  k.remove(); assert.equal(k.dish.yogurt.length, 2); assert.equal(k.dish.stirred, false);
  assert.equal(validateDish(k.dish, k.recipe).ok, false);
  k.stir(); assert.equal(serve(k), true);
});

test('adding after an earlier stir invalidates that stir', () => {
  const k = new Kitchen(); k.begin(); k.start(); bananaBowl(k); k.stir(); addYogurt(k, 2);
  assert.equal(k.dish.stirred, false); assert.equal(validateDish(k.dish, k.recipe).ok, false);
  k.stir(); assert.equal(validateDish(k.dish, k.recipe).ok, true);
});

test('failed service changes the world and can be recovered by washing and remaking', () => {
  const k = new Kitchen(); k.begin(); k.start(); bananaBowl(k); addYogurt(k, 3); k.stir();
  assert.equal(serve(k), false); assert.equal(k.dish.clean, true); assert.equal(k.shiftMistakes, 1); assert.equal(k.mode, 'play');
  k.wash(); assert.equal(k.dish.clean, true); assert.equal(k.dish.items.length, 0);
  bananaBowl(k); addYogurt(k, 2); k.stir(); assert.equal(serve(k), true);
  assert.equal(k.results[0].unaided, false);
});

test('read and pause stop action time; play resumes it', () => {
  const k = new Kitchen(); k.begin(); k.tick(10); assert.equal(k.seconds, 0);
  k.start(); k.tick(3); assert.equal(k.seconds, 3);
  k.mode = 'pause'; k.tick(10); assert.equal(k.seconds, 3);
  k.start(); k.tick(2); assert.equal(k.seconds, 5);
});

test('help is recorded and assisted completion is separate from cooking success', () => {
  const k = new Kitchen(); k.begin(); k.start(); finishFirst(k); next(k);
  assert.equal(k.firstUnaided, true);
  k.help(); assert.equal(k.firstUnaided, false); finishBread(k);
  assert.equal(k.results[1].unaided, false);
  assert.equal(k.events.some(e => e.shift === 2 && e.action === 'vocabulary' && e.hint && !e.unaided), true);
});

test('transfer withholds recipe hints while keeping the English recipe intact', () => {
  assert.equal(shifts[4].hint, '');
  assert.match(recipe(4).text, /two apples/); assert.match(recipe(4).text, /clean bowl/); assert.match(recipe(4).text, /three tablespoons/);
});


test('restart does not restore first-attempt unaided credit after help or an earlier attempt', () => {
  const k = new Kitchen(); k.begin(); k.start(); finishFirst(k); next(k); k.help();
  k.restart(); assert.equal(k.events.at(-1)?.unaided, false); k.start(); finishFirst(k); next(k);
  assert.equal(k.assisted, false, 'current-run help and prior exposure are distinct');
  assert.equal(k.firstUnaided, false);
  assert.equal(k.events.at(-1)?.unaided, false, 'repeated-shift start agrees with eventual result');
  finishBread(k); assert.equal(k.results[1].unaided, false);
});

test('a served dish cannot be served twice for duplicate tips or completion records', () => {
  const k = new Kitchen(); k.begin(); k.start(); bananaBowl(k); addYogurt(k, 2); k.stir();
  assert.equal(serve(k), true);
  const tips = k.tips, results = k.results.length;
  k.start(); k.lift(); assert.equal(k.serve(), false);
  assert.equal(k.tips, tips); assert.equal(k.results.length, results);
});


test('guided first shift is practice, not an unaided comprehension result', () => {
  const k = new Kitchen(); k.begin(); k.start();
  assert.equal(k.firstUnaided, false); assert.equal(k.events.at(-1)?.unaided, false);
  finishFirst(k);
  assert.equal(k.results[0].guided, true); assert.equal(k.results[0].unaided, false);
});

test('a consequential error marks later events as corrected rather than first unaided', () => {
  const k = new Kitchen(); k.begin(); k.start(); finishFirst(k); next(k);
  assert.equal(k.firstUnaided, true);
  k.fail('Wrong bread form', 'two slices of bread');
  assert.equal(k.assisted, false); assert.equal(k.firstUnaided, false);
  assert.equal(k.events.at(-1)?.unaided, false); assert.equal(k.events.at(-1)?.retry, 1);
  k.log('retry-preparation'); assert.equal(k.events.at(-1)?.unaided, false);
});
