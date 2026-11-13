"""Authored parametric instructional housings; no source CAD is read by this builder.

Coordinates: millimetres; X circuit row, Y insertion axis, Z height.
Published nominal dimensions are distinguished from inferred visual features.
"""
import json, math, sys
from pathlib import Path
import numpy as np
from OCP.gp import gp_Pnt, gp_Vec
from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakePrism
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakePolygon, BRepBuilderAPI_MakeFace, BRepBuilderAPI_MakeWire, BRepBuilderAPI_MakeEdge
from OCP.GC import GC_MakeArcOfCircle
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse, BRepAlgoAPI_Cut
from OCP.BRepFilletAPI import BRepFilletAPI_MakeFillet
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepOffsetAPI import BRepOffsetAPI_ThruSections
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRep import BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_FACE, TopAbs_EDGE, TopAbs_SOLID, TopAbs_REVERSED
from OCP.TopoDS import TopoDS
from OCP.TopLoc import TopLoc_Location
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib

HERE=Path(__file__).resolve().parent
# Pure geometry module: no filesystem side effects.
MOVING={}

def box(x,y,z,dx,dy,dz):
    return BRepPrimAPI_MakeBox(gp_Pnt(x,y,z),dx,dy,dz).Shape()

def yz(profile,x,width):
    w=BRepBuilderAPI_MakePolygon()
    for y,z in profile:w.Add(gp_Pnt(x,y,z))
    w.Close()
    return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(width,0,0)).Shape()

def curved_yz(profile,x,width,arc_segment,arc_mid=None):
    w=BRepBuilderAPI_MakeWire()
    arcs=arc_segment if isinstance(arc_segment,dict) else {arc_segment:arc_mid}
    for i,a in enumerate(profile):
        b=profile[(i+1)%len(profile)];p=gp_Pnt(x,*a);q=gp_Pnt(x,*b)
        edge=BRepBuilderAPI_MakeEdge(GC_MakeArcOfCircle(p,gp_Pnt(x,*arcs[i]),q).Value()).Edge() if i in arcs else BRepBuilderAPI_MakeEdge(p,q).Edge()
        w.Add(edge)
    return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(width,0,0)).Shape()

def rounded_wire(x,y,z,width,height,r):
    # Eight explicit analytic lines/arcs; no tessellation or imported edge data.
    points=[(x+r,z),(x+width-r,z),(x+width,z+r),(x+width,z+height-r),
            (x+width-r,z+height),(x+r,z+height),(x,z+height-r),(x,z+r)]
    mids={1:(x+width-r+r/math.sqrt(2),z+r-r/math.sqrt(2)),
          3:(x+width-r+r/math.sqrt(2),z+height-r+r/math.sqrt(2)),
          5:(x+r-r/math.sqrt(2),z+height-r+r/math.sqrt(2)),
          7:(x+r-r/math.sqrt(2),z+r-r/math.sqrt(2))}
    wire=BRepBuilderAPI_MakeWire()
    for i,a in enumerate(points):
        b=points[(i+1)%8];p=gp_Pnt(a[0],y,a[1]);q=gp_Pnt(b[0],y,b[1])
        edge=BRepBuilderAPI_MakeEdge(GC_MakeArcOfCircle(p,gp_Pnt(mids[i][0],y,mids[i][1]),q).Value()).Edge() if i in mids else BRepBuilderAPI_MakeEdge(p,q).Edge()
        wire.Add(edge)
    return wire.Wire()

def entry_pocket(x):
    loft=BRepOffsetAPI_ThruSections(True,True,1e-7)
    for y,z,height in [(-.1,.22,2.32),(0,.22,2.32),(.49,.47,1.82)]:
        loft.AddWire(rounded_wire(x-.635,y,z,1.27,height,.2))
    loft.Build();assert loft.IsDone()
    return loft.Shape()

def round_end(shape,x,radius):
    f=BRepFilletAPI_MakeFillet(shape);e=TopExp_Explorer(shape,TopAbs_EDGE)
    while e.More():
        edge=TopoDS.Edge_s(e.Current());b=Bnd_Box();BRepBndLib.AddOptimal_s(edge,b,False,False)
        lo=b.Get()
        if abs(lo[0]-x)<1e-6 and abs(lo[3]-x)<1e-6:f.Add(radius,edge)
        e.Next()
    f.Build()
    if not f.IsDone():raise RuntimeError('Outer shoulder blend failed')
    return f.Shape()

