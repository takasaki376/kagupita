import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transform, resizeFurniture, type Furniture } from '../lib/geometry';
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('2点を通り、回転・縮尺・平行移動を含む変換と逆変換が一致',()=>{
 const t=transform([{pdf:{x:10,y:20},real:{x:300,y:400}},{pdf:{x:110,y:20},real:{x:300,y:2400}}]);
 close(t.scale,20);close(t.angle,90);
 for(const p of [{x:10,y:20},{x:110,y:20},{x:-20,y:700}]){const back=t.toPdf(t.toReal(p));close(back.x,p.x);close(back.y,p.y);}
 const end=t.toReal({x:110,y:20});close(end.x,300);close(end.y,2400);
});
test('既知寸法の家具は校正縮尺から固定ページ寸法になり、ズームは実寸を変更しない',()=>{
 const t=transform([{pdf:{x:0,y:0},real:{x:0,y:0}},{pdf:{x:100,y:0},real:{x:5000,y:0}}]);
 const width=1000/t.scale;close(width,20);
 const center={x:2000,y:3000};for(const zoom of [.2,1,4]){const p=t.toPdf(center),pan={x:25,y:-130};const screen={x:p.x*zoom+pan.x,y:p.y*zoom+pan.y};const restored=t.toReal({x:(screen.x-pan.x)/zoom,y:(screen.y-pan.y)/zoom});close(restored.x,center.x);close(restored.y,center.y);close(width*zoom/zoom,20);}
});
test('同一点・同じ実寸・未設定・非数値はエラー',()=>{
 assert.throws(()=>transform([]));
 assert.throws(()=>transform([{pdf:{x:0,y:0},real:{x:0,y:0}},{pdf:{x:0,y:0},real:{x:1,y:1}}]),/PDF上/);
 assert.throws(()=>transform([{pdf:{x:0,y:0},real:{x:0,y:0}},{pdf:{x:1,y:1},real:{x:0,y:0}}]),/実寸座標が同じ/);
 assert.throws(()=>transform([{pdf:{x:0,y:0},real:{x:NaN,y:0}},{pdf:{x:1,y:1},real:{x:1,y:1}}]),/有効な数値/);
});
test('回転した家具でも対角を固定して四隅からサイズ変更できる',()=>{
 for(const angle of [0,37,90,180])for(const sx of [-1,1] as const)for(const sy of [-1,1] as const){
  const f:Furniture={id:'a',name:'机',shape:'rect',color:'#ffffff',x:200,y:400,width:900,depth:600,angle};
  const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  const result={...f,...resizeFurniture(f,{x:sx,y:sy},{x:c*sx*200-s*sy*100,y:s*sx*200+c*sy*100})};
  close(result.width,1100);close(result.depth,700);
  const opposite=(v:Furniture)=>({x:v.x-c*sx*v.width/2+s*sy*v.depth/2,y:v.y-s*sx*v.width/2-c*sy*v.depth/2});
  close(opposite(f).x,opposite(result).x);close(opposite(f).y,opposite(result).y);close(result.angle,angle);
 }
});
test('円形は真円を維持し、反転やゼロ寸法を防ぐ',()=>{
 const f:Furniture={id:'a',name:'丸机',shape:'circle',color:'#ffffff',x:0,y:0,width:600,depth:100,angle:0};
 const r=resizeFurniture(f,{x:1,y:1},{x:200,y:100});close(r.width!,750);close(r.depth!,750);close(r.x!,75);close(r.y!,75);
 const min=resizeFurniture(f,{x:1,y:1},{x:-2000,y:-2000});close(min.width!,1);close(min.depth!,1);
});
