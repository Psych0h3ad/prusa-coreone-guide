import * as T from 'three';

// Sections in the band's U/V frame. The arm notch is 8 mm high and 2 mm
// deep, rather than the full arm envelope. Band centre lines clear the
// sleeve, PTFE and metal by half the textile thickness plus 0.2 mm.
export function strapProfile(id){
 if(/^arm[123]$/.test(id))return {circles:[[0,6.3,4.2],...(id==='arm1'?[]:[[6.55,6.3,2]])],rectangle:[-4.5,4.5,-2,0]};
 if(/^free[12]$/.test(id))return {circles:[[-3.5,0,4.2],[3.5,0,2]]};
}
export function createStrapSweep(curve,def){
 const origin=new T.Vector3(...def.p),U=new T.Vector3(...def.u),V=new T.Vector3(...def.v),W=new T.Vector3().crossVectors(U,V).normalize();
 let at=0,best=Infinity;
 for(let i=0;i<=2000;i++){const c=curve.getPointAt(i/2000).multiplyScalar(1000),distance=(c.x-origin.x)**2+(c.y-origin.y)**2;if(distance<best){best=distance;at=i/2000;}}
 const centre=curve.getPointAt(at).multiplyScalar(1000),length=curve.getLength()*1000,direction=curve.getTangentAt(at).dot(W)>0?1:-1,frames=[];
 for(let i=0;i<=640;i++){
  const w=-40+i*.125,s=Math.max(0,Math.min(1,at+direction*w/length)),c=curve.getPointAt(s).multiplyScalar(1000),axis=curve.getTangentAt(s).multiplyScalar(direction).normalize(),up=U.clone().addScaledVector(axis,-U.dot(axis)).normalize();
  frames.push({c,u:up,v:new T.Vector3().crossVectors(axis,up).normalize()});
 }
 const rel=new T.Vector3(),mapped=new T.Vector3(),up=new T.Vector3(),side=new T.Vector3();
 return {map(p,out=p){
  rel.copy(p).sub(origin);const w=rel.dot(W),f=Math.max(0,Math.min(640,(w+40)/.125)),i=Math.min(639,Math.floor(f)),t=f-i,a=frames[i],b=frames[i+1],u=(p.x-centre.x)*U.x+(p.y-centre.y)*U.y+(p.z-centre.z)*U.z,v=(p.x-centre.x)*V.x+(p.y-centre.y)*V.y+(p.z-centre.z)*V.z;
  mapped.copy(a.c).lerp(b.c,t).addScaledVector(up.copy(a.u).lerp(b.u,t),u).addScaledVector(side.copy(a.v).lerp(b.v,t),v);
  // The metal notch stays fixed while the textile's front follows the bundle.
  const q=def.free?1:Math.max(0,Math.min(1,rel.dot(V)/3)),blend=q*q*(3-2*q);
  // A loose band away from the bundle can lie flatter across its width.
  // Extending the cable's tight bend all the way out to that loose eye would
  // invert the offset surface and make the returning strip cross the eye.
  const bend=1/(1+Math.max(0,Math.abs(v)-10)/10)**2;
  return out.copy(p).lerp(mapped,blend*bend);
 }};
}
function hull(points){
 points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lower=[],upper=[];
 for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
 for(const p of points.slice().reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
 return lower.slice(0,-1).concat(upper.slice(0,-1));
}
export function makeStrapProfile(route,height,lift=0){
 const d=route.def,profile=d.strapProfile,margin=(d.thickness||.65)/2+.2,slack=Math.max(0,height-d.rise)*.5,points=[];
 const circle=(u,v,r)=>{for(let i=0;i<96;i++){const a=i/96*Math.PI*2;points.push([u+(r+margin)*Math.cos(a),v+(r+margin)*Math.sin(a)]);}};
 for(const c of profile.circles)circle(...c);
 if(profile.rectangle){const [l,r,b,t]=profile.rectangle;for(const u of [l,r])for(const v of [b,t])circle(u,v,0);}
 if(slack){
  // Open into the free space in front of the bundle. Keep the vertical and
  // rear extents at the cable/arm section, clear of both CoreXY flanges.
  points.push(...points.map(([u,v])=>[u,v+2*slack]));
 }
 let contour=hull(points);
 // The textile closure lies on the accessible front of the bundle.
 let start=0;for(let i=1;i<contour.length;i++)if(contour[i][1]>contour[start][1])start=i;
 contour=contour.slice(start).concat(contour.slice(0,start));contour.push(contour[0]);
 const outline=[];
 for(let i=0;i<contour.length-1;i++){
  const a=route.point(...contour[i]),b=route.point(...contour[i+1]),n=Math.max(1,Math.ceil(a.distanceTo(b)/.3));
  for(let j=0;j<n;j++)outline.push(a.clone().lerp(b,j/n));
 }
 outline.push(outline[0].clone());
 // The returning end turns OUT through the slit in the widened textile end.
 // The attached root starts at that end's edge, not in the slit itself.
 const eye=outline[0].clone().addScaledVector(route.V,1.1),root=eye.clone().addScaledVector(route.U,-1.6),entry=eye.clone().addScaledVector(route.V,1.2),originU=outline[0].clone().sub(route.origin).dot(route.U);
 const first=outline.findIndex(p=>p.clone().sub(route.origin).dot(route.U)<originU-3.5);
 let last=outline.length-2;while(last>first&&outline[last].clone().sub(route.origin).dot(route.U)<originU+3.5)last--;
 const enter=new T.CubicBezierCurve3(root,root.clone().addScaledVector(route.U,-1),outline[first].clone().addScaledVector(route.V,.7),outline[first]);
 const bend=outline[0].clone().addScaledVector(route.U,.65).addScaledVector(route.V,.1);
 const under=new T.CubicBezierCurve3(outline[last],outline[last].clone().addScaledVector(route.U,-1.2).addScaledVector(route.V,1.6),bend.clone().addScaledVector(route.U,1),bend);
 const turn=Array.from({length:17},(_,i)=>{const a=i/16*Math.PI/2;return bend.clone().addScaledVector(route.U,-.65*Math.sin(a)).addScaledVector(route.V,.65*(1-Math.cos(a)));});
 const feed=turn.at(-1),straight=Array.from({length:13},(_,i)=>feed.clone().lerp(entry,i/12));
 route.points=enter.getPoints(24).concat(outline.slice(first+1,last+1),under.getPoints(24).slice(1),turn.slice(1),straight.slice(1));
 if(lift)for(let i=1;i<route.points.length;i++){const t=Math.max(0,(i/(route.points.length-1)-.75)/.25);route.points[i].addScaledVector(route.W,lift*t*t*(3-2*t));}
 route.lengths=[0];for(let i=1;i<route.points.length;i++)route.lengths.push(route.lengths.at(-1)+route.points[i].distanceTo(route.points[i-1]));
 route.loopLength=route.lengths.at(-1);route.exitLength=route.loopLength*.75;route.head=route.points[0];route.entry=route.points.at(-1);route.tailPoints=null;route.height=height;
 // Lay the uncut excess onto the outside in successive layers. It cannot
// become a straight tail sticking out of the closed hook-and-loop band.
 const base=outline.slice(0,-1).map(p=>p.clone().addScaledVector(route.W,lift)).reverse(),outer=[];
 for(let turn=0;turn<3;turn++)for(let i=0;i<base.length;i++){
  const t=base[(i+1)%base.length].clone().sub(base[(i+base.length-1)%base.length]);
  const normal=route.U.clone().multiplyScalar(t.dot(route.V)).addScaledVector(route.V,-t.dot(route.U)).normalize();
  const front=Math.max(0,Math.min(1,(base[i].clone().sub(outline[0]).dot(route.V)+3)/3));
  outer.push(base[i].clone().addScaledVector(normal,-(.9+(turn+i/base.length)*(d.thickness+.2)+1.6*front*front*(3-2*front))));
 }
 // 6.42: leave the slit outwards, then join the outside layer tangentially.
 // Joining the very first contour point with a +U handle made the tail
 // double back over its own thickness before reversing onto that layer.
 if(['arm2','arm3','free1','free2'].includes(d.id)){
  let start=0,travel=0;while(start<base.length-2&&travel<5){travel+=outer[start].distanceTo(outer[start+1]);start++;}
  const tangent=outer[start+1].clone().sub(outer[start-1]).normalize();
  const bridge=new T.CubicBezierCurve3(route.entry,route.entry.clone().addScaledVector(route.V,1),outer[start].clone().addScaledVector(tangent,-2),outer[start]);
  route.wrapPoints=Array.from({length:49},(_,i)=>bridge.getPoint(i/48)).concat(outer.slice(start+1));
 }else{
  const bridge=new T.CubicBezierCurve3(route.entry,route.entry.clone().addScaledVector(route.V,1),outer[0].clone().addScaledVector(route.U,1),outer[0]);
  route.wrapPoints=Array.from({length:25},(_,i)=>bridge.getPoint(i/24)).concat(outer);
 }
 route.wrapLengths=[0];for(let i=1;i<route.wrapPoints.length;i++)route.wrapLengths.push(route.wrapLengths.at(-1)+route.wrapPoints[i].distanceTo(route.wrapPoints[i-1]));
 return route;
}
