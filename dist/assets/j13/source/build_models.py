"""Analytic 22-position main connector reference models. Dimensions are in mm; no supplier CAD payload is imported."""
from pathlib import Path
import argparse,math,json,hashlib,collections
import numpy as np
from OCP.gp import gp_Pnt,gp_Vec,gp_Ax2,gp_Dir
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakePolygon,BRepBuilderAPI_MakeFace,BRepBuilderAPI_MakeEdge,BRepBuilderAPI_MakeWire,BRepBuilderAPI_MakeVertex
from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox,BRepPrimAPI_MakePrism,BRepPrimAPI_MakeCylinder
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse,BRepAlgoAPI_Cut
from OCP.BRepOffsetAPI import BRepOffsetAPI_ThruSections
from OCP.BRepFilletAPI import BRepFilletAPI_MakeFillet
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE,TopAbs_EDGE,TopAbs_SOLID,TopAbs_REVERSED
from OCP.TopoDS import TopoDS,TopoDS_Compound
from OCP.BRep import BRep_Builder,BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface,BRepAdaptor_Curve
from OCP.BRepLProp import BRepLProp_SLProps
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepExtrema import BRepExtrema_DistShapeShape
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.TopLoc import TopLoc_Location
from OCP.GC import GC_MakeArcOfCircle
from OCP.ShapeUpgrade import ShapeUpgrade_UnifySameDomain
D=Path(__file__).resolve().parent;P=json.loads((D/'parameters.json').read_text());OUT=ASSET=None;FACE_RECORDS={}

def box(x0,x1,y0,y1,z0,z1):return BRepPrimAPI_MakeBox(gp_Pnt(x0,y0,z0),x1-x0,y1-y0,z1-z0).Shape()
def compound(shapes):
 b=BRep_Builder();s=TopoDS_Compound();b.MakeCompound(s)
 for q in shapes:b.Add(s,q)
 return s
def fuse(shapes):
 from OCP.TopTools import TopTools_ListOfShape
 arguments=TopTools_ListOfShape();arguments.Append(shapes[0]);tools=TopTools_ListOfShape()
 for q in shapes[1:]:tools.Append(q)
 op=BRepAlgoAPI_Fuse();op.SetArguments(arguments);op.SetTools(tools);op.SetRunParallel(False);op.Build();assert op.IsDone();return op.Shape()

def cut(s,tools):
 if not tools:return s
 from OCP.TopTools import TopTools_ListOfShape
 arguments=TopTools_ListOfShape();arguments.Append(s);items=TopTools_ListOfShape()
 for t in tools:items.Append(t)
 op=BRepAlgoAPI_Cut();op.SetArguments(arguments);op.SetTools(items);op.SetRunParallel(False);op.Build();assert op.IsDone();return op.Shape()

def profile(axis,start,coords,width):
 # Explicit new sketch, straight segments and genuine analytic circular arcs.
 def p(q):return gp_Pnt(start,*q)if axis=='X'else gp_Pnt(q[0],start,q[1])if axis=='Y'else gp_Pnt(*q,start)
 w=BRepBuilderAPI_MakeWire();first=coords[0];last=first
 for item in coords[1:]:
  if isinstance(item[0],str):end=item[2];edge=BRepBuilderAPI_MakeEdge(GC_MakeArcOfCircle(p(last),p(item[1]),p(end)).Value()).Edge()
  else:end=item;edge=BRepBuilderAPI_MakeEdge(p(last),p(end)).Edge()
  w.Add(edge);last=end
 
 if p(last).Distance(p(first))>1e-10:w.Add(BRepBuilderAPI_MakeEdge(p(last),p(first)).Edge())
 face=BRepBuilderAPI_MakeFace(w.Wire()).Face();assert BRepCheck_Analyzer(face).IsValid(),'Invalid authored sketch '+str(coords);vec={'X':gp_Vec(width,0,0),'Y':gp_Vec(0,width,0),'Z':gp_Vec(0,0,width)}[axis];return BRepPrimAPI_MakePrism(face,vec).Shape()
