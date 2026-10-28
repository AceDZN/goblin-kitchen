import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../src/levels.ts';
import {Kitchen,ingredients,measures,validateDish,type Item} from '../src/recipes.ts';
import {newProgress,readProgress,completeLevel,totalStars,type LevelResult} from '../src/campaign.ts';
import type {Ingredient,Recipe} from '../src/catalog-types.ts';

const hand=(k:Kitchen)=>k.held;
function item(k:Kitchen):Item {const h=hand(k);assert.ok(h&&h.food!=='dish'&&h.food!=='yogurt','an ingredient is in the hands');return h as Item}
function prepareIngredient(k:Kitchen,req:Ingredient){
 k.take(req.food);assert.equal(item(k).food,req.food);
 if(req.form!=='whole'){
  const base=req.form==='diced'||req.form==='grated'?req.food==='pear'?'prepared':'sliced':req.form;
  for(let steps=0;item(k).form!==base&&steps<3;steps++)k.board();
  assert.equal(item(k).form,base,`base form for ${req.food}`);
  if(req.form==='diced'||req.form==='grated')k.process(req.form==='diced'?'dice':'grate');
 }
 if(req.heat==='toasted')k.process('toast');if(req.heat==='roasted')k.process('roast');
 assert.equal(item(k).form,req.form);assert.equal(item(k).heat??'raw',req.heat??'raw');
 if(req.prepared)assert.equal(item(k).preparedByPlayer,true);
}
function addIngredient(k:Kitchen,req:Ingredient){
 if(req.food==='bread'&&req.form==='sliced'){
  prepareIngredient(k,req);for(let n=0;n<req.count;n++)k.add();
  if(hand(k)){if(k.staged[k.order])k.wash();else k.stage()}
 }else for(let n=0;n<req.count;n++){prepareIngredient(k,req);k.add()}
 assert.equal(hand(k),null,'ingredient placed; surplus parked or discarded without emptying the dish');
}
function measure(k:Kitchen,liquid:'yogurt'|'broth'|'oil',unit:'tablespoon'|'cup'|'teaspoon'|'half-cup',amount:number){
 k.liquid=liquid;k.tool=unit;for(let n=0;n<amount;n++){k.yogurt();k.add()}
}
function build(k:Kitchen,r:Recipe,order?:Ingredient[]){
 const reqs=ingredients(r);const inOrder=order??(r.layers?r.layers.map(f=>reqs.find(i=>i.food===f)!):[...reqs].reverse());
 for(const req of inOrder)addIngredient(k,req);
 for(const m of measures(r))measure(k,m.liquid,m.unit,m.amount??2);
 if(r.blend){k.lift();k.process('blend');k.stage()}
 if(r.stir)k.stir();
}
function serve(k:Kitchen){k.lift();return k.serve()}
function solve(k:Kitchen){
 k.start();const order=k.spec.recipes.map((_,i)=>i);if(!k.spec.serveInOrder)order.reverse();
 for(const index of order){k.selectOrder(index);if(!k.dish.clean)k.wash();build(k,k.recipe);assert.equal(validateDish(k.dish,k.recipe).ok,true,`valid ${k.recipe.id}`);assert.equal(serve(k),true,`serve ${k.recipe.id}`)}
}

for(const [index,level]of levels.entries())test(`level ${index+1}: ${level.name} is solvable through real cooking actions`,()=>{
 const k=new Kitchen();assert.equal(k.enter(index),true);solve(k);
 assert.equal(k.shiftMistakes,0);assert.equal(k.dishes.every(d=>d.served),true);
 assert.equal(k.mode,index===35?'complete':'between');assert.equal(k.results.at(-1)?.shift,index+1);
});

