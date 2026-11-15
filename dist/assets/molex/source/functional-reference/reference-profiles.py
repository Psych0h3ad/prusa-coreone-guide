"""Original independent analytic terminal profiles. Code MIT; geometry CC-BY-SA4.0.
Original barrel, web and hollow-contact sketch helpers. No supplier input.
"""
from pathlib import Path
import math,json,hashlib,collections
import numpy as np
from OCP.gp import gp_Pnt,gp_Vec
from OCP.GC import GC_MakeArcOfCircle
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeWire,BRepBuilderAPI_MakeEdge,BRepBuilderAPI_MakeFace,BRepBuilderAPI_MakePolygon
from OCP.BRepPrimAPI import BRepPrimAPI_MakePrism
from OCP.BRepAlgoAPI import BRepAlgoAPI_Fuse,BRepAlgoAPI_Cut
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRep import BRep_Tool,BRep_Builder
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.BRepTools import BRepTools
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.TopAbs import TopAbs_FACE,TopAbs_SOLID,TopAbs_REVERSED
from OCP.TopExp import TopExp_Explorer
from OCP.TopoDS import TopoDS,TopoDS_Shape
from OCP.TopLoc import TopLoc_Location
H=Path(__file__).resolve().parent;P=json.loads((H/'terminal-parameters.json').read_bytes());A=P['authoredEstimates']

def arc(a,m,b):return BRepBuilderAPI_MakeEdge(GC_MakeArcOfCircle(a,m,b).Value()).Edge()

def line(a,b):return BRepBuilderAPI_MakeEdge(a,b).Edge()

def point(r,angle,y):return gp_Pnt(r*math.sin(angle),y,A['wireCenterZ']+r*math.cos(angle))

def web():
    t=A['sheetThickness'];cz=A['wireCenterZ'];z0=cz-A['insulationRadius']-t;z1=cz-A['conductorRadius']-t;z2=cz-A['bladeHeightZ']/2
    stations=[(0,z0),(A['insulationBarrelLength'],z0),(A['conductorBarrelStart'],z1),(A['conductorBarrelStart']+A['conductorBarrelLength'],z1),(P['sourceFacts']['overallLength']-P['sourceFacts']['frontContactLength'],z2)]
    w=BRepBuilderAPI_MakePolygon();x=-A['bridgeWidth']/2
    for y,z in stations+[(y,z+t)for y,z in reversed(stations)]:w.Add(gp_Pnt(x,y,z))
    w.Close();return BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(A['bridgeWidth'],0,0)).Shape()

def rectangle_wire(x0,x1,z0,z1,r,y):
    q=math.sqrt(.5);coords=[(x0+r,z0),(x1-r,z0),(x1,z0+r),(x1,z1-r),(x1-r,z1),(x0+r,z1),(x0,z1-r),(x0,z0+r)]
    mids={1:(x1-r+r*q,z0+r-r*q),3:(x1-r+r*q,z1-r+r*q),5:(x0+r-r*q,z1-r+r*q),7:(x0+r-r*q,z0+r-r*q)};w=BRepBuilderAPI_MakeWire()
    for i,(x,z)in enumerate(coords):
        a=gp_Pnt(x,y,z);b=gp_Pnt(coords[(i+1)%8][0],y,coords[(i+1)%8][1]);w.Add(arc(a,gp_Pnt(mids[i][0],y,mids[i][1]),b)if i in mids else line(a,b))
    return w.Wire()

def blade():
    x0=-A['bladeWidthX']/2;x1=-x0;z0=A['wireCenterZ']-A['bladeHeightZ']/2;z1=z0+A['bladeHeightZ'];r=A['bladeCornerRadius'];y=P['sourceFacts']['overallLength']-P['sourceFacts']['frontContactLength'];t=A['bladeWallThickness']
    outer=rectangle_wire(x0,x1,z0,z1,r,y);s=BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(outer).Face(),gp_Vec(0,P['sourceFacts']['frontContactLength'],0)).Shape()
    inner=rectangle_wire(x0+t,x1-t,z0+t,z1-t,.015,y-.05);tool=BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(inner).Face(),gp_Vec(0,P['sourceFacts']['frontContactLength']+.1,0)).Shape();op=BRepAlgoAPI_Cut(s,tool);op.Build();assert op.IsDone();s=op.Shape()
    # Original lance sketch: integral lower spring tab, not an added solid plug.
    # Diagram-grounded topology; its dimensions and formed state are estimates.
    w=BRepBuilderAPI_MakePolygon()
    for yy,zz in [(3.35,.53),(3.45,.53),(4.4,.84),(4.4,.98),(4.3,.94),(3.45,.68)]:w.Add(gp_Pnt(-.325,yy,zz))
    w.Close();lance=BRepPrimAPI_MakePrism(BRepBuilderAPI_MakeFace(w.Wire()).Face(),gp_Vec(.65,0,0)).Shape();op=BRepAlgoAPI_Fuse(s,lance);op.Build();assert op.IsDone();return op.Shape()

def stats(s):
    assert BRepCheck_Analyzer(s).IsValid()
    n=0;e=TopExp_Explorer(s,TopAbs_SOLID)
    while e.More():n+=1;e.Next()
    p=GProp_GProps();BRepGProp.VolumeProperties_s(s,p);b=Bnd_Box();BRepBndLib.AddOptimal_s(s,b,False,False)
    types=collections.Counter();e=TopExp_Explorer(s,TopAbs_FACE)
    while e.More():types[str(BRepAdaptor_Surface(TopoDS.Face_s(e.Current())).GetType()).split('.')[-1]]+=1;e.Next()
    return {'valid':True,'solids':n,'volumeMM3':p.Mass(),'boundsMM':list(b.Get()),'faces':sum(types.values()),'surfaceTypes':dict(types)}
