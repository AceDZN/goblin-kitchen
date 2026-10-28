import '@fontsource/heebo/400.css';
import '@fontsource/heebo/600.css';
import '@fontsource/heebo/800.css';
import './style.css';
import {Kitchen,levels,type Food,type Tool,type Mode} from './recipes';
import {venues,type Unit,type Liquid} from './catalog-types';
import {readProgress,newProgress,completeLevel,totalStars} from './campaign';
import {KitchenScene,type Station} from './scene';
import {initHost,parseLevelParam,postToHost,type HostMessage} from './host';
import * as T from 'three';
import {modelLibrary} from './model-library';

initHost('goblin-kitchen');
const game=new Kitchen();
const readLocal=(key:string)=>{try{return localStorage.getItem(key)}catch{return null}};
const writeLocal=(key:string,value:string)=>{try{localStorage.setItem(key,value)}catch{}};
let progress=readProgress(readLocal('gk-campaign-v1'),levels.length);
// Carry forward the completed opening shifts from the original five-level release.
if(!readLocal('gk-campaign-v1'))try{for(const r of JSON.parse(readLocal('goblin-kitchen-results')??'[]'))if(Number.isInteger(r.shift)&&r.shift>=1&&r.shift<=5)progress=completeLevel(progress,{...r,guided:r.shift===1,stars:1+Number(r.mistakes===0)+Number(r.seconds<=levels[r.shift-1].targetSeconds)},levels.length)}catch{progress=newProgress()}
try{for(const n of JSON.parse(readLocal('gk-seen-shifts')??'[]'))if(Number.isInteger(n)&&n>=0&&n<levels.length)game.priorAssistance.add(n)}catch{}
let hostReady=false,attemptOpen=false,levelStartedAt=0;
const hostQueue:HostMessage[]=[];
function toHost(message:HostMessage){if(hostReady)postToHost(message);else hostQueue.push(message)}
function markReady(){if(hostReady)return;hostReady=true;postToHost({type:'ready'});for(const m of hostQueue.splice(0))postToHost(m)}
function syncHostLevel(){if(attemptOpen&&game.mode==='play'){attemptOpen=false;levelStartedAt=performance.now();toHost({type:'level-start',level:game.shift+1})}}
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<canvas id="game" aria-label="מטבח תלת ממדי. אפשר לנוע במקלדת או ללחוץ על תחנה."></canvas>
<header><div class="brand"><b dir="ltr">GOBLIN<br>KITCHEN<span>מטבח הגובלינים</span></b></div><div class="shift" dir="ltr"><span id="shift"></span><b id="tips"></b></div><nav><button id="levels-btn" title="מפת שלבים">שלבים</button><button id="read" title="מתכון והפסקה">מתכון</button><button id="pause" aria-label="הפסקה">Ⅱ</button><button id="mute" aria-label="צליל">♫</button><button id="settings" aria-label="הגדרות">⚙</button></nav></header>
<aside id="recipe" dir="ltr"><div id="order-tabs"></div><span class="eyebrow" id="recipe-label"></span><p id="service-brief"></p><p id="recipe-text"></p><div id="contents"></div><button id="audio" title="Read English recipe aloud">▶ Listen</button><button id="vocab" title="Vocabulary pauses the kitchen">מילים</button></aside>
<div id="toast" role="status"><span id="phrase" dir="ltr"></span><span id="message"></span></div>
<div id="context"><div id="carry" dir="ltr"></div><span id="context-title" dir="ltr"></span><div id="actions"></div><div id="work-progress"></div></div>
<div id="touch-move" aria-label="תנועה"><button data-dir="up">▲</button><div><button data-dir="left">◀</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div></div>
<div id="route" dir="rtl">לחצו על תחנה כדי ללכת · <b dir="ltr">WASD / חצים</b> תנועה · <b>E</b> פעולה · <b>Space</b> זריקה · <b>F</b> מסך מלא</div>
<div id="overlay"></div><div id="asset-note">טוענים את השף וכלי המטבח…</div>`;
const $=(id:string)=>document.getElementById(id)!;
let scene:KitchenScene;
try{scene=new KitchenScene($('game') as HTMLCanvasElement,game)}catch(e){app.innerHTML='<main class="error"><h1>אי אפשר לפתוח את המטבח</h1><p>הדפדפן צריך תמיכה ב־WebGL. נסו דפדפן מעודכן עם האצת חומרה.</p></main>';throw e}
let muted=readLocal('gk-muted')==='1';
let reduced=readLocal('gk-motion')==='1'||matchMedia('(prefers-reduced-motion:reduce)').matches;scene.reduced=reduced;
let audioContext:AudioContext|undefined,lastSignature='',keys=new Set<string>(),route:T.Vector3[]=[],heldDir='';
let job:{action:string;elapsed:number;duration:number}|null=null;
let vocabOpen=false,mapOpen=false,mapReturn:Mode='intro',lastStep=0,measuredFrames=0,measuredSeconds=0,measuredFPS=0,autoClock=true,stepping=false;
let servingVisual:T.Group|null=null,throwOrigin=new T.Vector3(),throwEnd=new T.Vector3(),celebration=0;
let cart:T.Group|undefined,cartBump=0,lastRenderedMode='';
const unitLabel:Record<Unit,string>={tablespoon:'tablespoon',cup:'cup',teaspoon:'teaspoon','half-cup':'½ cup'};
function measureLabel(amount:number,unit:Unit,liquid?:Liquid){const quantity=unit==='half-cup'?(amount===1?'½ cup':`${amount} × ½ cup`):`${amount} ${unitLabel[unit]}${amount===1?'':'s'}`;return quantity+(liquid?' of '+liquid:'')}
const toolLabel:Record<Tool,string>={dice:'Dice',grate:'Grate',toast:'Toast',roast:'Roast',blend:'Blend dish'};
const nextChoice=<T,>(list:T[],current:T)=>list[(Math.max(0,list.indexOf(current))+1)%list.length];
function sound(type='tap'){
 if(muted)return;try{audioContext??=new AudioContext();void audioContext.resume();const t=audioContext.currentTime;for(let i=0;i<(type==='serve'?4:1);i++){const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type==='error'?'sawtooth':'sine';osc.frequency.value=type==='error'?110:type==='serve'?440*2**(i/3):280+Math.random()*200;gain.gain.setValueAtTime(.0001,t+i*.1);gain.gain.exponentialRampToValueAtTime(.09,t+.01+i*.1);gain.gain.exponentialRampToValueAtTime(.0001,t+.18+i*.1);osc.connect(gain).connect(audioContext.destination);osc.start(t+i*.1);osc.stop(t+.2+i*.1)}}catch{}
}
function save(){
 const seen=[...new Set([...game.attemptedLevels,...game.priorAssistance,...game.priorMistakes,...game.events.filter(e=>e.action==='start').map(e=>e.shift-1)])];
 writeLocal('gk-seen-shifts',JSON.stringify(seen));writeLocal('goblin-kitchen-events',JSON.stringify(game.events));writeLocal('goblin-kitchen-results',JSON.stringify(game.results));writeLocal('gk-campaign-v1',JSON.stringify(progress));
}
function itemLabel(h:Kitchen['held']):string{
 if(!h)return 'ידיים פנויות';if(h.food==='dish')return game.dish.blended?'BLENDED DISH · ready to carry':game.dish.pureed?'PUREED DISH · contains additions':'DISH · ready to carry';
 if(h.food==='yogurt')return measureLabel(1,h.unit,h.liquid??'yogurt');
 const heat=h.heat&&h.heat!=='raw'?h.heat+' ':'';
 if(h.food==='bread'){const head=h.form==='whole'?(h.count===1?'loaf':'loaves'):(h.count===1?'slice':'slices');return `${h.count} ${heat}${head} of bread`}
 const plural=h.food==='potato'?'potatoes':h.food==='tomato'?'tomatoes':h.food+'s';return `${h.count} ${heat}${h.form} ${h.count===1?h.food:plural}`;
}
function bowlLabel(){
 const d=game.dish;const groups:Record<string,typeof d.items[number]>={};for(const i of d.items){const k=i.food+i.form+i.heat;groups[k]=groups[k]?{...groups[k],count:groups[k].count+i.count}:{...i}}
 const liquids:Record<string,{unit:Unit;liquid:Liquid;amount:number}>={};for(const m of d.yogurt){const liquid=m.liquid??'yogurt',key=liquid+m.unit;liquids[key]??={unit:m.unit,liquid,amount:0};liquids[key].amount+=m.amount}
 return [`IN BOWL · ${d.clean?'CLEAN':'DIRTY'}`,Object.keys(groups).length?Object.values(groups).map(i=>itemLabel(i)).join(', '):'empty',...Object.values(liquids).map(m=>measureLabel(m.amount,m.unit,m.liquid)),d.blended?'blended':d.pureed?'pureed · additions not blended':d.stirred?'stirred':'',game.staged[game.order]?'TRAY: '+itemLabel(game.staged[game.order]):''].filter(Boolean).join(' · ');
}
function buttons(s?:Station){
 if(!s)return [];switch(s.id){
 case 'fruit':return game.spec.pantry.filter(f=>f!=='bread').map((f,i)=>({id:'take-'+f,label:`${i===0?'E · ':''}Take ${f}`}));
 case 'bread':return [{id:'bread',label:'E · Take loaf'}];
 case 'board':return [{id:'prep',label:`E · ${game.held?.food==='banana'&&game.held.form==='whole'?'Peel':'Prepare / slice'}`}];
 case 'yogurt':return [{id:'measure',label:`E · Measure ${measureLabel(1,game.tool)}`},...(game.spec.units.length>1?[{id:'tool',label:`Use ${unitLabel[nextChoice(game.spec.units,game.tool)]}`}]:[]),...(game.spec.liquids.length>1?[{id:'liquid',label:`Choose ${nextChoice(game.spec.liquids,game.liquid)}`}]:[])];
 case 'prepared':return game.spec.tools.length?game.spec.tools.map((t,i)=>({id:'process-'+t,label:`${i===0?'E · ':''}${toolLabel[t]}`})):game.spec.pantry.includes('pear')?[{id:'pear-whole',label:'E · Take whole pear'},{id:'pear-prepared',label:'Take prepared pear'}]:[];
 case 'bowl':return game.held?.food==='dish'?[{id:'stage',label:'E · Put dish down'}]:game.held?[{id:'add',label:'E · Add'},{id:'stage',label:'Park on tray'}]:[{id:'stir',label:'E · Stir gently'},{id:'lift',label:'Take dish'},{id:'remove',label:'Remove 1 measure'},...(game.staged[game.order]?[{id:'stage',label:'Take from tray'}]:[])];
 case 'serve':return [{id:'serve',label:'E · Toss & serve'}];
 case 'sink':return [{id:'wash',label:game.held?'E · Discard held item':'E · Empty & wash'}];default:return [];
 }
}
function act(action:string){
 if(game.mode!=='play'||job||mapOpen||vocabOpen)return;
 const station=action.startsWith('take-')?'fruit':action.startsWith('process-')?'prepared':({take:'fruit','pear-whole':'prepared','pear-prepared':'prepared',bread:'bread',prep:'board',measure:'yogurt',tool:'yogurt',liquid:'yogurt',add:'bowl',stir:'bowl',lift:'bowl',remove:'bowl',stage:'bowl',serve:'serve',wash:'sink'} as Record<string,string>)[action];
 if(scene.nearest()?.id!==station)return;
 sound();game.message='';game.phrase='';
 if(action.startsWith('take-')){const food=action.slice(5) as Food;if(game.spec.pantry.includes(food))game.take(food)}
 else if(action.startsWith('process-')){const t=action.slice(8) as Tool;if(game.spec.tools.includes(t))job={action,elapsed:0,duration:t==='roast'?1.8:t==='toast'?1.4:1};}
 else switch(action){
 case 'take':game.take(game.spec.pantry.find(f=>f!=='bread')??'banana');break;
 case 'pear-whole':game.take('pear');break;case 'pear-prepared':game.take('pear',true);break;case 'bread':game.take('bread');break;
 case 'prep':job={action,elapsed:0,duration:game.held?.food==='pear'?1.4:.65};break;
 case 'measure':game.yogurt();break;case 'tool':game.tool=nextChoice(game.spec.units,game.tool);break;case 'liquid':game.liquid=nextChoice(game.spec.liquids,game.liquid);break;
 case 'add':game.add();break;case 'stir':job={action,elapsed:0,duration:.9};break;case 'lift':game.lift();if(game.held?.food==='dish'){const hatch=scene.stations.find(s=>s.id==='serve')!;scene.look=Math.atan2(hatch.pos.x-scene.position.x,hatch.pos.z-scene.position.z);scene.player.rotation.y=scene.look}break;case 'remove':game.remove();break;case 'stage':game.stage();break;case 'wash':job={action,elapsed:0,duration:.6};break;
 case 'serve':if(game.held?.food!=='dish'){game.message='הרימו את המנה ב־MIX והביאו לחלון.';break}job={action,elapsed:0,duration:.8};throwDish();break;
 }
 scene.sync();save();ui(true);
}
function throwDish(){
 const g=new T.Group();scene.makeBowl(g);const contents=scene.bowlContents.clone(true);contents.traverse(o=>{if(o instanceof T.Mesh)o.geometry=o.geometry.clone()});g.add(contents);g.scale.setScalar(.72);scene.held.getWorldPosition(throwOrigin);const hatch=scene.stations.find(s=>s.id==='serve')!;throwEnd.copy(hatch.pos).add(new T.Vector3(.85,1.4,0));g.position.copy(throwOrigin);scene.scene.add(g);servingVisual=g;scene.held.visible=false;scene.player.rotation.y=Math.atan2(throwEnd.x-scene.position.x,throwEnd.z-scene.position.z);
}
function animateThrow(t:number){if(!servingVisual)return;const p=Math.min(1,t);servingVisual.position.lerpVectors(throwOrigin,throwEnd,p);if(!reduced){servingVisual.position.y+=Math.sin(p*Math.PI)*1.1;servingVisual.rotation.z=Math.sin(p*Math.PI)*.15}}
function clearThrow(){if(servingVisual){scene.clearGroup(servingVisual);scene.scene.remove(servingVisual);servingVisual=null}scene.held.visible=true}
function openLevel(index:number,deepLink=false){
 if(index<0||index>=levels.length||!deepLink&&index+1>progress.unlocked)return;
 keys.clear();heldDir='';route=[];job=null;celebration=0;clearThrow();vocabOpen=false;mapOpen=false;cartBump=0;
 game.enter(index);scene.layout(index);scene.sync();scene.render();attemptOpen=true;progress.lastLevel=index+1;save();
 const url=new URL(location.href);url.searchParams.set('level',String(index+1));history.replaceState(null,'',url);ui(true);
}
function showMap(){if(mapOpen)return;mapReturn=game.mode;game.mode='pause';mapOpen=true;keys.clear();heldDir='';ui(true)}
function closeMap(){mapOpen=false;game.mode=mapReturn;ui(true)}
function pathTo(goal:T.Vector3){
 const step=.4,coord=(p:T.Vector3)=>[Math.round((p.x+6)/step),Math.round((p.z+4.4)/step)],world=(x:number,z:number)=>new T.Vector3(x*step-6,0,z*step-4.4);
 const [sx,sz]=coord(scene.position),[gx,gz]=coord(goal),key=(x:number,z:number)=>`${x},${z}`;
 const prev=new Map<string,string>(),queue:[number,number][]=[[sx,sz]],seen=new Set([key(sx,sz)]);let found='';
 for(let n=0;n<queue.length;n++){const [x,z]=queue[n];if(x===gx&&z===gz){found=key(x,z);break}for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(nx<0||nx>30||nz<0||nz>22||seen.has(k)||scene.collision(world(nx,nz)))continue;seen.add(k);prev.set(k,key(x,z));queue.push([nx,nz])}}
 if(!found)return [goal];const pts:T.Vector3[]=[];while(found!==key(sx,sz)){const [x,z]=found.split(',').map(Number);pts.push(world(x,z));found=prev.get(found)!}pts.reverse();pts.push(goal);return pts;
}
($('game') as HTMLCanvasElement).addEventListener('pointerdown',e=>{if(game.mode!=='play'||mapOpen||vocabOpen||job)return;const hit=scene.pointer(e.clientX,e.clientY);if(hit?.station){route=pathTo(hit.station.approach);scene.target=hit.station.approach}else if(hit&&!scene.collision(hit.point))route=pathTo(hit.point)});
const stars=(n:number)=>'★'.repeat(n)+'☆'.repeat(3-n);
function campaignMap(){return `<section class="campaign-panel" dir="rtl"><div class="map-head"><div><span class="kicker" dir="ltr">THE KITCHEN JOURNEY</span><h2>מהסמטה אל המשתה.</h2><p><bdi dir="ltr">${Object.keys(progress.completed).length} / ${levels.length}</bdi> שלבים הושלמו · <bdi dir="ltr">${totalStars(progress)} / ${levels.length*3} ★</bdi></p></div><button id="close-map">חזרה</button></div><p class="map-note">ממשיכים לפי ההתקדמות. אפשר לחזור לכל שלב שכבר נפתח. ההתקדמות נשמרת במכשיר הזה.</p>${venues.map((v,chapter)=>`<section class="chapter"><div class="chapter-heading"><b>${v.he}</b><span dir="ltr">${v.subtitle}</span></div><div class="level-grid">${levels.slice(chapter*6,chapter*6+6).map((l,j)=>{const n=chapter*6+j+1,r=progress.completed[n],locked=n>progress.unlocked;return `<button data-level="${n}" ${locked?'disabled':''} class="level-tile ${r?'done':''} ${n===progress.lastLevel?'current':''}" aria-label="שלב ${n}: ${l.he}${locked?' · נעול':r?' · הושלם':''}"><b>${n.toString().padStart(2,'0')}</b><span dir="ltr">${l.name}</span><small>${locked?'ייפתח בהמשך':r?stars(r.stars):'פתוח למשחק'}</small></button>`}).join('')}</div></section>`).join('')}</section>`}
function ui(force=false){
 syncHostLevel();const s=scene.nearest();const sig=[game.mode,game.shift,game.order,game.tips,game.message,JSON.stringify(game.held),JSON.stringify(game.dishes),JSON.stringify(game.staged),s?.id,game.tool,game.liquid,vocabOpen,mapOpen,muted,celebration>0,Object.keys(progress.completed).length].join('|');if(!force&&sig===lastSignature)return;lastSignature=sig;
 $('shift').textContent=`LEVEL ${game.shift+1} / ${levels.length} · ${venues[game.spec.venue].name}`;
 $('tips').textContent=`${game.tips} TIPS · ${totalStars(progress)} ★`;
 $('recipe-label').textContent=`${game.recipe.title??'ORDER '+(game.order+1)} · ${game.dishes.filter(d=>d.served).length} / ${game.dishes.length} served`;
 $('recipe-text').textContent=game.recipe.text;$('service-brief').textContent=game.spec.brief??'';$('service-brief').hidden=!game.spec.brief;$('contents').textContent=bowlLabel();
 $('order-tabs').innerHTML=game.dishes.length>1?game.spec.recipes.map((r,i)=>`<button data-order="${i}" class="${game.order===i?'active':''}" ${game.dishes[i].served?'disabled':''}>${r.title??'ORDER '+(i+1)} ${game.dishes[i].served?'✓':''}</button>`).join(''):'';
 $('message').textContent=game.message;$('phrase').textContent=game.phrase;$('toast').classList.toggle('visible',!!game.message);$('carry').textContent=itemLabel(game.held);
 $('context-title').textContent=s?.id==='yogurt'?`MEASURE · ${game.liquid} · ${unitLabel[game.tool]}`:s?.label??'CLICK A STATION · WALK TO IT';$('actions').innerHTML=buttons(s).map(b=>`<button data-action="${b.id}">${b.label}</button>`).join('');$('mute').textContent=muted?'♪̸':'♫';document.documentElement.style.setProperty('--action-height',`${$('context').offsetHeight}px`);
 const overlay=$('overlay'),visible=mapOpen||vocabOpen||(game.mode!=='play'&&celebration<=0);overlay.classList.toggle('visible',visible);overlay.classList.toggle('map-open',mapOpen);
 if(!visible){overlay.innerHTML='';return}if(mapOpen){overlay.innerHTML=campaignMap();return}
 if(vocabOpen){overlay.innerHTML=`<section class="panel"><span class="kicker" dir="ltr">WORDS · הפעולה מושהית</span><h2>מילים למטבח</h2><div class="words" dir="ltr">peel · לקלף<br>slice · לפרוס / פרוסה<br>dice · לחתוך לקוביות<br>grate · לגרר<br>toast / roast · לקלות / לצלות<br>blend · לטחון בבלנדר<br>loaf / loaves · כיכר / כיכרות<br>tablespoon / teaspoon · כף / כפית מדידה<br>half a cup · חצי כוס מדידה<br>broth / oil · ציר / שמן<br>before / after · לפני / אחרי<br>prepared · מוכן אחרי הכנה<br>a little · מעט, בלי מספר מדויק</div>${!game.spec.transfer&&game.spec.hint?`<p>${game.spec.hint}</p>`:'<p>עזרת מילים מסמנת את הניסיון כנעזר.</p>'}<button id="close-vocab" class="primary">חזרה למטבח</button></section>`;return}
 if(game.mode==='intro'){overlay.innerHTML=`<section class="panel intro"><span class="kicker" dir="ltr">36 LEVELS. SIX KITCHENS. ONE CHEF.</span><h1 dir="ltr">Goblin<br><em>Kitchen.</em></h1><p>מהזמנה קטנה בסמטה אל המשתה המלכותי.<br>מתכונים, כלים ואתגרים חדשים ככל שמתקדמים.</p><button id="start-btn" class="primary">${progress.unlocked>1?'ממשיכים בשלב '+progress.lastLevel:'פותחים את המטבח'} ←</button><button id="intro-map">מפת השלבים</button><p class="small">לחצו על תחנה כדי ללכת ובחרו פעולה.<br>אפשר גם בחצים או WASD ובמקש E.</p></section>`}
 else if(game.mode==='read'){overlay.innerHTML=`<section class="panel read"><span class="kicker" dir="ltr">LEVEL ${game.shift+1} / ${levels.length} · ${venues[game.spec.venue].name}</span><h2>${game.spec.he}</h2>${game.spec.brief?`<p class="service-instruction" dir="ltr">${game.spec.brief}</p>`:''}<p class="english" dir="ltr">${game.recipe.text}</p><p>${game.spec.intro}</p><p class="small">הפעולה מושהית בזמן הקריאה. ״מתכון״ עוצר בכל רגע.<br>יעד קצב לכוכב נוסף: <bdi dir="ltr">${game.spec.targetSeconds}s</bdi> · אפשר להשלים גם בלי למהר.</p><div class="panel-actions"><button id="reposition">הזזת PREP</button><button id="cook" class="primary">מבשלים ←</button></div></section>`}
 else if(game.mode==='between'||game.mode==='complete'){const r=game.results.find(r=>r.shift===game.shift+1)!;const nextVenue=levels[game.shift+1]?.venue;overlay.innerHTML=`<section class="panel"><span class="kicker" dir="ltr">${game.mode==='complete'?'THE ROYAL FEAST IS SERVED.':'LEVEL COMPLETE'}</span><div class="earned-stars" dir="ltr">${stars(r.stars)}</div><h2>${game.mode==='complete'?'36 שלבים. שף אחד.':'הלקוחות מבסוטים.'}</h2><p>שלב ${game.shift+1} הושלם · ${r.seconds} שניות בישול<br>${r.guided?'תרגול מודרך':r.unaided?'הבנת מתכון: החלטה ראשונה ללא עזרה':'הבנת מתכון: תרגול עם עזרה או תיקון'}<br>ביצוע: ${r.mistakes} תיקונים</p>${game.mode==='between'&&nextVenue!==game.spec.venue?`<p class="next-venue">המטבח הבא: ${venues[nextVenue].he}</p>`:''}<p class="small">כוכבים: השלמה · ללא תיקונים · עמידה ביעד הקצב.<br>עזרה מתועדת בנפרד מהביצוע. ההתקדמות נשמרה.</p><div class="panel-actions"><button id="result-map">מפת השלבים</button>${game.mode==='between'?'<button id="next" class="primary">לשלב הבא ←</button>':'<button id="restart" class="primary">שוב המשתה ←</button>'}</div></section>`}
 else{overlay.innerHTML=`<section class="panel"><span class="kicker" dir="ltr">KITCHEN PAUSED · LEVEL ${game.shift+1}</span><h2>הסירים יכולים לחכות.</h2><button id="resume" class="primary">ממשיכים ←</button><button id="restart">ניסיון חדש בשלב הזה</button><button id="pause-map">מפת השלבים</button><button id="motion">${reduced?'הפעלת תנועה':'הפחתת תנועה'}</button><p class="small">הכוכבים והשלבים שפתחתם נשמרים גם בניסיון חדש.</p></section>`}
}
app.addEventListener('click',e=>{
 const b=(e.target as HTMLElement).closest('button');if(!b)return;sound();
 if(b.dataset.level){openLevel(Number(b.dataset.level)-1);return}if(b.dataset.action){act(b.dataset.action);return}if(b.dataset.order){if(!job&&celebration<=0&&!mapOpen&&!vocabOpen)game.selectOrder(Number(b.dataset.order));ui(true);return}
 switch(b.id){
 case 'start-btn':openLevel(progress.lastLevel-1);return;
 case 'levels-btn':case 'intro-map':case 'result-map':case 'pause-map':showMap();return;
 case 'close-map':closeMap();return;
 case 'cook':case 'resume':game.start();break;
 case 'read':if(!mapOpen&&['play','read','pause'].includes(game.mode))game.mode=game.mode==='play'?'read':'play';break;
 case 'pause':case 'settings':if(!mapOpen&&['play','read','pause'].includes(game.mode))game.mode=game.mode==='play'?'pause':'play';break;
 case 'next':if(game.mode==='between')openLevel(game.shift+1);return;
 case 'restart':game.priorAssistance.add(game.shift);openLevel(game.shift,true);return;
 case 'mute':muted=!muted;if(muted)window.speechSynthesis?.cancel();writeLocal('gk-muted',muted?'1':'0');break;
 case 'motion':reduced=!reduced;scene.reduced=reduced;writeLocal('gk-motion',reduced?'1':'0');break;
 case 'vocab':if(['play','read','pause'].includes(game.mode)){game.help();vocabOpen=true}break;
 case 'close-vocab':vocabOpen=false;break;
 case 'audio':if(!muted&&'speechSynthesis'in window){speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance([game.spec.brief,game.recipe.text].filter(Boolean).join(' '));utter.lang='en-US';utter.rate=.83;speechSynthesis.speak(utter);if(['play','read','pause'].includes(game.mode))game.mode='read'}break;
 case 'reposition':if(game.mode==='read'){scene.reposition();route=[];scene.render()}break;
 }save();ui(true);
});
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-dir]')){b.addEventListener('pointerdown',e=>{e.preventDefault();heldDir=b.dataset.dir!;b.setPointerCapture(e.pointerId);route=[]});b.addEventListener('pointerup',()=>heldDir='');b.addEventListener('pointercancel',()=>heldDir='')}
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;keys.add(e.code);if(e.code==='Escape'||e.code==='KeyP'){if(mapOpen)closeMap();else if(vocabOpen)vocabOpen=false;else if(game.mode==='play')game.mode='pause';else if(game.mode==='pause')game.start()}if(e.code==='KeyF'){if(document.fullscreenElement)void document.exitFullscreen();else void app.requestFullscreen()}if(e.code==='KeyE'&&game.mode==='play'){const list=buttons(scene.nearest());if(list[0])act(list[0].id)}if(e.code==='Space'&&game.mode==='play'&&scene.nearest()?.id==='serve')act('serve');ui()});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();heldDir='';if(game.mode==='play'){game.mode='pause';ui(true)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.mode==='play'){game.mode='pause';ui(true)}});
function finishJob(action:string){
 if(action==='prep')game.board();if(action==='stir')game.stir();if(action==='wash')game.wash();if(action.startsWith('process-'))game.process(action.slice(8) as Tool);
 if(action==='serve'){
  const success=game.serve();
  if(success&&(game.mode==='between'||game.mode==='complete')){const result=game.results.find(r=>r.shift===game.shift+1)!;progress=completeLevel(progress,result,levels.length);toHost({type:'level-complete',level:result.shift,stars:result.stars,score:Math.max(0,game.dishes.length*50-result.mistakes*5),durationMs:Math.round(performance.now()-levelStartedAt)});}
  scene.burst(success);sound(success?'serve':'error');if(success){celebration=.55;scene.cheerTime=.8}else{throwOrigin.copy(throwEnd);throwEnd.copy(scene.stations.find(s=>s.id==='bowl')!.pos).add(new T.Vector3(0,1.2,0));job={action:'return',elapsed:0,duration:.55};}
 }
 if(action==='return')clearThrow();sound();save();ui(true);
}
function update(dt:number){
 dt=Math.min(.05,dt);
 if((game.mode==='play'||celebration>0)&&!vocabOpen&&!mapOpen){
  if(celebration>0){celebration=Math.max(0,celebration-dt);if(celebration===0)clearThrow()}
  game.tick(dt);
  if(job){scene.moving=false;job.elapsed+=dt;if(job.action==='serve'||job.action==='return')animateThrow(job.elapsed/job.duration);$('work-progress').style.width=`${Math.min(100,job.elapsed/job.duration*100)}%`;if(job.elapsed>=job.duration){const action=job.action;job=null;$('work-progress').style.width='0';finishJob(action)}}
  else if(celebration<=0){
   let dx=Number(keys.has('KeyD')||keys.has('ArrowRight')||heldDir==='right')-Number(keys.has('KeyA')||keys.has('ArrowLeft')||heldDir==='left');
   let dz=Number(keys.has('KeyS')||keys.has('ArrowDown')||heldDir==='down')-Number(keys.has('KeyW')||keys.has('ArrowUp')||heldDir==='up');
   if(dx||dz)route=[];else if(route.length){const dest=route[0],dist=dest.distanceTo(scene.position);if(dist<.12)route.shift();else{dx=dest.x-scene.position.x;dz=dest.z-scene.position.z}}
   scene.move(dx,dz,dt);
  }
  const traffic=game.spec.cart;
  if(traffic>0){if(!cart){cart=new T.Group();scene.scene.add(cart);scene.model('world/wheelbarrow',cart,0,0,0,[1.15,.8,.75],Math.PI/2)}cart.visible=true;cart.position.set(Math.sin(game.seconds*(.35+traffic*.45)+Math.PI/2)*2.5,0,.65);cartBump=Math.max(0,cartBump-dt);if(!job&&scene.position.distanceTo(cart.position)<.85&&cartBump===0){cartBump=3;const p=scene.position.clone();p.z+=.6;if(!scene.collision(p))scene.position.copy(p);game.message='העגלה דחפה אתכם! המצרכים נשארו בידיים.';sound('error')}}else if(cart)cart.visible=false;
  scene.tick(dt);if(job?.action==='serve'||job?.action==='return'){scene.held.visible=false;scene.bowl.visible=false}ui();
 }else{scene.moving=false;scene.sync()}
 if(!stepping&&(game.mode==='play'||celebration>0||lastRenderedMode!==game.mode)){scene.render();lastRenderedMode=game.mode}
}
function frame(t:number){const realDt=(t-lastStep)/1000||1/60;lastStep=t;if(autoClock)update(Math.min(realDt,.05));measuredFrames++;measuredSeconds+=realDt;if(measuredSeconds>2){measuredFPS=measuredFrames/measuredSeconds;measuredFrames=0;measuredSeconds=0}requestAnimationFrame(frame)}
Object.assign(window,{
 render_game_to_text:()=>JSON.stringify({mode:game.mode,mapOpen,vocabularyOpen:vocabOpen,level:game.shift+1,shift:game.shift+1,totalLevels:levels.length,campaign:{unlocked:progress.unlocked,completed:Object.keys(progress.completed).map(Number),stars:totalStars(progress),lastLevel:progress.lastLevel},venue:venues[game.spec.venue].name,venueIndex:game.spec.venue,layout:game.spec.layout,pantry:game.spec.pantry,availableTools:game.spec.tools,availableUnits:game.spec.units,availableLiquids:game.spec.liquids,order:game.order+1,objective:game.recipe.text,serviceBrief:game.spec.brief??'',coordinateSystem:'x right, z toward near edge; origin floor center; y up',player:{x:+scene.position.x.toFixed(2),z:+scene.position.z.toFixed(2)},held:game.held,bowl:game.dish,orders:game.dishes,staged:game.staged,tool:game.tool,liquid:game.liquid,near:scene.nearest()?.id??null,stations:scene.stations.map(s=>({id:s.id,x:s.pos.x,z:s.pos.z,screen:scene.stationScreen(s.id)})),message:game.message,phrase:game.phrase,actions:buttons(scene.nearest()),tips:game.tips,mistakes:game.mistakes,assisted:game.assisted,firstAttemptUnaided:game.firstUnaided,guided:!!game.spec.guided,seconds:+game.seconds.toFixed(1),targetSeconds:game.spec.targetSeconds,results:game.results,assets:{realCook:scene.realCook,riggedCook:scene.riggedCook,joints:scene.jointCount,clips:scene.clipNames,activeAnimation:scene.activeAnimation,realProp:scene.realProp,worldReady:scene.worldReady,authoredModels:scene.authoredInstances,libraryNames:modelLibrary.names,missingModels:[...scene.missingModels],venueVisuals:scene.venueVisuals,status:scene.modelStatus},fps:+measuredFPS.toFixed(1),job:job?.action??null,serving:servingVisual?{phase:job?.action??'caught',x:+servingVisual.position.x.toFixed(2),y:+servingVisual.position.y.toFixed(2),z:+servingVisual.position.z.toFixed(2),target:{x:throwEnd.x,z:throwEnd.z}}:null}),
 advanceTime:(ms:number)=>{stepping=true;try{for(let t=0;t<ms;t+=1000/60)update(Math.min(1000/60,ms-t)/1000)}finally{stepping=false;scene.render()}},set_game_test_clock:(enabled:boolean)=>{autoClock=!enabled}
});
new ResizeObserver(()=>document.documentElement.style.setProperty('--action-height',`${$('context').offsetHeight}px`)).observe($('context'));
const deepLevel=parseLevelParam(location.search,levels.length);if(deepLevel!==null)openLevel(deepLevel,true);else{scene.layout(0);ui(true)}
requestAnimationFrame(frame);
Promise.all([
 scene.loadWorld(),
 fetch(`${import.meta.env.BASE_URL}models/manifest.json`).then(r=>{if(!r.ok)throw new Error('Cook manifest unavailable');return r.json()}).then(m=>scene.loadModels(`${import.meta.env.BASE_URL}${m.cook}`,`${import.meta.env.BASE_URL}${m.prop}`,m.clips))
]).then(()=>{
 $('asset-note').hidden=scene.worldReady&&scene.riggedCook&&scene.realProp;
 if(!$('asset-note').hidden)throw new Error('Some kitchen assets did not load');
 scene.modelStatus='Authored kitchen, food and surrounding world; rigged Tripo cook and ceramic bowl';
}).catch(error=>{console.error('Kitchen asset loading',error);$('asset-note').textContent='לא ניתן לטעון את המטבח. נסו לרענן.'}).finally(markReady);
