import * as T from 'three';

// Official 5.43, lines 991100/991108/991132/991116/991124/991140.
// Keep every native face. Only the two native grub screws change placement.
// The contacting portion of the tool is a photo-based illustration, not an
// official tool mesh or a printable/manufacturing model.
export const PULLEY_SETUP={pivot:[180.00135553,141.30000301,352.4004127],
 firstSeat:[0,2.25,0],secondSeat:[1,0,0],pitch:.5,
 pulleyFaceZ:355.9004127,motorBossZ:360.3004138,motorFaceZ:364.3004138,
 source:'https://help.prusa3d.com/guide/5-corexy-assembly_982276#991072'};
const setups=new WeakMap(),ids=[567,389,390,391];
const smooth=t=>(t=Math.max(0,Math.min(1,t)),t*t*(3-2*t));
const vec=a=>new T.Vector3(...a),axisZ=new T.Vector3(0,0,1);
export const PULLEY_MESSAGES={
 'Y軸プーリー：歯をモーターと反対側へ向けて通す':['Y pulley: slide on with the teeth away from the motor','Řemenice Y: nasaďte ji zuby od motoru','Y-Riemenscheibe: mit den Zähnen vom Motor weg aufschieben'],
 '太いフックをモーター面とプーリーの間へ差し込む':['Place the wider hook between the motor face and pulley','Vložte širší hák mezi čelo motoru a řemenici','Breiteren Haken zwischen Motorfläche und Riemenscheibe schieben'],
 '工具にプーリーを当て、高さを合わせる':['Rest the pulley on the tool to set its height','Opřete řemenici o nástroj a nastavte její výšku','Riemenscheibe am Werkzeug anlegen und die Höhe einstellen'],
 '軸の平面に当たる止めネジを先に締める':['Tighten the grub screw against the shaft flat first','Nejprve utáhněte červík proti plošce hřídele','Zuerst die Madenschraube an der Wellenabflachung festziehen'],
 'モーター一式を回し、2本目を手前に向ける':['Turn the motor assembly to bring the second screw forward','Otočte sestavu motoru druhým červíkem dopředu','Motorbaugruppe drehen, bis die zweite Schraube vorne liegt'],
 'もう1本の止めネジを締める':['Tighten the second grub screw','Utáhněte druhý červík','Zweite Madenschraube festziehen'],
 'モーター一式を元の向きへ戻す':['Return the motor assembly to its original orientation','Vraťte sestavu motoru do původní orientace','Motorbaugruppe in die ursprüngliche Ausrichtung zurückdrehen'],
 '工具を抜き、歯が外側を向くことを確認する':['Remove the tool and check that the teeth face away from the motor','Vyjměte nástroj a ověřte, že zuby směřují od motoru','Werkzeug entfernen und prüfen, dass die Zähne vom Motor weg zeigen']
};
const labels=Object.keys(PULLEY_MESSAGES);
export function pulleySetupPlan(plan){
 if(plan.chapter!==5||plan.step!==43||plan.workspace!=='motor-y')return plan;
 const common={focusMotion:true,focusRefs:[567,389,390,391,'pulleyHeightTool'],focusPadding:8,focusMinDistance:100,guideRadius:2,guideTube:.2,guideArrowLength:4};
 const actor=(refs,label,extra={})=>({...common,refs,label:labels[label],axis:[0,0,-1],distance:0,reuse:true,...extra});
 return {...plan,focus:[567,388,'pulleyHeightTool'],focusPadding:10,actors:[
  actor([388],0,{distance:25,waypoints:[[0,0,-25],[0,0,-1]],officialLine:991100}),
  actor(['pulleyHeightTool'],1,{axis:[1,0,0],distance:40,officialLine:991108}),
  actor([388],2,{handling:true,distance:1,officialLine:991116}),
  actor([390],3,{axis:[0,-1,0],distance:2.25,spin:1620,officialLine:991116,
   anchors:[[180.00135553,138.80000301,352.4004127]],focusRefs:[],focusBounds:[174,130,346,187,144,365],focusPadding:4,focusMinDistance:65,camera:'back'}),
  actor([567,388],4,{handling:true,carry:true,axis:[0,0,1],spin:90,officialLine:991124}),
  actor([391],5,{axis:[0,-1,0],distance:1,spin:720,officialLine:991124,
   anchors:[[180.00135553,137.55000301,352.4004127]],focusRefs:[],focusBounds:[174,130,346,187,144,365],focusPadding:4,focusMinDistance:65,camera:'back'}),
  actor([567,388],6,{handling:true,carry:true,axis:[0,0,1],spin:-90,officialLine:991124}),
  actor(['pulleyHeightTool'],7,{axis:[1,0,0],distance:40,remove:true,destination:'removed',officialLine:991140})
 ]};
}
function sector(inner,outer,z0,z1){
 const s=new T.Shape(),a=-Math.PI*.38,b=Math.PI*.38;
 s.moveTo(inner*Math.cos(a),inner*Math.sin(a));
 s.lineTo(outer*Math.cos(a),outer*Math.sin(a));s.absarc(0,0,outer,a,b,false);
 s.lineTo(inner*Math.cos(b),inner*Math.sin(b));s.absarc(0,0,inner,b,a,true);s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:32});
 g.translate(PULLEY_SETUP.pivot[0],PULLEY_SETUP.pivot[1],z0);return g;
}
export function createPulleySetupHardware(viewer){
 const native=new Map(ids.map(id=>[id,viewer.meshes.find(m=>m.userData.cadIndex===id)]));
 if([...native.values()].some(m=>!m))throw Error('Native Y motor/pulley/grub screws are required');
 const d=PULLEY_SETUP,lip=sector(5.2,11.25,d.pulleyFaceZ,d.motorBossZ),heel=sector(11.25,16,d.pulleyFaceZ,d.motorFaceZ);
 const handle=new T.BoxGeometry(27,7,4);handle.translate(d.pivot[0]+26,d.pivot[1],d.motorFaceZ-2);
 const points=[],normals=[];
 for(const source of [lip,heel,handle]){const g=source.index?source.toNonIndexed():source;points.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);if(g!==source)g.dispose();source.dispose();}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.scale(.001,.001,.001);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const material=new T.MeshStandardMaterial({color:'#303332',roughness:.85});
 material.userData.originalColor=material.color.clone();material.userData.originalOpacity=1;
 const tool=new T.Mesh(geometry,material);tool.userData={part:'xy',component:'pulleyHeightTool',toolOnly:true,workspaceOnly:'motor-y',supplement:true,illustrative:true,cadName:'組み立て用マルチツールの太いフック',preserveCadName:true,officialSource:d.source};tool.castShadow=true;tool.receiveShadow=true;
 const rest=new Map([...native].map(([id,m])=>[id,{position:m.position.clone(),quaternion:m.quaternion.clone()}]));
 setups.set(viewer,{native,rest,tool,pivot:vec(d.pivot).multiplyScalar(.001)});return [tool];
}
// Generic actors expose all individual actions and guides. This bounded hook
// keeps the preloaded screws with the pulley, then advances only the selected
// original screw along its own axis. The complete workpiece can be turned in
// the user's hand; its correct shaft-up orientation is never inverted.
export function followPulleySetup(viewer){
 const s=setups.get(viewer),plan=viewer.operationScene?.plan;if(!s||!plan)return;
 const current=plan.chapter===5&&plan.step===43&&plan.workspace==='motor-y'&&!viewer.operationScene.full;
 if(current){
  const p=Math.min(8,Math.max(0,viewer.operationProgress*8)),i=Math.min(7,Math.floor(p)),t=p===8?1:p-i,f=smooth(t);
  const lift=i===0?-(25-24*f):i===1?-1:i===2?-(1-f):0;
  const first=i<3?0:i===3?f:1,second=i<5?0:i===5?f:1;
  const turn=i<4?0:i===4?f:i<6?1:i===6?1-f:0;
  const rotation=new T.Quaternion().setFromAxisAngle(axisZ,Math.PI/2*turn);
  for(const [id,m]of s.native){
   const rest=s.rest.get(id),position=rest.position.clone();if(id!==567)position.z+=lift*.001;
   if(id===390)position.addScaledVector(vec(PULLEY_SETUP.firstSeat),first*.001);
   if(id===391)position.addScaledVector(vec(PULLEY_SETUP.secondSeat),second*.001);
   m.position.copy(position).sub(s.pivot).applyQuaternion(rotation).add(s.pivot);m.quaternion.copy(rotation).multiply(rest.quaternion);
   if(id===390&&i===3||id===391&&i===5){const out=vec(id===390?[0,-1,0]:[-1,0,0]).applyQuaternion(rotation);const angle=(1-f)*(id===390?1620:720)*Math.PI/180;const q=new T.Quaternion().setFromAxisAngle(out,angle);m.quaternion.premultiply(q);const centre=m.geometry.boundingBox.getCenter(new T.Vector3()).applyQuaternion(rotation.clone().multiply(rest.quaternion));m.position.add(centre).sub(centre.clone().applyQuaternion(q));}
  }
  s.tool.position.set(i===1?(1-f)*.04:i===7?f*.04:0,0,0);s.tool.quaternion.identity();s.tool.visible=i>=1&&(i<7||t<1);
  s.tool.userData.pulleyPhase={i,t,firstSeat:first*2.25,secondSeat:second,turn:turn*90};
 }else{
  s.tool.visible=false;
  const fitted=viewer.operationScene.full||viewer.state?.flow==='upgrade'||plan.chapter>5||plan.chapter===5&&plan.step>43;
  if(!fitted)return;
  const motor=s.native.get(567),rest=s.rest.get(567),q=motor.quaternion.clone().multiply(rest.quaternion.clone().invert());
  for(const [id,seat]of [[390,PULLEY_SETUP.firstSeat],[391,PULLEY_SETUP.secondSeat]]){
   const m=s.native.get(id),source=s.rest.get(id);
   m.position.copy(source.position).addScaledVector(vec(seat),.001).sub(rest.position).applyQuaternion(q).add(motor.position);
   m.quaternion.copy(q).multiply(source.quaternion);
  }
 }
 for(const m of [...s.native.values(),s.tool])m.updateMatrix();
}
