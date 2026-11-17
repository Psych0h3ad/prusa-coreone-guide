# SPDX-License-Identifier: MIT
"""Build an independently authored split safety-pin teaching model, in mm.

The official photographs establish its purpose, green colour and split ring
with squeeze tabs. Dimensions below fit the displayed 6 mm rail counterbore;
they are illustrative, not manufacturer measurements or a replacement part.
"""
from pathlib import Path
import argparse, hashlib, json
import numpy as np
from OCP.BRepPrimAPI import BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeBox
from OCP.BRepAlgoAPI import BRepAlgoAPI_Cut, BRepAlgoAPI_Fuse
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRep import BRep_Tool
from OCP.TopAbs import TopAbs_FACE, TopAbs_REVERSED, TopAbs_SOLID
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS
from OCP.TopLoc import TopLoc_Location
from OCP.gp import gp_Ax2, gp_Dir, gp_Pnt, gp_Vec

HERE=Path(__file__).resolve().parent
def build(out):
 axis=lambda y:gp_Ax2(gp_Pnt(0,y,0),gp_Dir(0,1,0))
 stem=BRepPrimAPI_MakeCylinder(axis(0),2.65,3.8).Shape()
 cap=BRepPrimAPI_MakeCylinder(axis(-1),3.3,1).Shape()
 body=BRepAlgoAPI_Fuse(stem,cap).Shape()
 body=BRepAlgoAPI_Cut(body,BRepPrimAPI_MakeCylinder(axis(-1.1),1.2,5.1).Shape()).Shape()
 body=BRepAlgoAPI_Cut(body,BRepPrimAPI_MakeBox(gp_Pnt(0,-1.1,-.45),5,5.1,.9).Shape()).Shape()
 for z in [-1.6,.6]:
  body=BRepAlgoAPI_Fuse(body,BRepPrimAPI_MakeBox(gp_Pnt(2.2,-1,z),2.6,1,1).Shape()).Shape()
 assert BRepCheck_Analyzer(body).IsValid()
 solids=TopExp_Explorer(body,TopAbs_SOLID);count=0
 while solids.More():count+=1;solids.Next()
 assert count==1,'Pin must be one ordinary solid'
 BRepMesh_IncrementalMesh(body,.008,False,.06,False).Perform()
 faces=TopExp_Explorer(body,TopAbs_FACE);P=[];N=[];surfaces=[]
 while faces.More():
  f=TopoDS.Face_s(faces.Current());loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(f,loc);surf=BRepAdaptor_Surface(f);rev=f.Orientation()==TopAbs_REVERSED
  assert tri is not None;start=len(P)
  for k in range(1,tri.NbTriangles()+1):
   ids=list(tri.Triangle(k).Get())
   if rev:ids[1],ids[2]=ids[2],ids[1]
   for i in ids:
    p=tri.Node(i).Transformed(loc.Transformation());uv=tri.UVNode(i);q=gp_Pnt();du=gp_Vec();dv=gp_Vec();surf.D1(uv.X(),uv.Y(),q,du,dv);n=du.Crossed(dv);assert n.Magnitude()>0;n.Normalize()
    if rev:n.Reverse()
    P.append([p.X(),p.Y(),p.Z()]);N.append([n.X(),n.Y(),n.Z()])
  surfaces.append({'first':start,'vertices':len(P)-start,'surface':str(surf.GetType())});faces.Next()
 p=np.asarray(P,dtype='<f4');n=np.asarray(N,dtype='<f4');data=p.tobytes()+n.tobytes();out.mkdir(parents=True,exist_ok=True)
 (out/'safety-pin.bin').write_bytes(data)
 meta={'vertices':len(p),'triangles':len(p)//3,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'layout':'Float32 positions XYZ then Float32 normals XYZ, mm','solids':count,'faces':surfaces,'boundsMM':[p.min(0).tolist(),p.max(0).tolist()],'qualification':'Independent functional teaching reference; dimensions illustrative, not OEM measurements or a replacement part.'}
 (out/'safety-pin.json').write_bytes((json.dumps(meta,indent=2)+'\n').encode());return meta
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path,default=HERE/'../../dist/assets/linear-rail');args=ap.parse_args();m=build(args.output);print(json.dumps({k:m[k]for k in ['vertices','triangles','bytes','sha256','solids','boundsMM']}))
