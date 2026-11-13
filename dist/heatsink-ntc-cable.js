// One physical lead belongs to its sensor, independently of a repair task.
// Original sensor ancestry also applies during static parts preparation.
export function registerNTCSource(viewer){
 const entity=viewer.fasteners.entities.get('lbNtcLead');
 if(!entity)throw Error('Prepared original NTC cable entity required');
 const mesh=entity.mesh;
 delete mesh.userData.serviceTask;delete mesh.userData.serviceOnly;
 Object.assign(mesh.userData,{part:'nextruderCables',component:'lbNtcLead',cadPath:[787,788,789,806],factorySourceCad:806,
  cadName:'ヒートシンクのNTCサーミスターケーブル'});
 viewer.group('nextruderCables').add(mesh);
 const row=viewer.records.find(r=>r.mesh===mesh);if(row){row.key='nextruderCables';row.name=mesh.userData.cadName;}
 entity.update(0,0,1);viewer.director.cache.clear();viewer.sceneSignature=undefined;
 return entity;
}
