import * as T from 'three';
import {createFullProfileSource} from '../ribbon/full-profile-source.js';
export function decodeBoundaryFrames(bytes){const a=new Float64Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));if(a.length!==545*13)throw Error('Expected full545 Float64 material frames');return Array.from({length:545},(_,i)=>{const k=i*13;return{distance:a[k],centre:new T.Vector3().fromArray(a,k+1),axis:new T.Vector3().fromArray(a,k+4),normal:new T.Vector3().fromArray(a,k+7),tangent:new T.Vector3().fromArray(a,k+10)};});}
// readBytes(name) reads the manifest's frozen-boundary-v1 directory. Caller
// verifies its SHA manifest. No viewer, hidden old route, packet join or time gate.
export function readFrozenBoundary(state,readBytes){
 const floats=name=>{const b=readBytes(name);return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));},metadata=JSON.parse(new TextDecoder().decode(readBytes(state.materialProfiles))),materialSource=createFullProfileSource(metadata,floats('material-position.bin'),floats('material-normal.bin'));
 const surface=s=>({...s,trianglesMM:floats(s.file)}),blue=state.surfaces.find(s=>s.label==='boxLower'),earth=state.surfaces.find(s=>s.kind==='FE45');
 return{event:state.event,materialSource,initialModel:{...JSON.parse(new TextDecoder().decode(readBytes('unjoined-model.json'))),frames:decodeBoundaryFrames(readBytes(state.unjoinedModel))},seatedProxyReference:{frames:decodeBoundaryFrames(readBytes(state.seatedProxy)),metadata},blueState:surface(blue),earthState:surface(earth),feEndpointSurfaces:state.surfaces.filter(s=>s.label==='feTerminal4'||s.kind==='FE5BODY').map(surface),pins:{initialFrames:state.files[state.unjoinedModel],seatedProxy:state.files[state.seatedProxy],materialProfiles:state.files[state.materialProfiles]}};
}
