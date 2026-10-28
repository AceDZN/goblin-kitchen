/** Curate/merge licensed source GLBs/GLTFs. Run after source acquisition; never creates primitive art. */
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,getBounds,mergeDocuments,prune,unpartition,flatten,join} from '@gltf-transform/functions';
import {readFile,writeFile,readdir,mkdir,copyFile,stat,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {Matrix3,Matrix4,Vector3} from 'three';

const ROOT=path.resolve(import.meta.dirname,'..');
const OUT=path.join(ROOT,'public/art');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const sha=data=>createHash('sha256').update(data).digest('hex');
const modelId=key=>'template_'+key.replace(/[^a-zA-Z0-9_-]/g,'__');
const restaurant='work/vendor/restaurant/addons/kaykit_restaurant_bits/Assets/gltf';
const medieval='work/vendor/medieval/addons/kaykit_medieval_hexagon_pack/Assets/gltf';
const commits={restaurant:'153c8a7535b48237854cb54ff6890679f8c574d1',medieval:'84fa4e91af6a88989be7c99e0891cede11f2ca38',kenney:'d4597ae135b1c2abe272da8f2b0797e10f06cb45'};
if(process.argv.includes('--verify-only')){await validate(JSON.parse(await readFile(OUT+'/manifest.json','utf8')));process.exit(0)}
const allFiles=async directory=>{const files=[];for(const f of await readdir(path.join(ROOT,directory),{withFileTypes:true})){const p=directory+'/'+f.name;if(f.isDirectory())files.push(...await allFiles(p));else files.push(p)}return files};
const allRestaurant=(await allFiles(restaurant)).filter(p=>p.endsWith('.gltf')).sort();
const worldNames=new Set([
 ...['red','yellow','green'].flatMap(color=>['home_A','home_B','tavern','market','blacksmith','well','watermill','windmill'].map(name=>`building_${name}_${color}`)),
 'building_castle_blue','building_castle_red','building_tower_A_blue','building_tower_B_red','building_tower_B_blue','building_tower_A_yellow','building_tavern_blue','building_watermill_blue','building_church_yellow','building_well_blue',
 'wall_straight','wall_straight_gate','wall_corner_A_gate','wall_corner_A_outside','wall_corner_A_inside','fence_stone_straight','fence_stone_straight_gate','fence_wood_straight','fence_wood_straight_gate',
 'building_bridge_A','building_bridge_B','barrel','crate_A_big','crate_A_small','crate_B_big','crate_B_small','crate_open','crate_long_A','crate_long_empty','sack','wheelbarrow','ladder','pallet','bucket_empty','bucket_water','flag_red','flag_green','flag_blue','flag_yellow',
 'tree_single_A','tree_single_B','trees_A_small','trees_A_medium','trees_B_small','trees_B_medium','rock_single_A','rock_single_B','hill_single_A','cloud_small','cloud_big'
]);
const worldFiles=(await allFiles(medieval)).filter(p=>p.endsWith('.gltf')&&worldNames.has(path.basename(p,'.gltf'))).sort();
const kenneyBase='work/vendor/tge/packs';
const foodFiles=(await allFiles(kenneyBase+'/food-kit')).filter(p=>p.endsWith('.glb')).sort();
const furnitureFiles=(await allFiles(kenneyBase+'/furniture-kit')).filter(p=>p.endsWith('.glb')).sort();
const natureFiles=(await allFiles(kenneyBase+'/nature-kit')).filter(p=>p.endsWith('.glb')).sort();
const customerFiles=(await allFiles(kenneyBase+'/mini-characters')).filter(p=>p.endsWith('.glb')).sort();
const entry=(key,file,pack,source,extra={})=>({key,file,pack,source,...extra});
const official=(repo,commit,file,base)=>`https://github.com/KayKit-Game-Assets/${repo}/blob/${commit}/${file.slice(base.length+1)}`;
const restaurantEntries=allRestaurant.map(file=>entry('kitchen/'+path.basename(file,'.gltf'),file,'KayKit Restaurant Bits 1.0',official('KayKit-Restaurant-Bits-1.0',commits.restaurant,file,'work/vendor/restaurant')));
const worldEntries=worldFiles.map(file=>entry('world/'+path.basename(file,'.gltf'),file,'KayKit Medieval Hexagon Pack 1.0',official('KayKit-Medieval-Hexagon-Pack-1.0',commits.medieval,file,'work/vendor/medieval')));
const kenneyEntries=(files,prefix,pack)=>files.map(file=>entry(prefix+'/'+path.basename(file,'.glb'),file,pack,`https://github.com/Hidencod/tge-assets/blob/${commits.kenney}/${file.slice('work/vendor/tge/'.length)}`));
const foodEntries=kenneyEntries(foodFiles,'food','Kenney Food Kit (CC0 mirror)');
for(const mode of ['peeled','sliced'])foodEntries.push({...foodEntries.find(e=>e.key==='food/banana'),key:'food/banana-'+mode,bananaMode:mode});
const furnitureEntries=kenneyEntries(furnitureFiles,'furniture','Kenney Furniture Kit (CC0 mirror)');
const natureEntries=kenneyEntries(natureFiles,'nature','Kenney Nature Kit (CC0 mirror)');
const customers=kenneyEntries(customerFiles,'customer','Kenney Mini Characters (CC0 mirror)').map(e=>({...e,idlePose:true}));
const boatEntry=entry('world/boat','work/vendor/tge/packs/pirate-kit/boat-row-small.glb','Kenney Pirate Kit (CC0 mirror)',`https://github.com/Hidencod/tge-assets/blob/${commits.kenney}/packs/pirate-kit/boat-row-small.glb`);worldEntries.push(boatEntry);
const special=[entry('food/cucumber','work/vendor/special/cucumber.glb','Grab3D Cozy Fruit & Vegetables','https://grab3d.com/models/food/cucumber/',{cucumberMode:'whole'}),entry('food/cucumber-slices','work/vendor/special/cucumber.glb','Grab3D Cozy Fruit & Vegetables','https://grab3d.com/models/food/cucumber/',{cucumberMode:'sliced'}),entry('tools/grater','work/vendor/special/grater.glb','Innerscene Four Grate','https://www.innerscene.com/tools/library/3d-parts/four-grate-kitchen-tool-22c54bea')];

const fleshColors={banana:[.94,.81,.52,1],apple:[.91,.82,.61,1],pear:[.88,.82,.56,1],bread:[.85,.69,.43,1],tomato:[.77,.13,.06,1],carrot:[.91,.38,.055,1],cucumber:[.62,.75,.35,1],potato:[.78,.65,.41,1],mushroom:[.80,.73,.57,1],pepper:[.80,.20,.07,1]};
const foodSource={banana:'food/banana',apple:'food/apple',pear:'food/pear',bread:'food/bread',tomato:'food/tomato',carrot:'food/carrot',potato:'kitchen/food_ingredient_potato',mushroom:'food/mushroom',pepper:'food/paprika'};
for(const [food,key] of Object.entries(foodSource))for(const form of ['diced','grated']){const source=[...foodEntries,...restaurantEntries].find(e=>e.key===key);foodEntries.push({...source,key:`food/${food}-${form}`,cutFood:food,cutForm:form})}
for(const form of ['diced','grated'])special.push({...special[0],key:'food/cucumber-'+form,cutFood:'cucumber',cutForm:form});
function sourceCut(document,food,form){
 const scene=document.getRoot().getDefaultScene()??document.getRoot().listScenes()[0],bounds=getBounds(scene),extent=bounds.max.map((v,i)=>v-bounds.min[i]),center=bounds.max.map((v,i)=>(v+bounds.min[i])/2),major=extent.indexOf(Math.max(...extent)),small=Math.min(...extent);
 const dimensions=form==='diced'?[small*.36,small*.36,small*.36]:extent.map((_,i)=>i===major?extent[major]*.36:small*.075);
 const cap=document.createMaterial('Cut '+food+' flesh').setBaseColorFactor(fleshColors[food]).setRoughnessFactor(.86);
 let triangles=[];
 for(const node of document.getRoot().listNodes())if(node.getMesh()){
  const matrix=new Matrix4().fromArray(node.getWorldMatrix()),normalMatrix=new Matrix3().getNormalMatrix(matrix);
  for(const primitive of node.getMesh().listPrimitives()){
   const pos=primitive.getAttribute('POSITION').getArray(),norm=primitive.getAttribute('NORMAL')?.getArray(),uv=primitive.getAttribute('TEXCOORD_0')?.getArray(),indices=primitive.getIndices()?.getArray()??Array.from({length:pos.length/3},(_,i)=>i);
   for(let i=0;i<indices.length;i+=3)triangles.push({material:primitive.getMaterial(),v:Array.from(indices.slice(i,i+3),j=>({p:new Vector3(...pos.slice(j*3,j*3+3)).applyMatrix4(matrix).toArray(),n:norm?new Vector3(...norm.slice(j*3,j*3+3)).applyMatrix3(normalMatrix).normalize().toArray():[0,1,0],uv:uv?Array.from(uv.slice(j*2,j*2+2)):[0,0]}))});
  }
 }
 const mix=(a,b,t)=>({p:a.p.map((v,k)=>v+(b.p[k]-v)*t),n:a.n.map((v,k)=>v+(b.n[k]-v)*t),uv:a.uv.map((v,k)=>v+(b.uv[k]-v)*t)});
 for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
  const coordinate=center[axis]-sign*dimensions[axis]/2,points=[],next=[];
  for(const triangle of triangles){const poly=[];for(let i=0;i<triangle.v.length;i++){const a=triangle.v[i],b=triangle.v[(i+1)%triangle.v.length],da=(a.p[axis]-coordinate)*sign,db=(b.p[axis]-coordinate)*sign,insideA=da>=-1e-8,insideB=db>=-1e-8;if(insideA)poly.push(a);if(insideA!==insideB){const v=mix(a,b,da/(da-db));poly.push(v);points.push(v.p)}}for(let i=1;i+1<poly.length;i++)next.push({material:triangle.material,v:[poly[0],poly[i],poly[i+1]]})}
  const unique=[...new Map(points.map(p=>[p.map(v=>Math.round(v*1e8)).join(','),p])).values()];
  if(unique.length>=3){const axes=[0,1,2].filter(i=>i!==axis),mid=[0,0,0];for(const p of unique)for(let j=0;j<3;j++)mid[j]+=p[j]/unique.length;unique.sort((a,b)=>Math.atan2(a[axes[1]]-mid[axes[1]],a[axes[0]]-mid[axes[0]])-Math.atan2(b[axes[1]]-mid[axes[1]],b[axes[0]]-mid[axes[0]]));const normal=[0,0,0];normal[axis]=-sign;for(let i=0;i<unique.length;i++){let face=[mid,unique[i],unique[(i+1)%unique.length]];const ab=new Vector3(...face[1]).sub(new Vector3(...face[0])),ac=new Vector3(...face[2]).sub(new Vector3(...face[0]));if(ab.cross(ac).dot(new Vector3(...normal))<0)face=[face[0],face[2],face[1]];next.push({material:cap,v:face.map(p=>({p,n:normal,uv:[0,0]}))})}}
  triangles=next;
 }
 if(!triangles.length)throw Error('Source cut empty: '+food+' '+form);
 for(const child of [...scene.listChildren()])scene.removeChild(child);
 const mesh=document.createMesh('Source-derived '+form+' '+food),buffer=document.getRoot().listBuffers()[0],byMaterial=new Map();
 for(const triangle of triangles){const key=triangle.material??cap;if(!byMaterial.has(key))byMaterial.set(key,[]);byMaterial.get(key).push(...triangle.v)}
 for(const [material,vertices]of byMaterial){const primitive=document.createPrimitive().setMaterial(material);primitive.setAttribute('POSITION',document.createAccessor().setType('VEC3').setArray(new Float32Array(vertices.flatMap(v=>v.p))).setBuffer(buffer));primitive.setAttribute('NORMAL',document.createAccessor().setType('VEC3').setArray(new Float32Array(vertices.flatMap(v=>v.n))).setBuffer(buffer));primitive.setAttribute('TEXCOORD_0',document.createAccessor().setType('VEC2').setArray(new Float32Array(vertices.flatMap(v=>v.uv))).setBuffer(buffer));mesh.addPrimitive(primitive)}scene.addChild(document.createNode('Prepared '+food+' '+form).setMesh(mesh));
}
function filterPrimitive(document,primitive,selected){
 const unique=[...new Set(selected)],remap=new Map(unique.map((v,i)=>[v,i])),buffer=document.getRoot().listBuffers()[0];
 for(const semantic of primitive.listSemantics()){
  const old=primitive.getAttribute(semantic),size=old.getElementSize(),array=old.getArray(),copy=new array.constructor(unique.length*size);
  unique.forEach((v,i)=>{for(let k=0;k<size;k++)copy[i*size+k]=array[v*size+k]});
  primitive.setAttribute(semantic,document.createAccessor().setType(old.getType()).setArray(copy).setNormalized(old.getNormalized()).setBuffer(buffer));
 }
 primitive.setIndices(document.createAccessor().setType('SCALAR').setArray(new Uint16Array(selected.map(i=>remap.get(i)))).setBuffer(buffer));
}
function separateCucumber(document,mode){
 for(const mesh of document.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){
  const pos=primitive.getAttribute('POSITION').getArray(),indices=primitive.getIndices().getArray(),parent=Array.from({length:pos.length/3},(_,i)=>i),find=i=>parent[i]===i?i:(parent[i]=find(parent[i])),join=(a,b)=>parent[find(a)]=find(b),points=new Map();
  for(let i=0;i<pos.length/3;i++){const key=Array.from(pos.slice(i*3,i*3+3)).map(v=>Math.round(v*1e6)).join(',');if(points.has(key))join(i,points.get(key));else points.set(key,i)}
  for(let i=0;i<indices.length;i+=3){join(indices[i],indices[i+1]);join(indices[i],indices[i+2])}
  const groups=new Map();for(let i=0;i<indices.length;i+=3){const key=find(indices[i]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(...indices.slice(i,i+3))}
  const sorted=[...groups.values()].sort((a,b)=>b.length-a.length),body=sorted[0],slices=sorted.filter(g=>g.length/3===864),selected=mode==='whole'?sorted.filter(g=>!slices.includes(g)).flat():slices.flat();
  if(!body||slices.length!==3)throw Error('Unexpected cucumber topology; inspect source before separating.');filterPrimitive(document,primitive,selected);
 }
}
function prepareBanana(document,mode){
 const material=document.createMaterial('Prepared banana flesh').setBaseColorFactor([.94,.81,.52,1]).setRoughnessFactor(.85),buffer=document.getRoot().listBuffers()[0];
 for(const mesh of document.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){
  primitive.setMaterial(material);if(mode!=='sliced')continue;
  const positions=primitive.getAttribute('POSITION').getArray(),normals=primitive.getAttribute('NORMAL')?.getArray(),indices=primitive.getIndices().getArray(),vertices=[];
  const cuts=[{z:-.036,sign:1},{z:.036,sign:-1}],edges=[[],[]];
  const mix=(a,b,t)=>({p:a.p.map((v,k)=>v+(b.p[k]-v)*t),n:a.n.map((v,k)=>v+(b.n[k]-v)*t)});
  const clip=(poly,cut,c)=>{const result=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a.p[2]-cut.z)*cut.sign,db=(b.p[2]-cut.z)*cut.sign,insideA=da>=-1e-8,insideB=db>=-1e-8;if(insideA)result.push(a);if(insideA!==insideB){const v=mix(a,b,da/(da-db));result.push(v);edges[c].push(v.p)}}return result};
  for(let i=0;i<indices.length;i+=3){let poly=Array.from(indices.slice(i,i+3),j=>({p:Array.from(positions.slice(j*3,j*3+3)),n:normals?Array.from(normals.slice(j*3,j*3+3)):[0,1,0]}));cuts.forEach((cut,c)=>{if(poly.length)poly=clip(poly,cut,c)});for(let j=1;j+1<poly.length;j++)vertices.push(poly[0],poly[j],poly[j+1])}
  for(let c=0;c<2;c++){const unique=[...new Map(edges[c].map(p=>[p.map(v=>Math.round(v*1e7)).join(','),p])).values()],center=[0,0,cuts[c].z];for(const p of unique){center[0]+=p[0]/unique.length;center[1]+=p[1]/unique.length}unique.sort((a,b)=>Math.atan2(a[1]-center[1],a[0]-center[0])-Math.atan2(b[1]-center[1],b[0]-center[0]));for(let i=0;i<unique.length;i++){const a=unique[i],b=unique[(i+1)%unique.length],normal=[0,0,-cuts[c].sign];const triangle=c===0?[center,b,a]:[center,a,b];vertices.push(...triangle.map(p=>({p,n:normal})))}}
  for(const semantic of primitive.listSemantics())primitive.setAttribute(semantic,null);
  primitive.setAttribute('POSITION',document.createAccessor().setType('VEC3').setArray(new Float32Array(vertices.flatMap(v=>v.p))).setBuffer(buffer));
  primitive.setAttribute('NORMAL',document.createAccessor().setType('VEC3').setArray(new Float32Array(vertices.flatMap(v=>v.n))).setBuffer(buffer));primitive.setIndices(null);
 }
}
function poseIdle(document){
 const idle=document.getRoot().listAnimations().find(a=>a.getName()==='idle');
 for(const channel of idle?.listChannels()??[]){const target=channel.getTargetNode(),sampler=channel.getSampler();if(!target||!sampler)continue;const values=sampler.getOutput()?.getArray();if(!values)continue;const prop=channel.getTargetPath(),n=prop==='rotation'?4:3,offset=sampler.getInterpolation()==='CUBICSPLINE'?n:0,value=Array.from(values.slice(offset,offset+n));if(prop==='rotation')target.setRotation(value);else if(prop==='translation')target.setTranslation(value);else if(prop==='scale')target.setScale(value)}
 for(const animation of document.getRoot().listAnimations())animation.dispose();
}
async function inputsFor(file){
 const files=[file];if(file.endsWith('.gltf')){const j=JSON.parse(await readFile(path.join(ROOT,file),'utf8'));for(const item of [...(j.buffers??[]),...(j.images??[])])if(item.uri&&!item.uri.startsWith('data:'))files.push(path.posix.join(path.posix.dirname(file),decodeURIComponent(item.uri)))}
 return Promise.all(files.map(async p=>({path:p,bytes:(await stat(path.join(ROOT,p))).size,sha256:sha(await readFile(path.join(ROOT,p)))})));
}
await mkdir(OUT,{recursive:true});await mkdir(OUT+'/licenses',{recursive:true});
const manifest={version:1,prepared:'2026-10-28',license:'CC0-1.0',atlases:[],models:{},sources:{restaurant:{page:'https://github.com/KayKit-Game-Assets/KayKit-Restaurant-Bits-1.0',commit:commits.restaurant},medieval:{page:'https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0',commit:commits.medieval},kenney:{original:'https://kenney.nl/assets',mirror:'https://github.com/Hidencod/tge-assets',commit:commits.kenney}}};
for(const [name,entries] of [['kitchen',restaurantEntries],['world',worldEntries],['food',foodEntries],['furniture',furnitureEntries],['nature',natureEntries],['customers',customers],['special',special]]){
 const target=new Document();const scene=target.createScene('Authored model templates');target.getRoot().setDefaultScene(scene);
 for(const e of entries){
  const source=await io.read(path.join(ROOT,e.file));if(e.idlePose)poseIdle(source);if(e.cucumberMode)separateCucumber(source,e.cucumberMode);if(e.bananaMode)prepareBanana(source,e.bananaMode);if(e.cutFood)sourceCut(source,e.cutFood,e.cutForm);if(e.key==='tools/grater')await source.transform(flatten(),join({keepNamed:false,keepMeshes:false}));
  const sourceScene=source.getRoot().getDefaultScene()??source.getRoot().listScenes()[0];const bounds=getBounds(sourceScene),size=bounds.max.map((v,i)=>v-bounds.min[i]);
  const triangles=source.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((sum,p)=>sum+Math.floor((p.getIndices()?.getCount()??p.getAttribute('POSITION')?.getCount()??0)/3),0),0);
  const map=mergeDocuments(target,source),copied=map.get(sourceScene),wrapper=target.createNode(modelId(e.key));
  for(const child of [...copied.listChildren()])wrapper.addChild(child);scene.addChild(wrapper);
  for(const other of target.getRoot().listScenes())if(other!==scene)other.dispose();
  const inputs=await inputsFor(e.file);
  manifest.models[e.key]={atlas:name+'.glb',node:modelId(e.key),min:bounds.min,max:bounds.max,size,pack:e.pack,source:e.source,sha256:inputs[0].sha256,triangles,inputs,derivation:e.cutFood?'Source mesh clipped to '+e.cutForm+' piece; closed cut faces follow source-edge intersections, original outer materials plus named flesh surface.':e.key==='tools/grater'?'Static authored components baked/joined by material to reduce draw calls; geometric detail and PBR retained.':e.idlePose?'Static supplied idle pose; original skin retained, unused motion clips omitted.':e.cucumberMode?'Separated original whole/slice connected components; original cut surfaces and textures preserved.':e.bananaMode==='sliced'?'Central cross-section clipped from authored banana, cream flesh material and closed cap faces derived from cut-edge polygon.':e.bananaMode==='peeled'?'Authored banana mesh retained and recolored to represent peeled flesh; no separately modeled peel flaps.':'Merged without geometric simplification; original hierarchy/materials preserved.'};
 }
 await target.transform(dedup(),prune({keepLeaves:true}),unpartition());const bytes=await io.writeBinary(target);await writeFile(OUT+'/'+name+'.glb.tmp',bytes);await rename(OUT+'/'+name+'.glb.tmp',OUT+'/'+name+'.glb');manifest.atlases.push({file:name+'.glb',bytes:bytes.length,sha256:sha(bytes),models:entries.length});console.log(name,entries.length,bytes.length);
}
const aliases={'customer/casual-male':'customer/character-male-a','customer/casual-female':'customer/character-female-a','tools/blender':'furniture/kitchenblender','tools/toaster':'furniture/toaster','food/potato':'kitchen/food_ingredient_potato','food/carrot-chopped':'kitchen/food_ingredient_carrot_chopped','food/carrot-pieces':'kitchen/food_ingredient_carrot_pieces','food/potato-chopped':'kitchen/food_ingredient_potato_chopped','food/apple-sliced':'food/apple-half','food/pear-sliced':'food/pear-half','food/mushroom-sliced':'food/mushroom-half','food/pepper-sliced':'food/paprika-slice','food/pepper':'food/paprika','food/cucumber-sliced':'food/cucumber-slices','food/tomato-sliced':'food/tomato-slice','food/carrot-sliced':'kitchen/food_ingredient_carrot_pieces','food/potato-sliced':'kitchen/food_ingredient_potato_chopped'};
for(const [key,source] of Object.entries(aliases)){if(!manifest.models[source])throw Error('Alias source missing '+source);manifest.models[key]={...manifest.models[source],aliasOf:source}}
await copyFile(ROOT+'/work/vendor/restaurant/LICENSE.txt',OUT+'/licenses/KayKit-Restaurant.txt');await copyFile(ROOT+'/work/vendor/medieval/LICENSE.txt',OUT+'/licenses/KayKit-Medieval.txt');await copyFile(ROOT+'/work/vendor/tge/LICENSE',OUT+'/licenses/Kenney-mirror.txt');await copyFile(ROOT+'/work/vendor/special/cucumber-LICENSE.txt',OUT+'/licenses/Grab3D-Cucumber.txt');
await writeFile(OUT+'/licenses/Innerscene-Four-Grate.txt',`Four Grate - Kitchen Tool
Publisher/source: Innerscene - original model
Source page: https://www.innerscene.com/tools/library/3d-parts/four-grate-kitchen-tool-22c54bea
Download: https://www.innerscene.com/api/library/four-grate-kitchen-tool-22c54bea/download
Observed: 28 October 2026

The publisher dedicates this original model to the public domain under CC0 1.0:
https://creativecommons.org/publicdomain/zero/1.0/

Source statement: "Public domain (CC0). Free to use, modify and redistribute for any purpose, including commercially, with no credit required."

The game build bakes/joins static components by material while retaining geometric detail and PBR textures. Source and final SHA-256 records are in ../manifest.json.
`);
await writeFile(OUT+'/manifest.json.tmp',JSON.stringify(manifest,null,2)+'\n');await rename(OUT+'/manifest.json.tmp',OUT+'/manifest.json');
console.log('TOTAL',manifest.atlases.reduce((n,a)=>n+a.bytes,0),'bytes;',Object.keys(manifest.models).length,'keys');
await validate(manifest);
// Verify the actual written binaries rather than trusting the pre-export documents.
async function validate(manifest){
const validation={verified:0,totalAtlasBytes:0,atlases:[],variants:{}};
const documents=new Map();
for(const atlas of manifest.atlases){
 const bytes=await readFile(OUT+'/'+atlas.file);
 if(bytes.length!==atlas.bytes||sha(bytes)!==atlas.sha256)throw Error('Atlas hash mismatch: '+atlas.file);
 const document=await io.readBinary(bytes),root=document.getRoot();documents.set(atlas.file,document);
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8'));
 validation.atlases.push({file:atlas.file,bytes:bytes.length,meshes:root.listMeshes().length,materials:root.listMaterials().length,textures:root.listTextures().length,skins:root.listSkins().length,required:json.extensionsRequired??[]});
 validation.totalAtlasBytes+=bytes.length;
}
for(const [key,metadata]of Object.entries(manifest.models)){
 const matches=documents.get(metadata.atlas).getRoot().listNodes().filter(node=>node.getName()===metadata.node);
 if(matches.length!==1)throw Error('Missing or duplicate template: '+key);
 const bounds=getBounds(matches[0]),size=bounds.max.map((value,i)=>value-bounds.min[i]);
 if(![...bounds.min,...bounds.max].every(Number.isFinite)||size.filter(value=>value>0).length<2)throw Error('Invalid or empty bounds: '+key);
 if(size.some((value,i)=>Math.abs(value-metadata.size[i])>0.00001))throw Error('Round-trip bounds changed: '+key);
 validation.verified++;
 if(/-(peeled|sliced|slices|diced|grated)$/.test(key)||key==='world/boat')validation.variants[key]={size,triangles:metadata.triangles};
}
await mkdir(ROOT+'/docs/art-evidence',{recursive:true});
await writeFile(ROOT+'/docs/art-evidence/source-model-validation.json',JSON.stringify(validation,null,2)+'\n');
console.log('Validated',validation.verified,'model keys from written GLBs.');
}
