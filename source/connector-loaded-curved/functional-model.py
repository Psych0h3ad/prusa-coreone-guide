"""Original parametric functional reference. Code MIT; original geometry CC-BY-SA4.0.
Only local scalar JSON and original analytic profiles are build inputs.
Supplier CAD is restricted to separate private measurement/comparison programs.
"""
from pathlib import Path
import importlib.util,json,math
from OCP.gp import gp_Pnt,gp_Vec,gp_Trsf,gp_Ax1,gp_Dir
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeWire,BRepBuilderAPI_MakePolygon,BRepBuilderAPI_MakeFace,BRepBuilderAPI_Transform
from OCP.BRepPrimAPI import BRepPrimAPI_MakePrism
from OCP.BRepOffsetAPI import BRepOffsetAPI_ThruSections
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse,BRepAlgoAPI_Cut
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepClass3d import BRepClass3d_SolidClassifier
from OCP.TopAbs import TopAbs_SOLID,TopAbs_IN,TopAbs_ON
from OCP.TopExp import TopExp_Explorer
H=Path(__file__).resolve().parent
def module(name,file):
 spec=importlib.util.spec_from_file_location(name,H/file);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
shell=module('independent_exterior_sketches','analytic-shell.py');terminalProfiles=module('independent_terminal_profiles','reference-profiles.py')
P=json.loads((H/'functional-parameters.json').read_text(encoding='utf-8'));A=terminalProfiles.A
def boolean(kind,a,b):
 op=kind(a,b);op.Build();assert op.IsDone();return op.Shape()
def fuse(a,b):return boolean(BRepAlgoAPI_Fuse,a,b)
def cut(a,b):return boolean(BRepAlgoAPI_Cut,a,b)
def box(x0,x1,y0,y1,z0,z1):return shell.box(x0,y0,z0,x1-x0,y1-y0,z1-z0)
def move(shape,x=0,y=0,z=0):
 t=gp_Trsf();t.SetTranslation(gp_Vec(x,y,z));return BRepBuilderAPI_Transform(shape,t,True).Shape()
def assert_solid(s):
 assert BRepCheck_Analyzer(s).IsValid();ex=TopExp_Explorer(s,TopAbs_SOLID);n=0
 while ex.More():n+=1;ex.Next()
 assert n==1,('Expected one complete analytic solid',n)
def terminal_passage(x):
 loft=BRepOffsetAPI_ThruSections(True,True,1e-7)
 for sec in P['rearPassageSections']:
  loft.AddWire(shell.rounded_wire(x-sec['width']/2,sec['y'],sec['low'],sec['width'],sec['high']-sec['low'],sec['radius']))
 loft.Build();assert loft.IsDone();return loft.Shape()
def housing(pins):
 assert pins in [2,3,4]
 solid,moving=shell.outer_and_lock(pins)
 # Independent feature recipe: connected station-defined chambers are
 # designed before terminal fit tests, never from overlap-shaped tools.
 for i in range(pins):
  x=(i-(pins-1)/2)*P['rowPitchMM'];solid=cut(solid,terminal_passage(x))
  q=P['retentionPocket'];solid=cut(solid,box(x-q['width']/2,x+q['width']/2,*q['y'],*q['z']))
  # Keep the source-informed front contact relief and the original low slot.
  solid=cut(solid,box(x-.3375,x+.3375,4.8,7.65,.64,1.20))
 chamber_width=pins*1.5-.23
 solid=cut(solid,box(-chamber_width/2,chamber_width/2,4.56,8.76,1.75,3.10))
 solid=cut(solid,box(-chamber_width/2,chamber_width/2,7.65,8.76,.64,1.90))
 for i in range(pins-1):
  x=(i-(pins-2)/2)*P['rowPitchMM'];solid=fuse(solid,box(x-.215,x+.215,4.56,8.10,2.8,3.11));solid=fuse(solid,shell.yz([(8.1,2.8),(8.6,3.1),(8.1,3.1)],x-.215,.43))
 for i in range(pins):
  x=(i-(pins-1)/2)*P['rowPitchMM'];solid=cut(solid,box(x-.175,x+.175,4.8,8.10,1.65,1.90))
  stop=P['axialStop']
  for sign in [-1,1]:
   lo,hi=sorted([x+sign*stop['xAbsoluteFromCircuit'][0],x+sign*stop['xAbsoluteFromCircuit'][1]])
   solid=fuse(solid,box(lo,hi,*stop['y'],*stop['z']))
 assert_solid(solid);return solid,moving
def mounted_barrel(inner,y,length):
 t=A['sheetThickness'];ro=inner+t;low=math.radians(A['openSeamHalfAngleDegrees']);high=2*math.pi-low;mid=math.pi
 def p(r,a):return gp_Pnt(-r*math.sin(a),y,2*A['wireCenterZ']-(A['wireCenterZ']+r*math.cos(a)))
 w=BRepBuilderAPI_MakeWire()
 for r,a,b in [(ro,low,mid),(ro,mid,high)]:w.Add(terminalProfiles.arc(p(r,a),p(r,(a+b)/2),p(r,b)))
 w.Add(terminalProfiles.line(p(ro,high),p(inner,high)))
 for r,a,b in [(inner,high,mid),(inner,mid,low)]:w.Add(terminalProfiles.arc(p(r,a),p(r,(a+b)/2),p(r,b)))
 w.Add(terminalProfiles.line(p(inner,low),p(ro,low)))
 return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(0,length,0)).Shape()
