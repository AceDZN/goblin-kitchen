import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {Kitchen, Item, Dish, Carry} from './recipes';
import type {Food, Liquid, Tool} from './catalog-types';

export type Station={id:string;label:string;pos:T.Vector3;approach:T.Vector3;width:number;depth:number;group:T.Group};
type VenueStyle={name:string;sky:string;floor:string;wood:string;top:string;wall:string;accent:string;awning:string;decor:string[]};
const VENUE_STYLES:VenueStyle[]=[
 {name:'EMBER ALLEY',sky:'#302434',floor:'#68505d',wood:'#79472c',top:'#b17b47',wall:'#51404b',accent:'#c79142',awning:'#6b3741',decor:['brick hearth','striped awning','warm lanterns']},
 {name:'THE BREAD YARD',sky:'#625148',floor:'#8b6855',wood:'#86532c',top:'#c39763',wall:'#c3a779',accent:'#d7a34c',awning:'#a34c35',decor:['brick bakery oven','wheat bundles','flour sacks']},
 {name:'GARDEN MARKET',sky:'#485b53',floor:'#72705c',wood:'#66513a',top:'#b99e6a',wall:'#768367',accent:'#7b8c49',awning:'#d7c89c',decor:['leafy trellis','planter boxes','produce crates']},
 {name:'HARBOUR CANTEEN',sky:'#354d61',floor:'#5e6e77',wood:'#665044',top:'#a58d6d',wall:'#77848a',accent:'#bd783c',awning:'#ded2b4',decor:['harbour water','sail and rope','dock bollards']},
 {name:'ROOFTOP LAB',sky:'#59415f',floor:'#6b6372',wood:'#755149',top:'#b58c69',wall:'#7e7182',accent:'#c79c54',awning:'#654b76',decor:['orange city skyline','brass telescope vent','rooftop planters']},
 {name:'THE ROYAL FEAST',sky:'#352541',floor:'#786c83',wood:'#624238',top:'#b08756',wall:'#a392a4',accent:'#d4ac51',awning:'#74354d',decor:['royal banners','gold crown','stone columns']}
];
const LIQUID_COLORS:Record<Liquid,string>={yogurt:'#fff0d6',broth:'#b96a2b',oil:'#c9a12f'};
const FOOD_FLESH:Record<Food,string>={banana:'cream',apple:'cream',pear:'cream',bread:'cream',tomato:'tomato',carrot:'carrot',cucumber:'cucumberFlesh',potato:'potato',mushroom:'mushroomFlesh',pepper:'pepper'};

export class KitchenScene {
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.OrthographicCamera(-9,9,6,-6,.1,100);stations:Station[]=[];
 room=new T.Group();venueDecor=new T.Group();pantryDisplay=new T.Group();toolDisplay=new T.Group();liquidDisplay=new T.Group();inactiveBowl=new T.Group();stagingDisplay=new T.Group();
 player=new T.Group();held=new T.Group();bowlContents=new T.Group();bowl=new T.Group();customers:T.Group[]=[];
 raycaster=new T.Raycaster();floor=new T.Plane(new T.Vector3(0,1,0),0);target:T.Vector3|null=null;position=new T.Vector3(0,0,1);look=0;time=0;effects:{mesh:T.Mesh;age:number;vel:T.Vector3}[]=[];
 mixer?:T.AnimationMixer;actions:Record<string,T.AnimationAction>={};realCook=false;realProp=false;riggedCook=false;jointCount=0;clipNames:string[]=[];activeAnimation='';clipRoles:{idle?:string;walk?:string;carry?:string}={};holdPose=new Map<T.Object3D,T.Quaternion>();gripBones:T.Bone[]=[];actor?:T.Group;propTemplate?:T.Group;cheerTime=0;modelStatus='Tripo assets unavailable: procedural stand-ins';
 material:Record<string,T.MeshStandardMaterial>={};labels:T.Sprite[]=[];reduced=false;lastHeld='';lastBowl='';moving=false;boardMoved=false;fps=0;frames=0;frameTime=0;
 venueIndex=-1;venueName='';venueVisuals={name:'',decor:[] as string[],palette:'',layout:0};
 floorTiles?:T.InstancedMesh;hemi?:T.HemisphereLight;sun?:T.DirectionalLight;lastStock='';lastTools='';lastLiquids='';lastToolEvent='';toolPulse=0;

