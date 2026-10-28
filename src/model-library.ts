import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';

export type ModelBounds={min:[number,number,number];max:[number,number,number];size:[number,number,number]};
export type ModelMetadata=ModelBounds&{atlas:string;node:string;pack:string;source:string;sha256:string;triangles:number};
export type ArtManifest={version:number;atlases:{file:string;bytes:number;sha256:string}[];models:Record<string,ModelMetadata>};

/** Authored templates: floor-centered instances, private geometry, shared immutable materials/maps. */
export class ModelLibrary {
 ready=false;
 names:string[]=[];
 manifest?:ArtManifest;
 error='';
 private templates=new Map<string,T.Group>();
 private pending?:Promise<void>;

 /** Accepts the application base URL (e.g. './') or its explicit art/ directory. */
 async load(baseUrl:string=import.meta.env.BASE_URL):Promise<void>{
  if(this.ready)return;
  if(this.pending)return this.pending;
  const base=new URL(baseUrl,document.baseURI);
  const directory=/\/art\/$/.test(base.pathname)?base:new URL('art/',base);
  this.pending=this.loadFrom(directory).catch(error=>{this.error=String(error);this.pending=undefined;throw error});
  return this.pending;
 }
 private async loadFrom(directory:URL){
  const response=await fetch(new URL('manifest.json',directory));
  if(!response.ok)throw new Error(`Art manifest: HTTP ${response.status}`);
  const manifest=await response.json() as ArtManifest;
  const loader=new GLTFLoader();
  const loaded=await Promise.all(manifest.atlases.map(async atlas=>[atlas.file,(await loader.loadAsync(new URL(atlas.file,directory).href)).scene] as const));
  const scenes=new Map(loaded);
  for(const [name,metadata] of Object.entries(manifest.models)){
   const source=scenes.get(metadata.atlas)?.getObjectByName(metadata.node);
   if(!source)throw new Error(`Authored template missing: ${name}`);
   const template=new T.Group();
   // Source transforms and mesh detail remain intact. Normalize only the placement origin.
   template.add(cloneSkeleton(source));
   template.position.set(-(metadata.min[0]+metadata.max[0])/2,-metadata.min[1],-(metadata.min[2]+metadata.max[2])/2);
   const wrapper=new T.Group();wrapper.name=name;wrapper.add(template);
   this.templates.set(name,wrapper);
  }
  this.manifest=manifest;this.names=[...this.templates.keys()];this.ready=true;
 }
 create(name:string):T.Group|undefined{
  const source=this.templates.get(name);if(!source)return undefined;
  const instance=cloneSkeleton(source) as T.Group;
  instance.traverse(object=>{if(object instanceof T.Mesh){object.geometry=object.geometry.clone();object.castShadow=true;object.receiveShadow=true;object.userData.authoredModel=name;object.userData.ownedGeometry=true}});
  instance.userData.authoredModel=name;
  return instance;
 }
 /** Original bounds remain in the manifest; size is unchanged by floor-centering. */
 bounds(name:string):ModelBounds|undefined{
  const m=this.manifest?.models[name];if(!m)return undefined;
  return {min:[-m.size[0]/2,0,-m.size[2]/2],max:[m.size[0]/2,m.size[1],m.size[2]/2],size:[...m.size]};
 }
 metadata(name:string):ModelMetadata|undefined{return this.manifest?.models[name]}
 has(name:string){return this.templates.has(name)}
}
export const modelLibrary=new ModelLibrary();
