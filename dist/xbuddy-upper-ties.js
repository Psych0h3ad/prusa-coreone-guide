import * as T from 'three';
const S=x=>(x=T.MathUtils.clamp(x,0,1))*x*(3-2*x);
// Reuse the actual box1/2/4 strip, head, hole registration and stock. A real
// index gap opens the strip before the two pieces are lifted out. No new tie
// factory, material length or changed global FlexibleTie implementation.
export function installUpperTie(viewer,lease,sourceId){
 const current=lease.current,publish=lease.publishMesh;
 const e=viewer.fasteners.entities.get(sourceId),g=e.geometry;
 if(g.index.count<192*24||g.attributes.position.count<1936)throw Error('Actual current upper strip required');
 e.lastKey='';e.update(5,5,1);
 const original={index:g.index,p:g.attributes.position.array.slice(),n:g.attributes.normal.array.slice(),alias:e.mesh.userData.maintenanceComponent};
 const id='xbCompleteTie'+sourceId.slice(3),cutIndex=g.index.clone();
 const kept=Array.from(g.index.array).filter((_,i)=>!((i>=64*24&&i<65*24)||(i>=128*24&&i<129*24)));
 cutIndex.array=new Uint16Array(kept);cutIndex.count=kept.length;
 const role={id,sourceId,mesh:e.mesh,geometry:g,amount:1,stock:e.routeModel.length,
  update(from,to,t){if(!current()||e.mesh.geometry!==g)return;this.amount=from+(to-from)*S(t);},
  guide(){return [new T.Vector3(...e.p).multiplyScalar(.001),new T.Vector3(...e.p).add(new T.Vector3(0,45,0)).multiplyScalar(.001)];},
  follow(step){
   if(!current()||e.mesh.geometry!==g)return;
   if(step>=22){this.reset();return;}
   if(step!==10)return;
   const q=1-this.amount,cut=S(q/.2),lift=S((q-.2)/.8),p=g.attributes.position,n=g.attributes.normal;
   p.array.set(original.p);n.array.set(original.n);
   if(cut>0){g.setIndex(cutIndex);for(let i=0;i<p.count;i++){const segment=Math.floor(i/8),middle=segment>64&&segment<=128,dx=(middle?-1:1)*cut*.7+lift*48,dy=cut*2+lift*(middle?55:38);p.setXYZ(i,p.getX(i)+dx*.001,p.getY(i)+dy*.001,p.getZ(i)+lift*(middle?-12:10)*.001);}}
   else g.setIndex(original.index);
   g.setDrawRange(0,g.index.count);p.needsUpdate=n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
   this.mesh.visible=this.amount>0;this.receipt={sourceId,cut:cut>0,cutAmount:cut,withdrawAmount:lift,removedFaces:cut>0?16:0,sourceStockMM:this.stock};publish(this.mesh);
  },
  reset(){if(e.mesh.geometry!==g||e.geometry!==g)return;if(g.index===cutIndex){g.setIndex(original.index);e.lastKey='';const s=e.mesh.userData.flexState||{from:5,to:5,t:1};e.update(s.from,s.to,s.t);publish(this.mesh);}},
  retire(){this.reset();if(e.mesh.userData.maintenanceComponent===id){if(original.alias===undefined)delete e.mesh.userData.maintenanceComponent;else e.mesh.userData.maintenanceComponent=original.alias;}}
 };
 e.mesh.userData.maintenanceComponent=id;return role;
}
