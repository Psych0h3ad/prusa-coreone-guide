from pathlib import Path
import json,hashlib,argparse
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TDocStd import TDocStd_Document
from OCP.TCollection import TCollection_ExtendedString
from OCP.XCAFDoc import XCAFDoc_DocumentTool
from OCP.TDF import TDF_LabelSequence,TDF_Label
from OCP.TDataStd import TDataStd_Name
from OCP.gp import gp_Trsf
from OCP.TopLoc import TopLoc_Location
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE,TopAbs_SOLID
from OCP.TopoDS import TopoDS
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
args=argparse.ArgumentParser();args.add_argument('--input',type=Path,required=True);args.add_argument('--output',type=Path,required=True);a=args.parse_args();S=a.input.resolve();D=a.output.resolve();D.mkdir(parents=True,exist_ok=True);assert hashlib.sha256(S.read_bytes()).hexdigest()=='2f46bccb098bd8dabc76aa13fd01b1e64c56370fa29ba8a6336f0305b8c86074','Retained source revision required'
doc=TDocStd_Document(TCollection_ExtendedString('local-source'));r=STEPCAFControl_Reader();r.SetNameMode(True);assert r.ReadFile(str(S));r.Transfer(doc);tool=XCAFDoc_DocumentTool.ShapeTool_s(doc.Main());roots=TDF_LabelSequence();tool.GetFreeShapes(roots);rows=[]
def name(l):
 a=TDataStd_Name();return a.Get().ToExtString() if l.FindAttribute(TDataStd_Name.GetID_s(),a) else ''
def walk(l,parent,path):
 loc=parent.Multiplied(tool.GetLocation_s(l).Transformation());ref=TDF_Label()
 if tool.IsReference_s(l):tool.GetReferredShape_s(l,ref)
 else:ref=l
 n=name(ref) or name(l)
 if 'zippy' in n.lower():
  shape=tool.GetShape_s(ref).Located(TopLoc_Location(loc));box=Bnd_Box();BRepBndLib.Add_s(shape,box);cs=[];e=TopExp_Explorer(shape,TopAbs_FACE)
  while e.More():
   a=BRepAdaptor_Surface(TopoDS.Face_s(e.Current()))
   if a.GetType()==GeomAbs_Cylinder:
    c=a.Cylinder();cs.append({'r':c.Radius(),'p':list(c.Location().Coord()),'a':list(c.Axis().Direction().Coord())})
   e.Next()
  solids=[];e=TopExp_Explorer(shape,TopAbs_SOLID)
  while e.More():
   s=e.Current();file=f'switch-{len(rows)}-{len(solids)}.stl';BRepMesh_IncrementalMesh(s,.03,False,.18,True).Perform();w=StlAPI_Writer();w.ASCIIMode=False;assert w.Write(s,str(D/file));solids.append({'file':file,'sha256':hashlib.sha256((D/file).read_bytes()).hexdigest()});e.Next()
  rows.append({'name':n,'path':path,'bounds':box.Get(),'cylinders':cs,'solids':solids});return
 cs=TDF_LabelSequence()
 if tool.GetComponents_s(ref,cs):
  for i in range(1,cs.Length()+1):walk(cs.Value(i),loc,path+[n])
for i in range(1,roots.Length()+1):walk(roots.Value(i),gp_Trsf(),[])
(D/'SOURCE.json').write_text(json.dumps({'source':S.name,'sha256':hashlib.sha256(S.read_bytes()).hexdigest(),'rows':rows},indent=2)+'\n',encoding='utf8');print([(x['name'],x['bounds'],len(x['solids'])) for x in rows])