test('one continuous run completes 36 regular levels and ends only after the royal feast',()=>{
 const k=new Kitchen();k.begin();let progress=newProgress();
 for(let index=0;index<36;index++){
  assert.equal(k.shift,index);solve(k);const result=k.results.find(r=>r.shift===index+1)!;
  progress=completeLevel(progress,result,36);assert.equal(progress.unlocked,Math.min(36,index+2));
  if(index<35){assert.equal(k.mode,'between');k.next();assert.equal(k.mode,'read')}
 }
 assert.equal(k.mode,'complete');assert.deepEqual(k.results.map(r=>r.shift),Array.from({length:36},(_,i)=>i+1));
 assert.equal(k.results[0].guided,true);assert.equal(k.results.slice(1).every(r=>r.unaided),true);
 assert.equal(Object.keys(progress.completed).length,36);assert.equal(progress.unlocked,36);assert.equal(totalStars(progress),108);
 const finished=k.shift;k.next();k.start();assert.equal(k.shift,finished);assert.equal(k.mode,'complete');
});

test('the campaign has six venues of six levels, bounded tasks, distinct challenges and stocked stations',()=>{
 assert.equal(levels.length,36);assert.deepEqual(Array.from({length:6},(_,v)=>levels.filter(l=>l.venue===v).length),[6,6,6,6,6,6]);
 const ids=new Set<string>(),signatures=new Set<string>();
 for(const l of levels){
  assert.ok(l.recipes.length>=1&&l.recipes.length<=3);assert.ok(l.pantry.length<=5);assert.equal(new Set(l.pantry).size,l.pantry.length);
  assert.ok(Number.isFinite(l.targetSeconds)&&l.targetSeconds>0);assert.equal('grade'in l,false);
  if(l.serveInOrder)assert.ok(l.brief,'service order is stated, never hidden');
  for(const r of l.recipes){assert.equal(ids.has(r.id),false);ids.add(r.id);for(const i of ingredients(r)){assert.ok(l.pantry.includes(i.food));assert.ok(i.count>=1&&i.count<=3)}}
  signatures.add(JSON.stringify({r:l.recipes.map(({id,text,title,...r})=>r),ordered:!!l.serveInOrder}));
 }
 assert.equal(signatures.size,36);assert.deepEqual(levels.flatMap((l,i)=>l.guided?[i+1]:[]),[1]);
 assert.deepEqual(levels.flatMap((l,i)=>l.transfer?[i+1]:[]),[5]);assert.equal(levels[4].dirty,true);assert.equal(levels[4].hint,'');
});

test('the five opening English fixtures remain exact while the campaign continues',()=>{
 assert.deepEqual(levels.slice(0,5).map(l=>l.recipes.map(r=>r.text)),[
  ['Peel one banana. Put it in the bowl. Add two tablespoons of yogurt. Stir gently. Serve.'],
  ['Add two slices of bread. Serve.','Add two loaves of bread. Serve.'],
  ['First, peel the banana. Next, slice it. Then add the slices and one cup of yogurt to the bowl. Finally, stir and serve.'],
  ['Use the pear that you prepared. Put it in the bowl. Add a little yogurt. Stir gently and serve.'],
  ['Slice two apples and put the slices in a clean bowl. Add three tablespoons of yogurt. Then stir and serve.']
 ]);
});

test('each concurrent course has a distinct physical answer, including same-ingredient contrasts',()=>{
 for(const [index,level] of levels.entries())for(const [order,recipe] of level.recipes.entries()){
  if(level.recipes.length===1)continue;
  const k=new Kitchen();k.enter(index);k.start();k.selectOrder(order);build(k,recipe);
  assert.equal(validateDish(k.dish,recipe).ok,true,`own course ${index+1}/${order+1}`);
  for(const [other,otherRecipe] of level.recipes.entries())if(other!==order)
   assert.equal(validateDish(k.dish,otherRecipe).ok,false,`level ${index+1}: ${recipe.id} must not satisfy ${otherRecipe.id}`);
 }
});

