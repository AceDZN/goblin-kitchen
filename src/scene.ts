import * as T from 'three';
import {modelLibrary} from './model-library';
import {buildWorld} from './world';
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
 mixer?:T.AnimationMixer;actions:Record<string,T.AnimationAction>={};realCook=false;realProp=false;riggedCook=false;jointCount=0;clipNames:string[]=[];activeAnimation='';clipRoles:{idle?:string;walk?:string;carry?:string}={};holdPose=new Map<T.Object3D,T.Quaternion>();gripBones:T.Bone[]=[];actor?:T.Group;propTemplate?:T.Group;cheerTime=0;modelStatus='Loading authored kitchen assets';
 material:Record<string,T.MeshStandardMaterial>={};labels:T.Sprite[]=[];reduced=false;lastHeld='';lastBowl='';moving=false;boardMoved=false;fps=0;frames=0;frameTime=0;
 worldReady=false;missingModels=new Set<string>();authoredInstances=0;groundTexture?:T.Texture;floorTexture?:T.Texture;terraceTexture?:T.Texture;
 venueIndex=-1;venueName='';venueVisuals={name:'',decor:[] as string[],palette:'',layout:0};
 floorTiles?:T.InstancedMesh;hemi?:T.HemisphereLight;sun?:T.DirectionalLight;lastStock='';lastTools='';lastLiquids='';lastToolEvent='';toolPulse=0;

 constructor(public canvas:HTMLCanvasElement,public game:Kitchen){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;
  this.scene.background=new T.Color('#d4c5ac');this.camera.position.set(0,23,22);this.camera.lookAt(0,0,0);
  this.hemi=new T.HemisphereLight('#fff3df','#8c9c89',2.4);this.scene.add(this.hemi);this.sun=new T.DirectionalLight('#fff0d6',3.2);this.sun.position.set(-9,18,6);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:.5,far:55});this.sun.shadow.normalBias=.025;this.sun.shadow.bias=-.00025;this.sun.shadow.radius=3;this.scene.add(this.sun);
  const fill=new T.DirectionalLight('#c9deef',.65);fill.position.set(6,6,-7);this.scene.add(fill);
  for(const [n,c] of Object.entries({wood:'#79472c',top:'#b17b47',dark:'#382633',cream:'#f4e0b5',brass:'#bc883b',green:'#6b8b37',tile:'#63505f',white:'#fff5de',banana:'#e7b936',apple:'#b84131',pear:'#97ad48',tomato:'#bf4430',carrot:'#e17d24',cucumber:'#3f693b',cucumberFlesh:'#bbcc78',potato:'#c5a46e',mushroom:'#91745b',mushroomFlesh:'#e4d4b3',pepper:'#c45a34',toast:'#9c642d',roast:'#ac6e39',char:'#493225',metal:'#718080',wall:'#51404b',accent:'#c79142',awning:'#6b3741',water:'#457783',yogurt:'#fff0d6',broth:'#b96a2b',oil:'#c9a12f',glass:'#b2bba7',hot:'#f49637'})){
   this.material[n]=new T.MeshStandardMaterial({color:c,roughness:['brass','metal'].includes(n)?.4:.82,metalness:n==='brass'?.5:n==='metal'?.45:0});
  }
  this.material.hot.emissive.set('#e8621d');this.material.hot.emissiveIntensity=.6;
  this.scene.add(this.room,this.venueDecor);this.buildRoom();this.buildStations();this.makeCook();this.scene.add(this.player);this.player.add(this.held);this.held.position.set(0,.95,.48);this.layout(game.shift);
  this.resize();addEventListener('resize',()=>this.resize());
 }
 /** Place authored geometry independently of authoritative collision dimensions. */
 model(name:string,parent:T.Object3D,x=0,y=0,z=0,size?:number|[number,number,number],rotation=0){
  const model=modelLibrary.create(name);if(!model){if(modelLibrary.ready)this.missingModels.add(name);return undefined}
  const bounds=modelLibrary.bounds(name)!;
  if(typeof size==='number')model.scale.setScalar(size/Math.max(...bounds.size));
  else if(size)model.scale.set(size[0]/bounds.size[0],size[1]/bounds.size[1],size[2]/bounds.size[2]);
  model.position.set(x,y,z);model.rotation.y=rotation;parent.add(model);this.authoredInstances++;return model;
 }
 async loadWorld(){
  await modelLibrary.load();
  this.groundTexture=await new T.TextureLoader().loadAsync(`${import.meta.env.BASE_URL}textures/town-paving.jpg`);
  this.groundTexture.colorSpace=T.SRGBColorSpace;this.groundTexture.wrapS=this.groundTexture.wrapT=T.RepeatWrapping;this.groundTexture.repeat.set(22,22);this.terraceTexture=this.groundTexture.clone();this.terraceTexture.repeat.set(4.6,3.6);this.groundTexture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
  this.floorTexture=await new T.TextureLoader().loadAsync(`${import.meta.env.BASE_URL}textures/kitchen-ceramic.jpg`);this.floorTexture.colorSpace=T.SRGBColorSpace;this.floorTexture.wrapS=this.floorTexture.wrapT=T.RepeatWrapping;this.floorTexture.repeat.set(2,1.5);this.floorTexture.anisotropy=8;
  this.buildStationArt();this.buildVenue(this.game.spec.venue);this.worldReady=true;
  this.lastStock='';this.lastTools='';this.lastLiquids='';this.lastHeld='';this.lastBowl='';this.sync();this.render();
 }
 mesh(geo:T.BufferGeometry,mat:string|T.Material,parent:T.Object3D=this.scene,x=0,y=0,z=0){const m=new T.Mesh(geo,typeof mat==='string'?this.material[mat]:mat);m.position.set(x,y,z);m.castShadow=parent!==this.scene;m.receiveShadow=true;parent.add(m);return m}
 box(w:number,h:number,d:number,mat:string,parent:T.Object3D=this.scene,x=0,y=0,z=0){return this.mesh(new T.BoxGeometry(w,h,d),mat,parent,x,y,z)}
 sphere(r:number,mat:string,parent:T.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=this.mesh(new T.SphereGeometry(r,12,10),mat,parent,x,y,z);m.scale.set(sx,sy,sz);return m}
 cylinder(rt:number,rb:number,h:number,mat:string,parent:T.Object3D,x=0,y=0,z=0){return this.mesh(new T.CylinderGeometry(rt,rb,h,16),mat,parent,x,y,z)}
 textSprite(text:string,size=.72){const c=document.createElement('canvas');c.width=512;c.height=100;const ctx=c.getContext('2d')!;ctx.fillStyle='#2b1d2b';ctx.beginPath();ctx.roundRect(3,3,506,94,12);ctx.fill();ctx.strokeStyle='#bb915e';ctx.lineWidth=4;ctx.stroke();ctx.font='600 58px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff1cf';ctx.fillText(text,256,51);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:tx,depthTest:false}));sprite.scale.set(size*3.15,size*.62,1);sprite.userData.ownedSprite=true;sprite.userData.text=text;return sprite}
 label(text:string,x:number,y:number,z:number,size=.72){const sprite=this.textSprite(text,size);sprite.position.set(x,y,z);this.scene.add(sprite);this.labels.push(sprite);return sprite}
 setLabel(index:number,text:string){const old=this.labels[index];if(old.userData.text===text)return;const sprite=this.textSprite(text,.42);sprite.position.copy(old.position);this.scene.remove(old);const mat=old.material as T.SpriteMaterial;mat.map?.dispose();mat.dispose();this.scene.add(sprite);this.labels[index]=sprite}
 buildRoom(){}
 buildVenue(index:number){
  this.venueIndex=index;this.venueName=VENUE_STYLES[index].name;
  if(!modelLibrary.ready)return;
  this.clearGroup(this.venueDecor);this.customers=[];
  this.venueVisuals={name:this.venueName,decor:buildWorld(this,index),palette:VENUE_STYLES[index].sky,layout:this.game.spec.layout};
 }
 station(id:string,label:string,x:number,z:number,ax:number,az:number,w=1.8,d=1.4){
  const g=new T.Group();g.position.set(x,0,z);this.scene.add(g);
  const s={id,label,pos:new T.Vector3(x,0,z),approach:new T.Vector3(ax,0,az),width:w,depth:d,group:g};
  this.stations.push(s);this.label(label,x,1.8,z,.42);return g;
 }
 buildStations(){
  const fruit=this.station('fruit','PANTRY',-5,-3,-3.7,-3);fruit.add(this.pantryDisplay);this.pantryDisplay.position.y=1.16;
  this.station('board','PREP',-5,0,-3.7,0);
  this.station('bread','BREAD',-5,3,-3.7,3);
  const mix=this.station('bowl','MIX',0,-3.1,0,-1.8,2.5,1.7);mix.add(this.bowl,this.inactiveBowl,this.stagingDisplay);this.bowl.position.y=1.18;this.bowl.add(this.bowlContents);this.inactiveBowl.position.y=1.18;this.stagingDisplay.position.set(0,1.18,.72);
  const measure=this.station('yogurt','MEASURE',5,-3,3.7,-3);measure.add(this.liquidDisplay);this.liquidDisplay.position.y=1.16;
  this.station('serve','SERVE',5,.5,3.7,.5,1.8,2);
  this.station('sink','WASH / RESET',0,3.7,0,2.3,2.1,1.4);
  const tools=this.station('prepared','TOOLS',3.5,3.7,3.5,2.3);tools.add(this.toolDisplay);this.toolDisplay.position.y=1.16;
 }
 buildStationArt(){
  for(const station of this.stations){
   const art=new T.Group();art.name='station-art';station.group.add(art);
   const {id,width:w,depth:d}=station;
   if(id==='sink')this.model('kitchen/kitchencounter_sink',art,0,0,0,[w,1.98,d],Math.PI);
   else this.model(id==='bowl'?'kitchen/kitchentable_A_large':'kitchen/kitchencounter_straight_A',art,0,0,0,[w,1.12,d]);
   if(id==='board'){
    this.model('kitchen/cuttingboard',art,0,1.13,0,[1.3,.1,.86]);
    const knife=this.model('kitchen/knife',art,.28,1.26,0,.72);if(knife){knife.rotation.z=Math.PI/2;knife.rotation.y=.3}
   }
   if(id==='bread'){
    this.model('kitchen/crate',art,0,1.13,0,[1.42,.28,1.03]);this.model('food/loaf',art,-.25,1.4,0,.85);this.model('food/bread',art,.4,1.4,0,.5);
   }
   if(id==='serve'){
    this.model('kitchen/plate',art,0,1.13,0,1.1);
    this.model('kitchen/menu',art,.6,1.13,-.5,.6);
   }
  }
 }
 updateStock(){
  if(!modelLibrary.ready)return;
  const stock=this.game.spec.pantry,key=JSON.stringify(stock);if(key===this.lastStock)return;this.lastStock=key;this.clearGroup(this.pantryDisplay);
  stock.filter(f=>f!=='bread').slice(0,5).forEach((food,i,foods)=>{const x=(i-(foods.length-1)/2)*Math.min(.4,1.4/foods.length);this.model('kitchen/bowl_small',this.pantryDisplay,x,0,0,[.4,.13,.5]);const f=this.food({food,form:'whole',count:1},this.pantryDisplay,x,.12,0);f.scale.setScalar(foods.length>3?.58:.75)})
 }
 updateLiquids(){
  if(!modelLibrary.ready)return;
  const liquids=this.game.spec.liquids,key=JSON.stringify(liquids);if(key===this.lastLiquids)return;this.lastLiquids=key;this.clearGroup(this.liquidDisplay);
  liquids.forEach((liquid,i)=>{const x=(i-(liquids.length-1)/2)*.5;const name=liquid==='oil'?'food/bottle-oil':liquid==='broth'?'kitchen/pot_A_stew':'kitchen/jar_A_large';this.model(name,this.liquidDisplay,x,0,-.12,liquid==='broth'?.67:.7);const sign=this.textSprite(liquid.toUpperCase(),.14);sign.position.set(x,.14,.3);this.liquidDisplay.add(sign)});
  this.model('food/cup',this.liquidDisplay,.58,0,.37,.36);
 }
 updateTools(){
  if(!modelLibrary.ready)return;
  const tools=this.game.spec.tools,pear=this.game.spec.recipes.some(r=>r.food==='pear'&&(r.form==='prepared'||r.prepared)),key=JSON.stringify([tools,pear]);if(key===this.lastTools)return;this.lastTools=key;this.clearGroup(this.toolDisplay);
  if(pear){const a=this.food({food:'pear',form:'prepared',count:1},this.toolDisplay,-.4,.08,0);a.scale.setScalar(.6);const b=this.food({food:'pear',form:'whole',count:1},this.toolDisplay,.28,.08,0);b.scale.setScalar(.6)}
  if(tools.includes('toast')||tools.includes('roast'))this.model('kitchen/oven',this.toolDisplay,-.44,0,-.12,[.78,.75,.8]);
  if(tools.includes('blend'))this.model('furniture/kitchenblender',this.toolDisplay,.45,0,-.12,[.48,.86,.48]);
  if(tools.includes('grate'))this.model('tools/grater',this.toolDisplay,.25,0,.42,[.3,.42,.28]);
  if(tools.includes('dice')){this.model('kitchen/cuttingboard',this.toolDisplay,-.4,0,.4,[.53,.06,.4]);const knife=this.model('kitchen/knife',this.toolDisplay,-.4,.12,.4,.4);if(knife)knife.rotation.z=Math.PI/2}
  if(!tools.length&&!pear)this.model('kitchen/pan_A',this.toolDisplay,0,0,0,.8);
 }
 makeBowl(parent:T.Group){if(this.propTemplate){const model=this.propTemplate.clone(true);model.traverse(o=>{if(o instanceof T.Mesh)o.geometry=o.geometry.clone()});parent.add(model)}else if(modelLibrary.ready)this.model('kitchen/bowl',parent,0,0,0,1.3)}
 spoon(parent:T.Object3D,x:number,y:number,z:number){return this.model('food/utensil-spoon',parent,x,y,z,.62)}
 food(item:Item,parent:T.Object3D,x=0,y=0,z=0){
  const group=new T.Group();group.position.set(x,y,z);parent.add(group);if(!modelLibrary.ready)return group;
  const state=item.form==='prepared'?'sliced':item.form;
  const states:Record<Food,[string,string,string?]>={banana:['food/banana','food/banana-sliced','food/banana-peeled'],apple:['food/apple','food/apple-sliced'],pear:['food/pear','food/pear-sliced'],bread:['food/loaf','food/bread'],tomato:['food/tomato','food/tomato-slice'],carrot:['kitchen/food_ingredient_carrot','kitchen/food_ingredient_carrot_pieces'],cucumber:['food/cucumber','food/cucumber-slices'],potato:['kitchen/food_ingredient_potato','kitchen/food_ingredient_potato_chopped'],mushroom:['food/mushroom','food/mushroom-half'],pepper:['food/paprika','food/paprika-slice']};
  const chosen=states[item.food],name=state==='diced'||state==='grated'?`food/${item.food}-${state}`:state==='whole'?chosen[0]:state==='peeled'?(chosen[2]??chosen[0]):chosen[1];
  const prepared=state!=='whole'&&state!=='peeled';
  const count=state==='diced'?5:state==='grated'?7:prepared&&item.food!=='bread'?3:Math.min(4,item.count);
  for(let i=0;i<count;i++){
   const size=state==='diced'?.2:state==='grated'?.2:prepared?.38:.65;
   const model=this.model(name,group,(i%3-(Math.min(count,3)-1)/2)*(prepared?.19:.13),Math.floor(i/3)*.1,Math.floor(i/3)*.15,size,i*.4);
   if(model){

    if(state==='grated'){const b=modelLibrary.bounds(name)!;if(b.size[1]>b.size[0]&&b.size[1]>b.size[2]){model.rotation.z=Math.PI/2;model.position.y+=.03}}
    if(state==='diced'&&name===chosen[0])model.scale.y*=.65;
    if(item.heat&&item.heat!=='raw'){model.traverse(o=>{if(o instanceof T.Mesh){const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const n=m.clone();if(n instanceof T.MeshStandardMaterial)n.color.multiply(new T.Color(item.heat==='toasted'?'#bb773b':'#c08b53'));n.userData.ownerMesh=o.uuid;return n});o.material=Array.isArray(o.material)?materials:materials[0];o.userData.ownedMaterial=true}})}
   }
  }
  group.userData.food=item.food;group.userData.form=item.form;group.userData.heat=item.heat??'raw';return group;
 }
 makeCook(){this.player.position.copy(this.position)}
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
   this.setAnimation('idle');this.mixer.update(.2);
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

 resize(){
  const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);const aspect=w/h;
  const half=6.8;this.camera.top=half;this.camera.bottom=-half;this.camera.left=-half*aspect;this.camera.right=half*aspect;
  this.camera.zoom=aspect<1?aspect*.85:aspect<1.45?.93:1;
  this.camera.position.set(0,23,22);this.camera.lookAt(0,0,.1);this.camera.updateProjectionMatrix();this.render();
 }

 pointer(clientX:number,clientY:number){const r=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new T.Vector2((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1),this.camera);const meshes=this.raycaster.intersectObjects(this.stations.map(s=>s.group),true);if(meshes[0]){let o:T.Object3D|null=meshes[0].object;while(o){const station=this.stations.find(s=>s.group===o);if(station)return {point:station.pos.clone(),station};o=o.parent}}const hit=this.raycaster.ray.intersectPlane(this.floor,new T.Vector3());if(!hit)return null;let nearest:Station|undefined;let dist=1.65;for(const s of this.stations){const d=hit.distanceTo(s.pos);if(d<dist){nearest=s;dist=d}}return {point:hit,station:nearest}}
 collision(pos:T.Vector3){if(Math.abs(pos.x+5)<1.16&&(Math.abs(pos.z-1.5)<1||Math.abs(pos.z+1.5)<1)||Math.abs(pos.x-5)<1.16&&Math.abs(pos.z+1.2)<1.11)return true;if(Math.abs(pos.x+6)<.885&&Math.abs(pos.z+4.65)<.885)return true;if(Math.abs(pos.x)>6.35||Math.abs(pos.z)>4.7)return true;return this.stations.some(s=>Math.abs(pos.x-s.pos.x)<s.width/2+.26&&Math.abs(pos.z-s.pos.z)<s.depth/2+.26)}
 move(dx:number,dz:number,dt:number){const mag=Math.hypot(dx,dz);this.moving=mag>.02;if(!this.moving)return;dx/=mag;dz/=mag;const speed=4.6;const p=this.position.clone();p.x+=dx*speed*dt;if(!this.collision(p))this.position.x=p.x;p.copy(this.position);p.z+=dz*speed*dt;if(!this.collision(p))this.position.z=p.z;this.look=Math.atan2(dx,dz);this.player.rotation.y=this.look}
 nearest(){let best:Station|undefined,d=1.85;for(const s of this.stations){const v=this.position.distanceTo(s.pos);if(v<d){d=v;best=s}}return best}
 layout(_index:number){
  const spec=this.game.spec,layout=((spec.layout??0)%6+6)%6,venue=Math.min(5,Math.max(0,spec.venue??0));
  const sideSlots:[number,number,number,number][]=[[-5,-3,-3.7,-3],[-5,3,-3.7,3],[5,-3,3.7,-3]];
  const permutations=[[0,1,2],[1,0,2],[2,1,0],[0,2,1],[2,0,1],[1,2,0]];
  const p=permutations[layout],mapping:Record<string,[number,number,number,number]>={fruit:sideSlots[p[0]],bread:sideSlots[p[1]],yogurt:sideSlots[p[2]],board:[-5,0,-3.7,0],bowl:[0,-3.1,0,-1.8],serve:[5,.5,3.7,.5],sink:[0,3.7,0,2.3],prepared:[3.5,3.7,3.5,2.3]};
  for(const s of this.stations){const a=mapping[s.id];s.pos.set(a[0],0,a[1]);s.approach.set(a[2],0,a[3]);s.group.position.copy(s.pos)}
  this.boardMoved=false;if(venue!==this.venueIndex)this.buildVenue(venue);this.venueVisuals.layout=layout;
  for(let i=0;i<this.stations.length;i++){const s=this.stations[i];s.label=s.id==='fruit'?'PANTRY':s.id==='yogurt'?'MEASURE':s.id==='prepared'?'TOOLS':s.label;this.setLabel(i,s.label);this.labels[i].position.set(s.pos.x,s.id==='bowl'?2.04:1.78,s.pos.z)}
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
  const puree=d.blended||d.pureed,fill=puree?.24:Math.min(.30,volume*.04);
  if(d.yogurt.length||puree){
   const color=new T.Color(d.yogurt.at(-1)?LIQUID_COLORS[d.yogurt.at(-1)!.liquid??'yogurt']:LIQUID_COLORS.yogurt);
   if(puree){const colors=d.items.map(item=>this.material[FOOD_FLESH[item.food]].color);for(const c of colors)color.lerp(c,1/(colors.length+1));}
   // A local material owns no texture and can be disposed independently.
   const mat=new T.MeshStandardMaterial({color,roughness:.55});
   const surface=this.mesh(new T.CylinderGeometry(.45,.32,Math.max(.025,fill),24),mat,parent,0,.20+fill/2,0);surface.name=d.blended?'blended-mixture':'measured-liquid';surface.userData.ownedMaterial=true;mat.userData.ownerMesh=surface.uuid;
   if(d.blended){for(let i=0;i<5;i++)this.sphere(.022,'cream',parent,Math.sin(i*2.4)*.25,.21+fill,Math.cos(i*2.4)*.25,1,.25,1)}
  }
  const recipe=this.game.spec.recipes[this.game.dishes.indexOf(d)],layered=!!recipe?.layers;
  d.items.slice(d.blended?d.items.length:(d.blendedItems??0),9).forEach((item,i)=>{
   const f=this.food(item,parent,layered?0:Math.sin(i*2.4)*.25,.32+fill+i*(layered?.11:.025),layered?0:Math.cos(i*2.4)*.25);f.scale.setScalar(layered?.85:.65);
  });
  if(!d.clean)this.model('kitchen/bowl_dirty',parent,0,.05,0,1.1);
  if(d.stirred&&!d.blended)this.spoon(parent,.2,.4,0);
 }
 renderMeasure(parent:T.Group,item:Extract<Carry,{food:'yogurt'}>){
  if(!modelLibrary.ready)return;
  const liquid=item.liquid??'yogurt';
  if(item.unit==='cup'||item.unit==='half-cup'){
   this.model('food/cup',parent,0,-.16,0,[.5,.43,.5]);
   const half=item.unit==='half-cup';this.cylinder(.15,.15,.02,liquid,parent,0,half?.04:.21,0);
  }else{
   const spoon=new T.Group();parent.add(spoon);spoon.scale.setScalar(item.unit==='teaspoon'?.7:1);
   this.spoon(spoon,0,0,0);this.sphere(.11,liquid,spoon,0,.04,.17,1,.35,1);
  }
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
     const tray=new T.Group();tray.position.set(slot(index),0,0);this.stagingDisplay.add(tray);this.model('kitchen/plate',tray,0,0,0,[count>2?.64:.85,.04,.4]);
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
 tick(dt:number){this.time+=dt;this.toolPulse=Math.max(0,this.toolPulse-dt);const rotor=this.toolDisplay.getObjectByName('blender-rotor');if(rotor&&this.toolPulse>0)rotor.rotation.y+=dt*25;this.cheerTime=Math.max(0,this.cheerTime-dt);this.sync();this.player.position.copy(this.position);if(!this.reduced){this.player.position.y=this.realCook?0:this.moving?Math.sin(this.time*15)*.055:Math.sin(this.time*2)*.014;this.held.rotation.z=this.game.dish.yogurt.length>3?Math.sin(this.time*12)*.13:0;this.customers.forEach((c,i)=>c.position.y=(this.cheerTime>0?Math.abs(Math.sin(this.time*14+i))*.3:Math.sin(this.time*2+i)*.025))}if(this.mixer){this.setAnimation(this.moving?(this.game.held?'carry':'walk'):'idle');this.mixer.update(dt);if(this.game.held&&!this.moving)for(const [bone,q]of this.holdPose)bone.quaternion.copy(q);this.player.updateMatrixWorld(true)}if(this.realCook){const dish=this.game.held?.food==='dish';this.held.scale.setScalar(dish?.72:.85);if(this.gripBones.length===2&&this.game.held){const grip=this.gripBones[0].getWorldPosition(new T.Vector3()).add(this.gripBones[1].getWorldPosition(new T.Vector3())).multiplyScalar(.5);this.player.worldToLocal(grip);grip.y-=dish?.19:0;grip.z=Math.max(.32,grip.z+.08);this.held.position.copy(grip)}else this.held.position.set(0,.95,.72)}for(const e of [...this.effects]){e.age+=dt;e.vel.y-=9*dt;e.mesh.position.addScaledVector(e.vel,dt);if(e.age>1.3){this.scene.remove(e.mesh);e.mesh.geometry.dispose();this.effects.splice(this.effects.indexOf(e),1)}}}
 render(){this.renderer.render(this.scene,this.camera)}
 stationScreen(id:string){const s=this.stations.find(s=>s.id===id);if(!s)return;const p=s.pos.clone();p.y=1.1;p.project(this.camera);return {x:Math.round((p.x*.5+.5)*this.canvas.clientWidth),y:Math.round((-.5*p.y+.5)*this.canvas.clientHeight)}}
}
