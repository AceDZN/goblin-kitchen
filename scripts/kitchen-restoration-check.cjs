// Independent restoration checks. All cooking/movement uses normal input.
// The text hook and projected bounds are observations; advanceTime only advances the game's clock.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const url=process.argv.slice(2).find(v=>!v.startsWith('--'))||'http://127.0.0.1:5201';
const only=process.argv.find(v=>v.startsWith('--only='))?.split('=')[1];
assert.ok(!only||['layout','gameplay'].includes(only));
const out=path.join(root,'docs/kitchen-restoration/independent-captures');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(root,'work'),{recursive:true});
const reportPath=path.join(root,'work/kitchen-restoration-independent-results.json');
const sourceDigest=createHash('sha256');for(const f of ['src/scene.ts','src/main.ts','src/style.css'])sourceDigest.update(fs.readFileSync(path.join(root,f)));
const report={status:'starting',startedAt:new Date().toISOString(),sourceDigest:sourceDigest.digest('hex'),scope:only||'all',errors:[],warnings:[],failedRequests:[],checks:[],evidence:[]};
const save=()=>fs.writeFileSync(reportPath,JSON.stringify(report,null,2));save();
const passed=(name,data)=>{report.checks.push({name,pass:true,data});save();console.log('PASS '+name)};
let activePage;
function watch(p){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text())});p.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));p.on('response',r=>{if(r.status()>=400)report.errors.push(`HTTP ${r.status()} ${r.url()}`)})}
function controls(p){
 const state=async()=>JSON.parse(await p.evaluate(()=>window.render_game_to_text()));
 const step=async(ms=1800)=>p.evaluate(ms=>window.advanceTime(ms),ms);
 const capture=async name=>{await p.waitForTimeout(120);await p.screenshot({path:path.join(out,name+'.png'),timeout:60000,scale:'css'});report.evidence.push({name,state:await state()});save()};
 const start=async level=>{const u=new URL(url);u.searchParams.set('level',String(level));await p.goto(u.href,{waitUntil:'networkidle',timeout:60000});await p.waitForFunction(()=>{const a=JSON.parse(window.render_game_to_text()).assets;return a.worldReady&&a.riggedCook&&a.realProp},null,{timeout:60000});await p.click('#cook');await p.evaluate(()=>window.set_game_test_clock(true));const s=await state();assert.equal(s.level,level);assert.equal(s.totalLevels,36);assert.equal(s.assets.joints,65);assert.equal(s.assets.clips.length,3);assert.deepEqual(s.assets.missingModels,[])};
 const go=async(id,label=false,touch=false)=>{const s=(await state()).stations.find(s=>s.id===id),pt=label?s.labelScreen:s.screen;assert.ok(pt,`${id} projected point`);if(touch)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);for(let n=0;n<24;n++){await step(400);if((await state()).near===id)return}assert.equal((await state()).near,id,`arrival from ${label?'label':'worktop'} click: ${id}`)};
 const action=async(id,ms=1800)=>{await p.locator(`[data-action="${id}"]`).click();await step(ms)};
 const take=async food=>{await go(food==='bread'?'bread':'fruit');await action(food==='bread'?'bread':'take-'+food)};
 const prepare=async()=>{await go('board');await action('prep')};
 const add=async()=>{await go('bowl');await action('add')};
 const measure=async(n,unit='tablespoon')=>{for(let i=0;i<n;i++){await go('yogurt');for(let c=0;(await state()).tool!==unit&&c<4;c++)await action('tool',10);assert.equal((await state()).tool,unit);await action('measure');await add()}};
 const canvasHash=async()=>createHash('sha256').update(await p.evaluate(()=>{window.advanceTime(0);return document.querySelector('#game').toDataURL('image/png')})).digest('hex');
 const crop=async(name,bounds)=>{assert.ok(bounds&&bounds.width&&bounds.height,'observable prop bounds');const box={x:Math.max(0,bounds.x-8),y:Math.max(0,bounds.y-8),width:bounds.width+16,height:bounds.height+16};const data=await p.evaluate(box=>{window.advanceTime(0);const source=document.querySelector('#game'),ratio=source.width/source.clientWidth,c=document.createElement('canvas');c.width=Math.max(1,Math.round(box.width*ratio));c.height=Math.max(1,Math.round(box.height*ratio));c.getContext('2d').drawImage(source,box.x*ratio,box.y*ratio,box.width*ratio,box.height*ratio,0,0,c.width,c.height);return c.toDataURL('image/png')},box);const buffer=Buffer.from(data.split(',')[1],'base64');fs.writeFileSync(path.join(out,name+'.png'),buffer);report.evidence.push({name,clip:box,state:await state()});save();return createHash('sha256').update(buffer).digest('hex')};
 return {state,step,capture,start,go,action,take,prepare,add,measure,canvasHash,crop};
}
async function textVisibility(p){return p.evaluate(()=>{
 const el=document.querySelector('#recipe-text'),node=el.firstChild,style=getComputedStyle(el),viewport={left:0,top:0,right:innerWidth,bottom:innerHeight};let clip={...viewport};
 for(let a=el;a;a=a.parentElement){const s=getComputedStyle(a);if(a===el||/(auto|scroll|hidden|clip)/.test(s.overflow+s.overflowX+s.overflowY)){const r=a.getBoundingClientRect();clip={left:Math.max(clip.left,r.left),top:Math.max(clip.top,r.top),right:Math.min(clip.right,r.right),bottom:Math.min(clip.bottom,r.bottom)}}}
 const words=[...el.textContent.matchAll(/\S+/g)].map(m=>{const range=document.createRange();range.setStart(node,m.index);range.setEnd(node,m.index+m[0].length);const rects=[...range.getClientRects()];return {text:m[0],visible:rects.length>0&&rects.every(r=>r.left>=clip.left-.5&&r.right<=clip.right+.5&&r.top>=clip.top-.5&&r.bottom<=clip.bottom+.5&&el.contains(document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2)))}});
 return {fontSize:parseFloat(style.fontSize),clip,words,visible:words.filter(w=>w.visible).length,total:words.length,text:el.textContent};
})}
async function layout(browser,width,height){
 const c=await browser.newContext({viewport:{width,height},...(width<761||height<500?{isMobile:true,hasTouch:true}:{})}),p=await c.newPage();activePage=p;watch(p);const a=controls(p),tag=`${width}x${height}`;
 try{for(const level of [1,36]){
  await a.start(level);await a.capture(`${tag}-level-${level}-overview`);
  for(let order=0;order<(level===36?3:1);order++){
   if(order)await p.locator(`[data-order="${order}"]`).click();await p.waitForTimeout(120);const top=await textVisibility(p);
   assert.ok(top.fontSize>=(width>=1000?16:14),`${tag}: English font ${top.fontSize}`);assert.ok(top.words.slice(0,Math.min(12,top.total)).every(w=>w.visible),`${tag} level${level} order${order+1}: first instructions hidden: ${JSON.stringify(top)}`);
   assert.equal(top.visible,top.total,`${tag}: complete pinned instruction visible without scrolling`);
   await a.capture(`${tag}-level-${level}-order-${order+1}-text`);
   await p.locator('#recipe').hover();await p.mouse.wheel(0,1500);await p.waitForTimeout(120);const tail=await textVisibility(p);assert.equal(tail.words.at(-1).visible,true,`${tag}: recipe ending reachable by normal scrolling`);await p.mouse.wheel(0,-2000);await p.waitForTimeout(100);
   passed(`${tag} level${level} order${order+1} visible English`,{font:top.fontSize,visibleInitially:top.visible,total:top.total,endingReachable:true});
  }
  if(level===36)await p.locator('[data-order="0"]').click();
  for(const st of (await a.state()).stations){
   const hits=await p.evaluate(s=>({center:document.elementFromPoint(s.screen.x,s.screen.y)?.id,label:document.elementFromPoint(s.labelScreen.x,s.labelScreen.y)?.id}),st);
   assert.equal(hits.center,'game',`${tag}: unoccluded ${st.id} worktop`);assert.equal(hits.label,'game',`${tag}: unoccluded ${st.id} label`);await a.go(st.id,true,width<761);
  }
  await a.capture(`${tag}-level-${level}-all-labels-routed`);passed(`${tag} level${level} all8 labels and worktops clear`);
 }
 }finally{await c.close();activePage=null}
}
async function gameplay(browser){
 const c=await browser.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();activePage=p;watch(p);const a=controls(p);
 try{
  await a.start(1);await p.keyboard.down('KeyS');await a.step(110);await p.keyboard.up('KeyS');await p.keyboard.down('KeyA');await a.step(1340);await p.keyboard.up('KeyA');
  const crossed=await a.state();assert.ok(crossed.player.x<-5.8&&crossed.player.z>1.35&&crossed.player.z<1.65,`open gap traversal: ${JSON.stringify(crossed.player)}`);await a.capture('keyboard-open-gap-crossed');
  await p.keyboard.down('KeyA');await a.step(700);await p.keyboard.up('KeyA');assert.ok((await a.state()).player.x>=-6.36,'outer boundary still blocks movement');await p.keyboard.down('KeyD');await a.step(1400);await p.keyboard.up('KeyD');passed('keyboard crosses reopened gap; outer boundary retained',crossed.player);
  await a.take('banana');await a.go('board');const knife=(await a.state()).workVisuals.prepKnife;await p.click('[data-action="prep"]');await a.step(160);assert.equal((await a.state()).held.form,'whole');const k1=await a.crop('prep-knife-motion-a',knife);await a.step(170);const k2=await a.crop('prep-knife-motion-b',knife);assert.notEqual(k1,k2,'knife-region rendered motion');await a.step(500);assert.equal((await a.state()).held.form,'peeled');passed('prep pixels move before held form changes');
  await a.add();await a.measure(3);await a.go('bowl');const bowl=(await a.state()).workVisuals.bowl;await p.click('[data-action="stir"]');await a.step(180);const s1=await a.crop('stir-motion-a',bowl);await a.step(220);const s2=await a.crop('stir-motion-b',bowl);assert.notEqual(s1,s2,'bowl-region rendered motion');assert.equal((await a.state()).bowl.stirred,false);await a.step(650);assert.equal((await a.state()).bowl.stirred,true);passed('stir pixels move before completion');
  await a.action('lift');await a.capture('carry-wrong-dish');await a.go('serve',true);const tips=(await a.state()).tips;await p.click('[data-action="serve"]');await a.step(220);assert.equal((await a.state()).job,'serve');assert.equal((await a.state()).tips,tips);await a.capture('rejected-toss-midair');await p.keyboard.press('KeyP');const paused=await a.state(),hash=await a.canvasHash();await a.step(1600);assert.equal(await a.canvasHash(),hash);assert.equal((await a.state()).seconds,paused.seconds);assert.deepEqual((await a.state()).serving,paused.serving);await p.keyboard.press('KeyP');await a.step(680);assert.equal((await a.state()).job,'return');await a.capture('rejected-dish-return');await a.step(700);assert.equal((await a.state()).bowl.yogurt.length,3);assert.equal((await a.state()).mistakes,1);
  await a.go('bowl');await a.action('remove');await a.action('stir');await a.action('lift');await a.go('serve');await p.click('[data-action="serve"]');await a.step(250);assert.equal((await a.state()).tips,tips);await a.step(650);assert.equal((await a.state()).mode,'between');assert.ok((await a.state()).tips>tips);await a.capture('corrected-dish-caught');passed('visible toss, midair pause, rejected return and correction');
  await a.start(3);await p.click('#read');const baseline=(await a.state()).stations.find(s=>s.id==='board');await p.click('#reposition');assert.notEqual((await a.state()).stations.find(s=>s.id==='board').x,baseline.x);await p.click('#cook');await a.go('board',true);await a.capture('relocated-prep-label-arrival');await p.click('#pause');await p.click('#restart');assert.equal((await a.state()).level,3);assert.equal((await a.state()).stations.find(s=>s.id==='board').x,baseline.x);assert.equal((await a.state()).held,null);await p.click('#cook');await a.go('board',true);await a.capture('prep-reset-label-arrival');passed('relocated board and label route reset on current-level retry');
  await a.start(17);await a.take('banana');await a.prepare();await a.add();await a.take('pear');await a.prepare();await a.add();await a.measure(1,'half-cup');await a.go('bowl');await a.action('lift');await a.go('prepared');const bounds=(await a.state()).workVisuals.blender;assert.ok(bounds);const before=structuredClone((await a.state()).bowl.items);const idle1=await a.crop('blender-idle-a',bounds);await a.step(150);const idle2=await a.crop('blender-idle-b',bounds);
  await p.click('[data-action="process-blend"]');await a.step(150);assert.equal((await a.state()).held.food,'dish');assert.equal((await a.state()).bowl.blended,false);const b1=await a.crop('blender-motion-a',bounds);await a.step(170);const b2=await a.crop('blender-motion-b',bounds);assert.notEqual(b1,b2,'blender-region rendered motion');assert.deepEqual((await a.state()).bowl.items,before);await a.capture('blender-processing-held-dish');
  await p.keyboard.press('KeyP');const freeze=await a.canvasHash(),time=(await a.state()).seconds;await a.step(1800);assert.equal(await a.canvasHash(),freeze);assert.equal((await a.state()).seconds,time);assert.equal((await a.state()).bowl.blended,false);await a.capture('blender-paused');await p.keyboard.press('KeyP');await a.step(800);assert.equal((await a.state()).bowl.blended,true);assert.equal((await a.state()).held.food,'dish');await a.go('serve');await a.action('serve');assert.equal((await a.state()).mode,'between');passed('blender-region motion, held dish, pause pixel freeze, completion and service',{idleRegionStable:idle1===idle2});
 }finally{await c.close();activePage=null}
}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});try{
 if(!only||only==='layout')for(const [w,h]of [[1440,900],[960,600],[844,390],[390,844]])await layout(browser,w,h);
 if(!only||only==='gameplay')await gameplay(browser);
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.warnings,[]);assert.deepEqual(report.failedRequests,[]);report.status='pass';report.completedAt=new Date().toISOString();save();console.log('PASS kitchen restoration targeted checks; visual acceptance remains a separate human judgment.');
 }catch(error){report.status='failed';report.error=String(error);if(activePage)try{await activePage.screenshot({path:path.join(out,'failure.png'),timeout:60000})}catch{}save();throw error}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
