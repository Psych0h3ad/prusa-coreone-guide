from pathlib import Path
import json,math,hashlib
import numpy as np
from OCP.gp import gp_Pnt,gp_Dir,gp_Ax2,gp_Circ,gp_Vec
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeEdge,BRepBuilderAPI_MakeWire,BRepBuilderAPI_MakeFace,BRepBuilderAPI_MakePolygon
from OCP.BRepPrimAPI import BRepPrimAPI_MakePrism
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.ShapeUpgrade import ShapeUpgrade_UnifySameDomain
from OCP.TopAbs import TopAbs_FACE,TopAbs_SOLID,TopAbs_REVERSED
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS
from OCP.BRep import BRep_Tool
from OCP.BRepTools import BRepTools
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.TopLoc import TopLoc_Location

H=Path(__file__).resolve().parent;out=H/'ring407';out.mkdir(exist_ok=True)
cx=-134.199394;cy=167.2;z0=18.645974;plateY=165.571722;eyeZ=33.645974
def edge(a,b):return BRepBuilderAPI_MakeEdge(gp_Pnt(*a),gp_Pnt(*b)).Edge()
def capsule(radius):
 a=1.45;r=radius;w=BRepBuilderAPI_MakeWire()
 w.Add(edge((cx-a,cy-r,z0),(cx+a,cy-r,z0)))
 w.Add(BRepBuilderAPI_MakeEdge(gp_Circ(gp_Ax2(gp_Pnt(cx+a,cy,z0),gp_Dir(0,0,1)),r),-math.pi/2,math.pi/2).Edge())
 w.Add(edge((cx+a,cy+r,z0),(cx-a,cy+r,z0)))
 w.Add(BRepBuilderAPI_MakeEdge(gp_Circ(gp_Ax2(gp_Pnt(cx-a,cy,z0),gp_Dir(0,0,1)),r),math.pi/2,3*math.pi/2).Edge())
 return w.Wire()
f=BRepBuilderAPI_MakeFace(capsule(1.75));f.Add(TopoDS.Wire_s(capsule(1.25).Reversed()))
barrel=BRepPrimAPI_MakePrism(f.Face(),gp_Vec(0,0,7)).Shape()
axis=gp_Ax2(gp_Pnt(cx,plateY,eyeZ),gp_Dir(0,1,0),gp_Dir(1,0,0))
circle=lambda radius:BRepBuilderAPI_MakeWire(BRepBuilderAPI_MakeEdge(gp_Circ(axis,radius)).Edge()).Wire()
f=BRepBuilderAPI_MakeFace(circle(3.7));f.Add(TopoDS.Wire_s(circle(1.7).Reversed()))
eye=BRepPrimAPI_MakePrism(f.Face(),gp_Vec(0,.5,0)).Shape()
w=BRepBuilderAPI_MakePolygon()
for x,z in [(-1.9,2.9),(1.9,2.9),(1.35,8.2),(-1.35,8.2)]:w.Add(gp_Pnt(cx+x,plateY,eyeZ-z))
w.Close();neck=BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(0,.5,0)).Shape()
shape=BRepAlgoAPI_Fuse(BRepAlgoAPI_Fuse(eye,neck).Shape(),barrel).Shape()
u=ShapeUpgrade_UnifySameDomain(shape,True,True,True);u.Build();shape=u.Shape()
assert BRepCheck_Analyzer(shape).IsValid()
def count(kind):
 e=TopExp_Explorer(shape,kind);n=0
 while e.More():n+=1;e.Next()
 return n
assert count(TopAbs_SOLID)==1
props=GProp_GProps();BRepGProp.VolumeProperties_s(shape,props);assert props.Mass()>0
BRepTools.Write_s(shape,str(out/'fe4-reference.brep'))
BRepMesh_IncrementalMesh(shape,.008,False,.10,True).Perform()
P=[];N=[];I=[];types={};faces=[];ex=TopExp_Explorer(shape,TopAbs_FACE)
while ex.More():
 face=TopoDS.Face_s(ex.Current());loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(face,loc);surf=BRepAdaptor_Surface(face);typ=str(surf.GetType()).split('.')[-1];types[typ]=types.get(typ,0)+1;offset=len(P);reverse=face.Orientation()==TopAbs_REVERSED
 assert tri is not None and tri.HasUVNodes()
 for k in range(1,tri.NbNodes()+1):
  p=tri.Node(k).Transformed(loc.Transformation());uv=tri.UVNode(k);s=gp_Pnt();du=gp_Vec();dv=gp_Vec();surf.D1(uv.X(),uv.Y(),s,du,dv);n=du.Crossed(dv);n.Normalize()
  if reverse:n.Reverse()
  P.append([p.X(),p.Y(),p.Z()]);N.append([n.X(),n.Y(),n.Z()])
 for k in range(1,tri.NbTriangles()+1):
  a,b,c=tri.Triangle(k).Get()
  if reverse:b,c=c,b
  I.append([offset+a-1,offset+b-1,offset+c-1])
 faces.append({'surfaceType':typ,'vertices':tri.NbNodes(),'triangles':tri.NbTriangles(),'reversed':reverse});ex.Next()
P=np.array(P,dtype=np.float64);N=np.array(N,dtype=np.float64);I=np.array(I,dtype=np.uint32)
np.save(out/'positionMM.npy',P);np.save(out/'normal.npy',N);np.save(out/'index.npy',I)
def blob(name,a):
 b=a.tobytes();(out/name).write_bytes(b);return {'path':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
buffers={'position':blob('position.bin',((P-[cx,cy,z0])*.001).astype('<f4')),'normal':blob('normal.bin',N.astype('<f4')),'index':blob('index.bin',I.astype('<u4'))}
result={'status':'VALID_ANALYTIC_SINGLE_SOLID_REFERENCE','units':'mm','nativeBRepFaces':count(TopAbs_FACE),'surfaceTypes':types,'volumeMM3':props.Mass(),'boundsMM':[P.min(0).tolist(),P.max(0).tolist()],'vertices':len(P),'triangles':len(I),'faces':faces,'buffers':buffers,'outletsMM':[[cx-1.25,cy,z0],[cx+1.25,cy,z0]],'dimensions':{'eyeOuterRadiusMM':3.7,'eyeHoleRadiusMM':1.7,'plateThicknessMM':.5,'barrelHalfStraightMM':1.45,'barrelOuterRadiusMM':1.75,'barrelInnerRadiusMM':1.25,'barrelLengthMM':7},'qualification':'Independent analytic reconstruction of existing authored reference model, not a supplier part or OEM measurement. Complete two-wire barrel and one metal union; no source triangles wrapped as CAD faces. Fullmesh agreement and source/UI integration pending.'}
result['geometryLocalFrame']={'originMM':[cx,cy,z0],'axes':'CAD X/Y/Z; local positions in metres','aperturePlaneLocalZ':0,'outletsLocalM':[[-.00125,0,0],[.00125,0,0]]}
(out/'MODEL407.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items()if k in ['status','nativeBRepFaces','surfaceTypes','volumeMM3','vertices','triangles','boundsMM']}))
