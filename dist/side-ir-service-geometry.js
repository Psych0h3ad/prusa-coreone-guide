import * as T from'three';
import{SENSOR_ASSEMBLY as S}from'./sensor-assembly-data.js?v=20261111-94';
import{M2_SOURCE}from'./side-ir-service-native-data.js';
import{SIDE_IR_PARAMETERS as P}from'./side-ir-service-parameters.js';
import{sideIRSelection}from'./side-ir-service-state.js';
import{installSideIRLead}from'./side-ir-service-lead.js';
import{installSideIRMainPtfe}from'./side-ir-service-ptfe.js';
import{sideIRPartNames}from'./side-ir-service-locales.js';
export const SIDE_IR_HELD_OFFSET=P.handlingOffsetMM;
export const IR_FRAME=S.partWorld.sensorIR,OLD_FRAME=S.partWorld.sensorOld;
export const SIDE_IR_REFS={old:'sideIROldBoard',replacement:'sideIRNewBoard',m2:'sideIRM2',plug:'sideIRPlug',panel:'sideIRPanel',handle:'sideIRHandle',handleScrews:['sideIRHandleRear','sideIRHandleFront'],rivetPins:P.rivetCentresMM.map((_,i)=>'sideIRRivetPin'+i),rivetSleeves:P.rivetCentresMM.map((_,i)=>'sideIRRivetSleeve'+i)};
export const SIDE_IR_M2_BEARING=new T.Vector3(7.5,4,-3.15).applyMatrix4(new T.Matrix4().set(...IR_FRAME.flat())).toArray();
export const SIDE_IR_M2_OUT=IR_FRAME.slice(0,3).map(r=>-r[2]);
export const SIDE_IR_BODY_OUT=OLD_FRAME.slice(0,3).map(r=>r[2]);
const frame=a=>{const m=new T.Matrix4().set(...a.flat());for(const i of[12,13,14])m.elements[i]*=.001;return m;},refFrame=frame(IR_FRAME);
const decode=(s,C)=>{const raw=atob(s),b=new Uint8Array(raw.length);for(let i=0;i<b.length;i++)b[i]=raw.charCodeAt(i);return new C(b.buffer);};
const rect=(s,x0,y0,x1,y1)=>s.moveTo(x0,y0).lineTo(x1,y0).lineTo(x1,y1).lineTo(x0,y1).closePath();
function slab(shape,x,depth){return new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24}).applyMatrix4(new T.Matrix4().set(0,0,1,x,1,0,0,0,0,1,0,0,0,0,0,1)).scale(.001,.001,.001);}
function annulus(r,R,length){const s=new T.Shape();s.absarc(0,0,R,0,Math.PI*2,false);const h=new T.Path();h.absarc(0,0,r,0,Math.PI*2,true);s.holes.push(h);return new T.ExtrudeGeometry(s,{depth:length,bevelEnabled:false,curveSegments:24}).rotateY(Math.PI/2).scale(.001,.001,.001);}
function materialClone(source){const m=source.clone();m.userData={...m.userData,originalColor:source.color.clone(),originalOpacity:source.userData.originalOpacity??source.opacity};return m;}
function freshMaterial(color){const m=new T.MeshStandardMaterial({color,roughness:.55,metalness:color==='#afb2b3'?.8:0});m.userData.originalColor=m.color.clone();m.userData.originalOpacity=m.opacity;return m;}
function copySourceRest(node,source){node.position.copy(source.userData.restPosition);node.quaternion.copy(source.userData.restQuaternion);node.scale.copy(source.scale);node.userData.restPosition.copy(source.userData.restPosition);node.userData.restQuaternion.copy(source.userData.restQuaternion);node.userData.sourceRestPosition.copy(source.userData.restPosition);}
export function installSideIRGeometry(viewer){
 if(viewer.disposed)throw Error('Cannot install side sensor on a closed viewer');if(viewer.sideIRService)return viewer.sideIRService;
 const owned=[],byRef=new Map(),group=viewer.group('sideIRParts');
 const add=(ref,geometry,material,matrix=new T.Matrix4(),extra={})=>{const m=new T.Mesh(geometry,material);matrix.decompose(m.position,m.quaternion,m.scale);m.castShadow=true;m.receiveShadow=true;m.userData={part:'sideIRParts',maintenanceComponent:ref,componentOnly:true,toolOnly:true,serviceTask:'side-ir-replacement',cadPath:[],supplement:true,preserveColours:true,restPosition:m.position.clone(),restQuaternion:m.quaternion.clone(),sourceRestPosition:m.position.clone(),...extra};group.add(m);viewer.meshes.push(m);viewer.records.push({key:'sideIRParts',name:ref,sourceName:ref,mesh:m,id:m.uuid});owned.push(m);if(!byRef.has(ref))byRef.set(ref,[]);byRef.get(ref).push(m);return m;};
 const originals=ref=>viewer.meshes.filter(m=>m.userData.part===ref&&!m.userData.componentOnly&&!m.userData.manualExcluded);
 const clone=(from,to,pose)=>{const found=originals(from);if(!found.length)throw Error('Missing existing side-sensor source '+from);for(const source of found){const matrix=pose?frame(pose):new T.Matrix4().compose(source.userData.restPosition,source.userData.restQuaternion,source.scale),node=add(to,source.geometry.clone(),Array.isArray(source.material)?source.material.map(materialClone):materialClone(source.material),matrix,{sourcePart:from,manufacturerCAD:from==='sensorIR'});if(!pose)copySourceRest(node,source);}};
 for(const [from,to]of[['sensorOld','sideIRR1Body'],['sensorOldCover','sideIRR1Cover'],['sensorOldLever','sideIRR1Lever'],['sensorBody','sideIRPlusBody'],['sensorCover','sideIRPlusCover'],['sensorLever','sideIRPlusLever'],['sensorSwitch','sideIRPlusSwitch']])clone(from,to,S.partWorld[from]);
 for(const family of['R1','Plus'])for(const from of['sensorBall','sensorLeverMagnet','sensorSwitchMagnet','sensorLeverScrew',...(family==='Plus'?['sensorLeverWasher']:[])])clone(from,'sideIR'+family+from.replace('sensor',''),family==='R1'?S.oldRestPoses[from]:S.partWorld[from]);
 for(let i=0;i<2;i++){clone('sensorOldNut'+i,'sideIRR1MountNut'+i);clone(i?'sensorMountNutRight':'sensorMountNutLeft','sideIRPlusMountNut'+i,S.partWorld[i?'sensorMountNutRight':'sensorMountNutLeft']);}
 clone('sensorIR',SIDE_IR_REFS.old,IR_FRAME);clone('sensorIR',SIDE_IR_REFS.replacement,IR_FRAME);
 const m2=new T.BufferGeometry();m2.setAttribute('position',new T.BufferAttribute(decode(M2_SOURCE.positionsBase64,Float32Array),3));m2.setIndex(new T.BufferAttribute(decode(M2_SOURCE.indicesBase64,M2_SOURCE.indexType==='Uint16Array'?Uint16Array:Uint32Array),1));m2.computeVertexNormals();m2.scale(.001,.001,.001);
 const mount=refFrame.clone().multiply(new T.Matrix4().makeTranslation(.0075,.004,-.00315));add(SIDE_IR_REFS.m2,m2,freshMaterial('#afb2b3'),mount,{sourceGeometryDescription:'Existing complete M2x8 canonical hardware',sourceSHA256:M2_SOURCE.sourceSHA256,nominalLengthMM:8});
 const templates=viewer.sensorHardware.serviceSources();if(templates.handles.length!==2||templates.covers.length!==2)throw Error('Side-sensor hardware templates changed');
 for(let i=0;i<2;i++){
  const {mesh,kit,upgrade}=templates.handles[i];const M=new T.Matrix4().compose(mesh.userData.restPosition,mesh.userData.restQuaternion,mesh.scale),material=Array.isArray(mesh.material)?mesh.material.map(materialClone):materialClone(mesh.material),m=add(SIDE_IR_REFS.handleScrews[i],kit.clone(),material,M,{nominalLengthMM:8});copySourceRest(m,mesh);m.userData.longGeometry=upgrade.clone();m.userData.shortGeometry=m.geometry;viewer.sensorHardware.geometries.add(m.userData.longGeometry);viewer.sensorHardware.geometries.add(m.userData.shortGeometry);
  const source=templates.covers[i];for(const family of['R1','Plus']){const key=family==='R1'?(i?'sensorOldCoverScrewRight':'sensorOldCoverScrewLeft'):(i?'sensorCoverScrewRight':'sensorCoverScrewLeft'),mat=originals(key)[0].material,M=frame(S.partWorld[key]),node=add('sideIR'+family+'CoverScrew'+i,source.kit.clone(),materialClone(mat),M,{nominalLengthMM:10});if(family==='Plus'){node.userData.shortGeometry=source.upgrade.clone();node.userData.longGeometry=node.geometry;viewer.sensorHardware.geometries.add(node.userData.shortGeometry);viewer.sensorHardware.geometries.add(node.userData.longGeometry);}}
 }
 clone('handleRight',SIDE_IR_REFS.handle);
 clone('sideSensorInputPtfe','sideIRInputTube');
 clone('sideSensorInputCollet','sideIRInputCollet');clone('sideSensorTubeCollet','sideIRTubeCollet');
 const plug=new T.Shape(),c=P.authoredPlug;rect(plug,4-c.widthYMM/2,2.92-c.heightZMM/2,4+c.widthYMM/2,2.92+c.heightZMM/2);for(const y of[1.46,4,6.54]){const h=new T.Path(),r=c.cavityWidthMM/2;rect(h,y-r,2.92-r,y+r,2.92+r);plug.holes.push(h);}add(SIDE_IR_REFS.plug,slab(plug,c.xRangeMM[0],c.xRangeMM[1]-c.xRangeMM[0]),freshMaterial('#222526'),refFrame,{authoredReference:true,manufacturerCAD:false,sourcePitchMM:2.54,cavities:3});
 const nativePanel=viewer.meshes.find(m=>m.userData.cadIndex===52&&!m.userData.componentOnly);if(!nativePanel)throw Error('Native right recessed panel52 missing');const panelMatrix=new T.Matrix4().compose(nativePanel.userData.restPosition,nativePanel.userData.restQuaternion,nativePanel.scale),panel=add(SIDE_IR_REFS.panel,nativePanel.geometry.clone(),Array.isArray(nativePanel.material)?nativePanel.material.map(materialClone):materialClone(nativePanel.material),panelMatrix,{manufacturerCAD:true,sourceCADIndex:52,sourcePart:'right recessed removable panel',qualification:'Complete literal native52 mesh. Official411237 removal includes the recessed panel and its upper flange; upper acrylic86 stays installed.'});copySourceRest(panel,nativePanel);
 for(let i=0;i<11;i++){const centre=P.rivetCentresMM[i],M=new T.Matrix4().makeTranslation(centre[0]*.001,centre[1]*.001,centre[2]*.001);add(SIDE_IR_REFS.rivetSleeves[i],annulus(.65,1.5,4.5).rotateZ(Math.PI),freshMaterial('#222526'),M,{authoredReference:true,manufacturerCAD:false,sourceHoleCAD:52,sourceHoleRadiusMM:P.rivetHoleRadiiMM[i]});const pin=new T.CylinderGeometry(.00055,.00055,.0045,24).rotateZ(Math.PI/2).translate((P.authoredRivet.headThicknessMM-2.25)*.001,0,0);add(SIDE_IR_REFS.rivetPins[i],pin,freshMaterial('#292d2c'),M,{authoredReference:true,manufacturerCAD:false});}
 // Heads and sleeves remain separate pieces at every one of eleven real holes.
 for(let i=0;i<11;i++){const p=P.rivetCentresMM[i],M=new T.Matrix4().makeTranslation(p[0]*.001,p[1]*.001,p[2]*.001);add(SIDE_IR_REFS.rivetSleeves[i],annulus(.65,2.1,1),freshMaterial('#222526'),M,{authoredReference:true,manufacturerCAD:false});add(SIDE_IR_REFS.rivetPins[i],new T.CylinderGeometry(.0014,.0014,.0008,24).rotateZ(Math.PI/2).translate((P.authoredRivet.headThicknessMM+.4)*.001,0,0),freshMaterial('#292d2c'),M,{authoredReference:true,manufacturerCAD:false});}
 const lead=installSideIRLead(viewer,byRef.get(SIDE_IR_REFS.plug)[0],add,family=>byRef.get(family==='plus'?'sideIRPlusBody':'sideIRR1Body')[0]),mainPTFE=installSideIRMainPtfe(viewer,add,family=>byRef.get(family==='plus'?'sideIRPlusBody':'sideIRR1Body')[0]);
 const api={owned,byRef,lead,mainPTFE,configure(){const s=sideIRSelection();for(const m of owned){if(SIDE_IR_REFS.handleScrews.includes(m.userData.maintenanceComponent)){m.geometry=s.handleLength===8?m.userData.shortGeometry:m.userData.longGeometry;m.userData.nominalLengthMM=s.handleLength;}if(m.userData.maintenanceComponent.startsWith('sideIRPlusCoverScrew')){m.geometry=s.coverLength===8?m.userData.shortGeometry:m.userData.longGeometry;m.userData.nominalLengthMM=s.coverLength;}}}};viewer.sideIRService=api;api.configure();return api;
}
export function prepareSideIRSpec(viewer,spec,task){
 if(!task.sideIRService){if(viewer.sideIRService){viewer.sideIRService.lead.active=false;viewer.sideIRService.mainPTFE.active=false;}return spec;}const owner=installSideIRGeometry(viewer);owner.configure();owner.lead.active=true;owner.lead.pendingRestore=true;owner.lead.restorePlugMatrix=spec.plan.sideIRService.plugRestoreMatrix;owner.lead.restoreBodyMatrix=spec.plan.sideIRService.bodyRestoreMatrix;owner.mainPTFE.active=true;owner.mainPTFE.pendingRestore=true;owner.mainPTFE.restoreMatrix=spec.plan.sideIRService.bodyRestoreMatrix;
 for(const actor of spec.plan.actors)if(actor.carriedOffsetRefs){const offsets=new Map();for(const ref of actor.refs){const value=actor.carriedOffsetRefs[ref]||[0,0,0];for(const node of owner.byRef.get(ref)||[])offsets.set(node,new T.Vector3(...value).multiplyScalar(.001));}actor.carriedOffsets=offsets;}
 return spec;
}

export function localizeSideIRGeometry(viewer,text,part){
 const owner=viewer.sideIRService;if(!owner||viewer.disposed)return;
 if(part)part.name=text(['側面IRセンサー','Side IR sensor','Boční IR senzor','Seitlicher IR-Sensor']);
 const owned=new Set(owner.owned);for(const m of owned)m.userData.cadName=text(sideIRPartNames(m.userData.maintenanceComponent,m.userData.nominalLengthMM));
 for(const r of viewer.records)if(owned.has(r.mesh)){r.name=r.mesh.userData.cadName;r.sourceName=r.name;}
 if(viewer.operationScene?.plan.sideIRService){const source=viewer.operationScene.plan.actors;if(source.length!==viewer.sceneActors.length)throw Error('Side IR operation labels out of sync');source.forEach((a,i)=>viewer.sceneActors[i].label=a.label);}
}
