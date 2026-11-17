// Original codec: MIT. Packed Prusa CAD derivatives retain their source terms.
export const SURFACE_PACK_FORMAT='PCADSUR1';
export function decodeSurfacePack(buffer,spec){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength!==spec.decodedBytes||buffer.byteLength<32)throw Error('Incomplete prepared CAD surface');
 if(new Uint8Array(new Uint16Array([1]).buffer)[0]!==1)throw Error('Prepared CAD surfaces require little-endian Float32');
 const bytes=new Uint8Array(buffer,0,8),view=new DataView(buffer);
 if(Array.from(bytes,c=>String.fromCharCode(c)).join('')!==SURFACE_PACK_FORMAT)throw Error('Invalid prepared CAD surface format');
 const vertices=view.getUint32(8,true),pBytes=view.getUint32(12,true),nBytes=view.getUint32(16,true);
 if(vertices!==spec.vertexCount||vertices%3||pBytes!==vertices*12||nBytes!==pBytes||32+pBytes+nBytes!==buffer.byteLength||view.getUint32(20,true)!==0||view.getUint32(24,true)!==0||view.getUint32(28,true)!==0)throw Error('Prepared CAD surface layout mismatch');
 const solidRanges=spec.cadSolidRanges.map(r=>({...r}));let first=0;
 for(const r of solidRanges){if(!Number.isInteger(r.triangles)||r.triangles<=0||r.firstTriangle!==first)throw Error('Invalid prepared CAD solid range');first+=r.triangles;}
 if(first*3!==vertices)throw Error('Prepared CAD solid ranges do not cover the surface');
 return {positions:new Float32Array(buffer,32,vertices*3),normals:new Float32Array(buffer,32+pBytes,vertices*3),solidRanges};
}
