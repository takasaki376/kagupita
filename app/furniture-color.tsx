'use client';
import { useEffect, useRef, useState } from 'react';

const colors = [
 ['ホワイト','#ffffff'],['ライトグレー','#d9dde0'],['グレー','#858b90'],['ブラック','#303438'],
 ['アイボリー','#f2eadb'],['ベージュ','#ceb896'],['ブラウン','#916747'],['ダークブラウン','#574036'],
 ['ピンク','#d994a5'],['レッド','#c85b55'],['オレンジ','#dd9856'],['イエロー','#e3c76b'],
 ['ライトグリーン','#b3c49c'],['グリーン','#739d92'],['ブルー','#719bb9'],['ネイビー','#435b7b'],
];
const hex = (r:number,g:number,b:number) => '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');

export default function FurnitureColor({color,onChange}:{color:string;onChange:(color:string)=>void}){
 const imageCanvas=useRef<HTMLCanvasElement>(null),upload=useRef<HTMLInputElement>(null),camera=useRef<HTMLInputElement>(null),sequence=useRef(0);
 const [photo,setPhoto]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),[suggested,setSuggested]=useState<string[]>([]);
 useEffect(()=>()=>{sequence.current++;},[]);
 async function readImage(file:File){
  const seq=++sequence.current;setLoading(true);setError('');setPhoto(false);setSuggested([]);
  const url=URL.createObjectURL(file);
  try{
   const image=new Image();image.src=url;await image.decode();if(seq!==sequence.current)return;
   const c=imageCanvas.current!;const scale=Math.min(1,1000/Math.max(image.naturalWidth,image.naturalHeight));c.width=Math.max(1,Math.round(image.naturalWidth*scale));c.height=Math.max(1,Math.round(image.naturalHeight*scale));
   const ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(image,0,0,c.width,c.height);
   const pixels=ctx.getImageData(0,0,c.width,c.height).data;
   const buckets=new Map<string,{count:number;r:number;g:number;b:number}>();
   for(let i=0;i<pixels.length;i+=16){const r=pixels[i],g=pixels[i+1],b=pixels[i+2],key=[r,g,b].map(v=>Math.floor(v/32)).join(',');const bucket=buckets.get(key)??{count:0,r:0,g:0,b:0};bucket.count++;bucket.r+=r;bucket.g+=g;bucket.b+=b;buckets.set(key,bucket);}
   setSuggested([...buckets.values()].sort((a,b)=>b.count-a.count).slice(0,6).map(v=>hex(v.r/v.count,v.g/v.count,v.b/v.count)));setPhoto(true);
  }catch{if(seq===sequence.current)setError('画像を読み込めませんでした。JPEG・PNG・WebPなどの画像を選んでください。');}
  finally{URL.revokeObjectURL(url);if(seq===sequence.current)setLoading(false);}
 }
 function pick(e:React.PointerEvent<HTMLCanvasElement>){
  if(!photo||loading)return;e.preventDefault();const c=e.currentTarget,r=c.getBoundingClientRect();const x=Math.min(c.width-1,Math.max(0,Math.floor((e.clientX-r.left)*c.width/r.width))),y=Math.min(c.height-1,Math.max(0,Math.floor((e.clientY-r.top)*c.height/r.height)));
  const left=Math.max(0,x-2),top=Math.max(0,y-2),pixels=c.getContext('2d')!.getImageData(left,top,Math.min(5,c.width-left),Math.min(5,c.height-top)).data;
  let red=0,green=0,blue=0;for(let i=0;i<pixels.length;i+=4){red+=pixels[i];green+=pixels[i+1];blue+=pixels[i+2];}const n=pixels.length/4;onChange(hex(red/n,green/n,blue/n));
 }
 function clear(){sequence.current++;setPhoto(false);setLoading(false);setSuggested([]);setError('');const c=imageCanvas.current;if(c){c.width=1;c.height=1;}}
 function input(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(file)void readImage(file);e.target.value='';}
 return <section className="furniture-color" aria-label="家具の色"><h3>色 <small>{color.toUpperCase()}</small></h3>
  <div className="color-palette" aria-label="標準の16色">{colors.map(([name,value])=><button key={value} type="button" title={name} aria-label={name} aria-pressed={color.toLowerCase()===value} style={{background:value}} onClick={()=>onChange(value)}>{color.toLowerCase()===value?'✓':''}</button>)}</div>
  <label>自由に色を指定<input className="color" type="color" value={color} onChange={e=>onChange(e.target.value)}/></label>
  <details className="photo-color"><summary>写真から色を取り込む</summary><div className="photo-actions"><button type="button" disabled={loading} onClick={()=>camera.current?.click()}>撮影</button><button type="button" disabled={loading} onClick={()=>upload.current?.click()}>画像を選択</button></div>
   <input ref={camera} hidden aria-label="家具を撮影" type="file" accept="image/*" capture="environment" onChange={input}/><input ref={upload} hidden aria-label="家具の画像" type="file" accept="image/*" onChange={input}/>
   {loading&&<p role="status">画像を読み込んでいます…</p>}{error&&<p role="alert" className="photo-error">{error}</p>}
   <canvas ref={imageCanvas} className="photo-preview" hidden={!photo} aria-label="写真の色を選ぶ" onPointerDown={pick}/>
   {photo&&<><p>家具の部分をタップすると、その場所の色を反映します。</p><div className="photo-swatches" aria-label="画像から抽出した色">{suggested.map((v,i)=><button type="button" key={i} style={{background:v}} aria-label={`抽出色 ${v}`} title={v} onClick={()=>onChange(v)}/>)}</div><button type="button" className="full" onClick={clear}>画像を閉じる</button></>}
   <p>画像は保存・送信しません。撮影機能はスマホの対応ブラウザで利用できます。照明や背景によって抽出色が変わるため、家具の部分を選んでください。</p>
  </details>
 </section>;
}
