# SPDX-License-Identifier: MIT
# Copyright (c) 2026 CORE One Community Guide contributors.
"""Editable analytic LCD connector reference models. Parameters are in millimetres; GLB vertices are in metres."""
from pathlib import Path
import argparse,json,math,hashlib,struct,collections
import numpy as np
from OCP.gp import gp_Pnt,gp_Vec,gp_Dir,gp_Ax2
from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox,BRepPrimAPI_MakePrism,BRepPrimAPI_MakeCylinder
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakePolygon,BRepBuilderAPI_MakeFace
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse,BRepAlgoAPI_Cut
from OCP.BRepFilletAPI import BRepFilletAPI_MakeFillet
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Builder,BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface,BRepAdaptor_Curve
from OCP.TopoDS import TopoDS,TopoDS_Compound
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE,TopAbs_EDGE,TopAbs_SOLID,TopAbs_REVERSED
from OCP.TopLoc import TopLoc_Location
from OCP.TopTools import TopTools_IndexedMapOfShape,TopTools_ListOfShape
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
H=Path(__file__).resolve().parent;P=json.loads((H/'parameters.json').read_text());pub=P['published'];reg=P['consumerRegistration'];q=P['inferredEditable'];MODELS=PACKET=None
def shapes(s,kind):
 e=TopExp_Explorer(s,kind)
 while e.More():yield e.Current();e.Next()
def box(x0,x1,y0,y1,z0,z1):
 assert min(x1-x0,y1-y0,z1-z0)>0
 return BRepPrimAPI_MakeBox(gp_Pnt(x0,y0,z0),x1-x0,y1-y0,z1-z0).Shape()
def compound(items):
 b=BRep_Builder();c=TopoDS_Compound();b.MakeCompound(c)
 for s in items:b.Add(c,s)
 return c
def boolean(a,b,fuse=False):
 op=(BRepAlgoAPI_Fuse if fuse else BRepAlgoAPI_Cut)(a,b);op.Build();assert op.IsDone();return op.Shape()
def combine(items):
 a=items[0]
 for b in items[1:]:a=boolean(a,b,True)
 return a
def cut_many(a,items):
 if not items:return a
 arguments=TopTools_ListOfShape();arguments.Append(a);tools=TopTools_ListOfShape()
 for t in items:tools.Append(t)
 # Explicit tools let the Boolean builder resolve overlaps between cuts.
 # A self-intersecting compound operand had retained unintended plastic.
 op=BRepAlgoAPI_Cut();op.SetArguments(arguments);op.SetTools(tools);op.Build();assert op.IsDone();result=op.Shape();assert BRepCheck_Analyzer(result).IsValid();return result
def prism(points,axis,offset,width):
 w=BRepBuilderAPI_MakePolygon()
 for a,b in points:w.Add(gp_Pnt(*([offset,a,b]if axis==0 else[a,offset,b]if axis==1 else[a,b,offset])))
 w.Close();v=[0,0,0];v[axis]=width;return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(*v)).Shape()
def rounded_box(s,r):
 op=BRepFilletAPI_MakeFillet(s);n=0
 for f in shapes(s,TopAbs_EDGE):
  e=TopoDS.Edge_s(f);c=BRepAdaptor_Curve(e);a=c.Value(c.FirstParameter());b=c.Value(c.LastParameter())
  if abs(a.X()-b.X())+abs(a.Y()-b.Y())<1e-8 and abs(a.Z()-b.Z())>.1:op.Add(r,e);n+=1
 if n:
  op.Build()
  if op.IsDone()and BRepCheck_Analyzer(op.Shape()).IsValid():return op.Shape()
 return s