def rect_wire(y,cx,cz,w,h):
 b=BRepBuilderAPI_MakePolygon()
 for x,z in[(cx-w/2,cz-h/2),(cx+w/2,cz-h/2),(cx+w/2,cz+h/2),(cx-w/2,cz+h/2)]:b.Add(gp_Pnt(x,y,z))
 b.Close();return b.Wire()
def mouth(cx,cz):
 # Hand-authored rounded sketch and four planar taper cuts. Only planes and
 # cylinders, rather than general fillet/loft B-splines, define this pocket.
 r=.2;w=1.41;h=2.09;q=r/math.sqrt(2);lo=-h/2;hi=h/2;left=-w/2;right=w/2
 coords=[(left+r,lo),(right-r,lo),('arc',(right-r+q,lo+r-q),(right,lo+r)),(right,hi-r),('arc',(right-r+q,hi-r+q),(right-r,hi)),(left+r,hi),('arc',(left+r-q,hi-r+q),(left,hi-r)),(left,lo+r),('arc',(left+r-q,lo+r-q),(left+r,lo))]
 coords=[item if isinstance(item[0],str)else(item[0]+cx,item[1]+cz)for item in coords]
 coords=[('arc',(item[1][0]+cx,item[1][1]+cz),(item[2][0]+cx,item[2][1]+cz))if isinstance(item[0],str)else item for item in coords]
 pocket=profile('Y',-.02,coords,.22);ya=-.021;yb=.201
 # X narrows .07, bottom rises .17 and top falls .07 across the .2 datum depth.
 xp=lambda y:.705-.35*y;bottom=lambda y:cz-1.045+.85*y;top=lambda y:cz+1.045-.35*y
 tools=[profile('Z',cz-3,[(cx+xp(ya),ya),(cx+3,ya),(cx+3,yb),(cx+xp(yb),yb)],6),profile('Z',cz-3,[(cx-xp(ya),ya),(cx-3,ya),(cx-3,yb),(cx-xp(yb),yb)],6),profile('X',cx-3,[(ya,bottom(ya)),(yb,bottom(yb)),(yb,cz-3),(ya,cz-3)],6),profile('X',cx-3,[(ya,top(ya)),(yb,top(yb)),(yb,cz+3),(ya,cz+3)],6)]
 u=ShapeUpgrade_UnifySameDomain(cut(pocket,tools),True,True,False);u.Build();return u.Shape()

