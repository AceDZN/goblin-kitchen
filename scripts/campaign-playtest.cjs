/** All 36 levels through normal input. The catalog supplies a plan, never injected game state. */
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const levels=JSON.parse(execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',"import {levels} from './src/levels.ts'; console.log(JSON.stringify(levels))"],{cwd:root,encoding:'utf8'}));
const url=process.argv[2]||'http://127.0.0.1:5201';
const captureDir=path.resolve(root,process.env.CAPTURE_DIR||'docs/captures/campaign-overhaul');
fs.mkdirSync(captureDir,{recursive:true});fs.mkdirSync(root+'/work',{recursive:true});
const clipNames=['idle','walk','Goblin Kitchen carrying motion: walk steadily in place, holding'];
function assertAssets(s){
 const a=s.assets;assert.equal(a.realCook,true);assert.equal(a.riggedCook,true);assert.equal(a.joints,65);assert.equal(a.realProp,true);
 assert.deepEqual([...a.clips].sort(),[...clipNames].sort());assert.equal(a.worldReady,true,'all authored world models loaded');
 assert.ok(a.authoredModels>2,'the environment asset library is loaded in addition to the cook and bowl');
 assert.ok(a.libraryNames.length>2);assert.deepEqual(a.missingModels,[]);
 assert.ok(a.venueVisuals?.decor?.length>0,'current venue declares its environment models');
 for(const id of a.venueVisuals.decor)assert.ok(a.libraryNames.includes(id),`loaded current-venue model ${id}`);
 assert.equal(a.venueVisuals.layout,s.layout);
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const startedAt=new Date().toISOString(),errors=[],warnings=[],failedRequests=[],evidence=[],finished=[],courses=[],layouts=[];
 let page;
 const report=(status,extra={})=>fs.writeFileSync(root+'/work/campaign-browser-results.json',JSON.stringify({status,startedAt,errors,warnings,failedRequests,finished,courses,evidence,...extra},null,2));
 report('starting');
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}});page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text())});
  page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`)});
  const state=async()=>JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
  const step=async(ms=2100)=>page.evaluate(ms=>window.advanceTime(ms),ms);
  const ready=async()=>{await page.waitForFunction(()=>{const a=JSON.parse(window.render_game_to_text()).assets;return a.riggedCook&&a.realProp&&a.worldReady},null,{timeout:60000});assertAssets(await state())};
  const go=async(id)=>{
   for(let attempt=0;attempt<3;attempt++){
    const current=await state(),target=current.stations.find(s=>s.id===id);assert.ok(target,`station ${id}`);
    assert.ok(target.screen.x>0&&target.screen.x<1440&&target.screen.y>0&&target.screen.y<900,`visible ${id} at level ${current.level}`);
    await page.mouse.click(target.screen.x,target.screen.y);
    for(let n=0;n<20;n++){await step(500);if((await state()).near===id)return}
   }
   assert.equal((await state()).near,id,`route to ${id} at level ${(await state()).level}`);
  };
  const action=async(id)=>{await page.locator(`[data-action="${id}"]`).click();await step()};
  const capture=async(name)=>{await step(0);await page.screenshot({path:`${captureDir}/${name}.png`,scale:'css',timeout:60000});const s=await state();evidence.push({name,state:s});return s};
  const cookIngredient=async(req)=>{
   let left=req.count;
   while(left>0){
    await go(req.food==='bread'?'bread':'fruit');await action(req.food==='bread'?'bread':'take-'+req.food);
    if(req.form!=='whole'){await go('board');await action('prep');if(req.food==='banana'&&req.form!=='peeled')await action('prep')}
    if(req.form==='diced'||req.form==='grated'){await go('prepared');await action('process-'+(req.form==='diced'?'dice':'grate'))}
    if(req.heat&&req.heat!=='raw'){await go('prepared');await action('process-'+(req.heat==='toasted'?'toast':'roast'))}
    await go('bowl');const held=(await state()).held;assert.equal(held.food,req.food);assert.equal(held.form,req.form);assert.equal(held.heat??'raw',req.heat??'raw');
    const count=Math.min(left,held.count);for(let n=0;n<count;n++)await action('add');left-=count;
    if((await state()).held)await action('stage');
   }
  };
  const chooseMeasure=async(m)=>{
   await go('yogurt');for(let n=0;(await state()).tool!==m.unit&&n<4;n++)await action('tool');assert.equal((await state()).tool,m.unit);
   const liquid=m.liquid??'yogurt';for(let n=0;(await state()).liquid!==liquid&&n<3;n++)await action('liquid');assert.equal((await state()).liquid,liquid);
  };
  await page.goto(url,{waitUntil:'networkidle',timeout:60000});await page.evaluate(()=>document.fonts.ready);await ready();
  await page.click('#intro-map');assert.equal(await page.locator('[data-level]').count(),36);assert.equal(await page.locator('[data-level]:not(:disabled)').count(),1);
  await capture('map-new-save');await page.click('#close-map');await page.click('#start-btn');await page.click('#cook');await page.evaluate(()=>window.set_game_test_clock(true));await ready();
  assert.doesNotMatch(await page.locator('body').innerText(),/\bgrade\b|כיתה|כיתות/i);
  for(let index=0;index<levels.length;index++){
   const level=levels[index];assert.equal((await state()).level,index+1);await ready();
   const initial=await state();layouts.push({level:index+1,stations:initial.stations.map(({id,x,z})=>({id,x,z}))});
   assert.deepEqual(initial.pantry,level.pantry);assert.deepEqual(initial.availableTools,level.tools);assert.equal(initial.layout,level.layout);
   for(let order=0;order<level.recipes.length;order++){
    const r=level.recipes[order];assert.equal((await state()).order,order+1);assert.equal(await page.locator('#recipe-text').innerText(),r.text);
    if(!(await state()).bowl.clean){await go('sink');await action('wash')}
    let reqs=[r,...(r.extra??[])];if(r.layers)reqs=r.layers.map(f=>reqs.find(r=>r.food===f));
    for(const req of reqs)await cookIngredient(req);
    const measurements=r.dressings??(r.yogurt?[{...r.yogurt,liquid:r.sauce??'yogurt'}]:[]);
    for(const m of measurements){await chooseMeasure(m);for(let n=0;n<(m.amount??2);n++){if(n)await go('yogurt');await action('measure');await go('bowl');await action('add')}}
    await go('bowl');if(r.stir&&!r.blend)await action('stir');await action('lift');
    if(r.blend){await go('prepared');await action('process-blend')}
    const name=`level-${String(index+1).padStart(2,'0')}-course-${order+1}-ready`;
    const prepared=await capture(name);assertAssets(prepared);
    courses.push({level:index+1,course:order+1,recipe:r.id,capture:name,ready:prepared.bowl,held:prepared.held});
    await go('serve');await action('serve');
    const served=await state();assert.equal(served.orders[order].served,true,`serve level ${index+1} course ${order+1}: ${served.phrase} ${served.message}`);assert.equal(served.mistakes,0,'the valid campaign route never needs trial-and-error');
   }
   const current=await state();assert.equal(current.mode,index===35?'complete':'between');assert.ok(current.campaign.completed.includes(index+1));assert.ok(current.campaign.unlocked>=Math.min(36,index+2));
   finished.push({level:index+1,orders:level.recipes.length,result:current.results.find(r=>r.shift===index+1)});report('running',{lastLevel:index+1});console.log(`PASS level ${index+1}/36 · ${level.recipes.length} order(s) · images captured`);
   if((index+1)%6===0)await capture(`chapter-${level.venue+1}-complete`);
   if(index===0){
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#cook');assert.equal((await state()).level,1);assert.equal((await state()).campaign.unlocked,2);
    await page.click('#cook');await page.evaluate(()=>window.set_game_test_clock(true));await ready();await page.click('#levels-btn');assert.equal(await page.locator('[data-level]:not(:disabled)').count(),2);
    await page.click('[data-level="2"]');await page.click('#cook');await page.evaluate(()=>window.set_game_test_clock(true));
   }else if(index<35){await page.click('#next');await page.click('#cook')}
  }
  const final=await state();assert.equal(final.campaign.completed.length,36);assert.equal(final.campaign.unlocked,36);assert.equal(courses.length,60);assert.equal(new Set(courses.map(c=>c.level)).size,36);
  await page.click('#result-map');assert.equal(await page.locator('[data-level]:not(:disabled)').count(),36);await page.locator('[data-level="36"]').scrollIntoViewIfNeeded();await capture('map-complete-save');
  // Replay a changed layout, move PREP, then restart: both route geometry and ingredient state must reset.
  await page.click('[data-level="7"]');assert.equal((await state()).level,7);assert.equal((await state()).mode,'read');assert.equal((await state()).campaign.completed.length,36);
  const baseline=layouts.find(l=>l.level===7).stations;assert.deepEqual((await state()).stations.map(({id,x,z})=>({id,x,z})),baseline);
  await page.click('#reposition');assert.notDeepEqual((await state()).stations.map(({id,x,z})=>({id,x,z})),baseline);await page.click('#cook');await page.evaluate(()=>window.set_game_test_clock(true));
  await page.click('#pause');await page.click('#restart');assert.equal((await state()).level,7);assert.equal((await state()).held,null);assert.deepEqual((await state()).stations.map(({id,x,z})=>({id,x,z})),baseline);
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#cook');assert.equal((await state()).level,7);assert.equal((await state()).campaign.completed.length,36);await ready();await capture('replay-layout-reset');
  assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);assert.deepEqual(failedRequests,[]);report('pass',{final,layouts,visualCoverage:{levels:36,courses:60,reviewed:false}});
  console.log('PASS all36 levels/60 orders with60 course images; map unlock, save/reload/replay and layout reset; no browser errors/warnings or failed requests. Visual inspection remains separate.');
 }catch(error){
  let failureState=null;try{failureState=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));await page.screenshot({path:captureDir+'/failure.png',scale:'css'})}catch{}
  report('failed',{error:String(error),failureState});throw error;
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