def stamped(points,x,width):
 s=prism(points,0,x-width/2,width);op=BRepFilletAPI_MakeFillet(s);count=0
 for f in shapes(s,TopAbs_EDGE):
  e=TopoDS.Edge_s(f);c=BRepAdaptor_Curve(e);a=c.Value(c.FirstParameter());b=c.Value(c.LastParameter())
  if abs(a.Y()-b.Y())+abs(a.Z()-b.Z())<1e-8 and abs(a.X()-b.X())>width*.99:op.Add(q['sheetBendRadius'],e);count+=1
 try:
  if count:
   op.Build()
   if op.IsDone()and BRepCheck_Analyzer(op.Shape()).IsValid():return op.Shape()
 except Exception:pass
 return s
def contacts():return[((i-(pub['positions']-1)/2)*pub['staggerPitch'],pub['rowDistance']*.5*(1 if i%2==0 else-1))for i in range(pub['positions'])]
def male():
 a=q['maleMainLength']/2;length=q['maleLength']/2;half=q['maleBodyWidth']/2;bottom=reg['maleOuterStopZ'];floor=q['maleBodyFloorZ'];roof0=q['maleRoofBottomZ'];roof1=q['maleRoofTopZ'];body=rounded_box(box(-a,a,-half,half,bottom,floor),q['bodyCornerRadius']);roof=prism([(-q['maleRoofBottomLength']/2,roof0),(-q['maleRoofTopLength']/2,roof1),(q['maleRoofTopLength']/2,roof1),(q['maleRoofBottomLength']/2,roof0)],1,-half,2*half);holes=[];grooves=[]
 for x,y in contacts():
  holes.append(box(x-q['maleContactPocketX']/2,x+q['maleContactPocketX']/2,y-q['maleContactPocketY']/2,y+q['maleContactPocketY']/2,bottom-.1,floor+.1))
  for z in [floor+q['cableGrooveCentreInset'],roof0-q['cableGrooveCentreInset']]:grooves.append(BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x,-half-.1,z),gp_Dir(0,1,0)),q['cableGrooveRadius'],2*half+.2).Shape())
 # The lower housing is a perimeter frame supporting a recessed contact
 # floor, not a comb of false red posts around the exposed male blades.
 holes.append(box(-q['maleUndersideCavityHalfX'],q['maleUndersideCavityHalfX'],-q['maleUndersideCavityHalfY'],q['maleUndersideCavityHalfY'],bottom-.1,q['maleLowerReliefTopZ']))
 # The published cover plan shows one staggered inspection/IDC opening
 # per contact. Opening dimensions below are editable nominal inference.
 windows=[box(x-q['maleRoofWindowX']/2,x+q['maleRoofWindowX']/2,y-q['maleRoofWindowY']/2,y+q['maleRoofWindowY']/2,roof0-.01,roof1+.01)for x,y in contacts()]
 body=cut_many(body,holes+grooves);roof=cut_many(roof,grooves+windows);hooks=[]
 for side in [-1,1]:
  lo,hi=sorted([side*(a-.08),side*length]);s=box(lo,hi,-half,half,q['maleEndHookBottomZ'],roof1);s=cut_many(s,[box(lo-.1,hi+.1,-q['maleEndWindowHalfY'],q['maleEndWindowHalfY'],-1.6,roof1+.1)]);hooks.append(s)
  lo,hi=sorted([side*(q['maleRoofBottomLength']/2-.15),side*(a+.2)])
  for y0,y1 in [(-half,-q['maleEndWindowHalfY']),(q['maleEndWindowHalfY'],half)]:hooks.append(box(lo,hi,y0,y1,roof0,roof1))
 kx,ky=reg['keyCentreXY'];kw=q['maleKeyNominalWidthX'];key=prism([(-.9,bottom+.05),(.0,bottom+.05),(1.1,-3.9),(1.1,-4.45),(-.2,-5.1),(-.2,bottom-pub['malePolarizingProjection']),(-.9,bottom-pub['malePolarizingProjection']),(-.9,-4.95),(.4,-4.25),(.4,-4.05),(-.9,-3.8)],0,kx-kw/2,kw);body=combine([body,roof,*hooks,key]);metal=[]
 for x,y in contacts():
  # Blade .7x.4 is factual. This editable IDC fork is inferred, not a
  # supplier stamping surface. The open notch and tips remain visible.
  poly=[(x-.35,reg['maleBladeTipZ']),(x+.35,reg['maleBladeTipZ']),(x+.35,-.25),(x+.52,.15),(x+.46,.72),(x+.26,.94),(x+.16,.52),(x+.16,.05),(x-.16,.05),(x-.16,.52),(x-.26,.94),(x-.46,.72),(x-.52,.15),(x-.35,-.25)];metal.append(prism(poly,1,y-pub['maleTabThickness']/2,pub['maleTabThickness']))
 return body,metal
