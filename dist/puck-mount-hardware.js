// SPDX-License-Identifier: MIT
import*as T from'three';
import{PUCK_MOUNT as D}from'./puck-mount-data.js';
import{PARTS}from'./data.js';
export function installPuckMountHardware(v){
 const ids=D.screws.map(s=>s.component),found=v.meshes.filter(m=>ids.includes(m.userData.component));
 if(found.length===4)return;if(found.length)throw Error('Incomplete Puck screw registration');
 const body=v.meshes.find(m=>m.userData.part==='puck'&&!m.userData.component),source=v.meshes.find(m=>m.userData.cadIndex===151);
 if(!body||!source||(source.geometry.index?.count??source.geometry.attributes.position.count)/3!==9048)throw Error('Whole Puck and source M3x8rT required');
 if(v.disposed)return;
 const stock=D.screws.map(s=>({s,m:v.meshes.find(m=>m.userData.cadIndex===s.nativeCADIndex)}));
 if(stock.some(({m})=>!m||(m.geometry.index?.count??m.geometry.attributes.position.count)/3!==9048))throw Error('Four complete native M3x8rT bodies required');
 body.userData.component='puckMountBody';
 for(const{s,m}of stock)Object.assign(m.userData,{component:s.component,componentOnly:true,puckMountStock:true,sourceQualification:'Existing whole native M3x8rT retained at exact source pose. Explicit numeric Original references remain available; the stock is introduced by the source-specific holder programme rather than a generic frame category.'});
 const box=new T.Mesh(new T.BoxGeometry(...D.box.sizeMM.map(x=>x*.001)),new T.MeshStandardMaterial({color:'#aa8860',roughness:.94}));box.position.fromArray(D.box.centerMM).multiplyScalar(.001);box.userData={part:'puckMountSupport',component:'puckMountBox',componentOnly:true,toolOnly:true,workspaceOnly:'puck-mount',cadName:'Cardboard support reference',geometryStatus:'independent-analytic-reference',qualification:D.box.qualification};box.visible=false;box.material.userData.originalOpacity=1;box.material.userData.originalColor=box.material.color.clone();
 PARTS.puckMountSupport??={name:'作業用の箱',en:'Support box',desc:'Puckとパネルを支える箱。3Dの寸法は配置例です。',icon:'panel',offset:[0,0,0],plus:true};
 v.group(box.userData.part).add(box);v.meshes.push(box);v.records.push({key:box.userData.part,name:box.userData.cadName,mesh:box,id:box.uuid});
}
