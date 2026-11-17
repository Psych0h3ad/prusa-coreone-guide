// Directed IEEE754 intervals and final Float32 bore rounding. Original MIT code.
// No physical clearance, altered nominal radius, shortened stock or predicate EPS.
const scratch=new DataView(new ArrayBuffer(8));
function up(x){if(Number.isNaN(x))throw Error('Nonfinite rounding operand');if(x===Infinity)return x;if(x===0)return Number.MIN_VALUE;scratch.setFloat64(0,x);let hi=scratch.getUint32(0),lo=scratch.getUint32(4);if(x>0){lo=(lo+1)>>>0;if(lo===0)hi=(hi+1)>>>0;}else{if(lo===0)hi=(hi-1)>>>0;lo=(lo-1)>>>0;}scratch.setUint32(0,hi);scratch.setUint32(4,lo);return scratch.getFloat64(0);}
const down=x=>-up(-x),value=x=>[x,x],add=(a,b)=>[down(a[0]+b[0]),up(a[1]+b[1])],sub=(a,b)=>[down(a[0]-b[1]),up(a[1]-b[0])];
function mul(a,b){const p=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return[down(Math.min(...p)),up(Math.max(...p))];}
function square(a){const hi=Math.max(Math.abs(a[0]),Math.abs(a[1])),lo=a[0]<=0&&a[1]>=0?0:Math.min(Math.abs(a[0]),Math.abs(a[1]));return[lo===0?0:down(lo*lo),up(hi*hi)];}
function nextFloat(x,direction){if(!Number.isFinite(x))throw Error('Nonfinite crimp vertex');if(x===0){scratch.setUint32(0,direction>0?1:0x80000001);return scratch.getFloat32(0);}scratch.setFloat32(0,x);let b=scratch.getUint32(0);b=(b+((x>0)===(direction>0)?1:-1))>>>0;scratch.setUint32(0,b);return scratch.getFloat32(0);}
function radialInterval(p,index,axis){return[sub(value(p[index*3]),value(axis[0])),sub(value(p[index*3+2]),value(axis[1]))];}
function planeBound(p,a,b,axis,r2){const A=radialInterval(p,a,axis),B=radialInterval(p,b,axis),cross=sub(mul(A[0],B[1]),mul(A[1],B[0])),dx=sub(B[0],A[0]),dz=sub(B[1],A[1]),edge2=add(square(dx),square(dz));if(!(edge2[0]>0))throw Error('Collapsed final crimp edge');const left=square(cross)[0],right=up(r2*edge2[1]);return{contained:left>=right,lowerSquaredCross:left,upperRadiusSquaredTimesEdgeSquared:right};}
export function roundYCrimpGeometry(layout,{slot,radius,straightRingStart}){
 const {g,layouts,samples,sides}=layout;if(layouts.length!==1||!(g.attributes.position.array instanceof Float32Array)||!Number.isInteger(straightRingStart)||straightRingStart<0||straightRingStart>samples)throw Error('Unsupported current Y representation');
 const p=g.attributes.position.array,l=layouts[0],axis=[-slot*.001,0],R=sides+1,groups=[];let maxShift=0;
 for(const spec of boreSpecs){
  const nominal=spec.nominalRadiusMM===.52?radius:spec.nominalRadiusMM;let r2=square(value(nominal*.001))[1],wireVertices=0;
  const offset=spec.nominalRadiusMM===.52?l.outer:l.core,end=spec.nominalRadiusMM===.52?samples:samples+1;
  for(let i=straightRingStart;i<=end;i++)for(let j=0;j<=sides;j++){const q=radialInterval(p,offset+i*R+j,axis);r2=Math.max(r2,add(square(q[0]),square(q[1]))[1]);wireVertices++;}
  const before=spec.indices.map(i=>[p[(l.frame+i)*3],p[(l.frame+i)*3+2]]);let steps=0,bounds;
  for(;;){bounds=spec.planes.map(([a,b])=>planeBound(p,l.frame+a,l.frame+b,axis,r2));if(bounds.every(b=>b.contained))break;if(steps++>=32)throw Error('Y bore directed rounding did not converge');
   for(const i of spec.indices){const base=(l.frame+i)*3;for(const [k,c]of [[0,axis[0]],[2,axis[1]]]){const q=p[base+k]-c;if(q!==0)p[base+k]=nextFloat(p[base+k],Math.sign(q));}}
  }
  for(let k=0;k<spec.indices.length;k++){const i=(l.frame+spec.indices[k])*3;maxShift=Math.max(maxShift,Math.hypot(p[i]-before[k][0],p[i+2]-before[k][1]));}
  groups.push({nominalRadiusMM:nominal,wireVertices,planeCount:bounds.length,outwardFloat32Steps:steps,targetRadiusSquaredUpperMetres2:r2,allPlaneIntervalBoundsContained:true,planeBounds:bounds});
 }
 g.attributes.position.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();return{method:'Final encoded Float32 bore planes enclose unchanged nominal cylinder and actual complete straight-entry wire triangles; outward-rounded Float64 interval certificate',groups,maximumFinalRoundingShiftMM:maxShift*1000,stockRadiusAndWireUnchanged:true};
}
