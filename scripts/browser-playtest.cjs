// Independent opening-level and consequential-error regression.
// Inputs are normal mouse/keyboard/touch; advanceTime changes time, never inventory or outcomes.
// Full successful 1→36 campaign route is separately tested by campaign-playtest.cjs.
const {createRequire}=require('node:module');
const {mkdirSync,writeFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {chromium}=createRequire(root+'/package.json')('playwright');
const url=process.argv.slice(2).find(a=>!a.startsWith('--'))||'http://127.0.0.1:5201';
const focused=process.argv.includes('--focused');
const probesOnly=process.argv.includes('--probes-only');
const remaining=process.argv.includes('--remaining');
const lateProbes=process.argv.includes('--late-probes');
assert.ok([focused,probesOnly,remaining,lateProbes].filter(Boolean).length<=1,'choose at most one scope flag');
const captures=root+'/docs/captures';mkdirSync(captures,{recursive:true});mkdirSync(root+'/work',{recursive:true});
const clips=['idle','walk','Goblin Kitchen carrying motion: walk steadily in place, holding'];
function assertAssets(a){assert.equal(a.realCook,true);assert.equal(a.riggedCook,true);assert.equal(a.joints,65);assert.equal(a.realProp,true);assert.deepEqual([...a.clips].sort(),[...clips].sort());assert.equal(a.worldReady,true);assert.ok(a.authoredModels>2);assert.deepEqual(a.missingModels,[]);assert.ok(a.venueVisuals.decor.length);for(const id of a.venueVisuals.decor)assert.ok(a.libraryNames.includes(id),`venue model ${id}`)}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const errors=[],warnings=[],failedRequests=[],evidence=[];let openingState=null,mobileState=null,probeState=null;
 const resultPath=root+(probesOnly?'/work/reviewer-probes-results.json':focused?'/work/reviewer-focused-results.json':remaining?'/work/reviewer-remaining-results.json':lateProbes?'/work/reviewer-late-results.json':'/work/reviewer-browser-results.json');
 writeFileSync(resultPath,JSON.stringify({status:'starting',startedAt:new Date().toISOString(),errors,warnings,failedRequests,evidence},null,2));
 function watch(p){p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text())});p.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));p.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`)})}
 function controls(p){
  const state=async()=>JSON.parse(await p.evaluate(()=>window.render_game_to_text()));
  const step=async(ms=2200)=>p.evaluate(ms=>window.advanceTime(ms),ms);
  const capture=async name=>{await p.waitForTimeout(230);await p.screenshot({path:`${captures}/reviewer-${name}.png`,scale:'css',timeout:60000});evidence.push({name,state:await state()});console.log('CAPTURE '+name)};
  const go=async id=>{const s=(await state()).stations.find(s=>s.id===id);assert.ok(s,`station ${id}`);await p.mouse.click(s.screen.x,s.screen.y);for(let n=0;n<20;n++){await step(500);if((await state()).near===id)return}assert.equal((await state()).near,id,`walk to ${id}`)};
  const action=async id=>{await p.click(`[data-action="${id}"]`);await step()};
  const take=async food=>{await go(food==='bread'?'bread':'fruit');await action(food==='bread'?'bread':'take-'+food)};
  const prep=async(n=1)=>{await go('board');for(let i=0;i<n;i++)await action('prep')};
  const process=async tool=>{await go('prepared');await action('process-'+tool)};
  const add=async()=>{await go('bowl');await action('add')};
  const ingredient=async(food,n=1,tool)=>{await take(food);if(n)await prep(n);if(tool)await process(tool);await add()};
  const measure=async(amount,unit='tablespoon',liquid='yogurt')=>{for(let i=0;i<amount;i++){await go('yogurt');for(let n=0;(await state()).tool!==unit&&n<5;n++){await p.click('[data-action="tool"]');await step(25)}for(let n=0;(await state()).liquid!==liquid&&n<4;n++){await p.click('[data-action="liquid"]');await step(25)}assert.equal((await state()).tool,unit);assert.equal((await state()).liquid,liquid);await action('measure');await add()}};
  const launch=async()=>{await go('serve');await action('serve')};
  const service=async(stir=true)=>{await go('bowl');if(stir)await action('stir');await action('lift');await launch()};
  const wash=async()=>{await go('sink');await action('wash')};
  const start=async target=>{await p.goto(target,{waitUntil:'networkidle',timeout:60000});if(await p.locator('#start-btn').count())await p.click('#start-btn');await p.click('#cook');await p.evaluate(()=>window.set_game_test_clock(true));await p.waitForFunction(()=>{const a=JSON.parse(window.render_game_to_text()).assets;return a.riggedCook&&a.realProp&&a.worldReady},null,{timeout:60000});assertAssets((await state()).assets)};
  const canvasHash=async()=>createHash('sha256').update(await p.evaluate(()=>{window.advanceTime(0);return document.querySelector('canvas').toDataURL('image/png')})).digest('hex');
  return {state,step,capture,go,action,take,prep,process,add,ingredient,measure,launch,service,wash,start,canvasHash};
 }
 try{
  if(!probesOnly&&!lateProbes){
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();watch(page);const d=controls(page);
  if(!remaining){
  await d.start(url);assert.equal((await d.state()).totalLevels,36);assert.doesNotMatch(await page.locator('body').innerText(),/\bgrade\b|כיתה|כיתות/i);
  await d.step(100);assert.equal((await d.state()).assets.activeAnimation,'idle');
  await page.keyboard.down('KeyD');await d.step(200);assert.equal((await d.state()).assets.activeAnimation,'walk');const walking=await d.canvasHash();await d.step(200);assert.notEqual(await d.canvasHash(),walking);await d.capture('opening-rig-walk');
  await page.keyboard.press('KeyP');const paused=await d.canvasHash(),time=(await d.state()).seconds;await d.step(2000);assert.equal(await d.canvasHash(),paused);assert.equal((await d.state()).seconds,time);await d.capture('opening-rig-pause');await page.keyboard.up('KeyD');await page.keyboard.press('KeyP');await d.step(100);
  await d.take('banana');await d.prep();await d.capture('opening-peeled-banana');await page.keyboard.down('KeyD');await d.step(200);assert.equal((await d.state()).assets.activeAnimation,clips[2]);await d.capture('opening-carry-banana');await page.keyboard.up('KeyD');await d.step(100);
  await d.add();await d.measure(3);await d.go('bowl');await d.action('stir');await d.action('lift');await page.keyboard.down('KeyS');await d.step(200);assert.equal((await d.state()).assets.activeAnimation,clips[2]);await d.capture('opening-carry-dish');await page.keyboard.up('KeyS');await d.step(100);await d.go('serve');
  const before=(await d.state()).tips,hatch=(await d.state()).stations.find(s=>s.id==='serve');await page.click('[data-action="serve"]');await d.step(300);const flight=await d.state();assert.equal(flight.job,'serve');assert.equal(flight.tips,before);assert.equal(flight.results.length,0);assert.deepEqual(flight.serving.target,{x:hatch.x+.85,z:hatch.z});await d.capture('opening-toss-midair');
  await page.keyboard.press('KeyP');const pauseFlight=await d.state();await d.step(1000);assert.deepEqual((await d.state()).serving,pauseFlight.serving);assert.equal((await d.state()).seconds,pauseFlight.seconds);await d.capture('opening-toss-paused');await page.keyboard.press('KeyP');await d.step(550);assert.equal((await d.state()).job,'return');assert.equal((await d.state()).mistakes,1);await d.capture('opening-rejected-return');await d.step(700);assert.equal((await d.state()).bowl.yogurt.length,3);
  await d.go('bowl');await d.action('remove');assert.equal((await d.state()).bowl.stirred,false);await d.action('stir');await d.action('lift');await d.go('serve');await page.click('[data-action="serve"]');await d.step(300);assert.equal((await d.state()).tips,before);await d.step(550);assert.equal((await d.state()).mode,'between');assert.equal((await d.state()).results[0].guided,true);assert.equal(await page.locator('#overlay').evaluate(el=>el.classList.contains('visible')),false);await d.capture('opening-hatch-catch');await d.step(700);
  await page.click('#next');await page.click('#cook');await d.ingredient('bread');await d.action('add');await d.action('stage');assert.equal((await d.state()).staged[0].count,2);await page.click('[data-order="1"]');await d.ingredient('bread',0);await d.ingredient('bread',0);await page.click('[data-order="0"]');await d.action('stage');assert.match(await page.locator('#carry').innerText(),/2 slices of bread/);await d.action('stage');assert.match(await page.locator('#contents').innerText(),/TRAY: 2 slices of bread/);await d.capture('opening-two-orders');await d.service(false);assert.equal((await d.state()).order,2);await d.service(false);assert.equal((await d.state()).mode,'between');
  if(!focused){
   const x=(await d.state()).stations.find(s=>s.id==='board').x;await page.click('#next');await page.click('#reposition');assert.notEqual((await d.state()).stations.find(s=>s.id==='board').x,x);await page.click('#cook');
   await d.ingredient('banana',2);await d.measure(1,'cup');await d.capture('opening-cup');await d.service();assert.equal((await d.state()).mode,'between');
   await page.click('#next');await page.click('#cook');await d.go('prepared');await d.action('pear-prepared');await d.add();await d.measure(1);await d.service();assert.equal((await d.state()).phrase,'the pear that you prepared');await d.wash();await d.ingredient('pear');await d.measure(2);await d.service();
   await page.click('#next');await page.click('#cook');assert.equal((await d.state()).bowl.clean,false);await d.wash();await d.ingredient('apple');await d.ingredient('apple');await d.measure(3);await d.go('bowl');await d.action('stir');await d.capture('opening-transfer-ready');await d.action('lift');await d.launch();
   assert.equal((await d.state()).mode,'between','level5 continues the campaign');assert.equal((await d.state()).results.length,5);assert.equal((await d.state()).results[4].unaided,true);assert.equal((await d.state()).campaign.unlocked,6);await d.capture('opening-five-complete');await page.click('#next');assert.equal((await d.state()).level,6);assert.equal((await d.state()).mode,'read');await d.capture('opening-level-six-unlocked');
  }
  }
  const mobileContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),mobile=await mobileContext.newPage();watch(mobile);const m=controls(mobile);await m.start(url);
  const tapGo=async id=>{const s=(await m.state()).stations.find(s=>s.id===id);await mobile.touchscreen.tap(s.screen.x,s.screen.y);for(let n=0;n<20;n++){await m.step(500);if((await m.state()).near===id)return}assert.equal((await m.state()).near,id)};
  await tapGo('fruit');await mobile.locator('[data-action="take-banana"]').tap();await tapGo('bowl');await mobile.locator('[data-action="stage"]').tap();assert.equal((await m.state()).staged[0].food,'banana');
  await m.capture('opening-mobile-tray');const fit=await mobile.evaluate(()=>({width:innerWidth,height:innerHeight,carry:document.querySelector('#carry').getBoundingClientRect().toJSON(),context:document.querySelector('#context').getBoundingClientRect().toJSON(),actions:Array.from(document.querySelectorAll('#actions button')).map(el=>el.getBoundingClientRect().toJSON())}));assert.ok(fit.actions.every(r=>r.x>=0&&r.right<=fit.width&&r.bottom<=fit.height),JSON.stringify(fit));assert.ok(fit.carry.bottom<=fit.context.y,JSON.stringify(fit));await mobile.locator('[data-action="stage"]').tap();assert.equal((await m.state()).held.food,'banana');
  await mobile.locator('#read').tap();const read=await m.state();await m.step(5000);assert.equal((await m.state()).seconds,read.seconds);await mobile.locator('#cook').tap();await mobile.locator('#vocab').tap();const vocab=await m.state();await m.step(5000);assert.equal((await m.state()).seconds,vocab.seconds);assert.equal(vocab.assisted,true);await mobile.locator('#close-vocab').tap();await mobile.locator('#pause').tap();await mobile.locator('#motion').tap();await mobile.locator('#restart').tap();assert.equal((await m.state()).mode,'read');assert.equal((await m.state()).held,null);assert.equal((await m.state()).level,1);await mobile.locator('#cook').tap();await m.capture('opening-mobile');
  if(!focused){
   const royal=new URL(url);royal.searchParams.set('level','36');await m.start(royal.href);
   const tapAction=async id=>{await mobile.locator(`[data-action="${id}"]`).tap();await m.step()};
   const touchIngredient=async(food,tool)=>{await tapGo('fruit');await tapAction('take-'+food);await tapGo('board');await tapAction('prep');if(tool){await tapGo('prepared');await tapAction('process-'+tool)}await tapGo('bowl');await tapAction('add')};
   await touchIngredient('cucumber');await tapGo('fruit');await tapAction('take-carrot');await tapGo('board');await tapAction('prep');await tapGo('prepared');
   await m.capture('portrait-royal-tools');const denseFit=await mobile.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,recipe:document.querySelector('#recipe').getBoundingClientRect().toJSON(),carry:document.querySelector('#carry').getBoundingClientRect().toJSON(),context:document.querySelector('#context').getBoundingClientRect().toJSON(),actions:Array.from(document.querySelectorAll('#actions button')).map(el=>el.getBoundingClientRect().toJSON())}));
   assert.equal(denseFit.actions.length,5);assert.ok(denseFit.scrollWidth<=denseFit.width);assert.ok(denseFit.actions.every(r=>r.x>=0&&r.right<=denseFit.width&&r.bottom<=denseFit.height),JSON.stringify(denseFit));assert.ok(denseFit.carry.bottom<=denseFit.context.y,JSON.stringify(denseFit));assert.ok(denseFit.recipe.right<=denseFit.width);
   await tapAction('process-grate');await tapGo('bowl');await tapAction('add');
   const touchMeasure=async(unit,liquid)=>{await tapGo('yogurt');for(let n=0;(await m.state()).tool!==unit&&n<4;n++)await tapAction('tool');for(let n=0;(await m.state()).liquid!==liquid&&n<3;n++)await tapAction('liquid');assert.equal((await m.state()).tool,unit);assert.equal((await m.state()).liquid,liquid);await tapAction('measure');await tapGo('bowl');await tapAction('add')};
   await touchMeasure('teaspoon','oil');await touchMeasure('tablespoon','yogurt');await tapAction('stir');await tapAction('lift');await tapGo('serve');await tapAction('serve');assert.equal((await m.state()).orders[0].served,true);assert.equal((await m.state()).order,2);assert.equal((await m.state()).mistakes,0);await m.capture('portrait-royal-served-starter');
  }
  openingState=remaining?null:await d.state();mobileState=await m.state();await mobileContext.close();await context.close();
  }
  if(!focused){
   async function probe(level,run){const c=await browser.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();watch(p);const a=controls(p);const u=new URL(url);u.searchParams.set('level',String(level));try{await a.start(u.href);assert.equal((await a.state()).level,level);await run(p,a);probeState=await a.state()}finally{await c.close()}}
   if(!lateProbes)for(const [width,height]of [[800,600],[960,600],[844,390],[720,600],[600,650]]){
    const c=await browser.newContext({viewport:{width,height},...(height<500||width<=760?{isMobile:true,hasTouch:true}:{})}),p=await c.newPage();watch(p);const a=controls(p),u=new URL(url);u.searchParams.set('level','36');
    try{
     await a.start(u.href);await a.take('cucumber');await a.go('prepared');await a.capture(`landscape-${width}x${height}-controls`);
     const geometry=await p.evaluate(()=>{const s=JSON.parse(window.render_game_to_text());return {width:innerWidth,height:innerHeight,carry:document.querySelector('#carry').getBoundingClientRect().toJSON(),context:document.querySelector('#context').getBoundingClientRect().toJSON(),stations:s.stations.map(st=>{const el=document.elementFromPoint(st.screen.x,st.screen.y),blocking=el?.closest('#recipe,header,#context,#touch-move');return {id:st.id,screen:st.screen,element:el?.id||el?.tagName,blocked:blocking?.id||blocking?.tagName||null}})}});
     evidence.push({name:`landscape-${width}x${height}-geometry`,geometry});assert.ok(geometry.carry.bottom<=geometry.context.y,JSON.stringify(geometry));assert.ok(geometry.stations.every(s=>!s.blocked&&s.element==='game'),JSON.stringify(geometry));
    }finally{await c.close()}
   }
   // Correct quantities and forms, wrong layer order. Reuse parked bread to repair it.
   if(!probesOnly&&!lateProbes)await probe(9,async(p,a)=>{
    await a.ingredient('tomato',1,'dice');await a.take('bread');await a.prep();await a.process('toast');await a.add();await a.action('add');await a.action('stage');await a.measure(1,'teaspoon','oil');await a.service(false);assert.equal((await a.state()).mistakes,1);assert.match((await a.state()).phrase,/bread.*tomato/);await a.capture('wrong-layers');
    await a.wash();await a.go('bowl');await a.action('stage');await a.action('add');await a.action('add');await a.ingredient('tomato',1,'dice');await a.measure(1,'teaspoon','oil');await a.service(false);assert.equal((await a.state()).mode,'between');await a.capture('layers-recovered');
   });
   // A valid main cannot be served before the stated starter; preparation itself remains free.
   if(!lateProbes)await probe(11,async(p,a)=>{
    await p.click('#pause');await p.click('#restart');assert.equal((await a.state()).level,11);assert.equal((await a.state()).mode,'read');assert.equal((await a.state()).firstAttemptUnaided,false);await p.click('#cook');await p.click('[data-order="1"]');
    await a.take('bread');await a.prep();await a.process('toast');await a.add();await a.action('add');await a.action('stage');await a.ingredient('tomato',1,'dice');await a.measure(1,'tablespoon','oil');await a.service(false);assert.equal((await a.state()).mistakes,1);assert.match((await a.state()).phrase,/starter before the toast main/);assert.equal((await a.state()).orders[1].served,false);await a.capture('wrong-service-order');
    await p.click('[data-order="0"]');await a.ingredient('cucumber');await a.measure(1,'teaspoon','oil');await a.service(false);assert.equal((await a.state()).order,2);await a.service(false);assert.equal((await a.state()).mode,'between');await a.capture('service-order-recovered');
   });
   // A timed empty-hand operation stays with its original order. Real tab clicks must be ignored while busy.
   await probe(18,async(p,a)=>{
    const clickTab=async i=>{const r=await p.locator(`[data-order="${i}"]`).boundingBox();assert.ok(r);await p.mouse.click(r.x+r.width/2,r.y+r.height/2)};
    await a.ingredient('cucumber');await p.click('[data-order="1"]');await a.ingredient('potato',1,'dice');await p.click('[data-order="0"]');await a.go('bowl');
    const other=structuredClone((await a.state()).orders[1]);await p.click('[data-action="stir"]');await a.step(200);assert.equal((await a.state()).job,'stir');
    await clickTab(1);assert.equal((await a.state()).order,1,'a busy stir cannot migrate to another bowl');
    await p.keyboard.press('KeyP');const paused=await a.state();await a.step(2000);assert.deepEqual((await a.state()).orders,paused.orders);assert.equal((await a.state()).seconds,paused.seconds);await a.capture('processing-paused');
    await p.keyboard.press('KeyP');await a.step(800);assert.equal((await a.state()).orders[0].stirred,true);assert.deepEqual((await a.state()).orders[1],other);
    await a.go('sink');await p.click('[data-action="wash"]');await a.step(100);await clickTab(1);assert.equal((await a.state()).order,1);await a.step(600);assert.equal((await a.state()).orders[0].items.length,0);assert.deepEqual((await a.state()).orders[1],other);await a.capture('wash-stays-with-order');
    await p.click('[data-order="1"]');await a.go('bowl');await a.action('lift');await clickTab(0);assert.equal((await a.state()).order,2);assert.equal((await a.state()).held.food,'dish');await a.action('stage');
    await a.take('carrot');await a.go('board');await p.click('[data-action="prep"]');await a.step(150);const beforeBlur=await a.state();assert.equal(beforeBlur.job,'prep');
    // Chromium's Playwright default deliberately emulates continuous focus/visibility.
    // Turn that browser setting off so a real tab switch can exercise the app's blur/visibility handlers.
    const focusSession=await p.context().newCDPSession(p);await focusSession.send('Emulation.setFocusEmulationEnabled',{enabled:false});
    const focusBefore=await p.evaluate(()=>({focus:document.hasFocus(),visibility:document.visibilityState}));
    const focus=await p.context().newPage();await focus.goto('about:blank');await focus.bringToFront();await p.waitForTimeout(150);
    const focusAfter=await p.evaluate(()=>({focus:document.hasFocus(),visibility:document.visibilityState}));evidence.push({name:'actual-tab-focus-change',focusBefore,focusAfter});
    assert.equal((await a.state()).mode,'pause','real focus loss pauses the processing job');await a.step(2000);assert.equal((await a.state()).held.form,'whole');assert.equal((await a.state()).seconds,beforeBlur.seconds);
    await focus.close();await p.bringToFront();await focusSession.send('Emulation.setFocusEmulationEnabled',{enabled:true});await p.keyboard.press('KeyP');await a.step(800);assert.equal((await a.state()).held.form,'sliced');await a.capture('focus-loss-processing-recovered');
    await p.reload({waitUntil:'domcontentloaded'});await p.waitForSelector('#cook');assert.equal((await a.state()).level,18);assert.equal((await a.state()).firstAttemptUnaided,false,'reload preserves prior exposure without needing a help request');assert.equal((await a.state()).assisted,false);await a.capture('reload-preserves-first-attempt-history');
   });
   // Blending destroys the requested pieces even though the ingredients/amounts match.
   await probe(22,async(p,a)=>{
    const soup=async()=>{await a.ingredient('tomato',1,'dice');await a.ingredient('mushroom');await a.measure(1,'half-cup','broth')};
    await p.click('[data-order="1"]');await soup();await a.go('bowl');await a.action('stir');await a.action('lift');await a.process('blend');await a.launch();assert.equal((await a.state()).mistakes,1);assert.equal((await a.state()).bowl.blended,true);assert.equal((await a.state()).phrase,'serve the pieces');await a.capture('chunky-wrongly-blended');
    await a.go('bowl');await a.action('remove');await a.measure(1,'half-cup','broth');await a.service();assert.equal((await a.state()).mistakes,2);assert.equal((await a.state()).orders[1].served,false);await a.capture('broth-correction-does-not-unblend');
    await a.wash();await soup();await a.service();assert.equal((await a.state()).order,1);await soup();await a.go('bowl');await a.action('lift');await a.process('blend');await a.launch();assert.equal((await a.state()).mode,'between');await a.capture('chunky-and-smooth-recovered');
   });
   // Dressing cannot reconstruct slices that were already pureed by the blender.
   await probe(25,async(p,a)=>{
    const vegetables=async()=>{await a.ingredient('tomato');await a.ingredient('cucumber')};
    const dressing=async()=>{await a.measure(1,'half-cup','yogurt');await a.measure(1,'teaspoon','oil')};
    await vegetables();await a.go('bowl');await a.action('lift');await a.process('blend');await a.go('bowl');await a.action('stage');await dressing();await a.service();
    assert.equal((await a.state()).mistakes,1);assert.equal((await a.state()).orders[0].served,false);await a.capture('dressing-does-not-unblend-salad');
    await a.wash();await vegetables();await dressing();await a.service();assert.equal((await a.state()).mode,'between');await a.capture('salad-pieces-recovered');
   });
   // A little names a small amount, not a hidden tablespoon tool; the broth course stays exact.
   await probe(28,async(p,a)=>{
    await p.click('[data-order="1"]');await a.ingredient('pear');await a.measure(1,'teaspoon','yogurt');await a.service();
    assert.equal((await a.state()).mistakes,0);assert.equal((await a.state()).orders[1].served,true);await a.capture('little-yogurt-teaspoon-accepted');
    await a.take('potato');await a.prep();await a.process('dice');await a.process('roast');await a.add();await a.measure(1,'cup','broth');await a.service();
    assert.equal((await a.state()).mistakes,1);assert.equal((await a.state()).orders[0].served,false);await a.capture('exact-broth-wrong-cup');
    await a.go('bowl');await a.action('remove');await a.go('yogurt');
    for(let n=0;(await a.state()).tool!=='half-cup'&&n<5;n++){await p.click('[data-action="tool"]');await a.step(25)}
    assert.equal(await p.locator('[data-action="measure"]').innerText(),'E · Measure ½ cup');await a.action('measure');
    assert.equal(await p.locator('#carry').innerText(),'½ cup of broth');await a.capture('half-cup-carry-label');await a.add();
    assert.match(await p.locator('#contents').innerText(),/½ cup of broth/);assert.doesNotMatch(await p.locator('#contents').innerText(),/1 ½ cup/);
    await a.measure(1,'half-cup','broth');assert.match(await p.locator('#contents').innerText(),/2 × ½ cup of broth/);await a.capture('two-half-cup-measures');
    await a.go('bowl');await a.action('remove');await a.service();assert.equal((await a.state()).mode,'between');await a.capture('little-and-exact-recovered');
   });
  }
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(failedRequests,[]);const result={status:'pass',scope:probesOnly?'viewports+level11/18/22/25/28-adversarial-recovery':focused?'opening2+touch':remaining?'touch+viewports+level9/11/18/22/25/28-adversarial-recovery':lateProbes?'level18/22/25/28-adversarial-recovery':'opening5+touch+viewports+level9/11/18/22/25/28-adversarial-recovery',errors,warnings,failedRequests,evidence,opening:openingState,final:probeState??openingState,mobile:mobileState};writeFileSync(resultPath,JSON.stringify(result,null,2));
  console.log('PASS independent regression: '+result.scope+'; all world models ready; no browser errors/warnings or failed requests.');
 }catch(error){const failure=JSON.stringify({status:'failed',error:String(error),errors,warnings,failedRequests,evidence},null,2);writeFileSync(root+'/work/reviewer-partial-results.json',failure);writeFileSync(resultPath,failure);throw error}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
