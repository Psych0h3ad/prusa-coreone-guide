"""Original editable analytic header illustrations. No supplier CAD/mesh input.

Code: MIT. Authored geometry: CC-BY-SA-4.0. These grants cover only this
authored work; product names/drawing references remain their owners'.
"""
from pathlib import Path
import json,math,hashlib,collections,argparse
import numpy as np
from OCP.gp import gp_Pnt,gp_Vec
from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox,BRepPrimAPI_MakePrism
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakePolygon,BRepBuilderAPI_MakeFace,BRepBuilderAPI_MakeWire,BRepBuilderAPI_MakeEdge
from OCP.GC import GC_MakeArcOfCircle
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
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
H=Path(__file__).resolve().parent;P=json.loads((H/'header-parameters.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
def box(x0,x1,y0,y1,z0,z1):
 assert min(x1-x0,y1-y0,z1-z0)>0
 return BRepPrimAPI_MakeBox(gp_Pnt(x0,y0,z0),x1-x0,y1-y0,z1-z0).Shape()
def prism(points,axis,offset,width):
 poly=BRepBuilderAPI_MakePolygon()
 for a,b in points:
  xyz=[offset,a,b]if axis==0 else[a,b,offset]if axis==2 else[a,offset,b]
  poly.Add(gp_Pnt(*xyz))
 poly.Close();face=BRepBuilderAPI_MakeFace(poly.Wire()).Face();v=[0,0,0];v[axis]=width
 return BRepPrimAPI_MakePrism(face,gp_Vec(*v)).Shape()
def curved_yz(points,arcs,x,width):
 w=BRepBuilderAPI_MakeWire()
 for i,a in enumerate(points):
  b=points[(i+1)%len(points)];p=gp_Pnt(x,*a);q=gp_Pnt(x,*b)
  edge=BRepBuilderAPI_MakeEdge(GC_MakeArcOfCircle(p,gp_Pnt(x,*arcs[i]),q).Value()).Edge()if i in arcs else BRepBuilderAPI_MakeEdge(p,q).Edge()
  w.Add(edge)
 return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(width,0,0)).Shape()

def nose_tangent(point,center,r,upper):
 dy,dz=point[0]-center[0],point[1]-center[1];a=math.atan2(dz,dy);off=math.acos(r/math.hypot(dy,dz))
 choices=[(center[0]+r*math.cos(a+t*off),center[1]+r*math.sin(a+t*off))for t in [-1,1]]
 return (min if upper else max)(choices,key=lambda p:p[1])

def contact_branches(x,width):
 q=P['inferredEditable']['opposedContactBranches'];c=q['upperNoseCenter'];r=q['upperNoseRadius'];a=q['upperStart'];b=q['upperShoulder'];t1=nose_tangent(a,c,r,True);t2=nose_tangent(b,c,r,True);mid=[c[0],c[1]-r];base=[a,t1,t2,b,q['upperFar']];dz=q['upperProfileBand'];points=base+[(y,z+dz)for y,z in reversed(base)];upper=curved_yz(points,{1:mid,7:[mid[0],mid[1]+dz]},x,width)
 c=q['lowerNoseCenter'];r=q['lowerNoseRadius'];a=q['lowerStart'];b=q['lowerShoulder'];t1=nose_tangent(a,c,r,False);t2=nose_tangent(b,c,r,False);mid=[c[0],c[1]+r];back=q['lowerBackStations'];points=[a,t1,t2,b,*back,(back[-1][0],q['lowerBuriedRootZ']),(a[0],q['lowerBuriedRootZ'])];lower=curved_yz(points,{1:mid},x,width)
 spine=box(x,x+width,7.85,8.1,.36,2.2)
 return fuse(fuse(upper,lower),spine)

def fuse(a,b):
 op=BRepAlgoAPI_Fuse(a,b);op.Build();assert op.IsDone();return op.Shape()
def cut(a,b):
 op=BRepAlgoAPI_Cut(a,b);op.Build();assert op.IsDone();return op.Shape()
def compound(items):
 b=BRep_Builder();c=TopoDS_Compound();b.MakeCompound(c)
 for s in items:b.Add(c,s)
 return c
def edges(s):
 e=TopExp_Explorer(s,TopAbs_EDGE)
 while e.More():yield TopoDS.Edge_s(e.Current());e.Next()
def rounded(s,r):
 # Round only the extruded sheet-profile bends, leaving sheet edges planar.
 # This creates real cylindrical bends, without artificial ball-corner blends.
 f=BRepFilletAPI_MakeFillet(s)
 selected=0
 for e in edges(s):
  c=BRepAdaptor_Curve(e);a=c.Value(c.FirstParameter());b=c.Value(c.LastParameter());dx=abs(b.X()-a.X())
  if dx>1e-5 and abs(b.Y()-a.Y())+abs(b.Z()-a.Z())<1e-8:f.Add(r,e);selected+=1
 if not selected:return s,False
 try:
  f.Build()
  if f.IsDone()and BRepCheck_Analyzer(f.Shape()).IsValid():return f.Shape(),True
 except Exception:pass
 return s,False
def resin(pins,kind):
 pub=P['published'];q=P['inferredEditable'];a=pub['A_width'][str(pins)]/2;inset=q['cheekInset'];z0=P['consumerRegistration']['bodyBaseZ'];zt=z0+pub['bodyHeight'];front=P['consumerRegistration']['mouthFrontY'];back=q['rearY']
 # Authored stepped housing: mouth sill, two cheeks, back, roof and real
 # through locking window; a shell assembled from native analytic primitives.
 outer=box(-a+inset,a-inset,front,back,z0,zt)
 outer=fuse(outer,box(-a,a,q['wideCheekStartY'],back,z0,zt))
 # The cheek broadens at a real step; it is not a full-height XY wedge.
 for side in [-1,1]:
  x0,x1=sorted([side*(a-inset),side*(a+.01)])
  outer=cut(outer,prism([(5.19,z0-.1),(5.5,z0-.1),(5.5,.68),(5.19,.98)],0,x0,x1-x0))
 cavity=box(-a+q['sideWallThickness'],a-q['sideWallThickness'],front-.5,q['backWallFrontY'],q['floorTopZ'],q['roofBottomZ'])
 outer=cut(outer,cavity)
 # Rear cavity has a higher ceiling. Keep the front lock-bridge thick.
 inner=a-q['sideWallThickness']
 for side in [-1,1]:
  lane=q.get('sideChannelWidth',{}).get(kind+'-'+str(pins),.9)
  lo,hi=sorted([side*(inner-lane),side*inner])
  outer=cut(outer,box(lo,hi,q['mainFrontY'],q['backWallFrontY'],q['roofBottomZ']-.01,q.get('sideChannelCeilingZ',{}).get(kind+'-'+str(pins),5.21)))
 window=q.get('authoredLockOpening',{}).get(kind+'-'+str(pins))
 if window is None:window=(pub['lockOpeningVertical']if kind=='vertical'else pub['lockOpeningRightAngle'])[str(pins)]
 keyWidth=max(window-.15,q.get('centralChannelMinimumWidth',{}).get(kind+'-'+str(pins),0))
 outer=cut(outer,box(-keyWidth/2,keyWidth/2,q['mainFrontY'],q['backWallFrontY'],q['roofBottomZ']-.01,q.get('centralChannelCeilingZ',{}).get(kind+'-'+str(pins),5.21)))
 # The lock stop is a substantial inward shelf, not just a hole in the roof.
 # Its undimensioned inside profile is an explicit authored approximation.
 shelf=pub['A_width'][str(pins)]-4.6
 outer=fuse(outer,box(-shelf/2,shelf/2,5.15,back,1.96,3.01))
 outer=fuse(outer,prism([(4.8,2.26),(5.15,3.01),(5.15,1.96),(4.8,1.96)],0,-shelf/2,shelf))
 outer=fuse(outer,box(-inner,inner,q['receiverStopFrontY'],back,.61,5.21))
 outer=fuse(outer,box(-shelf/2,shelf/2,7.75,back,.60,1.96))
 outer=fuse(outer,prism([(7.57,.60),(7.67,.60),(7.75,.72),(7.75,1.81),(7.5,1.96),(back,1.96),(back,.60)],0,-shelf/2,shelf))
 # Individual stamped fingers pass through the lower mould relief.
 for i in range(pins):
  x=(i-(pins-1)/2)*pub['pitch'];outer=cut(outer,box(x-.125,x+.125,7.49,7.75,.59,.72))
 # The rear web and individual reliefs retain the measured pocket planes.
 for i in range(pins-1):
  mid=(i-(pins-2)/2)*pub['pitch'];outer=cut(outer,box(mid-.26,mid+.26,4.79,8.6,2.71,3.02))
 for side in [-1,1]:
  lo,hi=sorted([side*(a-.494),side*(a+.1)])
  outer=cut(outer,box(lo,hi,q['mainFrontY'],8.35,z0-.1,.68))
 outer=cut(outer,box(-a-.1,a+.1,front-.1,q['mainFrontY'],1.56,zt+.2))
 # A central lead-in to the lock bar and two raised insertion cheeks.
 outer=cut(outer,box(-inner,inner,front-.1,q['mainFrontY']+.01,.06,1.57))
 for side in [-1,1]:
  x0,x1=sorted([side*inner,side*(a-inset)])
  cheek=prism([(front,.06),(front,1.2),(front+.2,1.4),(3.0,1.4),(3.2,1.6),(3.2,.06)],0,x0,x1-x0)
  outer=fuse(outer,cheek)
 # Front ramp on the insertion sill is a wedge rather than an added hidden cap.
 outer=cut(outer,box(-inner,inner,front-.01,3.2,-.25,1.6))
 sill=prism([(front,-.09),(front,.2),(3.2,.61),(3.2,-.09)],0,-inner,2*inner);outer=fuse(outer,sill)
 outer=cut(outer,box(-window/2,window/2,q['lockWindowStartY'],q['lockWindowEndY'],q['roofBottomZ']-.01,zt+.1))
 if pins==4:
  # An authored central front relief for the wider four-circuit mould.
  outer=cut(outer,prism([(-1.95,front-.01),(1.95,front-.01),(1.95,2.5),(0,3.2),(-1.95,2.5)],2,-.25,1.85))
 # Shallow underside relief, retaining rear and side registration feet.
 outer=cut(outer,box(-a+.9,a-.9,3.3,8.35,z0-.01,.06))
 # Shallow locating seats for the stamped hold-downs on both cheeks.
 for side in [-1,1]:
  x=side*(a-.55);outer=cut(outer,box(x-.21,x+.21,3.2,5.2,.08,5.9))
 # The lower outer ledge and inner foot relief are distinct mould features.
 for side in [-1,1]:
  lo,hi=sorted([side*(a-.494),side*a]);outer=fuse(outer,box(lo,hi,7.05,7.8,.38,.68))
  lo,hi=sorted([side*(a-.9),side*(a-.494)]);outer=cut(outer,box(lo,hi,7.15,7.8,z0-.1,.11))
 # Rear hold-down support shelves, below the mating body.
 for side in [-1,1]:
  x0,x1=sorted([side*(a-.9),side*a])
  outer=cut(outer,box(x0,x1,7.8,8.2,z0-.1,.38))
  outer=fuse(outer,box(x0,x1,7.8,8.2,.38,.68))
  outer=cut(outer,prism([(8.2,z0-.1),(8.2,.38),(8.4,.18),(8.4,z0-.1)],0,x0,x1-x0))
  outer=fuse(outer,prism([(8.2,.38),(8.2,.68),(8.4,.68),(8.4,.18)],0,x0,x1-x0))
 # Recessed rear plane and small upper circuit ribs.
 outer=cut(outer,box(-a-.01,a+.01,9.5,back+.01,.85,zt+.01))
 for i in range(pins):
  x=(i-(pins-1)/2)*pub['pitch'];outer=fuse(outer,box(x-.18,x+.18,9.49,back,5.55,zt))
 # Full-depth channels and small lower mould reliefs for every circuit.
 for i in range(pins):
  x=(i-(pins-1)/2)*pub['pitch'];outer=cut(outer,box(x-.16,x+.16,9.39,back+.01,-.15,.16));outer=cut(outer,box(x-.23,x+.23,front+.8,back+.02,z0-.02,.08))
 assert BRepCheck_Analyzer(outer).IsValid()
 return outer
def stamped_contacts(pins,kind):
 pub=P['published'];q=P['inferredEditable'];parts=[];rounding=[]
 # Each terminal is an original continuous stamped profile with two free
 # spring noses, rear riser and PCB tail. Internal spring dimensions are
 # inferred, not presented as an exact supplier tooling reconstruction.
 for i in range(pins):
  x=(i-(pins-1)/2)*pub['pitch'];w=q['contactWidth'];
  s=contact_branches(x-w/2,w)
  bridge=prism([(7.85,.85),(8.1,.85),(8.5,.11),(9.4,.11),(9.4,-.14),(8.35,-.14)],0,x-w/2,w)
  s=fuse(s,bridge)
  if kind=='vertical':
   tail=prism([(9.1,-1.29),(9.7,-1.29),(9.7,.65),(9.4,.65),(9.4,-.04),(9.1,-.04)],0,x-w/2,w)
  else:
   tail=prism([(9.1,.06),(9.5,.46),(9.65,.31),(10.9,.31),(10.9,-.24),(10.85,-.29),(9.45,-.29)],0,x-w/2,w)
  s=fuse(s,tail);s,r=rounded(s,q['contactCornerRadius']);assert BRepCheck_Analyzer(s).IsValid();assert count(s,TopAbs_SOLID)==1;parts.append(s);rounding.append(r)
 a=pub['A_width'][str(pins)]/2
 for side in [-1,1]:
  # Upright solder hold-down plus two anchoring feet, independent editable
  # sheet-metal profile. Material is tin display class, not solid tin metal.
  x=side*(a-.697);w=q['nailWidth'];profile=[(3.1,.12),(3.2,5.6),(3.5,5.8),(4.4,6.01),(5.2,6.01),(5.2,.11),(7.15,.11),(7.15,-.24),(4.0,-.24)]
  s=prism(profile,0,x-w/2,w);s,r=rounded(s,.04);assert BRepCheck_Analyzer(s).IsValid();parts.append(s);rounding.append(r)
 return parts,rounding
def count(shape,kind):
 e=TopExp_Explorer(shape,kind);n=0
 while e.More():n+=1;e.Next()
 return n
def volume(shape):p=GProp_GProps();BRepGProp.VolumeProperties_s(shape,p);return p.Mass()
def mesh(shape):
 BRepMesh_IncrementalMesh(shape,.006,False,.07,True);pos=[];norm=[];types=collections.Counter();e=TopExp_Explorer(shape,TopAbs_FACE)
 while e.More():
  face=TopoDS.Face_s(e.Current());loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(face,loc);assert tri is not None;surf=BRepAdaptor_Surface(face);types[str(surf.GetType()).split('.')[-1]]+=1;reverse=face.Orientation()==TopAbs_REVERSED
  for i in range(1,tri.NbTriangles()+1):
   ix=list(tri.Triangle(i).Get())
   if reverse:ix[1],ix[2]=ix[2],ix[1]
   xyz=[tri.Node(k).Transformed(loc.Transformation())for k in ix];cross=np.cross(np.array(xyz[1].Coord())-xyz[0].Coord(),np.array(xyz[2].Coord())-xyz[0].Coord());assert np.linalg.norm(cross)>1e-14
   for k,p in zip(ix,xyz):
    uv=tri.UVNode(k);point=gp_Pnt();du=gp_Vec();dv=gp_Vec();surf.D1(uv.X(),uv.Y(),point,du,dv);n=du.Crossed(dv)
    if n.Magnitude()<1e-10:n=gp_Vec(*cross)
    elif reverse:n.Reverse()
    n.Normalize();pos.extend(p.Coord());norm.extend(n.Coord())
  e.Next()
 p=np.asarray(pos,dtype='<f4').reshape(-1,3);n=np.asarray(norm,dtype='<f4').reshape(-1,3);t=p.reshape(-1,3,3);cross=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]);poor=(cross*n.reshape(-1,3,3).mean(1)).sum(1)<=0
 assert not poor.any();assert abs(np.linalg.norm(n,axis=1)-1).max()<1e-6
 return p,n,dict(types)
