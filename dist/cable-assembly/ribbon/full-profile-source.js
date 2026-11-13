import*as T from'three';
const vectorFrame=f=>Object.fromEntries(Object.entries(f).map(([k,v])=>[k,Array.isArray(v)?new T.Vector3().fromArray(v):v]));
const sameFrame=(a,b)=>a.distance===b.distance&&['centre','axis','normal','tangent'].every(k=>a[k].equals(b[k]));
export function createFullProfileSource(metadata,positions,normals){
 const count=metadata.rows.length;if(positions.length!==count*204||normals.length!==positions.length)throw Error('Full R11 material buffer layout differs');
 const frames=metadata.rows.map(r=>vectorFrame(r.frame)),stations=frames.map(f=>f.distance);for(let i=1;i<count;i++)if(!(stations[i]>stations[i-1]))throw Error('Material stations are not strictly increasing');
 for(const r of metadata.rows)for(const key of['u','w','t','du','dw','dt'])if(r.profile[key]?.length!==68)throw Error('Missing captured full3D profile '+key);
 function ring(index,frame){
  if(sameFrame(frame,frames[index]))return{xyz:positions.slice(index*204,(index+1)*204),n:normals.slice(index*204,(index+1)*204)};
  const p=metadata.rows[index].profile,xyz=new Float32Array(204),n=new Float32Array(204);
  for(let j=0;j<68;j++)for(let k=0;k<3;k++){const key=['x','y','z'][k];xyz[j*3+k]=(frame.centre[key]+frame.axis[key]*p.u[j]+frame.normal[key]*p.w[j]+frame.tangent[key]*p.t[j])*.001;n[j*3+k]=frame.axis[key]*p.du[j]+frame.normal[key]*p.dw[j]+frame.tangent[key]*p.dt[j];}
  return{xyz,n};
 }
 return{metadata,frames,stations,ring,
  render(stageFrames){if(stageFrames.length!==count)throw Error('Frame/material ring count differs');const position=new Float32Array(positions.length),normal=new Float32Array(normals.length);let copied=0;
   for(let i=0;i<count;i++){if(stageFrames[i].distance!==stations[i])throw Error('Expected the retained nonuniform material station at ring '+i);const r=ring(i,stageFrames[i]);position.set(r.xyz,i*204);normal.set(r.n,i*204);if(sameFrame(stageFrames[i],frames[i]))copied++;}
   return{positions:position,normals:normal,copiedRings:copied};
  }
 };
}
