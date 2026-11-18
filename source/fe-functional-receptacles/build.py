"""Original functional FE receptacle references. Code MIT; authored geometry CC-BY-SA4.0.

This producer reads parameters only. No STEP, supplier/model import or native mesh input.
Millimetres for ordinary BREP; metres for runtime typed buffers. No OEM SKU or force claim.
"""
from pathlib import Path
import json,math,hashlib,sys,argparse
import numpy as np
from OCP.gp import gp_Pnt,gp_Dir,gp_Ax2,gp_Circ,gp_Vec
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeEdge,BRepBuilderAPI_MakeWire,BRepBuilderAPI_MakeFace,BRepBuilderAPI_MakePolygon,BRepBuilderAPI_Sewing,BRepBuilderAPI_MakeSolid
from OCP.BRepPrimAPI import BRepPrimAPI_MakePrism,BRepPrimAPI_MakeBox
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse,BRepAlgoAPI_Cut
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.ShapeUpgrade import ShapeUpgrade_UnifySameDomain
from OCP.TopAbs import TopAbs_FACE,TopAbs_SOLID,TopAbs_REVERSED
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS
from OCP.BRepTools import BRepTools
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.TopLoc import TopLoc_Location
H=Path(__file__).resolve().parent;cli=argparse.ArgumentParser();cli.add_argument('--out',type=Path,default=H.parent/'candidate/dist/assets/fe-receptacles');cli.add_argument('--cad-out',type=Path,default=H.parent/'cad-private');args=cli.parse_args();params=json.loads((H/'parameters.json').read_bytes());O=args.out;O.mkdir(parents=True,exist_ok=True);D=args.cad_out;D.mkdir(parents=True,exist_ok=True);C=params['authoredCommon'];t=C['sheetMM']
def line(a,b):return BRepBuilderAPI_MakeEdge(gp_Pnt(*a),gp_Pnt(*b)).Edge()
def arc(x,y,z,r,a,b):return BRepBuilderAPI_MakeEdge(gp_Circ(gp_Ax2(gp_Pnt(x,y,z),gp_Dir(0,0,1)),r),a,b).Edge()
def capsule(a,r,z):
 if a==0:return BRepBuilderAPI_MakeWire(BRepBuilderAPI_MakeEdge(gp_Circ(gp_Ax2(gp_Pnt(0,0,z),gp_Dir(0,0,1)),r)).Edge()).Wire()
 w=BRepBuilderAPI_MakeWire();w.Add(line((-a,-r,z),(a,-r,z)));w.Add(arc(a,0,z,r,-math.pi/2,math.pi/2));w.Add(line((a,r,z),(-a,r,z)));w.Add(arc(-a,0,z,r,math.pi/2,3*math.pi/2));return w.Wire()
def rounded(y,w,h,r,z):
 x0,x1=-w/2,w/2;y0,y1=y-h/2,y+h/2;wire=BRepBuilderAPI_MakeWire()
 for edge in [line((x0+r,y0,z),(x1-r,y0,z)),arc(x1-r,y0+r,z,r,-math.pi/2,0),line((x1,y0+r,z),(x1,y1-r,z)),arc(x1-r,y1-r,z,r,0,math.pi/2),line((x1-r,y1,z),(x0+r,y1,z)),arc(x0+r,y1-r,z,r,math.pi/2,math.pi),line((x0,y1-r,z),(x0,y0+r,z)),arc(x0+r,y0+r,z,r,math.pi,3*math.pi/2)]:wire.Add(edge)
 return wire.Wire()
def shell_prism(outer,inner,dz):
 f=BRepBuilderAPI_MakeFace(outer);f.Add(TopoDS.Wire_s(inner.Reversed()));return BRepPrimAPI_MakePrism(f.Face(),gp_Vec(0,0,dz)).Shape()
def subtract(a,b):
 q=BRepAlgoAPI_Cut(a,b);q.Build();assert q.IsDone();return q.Shape()
def fuse(a,b):
 q=BRepAlgoAPI_Fuse(a,b);q.Build();assert q.IsDone();return q.Shape()
def neck(w0,lo0,hi0,z0,w1,lo1,hi1,z1):
 pts=[(-w0/2,lo0,z0),(w0/2,lo0,z0),(w0/2,hi0,z0),(-w0/2,hi0,z0),(-w1/2,lo1,z1),(w1/2,lo1,z1),(w1/2,hi1,z1),(-w1/2,hi1,z1)]
 sew=BRepBuilderAPI_Sewing()
 for ids in [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]:
  p=BRepBuilderAPI_MakePolygon()
  for i in ids:p.Add(gp_Pnt(*pts[i]))
  p.Close();sew.Add(BRepBuilderAPI_MakeFace(p.Wire()).Face())
 sew.Perform();return BRepBuilderAPI_MakeSolid(TopoDS.Shell_s(sew.SewedShape())).Solid()
def counts(shape,kind):
 e=TopExp_Explorer(shape,kind);n=0
 while e.More():n+=1;e.Next()
 return n