def rounded(shape,radius):
    f=BRepFilletAPI_MakeFillet(shape);e=TopExp_Explorer(shape,TopAbs_EDGE)
    while e.More():f.Add(radius,TopoDS.Edge_s(e.Current()));e.Next()
    f.Build()
    if not f.IsDone():raise RuntimeError('Cannot round authored primitive')
    return f.Shape()

def entry_flange(width):
    shape=box(-width/2,0,0,width,2.3,3.6)
    f=BRepFilletAPI_MakeFillet(shape);e=TopExp_Explorer(shape,TopAbs_EDGE)
    while e.More():
        edge=TopoDS.Edge_s(e.Current());b=Bnd_Box();BRepBndLib.AddOptimal_s(edge,b,False,False);v=b.Get()
        if abs(v[0]-v[3])<1e-7 and (v[4]-v[1]>1 or v[1]<1e-7):f.Add(.6,edge)
        e.Next()
    f.Build()
    if not f.IsDone():raise RuntimeError('Entry flange blends failed')
    return f.Shape()

def boolean(op,a,b):
    f=op(a,b);f.Build()
    if not f.IsDone():raise RuntimeError('Authored feature failed')
    return f.Shape()

def fuse(a,b):return boolean(BRepAlgoAPI_Fuse,a,b)
def cut(a,b):return boolean(BRepAlgoAPI_Cut,a,b)

from OCP.Geom import Geom_BezierCurve
from OCP.TColgp import TColgp_Array1OfPnt
def elastic_beam(width):
    points=[(1.75,4.7779),(3.75,4.35),(6.2,4.35),(8.5,3.5),(8.5,4.18),(7.5,5.18),(6.15,5.18),(6.1067,5.23),(3.2,5.23),(3.2,5.08),(1.75,4.98)]
    wire=BRepBuilderAPI_MakeWire();x=-width/2
    for i,a in enumerate(points):
        b=points[(i+1)%len(points)];p=gp_Pnt(x,*a);q=gp_Pnt(x,*b)
        if i==2:
            last=p
            for j in range(1,9):
                t=j/8;r=1-t*t*(3-2*t);end=gp_Pnt(x,6.2+2.3*t,3.5+.85*r)
                wire.Add(BRepBuilderAPI_MakeEdge(last,end).Edge());last=end
            continue
        elif i==4:edge=BRepBuilderAPI_MakeEdge(GC_MakeArcOfCircle(p,gp_Pnt(x,8.20710678,4.88710678),q).Value()).Edge()
        else:edge=BRepBuilderAPI_MakeEdge(p,q).Edge()
        wire.Add(edge)
    return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(wire.Wire()).Face(),gp_Vec(width,0,0)).Shape()