def plug():
 # Front shroud, stepped lower body, rear two-row contact galleries.
 print('PLUG_BASE',flush=True);front=box(-9.7,9.7,0,2.3,.15,6.55)
 rear=profile('X',-8.875,[(2.3,.63),(2.94,1),(8,1),(8.6,1.4),(8.6,6.55),(2.3,6.55)],17.75)
 s=fuse([front,rear]);tools=[box(-8.135,8.135,4.56,8.8,2.1,3.7),box(-8.135,8.135,4.56,8.8,4.8,6.15),box(-8.135,8.135,7.65,8.8,.1,2.1),box(-8.135,8.135,7.65,8.8,3.7,4.8)]
 # Chamfered rear arm tips and the repeated locating teeth are independent sketches.
 for z in [2.1,4.8]:tools.append(profile('X',-8.135,[(7.4,z),(7.65,z-.15),(7.65,z+.02),(7.4,z+.02)],16.27))
 for x in [(i-5)*1.5 for i in range(11)]:
  tools.extend([box(x-.3375,x+.3375,4.8,7.65,.1,1.55),box(x-.3375,x+.3375,4.8,7.65,3.7,4.25)])
 for centre in[(i-5.5)*1.5 for i in range(12)]:
  left=max(-8.135,centre+.115);right=min(8.135,centre+.365)
  if right>left:
   for z in[2.1,4.8]:tools.append(box(left,right,4.55,7.41,z-.1,z+.01))
 s=cut(s,tools);s=cut(s,[mouth(x,z)for x in[(i-5)*1.5 for i in range(11)]for z in P['mouthRowsZ']])
 teeth=[profile('Y',4.56,[(x-.25,6.151),(x-.115,5.85),(x+.115,5.85),(x+.25,6.151)],4.04)for x in[(i-4.5)*1.5 for i in range(10)]]
 for centre in[(i-5.5)*1.5 for i in range(12)]:
  for z in[2.1,4.8]:teeth.append(box(centre-.115,centre+.115,4.56,7.0,z-.01,z+.15))
 # Side guide ears have true cylindrical leading corners.
 ears=[]
 from OCP.BRepAlgoAPI import BRepAlgoAPI_Common
 for sign in[-1,1]:
  def mirror(items):
   return [('arc',(sign*v[1][0],v[1][1]),(sign*v[2][0],v[2][1]))if isinstance(v[0],str)else(sign*v[0],v[1])for v in items]
  footprint=profile('Z',.15,mirror([(8.875,0),(9.7,0),('arc',(10.19497475,.20502525),(10.4,.7)),(10.4,3.1),(8.875,3.1)]),6.4)
  crown=profile('Y',0,mirror([(8.875,.15),(9.7,.15),('arc',(10.19497475,.35502525),(10.4,.85)),(10.4,5.85),('arc',(10.19497475,6.34497475),(9.7,6.55)),(8.875,6.55)]),3.1)
  both=BRepAlgoAPI_Common(footprint,crown);both.Build();assert both.IsDone();wing=cut(both.Shape(),[profile('X',-11,[(2.3,.14),(3.11,.14),(3.11,2.24),(3.1,2.24),('arc',(3.012132,2.027868),(2.8,1.94)),(2.3,1.94)],22)]);ears.append(wing)
 # Authored sloping central roof. Separate lock beams reconnect above it.
 roofcut=profile('X',4.95,[(0,5.7),('arc',(.087868,5.912132),(.3,6)),(1.9,6),(2.45,6.27),(4.7,6.55),(4.7,6.57),(0,6.57)],1.05)
 s=cut(s,[roofcut,profile('X',-6,[(0,5.7),('arc',(.087868,5.912132),(.3,6)),(1.9,6),(2.45,6.27),(4.7,6.55),(4.7,6.57),(0,6.57)],1.05)])
 # Push pad and independently sketched latch arms; no copied supplier faces.
 s=cut(s,[box(-4.95,4.95,-.01,1.95,5.7,6.56)])
 pad=profile('X',-4.95,[(0,5.7),('arc',(.05505,5.8732),(.2,5.9828427)),(.2,8.8),('arc',(.287868,9.012132),(.5,9.1)),(.95,9.1),(1.55,9.1),(1.95,9.1),(1.95,5.7)],9.9)
 arms=[box(-1.8,1.8,2.45,3.1,6.54,8.8)]
 for sign in[-1,1]:
  arm=[(3.1,6.54),(8.5,6.54),(8.5,7.08),('arc',(8.20710678,7.78710678),(7.5,8.08)),(3.1,8.08)]
  arms.append(profile('X',1.2 if sign>0 else-1.8,arm,.6))
  brace=[(.2,6.54),(.52135,8.05837),('arc',(.8708,8.6277),(1.4994,8.85)),(1.95,8.85),(1.95,9.1),(3.1,9.1),(3.1,6.54)]
  braceBody=profile('X',6.0 if sign>0 else-6.7,brace,.7)
  fillet=BRepFilletAPI_MakeFillet(braceBody);edges=TopExp_Explorer(braceBody,TopAbs_EDGE)
  while edges.More():
   edge=TopoDS.Edge_s(edges.Current());lo,hi=bbox(edge)
   if abs(lo[0]-sign*6.7)<1e-6 and abs(hi[0]-sign*6.7)<1e-6 and hi[1]<=1.950001 and hi[2]>6.6 and hi[2]<8.850001:fillet.Add(.3,edge)
   edges.Next()
  fillet.Build();assert fillet.IsDone(),'Outer brace analytic fillet';arms.append(fillet.Shape())
  rail=[(1.95,6.54),(8.3,6.54),(8.3,7.08),('arc',(8.00710678,7.78710678),(7.3,8.08)),(3.1,8.08),(3.1,8.6),(1.95,8.6)]
  arms.append(profile('X',6.7 if sign>0 else-7.8,rail,1.1))
  cap=[(6.7,8.5),(7.8,8.5),(7.8,8.6),('arc',(7.65355339,8.95355339),(7.3,9.1)),(6.7,9.1)]
  if sign<0:cap=[('arc',(-v[1][0],v[1][1]),(-v[2][0],v[2][1]))if isinstance(v[0],str)else(-v[0],v[1])for v in cap]
  arms.append(profile('Y',1.95,cap,1.15))
 arms.extend([box(5.2,7.3,1.95,3.1,8.6,9.1),box(-7.3,-5.2,1.95,3.1,8.6,9.1)])
 # Broad twin lock beams and their outside push-pad extensions.
 for sign in[-1,1]:
  x=2.3 if sign>0 else-5.5
  beam=[(1.75,5.95),(1.75,8.23),(2.85,8.23),(3,8.23),(5.05,8.23),(5.28,8.58),(5.52,8.58),(5.89,8.48),(6.15,8.18),(7.5,8.18),('arc',(8.20710678,7.88710678),(8.5,7.18)),(8.5,6.54),(4.7,6.50)]
  arms.append(profile('X',x,beam,3.2))
  fore=[(0,5.7),('arc',(.05505,5.8732),(.2,5.9828427)),(.2,8.8),('arc',(.287868,9.012132),(.5,9.1)),(2.85,9.1),(3,8.23),(3,6.54),(1.95,6.54),(1.95,5.7)]
  arms.append(profile('X',2.3 if sign>0 else-4.95,fore,2.65))
 print('PLUG_UNION',flush=True);result=fuse([s,pad,*ears,*arms,*teeth]);result=cut(result,[box(-3.35,3.35,.95,1.55,8.7,9.2)]);print('PLUG_UNION_DONE',flush=True);return result,[]
