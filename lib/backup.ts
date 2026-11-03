import type { Plan, PageData } from './storage';
import { transform } from './geometry';

export async function exportBackup(plan:Plan):Promise<Blob>{
 const pdf=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve((reader.result as string).split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(new Blob([plan.pdf],{type:'application/pdf'}));});
 return new Blob([JSON.stringify({format:'kagupita-backup',version:1,plan:{...plan,pdf}})],{type:'application/json'});
}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const point=(v:unknown)=>!!v&&typeof v==='object'&&finite((v as {x:unknown}).x)&&finite((v as {y:unknown}).y);
export async function importBackup(file:File):Promise<Plan>{
 try{
  const payload=JSON.parse(await file.text());
  if(payload.format!=='kagupita-backup'||payload.version!==1)throw Error();
  const p=payload.plan;
  if(!p||typeof p.name!=='string'||typeof p.filename!=='string'||!Number.isInteger(p.page)||p.page<1||!p.pages||typeof p.pages!=='object'||Array.isArray(p.pages)||typeof p.pdf!=='string'||!p.pdf.length)throw Error();
  for(const [page,value] of Object.entries(p.pages)){
   if(!/^\d+$/.test(page)||Number(page)<1)throw Error();
   const d=value as PageData;if(!d||!Array.isArray(d.points)||d.points.length>2||typeof d.calibrated!=='boolean'||!Array.isArray(d.furniture))throw Error();
   for(const c of d.points)if(c!==null&&(!c||!point(c.pdf)||!c.real||![c.real.x,c.real.y].every(v=>v===null||finite(v))))throw Error();
   if(d.calibrated)transform(d.points);
   d.points.forEach((c,i)=>{if(c===null)delete d.points[i];else{if(c.real.x===null)c.real.x=NaN;if(c.real.y===null)c.real.y=NaN;}});
   const a=d.drawingArea;if(a&&(!point(a)||!finite(a.width)||!finite(a.height)||a.width<=0||a.height<=0||a.x<0||a.y<0))throw Error();
   const ids=new Set();for(const f of d.furniture){if(!f||typeof f.id!=='string'||ids.has(f.id)||typeof f.name!=='string'||!['rect','circle'].includes(f.shape)||!/^#[0-9a-f]{6}$/i.test(f.color)||![f.x,f.y,f.width,f.depth,f.angle].every(finite)||f.width<=0||f.depth<=0)throw Error();ids.add(f.id);}
  }
  const bytes=Uint8Array.from(atob(p.pdf),c=>c.charCodeAt(0));if(!new TextDecoder().decode(bytes.subarray(0,1024)).includes('%PDF-'))throw Error();
  // Restore as a new plan; importing can never replace an existing plan.
  return {...p,id:crypto.randomUUID(),name:p.name+'（復元）',updated:Date.now(),pdf:bytes.buffer};
 }catch{throw new Error('家具ピタのバックアップを読み込めませんでした。対応するバックアップファイルを選択してください。');}
}
