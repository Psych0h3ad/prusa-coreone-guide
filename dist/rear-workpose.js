import * as T from 'three';

// The rear frame edges, rather than the Wi-Fi module or fan housings, carry the
// assembly on soft supports during official back-assembly steps37–46.
export const REAR_SUPPORT={postX:188.445,contactY:206.09972226,height:80,width:44,depth:74,stations:[80,320]};
export function backAssemblyWorkpose(plan){
 return plan.chapter===3&&plan.workspace==='printer'&&plan.step>=37&&plan.step<=46?{...plan,pose:'printer-back'}:plan;
}
export function createRearSupports(){
 const group=new T.Group(),d=REAR_SUPPORT;
 group.name='Soft workbench supports';group.userData.toolOnly=true;group.visible=false;
 const geometry=new T.BoxGeometry(d.width*.001,d.height*.001,d.depth*.001),material=new T.MeshStandardMaterial({color:'#646761',roughness:1,metalness:0});
 for(const x of[-d.postX,d.postX])for(const z of d.stations){
  const block=new T.Mesh(geometry,material);block.position.set(x*.001,(d.contactY+d.height/2)*.001,z*.001);block.castShadow=true;block.receiveShadow=true;group.add(block);
 }
 return group;
}
export function rearWorkingDirection(direction,plan){
 if(plan?.pose==='printer-back')direction.z*=-1;
 return direction;
}