def header():
 # Broad moulded C shroud and two interdigitating support shelves.
 lower=[(2.4,.25),(10.9,.25),(10.9,9.1),(3.2,9.1),(3.2,8.19),(8.6,8.19),(8.6,6.05),(5.15,6.05),(4.8,5.75),(4.8,5.3),(5.1,5.0),(7.5,5.0),(7.75,4.85),(7.75,3.76),(7.57,3.64),(5.22,3.64),(5.1,3.64),(4.8,3.34),(4.8,2.6),(5.1,2.3),(7.5,2.3),(7.75,2.15),(7.75,1.06),(7.57,.94),(5.22,.94),(3.12,.94),(2.4,.51)]
 print('HEADER_BASE',flush=True);core=profile('X',-8.1,lower,16.2);parts=[core,box(-10.4,10.4,8.6,10.9,.25,9.1),box(-4.5,4.5,3.2,9.2,.1,.26)]
 for sign in [-1,1]:
  xy=[(8.95,2.4),(9.5,2.4),(9.5,5.95),(10.4,5.95),(10.4,11.15),(8.95,11.15)]
  if sign<0:xy=[(-x,y)for x,y in xy][::-1]
  parts.append(profile('Z',.25,xy,8.85))
 parts.extend([profile('X',-8.95,[(2.4,-.05),(3.2,-.05),(3.2,.94),(3.1196,.94),(2.4,.51)],.85),profile('X',8.1,[(2.4,-.05),(3.2,-.05),(3.2,.94),(3.1196,.94),(2.4,.51)],.85),box(-9.5,-8.1,2.4,3.2,-.05,.25),box(8.1,9.5,2.4,3.2,-.05,.25),box(-10.4,10.4,3.2,10.9,8.19,9.1),box(-8.95,8.95,3.12,10.9,.25,.94),box(-10.4,-9.5,9.65,11.15,-.05,.25),box(9.5,10.4,9.65,11.15,-.05,.25)])
 for sign in[-1,1]:
  parts.append(box(6.2 if sign>0 else-7.0,7.0 if sign>0 else-6.2,3.2,8.6,7.19,8.2))
  parts.append(box(7.0 if sign>0 else-8.0,8.0 if sign>0 else-7.0,3.2,8.6,8.13,8.2))
  parts.append(box(8.0 if sign>0 else-8.95,8.95 if sign>0 else-8.0,3.2,8.6,6.58,8.2))
 # Repeated open top slots in the support shelf, not extra protruding ribs.
 s=fuse(parts);s=cut(s,[box(x-.29,x+.29,4.79999,8.6,5.75,6.06)for x in[(i-4.5)*1.5 for i in range(10)]]);s=cut(s,[profile('Z',.09,[(-6.95,2.39),(6.95,2.39),(6.2,3.2),(-6.2,3.2)],.86)]);s=fuse([s,box(-8.1,8.1,3.2,9.2,.1,.26)]);windows=[profile('X',x,[(4.73,9.1),(4.83,8.19),(10.91,8.19),(10.91,9.2),(4.73,9.2)],3.6)for x in[-6.2,2.6]]
 s=cut(s,[box(8.95,10.41,10.9,11.16,1.2,8.4),box(-10.41,-8.95,10.9,11.16,1.2,8.4),box(9.5,10.41,10.9,11.16,8.4,9.11),box(-10.41,-9.5,10.9,11.16,8.4,9.11)])
 rear_retention=[profile('X',x,[(10.89,3.4375),(11.2,3.55),(11.2,7.55),(10.89,7.6625)],.4)for x in[9.525,-9.925]]
 s=fuse([s,box(8.45,9.5,10.9,11.15,8.4,9.1),box(-9.5,-8.45,10.9,11.15,8.4,9.1)])
 s=cut(s,[box(8.225,8.825,8.59999,8.83,1.57,2.07)])
 frontChamfer=[(2.4,1.54),(2.6,1.74),(3,1.74),(3.2,1.94),(3.2,2),(2.4,2)]
 s=cut(s,[profile('X',8.949,frontChamfer,.552),profile('X',-9.501,frontChamfer,.552),profile('X',9.49,[(5.95,.24),(9.65,.24),(9.65,.27),(9.45,.47),(8.3,.47),(8,.77),(6.25,.77),(5.95,1.07)],1),profile('X',-10.49,[(5.95,.24),(9.65,.24),(9.65,.27),(9.45,.47),(8.3,.47),(8,.77),(6.25,.77),(5.95,1.07)],1),*windows,box(-8.0,8.0,9.2,11.16,8.85,9.2),box(-10.41,10.41,2.39,3.2,1.94,9.2),box(-10.41,-9.5,3.2,5.95,8.18,9.2),box(9.5,10.41,3.2,5.95,8.18,9.2)])
 # Both rear retention tongues belong to the metal fixing features.
 metal=[(part,'holdDowns')for part in rear_retention];pockets=rear_retention[:]
 for x in[(i-5)*1.5 for i in range(11)]:
  for row in range(2):
   z=2.075+row*2.7
   # Narrow stamped mating blade, root and PCB tail; dimensions are authored
   # reference features pending dense source comparison, not an OEM terminal spec.
   def shift(coords):return [('arc',(p[1][0],p[1][1]+row*2.7),(p[2][0],p[2][1]+row*2.7))if isinstance(p[0],str)else(p[0],p[1]+row*2.7)for p in coords]
   def arc_middle(center,r,a,b):
    vx=a[0]+b[0]-2*center[0];vy=a[1]+b[1]-2*center[1];l=math.hypot(vx,vy);return(center[0]+r*vx/l,center[1]+r*vy/l)
   start=(5.2247419383,.94);end=(5.2670051249,.9943743345)
   lowerStrip=[start,('arc',arc_middle((5.32,.9095713675),.1,start,end),end),(5.8196270885,1.3397175811),('arc',(5.85,1.35),(5.8803729115,1.3397175811)),(6.05,1.21),(7.39,1.21),(7.64,1.38),(7.75,1.38),(7.75,1.06),(7.57,.94)]
   upperStrip=[(5.4345,2.3),(5.8235552821,2.0575653),('arc',(5.85,2.05),(5.8824337447,2.0619467189)),(6.15,2.29),(7.5,2.29),(7.5,2.3)]
   blade=fuse([profile('X',x-.125,shift(lowerStrip),.25),profile('X',x-.125,shift(upperStrip),.25)])
   metal.append((box(x-.125,x+.125,7.7,10.9,z-.025,z+.025),'contacts'))
   # Blade is united to the polymer shelves, not surrounded by an invented rectangular cavity.
   if row==0:tail=profile('X',x-.125,[(9.9,.25),(10.55,-.08),(10.55,-.9),(11.15,-.9),(11.2,-.85),(11.2,.55),(10.9,.7225),(10.9,2.1),(10.6,2.1),(10.6,.4)],.25)
   else:tail=profile('X',x-.125,[(10,8.18),(10.8,8.18),(10.8,8.3),(11.2,8.5),(11.2,9.9),(11.15,9.95),(10.6,9.95),(10.6,9.13),(10,8.83)],.25)
   metal.extend([(blade,'contacts'),(tail,'contacts')])
 holdprofile=[(3.05,.3),(3.9,.3),(4.1,-.1),(7.75,-.1),(7.95,.3),(9.05,.3),(9.05,.47),(9.45,.47),(9.65,.27),(9.65,1.2),(9.05,1.2),(9.05,8.3),(4.39,8.3),(3.95,8.08),(3.6,8.08),(3.4,7.88),(3.4,1.15),(3.05,1.15)]
 for start in[-9.925,9.525]:
  h=profile('X',start,holdprofile,.4);metal.append((h,'holdDowns'));pockets.append(h)
 print('HEADER_POCKETS',flush=True);s=cut(s,pockets);print('HEADER_UNION',flush=True);return fuse([s,*[m for m,k in metal]]),metal
