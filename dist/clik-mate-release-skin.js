// Original functional release skin for the independently authored cavity model.
// Code MIT. Source frame mm: X row, +Y insertion, +Z latch. No OEM geometry input.
const cache=new WeakMap(),norm=v=>{const l=Math.hypot(...v);return v.map(x=>x/l);};
const knots=Array.from({length:9},(_,i)=>Math.fround(6.2+2.3*i/8));
const heights=Array.from({length:9},(_,i)=>{const t=i/8;return 1-t*t*(3-2*t);});
export function releaseField(x,y,z,pins,role='moving'){
 if(role!=='moving')return{delta:0,dx:0,dy:0,dz:0};
 if(y<=knots[0])return{delta:.65,dx:0,dy:0,dz:0};if(y>=knots.at(-1))return{delta:0,dx:0,dy:0,dz:0};
 let i=knots.findIndex(v=>v>y)-1,dy=(heights[i+1]-heights[i])/(knots[i+1]-knots[i]);return{delta:.65*(heights[i]+(y-knots[i])*dy),dx:0,dy:.65*dy,dz:0};
}
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function split(poly,y){const d=poly.map(v=>{const q=v.p[1]-y;return Math.abs(q)<.0002?0:q;});if(d.every(x=>x>=0)||d.every(x=>x<=0))return[poly];const out=[[],[]];for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length,a=poly[i],b=poly[j];if(d[i]>=0)out[0].push(a);if(d[i]<=0)out[1].push(a);if(d[i]*d[j]<0){const t=d[i]/(d[i]-d[j]),v={p:mix(a.p,b.p,t),n:norm(mix(a.n,b.n,t))};out[0].push(v);out[1].push(v);}}return out.filter(p=>p.length>=3);}
function prepare(cad,pins){
 if(!cad.releaseSkinGroups)throw Error('Functional release skin requires its matching authored cavity assets');
 const pp=[],nn=[],qp=[],qn=[],parents=[],roles=[];let areaLoss=0;
 const area=t=>{const a=t[1].map((v,i)=>v-t[0][i]),b=t[2].map((v,i)=>v-t[0][i]);return Math.hypot(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])/2;};
 for(let k=0;k<cad.positions.length;k+=9){const g=cad.releaseSkinGroups.find(g=>k/3>=g.start&&k/3<g.start+g.count);if(!g)throw Error('Untagged functional source face');const original=Array.from({length:3},(_,j)=>({p:Array.from(cad.positions.subarray(k+j*3,k+j*3+3)),n:Array.from(cad.normals.subarray(k+j*3,k+j*3+3))}));let polys=[original],retained=0;
  if(g.role==='moving')for(const y of knots)polys=polys.flatMap(p=>split(p,y));
  for(const poly of polys)for(let j=1;j<poly.length-1;j++){const tri=[poly[0],poly[j],poly[j+1]],ar=area(tri.map(v=>v.p));if(ar<1e-14)continue;retained+=ar;parents.push(k/9);roles.push(g.role==='moving'?1:0);
   for(const v of tri){const[x,y,z]=v.p,[nx,ny,nz]=v.n,f=releaseField(x,y,z,pins,g.role),n=norm([nx,ny+f.dy*nz,nz]);pp.push(-x,z-1.25,y);nn.push(-nx,nz,ny);qp.push(-x,z-1.25-f.delta,y);qn.push(-n[0],n[2],n[1]);}
  }
  const loss=area(original.map(v=>v.p))-retained;if(Math.abs(loss)>1e-7)throw Error('Functional source face area not retained');areaLoss+=loss;
 }
 return{positions:new Float32Array(pp),normals:new Float32Array(nn),pressedPositions:new Float32Array(qp),pressedNormals:new Float32Array(qn),parentFaces:new Uint32Array(parents),roles:new Uint8Array(roles),sourceTriangles:cad.positions.length/9,triangles:parents.length,iterations:0,maxChordErrorMM:null,piecewiseAffine:true,minimumJacobian:1,sourceAreaLossMM2:areaLoss};
}
export function createReleaseSkin(cad,pins){let byPins=cache.get(cad);if(!byPins){byPins=new Map();cache.set(cad,byPins);}if(!byPins.has(pins))byPins.set(pins,prepare(cad,pins));const p=byPins.get(pins);return{...p,positions:p.positions.slice(),normals:p.normals.slice(),pressedPositions:p.pressedPositions.slice(),pressedNormals:p.pressedNormals.slice(),parentFaces:p.parentFaces.slice(),roles:p.roles.slice()};}
