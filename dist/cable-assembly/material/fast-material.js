// Preserve the captured material and Float32 arithmetic. Write directly into
// persistent buffers instead of allocating two new arrays for every ring.
export function createFastMaterialRenderer(source){
 const metadata=source.metadata,count=metadata.rows.length,reference=source.frames,stations=source.stations;
 const canonical=source.render(reference),size=canonical.positions.length;
 if(reference.length!==count||size!==count*204||canonical.normals.length!==size)throw Error('Unexpected R11 material layout');
 const profiles=metadata.rows.map(r=>Object.fromEntries(['u','w','t','du','dw','dt'].map(k=>{if(r.profile[k].length!==68)throw Error('Incomplete actual material profile');return[k,Float64Array.from(r.profile[k])];}))),positionRings=[],normalRings=[];
 for(let i=0;i<count;i++){positionRings.push(canonical.positions.subarray(i*204,(i+1)*204));normalRings.push(canonical.normals.subarray(i*204,(i+1)*204));}
 const same=(a,b)=>a.distance===b.distance&&a.centre.equals(b.centre)&&a.axis.equals(b.axis)&&a.normal.equals(b.normal)&&a.tangent.equals(b.tangent);
 function renderInto(frames,position,normal){
  if(frames.length!==count||!(position instanceof Float32Array)||!(normal instanceof Float32Array)||position.length!==size||normal.length!==size)throw Error('Material/output layout differs');
  let copied=0;
  for(let i=0;i<count;i++){
   const f=frames[i];if(f.distance!==stations[i])throw Error('Nonuniform material station differs at ring '+i);
   const offset=i*204;
   if(same(f,reference[i])){position.set(positionRings[i],offset);normal.set(normalRings[i],offset);copied++;continue;}
   const p=profiles[i],cx=f.centre.x,cy=f.centre.y,cz=f.centre.z,ax=f.axis.x,ay=f.axis.y,az=f.axis.z,nx=f.normal.x,ny=f.normal.y,nz=f.normal.z,tx=f.tangent.x,ty=f.tangent.y,tz=f.tangent.z;
   for(let j=0;j<68;j++){
    const u=p.u[j],w=p.w[j],t=p.t[j],du=p.du[j],dw=p.dw[j],dt=p.dt[j],k=offset+j*3;
    position[k]=(cx+ax*u+nx*w+tx*t)*.001;position[k+1]=(cy+ay*u+ny*w+ty*t)*.001;position[k+2]=(cz+az*u+nz*w+tz*t)*.001;
    normal[k]=ax*du+nx*dw+tx*dt;normal[k+1]=ay*du+ny*dw+ty*dt;normal[k+2]=az*du+nz*dw+tz*dt;
   }
  }
  return{positions:position,normals:normal,copiedRings:copied};
 }
 return{renderInto,render(frames){return renderInto(frames,new Float32Array(size),new Float32Array(size));},bufferLength:size,
  scope:'Only storage/write path changes. Original same-frame copies, nonuniform stations, full u/w/t/du/dw/dt profiles and floating-point operation order are retained.'};
}
