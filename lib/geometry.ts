export type Point = { x: number; y: number };
export type Calibration = { pdf: Point; real: Point };
export type Furniture = { id: string; name: string; shape: 'rect' | 'circle'; color: string; x: number; y: number; width: number; depth: number; angle: number };
export function transform(points: Calibration[]) {
  if (points.length !== 2) throw new Error('校正点を2つ指定してください。');
  const [p, q] = points;
  const dx = q.pdf.x-p.pdf.x, dy = q.pdf.y-p.pdf.y;
  const rx = q.real.x-p.real.x, ry = q.real.y-p.real.y;
  if (![dx,dy,rx,ry,p.real.x,p.real.y].every(Number.isFinite)) throw new Error('実寸座標に有効な数値を入力してください。');
  const d = dx*dx+dy*dy;
  if (d < 1e-10) throw new Error('PDF上の2点が同じ位置です。離れた点を指定してください。');
  if (rx*rx+ry*ry < 1e-10) throw new Error('2点の実寸座標が同じです。異なる座標を入力してください。');
  const a = (dx*rx+dy*ry)/d, b = (dx*ry-dy*rx)/d;
  return { scale: Math.hypot(a,b), angle: Math.atan2(b,a)*180/Math.PI,
    toReal: (v: Point): Point => ({x:p.real.x+a*(v.x-p.pdf.x)-b*(v.y-p.pdf.y),y:p.real.y+b*(v.x-p.pdf.x)+a*(v.y-p.pdf.y)}),
    toPdf: (v: Point): Point => { const x=v.x-p.real.x,y=v.y-p.real.y,s=a*a+b*b; return {x:p.pdf.x+(a*x+b*y)/s,y:p.pdf.y+(-b*x+a*y)/s}; }
  };
}