def lance_profile():return [(3.35,1.97),(3.45,1.97),(4.4,1.66),(4.55,1.66),(4.55,1.52),(4.4,1.52),(4.3,1.56),(3.45,1.82)]
def contact_and_lance(depression=0):
 assert 0<=depression<=P['terminal']['maximumDepressionRadians']
 z0=A['wireCenterZ']-A['bladeHeightZ']/2;z1=z0+A['bladeHeightZ'];x0=-A['bladeWidthX']/2;x1=-x0;r=A['bladeCornerRadius'];t=A['bladeWallThickness'];y=6.9-3.8
 wire=terminalProfiles.rectangle_wire(x0,x1,z0,z1,r,y);solid=BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(wire).Face(),gp_Vec(0,3.8,0)).Shape()
 inner=terminalProfiles.rectangle_wire(x0+t,x1-t,z0+t,z1-t,.015,y-.05);solid=cut(solid,BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(inner).Face(),gp_Vec(0,3.9,0)).Shape())
 slot=P['terminal']['lanceSlot'];solid=cut(solid,box(-slot['width']/2,slot['width']/2,*slot['y'],*slot['z']))
 # A stamping slot and continuous cantilever root, rather than a solid tab
 # fused onto an unbroken contact roof. PDF20/21 establish the function.
 profile=lance_profile()
 lance=shell.yz(profile,-.325,.65)
 if depression:
  tr=gp_Trsf();tr.SetRotation(gp_Ax1(gp_Pnt(0,P['terminal']['lanceRootY'],P['terminal']['lanceRootZ']),gp_Dir(1,0,0)),depression);lance=BRepBuilderAPI_Transform(lance,tr,True).Shape()
 return fuse(solid,lance)
def terminal(depression=0):
 # The independent component is authored directly in the mounted +Z-tab
 # frame. It does not silently reuse the old65face frame or claim its fit.
 tr=gp_Trsf();tr.SetValues(-1,0,0,0,0,1,0,0,0,0,-1,2*A['wireCenterZ']);web=BRepBuilderAPI_Transform(terminalProfiles.web(),tr,True).Shape()
 solid=web
 for piece in [mounted_barrel(A['insulationRadius'],0,A['insulationBarrelLength']),mounted_barrel(A['conductorRadius'],A['conductorBarrelStart'],A['conductorBarrelLength']),contact_and_lance(depression)]:solid=fuse(solid,piece)
 assert_solid(solid);return solid
def insertion_depression(seat_y):
 def S(x):x=max(0,min(1,x));return x*x*(3-2*x)
 rootY=P['terminal']['lanceRootY'];rootZ=P['terminal']['lanceRootZ'];maximum=P['terminal']['maximumDepressionRadians'];clearance=.02
 def rotated(angle):
  c,s=math.cos(angle),math.sin(angle)
  return [(rootY+(y-rootY)*c-(z-rootZ)*s,rootZ+(y-rootY)*s+(z-rootZ)*c) for y,z in lance_profile()]
 sections=P['rearPassageSections']
 def roof(y):
  if y<0:return float('inf')
  if y>=1.70:return 1.74
  for a,b in zip(sections,sections[1:]):
   if a['y']<=y<=b['y']:
    u=(y-a['y'])/(b['y']-a['y']);return a['high']+(b['high']-a['high'])*u
  raise ValueError('Outside declared reference cam region')
 def fits(angle):
  points=rotated(angle);knots=[0]+[r['y'] for r in sections if 0<r['y']<=1.70]
  for a,b in zip(points,points[1:]+points[:1]):
   trials=[a,b]
   for k in knots:
    local=k-seat_y
    if min(a[0],b[0])<local<max(a[0],b[0]):
     u=(local-a[0])/(b[0]-a[0]);trials.append((local,a[1]+u*(b[1]-a[1])))
   if any(z+clearance>roof(y+seat_y) for y,z in trials):return False
  return True
 if fits(0):angle=0
 else:
  if not fits(maximum):raise ValueError('Declared reference cam cannot clear the complete lance profile')
  lo,hi=0,maximum
  for _ in range(42):
   mid=(lo+hi)/2
   if fits(mid):hi=mid
   else:lo=mid
  angle=hi
 # Hold depression through the retention pocket, then recover only once the
 # complete worst-case depressed tab has passed the ledge. No solid is cut.
 recoveryStart=P['retentionPocket']['y'][0]-min(y for y,z in rotated(maximum))+clearance
 recoveryEnd=P['terminal']['seatYMM']
 if recoveryStart>=recoveryEnd:raise ValueError('No declared distance for retention recovery')
 return angle*(1-S((seat_y-recoveryStart)/(recoveryEnd-recoveryStart)))
