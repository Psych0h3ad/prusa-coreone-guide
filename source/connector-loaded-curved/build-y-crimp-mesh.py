"""Y-only contact mesh from unchanged original analytic terminal preferred source.

The nominal cylinders and BREP stock are unchanged. A bore is a VOID boundary:
an inscribed chord intrudes into its nominal wire cylinder. This exporter uses
the circumscribed radial polygon sec(max angular facet span/2), without contact
predicate tolerances or dropping any face. Boundary duplicates on end caps/web
receive the identical coordinate. Not an OEM finished crimp or force model.
"""
from pathlib import Path
import json,hashlib,importlib.util,sys,math,tempfile,argparse,collections
import numpy as np
sys.dont_write_bytecode=True
H=Path(__file__).resolve().parent;parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);args=parser.parse_args();O=args.output.resolve();O.mkdir(parents=True,exist_ok=True)
def load(n,p):
 s=importlib.util.spec_from_file_location(n,H/p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
m=load('original_terminal399','loaded-terminal.py');builder=load('export_original399','build.py');sha=lambda b:hashlib.sha256(b).hexdigest()
with tempfile.TemporaryDirectory() as tmp:
 info=builder.export(m.fixed_terminal_frame(),'terminal-frame',Path(tmp));data=(Path(tmp)/'terminal-frame.bin').read_bytes()
assert sha(data)=='f652cf52eea42646b9999501106bac9e8cfdd1382f40bc9ff942570fbc0fea0e','Full analytic producer must reproduce the pinned old frame bytes before repair'
p=np.frombuffer(data,dtype='<f4')[:info['vertices']*3].reshape(-1,3).copy();n=np.frombuffer(data,dtype='<f4')[info['vertices']*3:].reshape(-1,3).copy();original=p.copy();records=[];targets={}
# Analytic face identity comes from the unchanged90-face preferred feature tree,
# independently inspected by inspect-crimp.py. No collision witness is a cutter.
for radius,faceids in [(m.A['conductorRadius'],[5,9]),(m.A['insulationRadius'],[54,55])]:
 ids=np.concatenate([np.arange(f['firstVertex'],f['firstVertex']+f['count']) for f in info['faceVertexMap']if f['sourceAnalyticFace']in faceids]);tri=p[ids].reshape(-1,3,3).astype(float);angles=np.arctan2(tri[:,:,0],tri[:,:,2]-m.A['wireCenterZ']);spans=[]
 for t in angles:
  spans.append(max(abs(math.remainder(float(a-b),2*math.pi))for a in t for b in t))
 delta=max(spans);factor=1/math.cos(delta/2);assert 0<delta<math.pi/2
 for i in ids:
  q=original[i].astype(float);key=original[i].tobytes();rad=q[[0,2]]-np.array([0,m.A['wireCenterZ']]);q[[0,2]]=np.array([0,m.A['wireCenterZ']])+rad*factor;targets[key]=q.astype('<f4')
 records.append({'nominalRadiusMM':radius,'analyticFaceIds':faceids,'maximumFacetAngularSpanRadians':delta,'circumscribedRadialFactor':factor,'nominalRadialMeshOffsetMM':radius*(factor-1),'nominalCylinderAndBREPChanged':False})
patch=[]
for i,q in enumerate(original):
 if q.tobytes()in targets:
  p[i]=targets[q.tobytes()];patch.append([i,*map(float,q),*map(float,p[i])])
cross=np.cross(p.reshape(-1,3,3)[:,1]-p.reshape(-1,3,3)[:,0],p.reshape(-1,3,3)[:,2]-p.reshape(-1,3,3)[:,0]);dots=np.einsum('ij,ij->i',cross,n.reshape(-1,3,3).mean(1));assert (dots>0).all();assert np.isfinite(p).all()
groups=collections.defaultdict(list)
for i,x,y,z,a,b,c in patch:groups[(x,y,z,a,b,c)].append(i)
meta=info;specs=[]
for radius,faceids in[(.22,[5,9]),(.52,[54,55])]:
 ids=np.concatenate([np.arange(f['firstVertex'],f['firstVertex']+f['count'])for f in meta['faceVertexMap']if f['sourceAnalyticFace']in faceids]);points=set(original[i].tobytes()for i in ids);allids=[i for i,q in enumerate(original)if q.tobytes()in points];planes={}
 for triangle in ids.reshape(-1,3):
  radial={tuple(float(original[i,k])for k in[0,2]):int(i)for i in triangle};assert len(radial)==2;a,b=sorted(radial);planes.setdefault((a,b),[radial[a],radial[b]])
 specs.append({'nominalRadiusMM':radius,'analyticFaceIds':faceids,'indices':allids,'planes':list(planes.values())})
compact=[[list(k),v]for k,v in groups.items()];text='// Generated original Y bore reference: MIT code / CC-BY-SA4.0 geometry.\nconst edits='+json.dumps(compact,separators=(',',':'))+';\nconst boreSpecs='+json.dumps(specs,separators=(',',':'))+';\nconst cache=new WeakMap();\nexport function yCrimpFrame(frame){let out=cache.get(frame);if(out)return out;if(frame.positions.length!==44172||frame.meshSha256!=="f652cf52eea42646b9999501106bac9e8cfdd1382f40bc9ff942570fbc0fea0e")throw Error("Unexpected original terminal frame");const positions=frame.positions.slice();for(const [[x,y,z,a,b,c],ids]of edits)for(const i of ids){if(positions[i*3]!==x||positions[i*3+1]!==y||positions[i*3+2]!==z)throw Error("Original Y crimp tuple changed");positions.set([a,b,c],i*3);}out={...frame,positions};cache.set(frame,out);return out;}\n'+(H/'runtime/y-crimp-rounding.js').read_text()
(O/'loaded-y-crimp-frame.js').write_text(text,encoding='utf-8',newline='\n')
report={'originalFrameSHA256':sha(data),'vertices':len(p),'triangles':len(p)//3,'facesOmitted':0,'normalsUnchanged':True,'changedVerticesIncludingSharedCapWebDuplicates':len(patch),'maximumVertexChangeMM':float(np.linalg.norm(p-original,axis=1).max()),'allWindingPositive':True,'boreRules':records,'patchSourceSHA256':sha(text.encode()),'noOEMFitOrCrimpForceClaim':True,'method':'Circumscribed bore-boundary tessellation of the exact unchanged original analytic solid; same full face/triangle stock, no wire change, no collision epsilon.'}
(O/'CRIMP-MESH.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
