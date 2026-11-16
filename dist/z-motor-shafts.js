import {Z_MOTOR_GROUPS as G} from './z-motor-sequence-source.js';
// Keep the whole official native motor mesh. Only its distinct shaft vertices
// turn; the housing, shoulder, source indices and original geometry stay intact.
export function followZMotorShafts(viewer){
 if(viewer.disposed||!viewer.loaded)return;
 const enabled=!viewer.operationScene?.full&&viewer.sceneActors?.some(a=>a.zMotorRodCheck);
 let api=viewer.zMotorShafts;
 if(!enabled){if(api?.active)for(const row of api.rows)restore(row);return;}
 if(!api){
  const rows=[];
  for(const g of G){
   const nodes=viewer.director.resolve([g.motor]);if(nodes.length!==1)throw Error('Complete native Z motor required');
   const mesh=nodes[0],original=mesh.geometry,p=original.attributes.position,n=original.attributes.normal,ix=original.index;
   if(ix?.count!==12504||p.count!==4204||n.count!==p.count)throw Error('Native Z motor topology changed');
   const moving=new Set(),fixed=new Set();let faces=0;
   for(let k=0;k<ix.count;k+=3){const vs=[ix.getX(k),ix.getX(k+1),ix.getX(k+2)],ys=vs.map(i=>p.getY(i)),shaft=Math.min(...ys)>=Math.fround(.0215)&&Math.max(...ys)>Math.fround(.0215);if(shaft)faces++;for(const i of vs)(shaft?moving:fixed).add(i);}
   if(faces!==225||moving.size!==227||[...moving].some(i=>fixed.has(i)))throw Error('Whole native Z shaft boundary changed');
   rows.push({id:g.motor,mesh,original,moving:[...moving],sourcePosition:p.array.slice(),sourceNormal:n.array.slice()});
  }
  for(const row of rows){row.geometry=row.original.clone();row.mesh.geometry=row.geometry;}
  api={active:true,rows};viewer.zMotorShafts=api;
 }
 if(!api.active)return;for(const row of api.rows)restore(row);
 const q=viewer.operationProgress*viewer.sceneActors.length,i=Math.min(viewer.sceneActors.length-1,Math.floor(q)),t=q>=viewer.sceneActors.length?1:q-i,actor=viewer.sceneActors[i];
 if(!actor.zMotorRodCheck||t<=0||t>=1)return;
 const row=api.rows.find(r=>r.id===actor.zMotorRodCheck);if(!row||row.mesh.geometry!==row.geometry)return;
 const angle=Math.PI*.5*Math.sin(2*Math.PI*t),c=Math.cos(angle),s=Math.sin(angle),p=row.geometry.attributes.position,n=row.geometry.attributes.normal;
 for(const i of row.moving){const k=i*3,x=row.sourcePosition[k],z=row.sourcePosition[k+2],nx=row.sourceNormal[k],nz=row.sourceNormal[k+2];p.array[k]=c*x+s*z;p.array[k+2]=-s*x+c*z;n.array[k]=c*nx+s*nz;n.array[k+2]=-s*nx+c*nz;}
 p.needsUpdate=n.needsUpdate=true;
}
function restore(row){row.geometry.attributes.position.array.set(row.sourcePosition);row.geometry.attributes.normal.array.set(row.sourceNormal);row.geometry.attributes.position.needsUpdate=row.geometry.attributes.normal.needsUpdate=true;}
export function retireZMotorShafts(viewer){
 const api=viewer.zMotorShafts;if(!api?.active)return;api.active=false;
 for(const row of api.rows){restore(row);if(row.mesh.geometry===row.geometry)row.mesh.geometry=row.original;}
 // A live teaching overlay may borrow a motor geometry. In that case the
 // existing scene collector remains its final owner; never dispose it twice.
 const retained=new Set(),visit=m=>{if(m.geometry)retained.add(m.geometry);for(const k of['sourceGeometry','referenceGeometry','guideGeometry20'])if(m.userData?.[k])retained.add(m.userData[k]);};
 for(const root of[viewer.scene,viewer.printer,viewer.arrowLayer])root?.traverse(visit);viewer.meshes?.forEach(visit);
 for(const row of api.rows)if(!retained.has(row.geometry))row.geometry.dispose();
}