def build(key,p):
 ri=p['crimpInnerRadiusMM'];ro=ri+t;a=p['crimpHalfStraightMM'];y=p['socketCentreYMM'];L=p['wireToTabMouthZMM'];wi=C['socketInnerWidthMM'];hi=C['socketInnerHeightMM'];r=C['socketInnerCornerMM'];start=L-C['socketLengthMM']
 body=neck(p['neckRootWidthMM'],-ro,-ri,C['neckFromZMM'],wi+2*t,y-hi/2-t,y-hi/2,start+C['neckSocketOverlapMM'])
 for z0,z1 in C['crimpBandsMM']:
  collar=shell_prism(capsule(a,ro,z0),capsule(a,ri,z0),z1-z0)
  # Authored formed-crimp seam is a declared structural feature, not a masked mesh face.
  seam=BRepPrimAPI_MakeBox(gp_Pnt(-C['crimpSeamMM']/2,ri,z0-.1),C['crimpSeamMM'],ro-ri+1,z1-z0+.2).Shape();collar=subtract(collar,seam);body=fuse(body,collar)
 socket=shell_prism(rounded(y,wi+2*t,hi+2*t,r+t,start),rounded(y,wi,hi,r,start),C['socketLengthMM'])
 opening=BRepPrimAPI_MakeBox(gp_Pnt(-C['socketUpperOpeningMM']/2,y+hi/2,start-.1),C['socketUpperOpeningMM'],t+1,C['socketLengthMM']+.2).Shape();socket=subtract(socket,opening);body=fuse(body,socket)
 u=ShapeUpgrade_UnifySameDomain(body,True,True,True);u.Build();body=u.Shape();assert BRepCheck_Analyzer(body).IsValid(),key
 assert counts(body,TopAbs_SOLID)==1,(key,'solid count',counts(body,TopAbs_SOLID));prop=GProp_GProps();BRepGProp.VolumeProperties_s(body,prop);assert prop.Mass()>0
 BRepTools.Write_s(body,str(D/(key+'.brep')));BRepMesh_IncrementalMesh(body,.004,False,.08,True).Perform()
 P=[];N=[];I=[];faceRows=[];types={};e=TopExp_Explorer(body,TopAbs_FACE)
 while e.More():
  f=TopoDS.Face_s(e.Current());loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(f,loc);assert tri and tri.HasUVNodes();s=BRepAdaptor_Surface(f);typ=str(s.GetType()).split('.')[-1];types[typ]=types.get(typ,0)+1;offset=len(P);reverse=f.Orientation()==TopAbs_REVERSED
  for i in range(1,tri.NbNodes()+1):
   q=tri.Node(i).Transformed(loc.Transformation());uv=tri.UVNode(i);point=gp_Pnt();du=gp_Vec();dv=gp_Vec();s.D1(uv.X(),uv.Y(),point,du,dv);n=du.Crossed(dv);n.Normalize()
   if reverse:n.Reverse()
   P.append([q.X(),q.Y(),q.Z()]);N.append([n.X(),n.Y(),n.Z()])
  for i in range(1,tri.NbTriangles()+1):
   aa,bb,cc=tri.Triangle(i).Get()
   if reverse:bb,cc=cc,bb
   I.append([offset+aa-1,offset+bb-1,offset+cc-1])
  faceRows.append({'surface':typ,'triangles':tri.NbTriangles(),'vertices':tri.NbNodes()});e.Next()
 P=np.array(P);N=np.array(N);I=np.array(I,dtype='<u4');np.save(D/(key+'-positionMM.npy'),P);np.save(D/(key+'-normal.npy'),N);np.save(D/(key+'-index.npy'),I)
 files={}
 for name,value in [('position',(P*.001).astype('<f4')),('normal',N.astype('<f4')),('index',I)]:
  b=value.tobytes();path=key+'-'+name+'.bin';(O/path).write_bytes(b);files[name]={'path':path,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'dtype':str(value.dtype),'count':int(value.size)}
 return {'profile':key,'ordinarySolidCount':1,'valid':True,'brepFaces':counts(body,TopAbs_FACE),'surfaceTypes':types,'volumeMM3':prop.Mass(),'vertices':len(P),'triangles':len(I),'boundsMM':[P.min(0).tolist(),P.max(0).tolist()],'buffers':files,'faces':faceRows,'wirePortsMM':[[x,0,0]for x in p['wirePortOffsetsXMM']],'wireEntryPortsMM':[[x,0,C['crimpBandsMM'][0][0]]for x in p['wirePortOffsetsXMM']],'tabMouthMM':[0,y,L],'tabToward':[0,0,1],'wireAway':[0,0,-1]}
models=[build(key,p)for key,p in params['profiles'].items()];result={'status':'AUTHORED_ANALYTIC_FUNCTIONAL_REFERENCE_SHAPES','source':'parameters.json + original analytic OCP primitive code only; frames.json provides independent native datum scalars','sourceDigests':{n:hashlib.sha256((H/n).read_bytes()).hexdigest()for n in ['build.py','parameters.json','frames.json']},'units':{'BREP':'mm','runtime':'m'},'models':models,'noSupplierCADInputs':True,'noOEMSKUClaim':True,'runtimeInstances':{'FE1':'single','FE3':'dual','FE5':'single'}}
(O/'frames.json').write_bytes((H/'frames.json').read_bytes())
(O/'manifest.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps({k:v for k,v in result.items()if k!='models'}));print(json.dumps([{'profile':m['profile'],'faces':m['brepFaces'],'types':m['surfaceTypes'],'volume':m['volumeMM3'],'triangles':m['triangles']}for m in models]))