 constructor(public canvas:HTMLCanvasElement,public game:Kitchen){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.55;
  this.scene.background=new T.Color('#302434');this.scene.fog=new T.Fog('#302434',28,52);this.camera.position.set(12,17,19);this.camera.lookAt(0,0,0);
  this.hemi=new T.HemisphereLight('#ffe4bd','#4a3454',3);this.scene.add(this.hemi);this.sun=new T.DirectionalLight('#ffd19c',4);this.sun.position.set(-6,12,6);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);Object.assign(this.sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});this.sun.shadow.normalBias=.03;this.scene.add(this.sun);
  const fill=new T.DirectionalLight('#bfaaff',1.3);fill.position.set(6,6,-7);this.scene.add(fill);
  for(const [n,c] of Object.entries({wood:'#79472c',top:'#b17b47',dark:'#382633',cream:'#f4e0b5',brass:'#bc883b',green:'#6b8b37',tile:'#63505f',white:'#fff5de',banana:'#e7b936',apple:'#b84131',pear:'#97ad48',tomato:'#bf4430',carrot:'#e17d24',cucumber:'#3f693b',cucumberFlesh:'#bbcc78',potato:'#c5a46e',mushroom:'#91745b',mushroomFlesh:'#e4d4b3',pepper:'#c45a34',toast:'#9c642d',roast:'#ac6e39',char:'#493225',metal:'#718080',wall:'#51404b',accent:'#c79142',awning:'#6b3741',water:'#457783',yogurt:'#fff0d6',broth:'#b96a2b',oil:'#c9a12f',glass:'#b2bba7',hot:'#f49637'})){
   this.material[n]=new T.MeshStandardMaterial({color:c,roughness:['brass','metal'].includes(n)?.4:.82,metalness:n==='brass'?.5:n==='metal'?.45:0});
  }
  this.material.hot.emissive.set('#e8621d');this.material.hot.emissiveIntensity=.6;
  this.addTextures();this.scene.add(this.room,this.venueDecor);this.buildRoom();this.buildStations();this.makeCook();this.scene.add(this.player);this.player.add(this.held);this.held.position.set(0,.95,.48);this.layout(game.shift);
  this.resize();addEventListener('resize',()=>this.resize());
 }
 addTextures(){
  const make=(grain:boolean)=>{const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#e8e2d7';ctx.fillRect(0,0,128,128);let seed=7;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};for(let i=0;i<1500;i++){const v=105+Math.floor(random()*100);ctx.fillStyle=`rgba(${v},${v},${v},${grain?.1:.17})`;ctx.fillRect(random()*128,random()*128,grain?12+random()*50:1,grain?.6:1)}if(grain){ctx.strokeStyle='#786650';ctx.globalAlpha=.28;for(let i=0;i<15;i++){ctx.beginPath();ctx.moveTo(0,i*9);ctx.bezierCurveTo(40,i*9+Math.sin(i)*5,85,i*9-4,128,i*9+1);ctx.stroke()}}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(grain?1:2,2);return t};
  this.material.wood.map=make(true);this.material.top.map=make(true);this.material.tile.map=make(false);this.material.wood.roughness=.95;this.material.top.roughness=.9;
 }
 mesh(geo:T.BufferGeometry,mat:string|T.Material,parent:T.Object3D=this.scene,x=0,y=0,z=0){const m=new T.Mesh(geo,typeof mat==='string'?this.material[mat]:mat);m.position.set(x,y,z);m.castShadow=parent!==this.scene;m.receiveShadow=true;parent.add(m);return m}
 box(w:number,h:number,d:number,mat:string,parent:T.Object3D=this.scene,x=0,y=0,z=0){return this.mesh(new T.BoxGeometry(w,h,d),mat,parent,x,y,z)}
 sphere(r:number,mat:string,parent:T.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=this.mesh(new T.SphereGeometry(r,12,10),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m}
 cylinder(rt:number,rb:number,h:number,mat:string,parent:T.Object3D,x=0,y=0,z=0){return this.mesh(new T.CylinderGeometry(rt,rb,h,16),mat,parent,x,y,z)}
 textSprite(text:string,size=.72){const c=document.createElement('canvas');c.width=512;c.height=100;const ctx=c.getContext('2d')!;ctx.fillStyle='#2b1d2b';ctx.beginPath();ctx.roundRect(3,3,506,94,12);ctx.fill();ctx.strokeStyle='#bb915e';ctx.lineWidth=4;ctx.stroke();ctx.font='600 38px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff1cf';ctx.fillText(text,256,51);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:false}));sprite.scale.set(size*3.15,size*.62,1);sprite.userData.ownedSprite=true;sprite.userData.text=text;return sprite}
 label(text:string,x:number,y:number,z:number,size=.72){const sprite=this.textSprite(text,size);sprite.position.set(x,y,z);this.scene.add(sprite);this.labels.push(sprite);return sprite}
 setLabel(index:number,text:string){const old=this.labels[index];if(old.userData.text===text)return;const sprite=this.textSprite(text,.52);sprite.position.copy(old.position);this.scene.remove(old);const mat=old.material as T.SpriteMaterial;mat.map?.dispose();mat.dispose();this.scene.add(sprite);this.labels[index]=sprite}
 buildRoom(){
  this.box(14,.5,11,'dark',this.room,0,-.35,0);
  const tiles=new T.InstancedMesh(new T.BoxGeometry(.965,.13,.965),this.material.tile,154),matrix=new T.Matrix4();let ti=0;
  for(let x=0;x<14;x++)for(let z=0;z<11;z++){matrix.makeTranslation(x-6.5,-.025,z-5);tiles.setMatrixAt(ti,matrix);tiles.setColorAt(ti,new T.Color('#68505d'));ti++}tiles.receiveShadow=true;this.room.add(tiles);this.floorTiles=tiles;
  this.box(14,1.6,.3,'wall',this.room,0,.7,-5.35);this.box(.25,.6,10.5,'wall',this.room,-7,.25,0);
  for(let i=0;i<18;i++)this.box(.73,.25,.35,i%2?'wood':'wall',this.room,-6.6+i*.78,1.35,-5.1);
  for(const x of [-6.3,6.3]){this.box(.22,3.5,.22,'wood',this.room,x,1.6,-4.8);this.cylinder(.22,.19,.45,'brass',this.room,x,2.8,-4.5);const lamp=this.sphere(.19,'hot',this.room,x,2.8,-4.5);lamp.scale.y=1.25;this.box(.48,.12,.48,'brass',this.room,x,3.1,-4.5);const light=new T.PointLight('#ffb84d',10,8);light.position.set(x,2.8,-4);this.room.add(light)}
  for(let i=0;i<3;i++){const g=this.goblin(false);g.scale.setScalar(.7);g.position.set(6.1,.45,-.8+i*.95);g.rotation.y=-Math.PI/2;this.scene.add(g);this.customers.push(g)}
 }
 planter(parent:T.Object3D,x:number,y:number,z:number,width=1.2){this.box(width,.38,.44,'wood',parent,x,y,z);this.box(width-.1,.04,.34,'dark',parent,x,y+.2,z);for(let i=0;i<5;i++){const leaf=this.sphere(.16,'green',parent,x-width*.38+i*width*.19,y+.38,z+(i%2?-.07:.07),.85,1.7,.8);leaf.rotation.z=(i-2)*.16}}
 buildVenue(index:number){
  const style=VENUE_STYLES[index];this.venueIndex=index;this.venueName=style.name;this.venueVisuals={name:style.name,decor:[...style.decor],palette:style.sky,layout:this.game.spec.layout};this.clearGroup(this.venueDecor);
  this.scene.background=new T.Color(style.sky);if(this.scene.fog instanceof T.Fog)this.scene.fog.color.set(style.sky);
  for(const key of ['wood','top','wall','accent','awning'] as const)this.material[key].color.set(style[key]);this.material.tile.color.set('#ffffff');
  if(this.floorTiles){for(let i=0;i<154;i++)this.floorTiles.setColorAt(i,new T.Color(style.floor).offsetHSL(0,0,Math.sin(i*13)*.025));this.floorTiles.instanceColor!.needsUpdate=true}
  this.hemi?.groundColor.set(index===3?'#344350':'#4a3454');this.sun?.color.set(index===3?'#f7dec0':'#ffd19c');
  const g=this.venueDecor;
  const sign=this.textSprite(style.name,.88);sign.position.set(0,2.95,-5.25);g.add(sign);
  if(index===0){
   for(let i=0;i<12;i++)this.box(.78,.15,1.05,i%2?'awning':'accent',g,-4.3+i*.78,3.4,-5.05);
   this.box(1.65,.85,.5,'wood',g,-4.7,1.95,-5.25);this.box(1.13,.43,.08,'dark',g,-4.7,1.9,-4.95);for(let i=0;i<4;i++)this.sphere(.16,'hot',g,-5.08+i*.25,1.8,-4.89,1,1.8,.4);
   this.planter(g,4.7,1.65,-5.2);
  }else if(index===1){
   this.box(2.4,1.6,.65,'wood',g,-4.2,2,-5.25);this.box(1.58,.85,.08,'dark',g,-4.2,1.8,-4.87);const arch=this.mesh(new T.TorusGeometry(.64,.18,8,16,Math.PI),'wall',g,-4.2,2,-4.82);arch.rotation.z=0;this.box(1.25,.12,.08,'hot',g,-4.2,1.45,-4.78);
   for(let j=0;j<3;j++){this.sphere(.32,'cream',g,3.4+j*.65,1.65,-5.05,1,1.25,.8);for(let k=0;k<3;k++){const stem=this.box(.04,.85,.04,'accent',g,3.4+j*.65+(k-1)*.1,2.15,-5.05);stem.rotation.z=(k-1)*.14;for(let n=0;n<3;n++)this.sphere(.08,'accent',g,3.4+j*.65+(k-1)*.15,2.3+n*.12,-5.05,.7,1.4,.4)}}
   for(let i=0;i<8;i++)this.box(.85,.12,.9,i%2?'cream':'awning',g,-2.5+i*.85,3.4,-5.05);
  }else if(index===2){
   this.box(10.4,.16,.16,'wood',g,0,3.05,-5.2);for(let i=0;i<8;i++){const slat=this.box(.12,1.3,.12,'wood',g,-4.8+i*1.35,2.35,-5.2);slat.rotation.z=.25}
   for(let i=0;i<6;i++)this.planter(g,-4.9+i*1.95,1.65,-5.1,1.55);
   for(let i=0;i<7;i++){this.sphere(.23,'green',g,-4.5+i*1.5,3.05+Math.sin(i)*.13,-5.15,1.9,.7,.8)}
   this.box(1.1,.6,.8,'wood',g,-6.3,.65,-4.6);this.food({food:'tomato',form:'whole',count:1},g,-6.3,1.1,-4.6);
  }else if(index===3){
   this.box(14,.08,1.5,'water',g,0,.35,-6.1);for(let i=0;i<8;i++)this.box(1.1,.025,.035,'cream',g,-5.8+i*1.55,.4,-6.15+(i%2)*.3);
   for(const x of [-5.3,4.8]){this.cylinder(.16,.19,2.4,'wood',g,x,1.6,-5.25);const ring=this.mesh(new T.TorusGeometry(.22,.055,8,16),'cream',g,x,2.5,-5.25);ring.rotation.x=Math.PI/2}
   const mast=this.box(.13,2.8,.13,'wood',g,-3,2.2,-5.1);mast.rotation.z=-.05;const sail=this.mesh(new T.ConeGeometry(.9,1.9,3),'awning',g,-2.5,2.5,-5.2);sail.scale.z=.08;sail.rotation.z=.2;
   for(let i=0;i<5;i++){const rope=this.mesh(new T.TorusGeometry(.2,.055,6,16),'cream',g,3.2+i*.28,1.6,-5.12);rope.rotation.x=Math.PI/2}
  }else if(index===4){
   for(let i=0;i<11;i++){const h=.6+(Math.sin(i*17)+1)*.55;this.box(.55,h,.35,i%3?'awning':'accent',g,-6.2+i*1.2,1.7+h/2,-5.6);if(i%2)this.box(.1,.18,.04,'hot',g,-6.2+i*1.2,1.7+h*.6,-5.4)}
   this.cylinder(.4,.48,.5,'metal',g,-2.6,1.65,-5.03);this.cylinder(.18,.2,.75,'brass',g,-2.6,2.2,-5.03);const scope=this.cylinder(.28,.34,1.75,'brass',g,-2.6,2.7,-5.03);scope.rotation.z=-Math.PI/2+.12;this.cylinder(.22,.22,.1,'dark',g,-3.48,2.8,-5.03).rotation.z=Math.PI/2;
   this.planter(g,3.2,1.7,-5.12,1.4);this.planter(g,5.05,1.7,-5.12,1.4);for(const x of [-6.6,6.6])this.box(.11,1.1,.11,'metal',g,x,1.9,-5.1);this.box(13.3,.1,.1,'metal',g,0,2.3,-5.3);
  }else{
   for(const x of [-5.6,5.6]){this.cylinder(.26,.32,2.5,'wall',g,x,2,-5.12);this.box(.75,.2,.65,'accent',g,x,3.23,-5.12);this.box(.75,.2,.65,'accent',g,x,.85,-5.12)}
   for(const x of [-3.7,3.7]){this.box(1.25,1.65,.08,'awning',g,x,2.2,-5.08);this.box(1.3,.13,.12,'accent',g,x,3.04,-5.05);this.sphere(.22,'accent',g,x,2.4,-4.98,1,.9,.15);for(let i=0;i<3;i++)this.mesh(new T.ConeGeometry(.11,.25,4),'accent',g,x+(i-1)*.19,2.63,-4.98)}
   this.box(2.3,.18,.22,'accent',g,0,3.3,-5.15);for(let i=0;i<5;i++)this.mesh(new T.ConeGeometry(.19,.5+(i===2?.18:0),4),'accent',g,(i-2)*.4,3.55,-5.15);
  }
 }
 station(id:string,label:string,x:number,z:number,ax:number,az:number,w=1.8,d=1.4){const g=new T.Group();g.position.set(x,0,z);this.scene.add(g);this.box(w,1,d,'wood',g,0,.5,0);this.box(w+.12,.16,d+.12,'top',g,0,1.07,0);for(const lx of [-1,1])this.box(.11,.8,.11,'dark',g,lx*(w/2-.15),.4,d/2-.14);const s={id,label,pos:new T.Vector3(x,0,z),approach:new T.Vector3(ax,0,az),width:w,depth:d,group:g};this.stations.push(s);this.label(label,x,1.8,z,.52);return g}
 buildStations(){
  const fruit=this.station('fruit','PANTRY',-5,-3,-3.7,-3);fruit.add(this.pantryDisplay);this.pantryDisplay.position.y=1.35;
  const board=this.station('board','PREP',-5,0,-3.7,0);this.box(1.35,.08,.85,'cream',board,0,1.2,0);const blade=this.box(.5,.04,.14,'brass',board,.25,1.28,-.1);blade.rotation.y=.4;this.box(.27,.07,.14,'dark',board,.6,1.27,-.25);
  const bread=this.station('bread','BREAD',-5,3,-3.7,3);this.food({food:'bread',form:'whole',count:1},bread,-.2,1.4,0);this.food({food:'bread',form:'sliced',count:1},bread,.5,1.45,0);
  const mix=this.station('bowl','MIX',0,-3.1,0,-1.8,2.5,1.7);mix.add(this.bowl,this.inactiveBowl,this.stagingDisplay);this.bowl.position.y=1.18;this.makeBowl(this.bowl);this.bowl.add(this.bowlContents);this.inactiveBowl.position.y=1.18;this.stagingDisplay.position.set(0,1.18,.72);
  const measure=this.station('yogurt','MEASURE',5,-3,3.7,-3);measure.add(this.liquidDisplay);this.liquidDisplay.position.y=1.2;
  const hatch=this.station('serve','SERVE',5,.5,3.7,.5,1.8,2);this.box(.15,1.2,.15,'brass',hatch,-.75,1.7,-.8);this.box(.15,1.2,.15,'brass',hatch,.75,1.7,-.8);this.box(1.8,.3,.2,'dark',hatch,0,2.25,-.8);this.sphere(.3,'cream',hatch,0,1.2,0,1,.2,1);this.box(.18,.95,.18,'brass',hatch,1,1.55,0);this.box(.18,.95,.18,'brass',hatch,1,1.55,1.1);
  const sink=this.station('sink','WASH / RESET',0,3.7,0,2.3,2.1,1.4);this.box(1.4,.05,.9,'metal',sink,0,1.18,0);this.box(1.1,.045,.65,'dark',sink,0,1.22,0);this.box(.1,.6,.1,'brass',sink,0,1.5,-.5);this.box(.45,.1,.1,'brass',sink,-.18,1.8,-.5);
  const tools=this.station('prepared','TOOLS',3.5,3.7,3.5,2.3);tools.add(this.toolDisplay);this.toolDisplay.position.y=1.2;
 }
 updateStock(){const stock=this.game.spec.pantry;const key=JSON.stringify(stock);if(key===this.lastStock)return;this.lastStock=key;this.clearGroup(this.pantryDisplay);stock.slice(0,5).forEach((food,i)=>{const n=stock.length,x=(i-(n-1)/2)*Math.min(.4,1.35/n);const crate=this.box(.32,.09,.54,'wood',this.pantryDisplay,x,-.08,0);crate.rotation.y=.02*(i-2);const f=this.food({food,form:'whole',count:1},this.pantryDisplay,x,.15,(i%2?-.12:.1));f.scale.setScalar(n>3?.65:.82)})}
 updateLiquids(){const liquids=this.game.spec.liquids,key=JSON.stringify(liquids);if(key===this.lastLiquids)return;this.lastLiquids=key;this.clearGroup(this.liquidDisplay);liquids.forEach((liquid,i)=>{const x=(i-(liquids.length-1)/2)*.58;if(liquid==='oil'){this.cylinder(.14,.2,.48,'brass',this.liquidDisplay,x,.27,0);this.cylinder(.075,.075,.25,'brass',this.liquidDisplay,x,.62,0);this.cylinder(.09,.09,.09,'dark',this.liquidDisplay,x,.79,0)}else{this.cylinder(.25,.2,.48,liquid==='broth'?'metal':'cream',this.liquidDisplay,x,.26,0);this.cylinder(.2,.2,.03,liquid,this.liquidDisplay,x,.51,0)}const sign=this.textSprite(liquid.toUpperCase(),.18);sign.position.set(x,.22,.28);this.liquidDisplay.add(sign)});this.spoon(this.liquidDisplay,.68,.06,.37)}
 updateTools(){const tools=this.game.spec.tools,pear=this.game.spec.recipes.some(r=>r.food==='pear'&&(r.form==='prepared'||r.prepared));const key=JSON.stringify([tools,pear]);if(key===this.lastTools)return;this.lastTools=key;this.clearGroup(this.toolDisplay);
  if(pear){this.food({food:'pear',form:'prepared',count:1},this.toolDisplay,-.42,.13,.15);this.food({food:'pear',form:'whole',count:1},this.toolDisplay,.25,.28,.15)}
  if(!tools.length){if(!pear){this.box(.7,.05,.45,'cream',this.toolDisplay,0,.02,0);this.spoon(this.toolDisplay,0,.08,0)}return}
  if(tools.includes('toast')||tools.includes('roast')){const oven=new T.Group();oven.position.set(-.42,.02,-.12);this.toolDisplay.add(oven);this.box(.78,.57,.55,'metal',oven,0,.29,0);this.box(.63,.38,.03,'dark',oven,0,.29,.29);this.box(.47,.08,.025,'hot',oven,0,.16,.315);this.box(.46,.04,.04,'brass',oven,0,.47,.32);for(const x of [-.29,.29])this.sphere(.04,'brass',oven,x,.55,.32)}
  if(tools.includes('blend')){const blender=new T.Group();blender.position.set(.46,.02,-.12);this.toolDisplay.add(blender);this.cylinder(.23,.28,.18,'dark',blender,0,.1,0);this.sphere(.055,'brass',blender,0,.1,.25);this.cylinder(.21,.16,.52,'glass',blender,0,.45,0);this.cylinder(.23,.23,.07,'metal',blender,0,.74,0);const rotor=this.box(.25,.02,.045,'brass',blender,0,.23,0);rotor.name='blender-rotor';const handle=this.mesh(new T.TorusGeometry(.17,.035,6,16),'metal',blender,.22,.49,0);handle.rotation.y=Math.PI/2}
  if(tools.includes('grate')){const grater=this.box(.24,.4,.2,'metal',this.toolDisplay,.28,.24,.4);grater.rotation.z=-.13;for(let row=0;row<3;row++)for(let col=0;col<2;col++)this.box(.035,.045,.012,'dark',this.toolDisplay,.23+col*.075,.14+row*.09,.51);const handle=this.mesh(new T.TorusGeometry(.08,.024,6,12),'brass',this.toolDisplay,.28,.49,.4);handle.rotation.x=Math.PI/2}
  if(tools.includes('dice')){this.box(.43,.04,.35,'cream',this.toolDisplay,-.43,.04,.4);const knife=this.box(.27,.045,.1,'metal',this.toolDisplay,-.47,.11,.4);knife.rotation.y=.4;this.box(.16,.07,.1,'dark',this.toolDisplay,-.25,.11,.48)}
 }
 makeBowl(parent:T.Group){if(this.propTemplate){const model=this.propTemplate.clone(true);model.traverse(o=>{if(o instanceof T.Mesh)o.geometry=o.geometry.clone()});parent.add(model);return}const pts=[new T.Vector2(0,0),new T.Vector2(.23,0),new T.Vector2(.45,.14),new T.Vector2(.62,.5),new T.Vector2(.66,.57),new T.Vector2(.59,.58),new T.Vector2(.53,.3),new T.Vector2(.34,.13),new T.Vector2(0,.12)];this.mesh(new T.LatheGeometry(pts,32),'cream',parent);const ring=this.mesh(new T.TorusGeometry(.625,.035,8,32),'brass',parent,0,.55,0);ring.rotation.x=Math.PI/2}
 spoon(parent:T.Object3D,x:number,y:number,z:number){this.box(.07,.05,.55,'brass',parent,x,y,z);this.sphere(.13,'cream',parent,x,y,z+.31,1,.35,1.4)}
 food(item:Item,parent:T.Object3D,x=0,y=0,z=0){
  const g=new T.Group();g.position.set(x,y,z);parent.add(g);const cooked=item.heat&&item.heat!=='raw',flesh=cooked?(item.heat==='toasted'?'toast':'roast'):FOOD_FLESH[item.food];
  if(item.form==='diced'){for(let i=0;i<6;i++){const piece=this.box(.16,.15,.16,flesh,g,(i%3-1)*.18,.04+Math.floor(i/3)*.1,Math.floor(i/3)*.19-.1);piece.rotation.y=i*.7}}
  else if(item.form==='grated'){for(let i=0;i<12;i++){const strand=this.box(.035,.035,.23,flesh,g,(i%4-1.5)*.1,.03+Math.floor(i/4)*.035,Math.floor(i/4)*.07-.08);strand.rotation.y=Math.sin(i*4)*.9}}
  else if(item.form==='sliced'||item.form==='prepared'){
   const count=item.food==='bread'?Math.min(3,item.count):4;
   for(let i=0;i<count;i++){const px=item.food==='bread'?0:(i%2)*.25-.12,pz=item.food==='bread'?i*.035:Math.floor(i/2)*.24-.12;
    if(item.food==='bread'){this.box(.48,.11,.52,cooked?'toast':'top',g,px,i*.1,pz);this.box(.39,.012,.43,flesh,g,px,.062+i*.1,pz)}
    else if(item.food==='pepper'){const ring=this.mesh(new T.TorusGeometry(.13,.04,6,12),flesh,g,px,.05,pz);ring.rotation.x=Math.PI/2}
    else{this.cylinder(.15,.15,.08,item.food==='cucumber'&&!cooked?'cucumber':flesh,g,px,.05,pz);if(item.food==='cucumber'&&!cooked)this.cylinder(.12,.12,.086,'cucumberFlesh',g,px,.052,pz);if(item.food==='tomato'&&!cooked)for(let j=0;j<3;j++)this.sphere(.018,'cream',g,px+Math.sin(j*2.1)*.08,.096,pz+Math.cos(j*2.1)*.08,1,.25,1)}
   }
  }else if(item.food==='banana'){const curve=new T.CatmullRomCurve3([new T.Vector3(-.35,0,0),new T.Vector3(0,.12,.08),new T.Vector3(.35,0,0)]);this.mesh(new T.TubeGeometry(curve,10,.1,8,false),item.form==='peeled'?'cream':'banana',g);if(item.form==='peeled')for(let i=0;i<3;i++){const p=this.box(.16,.02,.37,'banana',g,0,-.05,i*.1);p.rotation.y=i*1.4}}
  else if(item.food==='bread'){this.sphere(.34,'top',g,0,0,0,1.5,.7,.9);for(let i=0;i<3;i++)this.box(.04,.018,.28,'cream',g,-.25+i*.22,.22,0)}
  else if(item.food==='carrot'){const root=this.mesh(new T.ConeGeometry(.18,.72,10),'carrot',g,0,.02,0);root.rotation.z=Math.PI/2;for(let i=0;i<3;i++){const leaf=this.box(.06,.035,.33,'green',g,-.39,.03,(i-1)*.08);leaf.rotation.y=(i-1)*.45}}
  else if(item.food==='cucumber'){this.sphere(.24,'cucumber',g,0,0,0,1.9,.75,.75);for(let i=0;i<4;i++)this.sphere(.025,'green',g,(i-1.5)*.17,.18,0,1,.4,1)}
  else if(item.food==='potato'){this.sphere(.28,'potato',g,0,0,0,1.3,.8,1);for(let i=0;i<3;i++)this.sphere(.025,'wood',g,(i-1)*.14,.2,(i%2)*.15-.07,1,.3,1)}
  else if(item.food==='mushroom'){this.cylinder(.085,.12,.3,'mushroomFlesh',g,0,0,0);this.sphere(.28,'mushroom',g,0,.18,0,1,.55,1)}
  else if(item.food==='pepper'){for(let i=0;i<3;i++)this.sphere(.18,'pepper',g,Math.sin(i*2.1)*.12,.02,Math.cos(i*2.1)*.12,1,1.2,1);this.box(.065,.2,.065,'green',g,0,.27,0)}
  else{this.sphere(.25,item.food,g,0,0,0,1,item.food==='pear'?1.35:1,1);if(item.food==='pear')this.sphere(.16,'pear',g,0,.23,0);this.box(.045,.18,.045,item.food==='tomato'?'green':'wood',g,0,.29,0);if(item.food==='tomato')for(let i=0;i<4;i++){const leaf=this.box(.2,.025,.045,'green',g,0,.25,0);leaf.rotation.y=i*Math.PI/4}}
  if(cooked){for(let i=0;i<3;i++){const mark=this.box(.035,.012,.2,'char',g,(i-1)*.12,.15,.02);mark.rotation.y=.3}g.userData.heat=item.heat}
  return g;
 }
 goblin(cook=true){const g=new T.Group();this.sphere(.36,'green',g,0,1.28,0,1.1,.9,1);this.sphere(.25,'green',g,0,1.18,.28,1.1,.65,.8);for(const side of [-1,1]){const ear=this.mesh(new T.ConeGeometry(.18,.6,4),'green',g,side*.5,1.4,0);ear.rotation.z=side*-1.1;this.sphere(.09,'white',g,side*.14,1.36,.29,1,1, .35);this.sphere(.04,'dark',g,side*.14,1.36,.325);this.box(.18,.42,.2,'dark',g,side*.18,.25,0);this.sphere(.15,'dark',g,side*.18,.1,.08,1,.6,1.5);this.box(.16,.5,.18,'green',g,side*.34,.77,.09)}this.sphere(.33,cook?'cream':'wood',g,0,.77,0,1,1.25,.8);if(cook){this.box(.4,.55,.08,'top',g,0,.67,.26);this.mesh(new T.CylinderGeometry(.36,.35,.18,16),'cream',g,0,1.64,0);for(let i=0;i<3;i++)this.sphere(.21,'cream',g,(i-1)*.2,1.82,0)}return g}
 makeCook(){this.player.add(this.goblin());this.player.position.copy(this.position)}
 async loadModels(cookPath:string,propPath?:string,roles?:{idle?:string;walk?:string;carry?:string}){
 const loader=new GLTFLoader();
 try{
  const gltf=await loader.loadAsync(cookPath),model=gltf.scene;
  const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  const wrapper=new T.Group();wrapper.scale.setScalar(2.05/size.y);model.position.set(-center.x,-bounds.min.y,-center.z);wrapper.add(model);
  model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}if(o instanceof T.SkinnedMesh)this.jointCount=Math.max(this.jointCount,o.skeleton.bones.length)});
  for(const c of [...this.player.children])if(c!==this.held)this.player.remove(c);
  this.player.add(wrapper,this.held);this.actor=model;model.traverse(o=>{if(o instanceof T.Bone&&/^(mixamorig:?)?(Left|Right)Hand$/.test(o.name))this.gripBones.push(o)});this.realCook=true;this.clipNames=gltf.animations.map(c=>c.name);this.riggedCook=this.jointCount>0&&gltf.animations.length>0;
  if(gltf.animations.length){
   this.mixer=new T.AnimationMixer(model);for(const clip of gltf.animations)this.actions[clip.name]=this.mixer.clipAction(clip);
   this.clipRoles={idle:roles?.idle??this.clipNames.find(n=>/idle/i.test(n)),walk:roles?.walk??this.clipNames.find(n=>/^walk$|walking/i.test(n)),carry:roles?.carry??this.clipNames.find(n=>/goblin|carry/i.test(n))};
   const carry=this.clipRoles.carry&&this.actions[this.clipRoles.carry];if(carry){carry.reset().play();carry.time=.6;this.mixer.update(0);model.traverse(o=>{if(o instanceof T.Bone&&/arm|hand/i.test(o.name))this.holdPose.set(o,o.quaternion.clone())});this.mixer.stopAllAction()}
   this.setAnimation('idle');
  }
  this.held.position.set(0,.95,.7);this.held.scale.setScalar(.72);
  this.modelStatus=this.riggedCook?'Local Tripo cook, full-body rig and motion clips loaded':'Local Tripo cook base loaded; animation export pending';this.render();
 }catch(e){console.error('Cook model failed to load',e);this.modelStatus='Cook model load failed'}
 if(propPath)try{
  const gltf=await loader.loadAsync(propPath),model=gltf.scene,b=new T.Box3().setFromObject(model),s=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());
  const template=new T.Group();template.scale.setScalar(1.3/Math.max(s.x,s.z));model.position.set(-c.x,-b.min.y,-c.z);model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}});template.add(model);this.propTemplate=template;
  for(const child of [...this.bowl.children])if(child!==this.bowlContents){this.bowl.remove(child);child.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose()})}
  this.makeBowl(this.bowl);this.realProp=true;this.lastHeld='';this.lastBowl='';this.sync();this.render();
 }catch(e){console.error('Bowl model failed to load',e)}
 }
 setAnimation(role:'idle'|'walk'|'carry'){
  const name=this.clipRoles[role]??this.clipRoles[role==='carry'?'walk':'idle']??this.clipNames[0];if(!name||name===this.activeAnimation)return;
  if(this.activeAnimation)this.actions[this.activeAnimation]?.fadeOut(.16);this.actions[name]?.reset().fadeIn(.16).play();this.activeAnimation=name;
 }

 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);const aspect=w/h;const half=7.2;this.camera.top=half;this.camera.bottom=-half;this.camera.left=-half*aspect;this.camera.right=half*aspect;this.camera.zoom=aspect<1?aspect*.88:1.05;if(aspect<1)this.camera.position.set(0,19,17);else this.camera.position.set(12,17,19);this.camera.lookAt(aspect<1?0:-1.5,0,0);this.camera.updateProjectionMatrix();this.render()}

 pointer(clientX:number,clientY:number){const r=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new T.Vector2((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1),this.camera);const meshes=this.raycaster.intersectObjects(this.stations.map(s=>s.group),true);if(meshes[0]){let o:T.Object3D|null=meshes[0].object;while(o){const station=this.stations.find(s=>s.group===o);if(station)return {point:station.pos.clone(),station};o=o.parent}}const hit=this.raycaster.ray.intersectPlane(this.floor,new T.Vector3());if(!hit)return null;let nearest:Station|undefined;let dist=1.65;for(const s of this.stations){const d=hit.distanceTo(s.pos);if(d<dist){nearest=s;dist=d}}return {point:hit,station:nearest}}
 collision(pos:T.Vector3){if(Math.abs(pos.x)>6.35||Math.abs(pos.z)>4.7)return true;return this.stations.some(s=>Math.abs(pos.x-s.pos.x)<s.width/2+.26&&Math.abs(pos.z-s.pos.z)<s.depth/2+.26)}
 move(dx:number,dz:number,dt:number){const mag=Math.hypot(dx,dz);this.moving=mag>.02;if(!this.moving)return;dx/=mag;dz/=mag;const speed=4.6;const p=this.position.clone();p.x+=dx*speed*dt;if(!this.collision(p))this.position.x=p.x;p.copy(this.position);p.z+=dz*speed*dt;if(!this.collision(p))this.position.z=p.z;this.look=Math.atan2(dx,dz);this.player.rotation.y=this.look}
 nearest(){let best:Station|undefined,d=1.85;for(const s of this.stations){const v=this.position.distanceTo(s.pos);if(v<d){d=v;best=s}}return best}
 layout(_index:number){
  const spec=this.game.spec,layout=((spec.layout??0)%6+6)%6,venue=Math.min(5,Math.max(0,spec.venue??0));
  const sideSlots:[number,number,number,number][]=[[-5,-3,-3.7,-3],[-5,3,-3.7,3],[5,-3,3.7,-3]];
  const permutations=[[0,1,2],[1,0,2],[2,1,0],[0,2,1],[2,0,1],[1,2,0]];
  const p=permutations[layout],mapping:Record<string,[number,number,number,number]>={fruit:sideSlots[p[0]],bread:sideSlots[p[1]],yogurt:sideSlots[p[2]],board:[-5,0,-3.7,0],bowl:[0,-3.1,0,-1.8],serve:[5,.5,3.7,.5],sink:[0,3.7,0,2.3],prepared:[3.5,3.7,3.5,2.3]};
  for(const s of this.stations){const a=mapping[s.id];s.pos.set(a[0],0,a[1]);s.approach.set(a[2],0,a[3]);s.group.position.copy(s.pos)}
  this.boardMoved=false;if(venue!==this.venueIndex)this.buildVenue(venue);this.venueVisuals.layout=layout;
  for(let i=0;i<this.stations.length;i++){const s=this.stations[i];s.label=s.id==='fruit'?'PANTRY':s.id==='yogurt'?'MEASURE':s.id==='prepared'?'TOOLS':s.label;this.setLabel(i,s.label);this.labels[i].position.set(s.pos.x,s.id==='bowl'?2.25:1.95,s.pos.z)}
  this.position.set(0,0,1);this.player.position.copy(this.position);this.player.rotation.y=0;this.target=null;this.moving=false;this.lastStock='';this.lastTools='';this.lastLiquids='';this.lastHeld='';this.lastBowl='';this.sync();this.render();
 }
 reposition(){const s=this.stations.find(s=>s.id==='board')!;this.boardMoved=!this.boardMoved;const x=this.boardMoved?-2.7:-5;s.pos.x=x;s.group.position.x=x;s.approach.set(this.boardMoved?-1.4:-3.7,0,0);this.labels[this.stations.indexOf(s)].position.x=x;this.render()}
 clearGroup(group:T.Group){
  for(const child of [...group.children]){group.remove(child);child.traverse(o=>{
   // Every disposable model instance clones its geometry; materials/maps stay shared.
   if(o instanceof T.Mesh){o.geometry.dispose();if(o.userData.ownedMaterial){const materials=Array.isArray(o.material)?o.material:[o.material];for(const mat of materials)if(mat.userData.ownerMesh===o.uuid)mat.dispose()}}
   if(o instanceof T.Sprite&&o.userData.ownedSprite){const mat=o.material as T.SpriteMaterial;mat.map?.dispose();mat.dispose()}
  })}
 }
 renderDishContents(parent:T.Group,d:Dish){
  const unitVolume={cup:16,'half-cup':8,tablespoon:1,teaspoon:1/3};
  const volume=d.yogurt.reduce((sum,m)=>sum+m.amount*unitVolume[m.unit],0);
  const fill=d.blended?.24:Math.min(.30,volume*.04);
  if(d.yogurt.length||d.blended){
   const color=new T.Color(d.yogurt.at(-1)?LIQUID_COLORS[d.yogurt.at(-1)!.liquid??'yogurt']:LIQUID_COLORS.yogurt);
   if(d.blended){const colors=d.items.map(item=>this.material[FOOD_FLESH[item.food]].color);for(const c of colors)color.lerp(c,1/(colors.length+1));}
   // A local material owns no texture and can be disposed independently.
   const mat=new T.MeshStandardMaterial({color,roughness:.55});
   const surface=this.mesh(new T.CylinderGeometry(.45,.32,Math.max(.025,fill),24),mat,parent,0,.20+fill/2,0);surface.name=d.blended?'blended-mixture':'measured-liquid';surface.userData.ownedMaterial=true;mat.userData.ownerMesh=surface.uuid;
   if(d.blended){for(let i=0;i<5;i++)this.sphere(.022,'cream',parent,Math.sin(i*2.4)*.25,.21+fill,Math.cos(i*2.4)*.25,1,.25,1)}
  }
  if(!d.blended)d.items.slice(0,9).forEach((item,i)=>{const f=this.food(item,parent,Math.sin(i*2.4)*.25,.28+fill+i*.018,Math.cos(i*2.4)*.25);f.scale.setScalar(.55)});
  if(!d.clean)this.sphere(.27,'wood',parent,.15,.2,0,1,.1,1);
  if(d.stirred&&!d.blended)this.spoon(parent,.2,.4,0);
 }
 renderMeasure(parent:T.Group,item:Extract<Carry,{food:'yogurt'}>){
  const liquid=item.liquid??'yogurt';
  if(item.unit==='cup'||item.unit==='half-cup'){
   this.cylinder(.22,.17,.36,'cream',parent);this.cylinder(.18,.18,.025,liquid,parent,0,item.unit==='half-cup'?.035:.19,0);
   const handle=this.mesh(new T.TorusGeometry(.12,.035,8,16),'brass',parent,.24,0,0);handle.rotation.y=Math.PI/2;
   if(item.unit==='half-cup')this.box(.15,.025,.015,'brass',parent,0,.04,.185);
  }else{const spoon=new T.Group();parent.add(spoon);spoon.scale.setScalar(item.unit==='teaspoon'?.7:1);this.spoon(spoon,0,0,0);this.sphere(.12,liquid,spoon,0,.04,.3,1,.5,1)}
 }
 sync(){
  this.updateStock();this.updateTools();this.updateLiquids();
  const d=this.game.dish,key=JSON.stringify([this.game.order,this.game.dishes,this.game.staged]);
  if(key!==this.lastBowl){
   this.lastBowl=key;this.clearGroup(this.bowlContents);this.clearGroup(this.stagingDisplay);this.clearGroup(this.inactiveBowl);
   const count=this.game.dishes.length,scale=count===1?1.25:count===2?.83:.61;
   const slot=(index:number)=>count===1?0:(index-(count-1)/2)*(count===2?1.26:.83);
   this.bowl.scale.setScalar(scale);this.bowl.position.x=slot(this.game.order);this.inactiveBowl.visible=count>1;
   this.renderDishContents(this.bowlContents,d);
   this.game.dishes.forEach((dish,index)=>{
    if(index!==this.game.order&&!dish.served){const other=new T.Group();other.position.x=slot(index);other.scale.setScalar(scale);this.inactiveBowl.add(other);this.makeBowl(other);this.renderDishContents(other,dish)}
    const item=this.game.staged[index];if(item&&item.food!=='dish'){
     const tray=new T.Group();tray.position.set(slot(index),0,0);this.stagingDisplay.add(tray);this.box(count>2?.64:.85,.035,.38,'cream',tray);
     if(item.food==='yogurt'){const measure=new T.Group();measure.scale.setScalar(.55);tray.add(measure);measure.position.y=.06;this.renderMeasure(measure,item)}else{const f=this.food(item,tray,0,.12,0);f.scale.setScalar(.5)}
    }
   });
  }
  // A blend changes dish state while the same {food:'dish'} remains in the hand.
  const held=this.game.held,h=JSON.stringify([held,held?.food==='dish'?this.game.dish:null]);
  if(h!==this.lastHeld){this.lastHeld=h;this.clearGroup(this.held);if(held?.food==='dish'){this.makeBowl(this.held);this.renderDishContents(this.held,d)}else if(held?.food==='yogurt')this.renderMeasure(this.held,held);else if(held)this.food(held,this.held)}
  this.bowl.visible=held?.food!=='dish'&&!d.served;
  const action=this.game.events.at(-1)?.action??'';if(action!==this.lastToolEvent){this.lastToolEvent=action;if(/^(blend|toast-|roast-|dice-|grate-)/.test(action))this.toolPulse=.9}
 }
 burst(success=true){for(let i=0;i<(this.reduced?0:22);i++){const mesh=this.box(.1,.1,.1,success?'brass':'white');mesh.position.copy(this.position).add(new T.Vector3(0,1,0));this.effects.push({mesh,age:0,vel:new T.Vector3((Math.random()-.5)*5,2+Math.random()*4,(Math.random()-.5)*5)})}}
 tick(dt:number){this.time+=dt;this.toolPulse=Math.max(0,this.toolPulse-dt);const rotor=this.toolDisplay.getObjectByName('blender-rotor');if(rotor&&this.toolPulse>0)rotor.rotation.y+=dt*25;this.cheerTime=Math.max(0,this.cheerTime-dt);this.sync();this.player.position.copy(this.position);if(!this.reduced){this.player.position.y=this.realCook?0:this.moving?Math.sin(this.time*15)*.055:Math.sin(this.time*2)*.014;this.held.rotation.z=this.game.dish.yogurt.length>3?Math.sin(this.time*12)*.13:0;this.customers.forEach((c,i)=>c.position.y=.45+(this.cheerTime>0?Math.abs(Math.sin(this.time*14+i))*.3:Math.sin(this.time*2+i)*.025))}if(this.mixer){this.setAnimation(this.moving?(this.game.held?'carry':'walk'):'idle');this.mixer.update(dt);if(this.game.held&&!this.moving)for(const [bone,q]of this.holdPose)bone.quaternion.copy(q);this.player.updateMatrixWorld(true)}if(this.realCook){const dish=this.game.held?.food==='dish';this.held.scale.setScalar(dish?.72:.85);if(this.gripBones.length===2&&this.game.held){const grip=this.gripBones[0].getWorldPosition(new T.Vector3()).add(this.gripBones[1].getWorldPosition(new T.Vector3())).multiplyScalar(.5);this.player.worldToLocal(grip);grip.y-=dish?.19:0;grip.z=Math.max(.32,grip.z+.08);this.held.position.copy(grip)}else this.held.position.set(0,.95,.72)}for(const e of [...this.effects]){e.age+=dt;e.vel.y-=9*dt;e.mesh.position.addScaledVector(e.vel,dt);if(e.age>1.3){this.scene.remove(e.mesh);e.mesh.geometry.dispose();this.effects.splice(this.effects.indexOf(e),1)}}}
 render(){this.renderer.render(this.scene,this.camera)}
 stationScreen(id:string){const s=this.stations.find(s=>s.id===id);if(!s)return;const p=s.pos.clone();p.y=1.1;p.project(this.camera);return {x:Math.round((p.x*.5+.5)*this.canvas.clientWidth),y:Math.round((-.5*p.y+.5)*this.canvas.clientHeight)}}
}
