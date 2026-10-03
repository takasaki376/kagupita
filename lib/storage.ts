import { openDB } from 'idb';
import type { Calibration, Furniture } from './geometry';
export type DrawingArea = { x: number; y: number; width: number; height: number };
export type PageData = { points: Calibration[]; calibrated: boolean; furniture: Furniture[]; drawingArea?: DrawingArea };
export type Plan = { id: string; name: string; filename: string; pdf: ArrayBuffer; page: number; pages: Record<number, PageData>; updated: number };
const database = () => openDB('kagupita',1,{upgrade(db){db.createObjectStore('plans',{keyPath:'id'});db.createObjectStore('settings');}});
export async function listPlans(): Promise<Plan[]> { const db=await database();return (await db.getAll('plans')).sort((a,b)=>b.updated-a.updated); }
export async function savePlan(plan: Plan){const db=await database();const tx=db.transaction(['plans','settings'],'readwrite');await tx.objectStore('plans').put(plan);await tx.objectStore('settings').put(plan.id,'active');await tx.done;}
export async function activeId():Promise<string|undefined>{return (await database()).get('settings','active');}
