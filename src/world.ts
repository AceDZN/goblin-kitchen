import * as T from 'three';
import type {KitchenScene} from './scene';

/** Scenery has no gameplay colliders. Every venue sits in a continuous, inhabited world. */
export function buildWorld(k:KitchenScene,index:number):string[]{
 const g=k.venueDecor,used=new Set<string>();
 const place=(name:string,x:number,z:number,size:number|[number,number,number],rotation=0,y=0)=>{
  const model=k.model(name,g,x,y,z,size,rotation);if(model)used.add(name);return model;
 };
 const groundMaterial=new T.MeshStandardMaterial({map:index===2?null:k.groundTexture,color:index===2?'#76965b':index===5?'#e5dfd0':'#c9c0aa',roughness:.96});
 const ground=k.mesh(new T.PlaneGeometry(index===3?56:90,90),groundMaterial,g,index===3?19.8:0,index===4?-4.045:-.045,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;ground.userData.ownedMaterial=true;groundMaterial.userData.ownerMesh=ground.uuid;
 // Authored checker tiles meet the paving at ground level; there is no suspended base.
 const floorMaterial=new T.MeshStandardMaterial({map:k.floorTexture,color:['#ffe4b8','#ffe4c1','#e6edd3','#e1e8e1','#efdfd5','#eee4ce'][index],roughness:.72});
 const floor=k.mesh(new T.PlaneGeometry(14,12),floorMaterial,g,0,.004,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;floor.userData.ownedMaterial=true;floorMaterial.userData.ownerMesh=floor.uuid;
 // Low cutaway enclosure keeps preparation surfaces readable from the three-quarter camera.
 for(let x=-6;x<=6;x+=2){place('kitchen/wall',x,-5.9,[2,.85,.28]);if(Math.abs(x)>2)place('kitchen/wall',x,5.9,[2,.45,.28])}
 for(let z=-4.8;z<=4.8;z+=1.92){place('kitchen/wall',-6.9,z,[1.94,.7,.28],Math.PI/2);if(z<-.95||z>2)place('kitchen/wall',6.9,z,[1.94,.65,.28],Math.PI/2)}
 place('kitchen/wall_orderwindow_decorated',6.3,.5,[2.5,2.25,.42],Math.PI/2);
 place('kitchen/fridge_A_decorated',-6,-4.65,[1.25,2.1,1.25],Math.PI/2);
 place('kitchen/kitchencabinet_half',-3.7,-5.55,[1.75,.68,.48],0,1.15);
 place('kitchen/shelf_papertowel_decorated',3.4,-5.55,[2,.9,.48],0,1.1);
 place('kitchen/jar_B_medium',-2.2,-5.46,.5,0,1.05);
 place('kitchen/jar_C_large',-1.7,-5.46,.6,0,1.05);
 const tree=(x:number,z:number,s=3.3)=>place(Math.abs(x+z)%2>.8?'nature/tree-detailed':'nature/tree-oak',x,z,s,0,index===4?-4:0);
 const house=(name:string,x:number,z:number,s:number|[number,number,number],rotation=0)=>place('world/'+name,x,z,s,rotation,index===4?-4:0);
 const cafe=(x:number,z:number)=>{
  place('kitchen/table_round_A_small_decorated',x,z,[1.45,1.3,1.45]);
  place('kitchen/chair_B',x-1,z,[.66,1.05,.66],Math.PI/2);
  place('kitchen/chair_B',x+1,z,[.66,1.05,.66],-Math.PI/2);
 };
 const barrels=(x:number,z:number)=>{place('world/barrel',x,z,.85);place('world/crate_A_big',x+.8,z+.25,.68)};
 const homes=['building_home_A_red','building_home_B_yellow','building_home_B_red','building_home_A_green'];
 // Each chapter changes the surrounding place, not only its sign.
 if(index===4){const terraceMaterial=groundMaterial.clone();terraceMaterial.map=k.terraceTexture!;const terrace=k.mesh(new T.PlaneGeometry(19,15),terraceMaterial,g,0,-.015,0);terrace.rotation.x=-Math.PI/2;terrace.castShadow=false;terrace.userData.ownedMaterial=true;terraceMaterial.userData.ownerMesh=terrace.uuid}
 if(index!==5){
  for(let i=0;i<4;i++)house(homes[i],-11+i*7,-9.4,5.1,i%2?Math.PI*.1:0);
  if(index!==2)for(const x of (index===3?[11]:[-10.5,10.5]))for(let i=0;i<3;i++)house(homes[i],x>0&&i>0?x+2.5:x,-5+i*7,4.7,x<0?Math.PI/2:-Math.PI/2);
 }
 if(index!==3&&index!==5){
  for(const [x,z]of [[-8.4,4.2],[-10,-5],[11.5,6.6],[12,-5],[-5,9.2],[5,9.2]] as const)tree(x,z,3.2);
 }
 if(index<3){for(const [x,z]of [[-8.6,.2],[10,-4],[-4,7.3],[7.8,8]] as const)cafe(x,z)}
 for(const [x,z]of [[-6.5,5.4],[6.4,5.4],[-6.5,-5.5],[6.4,-5.5]] as const)place('furniture/plantsmall2',x,z,1.1);
 if(index!==4){barrels(-7.9,3.5);barrels(8,-3.9);place('world/wheelbarrow',-8,-3,1.4,-.4)}
 if(index<3){place('kitchen/crate_tomatoes',-8,-5.5,[1.1,.55,.9]);place('kitchen/crate_carrots',-9.1,-5.5,[1,.55,.9])}
 if(index===0){
  house('building_tavern_red',-9,-8.3,5.7,.15);
  house('building_blacksmith_red',4.2,-9.3,5.3);
  house('building_well_yellow',-10,2.7,2.2);
 }else if(index===1){
  house('building_tavern_yellow',-7.8,-8.5,6.3,.1);
  house('building_windmill_yellow',5.9,-10.5,6.2);
  for(let i=0;i<3;i++){place('world/sack',-7.8-i*.75,2.2,[.65,.5,.85]);place('kitchen/crate_buns',-8-i*.85,-4.2,[.8,.4,.8])}
  place('kitchen/oven',-3,-5.3,[1.5,1.7,1.1]);
 }else if(index===2){
  house('building_market_green',-8,-8.5,6.2);
  house('building_market_yellow',5.9,-9.2,5.9);
  for(const x of [-10,10])for(let z=-4;z<=4;z+=2.7){tree(x,z,2.6);place('kitchen/crate_tomatoes',x-1,z,[1,.5,.8])}
  for(const x of [-9.5,9.5])for(const z of [-3,2,7]){house('building_market_green',x,z,3.7,x<0?Math.PI/2:-Math.PI/2);for(let i=0;i<4;i++)place(i%2?'nature/flower-purplea':'nature/flower-yellowa',x+(i-1.5)*.5,z+1.8,.6)}
  for(let i=0;i<7;i++)place('nature/plant-bushdetailed',-9+i*3,7.7,1.4);
 }else if(index===3){
  const waterMaterial=new T.MeshStandardMaterial({color:'#62afb3',roughness:.28,metalness:.18});
  const water=k.mesh(new T.PlaneGeometry(100,100),waterMaterial,g,0,-.11,0);water.rotation.x=-Math.PI/2;water.castShadow=false;water.userData.ownedMaterial=true;waterMaterial.userData.ownerMesh=water.uuid;
  // The quay joins the entire town; bridges and warehouses explain the waterfront.
  house('building_watermill_blue',-9.5,-7.8,5.8,Math.PI/2);
  house('building_bridge_A',-10,-4,4.5,0);
  place('world/boat',-9.65,1.3,2.75,.15,-.04);
  house('building_tavern_blue',10,-7.9,5.2,-Math.PI/2);
  for(let i=0;i<7;i++){place('world/barrel',-7.95,-5.8+i*2,.65);place('world/crate_A_big',-6+i*2,7.8,.7)}
 }else if(index===4){
  // A roof terrace built into the upper floor of a city block. Adjoining roofs,
  // stair access and masonry parapets make its support and location explicit.
  for(const x of [-10,10])for(const z of [-7,6])house('building_home_B_red',x,z,6.4,x<0?.2:-.2);
  house('building_tower_A_yellow',3.9,-9,8.5);
  for(let x=-8;x<=8;x+=4)place('kitchen/wall_window_closed',x,7.5,[4,4,.45],0,-4);
  for(let z=-5.5;z<=6.5;z+=4)for(const x of [-9.5,9.5])place('kitchen/wall_window_closed',x,z,[4,4,.45],Math.PI/2,-4);
  for(const x of [-6.7,6.7])place('furniture/pottedplant',x,2.7,1.5);
  place('world/ladder',-9.8,3.5,[.8,4,.22],Math.PI/2,-4);
  for(let x=-6;x<=6;x+=2)place('world/wall_straight',x,-6.3,[2,.75,.5]);
 }else{
  house('building_castle_blue',-11.8,1,[6.5,7.5,5.5],Math.PI/2);
  house('building_castle_blue',11.8,1,[6.5,7.5,5.5],-Math.PI/2);
  for(let x=-6;x<=6;x+=2)place('world/wall_straight',x,-7,[2,2.1,.7]);
  house('building_tower_B_blue',-10,-7,6);
  house('building_tower_B_blue',10,-7,6);
  for(let i=0;i<4;i++){place('world/flag_blue',-7.6, -4+i*2.6,[.16,1.65,1.3],Math.PI/2);place('world/flag_blue',7.6,-4+i*2.6,[.16,1.65,1.3],-Math.PI/2)}
  for(const x of [-10,10])for(const z of [6.8,9.8])tree(x,z,2.8);
  for(let i=0;i<7;i++){place('nature/plant-bushdetailed',-9+i*3,7.8,1.5);place('nature/flower-reda',-8+i*2.7,8.2,.65)}
  house('building_well_blue',-8.8,1,2.8);
 }
 // Actual authored characters replace the old primitive customers.
 for(let i=0;i<3;i++){
  const character=place('customer/'+['casual-male','casual-female','character-male-c'][i],7.65,-.6+i*1.12,1.6,Math.PI/2);
  if(character)k.customers.push(character);
 }
 return [...used];
}
