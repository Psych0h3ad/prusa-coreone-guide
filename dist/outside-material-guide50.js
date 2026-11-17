import * as T from 'three';
const X=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],W=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];
function derivative(c,t,o){
 if(c.isLineCurve3)return o.copy(c.v2).sub(c.v1);
 if(c.isCubicBezierCurve3){const u=1-t;return o.copy(c.v1).sub(c.v0).multiplyScalar(3*u*u).addScaledVector(c.v2.clone().sub(c.v1),6*t*u).addScaledVector(c.v3.clone().sub(c.v2),3*t*t);}
 if(c.isQuadraticBezierCurve3)return o.copy(c.v1).sub(c.v0).multiplyScalar(2*(1-t)).addScaledVector(c.v2.clone().sub(c.v1),2*t);
 throw Error('Unsupported actual source curve segment '+c.type);
}
class GuidedPiece50 extends T.Curve{
 constructor(c,endY,planeY,freedom){super();this.c=c;this.endY=endY;this.depth=planeY-endY;this.amplitude=this.depth>0?Math.min(Math.hypot(24,40),this.depth*this.depth/96)*freedom:0;this.arcLengthDivisions=128;this.L=this.integral(0,1,32);}
 shift(y){if(this.depth<=0)return[0,0];const w=(y-this.endY)/this.depth;if(w<=0||w>=1)return[0,0];const u=1-w;return[this.amplitude*64*(w*u)**3,this.amplitude*192*w*w*u*u*(1-2*w)/this.depth];}
 getPoint(t,o=new T.Vector3()){this.c.getPoint(t,o);const q=this.shift(o.y)[0];o.x+=q*24/Math.hypot(24,40);o.z+=q*40/Math.hypot(24,40);return o;}
 derivative(t,o=new T.Vector3()){const p=this.c.getPoint(t),d=derivative(this.c,t,o);const q=this.shift(p.y)[1]*d.y;d.x+=q*24/Math.hypot(24,40);d.z+=q*40/Math.hypot(24,40);return d;}
 getTangent(t,o=new T.Vector3()){return this.derivative(t,o).normalize();}
 integral(a,b,n){let L=0;for(let i=0;i<n;i++)for(let k=0;k<5;k++)L+=W[k]*this.derivative(a+(b-a)*(i+(X[k]+1)/2)/n).length()*(b-a)/(2*n);return L;}
 getLength(){return this.L;}
 getLengths(divisions=this.arcLengthDivisions){if(this.cacheArcLengths?.length===divisions+1&&!this.needsUpdate)return this.cacheArcLengths;const a=[0];for(let i=1;i<=divisions;i++)a.push(a.at(-1)+this.integral((i-1)/divisions,i/divisions,1));this.needsUpdate=false;return this.cacheArcLengths=a;}
}
// This is an analytic curve chart BEFORE the fixed-stock solve, not vertex
// displacement after meshing. It is C2 identity at the real sheet plane and
// at the actual source end; end position/tangent/curvature are retained.
export function guideOutsideMaterial50(base,end,aperture,freedom){
 if(!aperture?.isVector3||!Number.isFinite(freedom)||freedom<0||freedom>1)throw Error('Actual current source aperture/unplugged frame required');const result=new T.CurvePath(),depth=aperture.y-end.y;
 for(const c of base.curves){const controls=[c.v0,c.v1,c.v2,c.v3].filter(Boolean),ys=controls.map(v=>v.y);const intersects=depth>0&&Math.min(...ys)<aperture.y&&Math.max(...ys)>end.y;result.add(new GuidedPiece50(c,end.y,aperture.y,freedom));}
 return result;
}
