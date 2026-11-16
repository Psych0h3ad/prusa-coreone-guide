"""Original full-stock contact-leaf reference; MIT code / CC-BY-SA4.0 geometry.

Application sheet9 distinguishes the electrical contact from the retention
lance. The compliant bottom-strip topology and its scalar bend are authored
functional estimates, not claimed manufacturer internal construction.
No header/outer housing modification. The complete original bottom strip
is retained as a constant-thickness bend, rather than removed for clearance.
"""
from pathlib import Path
import importlib.util,math
from OCP.gp import gp_Pnt,gp_Vec,gp_Trsf,gp_Ax1,gp_Dir
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeWire,BRepBuilderAPI_MakeFace,BRepBuilderAPI_Transform
from OCP.BRepPrimAPI import BRepPrimAPI_MakePrism
from OCP.TopoDS import TopoDS
H=Path(__file__).resolve().parent;s=importlib.util.spec_from_file_location('unchanged_reference_for_leaf',H/'functional-model.py');b=importlib.util.module_from_spec(s);s.loader.exec_module(b)
ROOT_Y=3.30;BEND_STOCK=.30;TOTAL_STOCK=3.60;WIDTH=.81;THICKNESS=.15;NEUTRAL_Z=.875
def profile_wire(points,arcs,y):
 w=BRepBuilderAPI_MakeWire()
 for i,a in enumerate(points):
  z=points[(i+1)%len(points)];p=gp_Pnt(a[0],y,a[1]);q=gp_Pnt(z[0],y,z[1]);w.Add(b.terminalProfiles.arc(p,gp_Pnt(arcs[i][0],y,arcs[i][1]),q)if i in arcs else b.terminalProfiles.line(p,q))
 return w.Wire()
def fixed_channel():
 # Original rounded outer/inner profiles, joined through the two bottom
 # slit boundaries. This explicit U-section retains the corner material.
 q=math.sqrt(.5);points=[(-.405,.8),(-.47,.8),(-.57,.9),(-.57,1.6),(-.47,1.7),(.47,1.7),(.57,1.6),(.57,.9),(.47,.8),(.405,.8),(.405,.95),(.42,.965),(.42,1.535),(.405,1.55),(-.405,1.55),(-.42,1.535),(-.42,.965),(-.405,.95)]
 arcs={1:(-.47-.1*q,.9-.1*q),3:(-.47-.1*q,1.6+.1*q),5:(.47+.1*q,1.6+.1*q),7:(.47+.1*q,.9-.1*q),10:(.405+.015*q,.965-.015*q),12:(.405+.015*q,1.535+.015*q),14:(-.405-.015*q,1.535+.015*q),16:(-.405-.015*q,.965-.015*q)}
 return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(profile_wire(points,arcs,ROOT_Y)).Face(),gp_Vec(0,TOTAL_STOCK,0)).Shape()
def closed_root():
 outer=b.terminalProfiles.rectangle_wire(-.57,.57,.8,1.7,.1,3.1);inner=b.terminalProfiles.rectangle_wire(-.42,.42,.95,1.55,.015,3.1)
 f=BRepBuilderAPI_MakeFace(outer);f.Add(TopoDS.Wire_s(inner.Reversed()));return BRepPrimAPI_MakePrism(f.Face(),gp_Vec(0,.2,0)).Shape()
def leaf(angle=0):
 if not 0<=angle<=.14:raise ValueError('Outside declared reference leaf motion')
 if angle==0:return b.shell.yz([(ROOT_Y,.8),(ROOT_Y+TOTAL_STOCK,.8),(ROOT_Y+TOTAL_STOCK,.95),(ROOT_Y,.95)],-WIDTH/2,WIDTH)
 radius=BEND_STOCK/angle;straight=TOTAL_STOCK-BEND_STOCK;centerZ=NEUTRAL_Z+radius
 def p(r,a):return gp_Pnt(-WIDTH/2,ROOT_Y+r*math.sin(a),centerZ-r*math.cos(a))
 lower=radius+THICKNESS/2;upper=radius-THICKNESS/2;lo=p(lower,angle);hi=p(upper,angle);endLo=gp_Pnt(lo.X(),lo.Y()+straight*math.cos(angle),lo.Z()+straight*math.sin(angle));endHi=gp_Pnt(hi.X(),hi.Y()+straight*math.cos(angle),hi.Z()+straight*math.sin(angle));w=BRepBuilderAPI_MakeWire()
 for edge in [b.terminalProfiles.arc(p(lower,0),p(lower,angle/2),lo),b.terminalProfiles.line(lo,endLo),b.terminalProfiles.line(endLo,endHi),b.terminalProfiles.line(endHi,hi),b.terminalProfiles.arc(hi,p(upper,angle/2),p(upper,0)),b.terminalProfiles.line(p(upper,0),p(lower,0))]:w.Add(edge)
 return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(WIDTH,0,0)).Shape()
def frame(lance_depression=0):
 solid=b.fuse(closed_root(),fixed_channel());slot=b.P['terminal']['lanceSlot'];solid=b.cut(solid,b.box(-slot['width']/2,slot['width']/2,*slot['y'],*slot['z']))
 lance=b.shell.yz(b.lance_profile(),-.325,.65)
 if lance_depression:
  tr=gp_Trsf();tr.SetRotation(gp_Ax1(gp_Pnt(0,b.P['terminal']['lanceRootY'],b.P['terminal']['lanceRootZ']),gp_Dir(1,0,0)),lance_depression);lance=BRepBuilderAPI_Transform(lance,tr,True).Shape()
 solid=b.fuse(solid,lance);b.assert_solid(solid);return solid
def contact(angle=0,lance_depression=0):
 solid=b.fuse(frame(lance_depression),leaf(angle));b.assert_solid(solid);return solid
