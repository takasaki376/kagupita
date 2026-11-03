import { openDB } from 'idb';
import type { Calibration, Furniture } from './geometry';
export type DrawingArea = { x: number; y: number; width: number; height: number };
export type PageData = { points: Calibration[]; calibrated: boolean; furniture: Furniture[]; drawingArea?: DrawingArea };
export type Plan = { id: string; name: string; filename: string; pdf: ArrayBuffer; page: number; pages: Record<number, PageData>; updated: number };
// Keep the database name stable across deployments. Future upgrades must preserve stores.
const database = () => openDB('kagupita',1,{upgrade(db){if(!db.objectStoreNames.contains('plans'))db.createObjectStore('plans',{keyPath:'id'});if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings');}});
let protection:Promise<boolean>|undefined;
export function protectStorage(retry=false):Promise<boolean>{if(!protection||retry)protection=(async()=>{try{if(!navigator.storage?.persist)return false;if(await navigator.storage.persisted())return true;return await navigator.storage.persist();}catch{return false;}})();return protection;}
export async function listPlans(): Promise<Plan[]> { const db=await database();return (await db.getAll('plans')).sort((a,b)=>b.updated-a.updated); }
export async function savePlan(plan: Plan){const db=await database();const tx=db.transaction(['plans','settings'],'readwrite');await tx.objectStore('plans').put(plan);await tx.objectStore('settings').put(plan.id,'active');await tx.done;}
export async function activeId():Promise<string|undefined>{return (await database()).get('settings','active');}
