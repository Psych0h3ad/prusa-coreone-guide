from pathlib import Path
import sys,json,struct,base64,hashlib
h=Path(__file__).resolve().parent;out=Path(sys.argv[1]) if len(sys.argv)>1 else h.parents[2]/'dist';out.mkdir(parents=True,exist_ok=True);fmt=json.loads((h/'format.json').read_text())
b=(h/'M2x8-source.stl').read_bytes();n=struct.unpack_from('<I',b,80)[0];assert len(b)==84+50*n
vertices={};positions=bytearray();indices=[]
for i in range(n):
 for k in range(3):
  v=b[84+50*i+12+12*k:84+50*i+24+12*k]
  if v not in vertices:vertices[v]=len(vertices);positions.extend(v)
  indices.append(vertices[v])
size='H'if len(vertices)<65536 else'I';ix=struct.pack('<'+size*len(indices),*indices)
data=dict(sourceSHA256=hashlib.sha256(b).hexdigest(),sourceTriangles=n,sourceVertices=len(vertices),indexType='Uint16Array'if size=='H'else'Uint32Array',positionsBase64=base64.b64encode(positions).decode(),indicesBase64=base64.b64encode(ix).decode())
for key,name,payload in [('M2_SOURCE','native-data',data),('SIDE_IR_PARAMETERS','parameters',json.loads((h/'parameters.json').read_text()))]:
 f=fmt[key];(out/('side-ir-service-'+name+'.js')).write_bytes((f['prefix']+json.dumps(payload,separators=(',',':'))+f['suffix']).encode())