def build(output):
 OUT=Path(output);OUT.mkdir(parents=True,exist_ok=True)
 parts={}
 for part,kind,pins in [('5025850270','right-angle',2)]:
  body=resin(pins,kind);metals,rounding=stamped_contacts(pins,kind)
  # Export the real boolean material union, not overlapping internal faces of
  # the constituent solids. All occupied volume is retained and checked.
  op=BRepAlgoAPI_Fuse(body,compound(metals));op.Build();assert op.IsDone();whole=op.Shape();assert BRepCheck_Analyzer(whole).IsValid()
  metalFaces=[]
  for metal in metals:
   ex=TopExp_Explorer(metal,TopAbs_FACE)
   while ex.More():
    f=TopoDS.Face_s(ex.Current());metalFaces.append(f);metalFaces.extend(list(op.Modified(f)));ex.Next()
  owned={'resin':[],'tin':[]};ex=TopExp_Explorer(whole,TopAbs_FACE)
  while ex.More():
   f=TopoDS.Face_s(ex.Current());owned['tin'if any(f.IsSame(m)for m in metalFaces)else'resin'].append(f);ex.Next()
  assert sum(map(len,owned.values()))==count(whole,TopAbs_FACE)
  retained=[volume(cut(s,whole))for s in [body,*metals]];assert max(abs(v)for v in retained)<1e-7
  groups=[];pp=[];nn=[];types={};at=0
  for material,shape in [('resin',compound(owned['resin'])),('tin',compound(owned['tin']))]:
   p,n,ty=mesh(shape);groups.append({'start':at,'count':len(p),'material':material});at+=len(p);pp.append(p);nn.append(n);types[material]=ty
  positions=np.concatenate(pp);normals=np.concatenate(nn);payload=positions.tobytes()+normals.tobytes();(OUT/(part+'.bin')).write_bytes(payload)
  parts[part]={'vertices':len(positions),'groups':groups,'meshSha256':sha(payload)}
 return parts

if __name__=='__main__':
 parser=argparse.ArgumentParser(description='Build the authored2-circuit reference header BIN and material table; no STEP output.')
 parser.add_argument('--out',type=Path,default=H.parents[1]/'dist/assets/chamber-service-reference')
 out=parser.parse_args().out
 result=build(out)
 (out/'temp-header.json').write_text(json.dumps({'parts':result,'qualification':'Authored analytic2-circuit family extension. Nominal outer dimensions/pitch from retained family parameters. Undimensioned lock/internal/tails remain inferred, not OEM CAD.'},indent=2))
