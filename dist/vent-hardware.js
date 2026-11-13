import {VENT_DATUM} from './vent-configuration.js?v=20261111-94';

// Both lengths are complete, separately verified geometries. Never stretch a
// threaded source screw: that would change its pitch and the head or tip.
export function createVentHardware(meshes,longGeometries,records=[],shortGeometries={}){
 const geometries=new Set();
 const screws=meshes.filter(m=>m.userData.cadPath?.some(id=>[98,100,102].includes(id))).map(mesh=>{
  const id=[98,100,102].find(id=>mesh.userData.cadPath.includes(id)),long=longGeometries[id],source=shortGeometries[id]||mesh.geometry;if(!long)throw Error('Missing verified M3x12 geometry');for(const g of [mesh.geometry,source,long])geometries.add(g);return {mesh,source,long,name:mesh.userData.cadName};
 });
 const nuts=meshes.filter(m=>m.userData.cadPath?.some(id=>[94,96].includes(id))).map(mesh=>({mesh,position:mesh.position.clone()}));
 let active;
 return {geometries,apply(configuration){
  if(configuration===active)return;active=configuration;
  for(const {mesh,source,long,name}of screws){
   const useLong=configuration==='kit'||configuration==='upgrade'&&!mesh.userData.cadPath.includes(98);
   mesh.geometry=useLong?long:source;mesh.userData.cadName=useLong?'M3x12rT (ISO 7380-1)':name;
   mesh.userData.fastenerLength=useLong?12:10;
   for(const record of records)if(record.mesh===mesh)record.name=mesh.userData.cadName.replace(/\s+v\d+(?:\.\d+)?/g,'').replace(/:\d+$/,'');
  }
  for(const {mesh,position}of nuts){mesh.userData.restPosition.copy(position);if(configuration!=='original')mesh.userData.restPosition.add({x:VENT_DATUM.nutOffset[0],y:VENT_DATUM.nutOffset[1],z:VENT_DATUM.nutOffset[2]});}
 }};
}
