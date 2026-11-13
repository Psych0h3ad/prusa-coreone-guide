import*as T from'three';
const V=()=>new T.Vector3(),qFrame=f=>new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(f.axis,f.normal,f.tangent));
const nodes=[-.906179845938664,-.538469310105683,0,.538469310105683,.906179845938664],weights=[.236926885056189,.478628670499366,.568888888888889,.478628670499366,.236926885056189];
function hermite(frames,anchor){
 const s=frames.map(f=>f.distance),m=frames.map((f,i)=>i===0?f.tangent.clone():frames[Math.min(i+1,frames.length-1)].centre.clone().sub(frames[i-1].centre).normalize()),qs=frames.map(qFrame);let last=0;
 function span(x){if(x<s[last]||x>s[last+1]){let lo=0,hi=anchor;while(hi-lo>1){const k=(lo+hi)>>1;if(s[k]<=x)lo=k;else hi=k;}last=lo;}const i=Math.min(anchor-1,last),h=s[i+1]-s[i];return{i,h,t:T.MathUtils.clamp((x-s[i])/h,0,1)};}
 return{point(x,out=V()){const{i,h,t}=span(x),a=frames[i].centre,b=frames[i+1].centre;return out.copy(a).multiplyScalar(2*t**3-3*t*t+1).addScaledVector(m[i],h*(t**3-2*t*t+t)).addScaledVector(b,-2*t**3+3*t*t).addScaledVector(m[i+1],h*(t**3-t*t));},derivative(x,out=V()){const{i,h,t}=span(x);return out.copy(frames[i].centre).multiplyScalar((6*t*t-6*t)/h).addScaledVector(m[i],3*t*t-4*t+1).addScaledVector(frames[i+1].centre,(-6*t*t+6*t)/h).addScaledVector(m[i+1],3*t*t-2*t);},quaternion(x){const{i,t}=span(x);return qs[i].clone().slerp(qs[i+1],t);}};
}
function between(derivative,a,b){let sum=0;for(let k=0;k<5;k++)sum+=weights[k]*derivative(a+(nodes[k]+1)*(b-a)/2).length()*(b-a)/2;return sum;}
function integral(derivative,L,N=128,knots=[0,L]){let sum=0;const count=Math.ceil(N/(knots.length-1));for(let i=1;i<knots.length;i++)for(let j=0;j<count;j++)sum+=between(derivative,T.MathUtils.lerp(knots[i-1],knots[i],j/count),T.MathUtils.lerp(knots[i-1],knots[i],(j+1)/count));return sum;}
// Explicit base field model input: no viewer/global route/bootstrap. The same
// nonuniform material stations/profiles are retained; only a bounded curve is
// displaced and reparameterized to its original material allocation.
export function joinNativeSource(base,{anchorRing=32,normalMM=-1.681211376173,tangentMM=-1.56335,bumpDirection,branch=0}={}){
 if(base.frames.length!==545||anchorRing<3||anchorRing>=544)throw Error('Expected full545 retained frames and explicit local anchor');
 const original=base.frames,first=original[0],L=original[anchorRing].distance,knots=original.slice(0,anchorRing+1).map(f=>f.distance),curve=hermite(original,anchorRing),delta=first.tangent.clone().multiplyScalar(tangentMM).addScaledVector(first.normal,normalMM);
 const a=u=>1-u*u*u*(10+u*(-15+6*u)),da=u=>-30*u*u*(1-u)*(1-u)/L,b=u=>16*u*u*(1-u)*(1-u),db=u=>32*u*(1-u)*(1-2*u)/L;
 const warp=(amp,direction)=>({point(x,out=V()){const u=x/L;return curve.point(x,out).addScaledVector(delta,a(u)).addScaledVector(direction,amp*b(u));},derivative(x,out=V()){const u=x/L;return curve.derivative(x,out).addScaledVector(delta,da(u)).addScaledVector(direction,amp*db(u));}});
 const zero=warp(0,V()),gradient=V();for(let j=0;j<128;j++)for(let k=0;k<5;k++){const x=(j+(nodes[k]+1)/2)*L/128;gradient.addScaledVector(zero.derivative(x).normalize(),db(x/L)*weights[k]*L/256);}
 let direction=bumpDirection?new T.Vector3(...bumpDirection):gradient.negate().normalize();if(branch)direction.applyAxisAngle(first.tangent,branch);
 const evaluate=amp=>integral(warp(amp,direction).derivative,L,256,knots),before=evaluate(0);let lo=0,hi=.125,lowLength=before;
 if(before<L){direction.negate();}
 for(let i=0;i<12;i++){const value=evaluate(hi);if((before-L)*(value-L)<=0)break;if(value<lowLength)lowLength=value;hi*=1.5;}
 let high=evaluate(hi);if((before-L)*(high-L)>0)throw Error('Local stock not bracketed '+JSON.stringify({L,before,high,hi,anchorRing,time:base.time,lowLength}));
 for(let i=0;i<38;i++){const mid=(lo+hi)/2,value=evaluate(mid);if((before-L)*(value-L)<=0)hi=mid;else lo=mid;}
 const amplitude=(lo+hi)/2,path=warp(amplitude,direction),length=integral(path.derivative,L,512,knots),table=[0],parameters=[0];
 for(let i=1;i<knots.length;i++)for(let j=0;j<16;j++){const a=T.MathUtils.lerp(knots[i-1],knots[i],j/16),b=T.MathUtils.lerp(knots[i-1],knots[i],(j+1)/16);table.push(table.at(-1)+between(path.derivative,a,b));parameters.push(b);}
 function parameter(distance){let lo=0,hi=table.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(table[mid]<distance)lo=mid;else hi=mid;}const start=parameters[lo],wanted=distance-table[lo];let a=start,b=parameters[hi];for(let j=0;j<32;j++){const mid=(a+b)/2;if(between(path.derivative,start,mid)<wanted)a=mid;else b=mid;}return(a+b)/2;}
 const frames=original.slice();for(let i=0;i<anchorRing;i++){const f=original[i],x=i?parameter(f.distance):0,q=curve.quaternion(x),rotation=new T.Quaternion().setFromUnitVectors(curve.derivative(x).normalize(),path.derivative(x).normalize()).multiply(q);
  // Small local width tilt, not an idealized replacement frame: full native
  // edge contact is confined to the first cell. Keep the retained field and
  // fade this0.005rad correction out by10mm without moving the cap frame.
  const weight=T.MathUtils.smootherstep(f.distance,0,2)*(1-T.MathUtils.smootherstep(f.distance,4,10));rotation.premultiply(new T.Quaternion().setFromAxisAngle(first.normal,-.005*weight));
  frames[i]={...f,centre:path.point(x),axis:new T.Vector3(1,0,0).applyQuaternion(rotation),normal:new T.Vector3(0,1,0).applyQuaternion(rotation),tangent:new T.Vector3(0,0,1).applyQuaternion(rotation)};}
 frames[0]={...first,centre:first.centre.clone().add(delta)};
 return{...base,frames,nativeJoin:{kind:'same-stock-local-curve-displacement',anchorRing,anchorMaterialMM:L,changedRings:[0,anchorRing-1],deltaLocalMM:{tangent:tangentMM,normal:normalMM},deltaRootMM:delta.toArray(),amplitudeMM:amplitude,bumpDirection:direction.toArray(),baseInterpolatedLengthMM:integral(curve.derivative,L,512,knots),uncorrectedDisplacedLengthMM:before,retainedLocalStockMM:L,solvedLengthMM:length,stockErrorMM:length-L,arcTableLengthMM:table.at(-1),estimatedExitNotOEMMeasurement:true},localCurve:path};
}
