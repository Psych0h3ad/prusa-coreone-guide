// Independent CPU triangle queries. No expected animation angles or part-role
// definitions are used here. Distances and ray deduplication are in mm.
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length2=a=>dot(a,a);
const directions=[[.8123,.4142,.1711],[-.264,.917,.331],[.329,-.214,.919]].map(d=>{const n=Math.sqrt(length2(d));return d.map(x=>x/n);});
function bounds(points){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const p of points)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],p[k]);hi[k]=Math.max(hi[k],p[k]);}return {lo,hi};}
function boxDistance2(p,b){let n=0;for(let k=0;k<3;k++){const d=Math.max(b.lo[k]-p[k],0,p[k]-b.hi[k]);n+=d*d;}return n;}
function rayBox(p,d,b){let near=0,far=Infinity;for(let k=0;k<3;k++){let a=(b.lo[k]-p[k])/d[k],c=(b.hi[k]-p[k])/d[k];if(a>c)[a,c]=[c,a];near=Math.max(near,a);far=Math.min(far,c);if(far<near)return false;}return true;}
function rayTriangle(p,d,t){const a=t[0],e1=sub(t[1],a),e2=sub(t[2],a),h=cross(d,e2),det=dot(e1,h);if(Math.abs(det)<1e-12)return null;const inv=1/det,s=sub(p,a),u=inv*dot(s,h);if(u<0||u>1)return null;const q=cross(s,e1),v=inv*dot(d,q);if(v<0||u+v>1)return null;const distance=inv*dot(e2,q);return distance>1e-8?distance:null;}
function segmentDistance2(p,a,b){const v=sub(b,a),w=sub(p,a),t=Math.max(0,Math.min(1,dot(w,v)/Math.max(length2(v),1e-100)));return length2(w.map((x,k)=>x-t*v[k]));}
function triangleDistance2(p,t){const [a,b,c]=t,u=sub(b,a),v=sub(c,a),w=sub(p,a),n=cross(u,v),nn=length2(n),uu=dot(u,u),uv=dot(u,v),vv=dot(v,v),wu=dot(w,u),wv=dot(w,v),den=uu*vv-uv*uv;let best=Math.min(segmentDistance2(p,a,b),segmentDistance2(p,b,c),segmentDistance2(p,c,a));if(nn>1e-20&&Math.abs(den)>1e-20){const s=(wu*vv-wv*uv)/den,r=(wv*uu-wu*uv)/den;if(s>=0&&r>=0&&s+r<=1)best=Math.min(best,dot(w,n)**2/nn);}return best;}
export function triangleBVH(triangles){
 if(!triangles.length||triangles.some(t=>t.length!==3||t.flat().some(n=>!Number.isFinite(n))))throw Error('Invalid actual native triangles');
 const boxes=triangles.map(bounds),centres=boxes.map(b=>b.lo.map((x,k)=>(x+b.hi[k])/2));
 function build(ids){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const i of ids)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],boxes[i].lo[k]);hi[k]=Math.max(hi[k],boxes[i].hi[k]);}const node={lo,hi};if(ids.length<=12){node.ids=ids;return node;}const axis=hi.map((v,k)=>v-lo[k]).indexOf(Math.max(...hi.map((v,k)=>v-lo[k])));ids.sort((a,b)=>centres[a][axis]-centres[b][axis]);const mid=ids.length>>1;node.left=build(ids.slice(0,mid));node.right=build(ids.slice(mid));return node;}
 const root=build(triangles.map((_,i)=>i));
 function inside(point,direction){const hits=[];function visit(node){if(!rayBox(point,direction,node))return;if(node.ids){for(const i of node.ids){const t=rayTriangle(point,direction,triangles[i]);if(t!==null)hits.push(t);}}else{visit(node.left);visit(node.right);}}visit(root);hits.sort((a,b)=>a-b);let count=0,last=-Infinity;for(const t of hits)if(t-last>1e-7){count++;last=t;}return count%2===1;}
 function distance(point){let best=Infinity;function visit(node){if(boxDistance2(point,node)>best)return;if(node.ids){for(const i of node.ids)best=Math.min(best,triangleDistance2(point,triangles[i]));}else{const a=boxDistance2(point,node.left),b=boxDistance2(point,node.right);if(a<=b){visit(node.left);visit(node.right);}else{visit(node.right);visit(node.left);}}}visit(root);return Math.sqrt(best);}
 return {root,triangles:triangles.length,inside,distance};
}
export function uniqueVertices(triangles){const points=new Map();for(const t of triangles)for(const p of t)points.set(p.join(','),p);return [...points.values()];}
export function interiorWitnesses(points,bvh,{surfaceToleranceMM=.005}={}){
 const witnesses=[];let allThreeInside=0,ambiguous=0;
 for(const [index,p]of points.entries()){
  if(p.some((x,k)=>x<bvh.root.lo[k]||x>bvh.root.hi[k]))continue;
  const votes=directions.map(d=>bvh.inside(p,d));
  if(votes.every(Boolean)){allThreeInside++;const distanceMM=bvh.distance(p);if(distanceMM>surfaceToleranceMM)witnesses.push({index,pointMM:p,distanceMM});}else if(votes.some(Boolean))ambiguous++;
 }
 return {testedVertices:points.length,allThreeInside,ambiguous,witnesses,maxInteriorDistanceMM:Math.max(0,...witnesses.map(w=>w.distanceMM))};
}
// Baseline contact is retained only for the same native vertex at the same
// actual coordinate. A baseline contact never exempts its whole part pair.
export function assertNoNewInterior(result,baseline,{coordinateToleranceMM=1e-7}={}){
 const known=new Map(baseline.witnesses.map(w=>[w.index,w]));
 for(const witness of result.witnesses){const original=known.get(witness.index);if(!original||Math.sqrt(length2(sub(witness.pointMM,original.pointMM)))>coordinateToleranceMM||witness.distanceMM>original.distanceMM+coordinateToleranceMM)throw Error('New native-mesh interior intersection: '+JSON.stringify(witness));}
}
