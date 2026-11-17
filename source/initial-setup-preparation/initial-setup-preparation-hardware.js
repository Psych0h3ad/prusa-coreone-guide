// MIT. The one missing O-ring; original sheet/Puck/holder meshes are reused.
import*as T from'three';
import{PARTS}from'./data.js?v=20261112-113';
import{INITIAL_PREPARATION as REF}from'./initial-setup-preparation-plan.js';
export function installInitialSetupPreparationHardware(v){
 if(v.meshes.some(m=>m.userData.component==='initialSetupOring'))return;
 const holder=v.meshes.find(m=>m.userData.part==='spoolNew');if(!holder)throw Error('Initial setup requires the existing whole spool holder');
 const M=new T.Matrix4().compose(holder.userData.restPosition||holder.position,holder.userData.restQuaternion||holder.quaternion,holder.scale),
  radius=(REF.ring.referenceSeatDiameterMM+REF.ring.sectionDiameterMM)/2*.001,
  geometry=new T.TorusGeometry(radius,REF.ring.sectionDiameterMM*.0005,24,128),
  material=new T.MeshStandardMaterial({color:'#292c2a',roughness:.88});
 material.userData.originalOpacity=1;material.userData.originalColor=material.color.clone();
 const m=new T.Mesh(geometry,material);m.position.set(0,0,REF.ring.holderLocalZMM*.001).applyMatrix4(M);m.quaternion.copy(holder.userData.restQuaternion||holder.quaternion);
 m.name='Initial setup O-ring 25x3.5';m.userData={part:'initialSetupPreparation',component:'initialSetupOring',maintenanceComponent:'initialSetupOring',
  serviceTask:'initial-setup',componentOnly:true,toolOnly:true,preserveColours:true,
  nominalInnerDiameterMM:25,sectionDiameterMM:3.5,referenceSeatDiameterMM:REF.ring.referenceSeatDiameterMM,
  officialSource:REF.ring.source,qualification:'Authored complete nominal25x3.5O-ring on its reference seat; slight installed stretch, full3.5section retained. Not a force/strain or OEM tolerance claim.',
  restPosition:m.position.clone(),restQuaternion:m.quaternion.clone()};
 PARTS.initialSetupPreparation??={name:'初期設定のOリング',en:'Initial setup O-ring',desc:'スプールホルダーに装着する25×3.5mmのOリング',icon:'spool',offset:[0,0,0]};
 geometry.computeBoundingBox();geometry.computeBoundingSphere();m.visible=false;v.group('initialSetupPreparation').add(m);v.meshes.push(m);
 v.records.push({key:'initialSetupPreparation',name:m.name,mesh:m,id:m.uuid});
}
