'use client';
import { useRef, useState } from 'react';
import type { Plan } from '../lib/storage';
import { protectStorage } from '../lib/storage';
import { exportBackup, importBackup } from '../lib/backup';

export default function BackupControls({plan,onRestore}:{plan:Plan|null;onRestore:(plan:Plan)=>Promise<void>}){
 const file=useRef<HTMLInputElement>(null);const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 async function backup(){if(!plan)return;setBusy(true);setError('');try{const blob=await exportBackup(plan),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${plan.name.replace(/[<>:"/\\|?*]/g,'_')||'配置案'}.kagupita.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);setMessage('バックアップをダウンロードしました。PDF・校正・家具を含みます。');}catch{setError('バックアップを作成できませんでした。');}finally{setBusy(false);}}
 async function restore(f:File){setBusy(true);setError('');try{await onRestore(await importBackup(f));setMessage('新しい配置案として復元しました。既存の配置案は保持しています。');}catch(e){setError(e instanceof Error?e.message:'復元できませんでした。');}finally{setBusy(false);}}
 return <details className="section settings-accordion backup-controls"><summary>データの保護・バックアップ</summary><p>保存先はこの端末・ブラウザのURLごとです。別URLへの移動やブラウザ変更にはバックアップをご利用ください。</p><button className="full" disabled={!plan||busy} onClick={()=>void backup()}>配置案をバックアップ</button><button className="full" disabled={busy} onClick={()=>file.current?.click()}>バックアップから復元</button><input hidden ref={file} type="file" accept=".json,application/json" aria-label="配置案のバックアップ" onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void restore(f);}}/><button className="full" disabled={busy} onClick={async()=>{setError('');setMessage(await protectStorage(true)?'ブラウザの永続保存が有効です。':'このブラウザでは永続保存が許可されていません。バックアップを保存してください。');}}>永続保存を有効にする</button>{message&&<p role="status">{message}</p>}{error&&<p role="alert" className="photo-error">{error}</p>}<p>永続保存が有効でも、ブラウザのデータ削除からは保護できません。</p></details>;
}

