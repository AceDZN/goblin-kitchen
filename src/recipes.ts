/** Physical recipe rules, independent of rendering and school-grade selection. */
import {levels} from './levels';
import type {Food,Form,Unit,Liquid,Tool,Ingredient,Measure,Recipe} from './catalog-types';
import type {LevelResult} from './campaign';
export type {Food,Form,Unit,Liquid,Tool,Recipe} from './catalog-types';
export {levels};
/** Retained alias for the host bridge and earlier curriculum evidence. */
export const shifts=levels;
export type Item={food:Food;form:Form;count:number;preparedByPlayer?:boolean;heat?:'raw'|'toasted'|'roasted'};
export type Dish={items:Item[];yogurt:Measure[];stirred:boolean;blended:boolean;pureed?:boolean;blendedItems?:number;clean:boolean;served:boolean};
export const freshDish=():Dish=>({items:[],yogurt:[],stirred:false,blended:false,clean:true,served:false});
export const ingredients=(r:Recipe):Ingredient[]=>[{food:r.food,form:r.form,count:r.count,heat:r.heat,prepared:r.prepared},...(r.extra??[])];
export const measureVolume:Record<Unit,number>={tablespoon:1,teaspoon:1/3,'half-cup':8,cup:16};
export const measures=(r:Recipe):{liquid:Liquid;unit:Unit;amount?:number}[]=>r.dressings?.map(m=>({...m,liquid:m.liquid??'yogurt'}))??(r.yogurt?[{...r.yogurt,liquid:r.sauce??'yogurt'}]:[]);
function ingredientPhrase(req:Ingredient){
 const heat=req.heat&&req.heat!=='raw'?req.heat+' ':'';
 if(req.food==='bread'){const head=req.form==='whole'?(req.count===1?'loaf':'loaves'):(req.count===1?'slice':'slices');return `${req.count} ${heat}${head} of bread`}
 const plural=req.food==='tomato'?'tomatoes':req.food==='potato'?'potatoes':req.food+'s';return `${req.count} ${heat}${req.form} ${req.count===1?req.food:plural}`;
}
export function validateDish(d:Dish,r:Recipe):{ok:boolean;reason:string;phrase:string}{
 const bad=(reason:string,phrase:string)=>({ok:false,reason,phrase});
 if(!d.clean)return bad('הקערה מלוכלכת. רוקנו ושטפו בכיור.','a clean bowl');
 const wanted=ingredients(r);
 if(d.items.some(i=>!wanted.some(w=>w.food===i.food)))return bad('נכנס מרכיב שלא מופיע בהזמנה. רוקנו בכיור והכינו מחדש.',r.text);
 for(const req of wanted){const items=d.items.filter(i=>i.food===req.food);
  if(items.some(i=>i.form!==req.form||req.prepared&&!i.preparedByPlayer))return bad(req.food==='bread'?'פרוסה וכיכר הן צורות שונות. בדקו מה התבקשתם להגיש.':'בדקו את מצב המרכיב: שלם, מקולף, פרוס, חתוך לקוביות או מגורר.',req.prepared?`the ${req.food} that you prepared`:ingredientPhrase(req));
  if(items.some(i=>(i.heat??'raw')!==(req.heat??'raw')))return bad('בדקו אם המתכון מבקש מרכיב קלוי, צלוי או ללא חימום. השתמשו בכלי המתאים.',`${req.heat??'raw'} ${req.food}`);
  const n=items.reduce((a,i)=>a+i.count,0);if(n!==req.count)return bad(`כמות ${req.food} אינה מתאימה. בקערה יש ${n}. אפשר לרוקן ולהכין שוב.`,ingredientPhrase(req));
 }
 const expected=measures(r);
 if(d.yogurt.some(m=>!expected.some(e=>e.liquid===(m.liquid??'yogurt')&&(e.amount===undefined||e.unit===m.unit))))return bad('בדקו גם את הנוזל וגם את יחידת המדידה. הוציאו מנה עודפת ובחרו כלי מתאים.',expected.map(m=>m.amount===undefined?`a little ${m.liquid}`:`${m.unit} of ${m.liquid}`).join(', ')||'without sauce');
 for(const m of expected){const amount=d.yogurt.filter(x=>(x.liquid??'yogurt')===m.liquid&&(m.amount===undefined||x.unit===m.unit)).reduce((n,x)=>n+x.amount*(m.amount===undefined?measureVolume[x.unit]:1),0);if(m.amount===undefined?!Number.isFinite(amount)||amount<=0||amount>4+1e-9:amount!==m.amount)return bad(m.amount===undefined?'צריך מעט, בלי כלי או מספר מדויק. במשחק זו כמות חיובית עד נפח של ארבע כפות; גם כפיות יכולות להתאים.':'כמות המדידה אינה מתאימה. אפשר להוציא מנה, למדוד שוב ולערבב.',m.amount===undefined?`a little ${m.liquid}`:m.unit==='half-cup'?`${m.amount===1?'half a cup':m.amount+' half-cup measures'} of ${m.liquid}`:`${m.amount} ${m.unit}${m.amount===1?'':'s'} of ${m.liquid}`);}
 if(r.layers){const actual=d.items.flatMap(i=>Array.from({length:i.count},()=>i.food));const order=r.layers.flatMap(f=>Array.from({length:wanted.find(w=>w.food===f)?.count??0},()=>f));if(actual.join(',')!==order.join(','))return bad('הכמויות נכונות, אבל סדר השכבות שונה. הרכיבו מחדש לפי before / after.',r.layers.join(' → '));}
 if((r.blend!==true||r.layers)&&(d.blended||d.pureed))return bad('ההזמנה מבקשת חתיכות, אבל המנה נטחנה. רוקנו והכינו שוב בלי בלנדר.','serve the pieces');
 if(r.blend&&!d.blended)return bad('המנה עדיין לא נטחנה. הרימו אותה והביאו לבלנדר בתחנת TOOLS.','blend');
 if(r.stir&&!d.stirred)return bad('המרכיבים עוד לא עורבבו. ערבבו ליד MIX.','stir');
 return {ok:true,reason:'',phrase:''};
}
export function prepare(item:Item):Item|undefined{
 if(item.food==='banana'&&item.form==='whole')return {...item,form:'peeled',preparedByPlayer:true};
 if(item.food==='banana'&&item.form==='peeled')return {...item,form:'sliced',preparedByPlayer:true};
 if(item.food==='pear'&&item.form==='whole')return {...item,form:'prepared',preparedByPlayer:true};
 if(item.food==='bread'&&item.form==='whole')return {...item,form:'sliced',count:item.count*4,preparedByPlayer:true};
 if(item.form==='whole')return {...item,form:'sliced',preparedByPlayer:true};
 return undefined;
}
export type Carry=Item|{food:'yogurt';unit:Unit;count:number;liquid?:Liquid}|{food:'dish'};
export type Mode='intro'|'read'|'play'|'pause'|'between'|'complete';
export type Event={shift:number;action:string;success?:boolean;hint?:boolean;retry?:number;unaided:boolean};
export class Kitchen{
 shift=0;order=0;mode:Mode='intro';held:Carry|null=null;
 dishes: Dish[]=[freshDish()];staged:(Carry|null)[]=[null];tool:Unit='tablespoon';liquid:Liquid='yogurt';tips=0;mistakes=0;assisted=false;shiftMistakes=0;seconds=0;
 message='';phrase='';events:Event[]=[];results:LevelResult[]=[];pearPrepared=false;attemptedLevels=new Set<number>();priorAssistance=new Set<number>();priorMistakes=new Set<number>();
 get firstUnaided(){return !this.spec.guided&&!this.assisted&&this.shiftMistakes===0&&!this.priorAssistance.has(this.shift)&&!this.priorMistakes.has(this.shift)}
 get spec(){return levels[this.shift]}get recipe(){return this.spec.recipes[this.order]}get dish(){return this.dishes[this.order]}
 log(action:string,success?:boolean,hint=false){this.events.push({shift:this.shift+1,action,success,hint,unaided:this.firstUnaided,retry:this.shiftMistakes});this.events=this.events.slice(-250)}
 begin(){this.enter(0);this.log('begin')}
 start(){if(!['read','pause','play'].includes(this.mode))return;this.mode='play';this.attemptedLevels.add(this.shift);this.message='';this.log('start')}
 help(){this.assisted=true;this.priorAssistance.add(this.shift);this.log('vocabulary',undefined,true)}
 fail(reason:string,phrase=''){this.message=reason;this.phrase=phrase;this.mistakes++;this.shiftMistakes++;this.priorMistakes.add(this.shift);this.tips=Math.max(0,this.tips-5);this.log('mistake',false)}
 take(food:Food,prepared=false){if(this.held){this.message='הידיים תפוסות. הניחו ב־MIX או על המגש.';return}this.held={food,form:prepared?'prepared':'whole',count:1,preparedByPlayer:prepared?false:undefined};this.log('take-'+food+(prepared?'-prepared':''))}
 board(){if(!this.held||this.held.food==='yogurt'||this.held.food==='dish'){this.message='צריך להחזיק פרי, ירק או כיכר לחם.';return}const p=prepare(this.held);if(!p){this.message='כבר פרוס. כלים נוספים מחכים בתחנת TOOLS.';return}this.held=p;if(p.food==='pear')this.pearPrepared=true;this.message=p.food==='bread'?'כיכר הפכה לארבע פרוסות. כל הוספה מניחה פרוסה אחת; אפשר לשמור עודפים על המגש.':'המרכיב הוכן. בדקו אם צריך כלי נוסף.';this.log('prepare-'+p.food+'-'+p.form)}
 yogurt(){if(this.held){this.message='פנו ידיים לפני המדידה.';return}this.held={food:'yogurt',unit:this.tool,count:1,...(this.liquid!=='yogurt'?{liquid:this.liquid}:{})};this.log('measure-'+this.liquid+'-'+this.tool)}
 add(){const h=this.held;if(!h){this.message='קחו מרכיב והביאו לקערה.';return}if(h.food==='dish'){this.message='הקערה כבר בידיים. אפשר להניח אותה ב־MIX.';return}if(this.dish.served)return;
  if(h.food==='yogurt'){if(!this.dish.items.length){this.fail('הוסיפו מרכיב לפני הנוזל. כלי המדידה נשאר בידיים.','Put / Then add');return}this.dish.yogurt.push({unit:h.unit,amount:1,...(h.liquid?{liquid:h.liquid}:{})});this.held=null;}else{this.dish.items.push({...h,count:1});this.held=h.count>1?{...h,count:h.count-1}:null;}
  this.dish.stirred=false;this.dish.blended=false;this.log('add-'+h.food);this.message='';
 }
 process(tool:Tool){if(!this.spec.tools.includes(tool)){this.message='הכלי הזה עדיין לא בתחנה הזאת.';return}const h=this.held;
  if(tool==='blend'){if(h?.food!=='dish'){this.message='הרימו את המנה ב־MIX והביאו לבלנדר.';return}if(!this.dish.items.length){this.fail('אין מרכיבים בבלנדר. מלאו את הקערה קודם.','blend');return}this.dish.blended=true;this.dish.pureed=true;this.dish.blendedItems=this.dish.items.length;this.dish.stirred=true;this.message='טחינה הושלמה. אפשר להגיש או להניח ב־MIX.';this.log('blend');return;}
  if(!h||h.food==='dish'||h.food==='yogurt'){this.message='הביאו מרכיב מוכן לכלי.';return}
  const cold=(h.heat??'raw')==='raw';
  if((tool==='dice'||tool==='grate')&&['sliced','prepared'].includes(h.form)&&cold)this.held={...h,form:tool==='dice'?'diced':'grated',preparedByPlayer:true};
  else if(tool==='toast'&&h.food==='bread'&&h.form==='sliced'&&cold)this.held={...h,heat:'toasted'};
  else if(tool==='roast'&&h.food!=='bread'&&['sliced','diced'].includes(h.form)&&cold)this.held={...h,heat:'roasted'};
  else{this.fail('המצב לא מתאים לכלי. קודם פרסו ב־PREP; קולים פרוסות לחם וצולים ירק פרוס או קוביות. אין צורך לחמם פעמיים.',tool);return}
  this.message='הכלי סיים. הביאו את המרכיב לקערה.';this.log(tool+'-'+h.food);
 }
 stage(){if(this.held?.food==='dish'){this.held=null;this.message='המנה חזרה ל־MIX.';this.log('put-dish-down');return}if(this.held){if(this.staged[this.order]){this.message='המגש תפוס. קחו ממנו לפני שמניחים עוד.';return}this.staged[this.order]=this.held;this.held=null;this.message='המרכיב מחכה על מגש ההזמנה.';this.log('park-item')}else if(this.staged[this.order]){this.held=this.staged[this.order];this.staged[this.order]=null;this.message='חזרה לידיים.';this.log('retrieve-item')}else this.message='המגש ריק.'}
 remove(){if(this.held){this.message='פנו ידיים קודם.';return}const y=this.dish.yogurt.pop();if(y){this.dish.stirred=false;this.dish.blended=false;this.message='מנה אחת של נוזל הוצאה. ערבבו או טחנו מחדש לפי ההזמנה.';this.log('remove-'+y.unit)}else this.message='אין נוזל להוציא.'}
 stir(){if(this.held){this.message='פנו ידיים לפני הערבוב.';return}if(!this.dish.items.length){this.fail('אין מה לערבב בקערה ריקה.','stir');return}this.dish.stirred=true;this.message='מעורבב בעדינות.';this.log('stir')}
 lift(){if(this.held){this.message='פנו ידיים לפני הרמת הקערה.';return}if(this.dish.served)return;this.held={food:'dish'};this.log('lift')}
 wash(){if(this.held){this.held=null;this.message='הידיים פנויות. לחיצה נוספת מרוקנת ושוטפת את הקערה.';this.log('discard-held');return}if(this.dish.served)return;this.dishes[this.order]=freshDish();this.message='קערה נקייה, התחלה חדשה.';this.log('wash')}
 serve(){if(this.dish.served||this.mode!=='play')return false;if(this.held?.food!=='dish'){this.message='הרימו את המנה ב־MIX והביאו לחלון.';return false}
  const v=validateDish(this.dish,this.recipe);this.held=null;
  if(!v.ok){this.fail(v.reason,v.phrase);return false}
  if(this.spec.serveInOrder&&this.dishes.slice(0,this.order).some(d=>!d.served)){this.fail('הגישו את המנות לפי הסדר שבכרטיס השירות.',this.spec.brief??'Serve in order');return false}
  this.dish.served=true;this.tips+=Math.max(10,50-this.shiftMistakes*5);this.log('serve',true);
  if(this.dishes.every(d=>d.served)){const stars=1+Number(this.shiftMistakes===0)+Number(this.seconds<=this.spec.targetSeconds);const result={shift:this.shift+1,unaided:this.firstUnaided,guided:!!this.spec.guided,mistakes:this.shiftMistakes,seconds:Math.ceil(this.seconds),stars};this.results=this.results.filter(r=>r.shift!==result.shift).concat(result);this.mode=this.shift===levels.length-1?'complete':'between';}
  else{this.order=this.dishes.findIndex(d=>!d.served);this.message='מנה הוגשה! ההזמנה הבאה מחכה.'}return true;
 }
 selectOrder(i:number){if(this.mode!=='play'||this.held){this.message='פנו ידיים לפני החלפת הזמנה.';return}if(Number.isInteger(i)&&i>=0&&i<this.dishes.length&&!this.dishes[i].served){this.order=i;this.message='';this.phrase=''}}
 next(){if(this.mode!=='between')return;this.enter(this.shift+1);this.log('next')}
 enter(shift:number){if(!Number.isInteger(shift)||shift<0||shift>=levels.length)return false;if(this.attemptedLevels.has(shift))this.priorAssistance.add(shift);this.shift=shift;this.order=0;this.dishes=this.spec.recipes.map(()=>freshDish());if(this.spec.dirty)for(const d of this.dishes)d.clean=false;this.staged=this.spec.recipes.map(()=>null);this.assisted=false;this.shiftMistakes=0;this.seconds=0;this.pearPrepared=false;this.tool=this.spec.units[0]??'tablespoon';this.liquid=this.spec.liquids[0]??'yogurt';this.mode='read';this.message='';this.phrase='';this.held=null;return true}
 tick(dt:number){if(this.mode==='play'&&Number.isFinite(dt)&&dt>0)this.seconds+=dt}
 restart(){const level=this.shift;this.priorAssistance.add(level);this.enter(level);this.log('restart')}
}