def housing(pins):
    width=pins*1.5+4.3; nose=pins*1.5+1.25
    large=pins>=3; spring_width=2.9 if pins==4 else 2.25
    paddle_width={2:1.15,3:2.25,4:2.9}[pins]
    shoulder_inner={2:.775,3:1.325,4:1.65}[pins]
    # Nominal analytic blends on the entry shoulders. The front radius and
    # the steep wall intersect; forcing them into one fitted arc changes the
    # outside envelope. The upper tangent belongs to a separate 1 mm radius.
    cy,cz=1.84769340073726,5.1
    tangent=(cy-math.cos(math.pi/8),cz+math.sin(math.pi/8))
    slope=1+math.sqrt(2);intercept=tangent[1]-slope*tangent[0]
    qa=1+slope*slope;qb=-1.2+2*slope*(intercept-3.6);qc=(intercept-3.6)**2
    cross_y=(-qb+math.sqrt(qb*qb-4*qa*qc))/(2*qa);cross=(cross_y,slope*cross_y+intercept)
    angle=math.atan2(cross[1]-3.6,cross[0]-.6)
    low_mid=(.6+.6*math.cos((math.pi+angle)/2),3.6+.6*math.sin((math.pi+angle)/2))
    top_mid=(cy+math.cos(11*math.pi/16),cz+math.sin(11*math.pi/16))
    # Entry flange and narrower insertion body. Small blend radii are visual
    # estimates, not manufacturing or fit specifications.
    s=entry_flange(width)
    entry_channel={2:1.525,3:2.075,4:2.5}[pins]
    s=fuse(s,yz([(2.10,.16),(2.94,.65),(8.6,.65),(8.6,3.5),(2.10,3.5)],-nose/2,nose))
    # Upper side walls and entry shoulders leave the real open spring space.
    for side in [-1,1]:
        thickness={2:.6,3:.8,4:.9}[pins]
        x=side*(nose/2-thickness/2)-thickness/2
        rail_top=5.08 if large else 5.3
        rail=curved_yz([(3.1,3.5),(3.1,rail_top),(7.3,rail_top),(8.3,rail_top-1),(8.3,3.5)],x,thickness,2,(8.00710678,rail_top-.29289322))
        s=fuse(s,rail)
        rear_x=entry_channel if side>0 else -nose/2
        s=fuse(s,curved_yz([(0,2.95),(0,3.6),(.6,4.2),(1.95,4.2),(1.95,rail_top),(3.1,rail_top),(3.1,2.95)],rear_x,nose/2-entry_channel,1,(.6-.6/math.sqrt(2),3.6+.6/math.sqrt(2))))
        xa=shoulder_inner if side>0 else -width/2
        shoulder=curved_yz([(.0,.6),(.0,3.6),cross,tangent,(cy,6.1),(3.1,6.1),
                      (3.1,1.69),(2.3,1.69),(2.3,.6)],xa,width/2-shoulder_inner,{1:low_mid,3:top_mid})
        shoulder=round_end(shoulder,side*width/2,.30)
        # Relief leaves a continuous outer side wall. It is not an open arch.
        px=shoulder_inner if side>0 else -width/2+.6
        pocket=box(px,-.1,4.2,width/2-shoulder_inner-.6,2.05,2.05)
        shoulder=cut(shoulder,pocket)
        s=fuse(s,shoulder)
    s=cut(s,yz([(-.1,2.95),(1.9,2.95),(2.45,3.5),(2.45,4.5),(-.1,4.5)],-entry_channel,2*entry_channel))
    s=cut(s,box(-entry_channel,1.9,3.5,2*entry_channel,1.2,2.1))
    rib_width={2:.5,3:.7,4:.8}[pins]
    rcy,rcz=2.15321211119293,5.02
    rib_end=(1.95,rcz+math.sqrt(1-(1.95-rcy)**2))
    ra=math.atan2(5.7-rcz,1.42-rcy);rb=math.atan2(rib_end[1]-rcz,rib_end[0]-rcy)
    rib_mid=(rcy+math.cos((ra+rb)/2),rcz+math.sin((ra+rb)/2))
    for side in [-1,1]:
        start=entry_channel+.2 if side>0 else -entry_channel-.2-rib_width
        s=fuse(s,curved_yz([(.8,4.2),(.95,4.53),(.95,4.6),(1.42,5.63),(1.42,5.7),rib_end,(1.95,4.2)],start,rib_width,4,rib_mid))
    # The flexible central tongue has an elevated root at the nose. Its root
    # remains joined to the body; there are clear slots on both sides.
    # Explicit functional beam-underleaf gap; hidden geometry is inferred.
    # Exterior lock/bar/guard profiles and wire entries retain the authored base.
    s=cut(s,box(-paddle_width/2-.03,.18,2.25,paddle_width+.06,3.57,4.0))
    s=cut(s,box(-spring_width/2-.03,1.75,3.5,spring_width+.06,6.75,1.76))
    spring=elastic_beam(spring_width)
    s=fuse(s,spring)
    paddle=curved_yz([(.2,2.95),(.2,5.8),(.5,6.1),(3.0,6.1),(3.15,5.23),(3.75,5.23),
                (3.75,2.95)],-paddle_width/2,paddle_width,1,(.287867966,6.012132034))
    s=fuse(s,paddle);moving=fuse(spring,paddle)
    if large:
        for side in [-1,1]:
            start=paddle_width/2 if side>0 else -paddle_width/2-.55
            extension=yz([(1.75,4.7779),(3.0,4.5105),(3.0,5.08),(1.75,4.98)],start,.55);s=fuse(s,extension);moving=fuse(moving,extension)
    hook_width=1.55 if pins==2 else spring_width
    hook=yz([(5.05,5.23),(5.4,5.62),(5.9,5.55),(6.15,5.18)],-hook_width/2,hook_width);s=fuse(s,hook);moving=fuse(moving,hook)
    if pins==2:
        tool=box(-.575,.95,5.9,1.15,.6,.3);s=cut(s,tool);moving=cut(moving,tool)
    # Each conductor has its own wire mouth and terminal chamber. The retained
    # row datum is Z=1.25 and pitches are exactly 1.5 mm.
    for i in range(pins):
        x=(i-(pins-1)/2)*1.5
        mouth=entry_pocket(x)
        s=cut(s,mouth)
        s=cut(s,box(x-.3375,4.8,.64,.675,2.85,.56))
    # Contact mouths communicate with one broad front recess. They do not
    # have invented long partitions dividing the insertion nose.
    chamber_width=pins*1.5-.23
    s=cut(s,box(-chamber_width/2,4.56,1.75,chamber_width,4.20,1.35))
    s=cut(s,box(-chamber_width/2,7.65,.64,chamber_width,1.11,1.26))
    for i in range(pins-1):
        x=(i-(pins-2)/2)*1.5
        s=fuse(s,box(x-.215,4.56,2.8,.43,3.54,.31))
        s=fuse(s,yz([(8.1,2.8),(8.6,3.1),(8.1,3.1)],x-.215,.43))
    # Receiving upper contact noses need space below the broad chamber floor.
    # Original two opposed metal branches and their0.25mm sheet remain intact.
    for i in range(pins):
        x=(i-(pins-1)/2)*1.5
        s=cut(s,box(x-.175,4.8,1.65,.35,3.3,.25))
    s=s.clean() if hasattr(s,'clean') else s
    assert BRepCheck_Analyzer(s).IsValid(),'Invalid BREP'
    e=TopExp_Explorer(s,TopAbs_SOLID); count=0
    while e.More():count+=1;e.Next()
    assert count==1,('Disconnected feature',pins,count)
    MOVING[pins]=moving
    return s

