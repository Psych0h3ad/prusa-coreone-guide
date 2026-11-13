"""Original analytic housing mesh producer. Code MIT."""
from pathlib import Path
import importlib.util,json,hashlib,numpy as np
from OCP.BRepClass3d import BRepClass3d_SolidClassifier
from OCP.TopAbs import TopAbs_IN,TopAbs_ON
H=Path(__file__).resolve().parent
def build(output):
 spec=importlib.util.spec_from_file_location('authored_housing',H/'housing-body.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 O=Path(output);O.mkdir(parents=True,exist_ok=True);parts={}
 for pins in [2,3,4]:
  s=m.housing(pins);moving=m.MOVING[pins];fixed=[];elastic=[];ex=m.TopExp_Explorer(s,m.TopAbs_FACE);face=0
  while ex.More():
   f=m.TopoDS.Face_s(ex.Current());p,n,k=m.triangles(f);loc=m.TopLoc_Location();tri=m.BRep_Tool.Triangulation_s(f,loc);a=tri.Triangle(1).Get();uvs=[tri.UVNode(i)for i in a];u=sum(v.X()for v in uvs)/3;v=sum(v.Y()for v in uvs)/3;surf=m.BRepAdaptor_Surface(f);q=surf.Value(u,v);state=BRepClass3d_SolidClassifier(moving,q,1e-6).State();(elastic if state in[TopAbs_IN,TopAbs_ON]else fixed).append((p,n));face+=1;ex.Next()
  pp=[];nn=[];groups=[];at=0
  for role,arrays in [('fixed',fixed),('moving',elastic)]:
   p=np.concatenate([a[0]for a in arrays]);n=np.concatenate([a[1]for a in arrays]);pp.append(p);nn.append(n);groups.append({'start':at,'count':len(p),'role':role});at+=len(p)
  p=np.concatenate(pp);n=np.concatenate(nn);t=p.reshape(-1,3,3);cr=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);assert((cr*n.reshape(-1,3,3).mean(1)).sum(1)>0).all();data=p.tobytes()+n.tobytes();part=f'5025780{pins}00';(O/(part+'.bin')).write_bytes(data)
  parts[part]={'vertices':len(p),'groups':[{'start':0,'count':len(p),'material':'resin'}],'releaseSkinGroups':groups,'meshSha256':hashlib.sha256(data).hexdigest(),'wireEntryRow':[0,0,1.25],'insertionAxis':[0,1,0]}
 return parts
