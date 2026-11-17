import * as T from 'three';
import {TieRoute} from './tie-path.js?v=20261111-94';

// The strip passes behind the native C groove; its front branch bears on the
// cable rather than forming a tall loop above the lock. Coordinates remain in
// the original CAD frame. Only this source-specific strip uses this route.
export class MotorYTieRoute extends TieRoute {
 make(height,lift=0){
  const d=this.def,s=d.span,left=-s-(d.headSetback||0),head=d.headHeight;
  this.height=height;this.left=-s;this.points=[];this.rootAxis=this.V.clone();
  const add=(u,v)=>this.points.push(this.point(u,v));
  const line=(u,v)=>{const a=this.points.at(-1),b=this.point(u,v),n=Math.max(1,Math.ceil(a.distanceTo(b)/.25));for(let i=1;i<=n;i++)this.points.push(a.clone().lerp(b,i/n));};
  const curve=(a,b,end,n=64)=>{const c=new T.CubicBezierCurve3(this.points.at(-1),this.point(...a),this.point(...b),this.point(...end));for(let i=1;i<=n;i++)this.points.push(c.getPoint(i/n));};
  add(left,head);
  curve([left,head-1.2],[-s,1.2],[-s,0],32);
  for(let i=1;i<=96;i++){const a=Math.PI*i/96;add(-s*Math.cos(a),-d.depth*Math.sin(a));}
  const exit=this.points.length-1,lead=Math.min(.8,height*.2);line(s,lead);
  const handle=Math.max(2.2,Math.sqrt(Math.max(0,height-head-1)*(s-left))*.65);
  curve([s,Math.max(lead,height*.65)],[handle,height],[0,height]);
  curve([-handle,height],[left+4,head+1],[left+2.5,head+1]);
  line(left,head+1);
  if(lift)for(let i=exit+1;i<this.points.length;i++)this.points[i].addScaledVector(this.W,lift*((i-exit)/(this.points.length-1-exit))**2*(3-2*(i-exit)/(this.points.length-1-exit)));
  this.lengths=[0];for(let i=1;i<this.points.length;i++)this.lengths.push(this.lengths.at(-1)+this.points[i].distanceTo(this.points[i-1]));
  this.loopLength=this.lengths.at(-1);this.exitLength=this.lengths[exit];this.head=this.points[0];this.entry=this.points.at(-1);this.tailPoints=null;return this;
 }
 guide(target){const r=new MotorYTieRoute(this.def);r.make(r.state(target).height);
  if(target===5){const points=[r.at(r.loopLength+5.5),r.at(r.loopLength+2.5)];points.targetIndex=1;return points;}
  return r.points.filter((p,i)=>i%3===0||i===r.points.length-1).map(p=>p.clone());
 }
}
