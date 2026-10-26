/** Original scenarios grounded in the two saved Workbook lessons. Game units, not cooking advice. */
export type Food = 'banana'|'apple'|'pear'|'bread';
export type Form = 'whole'|'peeled'|'sliced'|'prepared';
export type Unit = 'tablespoon'|'cup';
export type Item = {food:Food;form:Form;count:number;preparedByPlayer?:boolean};
export type Dish = {items:Item[];yogurt:{unit:Unit;amount:number}[];stirred:boolean;clean:boolean;served:boolean};
export type Recipe = {id:string;text:string;food:Food;form:Form;count:number;yogurt?:{unit:Unit;amount?:number};stir:boolean;prepared?:boolean};
export const shifts: {name:string;he:string;recipes:Recipe[];hint:string}[] = [
 {name:'FIRST BOWL',he:'קערה ראשונה',hint:'Peel = לקלף. tablespoon = כף מדידה. שתי כפות הן שתי מנות מהכף, לא שני גביעי יוגורט.',recipes:[{id:'banana-spoons',text:'Peel one banana. Put it in the bowl. Add two tablespoons of yogurt. Stir gently. Serve.',food:'banana',form:'peeled',count:1,yogurt:{unit:'tablespoon',amount:2},stir:true}]},
 {name:'TWO OF WHAT?',he:'שתיים של מה?',hint:'slice = פרוסה; loaf = כיכר. בלשון רבים: loaves. פרוסה וכיכר הן צורות שונות, גם אם שתיהן לחם.',recipes:[{id:'bread-slices',text:'Add two slices of bread. Serve.',food:'bread',form:'sliced',count:2,stir:false},{id:'bread-loaves',text:'Add two loaves of bread. Serve.',food:'bread',form:'whole',count:2,stir:false}]},
 {name:'ORDER MATTERS',he:'הסדר חשוב',hint:'First = קודם; Next = אחר כך; Then = אז; Finally = לבסוף. cup = כוס מדידה, tablespoon = כף מדידה.',recipes:[{id:'banana-sequence',text:'First, peel the banana. Next, slice it. Then add the slices and one cup of yogurt to the bowl. Finally, stir and serve.',food:'banana',form:'sliced',count:1,yogurt:{unit:'cup',amount:1},stir:true}]},
 {name:'THE PEAR YOU PREPARED',he:'האגס שהכנתם',hint:'the pear that you prepared = האגס שאתם הכנתם. a little = כמות קטנה כלשהי, בלי מספר מדויק.',recipes:[{id:'pear-reference',text:'Use the pear that you prepared. Put it in the bowl. Add a little yogurt. Stir gently and serve.',food:'pear',form:'prepared',count:1,yogurt:{unit:'tablespoon'},stir:true,prepared:true}]},
 {name:'NEW NIGHT, NEW RECIPE',he:'עכשיו לבד',hint:'',recipes:[{id:'apple-transfer',text:'Slice two apples and put the slices in a clean bowl. Add three tablespoons of yogurt. Then stir and serve.',food:'apple',form:'sliced',count:2,yogurt:{unit:'tablespoon',amount:3},stir:true}]}
];
export const freshDish = ():Dish=>({items:[],yogurt:[],stirred:false,clean:true,served:false});
export function validateDish(d:Dish,r:Recipe):{ok:boolean;reason:string;phrase:string} {
 if(!d.clean) return {ok:false,reason:'הקערה מלוכלכת. רוקנו ושטפו בכיור.',phrase:'a clean bowl'};
 if(d.items.some(i=>i.food!==r.food))return {ok:false,reason:'נכנס מרכיב אחר. אפשר לרוקן את הקערה בכיור.',phrase:r.food};
 if(d.items.some(i=>i.form!==r.form || r.prepared&&!i.preparedByPlayer))return {ok:false,reason:r.food==='bread'?'פרוסה וכיכר אינן אותו דבר. רוקנו ונסו את צורת הלחם שבמתכון.':'בדקו את מצב הפרי: שלם, מקולף או חתוך. רוקנו והכינו שוב.',phrase:r.prepared?'the pear that you prepared':r.form};
 const count = d.items.reduce((n,i)=>n+i.count,0);
 if(count!==r.count)return {ok:false,reason:`כמות הפרי או הלחם לא מתאימה. בקערה יש ${count}. אפשר לרוקן ולהכין שוב.`,phrase:r.text.split('.')[0]};
 const amount=d.yogurt.reduce((n,i)=>n+i.amount,0);
 if(r.yogurt){
  if(d.yogurt.some(y=>y.unit!==r.yogurt!.unit))return {ok:false,reason:'כוס וכף מדידה הן יחידות שונות. הוציאו את היוגורט ובחרו כלי מתאים.',phrase:r.yogurt.unit};
  if(r.yogurt.amount!==undefined?amount!==r.yogurt.amount:amount<=0 || amount>4)return {ok:false,reason:r.yogurt.amount!==undefined?`בדקו את המספר ואת היחידה. אפשר להוציא כף או כוס עודפת ליד הקערה.`:'צריך מעט יוגורט. אין כאן מספר מדויק; 1–4 כפות הן מעט ביחידות המשחק.',phrase:r.yogurt.amount!==undefined?`${r.yogurt.amount} ${r.yogurt.unit}${r.yogurt.amount===1?'':'s'}`:'a little yogurt'};
 }else if(amount>0)return {ok:false,reason:'הזמנת הלחם לא מבקשת יוגורט. אפשר להוציא אותו ליד הקערה.',phrase:r.text};
 if(r.stir&&!d.stirred)return {ok:false,reason:'המרכיבים עוד לא עורבבו. ערבבו בעדינות ליד הקערה.',phrase:'stir'};
 return {ok:true,reason:'',phrase:''};
}
export function prepare(item:Item):Item|undefined{
 if(item.food==='banana'&&item.form==='whole')return {...item,form:'peeled',preparedByPlayer:true};
 if(item.food==='banana'&&item.form==='peeled')return {...item,form:'sliced',preparedByPlayer:true};
 if(item.food==='pear'&&item.form==='whole')return {...item,form:'prepared',preparedByPlayer:true};
 if(item.food==='apple'&&item.form==='whole')return {...item,form:'sliced',preparedByPlayer:true};
 if(item.food==='bread'&&item.form==='whole')return {...item,form:'sliced',count:item.count*4,preparedByPlayer:true};
 return undefined;
}
export type Carry = Item|{food:'yogurt';unit:Unit;count:number}|{food:'dish'};
export type Mode='intro'|'read'|'play'|'pause'|'between'|'complete';
export type Event={shift:number;action:string;success?:boolean;hint?:boolean;retry?:number;unaided:boolean};
export class Kitchen {
 shift=0;order=0;mode:Mode='intro';held:Carry|null=null;
 dishes: Dish[]=[freshDish()];staged:(Carry|null)[]=[null];tool:Unit='tablespoon';tips=0;mistakes=0;assisted=false;shiftMistakes=0;seconds=0;stirTime=0;
 message='';phrase='';events:Event[]=[];results:{shift:number;unaided:boolean;guided:boolean;mistakes:number;seconds:number}[]=[];
 pearPrepared=false;priorAssistance=new Set<number>();priorMistakes=new Set<number>();
 get firstUnaided(){return this.shift>0&&!this.assisted&&this.shiftMistakes===0&&!this.priorAssistance.has(this.shift)&&!this.priorMistakes.has(this.shift)}
 get spec(){return shifts[this.shift]}
 get recipe(){return this.spec.recipes[this.order]}
 get dish(){return this.dishes[this.order]}
 log(action:string,success?:boolean,hint=false){this.events.push({shift:this.shift+1,action,success,hint,unaided:this.firstUnaided,retry:this.shiftMistakes});this.events=this.events.slice(-250)}
 begin(){this.mode='read';this.message='';this.log('begin')}
 start(){this.mode='play';this.message='';this.log('start')}
 help(){this.assisted=true;this.priorAssistance.add(this.shift);this.log('vocabulary',undefined,true)}
 fail(reason:string,phrase=''){this.message=reason;this.phrase=phrase;this.mistakes++;this.shiftMistakes++;this.priorMistakes.add(this.shift);this.tips=Math.max(0,this.tips-5);this.log('mistake',false)}
 take(food:Food,prepared=false){if(this.held){this.message='הידיים תפוסות. הניחו בקערה או בכיור.';return}this.held={food,form:prepared?'prepared':'whole',count:1,preparedByPlayer:prepared?false:undefined};this.log('take-'+food+(prepared?'-prepared':''));}
 board(){if(!this.held||this.held.food==='yogurt'||this.held.food==='dish'){this.message='צריך להחזיק פרי או כיכר לחם.';return}const p=prepare(this.held);if(!p){this.message='המרכיב כבר מוכן.';return}this.held=p;if(p.food==='pear')this.pearPrepared=true;this.message=p.food==='bread'?'כיכר אחת הפכה לארבע פרוסות. כל הוספה לקערה מניחה פרוסה אחת.':p.food==='pear'?'שטפתם, הוצאתם ליבה וחתכתם. זה האגס שאתם הכנתם.':'מוכן! המשיכו לפי המתכון.';this.log('prepare-'+p.food+'-'+p.form)}
 yogurt(){if(this.held){this.message='פנו ידיים לפני המדידה.';return}this.held={food:'yogurt',unit:this.tool,count:1};this.log('measure-'+this.tool)}
 add(){const h=this.held;if(!h){this.message='קחו מרכיב והביאו לקערה.';return}if(h.food==='dish'){this.message='הקערה כבר בידיים. קחו אותה לחלון ההגשה.';return}
 if(h.food==='yogurt'){
  if(!this.dish.items.length){this.fail('הפרי נכנס לפני היוגורט במתכון הזה. הכף נשארת בידיים.','Put / Then add');return}
  this.dish.yogurt.push({unit:h.unit,amount:1});this.held=null;
 }else{this.dish.items.push({...h,count:1});if(h.count>1)this.held={...h,count:h.count-1};else this.held=null}
 this.dish.stirred=false;this.log('add-'+h.food);this.message='';}
 stage(){if(this.held?.food==='dish'){this.held=null;this.message='הנחתם את המנה בחזרה.';this.log('put-dish-down');return}if(this.held){if(this.staged[this.order]){this.message='המגש תפוס. קחו ממנו לפני שמניחים עוד.';return}this.staged[this.order]=this.held;this.held=null;this.message='מה שהחזקתם מחכה על המגש של ההזמנה הזאת.';this.log('park-item')}else if(this.staged[this.order]){this.held=this.staged[this.order];this.staged[this.order]=null;this.message='חזרה לידיים.';this.log('retrieve-item')}else this.message='המגש ריק.'}
 remove(){if(this.held){this.message='פנו ידיים קודם.';return}const y=this.dish.yogurt.pop();if(y){this.dish.stirred=false;this.message='מנה אחת של יוגורט הוצאה. אפשר לתקן ולערבב שוב.';this.log('remove-'+y.unit)}else this.message='אין יוגורט להוציא.'}
 stir(){if(this.held){this.message='פנו ידיים לפני הערבוב.';return}if(!this.dish.items.length){this.fail('קערה ריקה עושה רעש מצחיק, אבל אין מה לערבב.','stir');return}this.dish.stirred=true;this.message='מעורבב בעדינות.';this.log('stir')}
 lift(){if(this.held){this.message='פנו ידיים לפני הרמת הקערה.';return}this.held={food:'dish'};this.log('lift')}
 wash(){if(this.held){this.held=null;this.message='הנחתם את מה שהחזקתם. לחיצה נוספת מרוקנת ושוטפת את הקערה.';this.log('discard-held');return}this.dishes[this.order]=freshDish();this.message='קערה נקייה, התחלה חדשה.';this.log('wash')}
 serve(){if(this.dish.served||this.mode!=='play')return false;if(this.held?.food!=='dish'){this.message='הרימו את המנה ליד הקערה והביאו לחלון.';return false}const v=validateDish(this.dish,this.recipe);this.held=null;if(!v.ok){this.fail(v.reason,v.phrase);return false}this.dish.served=true;this.tips+=Math.max(10,50-this.shiftMistakes*5);this.log('serve',true);if(this.dishes.every(d=>d.served)){this.results.push({shift:this.shift+1,unaided:this.firstUnaided,guided:this.shift===0,mistakes:this.shiftMistakes,seconds:Math.round(this.seconds)});this.mode=this.shift===4?'complete':'between'}else{this.order=this.dishes.findIndex(d=>!d.served);this.message='הזמנה אחת הוגשה! הכינו את השנייה.'}return true}
 selectOrder(i:number){if(this.held){this.message='פנו ידיים לפני החלפת הזמנה.';return}if(!this.dishes[i]?.served){this.order=i;this.message='';this.phrase=''}}
 next(){if(this.mode!=='between')return;this.shift++;this.order=0;this.dishes=this.spec.recipes.map(()=>freshDish());this.staged=this.spec.recipes.map(()=>null);this.assisted=false;this.shiftMistakes=0;this.seconds=0;this.pearPrepared=false;if(this.shift===4)this.dish.clean=false;this.mode='read';this.message='';this.phrase='';this.held=null;this.log('next')}
 tick(dt:number){if(this.mode==='play')this.seconds+=dt}
 restart(){const events=this.events,priorAssistance=this.priorAssistance,priorMistakes=this.priorMistakes;for(const r of this.results)priorAssistance.add(r.shift-1);priorAssistance.add(this.shift);Object.assign(this,new Kitchen());this.events=events;this.priorAssistance=priorAssistance;this.priorMistakes=priorMistakes;this.mode='read';this.log('restart')}
}