def female():
 a=q['femaleLength']/2;half=pub['femaleBodyWidth']/2;bottom=q['femaleBodyBottomZ'];upper=q['femaleUpperBodyLength']/2;lower=q['femaleLowerBodyLength']/2;topHalf=q['femaleTopBodyWidth']/2;draftHalf=topHalf+abs(q['femaleTaperEndZ'])*math.tan(math.radians(q['femaleUpperDraftDegrees']));base=rounded_box(box(-lower,lower,-half,half,bottom,q['femaleBaseTopZ']),q['bodyCornerRadius']);base=cut_many(base,[box(upper,lower+.1,-half-.1,half+.1,bottom-.1,q['femaleBaseTopZ']+.01)]);bridge=box(-a,a,-half,half,q['femaleBaseTopZ'],q['femaleBaseTopZ']+.4);core=prism([(-half,q['femaleBaseTopZ']),(-half,q['femaleTaperEndZ']),(-draftHalf,q['femaleTaperEndZ']),(-topHalf,0),(topHalf,0),(draftHalf,q['femaleTaperEndZ']),(half,q['femaleTaperEndZ']),(half,q['femaleBaseTopZ'])],0,-lower,2*lower);core=cut_many(core,[box(-lower-.1,-upper,-half-.1,half+.1,-.6,.1),box(upper,lower+.1,-half-.1,half+.1,-.6,.1)]);parts=[base,core,bridge]
 for side in [-1,1]:
  lo,hi=sorted([side*(a-.75),side*a]);parts.append(prism([(-half,q['femaleBaseTopZ']),(-half,-1.0),(-topHalf,0),(topHalf,0),(half,-1.0),(half,q['femaleBaseTopZ'])],0,lo,hi-lo))
 # Independently inferred narrow lower foot extends under both latch ends.
 # The wide upper shoulders end higher, instead of a false deep wide skirt.
 # The non-key end has an open U-shaped foot, not a filled bottom block.
 # The key end stays open below the original latch bridge.
 parts.append(box(-a,-upper,-q['femaleEndFootHalfY'],q['femaleEndFootHalfY'],q['femaleEndPlateBottomZ'],q['femaleBaseTopZ']))
 for y0,y1 in [(-q['femaleEndFootHalfY'],-q['femaleEndFootInnerHalfY']),(q['femaleEndFootInnerHalfY'],q['femaleEndFootHalfY'])]:parts.append(box(-a,-upper,y0,y1,bottom,q['femaleBaseTopZ']))
 body=combine(parts);holes=[]
 for x,y in contacts():
  holes.append(box(x-q['femaleCavityX']/2,x+q['femaleCavityX']/2,y-q['femaleCavityY']/2,y+q['femaleCavityY']/2,-q['femaleMouthReliefDepth'],.1));holes.append(box(x-q['femaleMouthCrossX']/2,x+q['femaleMouthCrossX']/2,y-q['femaleMouthCrossY']/2,y+q['femaleMouthCrossY']/2,-q['femaleMouthReliefDepth'],.1));side=1 if y>0 else-1;y0,y1=sorted([side*q['femaleSideWindowInnerY'],side*(half+.1)]);holes.append(box(x-.525,x+.525,y0,y1,q['femaleSideWindowBottomZ'],q['femaleTaperEndZ']))
 for x0,x1,waist in [(-a-.1,-upper,q['femaleEndFootHalfY']),(-upper,upper,q['femaleBottomCentralHalfY']),(upper,a+.1,q['femaleEndFootHalfY'])]:
  for y0,y1 in [(-half-.1,-waist),(waist,half+.1)]:holes.append(box(x0,x1,y0,y1,bottom-.1,q['femaleBottomWingReliefZ']))
 for i in range(pub['positions']-1):
  x=(i-(pub['positions']-2)/2)*pub['staggerPitch'];holes.append(box(x-q['femaleCoreX']/2,x+q['femaleCoreX']/2,-q['femaleCoreY']/2,q['femaleCoreY']/2,bottom-.1,bottom+q['femaleCoreDepth']))
 kx,ky=reg['keyCentreXY'];holes.append(box(kx-.4,kx+.4,ky-.5,ky+.5,-3.6,.1))
 # The hook has a wide upper shoulder and a narrow lower polarizing foot.
 # This independently inferred entry relief leaves the retained key and
 # contact datums unchanged; it is not an OEM tooling dimension claim.
 holes.append(box(*q['femaleUpperKeySlotBounds']))
 # Distinct uprights and base are the latch outline; no second invented
 # through-window cuts away the narrowed upper walls.
 body=cut_many(body,holes);metal=[]
 for x,y in contacts():
  # One authored outward C-spring with a split mating nose. The dual
  # free beams follow the application-spec anatomy; tooling radii remain
  # inferred. No old STEP cross-section/edge is imported or extruded.
  side=1 if y>0 else-1;yy=abs(y);z=reg['femaleSupportZ'];p=[(yy-.2,-.1),(yy+.2,-.1),(1.65,-.6),(2.10,-2.5),(2.10,-3.15),(1.40,-3.65),(1.40,-4.1),(2.65,z+.25),(3.46,z+.25),(3.46,z),(2.50,z),(1.15,-4.20),(1.15,-3.5),(1.85,-3.0),(1.85,-2.5),(1.40,-.75),(yy-.2,-.35)];s=stamped([(side*a,b)for a,b in p],x,pub['femaleTailWidth']);lo,hi=sorted([y-.6,y+.6]);s=cut_many(s,[box(x-.075,x+.075,lo,hi,-.9,.1)]);metal.append(s)
 return body,metal
