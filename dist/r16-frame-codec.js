export async function decodeFrameTable(packed,metadata){
 const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0)),buffer=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer(),view=new DataView(buffer);
 if(view.getUint32(0,true)!==0x31464248||view.getUint32(4,true)!==metadata.keys.length||view.getUint32(8,true)!==metadata.rows)throw Error('Invalid bed material frame table');
 const n=metadata.keys.length*metadata.rows,offset=16+metadata.keys.length*8;
 if(buffer.byteLength!==offset+n*3*4+n*4*2)throw Error('Incomplete bed frame table');
 return {...metadata,centres:new Float32Array(buffer,offset,n*3),rotations:new Int16Array(buffer,offset+n*3*4,n*4)};
}
