import * as T from 'three';

// Official service preparation: the head stays outside the board edge and the
// unlatched free strip rests over the board. Both passages keep their CAD
// datums; the strip does not form a closed loop until it is tightened.
export class XBuddyPreparedTieRoute {
 constructor(def){
  this.def=def;this.length=def.length||100;
  const origin=new T.Vector3(...def.p),U=new T.Vector3(...def.u),V=new T.Vector3(...def.v),s=def.span,r=def.bend||.85,depth=def.depth;
  const point=(u,v)=>origin.clone().addScaledVector(U,u).addScaledVector(V,v);
  this.points=[point(s-1.4,14)];
  const line=(u,v)=>{const a=this.points.at(-1),b=point(u,v),n=Math.ceil(a.distanceTo(b)/.4);for(let i=1;i<=n;i++)this.points.push(a.clone().lerp(b,i/n));};
  const quad=(u,v,x,y)=>{const c=new T.QuadraticBezierCurve3(this.points.at(-1),point(u,v),point(x,y));for(let i=1;i<=24;i++)this.points.push(c.getPoint(i/24));};
  line(s-1.4,7);quad(s-1.4,4,s,3);line(s,-depth+r);quad(s,-depth,s-r,-depth);
  line(-s+r,-depth);quad(-s,-depth,-s,-depth+r);line(-s,2-r);quad(-s,2,-s-r,2);
  this.passageEnd=this.points.length-1;
  // A shallow, smooth resting bow, rather than a right-angle turn toward
  // the viewer. This is an illustrative nylon bend, not supplier CAD.
  const restingHeight=def.id==='box5'?7:-5.5,bow=new T.CubicBezierCurve3(this.points.at(-1),point(-s-4,2),point(-s-4,restingHeight),point(-s-20,restingHeight));
  for(let i=1;i<=192;i++)this.points.push(bow.getPoint(i/192));
  line(-s-100,restingHeight);
  this.lengths=[0];for(let i=1;i<this.points.length;i++)this.lengths.push(this.lengths.at(-1)+this.points[i].distanceTo(this.points[i-1]));
  this.loopLength=this.lengths[this.passageEnd];this.height=2;
 }
 pose(from,to,t){const blend=t*t*(3-2*t),start=from===0?-this.length*(1-blend):0;return {start,length:this.length,height:this.height,closed:0,cut:false,wrapped:false,tail:Math.max(0,start+this.length-this.loopLength),phase:start<0?'thread':'prepared'};}
 at(distance,out=new T.Vector3()){
  const a=this.points,n=a.length-1;if(distance<=0)return out.copy(a[0]).addScaledVector(a[1].clone().sub(a[0]).normalize(),distance);
  if(distance>=this.lengths[n])return out.copy(a[n]).addScaledVector(a[n].clone().sub(a[n-1]).normalize(),distance-this.lengths[n]);
  let lo=0,hi=n;while(hi-lo>1){const mid=(lo+hi)>>1;if(this.lengths[mid]<distance)lo=mid;else hi=mid;}
  return out.lerpVectors(a[lo],a[hi],(distance-this.lengths[lo])/(this.lengths[hi]-this.lengths[lo]));
 }
}