def fuse_materials(body,metals):
 metal=compound(metals);op=BRepAlgoAPI_Fuse(body,metal);op.Build();assert op.IsDone();whole=op.Shape();known=TopTools_IndexedMapOfShape()
 for face in shapes(metal,TopAbs_FACE):
  known.Add(face)
  for mod in op.Modified(face):
   if mod.ShapeType()==TopAbs_FACE:known.Add(mod)
  for mod in op.Generated(face):
   if mod.ShapeType()==TopAbs_FACE:known.Add(mod)
 return whole,known
def volume(s):
 g=GProp_GProps();BRepGProp.VolumeProperties_s(s,g);return float(g.Mass())
def bounds(s):
 b=Bnd_Box();BRepBndLib.AddOptimal_s(s,b,False,False);return list(b.Get())
def tessellate(shape,metalFaces):
 BRepMesh_IncrementalMesh(shape,q['tessellationDeflection'],False,q['tessellationAngle'],True);P0=[];N0=[];tags=[];faceTags=[];types=collections.Counter()
 for f in shapes(shape,TopAbs_FACE):
  face=TopoDS.Face_s(f);loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(face,loc);assert tri is not None;surf=BRepAdaptor_Surface(face);reverse=face.Orientation()==TopAbs_REVERSED;tag=1 if metalFaces.Contains(face)else 0;faceTags.append(tag);types[str(surf.GetType()).split('.')[-1]]+=1
  for i in range(1,tri.NbTriangles()+1):
   ix=list(tri.Triangle(i).Get())
   if reverse:ix[1],ix[2]=ix[2],ix[1]
   xyz=[tri.Node(k).Transformed(loc.Transformation())for k in ix];normal=np.cross(np.array(xyz[1].Coord())-xyz[0].Coord(),np.array(xyz[2].Coord())-xyz[0].Coord());assert np.linalg.norm(normal)>1e-14
   for k,p in zip(ix,xyz):
    uv=tri.UVNode(k);point=gp_Pnt();du=gp_Vec();dv=gp_Vec();surf.D1(uv.X(),uv.Y(),point,du,dv);n=du.Crossed(dv)
    if n.Magnitude()<1e-10:n=gp_Vec(*normal)
    elif reverse:n.Reverse()
    n.Normalize();P0.append(p.Coord());N0.append(n.Coord())
   tags.append(tag)
 pp=np.array(P0,dtype='<f4');nn=np.array(N0,dtype='<f4');assert abs(np.linalg.norm(nn,axis=1)-1).max()<1e-6;return pp,nn,tags,faceTags,dict(types)
