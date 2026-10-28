/** Full campaign through normal input. Catalog is a cooking plan, never an injected state. */
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const levels=JSON.parse(execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',"import {levels} from './src/levels.ts'; console.log(JSON.stringify(levels))"],{cwd:root,encoding:'utf8'}));
const url=process.argv[2]||'http://127.0.0.1:5201';
const captureDir=root+'/docs/captures/campaign';fs.mkdirSync(captureDir,{recursive:true});fs.mkdirSync(root+'/work',{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const errors=[],evidence=[],finished=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const state=async()=>JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
  const step=async(ms=2100)=>page.evaluate(ms=>window.advanceTime(ms),ms);
  const go=async(id)=>{for(let n=0;n<3;n++){const target=(await state()).stations.find(s=>s.id===id);await page.mouse.click(target.screen.x,target.screen.y);await step(5000);if((await state()).near===id)return;}assert.equal((await state()).near,id,`route to ${id} at level ${(await state()).level}`)};
  const action=async(id)=>{await page.locator(`[data-action="${id}"]`).click();await step()};
  const capture=async(name)=>{await page.screenshot({path:`${captureDir}/${name}.png`,scale:'css'});evidence.push({name,state:await state()})};
  const cookIngredient=async(req)=>{
   let left=req.count;
   while(left>0){await go(req.food==='bread'?'bread':'fruit');await action(req.food==='bread'?'bread':'take-'+req.food);
    const needsPrep=req.form!=='whole';if(needsPrep){await go('board');await action('prep');if(req.food==='banana'&&req.form!=='peeled')await action('prep');}
    if(req.form==='diced'||req.form==='grated'){await go('prepared');await action('process-'+(req.form==='diced'?'dice':'grate'))}
    if(req.heat&&req.heat!=='raw'){await go('prepared');await action('process-'+(req.heat==='toasted'?'toast':'roast'))}
    await go('bowl');const count=Math.min(left,(await state()).held.count);for(let n=0;n<count;n++)await action('add');left-=count;
    if((await state()).held)await action('stage');
   }
  };
  const chooseMeasure=async(m)=>{await go('yogurt');for(let n=0;(await state()).tool!==m.unit&&n<4;n++)await action('tool');assert.equal((await state()).tool,m.unit);const liquid=m.liquid??'yogurt';for(let n=0;(await state()).liquid!==liquid&&n<3;n++)await action('liquid');assert.equal((await state()).liquid,liquid)};
  await page.goto(url);await page.click('#intro-map');assert.equal(await page.locator('[data-level]').count(),36);assert.equal(await page.locator('[data-level]:not(:disabled)').count(),1);await capture('map-new-save');await page.click('#close-map');await page.click('#start-btn');await page.click('#cook');await page.evaluate(()=>window.set_game_test_clock(true));
  await page.waitForFunction(()=>{const a=JSON.parse(window.render_game_to_text()).assets;return a.riggedCook&&a.realProp});
  assert.equal((await state()).assets.joints,65);
  for(let index=0;index<levels.length;index++){
   const level=levels[index];assert.equal((await state()).level,index+1);
   for(let order=0;order<level.recipes.length;order++){
    const r=level.recipes[order];assert.equal((await state()).order,order+1);
    if(!(await state()).bowl.clean){await go('sink');await action('wash')}
    let reqs=[r,...(r.extra??[])];if(r.layers)reqs=r.layers.map(f=>reqs.find(r=>r.food===f));
    for(const req of reqs)await cookIngredient(req);
    const measurements=r.dressings??(r.yogurt?[{...r.yogurt,liquid:r.sauce??'yogurt'}]:[]);
    for(const m of measurements){await chooseMeasure(m);for(let n=0;n<(m.amount??2);n++){if(n)await go('yogurt');await action('measure');await go('bowl');await action('add')}}
    await go('bowl');if(r.stir&&!r.blend)await action('stir');await action('lift');
    if(r.blend){await go('prepared');await action('process-blend')}
    if([1,7,14,17,22,27,33,36].includes(index+1)&&order===0)await capture(`level-${index+1}-ready`);
    await go('serve');await action('serve');
    assert.equal((await state()).orders[order].served,true,`serve level ${index+1} course ${order+1}: ${(await state()).phrase} ${(await state()).message}`);
   }
   const current=await state();assert.equal(current.mode,index===35?'complete':'between');assert.ok(current.campaign.completed.includes(index+1));assert.ok(current.campaign.unlocked>=Math.min(36,index+2));
   finished.push({level:index+1,orders:level.recipes.length,result:current.results.find(r=>r.shift===index+1)});console.log(`PASS level ${index+1}/36 · ${level.recipes.length} order(s)`);
   if((index+1)%6===0)await capture(`chapter-${level.venue+1}-complete`);
   if(index===0){await page.reload();await page.waitForSelector('#cook');assert.equal((await state()).level,1);assert.equal((await state()).campaign.unlocked,2);await page.click('#cook');await page.evaluate(()=>window.set_game_test_clock(true));await page.click('#levels-btn');assert.equal(await page.locator('[data-level]:not(:disabled)').count(),2);await page.click('[data-level="2"]');await page.click('#cook');await page.evaluate(()=>window.set_game_test_clock(true));}
   else if(index<35){await page.click('#next');await page.click('#cook')}
  }
  const final=await state();assert.equal(final.campaign.completed.length,36);assert.equal(final.campaign.unlocked,36);await page.click('#result-map');assert.equal(await page.locator('[data-level]:not(:disabled)').count(),36);await page.locator('[data-level="36"]').scrollIntoViewIfNeeded();await capture('map-complete-save');
  await page.click('[data-level="7"]');assert.equal((await state()).level,7);assert.equal((await state()).mode,'read');assert.equal((await state()).campaign.completed.length,36);await page.reload();assert.equal((await state()).level,7);assert.equal((await state()).campaign.completed.length,36);
  assert.deepEqual(errors,[]);fs.writeFileSync(root+'/work/campaign-browser-results.json',JSON.stringify({status:'pass',errors,finished,evidence,final},null,2));console.log('PASS all36 levels/60 orders; map unlock, save/reload/replay; no browser errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