def triangles(shape):
    BRepMesh_IncrementalMesh(shape,.018,False,.10,False)
    ps=[]; ns=[]; kinds={};e=TopExp_Explorer(shape,TopAbs_FACE)
    while e.More():
        face=TopoDS.Face_s(e.Current());location=TopLoc_Location()
        tri=BRep_Tool.Triangulation_s(face,location); surface=BRepAdaptor_Surface(face)
        key=str(surface.GetType()).split('.')[-1];kinds[key]=kinds.get(key,0)+1
        if tri is not None:
            reverse=face.Orientation()==TopAbs_REVERSED
            for k in range(1,tri.NbTriangles()+1):
                ids=list(tri.Triangle(k).Get())
                if reverse:ids[1],ids[2]=ids[2],ids[1]
                pp=[tri.Node(j).Transformed(location.Transformation()) for j in ids]
                facet=gp_Vec(pp[0],pp[1]).Crossed(gp_Vec(pp[0],pp[2]))
                if facet.Magnitude()<=1e-12:continue
                for j in ids:
                    p=tri.Node(j).Transformed(location.Transformation())
                    uv=tri.UVNode(j);v=gp_Pnt();du=gp_Vec();dv=gp_Vec()
                    surface.D1(uv.X(),uv.Y(),v,du,dv);n=du.Crossed(dv)
                    if n.Magnitude()<=1e-12:
                        n=gp_Vec(*facet.Coord())
                    elif reverse:n.Reverse()
                    assert n.Magnitude()>1e-12;n.Normalize()
                    ps.extend(p.Coord()); ns.extend(n.Coord())
        e.Next()
    p=np.array(ps,dtype='<f4').reshape(-1,3);n=np.array(ns,dtype='<f4').reshape(-1,3)
    assert np.isfinite(p).all() and np.isfinite(n).all()
    return p,n,kinds