test('half a cup cannot be replaced by one cup with the same raw count',()=>{
 const k=new Kitchen();k.enter(13);k.start();for(const req of ingredients(k.recipe))addIngredient(k,req);
 measure(k,'broth','cup',1);k.stir();assert.equal(serve(k),false);assert.equal(k.shiftMistakes,1);
 k.remove();measure(k,'broth','half-cup',1);k.stir();assert.equal(serve(k),true);
});

test('two liquids retain independent quantities rather than a shared total',()=>{
 const k=new Kitchen();k.enter(19);k.start();addIngredient(k,ingredients(k.recipe)[0]);
 measure(k,'broth','half-cup',2);measure(k,'oil','teaspoon',1);k.stir();
 assert.equal(k.dish.yogurt.reduce((n,m)=>n+m.amount,0),3);assert.equal(validateDish(k.dish,k.recipe).ok,false);
 k.remove();k.remove();measure(k,'oil','teaspoon',2);k.stir();assert.equal(validateDish(k.dish,k.recipe).ok,true);
});

test('the correct unit and quantity with the wrong liquid is consequential and recoverable',()=>{
 const k=new Kitchen();k.enter(19);k.start();addIngredient(k,ingredients(k.recipe)[0]);
 measure(k,'yogurt','half-cup',1);measure(k,'oil','teaspoon',2);k.stir();assert.equal(serve(k),false);
 k.wash();build(k,k.recipe);assert.equal(serve(k),true);assert.equal(k.results[0].unaided,false);
});

test('grated and diced carrots are different final states',()=>{
 const k=new Kitchen();k.enter(9);k.start();const r=k.recipe;
 addIngredient(k,ingredients(r)[0]);k.take('carrot');k.board();k.process('dice');k.add();measure(k,'yogurt','tablespoon',1);
 assert.equal(validateDish(k.dish,r).ok,false);k.wash();build(k,r);assert.equal(serve(k),true);
});

test('roasting is required separately from slicing and whole bread cannot be toasted',()=>{
 const k=new Kitchen();k.enter(14);k.start();for(let n=0;n<2;n++){k.take('potato');k.board();k.add()}measure(k,'oil','tablespoon',1);
 assert.equal(serve(k),false);k.wash();build(k,k.recipe);assert.equal(serve(k),true);
 const toast=new Kitchen();toast.enter(6);toast.start();toast.take('bread');toast.process('toast');
 assert.equal(item(toast).form,'whole');assert.equal(toast.shiftMistakes,1);toast.board();toast.process('toast');assert.equal(item(toast).heat,'toasted');
});

test('correct ingredients and amounts still fail when explicit layers are reversed',()=>{
 const k=new Kitchen();k.enter(32);k.start();build(k,k.recipe,ingredients(k.recipe));
 assert.equal(validateDish(k.dish,k.recipe).ok,false);assert.match(validateDish(k.dish,k.recipe).phrase,/bread.*carrot.*potato/);
 k.wash();build(k,k.recipe);assert.equal(serve(k),true);
});

test('adding after blending invalidates the blend and the whole dish can be blended again',()=>{
 const k=new Kitchen();k.enter(16);k.start();for(const req of ingredients(k.recipe))addIngredient(k,req);
 k.lift();k.process('blend');k.stage();assert.equal(k.dish.blended,true);measure(k,'yogurt','half-cup',1);
 assert.equal(k.dish.blended,false);assert.equal(k.dish.stirred,false);assert.equal(validateDish(k.dish,k.recipe).ok,false);
 k.lift();k.process('blend');assert.equal(k.serve(),true);
});

test('stirring a chunky soup and blending a smooth soup are not interchangeable',()=>{
 const k=new Kitchen();k.enter(21);k.start();k.selectOrder(1);build(k,k.recipe);
 k.lift();k.process('blend');assert.equal(k.dish.stirred,true);assert.equal(k.dish.blended,true);assert.equal(k.serve(),false);
 k.wash();build(k,k.recipe);assert.equal(serve(k),true);
 k.selectOrder(0);for(const req of ingredients(k.recipe))addIngredient(k,req);measure(k,'broth','half-cup',1);k.stir();
 assert.equal(validateDish(k.dish,k.recipe).ok,false);k.lift();k.process('blend');assert.equal(k.serve(),true);
});

