'use client';
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DrawingArea, PageData } from '../lib/storage';

function Thumbnail({doc,page,area}:{doc:PDFDocumentProxy;page:number;area?:DrawingArea}){
 const canvas=useRef<HTMLCanvasElement>(null),host=useRef<HTMLDivElement>(null);
 const [visible,setVisible]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'150px'});observer.observe(host.current!);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!visible)return;let cancelled=false;let task:ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']>|undefined;setError(false);
  (async()=>{try{const pdfPage=await doc.getPage(page);if(cancelled)return;const full=pdfPage.getViewport({scale:1});const crop=area??{x:0,y:0,width:full.width,height:full.height};const scale=Math.min(400/crop.width,240/crop.height);const c=canvas.current!;c.width=Math.max(1,Math.round(crop.width*scale));c.height=Math.max(1,Math.round(crop.height*scale));const viewport=pdfPage.getViewport({scale,offsetX:-crop.x*scale,offsetY:-crop.y*scale});task=pdfPage.render({canvas:c,viewport});await task.promise;}catch{if(!cancelled)setError(true);}})();return()=>{cancelled=true;task?.cancel();};
 },[doc,page,area,visible]);
 return <div ref={host} className="thumbnail-image">{error?<span>プレビューを表示できません</span>:<canvas ref={canvas} aria-label={`${page}ページの図面プレビュー`}/>}</div>;
}
export default function PageThumbnails({doc,pages,current,onSelect}:{doc:PDFDocumentProxy;pages:Record<number,PageData>;current:number;onSelect:(page:number)=>void}){
 return <nav className="page-thumbnails" aria-label="ページ一覧"><h3>ページ一覧 <small>{doc.numPages} ページ</small></h3>{Array.from({length:doc.numPages},(_,i)=>i+1).map(page=><button type="button" key={page} className={page===current?'page-thumbnail active':'page-thumbnail'} aria-label={`${page}ページを表示`} aria-current={page===current?'page':undefined} onClick={()=>onSelect(page)}><div className="thumbnail-caption"><strong>{page}</strong><span>{pages[page]?.calibrated?'校正済み':'未校正'}{pages[page]?.drawingArea?' · 範囲指定済み':''}</span></div><Thumbnail doc={doc} page={page} area={pages[page]?.drawingArea}/></button>)}</nav>;
}