def glb(part,P0,N0):
 pos=(P0*.001).astype('<f4');ix=np.arange(len(pos),dtype='<u4');chunks=[pos.tobytes(),N0.astype('<f4').tobytes(),ix.tobytes()];offset=0;views=[]
 for i,b in enumerate(chunks):views.append(dict(buffer=0,byteOffset=offset,byteLength=len(b),target=34963 if i==2 else 34962));offset+=len(b)
 document=dict(asset=dict(version='2.0',generator='Independently authored analytic illustration'),scene=0,scenes=[dict(nodes=[0])],nodes=[dict(mesh=0,name=part+' authored reference')],meshes=[dict(name=part+' authored reference',primitives=[dict(attributes=dict(POSITION=0,NORMAL=1),indices=2,mode=4)])],buffers=[dict(byteLength=offset)],bufferViews=views,accessors=[dict(bufferView=0,componentType=5126,count=len(pos),type='VEC3',min=pos.min(0).tolist(),max=pos.max(0).tolist()),dict(bufferView=1,componentType=5126,count=len(pos),type='VEC3'),dict(bufferView=2,componentType=5125,count=len(ix),type='SCALAR')]);j=json.dumps(document,separators=(',',':')).encode();j+=b' '*((-len(j))%4);b=b''.join(chunks);b+=b'\0'*((-len(b))%4);data=struct.pack('<4sII',b'glTF',2,12+8+len(j)+8+len(b))+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(b),b'BIN\0')+b;(MODELS/(part+'.glb')).write_bytes(data);return hashlib.sha256(data).hexdigest()
def main():
 global MODELS,PACKET
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--output',type=Path,required=True,help='Destination website dist directory')
 args=parser.parse_args();MODELS=args.output/'cable-assembly/native/models';PACKET=args.output/'cable-assembly/native/packet';MODELS.mkdir(parents=True,exist_ok=True);PACKET.mkdir(parents=True,exist_ok=True)
 anatomy=dict(scope='Material classes from the authored analytic solids, not manufacturer face/triangle provenance.',parts={},counts=[])
 for part,make in [('2-215083-4',male),('9-338069-4',female)]:
  body,metals=make();assert BRepCheck_Analyzer(body).IsValid();assert all(BRepCheck_Analyzer(m).IsValid()for m in metals);whole,known=fuse_materials(body,metals);assert BRepCheck_Analyzer(whole).IsValid();pp,nn,tags,faceTags,types=tessellate(whole,known);pin=glb(part,pp,nn)
  anatomy['parts'][part]=dict(faceMaterial=faceTags,triangleMaterial=tags,sourceKind='independently-authored-analytic',originalManufacturerFacesCopied=0,features='Published external/interface facts; editable inferred internal molding and springs')
  anatomy['counts'].append(dict(part=part,trianglesByMaterial=dict(collections.Counter(tags)),facesByMaterial=dict(collections.Counter(faceTags))))
  print(json.dumps(dict(part=part,faces=len(faceTags),triangles=len(tags),GLBSHA256=pin)))
 (PACKET/'anatomy-materials.json').write_text(json.dumps(anatomy,separators=(',',':'))+'\n')
if __name__=='__main__':main()