test('blending destroys the explicit layers of a stack and washing is required to rebuild it',()=>{
 for(const index of [25,32]){
  const k=new Kitchen();k.enter(index);k.start();build(k,k.recipe);
  assert.ok(k.recipe.layers);assert.equal(validateDish(k.dish,k.recipe).ok,true);
  k.lift();k.process('blend');assert.equal(k.dish.blended,true);
  assert.equal(k.serve(),false,`level ${index+1}: a puree cannot retain the requested food layers`);
  k.wash();build(k,k.recipe);assert.equal(serve(k),true,'washing and rebuilding restores the actual layers');
 }
});

test('adding dressing after blending cannot restore sliced salad ingredients',()=>{
 const k=new Kitchen();k.enter(24);k.start();for(const req of ingredients(k.recipe))addIngredient(k,req);
 k.lift();k.process('blend');k.stage();
 for(const m of measures(k.recipe))measure(k,m.liquid,m.unit,m.amount!);k.stir();
 assert.equal(serve(k),false,'new yogurt/oil cannot undo the earlier pureeing of tomato and cucumber');
 k.wash();build(k,k.recipe);assert.equal(serve(k),true);
});

test('removing and replacing broth cannot unblend a soup that requires pieces',()=>{
 const k=new Kitchen();k.enter(21);k.start();k.selectOrder(1);build(k,k.recipe);
 k.lift();k.process('blend');k.stage();k.remove();measure(k,'broth','half-cup',1);k.stir();
 assert.equal(serve(k),false,'liquid correction does not reconstruct blended mushroom slices or tomato pieces');
 k.wash();build(k,k.recipe);assert.equal(serve(k),true);
});

test('serving a valid main before the stated starter fails without destroying either dish',()=>{
 const k=new Kitchen();k.enter(10);k.start();k.selectOrder(1);build(k,k.recipe);assert.equal(serve(k),false);
 assert.equal(k.dishes[1].served,false);assert.equal(validateDish(k.dishes[1],k.spec.recipes[1]).ok,true);
 k.selectOrder(0);build(k,k.recipe);assert.equal(serve(k),true);assert.equal(k.order,1);
 assert.equal(serve(k),true);assert.equal(k.mode,'between');assert.equal(k.results[0].mistakes,1);assert.equal(k.results[0].unaided,false);
});

test('passing a soft pace target never prevents completion, and restart keeps the current level',()=>{
 const k=new Kitchen();k.enter(30);k.start();k.tick(k.spec.targetSeconds+90);solve(k);
 assert.equal(k.mode,'between');assert.equal(k.results[0].stars,2);
 const prior=k.results[0];k.restart();assert.equal(k.shift,30);assert.equal(k.mode,'read');assert.deepEqual(k.results,[prior]);
 assert.equal(k.firstUnaided,false);solve(k);assert.equal(k.results.filter(r=>r.shift===31).length,1);
});

test('first-attempt exposure survives eviction from the bounded telemetry log',()=>{
 const k=new Kitchen();k.enter(6);k.start();assert.equal(k.firstUnaided,true);
 for(let n=0;n<130;n++){k.take('bread');k.wash()}
 assert.equal(k.events.some(e=>e.shift===7&&e.action==='start'),false,'the scenario actually evicted its start event');
 assert.equal(k.shiftMistakes,0);k.enter(7);k.enter(6);k.start();
 assert.equal(k.firstUnaided,false,'reopening a practiced level cannot regain first-attempt credit when old log entries are dropped');
});