def bbox(shape):
 b=Bnd_Box();BRepBndLib.AddOptimal_s(shape,b,False,False);q=b.Get();return[list(q[:3]),list(q[3:])]
def export(id,shape,metal):
 metalBounds=[(solid,tag,bbox(solid))for solid,tag in metal]
 print('EXPORT',id,flush=True);assert BRepCheck_Analyzer(shape).IsValid(),id+' invalid authored solid';BRepMesh_IncrementalMesh(shape,.012,False,.12,True)
 groups=collections.defaultdict(lambda:{'p':[],'n':[]});faces=[];ex=TopExp_Explorer(shape,TopAbs_FACE);types=collections.Counter();i=0;zero=0;minCos=1.;fallback=0;poor=0
 while ex.More():
  face=TopoDS.Face_s(ex.Current());surf=BRepAdaptor_Surface(face,True);types[str(surf.GetType())]+=1;gp=GProp_GProps();BRepGProp.SurfaceProperties_s(face,gp);c=gp.CentreOfMass();vertex=BRepBuilderAPI_MakeVertex(c).Vertex();material='resin'
  for solid,tag,(lo,hi) in metalBounds:
   if any(v<mn-1e-6 or v>mx+1e-6 for v,mn,mx in zip([c.X(),c.Y(),c.Z()],lo,hi)):continue
   dist=BRepExtrema_DistShapeShape(vertex,solid);dist.Perform()
   if dist.IsDone()and dist.Value()<1e-6:material=tag;break
  loc=TopLoc_Location();tri=BRep_Tool.Triangulation_s(face,loc);start=len(groups[material]['p'])
  if tri is None:raise RuntimeError('Authored face lacks triangulation')
  for t in range(1,tri.NbTriangles()+1):
   ids=list(tri.Triangle(t).Get());reverse=face.Orientation()==TopAbs_REVERSED
   if reverse:ids[1],ids[2]=ids[2],ids[1]
   positions=[];normals=[]
   for index in ids:
    point=tri.Node(index).Transformed(loc.Transformation());uv=tri.UVNode(index);props=BRepLProp_SLProps(surf,uv.X(),uv.Y(),1,1e-9)
    assert props.IsNormalDefined();normal=props.Normal()
    if reverse:normal.Reverse()
    positions.append([point.X(),point.Y(),point.Z()]);normals.append([normal.X(),normal.Y(),normal.Z()])
   cross=np.cross(np.array(positions[1])-positions[0],np.array(positions[2])-positions[0]);area=np.linalg.norm(cross)
   if area<1e-14:zero+=1
   else:
    cosine=float(np.dot(cross/area,np.mean(normals,axis=0)));minCos=min(minCos,cosine);poor+=cosine<=0
   groups[material]['p'].extend(positions);groups[material]['n'].extend(normals)
  faces.append({'id':i,'material':material,'vertices':len(groups[material]['p'])-start,'type':str(surf.GetType()),'areaMM2':gp.Mass(),'bounds':bbox(face)});i+=1;ex.Next()
 p=[];n=[];draw=[]
 for material in P['materialSlots']:
  g=groups[material];draw.append({'start':len(p),'count':len(g['p']),'material':material});p.extend(g['p']);n.extend(g['n'])
 p=np.array(p,dtype='<f4');n=np.array(n,dtype='<f4');binary=p.tobytes()+n.tobytes();(ASSET/(id+'.bin')).write_bytes(binary);vol=GProp_GProps();BRepGProp.VolumeProperties_s(shape,vol);solidEx=TopExp_Explorer(shape,TopAbs_SOLID);solids=0
 while solidEx.More():solids+=1;solidEx.Next()
 meta={'vertices':len(p),'sourceFaces':i,'facesRetained':i,'removedFaces':[],'bounds':bbox(shape),'positionsSHA256':hashlib.sha256(p.tobytes()).hexdigest(),'normalsSHA256':hashlib.sha256(n.tobytes()).hexdigest(),'meshSha256':hashlib.sha256(binary).hexdigest(),'units':'mm','normalFallback':[],'zeroAreaTriangles':zero,'poorNormals':poor,'minimumNormalFacetCosine':minCos,'entryPlaneLoops':[],'groups':draw,'source':'./source/README.txt','sourceKind':'independently-authored-analytic','manufacturerCAD':False,'sourceStyle':'Authored resin, contact and fixing-tongue display groups','materialInference':'Resin, contacts and fixing tongues follow the authored feature definitions; colours are display references.','qualification':{'nominalFacts':'Official22circuits/2rows/1.5pitch; header matedheight11.2.','dimensions':'Additional features include estimates; this is an assembly reference model.','mouths':'Illustrative connector outlet datums, not identified crimp axes.','stockModel':'No manufacturer BREP/mesh faces copied. Builder does not read OEM CAD.'}}
 FACE_RECORDS[id]=faces;meta['materialFaceCounts']=dict(collections.Counter(f['material']for f in faces));print('AUTHORED',id,solids,'solids',i,'faces',len(p)//3,'triangles',vol.Mass(),'mm3');return meta,{'valid':True,'solids':solids,'faces':i,'surfaceTypes':dict(types),'bounds':bbox(shape),'volumeMM3':vol.Mass(),'zeroAreaTriangles':zero,'minimumNormalFacetCosine':minCos}
def main():
 global OUT,ASSET
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,required=True,help='Destination website dist directory');parser.add_argument('--report',type=Path)
 args=parser.parse_args();OUT=args.output;ASSET=OUT/'assets/j13';ASSET.mkdir(parents=True,exist_ok=True)
 manifest={'units':'mm','independentlyAuthored':True,'sourceKind':'independently-authored-analytic','referenceOnly':True,'parts':{},'qualification':'Assembly reference models. Undimensioned internal features and board registration include estimates. Not manufacturing drawings.'};proof={}
 for id,fn in [('5031492200',plug),('5031542290',header)]:
  shape,materials=fn();manifest['parts'][id],proof[id]=export(id,shape,materials)
 (ASSET/'cad.json').write_bytes((json.dumps(manifest,indent=2)+'\n').encode())
 if args.report:
  args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_bytes((json.dumps({'parts':proof,'faces':FACE_RECORDS},indent=2)+'\n').encode())
if __name__=='__main__':main()
