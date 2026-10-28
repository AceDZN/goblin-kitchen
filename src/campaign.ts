export type LevelResult={shift:number;unaided:boolean;guided:boolean;mistakes:number;seconds:number;stars:number};
export type CampaignProgress={version:1;unlocked:number;lastLevel:number;completed:Record<string,{stars:number;seconds:number;mistakes:number;unaided:boolean}>};
export const newProgress=():CampaignProgress=>({version:1,unlocked:1,lastLevel:1,completed:{}});
export function readProgress(raw:string|null,count:number):CampaignProgress{
 const p=newProgress();try{const value=JSON.parse(raw??'null');if(!value||value.version!==1)return p;
 for(const [id,v] of Object.entries(value.completed??{})){const n=Number(id),r=v as CampaignProgress['completed'][string];if(Number.isInteger(n)&&n>=1&&n<=count&&r&&Number.isFinite(r.stars)&&Number.isFinite(r.seconds)&&Number.isFinite(r.mistakes))p.completed[n]={stars:Math.max(1,Math.min(3,Math.round(r.stars))),seconds:Math.max(0,r.seconds),mistakes:Math.max(0,r.mistakes),unaided:r.unaided===true};}
 p.unlocked=Math.max(1,Math.min(count,Number.isInteger(value.unlocked)?value.unlocked:1));
 p.lastLevel=Math.max(1,Math.min(p.unlocked,Number.isInteger(value.lastLevel)?value.lastLevel:1));
 }catch{}return p;
}
export function completeLevel(p:CampaignProgress,r:LevelResult,count:number):CampaignProgress{
 if(!Number.isInteger(r.shift)||r.shift<1||r.shift>count)return p;
 const old=p.completed[r.shift];const better=!old||r.stars>old.stars||r.stars===old.stars&&r.seconds<old.seconds;
 return {...p,unlocked:Math.max(p.unlocked,Math.min(count,r.shift+1)),lastLevel:Math.min(count,r.shift+1),completed:{...p.completed,[r.shift]:better?{stars:r.stars,seconds:r.seconds,mistakes:r.mistakes,unaided:r.unaided}:old}};
}
export const totalStars=(p:CampaignProgress)=>Object.values(p.completed).reduce((n,r)=>n+r.stars,0);