test('a missed pace star is accompanied by a recorded time beyond the displayed target',()=>{
 for(const excess of [-.25,0,.25]){
  const k=new Kitchen();k.enter(6);k.start();build(k,k.recipe);k.tick(k.spec.targetSeconds+excess);assert.equal(serve(k),true);
  const result=k.results[0];assert.equal(result.mistakes,0);assert.equal(result.stars,excess>0?2:3);
  if(result.stars===2)assert.ok(result.seconds>k.spec.targetSeconds,'the result must not appear to meet a target whose pace star was denied');
 }
});

const result=(shift:number,stars=3,seconds=60):LevelResult=>({shift,stars,seconds,mistakes:0,unaided:true,guided:shift===1});
test('progress round-trips, unlocks the next level, and keeps the better replay record',()=>{
 const empty=newProgress();let p=completeLevel(empty,result(1,2,90),36);
 assert.deepEqual(empty,newProgress());assert.equal(p.unlocked,2);assert.equal(p.lastLevel,2);
 p=completeLevel(p,result(1,1,20),36);assert.equal(p.completed[1].stars,2);assert.equal(p.completed[1].seconds,90);
 p=completeLevel(p,result(1,3,100),36);p=completeLevel(p,result(1,3,80),36);p=completeLevel(p,result(1,3,95),36);
 assert.equal(p.completed[1].seconds,80);assert.equal(totalStars(p),3);assert.deepEqual(readProgress(JSON.stringify(p),36),p);
 p=completeLevel(p,result(36),36);assert.equal(p.unlocked,36);assert.equal(p.lastLevel,36);
});

test('progress rejects malformed versions/IDs and clamps persisted bounds',()=>{
 for(const raw of [null,'{broken','null','{"version":2,"unlocked":36}'])assert.deepEqual(readProgress(raw,36),newProgress());
 const p=readProgress(JSON.stringify({version:1,unlocked:999,lastLevel:999,completed:{
  0:{stars:3,seconds:1,mistakes:0},37:{stars:3,seconds:1,mistakes:0},2:{stars:9,seconds:-20,mistakes:-4,unaided:true},3:{stars:0,seconds:20,mistakes:1},4:{stars:'three',seconds:1,mistakes:0}
 }}),36);
 assert.equal(p.unlocked,36);assert.equal(p.lastLevel,36);assert.deepEqual(Object.keys(p.completed),['2','3']);
 assert.deepEqual(p.completed[2],{stars:3,seconds:0,mistakes:0,unaided:true});assert.equal(p.completed[3].stars,1);
 const locked=readProgress('{"version":1,"unlocked":2,"lastLevel":36}',36);assert.equal(locked.lastLevel,2);
 for(const n of [0,37,-1,NaN,1.5])assert.deepEqual(completeLevel(newProgress(),result(n),36),newProgress());
});

function littlePear(){const k=new Kitchen();k.enter(27);k.start();k.selectOrder(1);addIngredient(k,ingredients(k.recipe)[0]);return k}
test('a little yogurt accepts small positive available measures, including equivalent mixed units',()=>{
 for(const amount of [1,3,12]){
  const k=littlePear();assert.ok(k.spec.units.includes('teaspoon'));measure(k,'yogurt','teaspoon',amount);k.stir();
  assert.equal(validateDish(k.dish,k.recipe).ok,true,`${amount} teaspoon(s) is within four game tablespoons; the recipe names no exact unit`);
 }
 const mixed=littlePear();measure(mixed,'yogurt','tablespoon',1);measure(mixed,'yogurt','teaspoon',9);mixed.stir();
 assert.equal(validateDish(mixed.dish,mixed.recipe).ok,true,'one tablespoon plus nine teaspoons is four tablespoons, allowing numeric tolerance');
});
test('a little yogurt still rejects more than the small-portion bound',()=>{
 for(const [unit,amount]of [['teaspoon',13],['half-cup',1],['cup',1]] as const){
  const k=littlePear();measure(k,'yogurt',unit,amount);k.stir();assert.equal(validateDish(k.dish,k.recipe).ok,false,`${amount} ${unit} is more than four tablespoons`);
 }
});
