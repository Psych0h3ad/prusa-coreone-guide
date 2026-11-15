"""Generate complete independently authored reference solids/buffers. No source CAD input."""
from pathlib import Path
import argparse,importlib.util,json,hashlib,sys
sys.dont_write_bytecode=True
import numpy as np
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Tool,BRep_Builder
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepClass3d import BRepClass3d_SolidClassifier
from OCP.BRepTools import BRepTools
from OCP.TopAbs import TopAbs_FACE,TopAbs_REVERSED,TopAbs_IN,TopAbs_ON
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS,TopoDS_Shape
from OCP.TopLoc import TopLoc_Location
H=Path(__file__).resolve().parent;spec=importlib.util.spec_from_file_location('original_functional_reference',H/'functional-model.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def export(shape,name,out,moving=None):
 m.assert_solid(shape);brep=out/(name+'.brep');assert BRepTools.Write_s(shape,str(brep));r=TopoDS_Shape();assert BRepTools.Read_s(r,str(brep),BRep_Builder());m.assert_solid(r)
 mesher=BRepMesh_IncrementalMesh(shape,.006,False,.06,False);mesher.Perform();fixed=[];elastic=[];faceMap=[];ex=TopExp_Explorer(shape,TopAbs_FACE);ordinal=0;types={}
 classifier=BRepClass3d_SolidClassifier()
 if moving is not None:classifier.Load(moving)
 while ex.More():
  face=TopoDS.Face_s(ex.Current());loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(face,loc)
  if tri is None:
   retry=BRepMesh_IncrementalMesh(face,.012,False,.10,False);retry.Perform();tri=BRep_Tool.Triangulation_s(face,loc)
  if tri is None:raise RuntimeError('Complete face triangulation required before payload: '+name+'/'+str(ordinal))
  surf=BRepAdaptor_Surface(face);kind=str(surf.GetType()).split('.')[-1];types[kind]=types.get(kind,0)+1;role='fixed';pp=[];nn=[]
  if moving is not None:
   ids=tri.Triangle(1).Get();uv=[tri.UVNode(i) for i in ids];q=surf.Value(sum(x.X() for x in uv)/3,sum(x.Y() for x in uv)/3);classifier.Perform(q,1e-8)
   if classifier.State() in [TopAbs_IN,TopAbs_ON]:role='moving'
  reverse=face.Orientation()==TopAbs_REVERSED
  for j in range(1,tri.NbTriangles()+1):
   ids=list(tri.Triangle(j).Get())
   if reverse:ids[1],ids[2]=ids[2],ids[1]
   for i in ids:
    p=tri.Node(i).Transformed(loc.Transformation());uv=tri.UVNode(i);q=m.terminalProfiles.gp_Pnt();du=m.terminalProfiles.gp_Vec();dv=m.terminalProfiles.gp_Vec();surf.D1(uv.X(),uv.Y(),q,du,dv);n=du.Crossed(dv);assert n.Magnitude()>0;n.Normalize()
    if reverse:n.Reverse()
    pp.append([p.X(),p.Y(),p.Z()]);nn.append([n.X(),n.Y(),n.Z()])
  (elastic if role=='moving' else fixed).append((np.array(pp,dtype='<f4'),np.array(nn,dtype='<f4'),ordinal));ordinal+=1;ex.Next()
 pos=[];norm=[];groups=[];at=0
 for role,part in [('fixed',fixed),('moving',elastic)]:
  start=at
  for p,n,faceOrdinal in part:pos.append(p);norm.append(n);faceMap.append({'sourceAnalyticFace':faceOrdinal,'firstVertex':at,'count':len(p),'role':role});at+=len(p)
  if at>start:groups.append({'start':start,'count':at-start,'role':role})
 p=np.concatenate(pos);n=np.concatenate(norm);assert np.isfinite(p).all() and np.isfinite(n).all();t=p.reshape(-1,3,3).astype(float);cross=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);dots=np.einsum('ij,ij->i',cross,n.reshape(-1,3,3).mean(1));assert (dots>0).all(),('Non-positive triangle orientation',name,float(dots.min()))
 data=p.tobytes()+n.tobytes();(out/(name+'.bin')).write_bytes(data)
 return{'file':name+'.bin','brep':name+'.brep','vertices':len(p),'groups':[{'start':0,'count':len(p),'material':'resin' if moving is not None else'tin-plated-copper-alloy'}],'releaseSkinGroups':groups if moving is not None else None,'meshSha256':hashlib.sha256(data).hexdigest(),'sourceFacesCopied':0,'manufacturerCAD':False,'manufacturerMeshCopied':False,'sourceKind':'independently-authored-functional-reference','geometryOrigin':'independently-authored-analytic','analyticFaces':ordinal,'surfaceTypes':types,'solids':1,'valid':True,'facesOmitted':0,'faceVertexMap':faceMap,'qualification':'Model-functional reference with source-CAD numeric exterior measurements and explicitly inferred internal passages/retention. Not OEM exact or specimen metrology.'}
def main():
 a=argparse.ArgumentParser();a.add_argument('--output',type=Path,required=True);args=a.parse_args();out=args.output.resolve();out.mkdir(parents=True,exist_ok=True);assert not(out/'manifest.json').exists();assets={}
 for pins in [2,3,4]:
  shape,moving=m.housing(pins);name=f'functional-housing-{pins}';assets[name]=export(shape,name,out,moving);print(json.dumps({'asset':name,'faces':assets[name]['analyticFaces'],'vertices':assets[name]['vertices']}),flush=True)
 for name,angle in [('functional-terminal',0),('functional-terminal-depressed',m.P['terminal']['maximumDepressionRadians'])]:assets[name]=export(m.terminal(angle),name,out);print(json.dumps({'asset':name,'faces':assets[name]['analyticFaces'],'vertices':assets[name]['vertices']}),flush=True)
 result={'units':'mm','geometrySource':'Original analytic feature tree and local functional/scalar JSON only; supplier CAD is not a build input.','modelSeatingDatumYMM':m.P['terminal']['seatYMM'],'modelSeatingQualification':'Independent functional reference datum verified by model-fit tests, not measured OEM/specimen seating datum.','assets':assets,'physicalSpecimenFitClaim':False}
 (out/'manifest.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':main()
